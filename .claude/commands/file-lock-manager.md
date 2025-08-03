# File Lock Manager - Concurrent Access Control

Manages file locks to prevent conflicts when multiple agents run in parallel, ensuring data integrity and preventing race conditions.

## Core Concepts

### Lock Types

```typescript
enum LockType {
  READ = 'read',      // Multiple agents can read
  WRITE = 'write',    // Exclusive write access
  MODIFY = 'modify'   // Read then write (upgrade lock)
}

interface FileLock {
  id: string;           // Unique lock ID
  file: string;         // File path
  agent: string;        // Agent holding lock
  type: LockType;       // Lock type
  acquired: Date;       // When acquired
  expires: Date;        // Auto-release time
  priority: number;     // For queue ordering
  metadata?: {
    lines?: [number, number];  // Line range for partial locks
    operation?: string;        // What agent is doing
  };
}
```

### Lock Manager Implementation

```typescript
class FileLockManager {
  private locks: Map<string, FileLock[]> = new Map();
  private queue: Map<string, QueuedLock[]> = new Map();
  private lockHistory: LockEvent[] = [];
  
  async acquireLock(
    file: string, 
    agent: string, 
    type: LockType,
    options?: LockOptions
  ): Promise<FileLock | null> {
    // Check if lock can be acquired
    if (this.canAcquire(file, agent, type)) {
      const lock = this.createLock(file, agent, type, options);
      this.addLock(lock);
      return lock;
    }
    
    // Queue the request if can't acquire
    if (options?.queue) {
      return this.queueLock(file, agent, type, options);
    }
    
    return null;
  }
  
  private canAcquire(file: string, agent: string, type: LockType): boolean {
    const currentLocks = this.locks.get(file) || [];
    
    // No locks - can acquire
    if (currentLocks.length === 0) return true;
    
    // Same agent already has lock - can upgrade
    if (currentLocks.some(l => l.agent === agent)) return true;
    
    // Multiple reads allowed
    if (type === LockType.READ && 
        currentLocks.every(l => l.type === LockType.READ)) {
      return true;
    }
    
    // Otherwise, cannot acquire
    return false;
  }
  
  releaseLock(lockId: string): boolean {
    for (const [file, locks] of this.locks) {
      const index = locks.findIndex(l => l.id === lockId);
      if (index !== -1) {
        locks.splice(index, 1);
        if (locks.length === 0) {
          this.locks.delete(file);
        }
        
        // Process queue for this file
        this.processQueue(file);
        return true;
      }
    }
    return false;
  }
  
  private processQueue(file: string): void {
    const queue = this.queue.get(file);
    if (!queue || queue.length === 0) return;
    
    // Try to acquire locks for queued requests
    for (let i = queue.length - 1; i >= 0; i--) {
      const queued = queue[i];
      if (this.canAcquire(file, queued.agent, queued.type)) {
        const lock = this.createLock(file, queued.agent, queued.type);
        this.addLock(lock);
        queued.resolve(lock);
        queue.splice(i, 1);
      }
    }
    
    if (queue.length === 0) {
      this.queue.delete(file);
    }
  }
}
```

## Lock Strategies

### 1. Optimistic Locking
Allow operations to proceed, detect conflicts later:

```typescript
class OptimisticLockManager extends FileLockManager {
  async tryModify(file: string, agent: string, modifier: FileModifier): Promise<boolean> {
    // Read file with version
    const readLock = await this.acquireLock(file, agent, LockType.READ);
    const { content, version } = await readFile(file);
    this.releaseLock(readLock.id);
    
    // Modify content
    const newContent = await modifier(content);
    
    // Try to write with version check
    const writeLock = await this.acquireLock(file, agent, LockType.WRITE);
    const currentVersion = await getFileVersion(file);
    
    if (currentVersion === version) {
      await writeFile(file, newContent);
      this.releaseLock(writeLock.id);
      return true;
    } else {
      // Conflict - retry or merge
      this.releaseLock(writeLock.id);
      return false;
    }
  }
}
```

### 2. Pessimistic Locking
Block until lock acquired:

```typescript
class PessimisticLockManager extends FileLockManager {
  async withLock<T>(
    file: string, 
    agent: string, 
    type: LockType,
    operation: () => Promise<T>
  ): Promise<T> {
    const lock = await this.acquireLock(file, agent, type, { queue: true });
    
    try {
      return await operation();
    } finally {
      this.releaseLock(lock.id);
    }
  }
}
```

### 3. Hierarchical Locking
Lock directories to prevent child conflicts:

```typescript
class HierarchicalLockManager extends FileLockManager {
  async acquireHierarchicalLock(
    path: string,
    agent: string,
    type: LockType
  ): Promise<FileLock[]> {
    const locks: FileLock[] = [];
    
    // Lock from root to target
    const parts = path.split('/');
    let currentPath = '';
    
    for (const part of parts) {
      currentPath += '/' + part;
      const lock = await this.acquireLock(currentPath, agent, LockType.READ);
      locks.push(lock);
    }
    
    // Upgrade last lock to requested type
    const targetLock = locks[locks.length - 1];
    await this.upgradeLock(targetLock.id, type);
    
    return locks;
  }
}
```

## Deadlock Prevention

### Deadlock Detection

```typescript
class DeadlockDetector {
  private waitGraph: Map<string, string[]> = new Map();
  
  detectDeadlock(agent: string, waitingFor: string): boolean {
    // Build wait-for graph
    this.waitGraph.set(agent, [waitingFor]);
    
    // Check for cycles using DFS
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    return this.hasCycle(agent, visited, recursionStack);
  }
  
  private hasCycle(
    node: string, 
    visited: Set<string>, 
    stack: Set<string>
  ): boolean {
    visited.add(node);
    stack.add(node);
    
    const neighbors = this.waitGraph.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (this.hasCycle(neighbor, visited, stack)) {
          return true;
        }
      } else if (stack.has(neighbor)) {
        return true; // Cycle detected
      }
    }
    
    stack.delete(node);
    return false;
  }
}
```

### Deadlock Resolution

```typescript
interface DeadlockResolution {
  strategy: 'timeout' | 'priority' | 'rollback' | 'wait-die';
  apply(deadlock: Deadlock): void;
}

class TimeoutResolution implements DeadlockResolution {
  strategy = 'timeout' as const;
  
  apply(deadlock: Deadlock): void {
    // Release oldest lock
    const oldest = deadlock.locks.reduce((a, b) => 
      a.acquired < b.acquired ? a : b
    );
    
    console.log(`Breaking deadlock by timing out ${oldest.agent}`);
    lockManager.releaseLock(oldest.id);
  }
}
```

## Lock Visualization

### Current Lock Status

```markdown
## File Lock Status

### Active Locks
| File | Agent | Type | Duration | Queue |
|------|-------|------|----------|-------|
| Home.tsx | impl-1 | WRITE | 2m 15s | 2 waiting |
| api.ts | context-1 | READ | 45s | 0 waiting |
| api.ts | context-2 | READ | 30s | 0 waiting |
| instacart.ts | research-1 | READ | 1m 20s | 1 waiting |

### Lock Queue
| File | Waiting Agent | Type | Priority | Wait Time |
|------|--------------|------|----------|-----------|
| Home.tsx | bug-fix-1 | WRITE | HIGH | 1m 30s |
| Home.tsx | refactor-1 | MODIFY | LOW | 45s |
| instacart.ts | impl-2 | WRITE | MEDIUM | 20s |

### Deadlock Warnings
⚠️ Potential deadlock detected:
- Agent A waiting for Home.tsx (held by B)
- Agent B waiting for api.ts (held by A)
```

## Integration with Agents

### Agent Lock Acquisition

```typescript
// In agent implementation
async function agentExecute(task: Task) {
  const filesToModify = analyzeTask(task);
  const locks: FileLock[] = [];
  
  try {
    // Acquire all locks upfront (ordered to prevent deadlock)
    for (const file of filesToModify.sort()) {
      const lock = await lockManager.acquireLock(
        file,
        this.agentId,
        LockType.WRITE,
        { queue: true, timeout: 300000 } // 5 min timeout
      );
      locks.push(lock);
    }
    
    // Execute task with locks held
    await performTask(task);
    
  } finally {
    // Always release locks
    for (const lock of locks) {
      lockManager.releaseLock(lock.id);
    }
  }
}
```

### Lock-Aware File Operations

```typescript
class LockAwareFileSystem {
  async readFile(path: string, agent: string): Promise<string> {
    const lock = await lockManager.acquireLock(path, agent, LockType.READ);
    try {
      return await fs.readFile(path, 'utf-8');
    } finally {
      lockManager.releaseLock(lock.id);
    }
  }
  
  async writeFile(path: string, content: string, agent: string): Promise<void> {
    const lock = await lockManager.acquireLock(path, agent, LockType.WRITE);
    try {
      await fs.writeFile(path, content);
    } finally {
      lockManager.releaseLock(lock.id);
    }
  }
  
  async modifyFile(
    path: string, 
    agent: string,
    modifier: (content: string) => string
  ): Promise<void> {
    const lock = await lockManager.acquireLock(path, agent, LockType.MODIFY);
    try {
      const content = await fs.readFile(path, 'utf-8');
      const modified = modifier(content);
      await fs.writeFile(path, modified);
    } finally {
      lockManager.releaseLock(lock.id);
    }
  }
}
```

## Lock Policies

### 1. Fair Queuing
First-come, first-served:
```typescript
class FairQueuePolicy {
  order(queue: QueuedLock[]): QueuedLock[] {
    return queue.sort((a, b) => a.requested.getTime() - b.requested.getTime());
  }
}
```

### 2. Priority-Based
High-priority agents go first:
```typescript
class PriorityQueuePolicy {
  order(queue: QueuedLock[]): QueuedLock[] {
    return queue.sort((a, b) => b.priority - a.priority);
  }
}
```

### 3. Shortest-Job-First
Quick operations go first:
```typescript
class SJFQueuePolicy {
  order(queue: QueuedLock[]): QueuedLock[] {
    return queue.sort((a, b) => a.estimatedDuration - b.estimatedDuration);
  }
}
```

## Monitoring and Metrics

```typescript
interface LockMetrics {
  totalLocks: number;
  activeLocks: number;
  queuedRequests: number;
  averageWaitTime: number;
  deadlocksDetected: number;
  deadlocksResolved: number;
  lockConflicts: number;
  timeouts: number;
}

class LockMonitor {
  getMetrics(): LockMetrics {
    return {
      totalLocks: this.lockHistory.length,
      activeLocks: this.countActiveLocks(),
      queuedRequests: this.countQueuedRequests(),
      averageWaitTime: this.calculateAverageWait(),
      deadlocksDetected: this.deadlockCount,
      deadlocksResolved: this.resolvedCount,
      lockConflicts: this.conflictCount,
      timeouts: this.timeoutCount
    };
  }
  
  getHotspots(): FileHotspot[] {
    // Identify files with high contention
    return this.lockHistory
      .groupBy(lock => lock.file)
      .map(group => ({
        file: group.key,
        lockCount: group.length,
        conflicts: group.filter(l => l.queued).length,
        averageWait: average(group.map(l => l.waitTime))
      }))
      .sort((a, b) => b.conflicts - a.conflicts)
      .slice(0, 10);
  }
}
```

## Best Practices

1. **Always release locks** in finally blocks
2. **Acquire locks in consistent order** to prevent deadlocks
3. **Use appropriate lock types** (READ when possible)
4. **Set reasonable timeouts** to prevent indefinite waits
5. **Monitor lock metrics** to identify bottlenecks
6. **Consider lock granularity** (file vs. line-level)
7. **Implement retry logic** for transient conflicts

This file lock manager ensures safe parallel execution while maximizing concurrency!
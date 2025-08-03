# Parallel Orchestrator - Safe Parallel Execution Enhancement

Extends the /head orchestrator with parallel execution capabilities while maintaining system integrity and code quality.

Arguments: $ARGUMENTS

## Core Principle: Parallel Where Safe, Sequential Where Critical

This orchestrator enhancement enables parallel execution of independent operations while strictly maintaining sequential execution for dependent operations.

## Parallel Execution Framework

### 1. Dependency Analysis Phase

Before any parallel execution, analyze dependencies:

```markdown
## Dependency Graph for: $ARGUMENTS

### Independent Operations (Can Parallelize):
- Context reading from different files
- Research on different topics
- Tests in different suites
- Documentation updates to different files

### Dependent Operations (Must Serialize):
- Planning must complete before context
- Context must complete before implementation
- Each code block must verify before next
- Same file modifications must queue
```

### 2. Parallel Context Building

**CRITICAL: Only after /smart-planner completes!**

```javascript
// Sequential planning
const plan = await smartPlanner("$ARGUMENTS");

// Parallel context building based on plan
const contexts = await Promise.all([
  contextAgent("frontend", plan.frontendFiles),
  contextAgent("backend", plan.backendFiles),
  contextAgent("api", plan.apiFiles)
]);

// Merge contexts for implementation
const mergedContext = mergeContexts(contexts);
```

### 3. File Lock Management

Prevent conflicts during parallel execution:

```typescript
interface FileLock {
  file: string;
  agent: string;
  operation: 'read' | 'write';
  timestamp: Date;
}

class LockManager {
  private locks: Map<string, FileLock> = new Map();
  
  async acquireLock(file: string, agent: string, operation: 'read' | 'write'): Promise<boolean> {
    const existing = this.locks.get(file);
    
    // Multiple reads allowed
    if (operation === 'read' && existing?.operation === 'read') {
      return true;
    }
    
    // No lock or same agent
    if (!existing || existing.agent === agent) {
      this.locks.set(file, { file, agent, operation, timestamp: new Date() });
      return true;
    }
    
    // Lock conflict
    return false;
  }
  
  releaseLock(file: string, agent: string): void {
    const lock = this.locks.get(file);
    if (lock?.agent === agent) {
      this.locks.delete(file);
    }
  }
}
```

### 4. Parallel Execution Patterns

#### Pattern 1: Parallel Context Building
```markdown
/parallel-orchestrator "implement shopping list feature"
├─→ Planning Phase (Sequential)
│   └─→ /smart-planner identifies 3 areas
├─→ Context Phase (PARALLEL)
│   ├─→ Context Builder 1: Read Home.tsx
│   ├─→ Context Builder 2: Read api.ts
│   └─→ Context Builder 3: Read instacart.ts
├─→ Wait for all contexts
└─→ Implementation Phase (Sequential with plan)
```

#### Pattern 2: Parallel Feature Development
```markdown
/parallel-orchestrator "add auth to frontend and backend"
├─→ Planning identifies independent work
├─→ PARALLEL EXECUTION:
│   ├─→ Frontend Agent:
│   │   ├─→ Build UI context
│   │   ├─→ Implement login form
│   │   └─→ Test UI components
│   └─→ Backend Agent:
│       ├─→ Build API context
│       ├─→ Implement auth endpoints
│       └─→ Test API routes
├─→ Integration Phase (Sequential)
└─→ End-to-end testing
```

#### Pattern 3: Parallel Testing
```markdown
Implementation complete →
├─→ PARALLEL TEST EXECUTION:
│   ├─→ Unit Tests (Jest)
│   ├─→ Integration Tests (API)
│   ├─→ Linting (ESLint)
│   └─→ Type Checking (TSC)
├─→ Wait for all results
└─→ Proceed only if ALL pass
```

### 5. Status Tracking for Parallel Operations

Enhanced status format:

```json
{
  "parallelBatch": {
    "id": "batch-123",
    "type": "context-building",
    "status": "running",
    "agents": [
      {
        "name": "context-frontend",
        "status": "completed",
        "duration": 800,
        "files": ["Home.tsx", "App.tsx"]
      },
      {
        "name": "context-backend",
        "status": "running",
        "progress": 60,
        "files": ["routes.ts", "instacart.ts"]
      }
    ],
    "startTime": "2025-01-15T10:00:00Z",
    "dependencies": {
      "waitingFor": ["smart-planner"],
      "blockedBy": []
    }
  },
  "fileLocks": [
    {
      "file": "Home.tsx",
      "agent": "implementation-frontend",
      "operation": "write",
      "acquired": "2025-01-15T10:02:00Z"
    }
  ]
}
```

### 6. Conflict Resolution

When parallel agents conflict:

```markdown
## Conflict Detected
- Agent A wants to modify: Home.tsx
- Agent B already modifying: Home.tsx

## Resolution Strategy:
1. If changes are in different sections → Auto-merge
2. If changes overlap → Queue Agent A
3. If critical conflict → Alert user

## Queue Status:
- Currently executing: Agent B
- Queued: Agent A (will execute after B completes)
```

### 7. Safe Parallelization Rules

#### ALWAYS SAFE to Parallelize:
1. **Reading different files**
   ```
   ├─→ Read file1.ts
   ├─→ Read file2.ts
   └─→ Read file3.ts
   ```

2. **Independent research**
   ```
   ├─→ Research OAuth
   ├─→ Research JWT
   └─→ Research Sessions
   ```

3. **Different test suites**
   ```
   ├─→ Frontend tests
   ├─→ Backend tests
   └─→ Integration tests
   ```

4. **Non-overlapping docs**
   ```
   ├─→ Update README.md
   ├─→ Update API.md
   └─→ Update CHANGELOG.md
   ```

#### NEVER Parallelize:
1. **Sequential dependencies**
   ```
   Plan → Context → Implementation → Test → Deploy
   ```

2. **Same file modifications**
   ```
   Agent A: Modify Home.tsx
   Agent B: Modify Home.tsx ❌ MUST QUEUE
   ```

3. **Code quality cycle**
   ```
   Write → Verify → Test → Next Block
   ```

### 8. Performance Monitoring

Track parallel execution efficiency:

```typescript
interface ParallelMetrics {
  totalTime: number;
  parallelTime: number;
  sequentialTime: number;
  efficiency: number; // parallelTime / totalTime
  conflicts: number;
  queued: number;
}

// Example output:
{
  totalTime: 1260, // 21 minutes
  parallelTime: 480, // 8 minutes saved
  sequentialTime: 780, // 13 minutes sequential
  efficiency: 0.38, // 38% parallel
  conflicts: 2,
  queued: 1
}
```

### 9. Integration with Existing Agents

Modify agent calls for parallel support:

```markdown
## Sequential (Current):
/smart-context-builder
/analyze-nutrima  
/understand-feature

## Parallel (Enhanced):
/parallel-orchestrator context [
  /smart-context-builder,
  /analyze-nutrima,
  /understand-feature
]
```

### 10. Error Handling in Parallel

If any parallel operation fails:

```markdown
## Parallel Batch Failed
- Batch ID: batch-123
- Failed Agent: context-backend
- Error: API timeout
- Other Agents: Cancelled

## Recovery Options:
1. Retry failed agent only
2. Retry entire batch
3. Continue with partial context
4. Abort operation

## Recommendation: Retry failed agent with increased timeout
```

## Usage Examples

### Example 1: Parallel Context for Feature
```
/parallel-orchestrator "add user preferences to settings"

Executes:
1. Planning (sequential) - 2 min
2. Context (parallel) - 1 min instead of 3 min
3. Implementation (sequential) - 10 min
4. Tests (parallel) - 2 min instead of 5 min
Total: 15 min (vs 20 min sequential)
```

### Example 2: Parallel Research
```
/parallel-orchestrator research "caching strategies"

Executes:
1. Planning identifies 3 strategies
2. Parallel research:
   - Redis (Agent 1)
   - Memcached (Agent 2)  
   - CDN (Agent 3)
3. Combine findings
4. Present comparison
Total: 5 min (vs 12 min sequential)
```

## Remember

The key to successful parallel execution:
1. **Plan thoroughly** - Identify all dependencies
2. **Lock resources** - Prevent conflicts
3. **Track status** - Know what's running
4. **Handle failures** - Graceful degradation
5. **Maintain quality** - Never compromise code standards

This parallel orchestrator achieves 25-40% speed improvement while maintaining system integrity!
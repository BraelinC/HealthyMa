# Agent Dependencies - Dependency Tracking and Management System

Defines dependencies between agents to enable safe parallel execution while preventing race conditions and conflicts.

## Dependency Graph Structure

### Agent Dependency Declaration

Each agent declares its dependencies and capabilities:

```typescript
interface AgentDependency {
  agent: string;
  inputs: {
    files: string[];      // Files it reads
    context: string[];    // Context it needs
    agents: string[];     // Other agents it depends on
  };
  outputs: {
    files: string[];      // Files it modifies
    context: string[];    // Context it provides
    artifacts: string[];  // What it produces
  };
  constraints: {
    sequential: boolean;  // Must run alone
    exclusive: string[];  // Cannot run with these agents
    timeout: number;      // Max execution time (ms)
  };
}
```

## Agent Dependency Definitions

### Context Building Agents

```typescript
const contextDependencies: AgentDependency[] = [
  {
    agent: "/smart-context-builder",
    inputs: {
      files: ["**/*.ts", "**/*.tsx", "**/*.md"],
      context: ["project-structure"],
      agents: ["/smart-planner"] // Must run after planner
    },
    outputs: {
      files: [],
      context: ["deep-context", "file-understanding"],
      artifacts: ["context-checkpoint"]
    },
    constraints: {
      sequential: false, // Can run in parallel
      exclusive: [],
      timeout: 120000 // 2 minutes
    }
  },
  
  {
    agent: "/analyze-nutrima",
    inputs: {
      files: ["client/src/**", "server/**"],
      context: ["project-overview"],
      agents: []
    },
    outputs: {
      files: [],
      context: ["nutrima-analysis"],
      artifacts: ["analysis-report"]
    },
    constraints: {
      sequential: false,
      exclusive: [],
      timeout: 60000
    }
  },
  
  {
    agent: "/understand-feature",
    inputs: {
      files: [], // Determined by feature
      context: ["feature-request"],
      agents: ["/smart-planner"]
    },
    outputs: {
      files: [],
      context: ["feature-understanding"],
      artifacts: ["feature-analysis"]
    },
    constraints: {
      sequential: false,
      exclusive: [],
      timeout: 90000
    }
  }
];
```

### Planning Agents

```typescript
const planningDependencies: AgentDependency[] = [
  {
    agent: "/smart-planner",
    inputs: {
      files: [],
      context: ["user-request"],
      agents: [] // No dependencies - runs first
    },
    outputs: {
      files: [],
      context: ["execution-plan", "file-targets"],
      artifacts: ["smart-plan"]
    },
    constraints: {
      sequential: true, // MUST run alone first
      exclusive: ["ALL"], // Nothing runs with planner
      timeout: 120000
    }
  },
  
  {
    agent: "/head",
    inputs: {
      files: [],
      context: ["user-request"],
      agents: []
    },
    outputs: {
      files: [],
      context: ["orchestration"],
      artifacts: ["workflow-selection"]
    },
    constraints: {
      sequential: true,
      exclusive: ["ALL"],
      timeout: 30000
    }
  }
];
```

### Implementation Agents

```typescript
const implementationDependencies: AgentDependency[] = [
  {
    agent: "/implementation-workflow",
    inputs: {
      files: [], // Determined by task
      context: ["deep-context", "execution-plan"],
      agents: ["/smart-context-builder", "/smart-planner"]
    },
    outputs: {
      files: ["*.ts", "*.tsx"], // Modified files
      context: ["implementation-complete"],
      artifacts: ["code-changes", "tests"]
    },
    constraints: {
      sequential: true, // Code changes must be sequential
      exclusive: ["/bug-fix-workflow", "/refactoring-workflow"],
      timeout: 1800000 // 30 minutes
    }
  },
  
  {
    agent: "/bug-fix-workflow",
    inputs: {
      files: [],
      context: ["bug-report", "deep-context"],
      agents: ["/smart-context-builder"]
    },
    outputs: {
      files: ["*.ts", "*.tsx"],
      context: ["bug-fixed"],
      artifacts: ["fix", "regression-tests"]
    },
    constraints: {
      sequential: true,
      exclusive: ["/implementation-workflow", "/refactoring-workflow"],
      timeout: 1200000 // 20 minutes
    }
  }
];
```

### Documentation Agents

```typescript
const documentationDependencies: AgentDependency[] = [
  {
    agent: "/update-context",
    inputs: {
      files: ["CLAUDE.md", "CHANGELOG.md"],
      context: ["changes-made"],
      agents: [] // Can run independently
    },
    outputs: {
      files: ["CLAUDE.md", "CHANGELOG.md", "*.md"],
      context: ["docs-updated"],
      artifacts: ["updated-docs"]
    },
    constraints: {
      sequential: false, // Can parallelize
      exclusive: [], // Unless same file
      timeout: 300000 // 5 minutes
    }
  }
];
```

### Research Agents

```typescript
const researchDependencies: AgentDependency[] = [
  {
    agent: "/research-workflow",
    inputs: {
      files: [],
      context: ["research-question"],
      agents: ["/smart-planner"]
    },
    outputs: {
      files: [],
      context: ["research-findings"],
      artifacts: ["research-report", "recommendations"]
    },
    constraints: {
      sequential: false, // Can run multiple researches
      exclusive: [],
      timeout: 600000 // 10 minutes
    }
  }
];
```

## Dependency Resolution Algorithm

### 1. Build Dependency Graph

```typescript
class DependencyGraph {
  private dependencies: Map<string, AgentDependency> = new Map();
  private running: Set<string> = new Set();
  private completed: Set<string> = new Set();
  private fileLocks: Map<string, string> = new Map();
  
  canRunAgent(agentName: string): boolean {
    const agent = this.dependencies.get(agentName);
    if (!agent) return false;
    
    // Check if dependencies are satisfied
    const depsReady = agent.inputs.agents.every(dep => 
      this.completed.has(dep)
    );
    
    if (!depsReady) return false;
    
    // Check if sequential and something is running
    if (agent.constraints.sequential && this.running.size > 0) {
      return false;
    }
    
    // Check exclusive constraints
    for (const running of this.running) {
      const runningAgent = this.dependencies.get(running);
      if (runningAgent?.constraints.exclusive.includes(agentName) ||
          runningAgent?.constraints.exclusive.includes("ALL") ||
          agent.constraints.exclusive.includes(running) ||
          agent.constraints.exclusive.includes("ALL")) {
        return false;
      }
    }
    
    // Check file locks
    for (const file of agent.outputs.files) {
      if (this.fileLocks.has(file)) {
        return false; // File is locked
      }
    }
    
    return true;
  }
  
  startAgent(agentName: string): void {
    const agent = this.dependencies.get(agentName);
    if (!agent) return;
    
    this.running.add(agentName);
    
    // Lock output files
    for (const file of agent.outputs.files) {
      this.fileLocks.set(file, agentName);
    }
  }
  
  completeAgent(agentName: string): void {
    const agent = this.dependencies.get(agentName);
    if (!agent) return;
    
    this.running.delete(agentName);
    this.completed.add(agentName);
    
    // Release file locks
    for (const file of agent.outputs.files) {
      if (this.fileLocks.get(file) === agentName) {
        this.fileLocks.delete(file);
      }
    }
  }
}
```

### 2. Parallel Execution Scheduler

```typescript
class ParallelScheduler {
  private graph: DependencyGraph;
  private queue: string[] = [];
  
  async executeWorkflow(agents: string[]): Promise<void> {
    this.queue = [...agents];
    const executing: Promise<void>[] = [];
    
    while (this.queue.length > 0 || executing.length > 0) {
      // Try to start new agents
      const toStart = this.queue.filter(agent => 
        this.graph.canRunAgent(agent)
      );
      
      for (const agent of toStart) {
        this.queue = this.queue.filter(a => a !== agent);
        this.graph.startAgent(agent);
        
        const execution = this.executeAgent(agent).then(() => {
          this.graph.completeAgent(agent);
        });
        
        executing.push(execution);
      }
      
      // Wait for at least one to complete
      if (executing.length > 0) {
        await Promise.race(executing);
        executing.splice(
          executing.findIndex(p => p === await Promise.race(executing)),
          1
        );
      } else if (this.queue.length > 0) {
        // Deadlock detection
        throw new Error("Dependency deadlock detected!");
      }
    }
  }
  
  private async executeAgent(agent: string): Promise<void> {
    // Execute the actual agent
    console.log(`Executing agent: ${agent}`);
    // Agent execution logic here
  }
}
```

## Dependency Patterns

### Pattern 1: Parallel Context Building
```
Dependencies:
/smart-planner → [/context-agent-1, /context-agent-2, /context-agent-3]

Execution:
1. /smart-planner (sequential)
2. All context agents (parallel)
3. Wait for all to complete
```

### Pattern 2: Feature Implementation
```
Dependencies:
/smart-planner → /smart-context-builder → /implementation-workflow → /update-context

Execution:
1. /smart-planner (sequential)
2. /smart-context-builder (can parallel with others)
3. /implementation-workflow (sequential)
4. /update-context (can parallel with tests)
```

### Pattern 3: Parallel Research
```
Dependencies:
/smart-planner → [/research-1, /research-2, /research-3] → /research-aggregator

Execution:
1. /smart-planner (sequential)
2. All research agents (parallel)
3. /research-aggregator (after all complete)
```

## Conflict Resolution

### File Conflict Resolution

```typescript
interface FileConflict {
  file: string;
  agents: string[];
  resolution: 'queue' | 'merge' | 'abort';
}

class ConflictResolver {
  resolveFileConflict(conflict: FileConflict): string {
    // If one is reading and one is writing - queue writer
    // If both writing different sections - attempt merge
    // If both writing same section - queue second
    // If critical conflict - abort and alert user
    
    const strategies = {
      'read-write': 'queue',
      'write-write-different': 'merge',
      'write-write-same': 'queue',
      'critical': 'abort'
    };
    
    return strategies[this.detectConflictType(conflict)];
  }
}
```

### Dependency Conflict Resolution

```typescript
interface DependencyConflict {
  agent: string;
  missingDependencies: string[];
  circularDependencies: string[];
}

class DependencyResolver {
  resolveDependencyConflict(conflict: DependencyConflict): void {
    if (conflict.circularDependencies.length > 0) {
      throw new Error(`Circular dependency detected: ${conflict.circularDependencies.join(' → ')}`);
    }
    
    if (conflict.missingDependencies.length > 0) {
      console.warn(`Missing dependencies for ${conflict.agent}: ${conflict.missingDependencies.join(', ')}`);
      // Queue agent until dependencies are satisfied
    }
  }
}
```

## Usage Examples

### Example 1: Check Dependencies
```
/agent-dependencies check "/implementation-workflow"

Output:
Agent: /implementation-workflow
Depends on: /smart-context-builder, /smart-planner
Modifies: *.ts, *.tsx
Constraints: Sequential execution required
Status: Ready to run (all dependencies satisfied)
```

### Example 2: Visualize Execution Plan
```
/agent-dependencies visualize "implement shopping list"

Output:
1. /smart-planner [Sequential]
   ↓
2. [Parallel Batch]
   ├─→ /smart-context-builder
   ├─→ /analyze-nutrima
   └─→ /understand-feature "shopping list"
   ↓
3. /implementation-workflow [Sequential]
   ↓
4. [Parallel Batch]
   ├─→ /update-context
   └─→ Test execution
```

### Example 3: Detect Conflicts
```
/agent-dependencies conflicts

Current Conflicts:
1. File conflict: Home.tsx
   - Agent A: /implementation-workflow (writing)
   - Agent B: /bug-fix-workflow (writing)
   - Resolution: Queue Agent B

2. Dependency not satisfied:
   - Agent: /update-context
   - Waiting for: /implementation-workflow
   - Status: Queued
```

## Best Practices

1. **Declare all dependencies upfront**
2. **Be specific about file modifications**
3. **Use wildcards carefully in file patterns**
4. **Set realistic timeouts**
5. **Handle failures gracefully**
6. **Monitor for deadlocks**
7. **Keep dependency graphs simple**

This dependency system ensures safe, efficient parallel execution while maintaining system integrity!
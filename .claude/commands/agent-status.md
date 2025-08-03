# Agent Status - Inter-Agent Communication

Provides status tracking and communication between agents during workflow execution.

## Status Management

### Current Workflow Status
Track the current state of multi-agent workflows:

```markdown
## Workflow Status
- **Current Agent**: [agent name]
- **Current Task**: [task description]
- **Progress**: [X/Y steps completed]
- **Context Depth**: [tokens used]
- **Status**: [running|completed|failed|blocked]
```

### Agent Handoff Protocol

When one agent completes and hands off to another:

```markdown
## Handoff from [Agent A] to [Agent B]

### Completed Work
- [What was accomplished]
- [Key findings or outputs]
- [Any issues encountered]

### Context Transfer
- **Key Information**: [Essential context to pass]
- **Files Modified**: [List of changed files]
- **Decisions Made**: [Important choices]
- **Open Questions**: [Unresolved items]

### Next Steps
- [What Agent B should do]
- [Priority items]
- [Constraints to consider]
```

## Communication Patterns

### 1. Status Broadcasting
Agents report their status for orchestrator monitoring:

```typescript
// Agent status structure
interface AgentStatus {
  agent: string;
  status: 'starting' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  message: string;
  context: {
    filesRead: string[];
    filesModified: string[];
    tokensUsed: number;
  };
}
```

### 2. Context Checkpointing
Save expensive context for reuse:

```markdown
## Context Checkpoint: [timestamp]
- **Agent**: [agent name]
- **Understanding Built**: [what was learned]
- **Tokens Used**: [amount]
- **Resume Point**: [where to continue]
```

### 3. Error Communication
When an agent encounters issues:

```markdown
## Agent Error Report
- **Agent**: [agent name]
- **Error Type**: [category]
- **Description**: [what went wrong]
- **Recovery Options**: 
  1. [Option 1]
  2. [Option 2]
- **Fallback**: [alternative approach]
```

## Workflow Coordination

### Sequential Execution
```
Agent A completes → Status update → Agent B starts
```

### Parallel Execution
```
           → Agent B (frontend work)
Agent A → |
           → Agent C (backend work)
```

### Conditional Routing
```
Agent A → Decision Point → Agent B (if condition met)
                        → Agent C (otherwise)
```

## Enhanced Parallel Execution Tracking

### Parallel Batch Status

Track multiple agents running simultaneously:

```typescript
interface ParallelBatch {
  id: string;
  type: 'context' | 'implementation' | 'testing' | 'research';
  agents: ParallelAgent[];
  status: 'preparing' | 'running' | 'merging' | 'completed' | 'failed';
  startTime: Date;
  estimatedCompletion: Date;
  dependencies: string[];
  conflicts: ConflictReport[];
}

interface ParallelAgent {
  name: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'blocked';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  output?: any;
  error?: string;
  blockedBy?: string[];
  files: {
    reading: string[];
    writing: string[];
    locked: string[];
  };
}
```

### Real-Time Parallel Status Display

```markdown
## Parallel Execution Status

### Batch: context-building-001
Type: Context Building
Status: Running (3/4 agents active)

| Agent | Status | Progress | Files | Duration | 
|-------|--------|----------|-------|----------|
| /smart-context-builder frontend | ✅ Complete | 100% | 1,245 read | 1m 23s |
| /smart-context-builder backend | 🔄 Running | 67% | 832 read | 1m 45s |
| /analyze-nutrima | 🔄 Running | 89% | 423 read | 1m 12s |
| /understand-feature | ⏳ Queued | 0% | - | - |

### File Lock Status
- 🔒 Home.tsx (locked by: implementation-agent)
- 📖 api.ts (3 readers)
- ⏳ instacart.ts (1 queued writer)

### Resource Usage
- Active Agents: 3/5 capacity
- Memory Used: 2.3GB
- Tokens Processed: 47,230
- Est. Completion: 2 minutes
```

### Parallel Execution Timeline

Visualize parallel execution flow:

```
Time →  0s      30s     60s     90s     120s    150s
Agent A: ████████████████░░░░░░░░░░░░░░░░░░
Agent B: ░░░░████████████████████░░░░░░░░░
Agent C: ░░░░░░░░████████████████████████░
Agent D: ░░░░░░░░░░░░░░░░████████████████

Legend: █ Running  ░ Waiting/Idle
```

### Conflict Tracking

Monitor and resolve conflicts in real-time:

```typescript
interface ConflictReport {
  type: 'file-lock' | 'dependency' | 'resource';
  agents: string[];
  resource: string;
  detected: Date;
  resolution: 'queued' | 'merged' | 'aborted' | 'pending';
  details: string;
}

// Example conflict display:
## Active Conflicts

1. File Lock Conflict
   - Resource: client/src/pages/Home.tsx
   - Agents: implementation-1, bug-fix-2
   - Resolution: bug-fix-2 queued (wait time: 45s)

2. Dependency Conflict  
   - Resource: Context from /smart-planner
   - Agents: context-builder-1, context-builder-2
   - Resolution: Waiting for planner completion
```

### Performance Metrics Dashboard

```markdown
## Parallel Execution Metrics

### Current Performance
- Parallel Efficiency: 78% (vs 100% sequential)
- Average Wait Time: 12s
- Conflicts/Hour: 3.2
- Successful Merges: 94%

### Execution Comparison
| Metric | Sequential | Parallel | Improvement |
|--------|------------|----------|-------------|
| Total Time | 28 min | 21 min | 25% faster |
| Context Build | 5 min | 2 min | 60% faster |
| Testing | 8 min | 3 min | 62% faster |
| CPU Usage | 25% | 85% | 3.4x |
| Token Efficiency | 100% | 94% | -6% overhead |

### Bottleneck Analysis
1. Home.tsx - High contention (5 lock requests/hour)
2. API endpoints - Sequential bottleneck
3. Test runner - Resource limited
```

### Agent Communication in Parallel

Enhanced communication for parallel agents:

```typescript
interface ParallelMessage {
  from: string;
  to: string | string[] | 'broadcast';
  type: 'status' | 'data' | 'conflict' | 'completion';
  priority: 'low' | 'normal' | 'high' | 'critical';
  timestamp: Date;
  content: {
    message: string;
    data?: any;
    action?: 'wait' | 'proceed' | 'abort' | 'merge';
  };
}

// Example messages:
{
  from: 'context-builder-1',
  to: 'broadcast',
  type: 'status',
  priority: 'normal',
  content: {
    message: 'Frontend context complete',
    data: { filesRead: 1245, tokens: 23400 }
  }
}

{
  from: 'file-lock-manager',
  to: 'implementation-1',
  type: 'conflict',
  priority: 'high',
  content: {
    message: 'File lock conflict on Home.tsx',
    action: 'wait',
    data: { queuePosition: 2, estimatedWait: 45 }
  }
}
```

### Parallel Batch Management

```typescript
class ParallelBatchManager {
  private batches: Map<string, ParallelBatch> = new Map();
  
  createBatch(agents: string[], type: string): ParallelBatch {
    const batch: ParallelBatch = {
      id: `batch-${Date.now()}`,
      type,
      agents: agents.map(a => ({ 
        name: a, 
        status: 'queued',
        progress: 0,
        files: { reading: [], writing: [], locked: [] }
      })),
      status: 'preparing',
      startTime: new Date(),
      estimatedCompletion: this.estimateCompletion(agents),
      dependencies: [],
      conflicts: []
    };
    
    this.batches.set(batch.id, batch);
    return batch;
  }
  
  updateAgentStatus(batchId: string, agentName: string, update: Partial<ParallelAgent>): void {
    const batch = this.batches.get(batchId);
    if (!batch) return;
    
    const agent = batch.agents.find(a => a.name === agentName);
    if (agent) {
      Object.assign(agent, update);
      this.recalculateBatchStatus(batch);
    }
  }
  
  private recalculateBatchStatus(batch: ParallelBatch): void {
    const statuses = batch.agents.map(a => a.status);
    
    if (statuses.every(s => s === 'completed')) {
      batch.status = 'completed';
    } else if (statuses.some(s => s === 'failed')) {
      batch.status = 'failed';
    } else if (statuses.some(s => s === 'running')) {
      batch.status = 'running';
    } else {
      batch.status = 'preparing';
    }
  }
}
```

## Status File Management

### Location
Status stored in: `.claude/workflow-status.json`

### Format
```json
{
  "currentWorkflow": {
    "id": "workflow-123",
    "type": "implementation",
    "startTime": "2025-01-15T10:00:00Z",
    "agents": [
      {
        "name": "smart-context-builder",
        "status": "completed",
        "duration": 120,
        "output": "Built 50k token context"
      },
      {
        "name": "implementation-workflow",
        "status": "running",
        "progress": 60,
        "currentStep": "Writing tests"
      }
    ]
  },
  "contextCheckpoints": [
    {
      "id": "checkpoint-1",
      "timestamp": "2025-01-15T10:02:00Z",
      "agent": "smart-context-builder",
      "tokens": 50000,
      "description": "Full project understanding"
    }
  ]
}
```

## Agent Integration Points

### For Context Builders
Report:
- Tokens consumed
- Understanding depth
- Key insights
- Areas covered

### For Task Agents
Report:
- Task progress
- Subtasks completed
- Blockers encountered
- Dependencies

### For Implementation Agents
Report:
- Files modified
- Tests written
- Patterns followed
- Review needed

### For Documentation Agents
Report:
- Docs updated
- Changes documented
- Sync status
- Completeness

## Usage in Workflows

### Starting a Workflow
```
1. Orchestrator initializes status
2. First agent reports start
3. Progress updates during execution
4. Completion/handoff reported
```

### During Execution
```
- Regular progress updates
- Context checkpointing
- Error reporting
- Decision logging
```

### Workflow Completion
```
1. Final status summary
2. Cleanup temporary data
3. Archive workflow log
4. Suggest next actions
```

## Benefits

### For Users
- Visibility into progress
- Understanding of agent actions
- Clear error messages
- Recovery options

### For Agents
- Context preservation
- Clean handoffs
- Error recovery
- Parallel coordination

### For Debugging
- Execution trace
- Performance metrics
- Bottleneck identification
- Failure analysis

## Best Practices

### Status Update Frequency
- Major milestones: Always
- Long operations: Every 30s
- Quick tasks: Start/end only
- Errors: Immediately

### Context Transfer
- Keep concise
- Include only essentials
- Reference files not content
- Maintain checkpoint links

### Error Handling
- Be specific about failures
- Provide recovery options
- Save partial progress
- Enable graceful degradation

This communication mechanism ensures smooth multi-agent workflows with visibility and recoverability.
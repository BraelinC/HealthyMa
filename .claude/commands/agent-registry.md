# Agent Registry - Complete Catalog of All Available Agents

This registry provides a comprehensive catalog of all available agents/commands in the system, their capabilities, and optimal use cases.

## Agent Categories

### 1. Context Building Agents
Build understanding of codebase and requirements.

| Agent | Purpose | Inputs | Outputs | Best For |
|-------|---------|---------|---------|----------|
| `/smart-context-builder` | Deep 50k+ token understanding | Focus area, file patterns | Context checkpoint, mental model | Complex features, initial understanding |
| `/context-agent` | Task-specific context analysis | Task description | Context summary, file list | Focused tasks |
| `/analyze-nutrima` | Project-specific analysis | Area of focus | NutriMa insights, patterns | Understanding app structure |
| `/understand-feature` | Deep feature understanding | Feature name/description | Feature analysis, dependencies | Feature implementation |

### 2. Planning & Orchestration Agents
Coordinate and plan work.

| Agent | Purpose | Inputs | Outputs | Best For |
|-------|---------|---------|---------|----------|
| `/head` | Master orchestrator | Any request | Workflow selection, agent routing | All tasks (entry point) |
| `/smart-planner` | Think hardest planning | Task description | Execution plan, file targets | Pre-implementation planning |
| `/parallel-orchestrator` | Parallel execution manager | Agent list, task type | Parallel batch execution | Multi-agent tasks |

### 3. Task Management Agents (TM)
Manage tasks and project organization.

| Agent | Purpose | Inputs | Outputs | Best For |
|-------|---------|---------|---------|----------|
| `/tm/init/init-project` | Initialize task management | Project path | TM setup | New projects |
| `/tm/add-task/add-task` | Create new task | Description, dependencies | Task ID | Adding work items |
| `/tm/list/list-tasks` | Show all tasks | Status filter | Task list | Overview |
| `/tm/next/next-task` | Find next task | None | Next available task | What to work on |
| `/tm/show/show-task` | Task details | Task ID | Full task info | Understanding requirements |
| `/tm/set-status/*` | Update task status | Task ID | Status change | Progress tracking |
| `/tm/expand/expand-task` | Break into subtasks | Task ID | Subtasks | Complex task breakdown |
| `/tm/add-subtask/add-subtask` | Add subtask | Parent ID, description | Subtask | Detailed planning |
| `/tm/analyze-complexity/analyze-complexity` | Assess complexity | Task IDs | Complexity scores | Planning effort |
| `/tm/add-dependency/add-dependency` | Link tasks | Task IDs | Dependency | Order management |
| `/tm/remove-dependency/remove-dependency` | Unlink tasks | Task IDs | Removed link | Simplify flow |
| `/tm/remove-task/remove-task` | Delete task | Task ID | Confirmation | Cleanup |
| `/tm/remove-subtask/remove-subtask` | Delete subtask | Subtask ID | Confirmation | Cleanup |
| `/tm/clear-subtasks/*` | Remove subtasks | Task ID or all | Cleared | Reset planning |
| `/tm/update/*` | Update task info | Task ID, changes | Updated task | Evolving requirements |
| `/tm/parse-prd/*` | Parse requirements doc | PRD file | Tasks | Requirements → tasks |
| `/tm/generate/generate-tasks` | Create task files | None | Task files | Documentation |
| `/tm/validate-dependencies/validate-dependencies` | Check dependencies | None | Issues found | Integrity check |
| `/tm/fix-dependencies/fix-dependencies` | Repair dependencies | None | Fixes applied | Cleanup |
| `/tm/models/*` | AI model config | Model settings | Configuration | Setup |
| `/tm/complexity-report/complexity-report` | View complexity | None | Report | Planning insight |

### 4. Implementation Agents
Execute code changes.

| Agent | Purpose | Inputs | Outputs | Best For |
|-------|---------|---------|---------|----------|
| Workflow: `/implementation-workflow` | Feature implementation | Feature description | Code changes | New features |
| Workflow: `/bug-fix-workflow` | Fix bugs | Bug description | Bug fix | Debugging |
| Workflow: `/refactoring-workflow` | Improve code | Target code | Refactored code | Code quality |
| Workflow: `/research-workflow` | Technical research | Research question | Findings, recommendations | Decision making |

### 5. Documentation & Context Update Agents
Keep documentation current.

| Agent | Purpose | Inputs | Outputs | Best For |
|-------|---------|---------|---------|----------|
| `/update-context` | Update CLAUDE.md files | Changes made | Updated docs | Post-implementation |
| `/tm/sync-readme/sync-readme` | Sync README | None | Updated README | Documentation |

### 6. Session Management Agents
Handle work sessions.

| Agent | Purpose | Inputs | Outputs | Best For |
|-------|---------|---------|---------|----------|
| `/session-start` | Begin session | None | Session setup | Starting work |
| `/save-progress` | Save state | Progress description | Saved checkpoint | Before stopping |
| `/restore-session` | Resume work | None | Restored context | Continuing work |

### 7. Status & Monitoring Agents
Track execution and status.

| Agent | Purpose | Inputs | Outputs | Best For |
|-------|---------|---------|---------|----------|
| `/agent-status` | Agent communication | Status type | Status info | Monitoring |
| `/tm/status/project-status` | Project overview | None | Status summary | Progress check |

### 8. Utility & Analysis Agents
Supporting tools and analysis.

| Agent | Purpose | Inputs | Outputs | Best For |
|-------|---------|---------|---------|----------|
| `/tm/utils/analyze-project` | Project analysis | None | Project insights | Understanding |
| `/agent-dependencies` | Dependency tracking | Agent names | Dependency graph | Parallel planning |
| `/file-lock-manager` | File conflict prevention | File operations | Lock management | Parallel safety |
| `/code-quality-directive` | Quality standards | None | Quality rules | Standards reference |
| `/tm/learn` | Learn TM system | None | Tutorial | Onboarding |
| `/tm/help` | TM help | None | Help info | Reference |

### 9. Workflow Composition Agents
Combine agents for complex tasks.

| Agent | Purpose | Inputs | Outputs | Best For |
|-------|---------|---------|---------|----------|
| `/integrated-workflow-guide` | Workflow documentation | None | Workflow guide | Understanding flows |
| `/master-context-workflow` | Context mastery | None | Context guide | Deep learning |
| `/parallel-test-scenarios` | Test parallel execution | Test number | Test results | Validation |

## Agent Selection Matrix

### By Task Type

| Task Type | Primary Agents | Secondary Agents | Parallel Opportunities |
|-----------|---------------|------------------|----------------------|
| **New Feature** | `/smart-planner`, `/tm/add-task`, `/smart-context-builder`, `/implementation-workflow` | `/tm/expand-task`, `/understand-feature`, `/update-context` | Context building, testing |
| **Bug Fix** | `/context-agent`, `/analyze-nutrima`, `/bug-fix-workflow` | `/tm/show-task`, `/understand-feature` | Log analysis, tracing |
| **Research** | `/smart-planner`, `/research-workflow`, `/parallel-orchestrator` | `/tm/add-task`, `/update-context` | Multiple options |
| **Documentation** | `/update-context`, `/tm/sync-readme` | `/analyze-nutrima` | Multiple files |
| **Planning** | `/tm/parse-prd`, `/tm/analyze-complexity`, `/smart-planner` | `/tm/expand-task`, `/tm/add-dependency` | Task analysis |
| **Refactoring** | `/understand-feature`, `/refactoring-workflow` | `/tm/add-task`, `/code-quality-directive` | Test suites |

## Agent Capabilities Scoring

Each agent has capabilities scored 1-10:

| Capability | Description | High-Scoring Agents |
|------------|-------------|-------------------|
| **Understanding** | Build context/knowledge | `/smart-context-builder` (10), `/understand-feature` (9) |
| **Planning** | Create execution plans | `/smart-planner` (10), `/tm/analyze-complexity` (8) |
| **Implementation** | Write/modify code | `/implementation-workflow` (10), `/bug-fix-workflow` (9) |
| **Organization** | Manage work items | `/tm/add-task` (9), `/tm/next` (8) |
| **Analysis** | Evaluate code/project | `/analyze-nutrima` (9), `/tm/analyze-complexity` (9) |
| **Documentation** | Update docs | `/update-context` (10), `/tm/sync-readme` (8) |
| **Coordination** | Multi-agent orchestration | `/parallel-orchestrator` (10), `/head` (9) |
| **Research** | Investigate options | `/research-workflow` (10) |

## Dynamic Agent Selection Rules

### 1. Context First Rule
Always include context builders before implementation:
- Small task: `/context-agent`
- Medium task: `/smart-context-builder`
- Large task: `/smart-context-builder` + `/understand-feature`

### 2. Task Management Integration
For tracked work:
- Start: `/tm/next` or `/tm/show`
- During: `/tm/set-status`
- End: `/tm/set-status` → done

### 3. Parallel Optimization
When possible, parallelize:
- Multiple context sources
- Independent research paths
- Non-overlapping file changes
- Different test suites

### 4. Documentation Always
End with documentation:
- Code changes: `/update-context`
- New patterns: Update relevant .md
- Task complete: Update status

## Agent Discovery Commands

```bash
# List all agents by category
/head --list-agents [category]

# Get agent details
/head --agent-info "/agent-name"

# Suggest agents for task
/head --suggest "task description"

# Explain why agents were selected
/head --explain-selection
```

## Usage Examples

### Optimal Agent Combination: "Add shopping list to meal plan"
```
1. /tm/next                          # Find related task
2. /smart-planner "shopping list"    # Think hardest
3. /parallel-orchestrator [          # Parallel context
     /smart-context-builder,
     /understand-feature "meal plan",
     /tm/show <task-id>
   ]
4. /implementation-workflow          # Build feature
5. /tm/set-status --done            # Mark complete
6. /update-context                  # Document
```

### Optimal Agent Combination: "Debug performance issue"
```
1. /analyze-nutrima "performance"    # Find bottlenecks
2. /parallel-orchestrator [          # Parallel analysis
     /context-agent "trace issue",
     /tm/list --status=related
   ]
3. /bug-fix-workflow                # Fix issue
4. /parallel-test-scenarios         # Verify fix
5. /update-context "fixed perf"     # Document
```

This registry enables the head orchestrator to intelligently select the optimal combination of agents for any request!
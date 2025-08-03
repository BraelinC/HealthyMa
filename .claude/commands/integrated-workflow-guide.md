# Integrated Workflow Guide

How all agents work together under the `/head` orchestrator.

## The Complete System

### 1. Entry Point: `/head`
The master orchestrator that:
- Analyzes your request
- Builds context FIRST
- Routes to appropriate workflow
- Monitors execution
- Reports results

### 2. Context Building Agents
Always run before any action:
- `/smart-context-builder` - Deep 50k+ token understanding
- `/context-agent` - Task-specific context analysis
- `/analyze-nutrima` - Project state overview

### 3. Workflow Templates
Pre-configured execution paths:
- `/workflows/implementation-workflow` - New features
- `/workflows/bug-fix-workflow` - Debugging and fixes
- `/workflows/research-workflow` - Technical investigation
- `/workflows/refactoring-workflow` - Code improvement

### 4. Task Management (via tm/)
- Task tracking and organization
- Integrates with workflows
- Maintains project state

### 5. Documentation Agents
Keep everything in sync:
- `/update-context` - Update CLAUDE.md files
- `/understand-feature` - Deep feature analysis

## Example Flow: "Add dark mode to settings"

```mermaid
graph TD
    A[User: /head add dark mode to settings] --> B[Head Orchestrator]
    B --> C{Analyze Request}
    C --> D[Type: Implementation]
    D --> E[/smart-planner - THINK HARDEST!]
    E --> F[Create focused plan]
    F --> G[/smart-context-builder]
    G --> H[Build ONLY needed context per plan]
    H --> I[/context-agent dark mode]
    I --> J[Analyze current settings from plan]
    J --> K[/workflows/implementation-workflow]
    K --> L[Execute with CODE QUALITY DIRECTIVE]
    L --> M[Verify → Build → Test → Proceed]
    M --> N[/update-context]
    N --> O[Complete]
```

## Code Quality Enforcement

**NEW: All code-writing workflows now enforce:**
```
1. Think hard and write elegant code
2. NO backwards compatibility unless requested
3. After EVERY code block:
   - Verify syntax/types
   - Build to check errors
   - Write tests
   - Run tests before proceeding
4. Cannot proceed without verification
```

## How Agents Communicate

### 1. Status Updates
Each agent reports:
```markdown
## Agent Status
- Current: [what I'm doing]
- Progress: [X%]
- Next: [what happens next]
```

### 2. Context Handoff
Agents pass information:
```markdown
## Handoff to Next Agent
- Context Built: [what I learned]
- Files Found: [relevant files]
- Decisions: [choices made]
- Next Steps: [what to do]
```

### 3. Error Recovery
If something fails:
```markdown
## Error Report
- What Failed: [description]
- Recovery: [options]
- Fallback: [alternative]
```

## Common Workflows

### Feature Implementation
```
/head "implement feature X"
  → Analyzes as implementation task
  → THINKS HARDEST with /smart-planner
  → Creates focused plan (files, functions, tests)
  → Builds ONLY needed context (not 50k+ tokens!)
  → Routes to implementation workflow
  → Finds related tasks
  → Executes planned approach
  → Implements with patterns
  → Updates documentation
```

### Bug Fixing
```
/head "fix timeout in meal generation"
  → Analyzes as bug fix
  → THINKS HARDEST with /smart-planner
  → Hypothesizes root cause and plan
  → Builds targeted debugging context
  → Routes to bug workflow
  → Traces issue (in planned files)
  → Implements planned fix
  → Adds planned tests
  → Documents solution
```

### Research Task
```
/head "research caching strategies"
  → Analyzes as research
  → THINKS HARDEST with /smart-planner
  → Defines specific questions and focus areas
  → Builds context for planned areas only
  → Routes to research workflow
  → Investigates planned options
  → Compares per planned criteria
  → Documents findings
  → Recommends solution
```

## Best Practices

### 1. Always Use /head
Don't skip the orchestrator - it ensures:
- Proper context building
- Correct workflow selection
- Status tracking
- Documentation updates

### 2. Trust the Planning & Context Phases
NEW: Smart planning BEFORE context saves time:
- Planning: 1-2 minutes of hard thinking
- Context: Now targeted, 10-30k tokens (not 50k+!)
- Result: Faster, more focused execution
- Deep understanding = better results

### 3. Follow the Workflows
Each workflow is optimized for its task type:
- Don't mix workflows
- Complete each phase
- Update documentation

### 4. Use Status Reports
Monitor progress through status updates:
- Know what's happening
- Catch issues early
- Understand decisions

## Quick Reference

### Starting Any Task
```
/head "your task description"
```

### Checking Progress
Look for status updates like:
```
[Context Building: 70% complete]
[Implementation: Writing tests]
[Documentation: Updating CLAUDE.md]
```

### If Something Goes Wrong
The orchestrator will:
1. Report the error
2. Suggest recovery options
3. Checkpoint progress
4. Allow manual intervention

## Advanced Usage

### Parallel Workflows
Use double-escape to run multiple tasks:
```
Terminal 1: /head "frontend feature"
[Double Escape after context]
Terminal 2: /head "backend API"
```

### Context Reuse
After expensive context building:
- Double-escape to checkpoint
- Resume for related work
- Save token usage

### Custom Workflows
Extend the system by:
1. Creating new workflow templates
2. Adding specialized agents
3. Customizing routing logic

## Remember

The key principles:
1. **Context First** - Always build understanding
2. **Smart Routing** - Let orchestrator choose tools
3. **Complete Workflows** - Finish what you start
4. **Document Always** - Keep context current

This integrated system ensures consistent, high-quality development with full visibility into the process!
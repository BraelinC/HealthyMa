# Head - Master Orchestrator with Dynamic Agent Selection

The intelligent workflow orchestrator that analyzes requests, dynamically selects optimal agents from ALL available options, builds context FIRST, then executes the perfect agent pipeline.

Arguments: $ARGUMENTS

## Core Principles

1. **Dynamic Agent Selection**: Intelligently chooses from 65+ available agents
2. **Context Before Action**: Always builds understanding before execution
3. **Optimal Composition**: Creates custom pipelines for each unique request
4. **Parallel Optimization**: Uses parallel execution when beneficial

## Dynamic Agent Selection System

### Agent Registry Loading
```typescript
// Load all available agents and their capabilities
const agentRegistry = loadAgentRegistry();
const agentCapabilities = loadAgentCapabilities();

// 65+ agents categorized by:
// - Context Building (4 agents)
// - Planning & Orchestration (3 agents)
// - Task Management (30+ agents)
// - Implementation (4 workflows)
// - Documentation (2 agents)
// - Session Management (3 agents)
// - Monitoring & Utilities (10+ agents)
```

### Intelligent Agent Selection Algorithm
```typescript
function selectOptimalAgents(request: string): AgentPipeline {
  // 1. Analyze request semantics
  const intent = analyzeIntent(request);
  const complexity = assessComplexity(request);
  const keywords = extractKeywords(request);
  
  // 2. Score each agent for relevance
  const agentScores = agents.map(agent => ({
    agent,
    score: calculateRelevanceScore(agent, {
      intent,
      keywords,
      requiredCapabilities,
      pastSuccess,
      dependencies
    })
  }));
  
  // 3. Build optimal pipeline
  return buildPipeline(agentScores, {
    respectDependencies: true,
    enableParallel: true,
    optimizeForSpeed: true
  });
}
```

## Workflow Stages

### 1. Request Analysis & Agent Selection
First, I analyze your request and dynamically select optimal agents:

```markdown
Request: "$ARGUMENTS"
↓
Analysis:
- Intent: [implementation/bug-fix/research/planning/documentation]
- Complexity: [simple/medium/complex]
- Keywords: [extracted key terms]
- Context Needs: [minimal/moderate/extensive]
↓
Selected Agents:
1. [Agent A] - Score: 9.5 - Reason: [why selected]
2. [Agent B] - Score: 8.7 - Reason: [why selected]
3. [Agent C] - Score: 8.2 - Reason: [why selected]
...
```

### 2. Smart Planning (THINK HARDEST!)
**NEW CRITICAL STEP**: Before building expensive context, create a focused plan:

```
/smart-planner "$ARGUMENTS"
```

This step:
- Thinks hardest about the actual requirements
- Identifies minimal scope needed
- Determines which files are involved
- Plans functions and tests
- Defines what context is actually needed

### 3. Context Building (TARGETED & PARALLEL)
Now using the smart plan to build context efficiently with parallel execution:

```
For Implementation:
Sequential Mode:
→ /smart-context-builder (focused on plan's files)
→ /analyze-nutrima (only relevant areas)
→ /understand-feature "$ARGUMENTS" (specific from plan)

Parallel Mode (25-60% faster):
→ /parallel-orchestrator context [
    /smart-context-builder (plan's frontend files),
    /analyze-nutrima (plan's backend areas),
    /understand-feature "$ARGUMENTS"
  ]
→ Merge contexts automatically
→ Continue with complete understanding

For Bug Fix:
Sequential Mode:
→ /analyze-nutrima (error area from plan)
→ /context-agent "debug $ARGUMENTS" (targeted)
→ Trace through files identified in plan

Parallel Mode:
→ /parallel-orchestrator debug [
    /analyze-nutrima (error logs),
    /context-agent "trace $ARGUMENTS",
    /understand-feature "affected areas"
  ]
→ Combine findings
→ Identify root cause faster

For Research:
Sequential Mode:
→ /smart-context-builder (areas from plan)
→ External research on plan's questions
→ Document findings per plan

Parallel Mode:
→ /parallel-orchestrator research [
    /research-agent "option 1",
    /research-agent "option 2",
    /research-agent "option 3"
  ]
→ Compare results in parallel
→ Synthesize recommendations

For Documentation:
→ Load only docs mentioned in plan
→ Recent changes to plan's files
→ /update-context for plan's scope
```

The smart plan ensures we build context efficiently, and parallel execution makes it even faster!

### 4. Intelligent Tool Selection
After understanding context AND with the plan in hand, I choose tools:

**Implementation Workflow**:
1. `/tm/next` - Find related task
2. `/tm/show` - Understand requirements  
3. Plan implementation approach
4. Execute with pattern following
5. `/update-context` - Document changes

**CRITICAL Code Quality Enforcement**:
All code writing follows:
- Think hard for elegant solutions
- NO backwards compatibility unless requested
- Lint → Build → Test cycle after EVERY code block

**Bug Fix Workflow**:
1. Reproduce issue
2. Trace through code
3. Identify root cause
4. Implement minimal fix
5. Add tests
6. `/update-context` - Document fix

**Research Workflow**:
1. Define research scope
2. Gather information
3. Analyze findings
4. Document insights
5. Suggest applications

**Documentation Workflow**:
1. Identify what changed
2. Update relevant .md files
3. Update CHANGELOG
4. Sync with code state

### 5. Execution with Progress Tracking
During execution:
- Follow the plan created in step 2
- Report progress at each step
- Handle errors gracefully
- Checkpoint context when needed
- Validate results against plan

### 6. Post-Execution
After completing the task:
- `/update-context "$ARGUMENTS completed"`
- Update CHANGELOG if significant
- Suggest next steps
- Clean up working state

## Smart Patterns

### The "My Developer" Review Pattern
After implementation:
```
"My developer just implemented $ARGUMENTS. 
Review the code for:
- Pattern consistency
- Performance issues
- Security concerns
- Test coverage"
```

### Context Preservation
- Use double-escape to checkpoint expensive context
- Resume for parallel work streams
- Clear between unrelated tasks

### Failure Recovery
If any step fails:
1. Diagnose the issue
2. Suggest alternatives
3. Checkpoint current state
4. Provide manual recovery steps

## Example Flows

### Example 1: "Add user preferences to settings"
```
1. Analyze: Implementation task (new feature)
2. Smart Plan: Think hardest!
   - Identify: Settings.tsx, user API, preferences schema
   - Plan: PreferencePanel component, updatePreferences endpoint
   - Tests: UI interaction, API validation, persistence
3. Context: Build ONLY settings + user preference areas
4. Route: Implementation workflow with focused plan
5. Execute: 
   - Find settings components (from plan)
   - Add preference UI (as planned)
   - Create API endpoint (per plan)
   - Add database field (identified in plan)
   - Write tests (from plan)
6. Update: Document in CHANGELOG
```

### Example 2: "Fix meal plan generation timeout"
```
1. Analyze: Bug fix task
2. Smart Plan: Think hardest!
   - Hypothesis: Likely in enhancedMealPlanGenerator.ts
   - Plan: Add timing logs, identify bottleneck, optimize
   - Tests: Performance benchmark, quality check
3. Context: Focus ONLY on generation flow files
4. Route: Debug workflow with targeted plan
5. Execute:
   - Trace timeout location (per plan)
   - Identify bottleneck (as planned)
   - Implement optimization (from plan)
   - Verify fix (test from plan)
6. Update: Document solution
```

### Example 3: "Research better caching strategies"
```
1. Analyze: Research task
2. Smart Plan: Think hardest!
   - Questions: Current cache usage? Bottlenecks? Options?
   - Focus: mealPlanCache.ts, sessionCache.ts, Redis potential
   - Deliverable: Comparison matrix, recommendation
3. Context: Load ONLY caching-related code
4. Route: Research workflow with focused questions
5. Execute:
   - Analyze current approach (from plan)
   - Research alternatives (plan's options)
   - Compare solutions (plan's criteria)
   - Make recommendations (plan's format)
6. Update: Create decision doc
```

## Agent Discovery & Recommendation Features

### List Available Agents
```bash
/head --list-agents [category]

Categories:
- context         # Context building agents
- planning        # Planning and strategy agents
- implementation  # Code writing agents
- task-management # Task/project management
- documentation   # Documentation agents
- research        # Research and investigation
- monitoring      # Status and tracking
- all            # Show all 65+ agents
```

### Get Agent Details
```bash
/head --agent-info "/smart-context-builder"

Output:
Agent: /smart-context-builder
Category: Context Building
Capabilities: Understanding(10), Analysis(8), Planning(3)
Best For: Deep understanding, pattern recognition
Time: 2-5 minutes
Parallelizable: Yes
```

### Suggest Agents for Task
```bash
/head --suggest "implement user authentication"

Recommended Pipeline:
1. /tm/next - Check for existing auth tasks
2. /smart-planner - Plan the implementation
3. /analyze-nutrima - Find auth patterns
4. /tm/add-task - Create trackable task
5. /parallel-orchestrator [
     /smart-context-builder,
     /understand-feature "current auth"
   ]
6. /implementation-workflow
7. /tm/set-status/to-done
8. /update-context
```

### Explain Selection
```bash
/head --explain-selection

Why these agents were selected:
- /smart-planner: High planning score (10) for complex feature
- /analyze-nutrima: Project-specific patterns needed
- /smart-context-builder: Deep understanding required
- Parallel execution: Independent context sources identified
```

## Dynamic Pipeline Examples

### Example: "Add dark mode toggle"
```markdown
Dynamic Selection:
1. /tm/list --filter="dark mode" (check existing)
2. /smart-planner "dark mode toggle"
3. /parallel-orchestrator [
     /understand-feature "theme system",
     /analyze-nutrima "UI patterns",
     /tm/show <related-task-id>
   ]
4. /implementation-workflow
5. /tm/set-status/to-done
6. /update-context

Why: Detected UI feature, found theme keywords, identified parallel opportunities
```

### Example: "Debug performance issue in meal generation"
```markdown
Dynamic Selection:
1. /analyze-nutrima "performance meal generation"
2. /tm/analyze-complexity (assess task scope)
3. /parallel-orchestrator [
     /context-agent "trace performance",
     /understand-feature "meal generation",
     /tm/list --filter="performance"
   ]
4. /bug-fix-workflow
5. /parallel-orchestrator [
     Performance tests,
     /update-context
   ]

Why: Bug keywords detected, performance analysis needed, parallel debugging possible
```

### Example: "Research state management options"
```markdown
Dynamic Selection:
1. /smart-planner "state management research"
2. /tm/add-task --prompt="research state management"
3. /parallel-orchestrator research [
     /research-workflow "Redux evaluation",
     /research-workflow "Zustand evaluation",
     /research-workflow "Context API evaluation"
   ]
4. /tm/complexity-report (summarize findings)
5. /update-context "research findings"

Why: Research intent clear, parallel comparison beneficial, documentation needed
```

## Integration Points

This enhanced orchestrator integrates with ALL agents:

### Core Agents (Always Available)
- `/smart-planner` - Think hardest planning phase
- `/smart-context-builder` - Deep context building
- `/context-agent` - Task-specific context
- `/analyze-nutrima` - Project analysis
- `/understand-feature` - Feature deep dives
- `/update-context` - Documentation updates
- `/parallel-orchestrator` - Parallel execution

### Task Management Suite (30+ agents)
- All `/tm/*` commands for project organization
- Task creation, tracking, dependencies
- Complexity analysis and planning
- Status management and reporting

### Specialized Agents
- `/agent-status` - Execution monitoring
- `/agent-dependencies` - Dependency tracking
- `/file-lock-manager` - Conflict prevention
- `/session-start`, `/save-progress` - Session management
- Research, implementation, and debugging workflows

### Dynamic Loading
The orchestrator can discover and use new agents as they're added to the system!

## Parallel Execution Decision Matrix

### When to Use Parallel Mode

**Use Parallel When:**
- Context building involves multiple independent areas
- Research requires comparing multiple options
- Testing can run multiple suites simultaneously
- Documentation updates touch different files
- Time is critical and speedup justifies overhead

**Stay Sequential When:**
- Task is simple with minimal context needs
- Dependencies are tightly coupled
- Files have high modification overlap
- Debugging requires step-by-step tracing
- System resources are limited

### Parallel Execution Monitoring

During parallel execution, monitor status:
```
/agent-status parallel

Shows:
- Active parallel batches
- Agent progress bars
- File lock status
- Conflict queue
- Performance metrics
```

## Agent Selection Scoring Factors

The orchestrator scores agents based on multiple factors:

```typescript
interface ScoringFactors {
  intentMatch: number;      // How well agent matches intent (0-10)
  keywordRelevance: number; // Keyword overlap score (0-10)
  capabilityFit: number;    // Required capabilities match (0-10)
  complexity: number;       // Handles task complexity (0-10)
  dependencies: number;     // Dependencies satisfied (0-10)
  parallelizable: number;   // Can run in parallel (0-10)
  efficiency: number;       // Time/resource efficiency (0-10)
  pastSuccess: number;      // Historical success rate (0-10)
}
```

## Learning & Optimization

The orchestrator learns from usage:

```typescript
interface LearningSystem {
  // Track successful pipelines
  recordSuccess(pipeline: Agent[], outcome: Outcome): void;
  
  // Learn agent combinations that work well
  updateAgentAffinities(agents: Agent[]): void;
  
  // Optimize future selections
  getHistoricalScore(agent: Agent, context: Context): number;
}
```

## Remember

The enhanced orchestrator now:
1. **Knows ALL 65+ agents** and their capabilities
2. **Dynamically selects** optimal agents for each request
3. **Creates custom pipelines** not rigid workflows
4. **Learns from usage** to improve over time
5. **Enables discovery** of new agent capabilities
6. **Maximizes parallelization** automatically
7. **Explains decisions** for transparency
8. **Adapts to new agents** as they're added

The ultimate workflow:
- Request → AI Analysis 
- → Dynamic Agent Selection (from 65+ options)
- → Custom Pipeline Creation
- → Parallel Execution Where Possible
- → Continuous Learning & Improvement

Ready to orchestrate with the FULL POWER of all available agents!
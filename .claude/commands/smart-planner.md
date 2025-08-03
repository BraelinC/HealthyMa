# Smart Planner - Intelligent Planning Before Context

This agent creates a focused plan BEFORE building expensive context. It thinks hard about what's actually needed to accomplish the task.

Arguments: $ARGUMENTS

## Purpose
Analyze the request and create a targeted plan WITHOUT building full context first. This saves tokens and focuses the subsequent context building.

## Planning Process

### 1. Initial Analysis (THINK HARDEST!)

**CRITICAL INSTRUCTION: Think hardest about this request. Take your time to deeply analyze what needs to be done. Consider all angles, potential issues, and the best approach. This is the most important thinking phase.**

Based on: $ARGUMENTS

Think through:
- What functionality do we ACTUALLY need right now?
- What's the minimal scope to achieve the goal?
- Which files are likely involved?
- What patterns should we follow?
- What could go wrong?
- What's the simplest solution that works?

**THINK HARDEST PROMPT:**
```
Think hardest about how to accomplish: $ARGUMENTS

Consider:
1. What is the REAL requirement here?
2. What's the MINIMAL implementation needed?
3. What existing code can we reuse?
4. What patterns should we follow?
5. What edge cases might we hit?
6. How can we test this properly?

Take time to think through the best approach. Don't rush. 
Quality of planning here determines success of implementation.
```

### 2. Focused Planning Output

```markdown
## Smart Plan for: $ARGUMENTS

### Overview
[1-2 sentences about what we're actually going to do]

### Scope Definition
- **What we WILL do**: [specific functionality]
- **What we WON'T do**: [out of scope items]
- **Why this approach**: [reasoning]

### Likely Files to Change
Based on project structure knowledge:
1. `path/to/file1` - [why this file]
2. `path/to/file2` - [why this file]
3. `path/to/file3` - [why this file]

### Functions to Create/Modify
1. `functionName()` - [1-3 sentences about purpose]
2. `anotherFunction()` - [1-3 sentences about purpose]
3. `helperFunction()` - [1-3 sentences about purpose]

**Code Quality Requirements:**
- Write elegant, clean code
- NO backwards compatibility unless requested
- Test EVERY function thoroughly

### Tests to Write
1. `test: should handle basic case` - [5-10 words about behavior]
2. `test: should validate input` - [5-10 words about behavior]
3. `test: should handle errors` - [5-10 words about behavior]

### Context Needed
Based on this plan, we specifically need context about:
- [Specific area 1]
- [Specific area 2]
- [Specific patterns to follow]

### Estimated Effort
- Complexity: Low/Medium/High
- Files to touch: ~X files
- Time estimate: X hours
```

## Smart Planning Patterns

### For Feature Requests
Think:
- Minimal viable implementation
- Existing patterns to follow
- Integration points
- Test requirements

### For Bug Fixes
Think:
- Likely error location
- Root cause hypothesis
- Minimal fix approach
- Regression prevention

### For Refactoring
Think:
- Specific code smells
- Refactoring technique
- Risk assessment
- Test coverage needs

### For Research
Think:
- Specific questions to answer
- Information needed
- Comparison criteria
- Decision framework

## Examples

### Example 1: "Add dark mode toggle to settings"
```markdown
## Smart Plan

### Overview
Add a toggle switch in settings UI that switches between light/dark themes using existing theme system.

### Scope Definition
- **WILL**: Add toggle UI, connect to theme context, persist preference
- **WON'T**: Create new theme system, modify colors (use existing)

### Likely Files
1. `client/src/pages/Settings.tsx` - Add toggle component
2. `client/src/hooks/useTheme.ts` - Already has theme logic
3. `client/src/components/ui/toggle.tsx` - Reuse existing

### Functions
1. `ThemeToggle()` - Renders toggle with current theme state
2. `saveThemePreference()` - Persists to localStorage
3. `loadThemePreference()` - Reads on app start

### Tests
1. `should toggle between themes` - Click changes theme
2. `should persist selection` - Refresh maintains choice
3. `should default to system` - Respects OS preference

### Context Needed
- Current theme implementation
- Settings page structure
- Toggle component API
```

### Example 2: "Fix meal plan generation timeout"
```markdown
## Smart Plan

### Overview  
Optimize meal plan generation by identifying bottleneck and implementing targeted fix.

### Scope Definition
- **WILL**: Profile generation, fix bottleneck, add monitoring
- **WON'T**: Rewrite entire system, change API contract

### Likely Files
1. `server/enhancedMealPlanGenerator.ts` - Main generation logic
2. `server/intelligentPromptBuilderV2.ts` - Might be slow
3. `server/smartIngredientOptimizer.ts` - Optimization loops

### Functions
1. `profileGeneration()` - Add timing logs to identify slow parts
2. `optimizePromptBuilding()` - Reduce prompt complexity if needed  
3. `addGenerationCache()` - Cache repeated calculations

### Tests
1. `should complete under 5s` - Performance benchmark
2. `should maintain quality` - Results unchanged
3. `should handle timeout` - Graceful degradation

### Context Needed
- Current generation flow
- Performance metrics
- Timeout configuration
```

## Integration with /head

This planner integrates into the orchestrator flow:

```
1. /head receives request
2. /smart-planner creates focused plan ← NEW STEP (THINK HARDEST HERE!)
3. /smart-context-builder uses plan to build ONLY needed context
4. Workflow execution proceeds with targeted context
```

## Benefits

### Token Efficiency
- Avoid building unnecessary context
- Focus on relevant files only
- Faster context building

### Better Planning
- Think through approach first
- Identify risks early
- Set clear scope

### Improved Execution
- Know what to build/fix
- Have test plan ready
- Clear success criteria

## Output for Next Agent

The plan is passed to context builders to focus their work:
```markdown
## Plan Handoff
- **Focus Areas**: [from plan]
- **Files to Analyze**: [from plan]
- **Patterns to Load**: [from plan]
- **Skip**: [areas not needed]
```

This ensures subsequent agents build only the context actually needed for the task!
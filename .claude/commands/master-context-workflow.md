# Master Context Workflow

This is the complete workflow for using context effectively in NutriMa development, implementing all best practices from the Claude Code video.

## Complete Workflow:

### 1. Session Start
```bash
# Every new session, run:
/smart-context-builder

# Output: Deep understanding loaded
# Time: 5-10 minutes
# Tokens: 50k+
```

### 2. Task Initialization
```bash
# When starting a new task:
/context-agent "implement user preferences dashboard"

# Output: 
# - Current implementation analysis
# - Affected files identified
# - Step-by-step plan
# - Risk assessment
```

### 3. Feature Deep Dive (if needed)
```bash
# For complex features:
/understand-feature "user preferences"

# Output:
# - Complete feature flow
# - All related components
# - Data flow diagram
# - Current limitations
```

### 4. Implementation Phase

#### 4a. Explore Phase
- Read all relevant files
- Understand current patterns
- Identify integration points
- Check for existing tests

#### 4b. Plan Phase
- Break down into PR-sized chunks
- Design component interfaces
- Plan API contracts
- Consider error cases

#### 4c. Execute Phase
- Implement following patterns
- Write tests alongside code
- Handle errors gracefully
- Optimize performance

### 5. Context Preservation

#### During Long Tasks:
```bash
# Save checkpoint before complex work
[Double Escape]

# Work on implementation...

# If context gets cluttered:
[Return to checkpoint]
```

#### For Parallel Work:
```bash
# Terminal 1: Frontend work
/resume
# Work on React components

# Terminal 2: Backend work  
/resume
# Work on API endpoints

# Terminal 3: Testing
/resume
# Write integration tests
```

### 6. Post-Implementation
```bash
# After completing work:
/update-context "added user preferences dashboard with real-time updates"

# Output:
# - Documentation updated
# - CHANGELOG entry added
# - Patterns documented
# - Architecture notes updated
```

## Context Management Best Practices:

### 1. The "My Developer" Pattern
When reviewing your own work:
```
"My developer just implemented [feature]. Review the code and provide honest feedback on:
- Code quality and patterns
- Performance implications  
- Security considerations
- Testing coverage"
```

### 2. Context Validation
Before starting implementation:
```
"Based on my understanding, the meal plan generation works by:
1. [Step 1]
2. [Step 2]
Is this correct?"
```

### 3. Pattern Enforcement
When implementing:
```
"Following the existing pattern in [similar feature], implement [new feature] using:
- Same component structure
- Consistent error handling
- Similar API patterns"
```

## Workflow Optimization:

### For Simple Tasks (< 1 hour):
1. `/context-agent "task"` - Quick context
2. Implement directly
3. `/update-context --quick`

### For Medium Tasks (1-4 hours):
1. `/smart-context-builder` - Full context
2. `/context-agent "task"` - Task analysis  
3. Plan → Implement → Test
4. `/update-context "changes"`

### For Complex Tasks (> 4 hours):
1. `/smart-context-builder` - Deep context
2. `/understand-feature "area"` - Feature analysis
3. Break into subtasks
4. Use double escape between subtasks
5. `/update-context --full`

## Context Quality Metrics:

### Measure Your Context Quality:
- **Speed**: Can you navigate to any file instantly?
- **Accuracy**: Do you know what each service does?
- **Depth**: Can you explain the business logic?
- **Patterns**: Do you follow conventions automatically?
- **Predictions**: Can you anticipate side effects?

### Red Flags (Rebuild Context):
- Searching for the same file multiple times
- Unsure about basic architecture
- Making style inconsistent with codebase
- Forgetting about error handling
- Missing obvious integration points

## Advanced Techniques:

### 1. Context Branching
```
Main Context (50k tokens)
    ├── Frontend Branch (focus on React)
    ├── Backend Branch (focus on services)
    └── Testing Branch (focus on test patterns)
```

### 2. Context Layering
```
Base Layer: Architecture + Patterns
Task Layer: Specific feature understanding  
Work Layer: Current implementation details
```

### 3. Context Checkpoints
- Before major refactoring
- After understanding complex logic
- Before switching feature areas
- After successful implementation

## Emergency Context Recovery:

If you lose context completely:
1. `/smart-context-builder` - Rebuild base
2. `git log --oneline -10` - Recent work
3. Read your last CHANGELOG entry
4. Check PLAN.md for current task
5. Resume work with fresh context

## Daily Workflow Example:

```bash
# Morning
/smart-context-builder
/analyze-nutrima  # Get project status

# Task 1
/context-agent "fix meal plan generation timeout"
# ... implement fix ...
/update-context "optimized meal plan generation"

# Task 2 (different area)
[Double Escape to checkpoint]
/context-agent "add nutrition goals tracking"
# ... implement feature ...
/update-context "added nutrition goals"

# End of day
/update-context --full  # Comprehensive update
git commit -m "feat: optimized meal plan generation and added nutrition goals"
```

## Tips for Maximum Efficiency:

1. **Invest in Context**: Spending 10 minutes building context saves hours of mistakes
2. **Use Checkpoints**: Double escape is your friend for context management
3. **Document as You Go**: Update context immediately after discoveries
4. **Trust the Process**: Let Claude think deeply before coding
5. **Validate Often**: Check understanding before big changes

Remember: The goal is to make Claude as smart as possible about your codebase before it writes a single line of code!
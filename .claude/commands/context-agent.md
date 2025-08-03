# Context Agent - Automated Context Building

This agent automatically analyzes the codebase and builds comprehensive context before starting any development task. It implements the "Explore-Plan-Execute" methodology from the Claude Code best practices.

## Usage: 
- Standalone: `/context-agent "task description"`
- Via Orchestrator: Automatically called by `/head` command

## Integration with Orchestrator
This agent now reports status back to the orchestrator and supports context handoff to other agents.

## Steps:

### Phase 1: EXPLORE (Build Context)

1. **Read Core Documentation**
   - Read `/CLAUDE.md` for project overview
   - Read `/PLAN.md` for current priorities
   - Read `/CHANGELOG.md` for recent changes
   - Read `/ARCHITECTURE.md` for system design

2. **Analyze Task Requirements**
   - Parse the task description
   - Identify which parts of the codebase are affected
   - Determine required documentation to read

3. **Deep Dive into Relevant Areas**
   - If frontend task: Read `/client/CLAUDE.md`
   - If backend task: Read `/server/CLAUDE.md`
   - If component work: Read `/client/src/components/CLAUDE.md`
   - If API work: Read `/client/src/lib/CLAUDE.md`

4. **Scan Affected Files**
   - List files in relevant directories
   - Read key files mentioned in documentation
   - Understand current implementation

5. **Check for Related Issues**
   - Search for TODO comments in affected files
   - Review error handling in the area
   - Look for performance considerations

### Phase 2: PLAN (Create Strategy)

1. **Summarize Context**
   - Current state of the feature/area
   - Key files and functions involved
   - External dependencies

2. **Create Implementation Plan**
   - Break down the task into steps
   - Identify files to modify
   - List new files to create
   - Note testing requirements

3. **Identify Risks**
   - Breaking changes
   - Performance impacts
   - Security considerations

### Phase 3: PREPARE (Ready for Execution)

1. **Generate Context Summary**
   ```
   ## Task Context Summary
   
   ### Task: [Task Description]
   
   ### Current State
   - [Key finding 1]
   - [Key finding 2]
   
   ### Affected Areas
   - Frontend: [Components/Pages]
   - Backend: [Services/Routes]
   - Database: [Tables/Queries]
   
   ### Implementation Plan
   1. [Step 1]
   2. [Step 2]
   ...
   
   ### Key Files
   - `path/to/file1.ts` - [Purpose]
   - `path/to/file2.tsx` - [Purpose]
   
   ### Considerations
   - [Important note 1]
   - [Important note 2]
   ```

2. **Update Documentation if Needed**
   - If new patterns discovered, note for CLAUDE.md update
   - If architecture changes planned, note for ARCHITECTURE.md
   - Queue documentation updates for after implementation

3. **Set Up for Success**
   - Confirm understanding of patterns
   - Verify API contracts
   - Check for existing tests

## Output Format:

```markdown
# Context Analysis Complete

## Task Understanding
[Clear summary of what needs to be done]

## Current Implementation
[How the feature/area currently works]

## Proposed Approach
[Step-by-step plan based on codebase patterns]

## Files to Modify
- [ ] `file1.ts` - [Changes needed]
- [ ] `file2.tsx` - [Changes needed]

## New Files to Create
- [ ] `newfile.ts` - [Purpose]

## Testing Strategy
[How to verify the implementation]

## Documentation Updates Needed
- [ ] Update X in CLAUDE.md
- [ ] Add Y to CHANGELOG.md

Ready to proceed with implementation? (Type 'yes' to continue)
```

### Status Report to Orchestrator
```markdown
## Context Agent Status
- **Status**: Completed
- **Tokens Used**: [amount]
- **Files Analyzed**: [count]
- **Understanding Depth**: Deep/Medium/Surface
- **Key Findings**: [summary]
- **Ready for**: [next agent/workflow]
```

## Example Usage:

User: `/context-agent "Add a new filter for gluten-free recipes in the meal planner"`

Agent will:
1. Read all documentation to understand meal planning
2. Analyze current filter implementation
3. Find recipe filtering logic
4. Create plan for adding new filter
5. Present comprehensive context and plan

## Advanced Options:

- `/context-agent "task" --deep` - Extra thorough analysis
- `/context-agent "task" --update-docs` - Also update documentation
- `/context-agent "task" --check-tests` - Include test analysis
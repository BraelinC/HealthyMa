# Code Quality Directive Summary

The following code quality directive has been integrated into all code-writing agents:

## The Directive

```
CRITICAL: For EVERY code block you write:
1. Think hard and write elegant code that completes the task
2. Do NOT add backwards compatibility unless explicitly requested
3. After EVERY code block:
   - Verify syntax and types (npm run check / tsc)
   - Build if applicable (npm run build)
   - Write corresponding tests for the functionality
   - Test manually or with test runner if available
4. Only move to the next code block after verification passes
```

## Where It's Implemented

### 1. Smart Planner (`/smart-planner`)
- Added code quality requirements in planning phase
- Emphasizes elegant code and no backwards compatibility
- Requires thorough testing for every function

### 2. Implementation Workflow (`/workflows/implementation-workflow`)
- Added as "Code Quality Directive" section
- Placed prominently before implementation steps
- Enforces verification after each code block

### 3. Bug Fix Workflow (`/workflows/bug-fix-workflow`)
- Integrated into implementation phase
- Ensures fixes are elegant and well-tested
- Prevents regression through testing discipline

### 4. Refactoring Workflow (`/workflows/refactoring-workflow`)
- Added to incremental refactoring section
- Maintains code quality during improvements
- Ensures no functionality breaks during refactor

### 5. Head Orchestrator (`/head`)
- Includes "Code Quality Enforcement" reminder
- Emphasizes elegant solutions and testing discipline
- Applies to all code-writing workflows

## Key Principles

1. **Think Hard**: Every code block should be thoughtfully designed
2. **Elegant Code**: Write clean, maintainable, efficient solutions
3. **No Legacy Support**: Don't add backwards compatibility unless explicitly requested
4. **Test Discipline**: Write tests BEFORE moving to next code block
5. **Verification Loop**: Verify → Build → Test → Proceed

## Usage

When any agent writes code:
1. It must follow this directive
2. It cannot proceed without verification
3. Tests must be written for new functionality
4. Each code block is independently verified

This ensures consistent, high-quality code across all agent-written implementations.
# Bug Fix Workflow

Systematic approach to debugging and fixing issues.

Arguments: $ARGUMENTS

## Workflow Steps

### 1. Context Building for Debugging
```
/analyze-nutrima
"Prepare to debug: $ARGUMENTS
Focus on understanding:
- Error symptoms
- Affected components
- Recent changes
- Error logs or messages"
```

### 2. Issue Reproduction
**CRITICAL: Reproduce before fixing!**

Steps:
1. Understand exact steps to reproduce
2. Verify the issue exists
3. Document reproduction steps
4. Note error messages/behavior

### 3. Root Cause Analysis

#### 3a. Error Tracing
```
/understand-feature "area with bug: $ARGUMENTS"
```
- Trace execution path
- Identify failure point
- Check recent commits
- Review error logs

#### 3b. Code Investigation
Look for:
- Null/undefined handling
- Race conditions
- API contract violations
- State management issues
- Edge cases

### 4. Minimal Fix Planning
**Principle: Smallest change that fixes the issue**

Plan should include:
1. Root cause explanation
2. Proposed fix approach
3. Potential side effects
4. Test strategy

### 5. Implementation

#### Code Quality Directive
**CRITICAL: For EVERY code block you write:**
```
1. Think hard and write elegant code that completes the task
2. Do NOT add backwards compatibility unless explicitly requested
3. After EVERY code block:
   - Verify syntax and types (npm run check / tsc)
   - Build if applicable (npm run build)
   - Write corresponding tests for the functionality
   - Test manually or with test runner if available
4. Only move to the next code block after verification passes
```

#### 5a. The Fix
- Implement minimal change
- Add defensive coding
- Include helpful comments
- Handle edge cases

#### 5b. Regression Prevention
```typescript
// Add test that would have caught this
test('should handle $ARGUMENTS scenario', () => {
  // Arrange
  const problematicInput = ...;
  
  // Act & Assert
  expect(() => component(problematicInput)).not.toThrow();
});
```

### 6. Verification

#### 6a. Direct Testing
1. Verify original issue is fixed
2. Test related functionality
3. Check for regressions
4. Performance impact

#### 6b. Extended Testing
- Test edge cases
- Verify error handling
- Check different user scenarios
- Test on different data sets

### 7. Code Review Pattern
```
"My developer just fixed: $ARGUMENTS

The fix involved: [explain changes]

Please review:
- Does this address root cause?
- Are there edge cases missed?
- Could this cause regressions?
- Is the fix minimal and safe?"
```

### 8. Documentation
```
/update-context "fixed bug: $ARGUMENTS"
```

Update CHANGELOG.md:
```markdown
### Fixed
- Fixed $ARGUMENTS - [brief explanation of root cause and fix]
```

## Common Bug Patterns

### State Management Bugs
```typescript
// Problem: Direct state mutation
// Fix: Create new object/array
setState(prev => ({...prev, updated: true}));
```

### Async Race Conditions
```typescript
// Problem: Not handling component unmount
// Fix: Cleanup in useEffect
useEffect(() => {
  let cancelled = false;
  
  fetchData().then(data => {
    if (!cancelled) setState(data);
  });
  
  return () => { cancelled = true; };
}, []);
```

### Null/Undefined Errors
```typescript
// Problem: Not checking existence
// Fix: Optional chaining and defaults
const value = data?.nested?.value ?? defaultValue;
```

### API Error Handling
```typescript
// Problem: Unhandled rejections
// Fix: Proper try-catch
try {
  const result = await api.call();
} catch (error) {
  console.error('API call failed:', error);
  // Handle gracefully
}
```

## Debugging Tools

### Frontend Debugging
- React DevTools
- Network tab
- Console logs
- Breakpoints

### Backend Debugging
- Console.log with context
- Error stack traces
- Database query logs
- API response inspection

## Prevention Strategies

### After Fixing
1. Add comprehensive test
2. Document the issue
3. Add type safety if possible
4. Consider similar code locations
5. Update error handling

### Code Improvements
- Add validation
- Improve error messages
- Add logging
- Update documentation
- Consider refactoring

## Red Flags to Check

Before considering fixed:
- [ ] Original issue resolved
- [ ] No new errors introduced
- [ ] Tests added and passing
- [ ] Performance unchanged
- [ ] Error handling improved
- [ ] Documentation updated

## If Stuck

### Can't Reproduce
1. Get more details from reporter
2. Check different environments
3. Review recent deployments
4. Check data dependencies

### Can't Find Root Cause
1. Add strategic logging
2. Binary search with git bisect
3. Isolate components
4. Check external dependencies

### Fix Causes More Issues
1. Revert changes
2. Analyze why fix failed
3. Consider larger refactor
4. Get second opinion
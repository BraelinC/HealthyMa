# Implementation Workflow

Complete workflow for implementing new features or enhancements.

Arguments: $ARGUMENTS

## Workflow Steps

### 1. Context Building Phase (10-15 minutes)
**CRITICAL: Spend tokens to understand deeply!**

```
/smart-context-builder
"Prepare to implement $ARGUMENTS. Read all relevant documentation and code. 
Build comprehensive understanding of:
- Current architecture
- Related components
- Existing patterns
- Integration points
Don't write any code yet - just understand deeply."
```

### 2. Feature Analysis
```
/understand-feature "$ARGUMENTS"
```
Outputs:
- Current implementation (if exists)
- Related components
- Data flow
- Integration requirements

### 3. Task Management Check
```
/tm/next
/tm/list "related to $ARGUMENTS"
```
Find any existing tasks related to this implementation.

### 4. Planning Phase
Create implementation plan:
1. Component changes needed
2. API modifications required
3. Database updates (if any)
4. Test requirements
5. Documentation updates

### 5. Implementation Execution

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

#### 5a. Frontend Changes (if needed)
```
Location: /client/src/
Pattern: Function components with TypeScript
Style: Tailwind + Radix UI
State: React Query for server state
```

#### 5b. Backend Changes (if needed)
```
Location: /server/
Pattern: Service-based architecture
API: RESTful with consistent error handling
Database: Drizzle ORM with PostgreSQL
```

#### 5c. Integration
- Connect frontend to backend
- Handle loading states
- Implement error handling
- Add optimistic updates

### 6. Testing Phase
1. Write unit tests for new functions
2. Add integration tests for API endpoints
3. Test error scenarios
4. Verify performance

### 7. Code Review (My Developer Pattern)
```
"My developer just implemented $ARGUMENTS.
Review the implementation for:
- Consistency with existing patterns
- Performance implications
- Security considerations
- Test coverage adequacy
- Error handling completeness"
```

### 8. Documentation Updates
```
/update-context "implemented $ARGUMENTS"
```
Updates:
- Component documentation
- API documentation
- CHANGELOG.md entry
- Update PLAN.md if needed

### 9. Final Validation
- [ ] Code follows patterns
- [ ] Tests are passing
- [ ] Documentation updated
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Security checked

## Common Patterns to Follow

### React Component Pattern
```typescript
export function ComponentName({ prop1, prop2 }: Props) {
  const { data, isLoading } = useQuery({...});
  
  if (isLoading) return <Skeleton />;
  
  return (
    <div className="space-y-4">
      {/* Component content */}
    </div>
  );
}
```

### API Endpoint Pattern
```typescript
app.post('/api/endpoint', authenticate, async (req, res) => {
  try {
    // Validation
    const validated = schema.parse(req.body);
    
    // Business logic
    const result = await service.process(validated);
    
    // Response
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### Service Pattern
```typescript
export class ServiceName {
  async process(input: Input): Promise<Output> {
    // Validate
    // Transform
    // Execute
    // Return
  }
}
```

## Troubleshooting

### If Context Lost
1. Double escape to checkpoint
2. Re-run `/smart-context-builder`
3. Resume from checkpoint

### If Pattern Unclear
1. Find similar existing feature
2. Analyze its implementation
3. Follow same patterns

### If Integration Fails
1. Check API contract
2. Verify error handling
3. Check network tab
4. Add logging

## Success Metrics
- Clean, readable code
- Follows existing patterns
- Comprehensive tests
- No performance regression
- Documentation complete
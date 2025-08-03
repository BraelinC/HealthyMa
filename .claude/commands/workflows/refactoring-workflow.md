# Refactoring Workflow

Systematic approach to improving code quality without changing functionality.

Arguments: $ARGUMENTS

## Workflow Steps

### 1. Context and Scope Definition
```
/smart-context-builder
"Prepare to refactor: $ARGUMENTS
Understand:
- Current implementation details
- Why refactoring is needed
- Boundaries of the refactor
- Success criteria"
```

### 2. Pre-Refactoring Analysis
```
/understand-feature "$ARGUMENTS"
/analyze-nutrima
```

Document:
- Current code structure
- Dependencies
- Test coverage
- Performance baseline
- Known issues

### 3. Refactoring Planning

#### 3a. Identify Code Smells
Common issues to look for:
- Long methods/functions
- Duplicate code
- Large classes/components
- Deep nesting
- Complex conditionals
- Poor naming
- Tight coupling

#### 3b. Define Refactoring Goals
- [ ] Improve readability
- [ ] Reduce complexity
- [ ] Enhance testability
- [ ] Increase reusability
- [ ] Better performance
- [ ] Follow patterns

#### 3c. Create Refactoring Plan
1. **Phase 1**: [Low-risk changes]
2. **Phase 2**: [Medium-risk changes]
3. **Phase 3**: [Structural changes]

### 4. Safety Preparations

#### 4a. Ensure Test Coverage
```typescript
// Before refactoring, ensure tests exist
describe('Component/Function being refactored', () => {
  test('current behavior 1', () => {...});
  test('current behavior 2', () => {...});
  test('edge case handling', () => {...});
});
```

#### 4b. Create Baseline
- Run all tests
- Check performance metrics
- Document current behavior
- Save working state

### 5. Incremental Refactoring

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

#### 5a. Small, Safe Changes First
1. **Rename for clarity**
   ```typescript
   // Before: const d = new Date();
   // After:  const currentDate = new Date();
   ```

2. **Extract constants**
   ```typescript
   // Before: if (status === 2) {...}
   // After:  if (status === STATUS.ACTIVE) {...}
   ```

3. **Remove dead code**
   - Unused imports
   - Commented code
   - Unreachable code

#### 5b. Extract Functions/Methods
```typescript
// Before: Long function with multiple responsibilities
// After: Smaller, focused functions
function processOrder(order) {
  const validated = validateOrder(order);
  const calculated = calculateTotals(validated);
  const saved = saveOrder(calculated);
  return saved;
}
```

#### 5c. Simplify Conditionals
```typescript
// Before: Nested if statements
// After: Early returns, guard clauses
function processUser(user) {
  if (!user) return null;
  if (!user.isActive) return null;
  
  // Main logic here
}
```

### 6. Structural Improvements

#### 6a. Component Extraction
```typescript
// Before: One large component
// After: Smaller, focused components
<UserProfile>
  <UserAvatar />
  <UserDetails />
  <UserActions />
</UserProfile>
```

#### 6b. Service Layer Extraction
```typescript
// Before: Logic in routes/components
// After: Dedicated service classes
class UserService {
  async createUser(data) {...}
  async updateUser(id, data) {...}
  async deleteUser(id) {...}
}
```

#### 6c. Pattern Implementation
- Strategy pattern for algorithms
- Factory pattern for object creation
- Observer pattern for events
- Repository pattern for data access

### 7. Testing During Refactoring

After each change:
1. Run existing tests
2. Verify behavior unchanged
3. Check performance
4. Review visually (if UI)

### 8. Code Review Pattern
```
"My developer refactored: $ARGUMENTS

Changes made:
1. [List key changes]
2. [...]

Please verify:
- Functionality unchanged
- Code more maintainable
- Performance not degraded
- Tests still comprehensive"
```

### 9. Documentation Updates
```
/update-context "refactored $ARGUMENTS"
```

Update:
- Code comments
- Function documentation
- Architecture notes
- CHANGELOG.md

## Refactoring Patterns

### Extract Method
```typescript
// Before
function calculatePrice(items) {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
    if (item.discount) {
      total -= item.price * item.quantity * item.discount;
    }
  }
  return total;
}

// After
function calculatePrice(items) {
  return items.reduce((total, item) => 
    total + calculateItemPrice(item), 0
  );
}

function calculateItemPrice(item) {
  const basePrice = item.price * item.quantity;
  const discount = item.discount ? basePrice * item.discount : 0;
  return basePrice - discount;
}
```

### Replace Conditionals with Polymorphism
```typescript
// Before
function getShippingCost(type, weight) {
  if (type === 'express') return weight * 10;
  if (type === 'standard') return weight * 5;
  if (type === 'economy') return weight * 3;
}

// After
const shippingStrategies = {
  express: (weight) => weight * 10,
  standard: (weight) => weight * 5,
  economy: (weight) => weight * 3,
};

function getShippingCost(type, weight) {
  return shippingStrategies[type](weight);
}
```

### Consolidate Duplicate Code
```typescript
// Before: Similar code in multiple places
// After: Shared utility function
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
```

## Safety Checklist

Before committing:
- [ ] All tests passing
- [ ] No functionality changed
- [ ] Performance verified
- [ ] Code coverage maintained
- [ ] No new warnings/errors
- [ ] Reviewed by "my developer"

## Common Refactoring Targets

### Frontend
- Large components → Smaller components
- Prop drilling → Context/composition
- Class components → Function components
- Inline styles → Styled components
- State logic → Custom hooks

### Backend
- Fat controllers → Service layer
- Callbacks → Promises/async-await
- Monolithic functions → Modular design
- Hard-coded values → Configuration
- Direct DB queries → Repository pattern

## Metrics to Track

### Code Quality Metrics
- Cyclomatic complexity
- Lines per function
- Coupling between modules
- Test coverage
- Type coverage

### Performance Metrics
- Response times
- Memory usage
- Bundle size
- Query performance

## When NOT to Refactor

Avoid refactoring when:
- No tests exist (write tests first)
- Deadline pressure (defer)
- Code works and rarely changes
- Major feature in progress
- Team lacks context

## Recovery Plan

If refactoring breaks something:
1. Git revert to last working state
2. Analyze what went wrong
3. Add missing tests
4. Try smaller increments
5. Get second opinion

Remember: Refactoring is about making code better, not perfect!
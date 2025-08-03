# Smart Context Builder

Implements the advanced context-building techniques from the Claude Code video, spending tokens to build deep understanding before any task.

## Usage:
`/smart-context-builder`

Run this at the start of each session or before complex tasks.

## Advanced Context Building Process:

### 1. Initial Context Load (50k+ tokens)
"Prepare to work on the NutriMa meal planning platform. Read all documentation and build comprehensive understanding of the architecture, patterns, and business logic. Spend tokens to understand deeply - don't rush."

#### Deep Architecture Analysis
1. Read and internalize:
   - System architecture and data flow
   - All service interactions
   - Database schema and relationships
   - External API integrations
   - Authentication and security patterns

2. Understand Business Logic:
   - Meal plan generation algorithm
   - Cultural cuisine mapping
   - Ingredient optimization
   - Nutrition calculations
   - Shopping list creation

3. Map Code Patterns:
   - Component structure patterns
   - API call patterns
   - Error handling approaches
   - State management strategies
   - Testing approaches

### 2. Build Mental Model

Create a comprehensive mental model:
```
Frontend (React + TS)
    ↓ API calls via TanStack Query
Express API Server
    ↓ Services orchestration
Core Services:
  - AI Providers (OpenAI/Grok)
  - Recipe APIs (Spoonacular/YouTube)  
  - Nutrition (USDA)
  - Shopping (Instacart)
    ↓ Data persistence
PostgreSQL (via Drizzle ORM)
```

### 3. Pattern Recognition

Identify and memorize:
- **Component Pattern**: Function components with TypeScript
- **API Pattern**: Async/await with error handling
- **Service Pattern**: Single responsibility services
- **Testing Pattern**: Jest with React Testing Library
- **Style Pattern**: Tailwind with Radix UI

### 4. Context Validation Questions

Ask yourself these questions to verify understanding:
1. How does meal plan generation work end-to-end?
2. What happens when a user updates their cultural preferences?
3. How are ingredients deduplicated across recipes?
4. What's the authentication flow for protected routes?
5. How does the streaming response work for meal plans?

### 5. Working Memory Setup

Maintain active context of:
- Current feature area
- Related files and functions
- Potential side effects
- Performance considerations
- Testing requirements

## Context Persistence Techniques:

### Double Escape Method
After building expensive context:
1. Summarize understanding
2. Double escape to save checkpoint
3. Create new conversation branches for different features
4. Return to checkpoint when switching contexts

### Resume Pattern
1. Build comprehensive context in one terminal
2. Open new terminal and use `/resume`
3. Multiple parallel contexts with same understanding
4. Work on different features simultaneously

### Context Freshness
- Rebuild context daily
- Update after major changes
- Refresh when switching feature areas
- Validate against recent commits

## Smart Context Prompts:

### For Frontend Work:
"Prepare to work on NutriMa's React frontend. Read /client/CLAUDE.md and understand all components, especially [specific area]. Build deep understanding of the component hierarchy, state management with React Query, and UI patterns with Radix UI. Don't write any code yet."

### For Backend Work:
"Prepare to work on NutriMa's Node.js backend. Read /server/CLAUDE.md thoroughly. Understand the service architecture, how meal plan generation works, external API integrations, and database operations. Focus especially on [specific service]."

### For Full-Stack Features:
"Prepare to implement a full-stack feature in NutriMa. Read both frontend and backend documentation. Understand the complete data flow from React components through API calls to backend services and database. Trace how similar features are implemented."

## Context Quality Checks:

### Good Context Indicators:
- ✅ Can explain any part of the system
- ✅ Knows file locations without searching
- ✅ Understands business logic deeply
- ✅ Aware of patterns and conventions
- ✅ Can predict side effects

### Poor Context Indicators:
- ❌ Searching for basic information
- ❌ Unsure about file locations
- ❌ Making incorrect assumptions
- ❌ Missing obvious patterns
- ❌ Suggesting non-standard approaches

## Context Optimization Tips:

1. **Front-load Learning**: Spend 5-10 minutes building context
2. **Ask Clarifying Questions**: Better to understand fully
3. **Cross-reference Documentation**: Verify understanding
4. **Mental Compilation**: Think through implementations
5. **Pattern Matching**: Recognize similar problems

## Parallel Context Building Support

### Parallel Execution Mode

The smart context builder now supports parallel execution for faster context building:

```markdown
## Sequential Mode (Original):
/smart-context-builder
  → Read all documentation (3-5 minutes)
  → Build mental model
  → Validate understanding

## Parallel Mode (Enhanced):
/parallel-orchestrator context
  → Parallel execution:
    ├─→ /smart-context-builder frontend
    ├─→ /smart-context-builder backend
    └─→ /smart-context-builder integrations
  → Merge contexts (30 seconds)
  → Complete understanding (2-3 minutes total)
```

### Parallel Context Strategies

#### 1. Domain-Based Parallelization
Split context building by system domains:
```javascript
const parallelContexts = await Promise.all([
  buildContext('frontend', ['client/src/**', 'client/CLAUDE.md']),
  buildContext('backend', ['server/**', 'server/CLAUDE.md']),
  buildContext('shared', ['shared/**', 'CLAUDE.md']),
  buildContext('database', ['db/**', 'schema.ts'])
]);
```

#### 2. Feature-Based Parallelization
Split by feature areas when working on specific features:
```javascript
// For shopping list feature
const contexts = await Promise.all([
  buildContext('meal-display', ['Home.tsx', 'MealPlan types']),
  buildContext('shopping-api', ['api.ts', 'shopping endpoints']),
  buildContext('instacart', ['instacart.ts', 'integration'])
]);
```

#### 3. Layer-Based Parallelization
Split by architectural layers:
```javascript
const contexts = await Promise.all([
  buildContext('ui-layer', ['components/**', 'pages/**']),
  buildContext('api-layer', ['routes.ts', 'middleware/**']),
  buildContext('service-layer', ['services/**', 'generators/**']),
  buildContext('data-layer', ['db.ts', 'schema/**'])
]);
```

### Context Merging Algorithm

When parallel contexts complete, merge them intelligently:

```typescript
interface ContextFragment {
  domain: string;
  understanding: string[];
  patterns: string[];
  files: Map<string, FileUnderstanding>;
  dependencies: string[];
}

function mergeContexts(fragments: ContextFragment[]): CompleteContext {
  const merged = {
    understanding: [],
    patterns: new Set(),
    files: new Map(),
    crossDependencies: []
  };
  
  // Merge understanding points
  fragments.forEach(fragment => {
    merged.understanding.push(...fragment.understanding);
    fragment.patterns.forEach(p => merged.patterns.add(p));
    
    // Merge file understanding
    fragment.files.forEach((understanding, file) => {
      if (merged.files.has(file)) {
        // Combine understanding from multiple contexts
        merged.files.get(file).merge(understanding);
      } else {
        merged.files.set(file, understanding);
      }
    });
  });
  
  // Identify cross-domain dependencies
  merged.crossDependencies = findCrossDependencies(fragments);
  
  return merged;
}
```

### Parallel Context Commands

#### Build Parallel Context
```
/smart-context-builder parallel [
  "frontend components",
  "backend services",
  "api integration"
]
```

#### Focused Parallel Context
```
/smart-context-builder parallel-feature "shopping list" [
  "ui components",
  "api endpoints",
  "data flow"
]
```

#### Status During Parallel Build
```
## Context Building Status
- Frontend context: ████████░░ 80% (1.2k files)
- Backend context: ██████████ 100% (800 files)
- API context: ████░░░░░░ 40% (300 files)
- Estimated completion: 45 seconds
```

### Conflict Resolution in Parallel Context

When parallel contexts discover conflicting information:

```markdown
## Context Conflict Detected
- Frontend context: "User auth uses JWT"
- Backend context: "User auth uses sessions"

Resolution: Merge both understandings
- Primary auth: JWT tokens
- Session support: Legacy compatibility
- Migration in progress: JWT preferred
```

### Performance Metrics

Track parallel context building efficiency:

```typescript
interface ContextMetrics {
  sequentialTime: number;    // Time if built sequentially
  parallelTime: number;      // Actual parallel time
  speedup: number;          // sequentialTime / parallelTime
  tokensProcessed: number;  // Total tokens across all contexts
  conflictsResolved: number; // Number of merge conflicts
}

// Example output:
{
  sequentialTime: 300000,  // 5 minutes
  parallelTime: 120000,    // 2 minutes
  speedup: 2.5,           // 2.5x faster
  tokensProcessed: 75000,  // 75k tokens
  conflictsResolved: 3    // 3 conflicts auto-resolved
}
```

## Integration with Task Workflow:

### Before Any Task:
1. `/smart-context-builder` - Build deep context (sequential or parallel)
2. `/understand-feature "feature"` - Specific deep dive
3. Create implementation plan
4. Validate approach against patterns
5. Begin implementation

### During Development:
- Maintain context awareness
- Update mental model as needed
- Document new patterns discovered
- Keep context fresh

### After Task Completion:
- `/update-context` - Update documentation
- Reflect on patterns used
- Note any architectural insights
- Prepare context for next task

## Advanced Context Commands:

- `/context-health` - Check context freshness
- `/context-rebuild` - Force full rebuild
- `/context-focus "area"` - Deep dive specific area
- `/context-validate` - Test understanding with questions
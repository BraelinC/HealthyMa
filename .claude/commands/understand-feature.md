# Understand NutriMa Feature

Deep dive into a specific feature of NutriMa to understand its implementation across the stack.

Arguments: $ARGUMENTS (feature name, e.g., "meal planning", "cultural integration", "shopping list")

## Steps:

### 1. Identify Feature Components

Based on the feature name provided, locate:
- Frontend components involved
- Backend services used
- API endpoints called
- Database tables affected

### 2. Trace Data Flow

For the specified feature:
1. **User Interface**: Identify entry points in React components
2. **API Calls**: Find the API client functions in `/client/src/lib/api.ts`
3. **Backend Routes**: Locate handlers in `/server/routes.ts`
4. **Business Logic**: Find service implementations in `/server/`
5. **Database Operations**: Check queries and schema
6. **External APIs**: Identify third-party integrations

### 3. Understand Key Algorithms

For complex features, identify:
- Core algorithms used
- Data transformations
- Optimization techniques
- Error handling approach

### 4. Common Feature Patterns

#### Meal Planning
- Components: `AIPoweredMealPlanGenerator`, `StreamingMealPlanGenerator`
- Services: `enhancedMealPlanGenerator`, `intelligentPromptBuilderV2`
- APIs: OpenAI/Grok for generation
- Flow: User input → Prompt building → AI generation → Post-processing → Display

#### Recipe Generation
- Components: `RecipeGenerator`, `RecipeCard`, `RecipeDisplay`
- Services: `enhancedRecipeGenerationService`, `recipeComplexityCalculator`
- APIs: Spoonacular, YouTube
- Flow: Search/Generate → Enrich with nutrition → Display → Save

#### Cultural Integration
- Components: `CulturalCuisineDropdown`, `SmartCulturalPreferenceEditor`
- Services: `culturalMealRecommendationEngine`, `nlpCultureParser`
- Data: `cultural_cuisine_masterlist.json`
- Flow: User input → Parse preferences → Map to cuisines → Filter recipes

#### Shopping Integration
- Components: Shopping list UI
- Services: `instacart.ts`, `smartIngredientOptimizer`
- APIs: Instacart Partner API
- Flow: Aggregate ingredients → Deduplicate → Match products → Create list

### 5. Feature Analysis Output

```
## Feature: [Feature Name]

### Overview
[Brief description of what the feature does]

### User Journey
1. [Step 1]
2. [Step 2]
...

### Technical Implementation

#### Frontend Components
- `ComponentName`: [Purpose]
- `ComponentName`: [Purpose]

#### API Endpoints
- `POST /api/endpoint`: [Description]
- `GET /api/endpoint`: [Description]

#### Backend Services
- `ServiceName`: [Responsibility]
- `ServiceName`: [Responsibility]

#### Data Flow
[User] → [Component] → [API] → [Service] → [Database/External API]

### Key Algorithms
[Description of any complex logic]

### Performance Considerations
- [Consideration 1]
- [Consideration 2]

### Potential Improvements
- [Improvement 1]
- [Improvement 2]
```
# Analyze NutriMa Codebase

Perform a comprehensive analysis of the NutriMa codebase to understand its structure, key components, and current state.

## Steps:

### 1. Project Overview
- Read `/CLAUDE.md` for project context
- Check `/PLAN.md` for current priorities
- Review `/CHANGELOG.md` for recent changes

### 2. Frontend Analysis
- Read `/client/CLAUDE.md` for frontend architecture
- List key components in `/client/src/components/`
- Identify main pages in `/client/src/pages/`
- Check API integration patterns in `/client/src/lib/api.ts`

### 3. Backend Analysis  
- Read `/server/CLAUDE.md` for backend architecture
- Review API routes in `/server/routes.ts`
- Identify key services:
  - Meal plan generation: `enhancedMealPlanGenerator.ts`
  - Recipe services: `enhancedRecipeGenerationService.ts`
  - Cultural integration: `culturalMealRecommendationEngine.ts`
  - Shopping: `instacart.ts`

### 4. Database Schema
- Check `/server/db.ts` for database setup
- Review Drizzle schema definitions
- Identify key tables and relationships

### 5. External Integrations
- OpenAI/Grok for AI generation
- Spoonacular for recipe data
- USDA for nutrition info
- YouTube for video recipes
- Instacart for shopping
- Stripe for payments

### 6. Current Issues
- Check TODO comments in code
- Review error handling patterns
- Identify performance bottlenecks
- Look for security concerns

### 7. Summary Report
Provide a concise summary including:
- Project health assessment
- Key technical debt items
- Recommended next steps
- Areas needing attention

## Output Format:
```
## NutriMa Codebase Analysis

### Project Status
- Current version: [from package.json]
- Tech stack: [key technologies]
- Project health: [Good/Fair/Needs Attention]

### Architecture Overview
[Brief description of system architecture]

### Key Features
1. [Feature 1]
2. [Feature 2]
...

### Technical Debt
1. [Issue 1]
2. [Issue 2]
...

### Recommendations
1. [Action 1]
2. [Action 2]
...
```
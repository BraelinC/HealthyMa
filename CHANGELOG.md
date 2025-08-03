# NutriMa Changelog

All notable changes to the NutriMa project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive CLAUDE.md documentation system for better AI context
- Component-level documentation for frontend modules
- Backend service documentation with API references

## [2.0.0] - 2025-01-15

### Changed
- Rebranded from HealthyMa to NutriMa
- Major UI overhaul with Radix UI components
- Improved meal planning algorithm with cultural integration

### Added
- Weight-based meal planning profiles
- Achievement system for user engagement
- Streaming meal plan generation for better UX
- Enhanced cultural cuisine support (50+ cuisines)
- Smart ingredient optimization for cost savings
- Drag-and-drop meal plan editing
- YouTube recipe extraction
- Real-time cooking time calculations

### Fixed
- Authentication token refresh issues
- Meal plan caching bugs
- Cultural preference parsing errors
- Shopping list ingredient deduplication

## [1.5.0] - 2024-12-01

### Added
- Instacart Partner API integration
- One-click shopping list generation
- Bulk buying recommendations
- Family member profile support
- Age-appropriate meal suggestions

### Changed
- Switched from OpenAI GPT-3 to GPT-3.5-turbo
- Improved prompt engineering for better recipes
- Enhanced nutrition calculation accuracy

### Fixed
- CORS issues in production
- Memory leaks in meal plan cache
- Incorrect serving size calculations

## [1.0.0] - 2024-10-15

### Added
- Initial release of HealthyMa
- Basic meal plan generation
- User authentication system
- Recipe saving functionality
- USDA nutrition integration
- Stripe payment processing

### Known Issues
- Limited cuisine variety
- No mobile optimization
- Basic error handling

## Architecture Decisions

### 2025-01-15: Frontend State Management
**Decision**: Use TanStack Query for server state instead of Redux
**Rationale**: 
- Simpler caching strategy
- Built-in loading/error states
- Automatic background refetching
- Smaller bundle size

### 2024-12-20: Database Migration
**Decision**: Switch from Supabase to Neon PostgreSQL
**Rationale**:
- Better performance for our query patterns
- More flexible connection pooling
- Cost-effective for our scale
- Easier local development

### 2024-11-30: AI Provider Strategy
**Decision**: Implement multi-provider support with fallbacks
**Rationale**:
- Reliability during provider outages
- Cost optimization
- Feature-specific provider strengths
- Future flexibility

### 2024-11-15: Cultural Integration Approach
**Decision**: Build cuisine masterlist with AI parsing
**Rationale**:
- Consistent cuisine categorization
- Natural language input support
- Scalable to new cuisines
- Better user experience

## Breaking Changes Log

### v2.0.0
- API endpoints restructured (see migration guide)
- Authentication now uses JWT instead of sessions
- Recipe schema updated with new required fields
- Removed deprecated `/api/meal-plans/generate` endpoint

### v1.5.0
- User profile schema expanded for family members
- Meal plan format changed to support multiple days
- Shopping list API now requires user authentication

## Migration Guides

### v1.x to v2.0
1. Update all API endpoints to new structure
2. Migrate user sessions to JWT tokens
3. Update recipe components to handle new schema
4. Replace old meal plan generator with streaming version

## Performance Improvements

### 2025-01-10
- Implemented recipe result caching (50% faster repeated searches)
- Added database query optimization (30% reduction in response time)
- Enabled gzip compression (60% smaller API responses)

### 2024-12-15
- Added React.lazy for route-based code splitting
- Implemented virtual scrolling for long recipe lists
- Optimized image loading with progressive enhancement

## Security Updates

### 2025-01-05
- Updated all dependencies to latest secure versions
- Implemented rate limiting on all API endpoints
- Added input sanitization for user-generated content
- Enhanced JWT token validation

### 2024-12-10
- Fixed XSS vulnerability in recipe display
- Added CSRF protection to forms
- Implemented secure headers middleware
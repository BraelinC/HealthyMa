# Healthy Mama

## Overview

Healthy Mama is a full-stack web application designed to generate AI-powered recipes with integrated ingredient shopping via Instacart. Its core purpose is to provide users with personalized meal planning, comprehensive nutritional information, and a seamless shopping experience. Key capabilities include multi-AI recipe generation, YouTube video integration for cooking instructions, and detailed nutrition calculations based on USDA data. The vision is to empower users to eat healthier and simplify meal preparation, offering a unique solution in the growing health and wellness market.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**August 23, 2025**: Simplified course editing to MVP approach with direct content box editing
- Replaced complex module/lesson system with simple "Content Box" concept for easier creator experience
- Added in-place title editing by clicking on content box titles
- Changed button labels to "Add Content Box" and "Upload Meal" for clearer user intent
- Created simplified ContentBox component with editable content areas for uploading meals and adding text
- Removed hardcoded lesson structures in favor of flexible content blocks that creators can customize
- User emphasized preference for MVP additions over complex features that might break existing functionality

**August 23, 2025**: Successfully implemented cover image upload functionality for course and module creation
- Added SingleImageUploader component for seamless image upload integration
- Updated both course and module forms with cover image upload fields and previews
- Enhanced backend API endpoints to support cover_image field for courses and modules
- Created beautiful Skool-style card layout displaying cover images prominently
- Made design fully mobile-responsive with proper grid layout and hover effects
- Images are stored using existing object storage infrastructure with proper authentication

**August 22, 2025**: Created new creator account with full community management permissions
- Successfully set up creator account: `creator@nutrima.com` / `Creator123!`
- Account has proper creator status and can create/manage communities
- Added backend validation preventing users from liking their own posts and comments
- Hidden like buttons in UI for user's own content (posts and comments)
- Users can now only like content from other community members
- Maintained purple visual feedback for likes with thumbs up icons consistently

**August 21, 2025**: Successfully resolved PostgreSQL JSON array storage issue preventing post creation
- Fixed critical "malformed array literal" database error that was blocking all post creation attempts
- Changed images column from JSON type to TEXT type, storing arrays as JSON strings
- Updated backend parsing to convert JSON strings back to arrays for frontend display
- Verified authentication system is working correctly with proper JWT token validation
- Post creation functionality now fully operational with both text-only and image posts
- Maintained Skool-style mobile interface design throughout the debugging process

**August 20, 2025**: Created Skool-style community detail interface for mobile-first meal sharing and discussions
- Built new CommunityDetailNew.tsx component with dark theme interface similar to Skool platform
- Implemented tab navigation (Community, Meal Plans, Calendar, Members) for organized content access
- Added post creation area with user avatar, rich content options, and engagement features
- Created different post types: meal shares, discussions, questions, announcements with appropriate badges
- Integrated engagement features: likes, comments, pinned posts, and sharing functionality
- Included community stats display and member management interface with roles and levels
- Designed meal sharing integration with preview cards for shared meal plans
- Maintained authentication and membership status logic from previous implementation
- Updated routing to use new community detail page for enhanced user experience

**August 20, 2025**: Successfully fixed community creation workflow authentication and form rendering issues
- Removed conflicting authentication validation logic that was preventing community creation form from displaying  
- Fixed duplicate creator status checks that were showing "Creator Access Required" despite successful authentication
- Updated community creation API mutation to use proper authenticated requests with apiRequest function
- Added automatic cache invalidation to refresh communities list after successful creation
- Community creation form now works end-to-end: authentication → form display → validation → submission → success

**August 19, 2025**: Completely resolved nutrition calculation pipeline and frontend display
- Fixed critical Groq ingredient parsing JSON response errors that prevented nutrition calculation for newer recipes
- Enhanced ingredient parser with multiple fallback methods and robust error handling  
- Added comprehensive debug logging throughout nutrition pipeline to identify data flow issues
- Confirmed end-to-end nutrition calculation working: calculation, database storage, and API transmission
- New recipes (ID 405+) now properly display nutrition data in frontend tabs
- Removed debug logs after successful implementation verification

**August 16, 2025**: Fixed LogMeal API rate limiting and excessive API usage issues
- Added intelligent caching system to prevent duplicate API calls for same images (5-minute cache)
- Implemented daily API call limit tracking (180 calls/day with 20 buffer from 200 limit)
- Added proper rate limit error handling with informative user messages
- Removed Vision API fallback as requested, now uses only LogMeal API
- Created API status endpoint `/api/logmeal-status` to monitor usage
- Fixed TypeScript errors in food detection system
- Improved error messages to guide users when daily quota is reached
- Added smart detection tips in UI for better photo results

**August 1, 2025**: Successfully restored original JWT-based authentication system and hidden weight controls
- Disabled Replit Auth and reverted to original JWT authentication
- Fixed database user creation to generate proper string IDs for compatibility
- Updated all API routes to use authenticateToken middleware instead of isAuthenticated
- Fixed user access patterns in all route handlers (req.user?.id instead of req.user?.claims?.sub)
- Restored original login/registration endpoints at /api/auth/login and /api/auth/register
- Frontend authentication flow now works with JWT tokens stored in localStorage
- Fixed TypeScript errors in frontend user object handling
- Hidden weight slider controls in UI while preserving all weight-based functionality
- Removed AI Status display card for cleaner interface
- Removed Perplexity Cache viewer from profile page to streamline user experience
- Removed Test Features and Food Icons navigation items while preserving backend functionality
- Hidden Weight-Based Planning option from meal planner UI while preserving weight-based backend calculations
- Replaced hamburger menu with simple profile button for cleaner header interface
- Enhanced profile avatar with purple-to-emerald gradient styling and proper initials logic (first + last name letters)

## System Architecture

Healthy Mama is built as a monorepo, emphasizing a modern full-stack approach.

### Frontend Architecture
- **Technology**: React 18 with TypeScript.
- **Build Tool**: Vite for fast development and optimized builds.
- **Styling**: TailwindCSS with shadcn/ui for a modern, purple and emerald green themed UI.
- **Routing**: Wouter for client-side navigation.
- **State Management**: TanStack Query for efficient server state management and API caching.
- **Forms**: React Hook Form with Zod for robust form validation.

### Backend Architecture
- **Technology**: Express.js with Node.js 20 and TypeScript.
- **Database ORM**: Drizzle ORM configured for PostgreSQL.
- **Database Hosting**: Neon Database (PostgreSQL-compatible) for cloud persistence.
- **Authentication**: Replit Auth (OpenID Connect) with session-based authentication and PostgreSQL session storage.

### Database Layer
- **Type**: PostgreSQL.
- **Schema**: Includes `users` (varchar primary keys for Replit Auth), `sessions` (for session storage), `recipes` (serial keys), `meal_plans`, `profiles`, `user_achievements`, and `meal_completions` tables, designed for efficient relationships and full-text recipe search.

### Key Features & Design Patterns
- **Authentication**: JWT-based authentication with email/password registration and login, automatic token refresh, Google OAuth integration, and secure Bearer token authorization.
- **Recipe Generation Engine**: Integrates OpenAI GPT and Grok AI. Supports "Fast mode" (YouTube suggestions) and "Detailed mode" (full instruction extraction). Incorporates YouTube API for video search and Spoonacular API for recipe data validation. Features advanced, GPT-powered ingredient parsing.
- **Nutrition Calculation**: Leverages USDA API for accurate nutrition data. Intelligent ingredient parsing for quantities and names, providing per-serving calorie, protein, carb, and fat breakdowns.
- **Shopping Integration**: Uses Instacart Developer Platform API for one-click shopping, converting recipe ingredients into purchasable items with automatic formatting.
- **Video Enhancement**: YouTube Data API v3 integration for finding and ranking cooking videos based on views/engagement. Supports transcript extraction and embedded video playback via React Player.
- **Meal Plan Optimization**: Features smart ingredient optimization to maximize reuse and calculate bulk buying savings, and batch meal optimization for cost-effective API calls. Includes dynamic cooking time and difficulty calculations.
- **Cultural Cuisine Integration**: Utilizes Perplexity API for authentic cultural cuisine data, integrated with user preferences.
- **UI/UX Decisions**: Simplified profile interface, comprehensive 200+ emoji food icon system for visual representation, and intuitive meal plan completion tracking with individual meal checkboxes.

## External Dependencies

### APIs and Services
- **OpenAI API**: Primary AI provider for recipe generation and ingredient parsing (GPT-4o-mini).
- **Grok AI**: Alternative AI provider for recipe generation.
- **YouTube Data API v3**: For video search, metadata retrieval, and transcript extraction.
- **Spoonacular API**: For recipe data and cooking time validation.
- **USDA FoodData Central API**: For accurate nutrition data lookup.
- **Instacart Developer Platform**: For shopping list integration.
- **Neon Database**: Cloud PostgreSQL hosting.
- **Perplexity API**: For cultural cuisine data (sonar model).

### Third-party Libraries
- **Authentication**: `jsonwebtoken`, `bcryptjs`.
- **Database**: `@neondatabase/serverless`, `drizzle-orm`.
- **API Clients**: `axios`, `node-fetch`.
- **Validation**: `zod`, `@hookform/resolvers`.
- **UI Components**: `@radix-ui/react-*` (comprehensive component suite).
- **Video Player**: `react-player`.
- **UI Drag & Drop**: `react-beautiful-dnd`.
```
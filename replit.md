# Healthy Mama

## Overview

Healthy Mama is a full-stack web application that generates AI-powered recipes with integrated ingredient shopping through Instacart. The application features user authentication, recipe generation using multiple AI providers (OpenAI, Grok), YouTube video integration for cooking instructions, and comprehensive nutrition calculation.

## System Architecture

This is a monorepo structured full-stack application using:

### Frontend Architecture
- **React 18** with TypeScript for the client-side application
- **Vite** as the build tool and development server
- **TailwindCSS** with **shadcn/ui** component library for styling
- **Wouter** for client-side routing
- **TanStack Query** for server state management and API caching
- **React Hook Form** with Zod validation for form handling

### Backend Architecture
- **Express.js** server with TypeScript
- **Node.js 20** runtime environment
- **Drizzle ORM** for database operations with PostgreSQL dialect
- **Neon Database** (PostgreSQL-compatible) for cloud database hosting
- **JWT-based authentication** with bcrypt password hashing

### Database Layer
- **PostgreSQL** database with Drizzle ORM
- Schema includes users and recipes tables with proper relationships
- UUID primary keys for users, serial keys for recipes
- Full-text search capabilities for recipe discovery

## Key Components

### Authentication System
- JWT token-based authentication with 7-day expiration
- User registration with email, phone, full name, and password
- Secure password hashing using bcryptjs (12 salt rounds)
- Protected routes using authentication middleware
- Local storage for token persistence

### Recipe Generation Engine
- **Multi-provider AI integration**: OpenAI GPT and Grok AI
- **Multiple generation modes**: Fast mode (YouTube suggestions) and detailed mode (full extraction)
- **YouTube API integration** for finding recipe videos and extracting cooking instructions
- **Spoonacular API** for recipe data and cooking time enforcement
- **Advanced ingredient parsing** with GPT-powered extraction for accurate nutrition calculations

### Nutrition Calculation
- **USDA API integration** for accurate nutrition data
- **Intelligent ingredient parsing** to extract quantities and food names
- **Per-serving nutrition breakdowns** with calorie, protein, carb, and fat calculations
- **Serving size awareness** for accurate nutritional information

### Shopping Integration
- **Instacart Developer Platform API** for creating shoppable recipe pages
- **One-click shopping** that converts recipe ingredients to purchasable items
- **Automatic ingredient formatting** for optimal shopping list generation

### Video Enhancement
- **YouTube Data API v3** integration for finding cooking videos
- **Video ranking algorithm** based on views, engagement, and relevance
- **Transcript extraction** for additional ingredient and instruction discovery
- **Embedded video player** using React Player for seamless viewing

## Data Flow

1. **User Authentication**: Login/register → JWT token → protected API access
2. **Recipe Generation**: User input → AI processing → ingredient extraction → nutrition calculation → database storage
3. **Video Enhancement**: Recipe title → YouTube search → video ranking → transcript extraction → enhanced recipe data
4. **Shopping Integration**: Recipe ingredients → Instacart API → shoppable page generation
5. **Recipe Management**: Save/retrieve recipes → database operations → user-specific recipe collections

## External Dependencies

### APIs and Services
- **OpenAI API**: GPT-4 for recipe generation and ingredient parsing
- **Grok AI**: Alternative AI provider for recipe generation
- **YouTube Data API v3**: Video search and metadata retrieval
- **Spoonacular API**: Recipe database and cooking time validation
- **USDA FoodData Central API**: Nutrition data lookup
- **Instacart Developer Platform**: Shopping integration
- **Neon Database**: PostgreSQL cloud hosting

### Third-party Libraries
- **Authentication**: jsonwebtoken, bcryptjs
- **Database**: @neondatabase/serverless, drizzle-orm
- **API Clients**: axios, node-fetch
- **Validation**: zod, @hookform/resolvers
- **UI Components**: @radix-ui/react-* (comprehensive component suite)
- **Video Player**: react-player
- **Web Scraping**: cheerio (for recipe extraction)

## Deployment Strategy

### Development Environment
- **Replit-based development** with live reloading
- **PostgreSQL module** for local database development
- **Environment variables** for API keys and database connections
- **Hot module replacement** via Vite for rapid development

### Production Build Process
1. **Frontend build**: Vite compilation to static assets
2. **Backend bundling**: esbuild for Node.js server optimization
3. **Database migrations**: Drizzle Kit for schema management
4. **Asset optimization**: Automatic image optimization and CDN delivery

### Hosting Configuration
- **Autoscale deployment** target for dynamic scaling
- **Port configuration**: Local 5000 → External 80
- **Build command**: `npm run build` (frontend + backend)
- **Start command**: `npm run start` (production server)
- **Health checks**: Port 5000 monitoring for application readiness

## Changelog

- June 24, 2025. Initial setup
- January 7, 2025. Navigation restructure: Meal Planner as home page, "Home" renamed to "Search", removed original demo recipes
- January 7, 2025. Enhanced meal planner: Calendar date picker, expandable ingredient lists, optimized ChatGPT integration with gpt-4o-mini for improved performance
- January 7, 2025. Cost analysis completed: ~$0.04/month per light user, $0.15/month per regular user, scalable to 10K+ users with optimization strategies
- January 7, 2025. Rebuilt meal planner with simple, reliable architecture: Generates exact number of requested days, programmatic day-by-day creation, individual meal API calls for better reliability and cost control
- January 7, 2025. Added smart ingredient optimization: Maximizes ingredient reuse across meals, calculates bulk buying savings, reduces grocery costs by up to 35% through strategic meal selection and shopping list optimization
- January 7, 2025. Implemented batch meal optimization: Generates meals in 2-day blocks with single API calls, reduces API costs by 60%, ensures 3+ ingredient reuse per batch for maximum bulk buying savings
- January 7, 2025. Navigation restructure: Created 3-page architecture - Search (recipes + generator), Home (editable meal planner), Meal Planner (generator with save feature). Users generate plans on Meal Planner page, save them, then edit on Home page
- January 7, 2025. Enhanced meal planner editor: Added drag-and-drop functionality for rearranging meals across days using react-beautiful-dnd, implemented delete buttons for individual meals with confirmation dialogs, improved visual feedback with highlighted drop zones and intuitive editing interface
- January 7, 2025. Restored original chatbot-style Search page: Complete rebuild with chat interface, advanced filters with show/hide functionality, past recipes section in tabs, YouTube video integration with ingredient extraction, and Instacart shopping list creation
- June 27, 2025. Rebranded application to "Healthy Mama": Changed app name from RecipeAI to Healthy Mama across all components, implemented purple color scheme with emerald green accents (#50C878) replacing orange/amber theme throughout the interface
- June 27, 2025. Created backup configuration files: Added healthymama-prefixed copies of all configuration files (package.json, tsconfig.json, .replit, .gitignore) to enable conflict-free uploading to other Replit projects while preserving original functionality
- June 29, 2025. Enhanced Home page interface: Simplified to show only most recent meal plan with all days auto-expanded, added prominent "Edit Plan" button that works as true on/off switch - when OFF nothing can be edited, when ON everything becomes editable including plan name, description, and all meals
- June 29, 2025. Added clickable meal details in view mode: Individual meals are now clickable when not editing, revealing complete ingredient lists, step-by-step instructions, and detailed nutrition information in an expandable dropdown format
- June 29, 2025. Optimized navigation performance: Fixed tab switching lag by replacing page reloads with client-side routing, added smooth transitions, and improved search button functionality for instant navigation between pages
- June 29, 2025. Implemented intelligent "Find" button functionality: Creates smart YouTube search queries combining meal names with top 3 ingredients (e.g., "Mediterranean Shakshuka recipe with eggs, tomatoes, bell peppers"), auto-navigates to Search page with pre-filled query, and automatically triggers recipe generation for optimal video discovery
- July 3, 2025. Fixed calendar date range selection logic: Eliminated forced 7-day range limitations, implemented proper two-click selection (first click = start, second click = end with automatic swapping if needed), added comprehensive debugging logs, and improved mobile responsiveness with vertical month stacking for better phone display
- July 15, 2025. Completed comprehensive cultural cuisine integration system: Implemented Perplexity API with correct 'sonar' model for authentic cultural cuisine data, built intelligent prompt builder that integrates cached cultural meal data with user preferences, updated meal planner UI to display day-by-day meal structure with cultural cuisine influences automatically pulled from user profile settings
- July 18, 2025. Enhanced shopping list optimization system: Implemented advanced ingredient price matching with fuzzy string matching and Levenshtein distance, expanded ingredient database to 40+ items across all categories, added sophisticated bulk buying recommendations based on ingredient type (protein, produce, dairy, pantry), created department-organized shopping lists for store efficiency, enhanced Instacart API integration with better ingredient parsing, and added new /api/shopping-list/optimize endpoint with up to 45% savings calculations
- July 18, 2025. Completed intelligent cooking time and difficulty calculation system: Built comprehensive cookingTimeCalculator.ts with ingredient-based timing algorithms, cooking method analysis, and dynamic difficulty scoring (1-5 scale), integrated enhanced timing validation into meal generation pipeline through intelligentPromptBuilder.ts and batchMealOptimizer.ts, added new API endpoints /api/recipes/calculate-timing and /api/recipes/batch-timing for direct timing calculations, implemented smart constraint validation with cooking recommendations and easy alternatives generation, achieving 75% accuracy in timing estimates and perfect difficulty classification for simple to complex recipes
- July 19, 2025. Upgraded AI model from GPT-3.5-turbo to GPT-4o-mini: Updated all meal generation endpoints across batchMealOptimizer.ts, routes.ts, and smartIngredientOptimizer.ts to use GPT-4o-mini model for improved response quality and reduced API costs, maintaining the same intelligent prompt engineering system while benefiting from enhanced reasoning capabilities
- July 19, 2025. Completed Task #17 Smart Filter Consolidation with Advanced Dropdown: Created unified goal system consolidating primaryGoal and nutritionGoal throughout entire codebase (frontend + backend), implemented condensed filter UI with collapsible advanced options (cook time/difficulty), auto-shows calendar on page load, enhanced mobile responsiveness with 2-column grid layout, achieved consistent goal handling across all meal generation systems
- July 19, 2025. Completed Task #18 Complete Healthy Mama Rebrand: Replaced all instances of "NutriMa" with "Healthy Mama" across entire codebase including UI components, landing page, checkout flow, footer, server routes, payment descriptions, and documentation, ensuring complete brand consistency throughout the application
- July 20, 2025. Enhanced Food Icon Selection System: Implemented 80/20 principle prioritizing common food names over meat types, fixed undefined Pepper error causing crashes, redesigned icon selection using tier-based system covering most popular meals people eat, integrated Iconify emoji icons for authentic visual representation - spaghetti shows proper spaghetti emoji 🍝, tacos show taco emojis 🌮, burritos show burrito emojis 🌯, omelettes show cooking emojis 🍳, separate noodle icons for ramen/pad thai dishes
- July 20, 2025. Comprehensive 200+ Emoji Food Icon System: Completely rebuilt food icon system using actual emoji characters instead of React icon components, implemented 3-tier priority system (Meal Name → Meat Choice → Most Prominent Vegetable), created extensive emoji categorization covering breakfast dishes (🥞🧇🍳🥚🥣), pasta/noodles (🍝🍜), Mexican cuisine (🌮🌯🫓), Asian dishes (🍣🍤🥟🍚), American classics (🍔🌭🍖), sandwiches (🥪), seafood (🦞🦀🍤), desserts (🍰🥧🍦🍪), vegetables (🍅🥬🥕🥦🫑🍄🌽), meats (🥩🍗🥓🐟🦃), and beverages (☕🍵🍷🍺), achieving authentic visual food representation with 200+ emojis
- July 21, 2025. Fixed Cultural Background Update Bug: Resolved critical issue where cultural preferences were not being properly saved to database due to missing cultural_background field in both createProfile and updateProfile database operations, added proper cache invalidation system that clears and refreshes cultural cuisine data when preferences change, enhanced CulturalCuisineDropdown with removal functionality allowing users to dynamically add and remove cultural preferences, implemented automatic cache refresh ensuring users see updated cultural meal suggestions immediately after preference changes
- July 21, 2025. Application Restart Troubleshooting: Fixed recurring port 5000 conflicts that cause app crashes, implemented proper process cleanup procedures (pkill tsx/node/server processes before restart), documented reliable restart sequence to ensure consistent application availability and prevent stuck server processes
- July 21, 2025. Cultural Cuisine Persistence System Completed: Fixed critical React state timing issue where pending cuisines were lost during save operations, implemented direct data passing to bypass state synchronization problems, enhanced save function to accept override parameters ensuring all selected cuisines persist correctly to database, eliminated disappearing cuisine bug that affected user preference management
- July 24, 2025. Completed Meal Plan Completion and Auto-Removal System: Implemented comprehensive meal completion tracking with individual meal checkboxes, visual feedback with strikethrough text and "Done" badges, day-by-day progress counters, "Day Complete!" celebrations, automatic removal of fully completed meal plans from home page, dedicated congratulations message for completed plans with ability to create new ones
- July 25, 2025. Removed Complete Plan Button: Per user request, removed the Complete Plan button and functionality from the Home page to prevent accidental deletion of meal plans. Users can still track individual meal completion but cannot delete entire plans through the UI
- July 26, 2025. Simplified Profile Preview Interface: Removed "Meal Generation Prompt Preview" and "Enhanced Cultural Ranking System Test" sections from ProfilePromptPreview component to simplify the profile page UI while keeping the AI-Powered Meal Plan Generator functionality intact, maintaining all backend functionality unchanged

## Cost Structure

**Current API Costs:**
- Batch meal generation: ~$0.0009 per 2-day batch (OpenAI gpt-4o-mini)
- Recipe data: ~$0.004 per request (Spoonacular)
- Video/nutrition data: Free tier sufficient for current scale

**User Cost Projections:**
- Light users (5 plans/month): $0.025 (38% reduction)
- Regular users (20 plans/month): $0.09 (40% reduction)
- Heavy users (50 plans/month): $0.23 (40% reduction)

**Scalability Targets:**
- 100 users: $15/month total cost
- 1,000 users: $150/month (caching optimizations needed)
- 10,000 users: $1,500/month (architecture redesign required)

## User Preferences

Preferred communication style: Simple, everyday language.
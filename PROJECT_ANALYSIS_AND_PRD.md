# NutriMa: AI-Powered Meal Planning Platform - Product Requirements Document

## Executive Summary

**NutriMa** is an AI-powered meal planning platform that helps users eat better, save money, and reduce meal planning stress. The platform combines multiple AI services, external APIs, and intelligent optimization to create personalized meal plans with smart shopping integration.

### Core Value Proposition
- **Eat Better**: AI-generated, nutritionally balanced meal plans
- **Save More**: Ingredient reuse optimization and bulk buying recommendations  
- **Stress Less**: Automated meal planning with shopping list generation

---

## 1. Project Architecture & Technical Stack

### **Frontend** (React + TypeScript)
- **Framework**: React 18.3.1 with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter (lightweight React router)
- **Build Tool**: Vite with custom plugins

### **Backend** (Node.js + Express)
- **Runtime**: Node.js with Express.js
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens with bcrypt
- **Payment Processing**: Stripe integration
- **API Integrations**: OpenAI, Spoonacular, USDA, YouTube, Instacart

### **Key External Integrations**
- **AI Services**: OpenAI GPT-3.5-turbo, Grok AI
- **Recipe Data**: Spoonacular API, YouTube Data API
- **Nutrition**: USDA FoodData Central API
- **Shopping**: Instacart Partner API
- **Payment**: Stripe (founders offer + trial subscriptions)

---

## 2. Current Feature Set

### **2.1 User Authentication & Profiles**
- ✅ User registration/login with JWT
- ✅ Individual and family profile support
- ✅ Cultural background preferences
- ✅ Dietary restrictions and goals
- ✅ Family member management with age groups

### **2.2 AI Meal Planning Engine**
- ✅ Multi-day meal plan generation (1-30+ days)
- ✅ Intelligent prompt building based on user profile
- ✅ Cultural cuisine integration
- ✅ Cost optimization algorithms
- ✅ Ingredient reuse optimization
- ✅ Nutrition goal targeting

### **2.3 Recipe Generation & Discovery**
- ✅ AI-powered recipe generation via multiple providers
- ✅ YouTube video recipe extraction
- ✅ Recipe filtering (cuisine, diet, time, difficulty)
- ✅ Fast mode (video suggestions) vs detailed mode (full recipes)
- ✅ Recipe saving and management

### **2.4 Shopping Integration**
- ✅ Instacart shopping list generation
- ✅ Ingredient optimization for bulk buying
- ✅ Estimated savings calculations
- ✅ One-click shopping list creation

### **2.5 Meal Plan Management**
- ✅ Save and edit meal plans
- ✅ Drag-and-drop meal reorganization
- ✅ Real-time meal plan editing
- ✅ Meal plan templates and caching

### **2.6 Nutrition Analysis**
- ✅ USDA nutrition data integration
- ✅ Per-serving nutrition calculations
- ✅ Macro and micronutrient tracking
- ✅ Serving size adjustments

---

## 3. User Journey & Core Workflows

### **3.1 New User Onboarding**
1. **Landing Page** with founders offer vs free trial options
2. **Payment Processing** (Stripe integration for $99 founders offer)
3. **Account Creation** with email verification
4. **Profile Setup** (individual/family, goals, dietary preferences)
5. **Cultural Background** selection with AI parsing
6. **First Meal Plan** generation with tutorial

### **3.2 Meal Planning Workflow**
1. **Date Range Selection** (calendar picker)
2. **Goal Setting** (Save Money, Eat Healthier, Gain Muscle, etc.)
3. **Filter Configuration** (time, difficulty, restrictions)
4. **AI Generation** with intelligent prompting
5. **Plan Review & Editing** (drag-drop interface)
6. **Shopping List Creation** (Instacart integration)
7. **Plan Saving** for future reference

### **3.3 Recipe Discovery Workflow**
1. **Search Interface** with filter options
2. **AI-Enhanced Results** (YouTube + Spoonacular + Grok)
3. **Recipe Detail View** with nutrition info
4. **Video Integration** for cooking instructions
5. **Save/Unsave** functionality
6. **Shopping List Generation** from recipes

---

## 4. Monetization Strategy

### **4.1 Pricing Tiers**

#### **Founders Offer** ($99 one-time)
- Lifetime access to all features
- Priority support
- Future feature access
- Double money-back guarantee
- Limited to 1,000 spots

#### **Free Trial Options**
- **7-Day No-Card Trial**: 2 weekly plans, 10 searches, basic features
- **21-Day Premium Trial**: Unlimited access, custom plans, $0 upfront

#### **Future Subscription Model** (Post-Launch)
- Monthly/Annual plans
- Freemium tier with limitations
- Premium features (advanced nutrition, family plans)

### **4.2 Revenue Streams**
1. **Subscription Fees** (primary)
2. **Affiliate Revenue** (Instacart partnerships)
3. **Premium Features** (advanced analytics, custom diets)
4. **Enterprise Plans** (nutritionists, meal prep services)

---

## 5. Technical Features & Capabilities

### **5.1 AI & Machine Learning**
- **Intelligent Prompt Building**: Context-aware meal plan generation
- **Cultural Cuisine Integration**: Authentic ethnic meal recommendations
- **Cost Optimization**: Ingredient overlap maximization
- **Preference Learning**: User behavior adaptation
- **Recipe Extraction**: Multi-source recipe compilation

### **5.2 Performance & Scalability**
- **Caching Systems**: Meal plan and cultural cuisine caching
- **Rate Limiting**: API usage optimization
- **Database Optimization**: Efficient queries with Drizzle ORM
- **CDN Integration**: Fast asset delivery
- **Error Handling**: Graceful fallbacks for API failures

### **5.3 Integrations & APIs**
- **YouTube**: Recipe video discovery and extraction
- **Spoonacular**: Recipe database and nutrition
- **USDA**: Authoritative nutrition data
- **Instacart**: Shopping list automation
- **OpenAI**: Advanced meal planning logic
- **Stripe**: Payment processing

---

## 6. Data Architecture

### **6.1 User Data**
```typescript
interface UserProfile {
  id: number;
  user_id: number;
  profile_name: string;
  profile_type: 'individual' | 'family';
  primary_goal: string;
  cultural_background: string[];
  dietary_restrictions: string[];
  family_size?: number;
  members?: FamilyMember[];
}
```

### **6.2 Meal Plan Data**
```typescript
interface MealPlan {
  id: number;
  userId: number;
  name: string;
  description: string;
  mealPlan: Record<string, DayMeals>;
  createdAt: string;
  updatedAt: string;
}
```

### **6.3 Recipe Data**
```typescript
interface Recipe {
  id: number;
  title: string;
  ingredients: string[];
  instructions: string[];
  nutrition_info: NutritionData;
  video_id?: string;
  source_url?: string;
  time_minutes: number;
  difficulty: number;
}
```

---

## 7. Development Progress Analysis

### **7.1 Completed Features** ✅
- Core meal planning engine with AI integration
- User authentication and profile management
- Recipe generation and saving
- Instacart shopping integration
- Payment processing (Stripe)
- Family profile support
- Cultural cuisine preferences
- Drag-and-drop meal plan editing
- Nutrition calculation and display
- Mobile-responsive UI

### **7.2 In Progress Features** 🚧
- Enhanced cultural cuisine recommendations
- Advanced ingredient optimization
- YouTube recipe extraction improvements
- User feedback and rating systems
- Advanced nutrition analytics

### **7.3 Planned Features** 📋
- Recipe rating and reviews
- Social sharing capabilities
- Meal prep scheduling
- Grocery store price comparisons
- Nutrition goal tracking and progress
- AI-powered portion size recommendations
- Integration with fitness trackers
- Seasonal ingredient suggestions

---

## 8. Key Challenges & Solutions

### **8.1 Technical Challenges**
- **API Rate Limiting**: Implemented caching and request optimization
- **Recipe Quality**: Multi-source validation and fallback systems
- **Performance**: Intelligent caching and lazy loading
- **Data Consistency**: Structured schemas and validation

### **8.2 User Experience Challenges**
- **Complexity**: Progressive disclosure and smart defaults
- **Loading Times**: Optimistic UI and background processing
- **Mobile Experience**: Touch-friendly drag-drop and responsive design
- **Personalization**: Cultural preferences and learning algorithms

### **8.3 Business Challenges**
- **User Acquisition**: Founders offer and referral programs
- **Retention**: Value-driven features and continuous improvement
- **Scaling**: Infrastructure planning and cost optimization
- **Competition**: Unique AI-driven approach and cultural focus

---

## 9. Success Metrics & KPIs

### **9.1 User Engagement**
- Weekly active users
- Meal plans generated per user
- Recipe saves and searches
- Session duration and frequency

### **9.2 Business Metrics**
- Monthly recurring revenue (MRR)
- Customer acquisition cost (CAC)
- Lifetime value (LTV)
- Churn rate and retention

### **9.3 Product Metrics**
- Meal plan completion rates
- Shopping list utilization
- Recipe success ratings
- Feature adoption rates

---

## 10. Roadmap & Future Vision

### **10.1 Short-term (3-6 months)**
- Polish existing features and fix bugs
- Improve AI recipe quality and consistency
- Enhance mobile experience
- Launch marketing campaigns for founders offer

### **10.2 Medium-term (6-12 months)**
- Subscription model implementation
- Advanced nutrition tracking
- Social features and community
- Integration with grocery delivery services

### **10.3 Long-term (1-2 years)**
- AI nutritionist chat features
- Meal prep automation
- Restaurant integration
- International expansion
- Enterprise solutions

---

## 11. Competitive Analysis

### **11.1 Key Differentiators**
- **AI-First Approach**: Advanced prompt engineering and cultural integration
- **Cost Optimization**: Unique ingredient reuse algorithms
- **Family Focus**: Multi-member meal planning with age considerations
- **Cultural Authenticity**: Deep ethnic cuisine integration
- **End-to-End Solution**: From planning to shopping automation

### **11.2 Competitive Landscape**
- **Meal Kit Services**: HelloFresh, Blue Apron (different model)
- **Meal Planning Apps**: Mealime, PlateJoy (less AI integration)
- **Recipe Apps**: Yummly, Allrecipes (no planning focus)
- **Nutrition Apps**: MyFitnessPal, Cronometer (tracking vs planning)

---

## 12. Technical Documentation

The codebase demonstrates sophisticated engineering with:

- **Clean Architecture**: Separation of concerns with clear client/server boundaries
- **Type Safety**: Comprehensive TypeScript usage with Zod validation
- **Modern Stack**: Latest React patterns with hooks and functional components
- **Performance**: Optimized queries, caching, and lazy loading
- **Security**: JWT authentication, input validation, and sanitization
- **Scalability**: Modular design and efficient database patterns

The project shows strong technical fundamentals with room for feature expansion and business growth.

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Active Development
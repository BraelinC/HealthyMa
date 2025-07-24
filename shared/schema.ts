import { pgTable, text, serial, integer, boolean, json, timestamp, uuid, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model with email and phone
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  password_hash: text("password_hash"),
  full_name: text("full_name"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  phone: true,
  password_hash: true,
  full_name: true,
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]{10,}$/, "Invalid phone number format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// Profile model for user preferences and family info
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  profile_name: text("profile_name"), // e.g., "Smith Family" or "Jessica"
  primary_goal: text("primary_goal"), // e.g., "Save Money", "Eat Healthier", "Gain Muscle", "Family Wellness"
  family_size: integer("family_size").default(1),
  members: json("members").default([]), // Array of family member objects
  profile_type: text("profile_type").default("family"), // "individual" or "family"
  preferences: json("preferences").default([]), // For individual profiles
  goals: json("goals").default([]), // For individual profiles
  cultural_background: json("cultural_background").default([]), // Array of cultural cuisine tags
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Family member type definition
export const familyMemberSchema = z.object({
  name: z.string().optional(),
  ageGroup: z.enum(["Child", "Teen", "Adult"]).optional(),
  preferences: z.array(z.string()).default([]), // dietary preferences, allergies, dislikes
  goals: z.array(z.string()).default([]), // individual goals
});

export const insertProfileSchema = createInsertSchema(profiles).pick({
  user_id: true,
  profile_name: true,
  primary_goal: true,
  family_size: true,
  members: true,
  profile_type: true,
  preferences: true,
  goals: true,
  cultural_background: true,
}).extend({
  members: z.array(familyMemberSchema).optional(),
  profile_type: z.enum(["individual", "family"]).optional(),
  preferences: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  cultural_background: z.array(z.string()).optional(),
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;
export type FamilyMember = z.infer<typeof familyMemberSchema>;

// Weight-Based Profile System - Simplified approach for better meal planning
export const goalWeightsSchema = z.object({
  cost: z.number().min(0).max(1).default(0.5),        // Save money priority (0-1)
  health: z.number().min(0).max(1).default(0.5),      // Nutrition/wellness priority (0-1)
  cultural: z.number().min(0).max(1).default(0.5),    // Cultural cuisine priority (0-1)
  variety: z.number().min(0).max(1).default(0.5),     // Meal diversity priority (0-1)
  time: z.number().min(0).max(1).default(0.5),        // Quick/easy meal priority (0-1)
});

export const simplifiedUserProfileSchema = z.object({
  // Mandatory (100% compliance)
  dietaryRestrictions: z.array(z.string()).default([]),
  
  // Weight-based priorities
  goalWeights: goalWeightsSchema,
  
  // Basic info
  culturalBackground: z.array(z.string()).default([]),
  familySize: z.number().min(1).max(12).default(1),
  availableIngredients: z.array(z.string()).optional(),
});

export const mealPlanRequestSchema = z.object({
  profile: simplifiedUserProfileSchema,
  numDays: z.number().min(1).max(14).default(7),
  mealsPerDay: z.number().min(1).max(4).default(3),
  maxCookTime: z.number().min(10).max(180).optional(),
  maxDifficulty: z.number().min(1).max(5).optional(),
});

export const weightBasedMealSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  nutrition: z.object({
    calories: z.number(),
    protein_g: z.number(),
    carbs_g: z.number(),
    fat_g: z.number(),
  }),
  cook_time_minutes: z.number(),
  difficulty: z.number(),
  
  // Weight-based metadata
  objectiveOverlap: z.array(z.string()).default([]),      // Which objectives this meal satisfies
  heroIngredients: z.array(z.string()).default([]),       // Which hero ingredients used
  culturalSource: z.string().optional(),                  // If from predetermined cultural meals
  weightSatisfaction: goalWeightsSchema,                   // How well it satisfies each weight
  adaptationNotes: z.array(z.string()).optional(),        // If meal was adapted from predetermined
});

export type GoalWeights = z.infer<typeof goalWeightsSchema>;
export type SimplifiedUserProfile = z.infer<typeof simplifiedUserProfileSchema>;
export type MealPlanRequest = z.infer<typeof mealPlanRequestSchema>;
export type WeightBasedMeal = z.infer<typeof weightBasedMealSchema>;

// Recipe model
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  image_url: text("image_url"),
  time_minutes: integer("time_minutes"),
  cuisine: text("cuisine"),
  diet: text("diet"),
  ingredients: json("ingredients").notNull(),
  instructions: json("instructions").notNull(),
  nutrition_info: json("nutrition_info"),
  video_id: text("video_id"),
  video_title: text("video_title"),
  video_channel: text("video_channel"),
  is_saved: boolean("is_saved").default(false),
  created_at: timestamp("created_at").defaultNow(),
  user_id: integer("user_id").references(() => users.id),
});

export const insertRecipeSchema = createInsertSchema(recipes).pick({
  title: true,
  description: true,
  image_url: true,
  time_minutes: true,
  cuisine: true,
  diet: true,
  ingredients: true,
  instructions: true,
  nutrition_info: true,
  video_id: true,
  video_title: true,
  video_channel: true,
  is_saved: true,
  user_id: true,
});

export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;

// Meal plans table for saved meal plans
export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  mealPlan: json("meal_plan").notNull(),
  isAutoSaved: boolean("is_auto_saved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertMealPlan = typeof mealPlans.$inferInsert;

// Global Cultural Cuisine Cache - shared across all users
export const culturalCuisineCache = pgTable("cultural_cuisine_cache", {
  id: serial("id").primaryKey(),
  cuisine_name: text("cuisine_name").notNull(),
  meals_data: json("meals_data").notNull(), // Array of meal objects
  summary_data: json("summary_data").notNull(), // Common ingredients and techniques
  data_version: text("data_version").notNull().default("1.0.0"),
  quality_score: integer("quality_score").default(0),
  access_count: integer("access_count").default(0),
  last_accessed: timestamp("last_accessed").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => ({
  cuisineNameIdx: index("cuisine_name_idx").on(table.cuisine_name),
}));

export const insertCulturalCuisineCacheSchema = createInsertSchema(culturalCuisineCache).pick({
  cuisine_name: true,
  meals_data: true,
  summary_data: true,
  data_version: true,
  quality_score: true,
});

export type CulturalCuisineCache = typeof culturalCuisineCache.$inferSelect;
export type InsertCulturalCuisineCache = z.infer<typeof insertCulturalCuisineCacheSchema>;

// User saved cultural meals table - personal collections
export const userSavedCulturalMeals = pgTable("user_saved_cultural_meals", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  cuisine_name: text("cuisine_name").notNull(),
  meals_data: json("meals_data").notNull(), // Array of meal objects
  summary_data: json("summary_data").notNull(), // Common ingredients and techniques
  custom_name: text("custom_name"), // User can name their saved collection
  notes: text("notes"), // User notes about the saved meals
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userCuisineIdx: index("user_cuisine_idx").on(table.user_id, table.cuisine_name),
}));

export const insertUserSavedCulturalMealsSchema = createInsertSchema(userSavedCulturalMeals).pick({
  user_id: true,
  cuisine_name: true,
  meals_data: true,
  summary_data: true,
  custom_name: true,
  notes: true,
});

export type UserSavedCulturalMeals = typeof userSavedCulturalMeals.$inferSelect;
export type InsertUserSavedCulturalMeals = z.infer<typeof insertUserSavedCulturalMealsSchema>;

// Storage interfaces
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: {
    email: string;
    phone?: string;
    password_hash: string;
    full_name: string;
  }): Promise<User>;
  updateUser(id: number, userData: Partial<{
    email: string;
    phone?: string;
    password_hash: string;
    full_name: string;
  }>): Promise<User | null>;
  
  // Recipe methods
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  getRecipe(id: number): Promise<Recipe | undefined>;
  getPopularRecipes(): Promise<Recipe[]>;
  getSavedRecipes(userId?: number): Promise<Recipe[]>;
  getGeneratedRecipes(userId?: number): Promise<Recipe[]>;
  saveRecipe(id: number): Promise<Recipe | undefined>;
  unsaveRecipe(id: number): Promise<void>;
  
  // Meal plan methods
  getSavedMealPlans(userId: number): Promise<MealPlan[]>;
  saveMealPlan(data: {
    userId: number;
    name: string;
    description: string;
    mealPlan: any;
  }): Promise<MealPlan>;
  updateMealPlan(planId: number, userId: number, data: {
    name: string;
    description: string;
    mealPlan: any;
  }): Promise<MealPlan | null>;
  getMealPlan(planId: number, userId: number): Promise<MealPlan | null>;
  deleteMealPlan(planId: number, userId: number): Promise<boolean>;

  // Profile methods
  getProfile(userId: number): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: number, profile: Partial<InsertProfile>): Promise<Profile | null>;
}

// Extend MemStorage in storage.ts to include recipe functionality

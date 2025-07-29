var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  culturalCuisineCache: () => culturalCuisineCache,
  familyMemberSchema: () => familyMemberSchema,
  goalWeightsSchema: () => goalWeightsSchema,
  insertCulturalCuisineCacheSchema: () => insertCulturalCuisineCacheSchema,
  insertMealCompletionSchema: () => insertMealCompletionSchema,
  insertProfileSchema: () => insertProfileSchema,
  insertRecipeSchema: () => insertRecipeSchema,
  insertUserAchievementSchema: () => insertUserAchievementSchema,
  insertUserSavedCulturalMealsSchema: () => insertUserSavedCulturalMealsSchema,
  insertUserSchema: () => insertUserSchema,
  loginSchema: () => loginSchema,
  mealCompletions: () => mealCompletions,
  mealPlanRequestSchema: () => mealPlanRequestSchema,
  mealPlans: () => mealPlans,
  mergeFamilyDietaryRestrictions: () => mergeFamilyDietaryRestrictions,
  profiles: () => profiles,
  recipes: () => recipes,
  registerSchema: () => registerSchema,
  simplifiedUserProfileSchema: () => simplifiedUserProfileSchema,
  userAchievements: () => userAchievements,
  userSavedCulturalMeals: () => userSavedCulturalMeals,
  users: () => users,
  weightBasedMealSchema: () => weightBasedMealSchema
});
import { pgTable, text, serial, integer, boolean, json, timestamp, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
function mergeFamilyDietaryRestrictions(members) {
  console.log("\u{1F517} Merging family dietary restrictions from", members.length, "members");
  const allRestrictions = /* @__PURE__ */ new Set();
  members.forEach((member, index2) => {
    console.log(`   Member ${index2 + 1} (${member.name || "Unnamed"}):`, {
      dietaryRestrictions: member.dietaryRestrictions || [],
      preferences: member.preferences || []
    });
    if (member.dietaryRestrictions && Array.isArray(member.dietaryRestrictions)) {
      member.dietaryRestrictions.forEach((restriction) => {
        if (restriction && restriction.trim()) {
          allRestrictions.add(restriction.trim());
          console.log(`     \u2705 Added restriction: "${restriction.trim()}"`);
        }
      });
    }
    if (member.preferences && Array.isArray(member.preferences)) {
      member.preferences.forEach((pref) => {
        const lowerPref = pref.toLowerCase().trim();
        if (lowerPref.includes("allerg") || lowerPref.includes("intoleran") || lowerPref.includes("free") || lowerPref.includes("vegan") || lowerPref.includes("vegetarian") || lowerPref.includes("kosher") || lowerPref.includes("halal") || lowerPref.includes("diet")) {
          allRestrictions.add(pref.trim());
          console.log(`     \u26A0\uFE0F Found dietary restriction in preferences: "${pref.trim()}"`);
        }
      });
    }
  });
  const finalRestrictions = Array.from(allRestrictions);
  console.log("\u{1F517} Final merged restrictions:", finalRestrictions);
  return finalRestrictions;
}
var users, insertUserSchema, loginSchema, registerSchema, profiles, familyMemberSchema, insertProfileSchema, goalWeightsSchema, simplifiedUserProfileSchema, mealPlanRequestSchema, weightBasedMealSchema, recipes, insertRecipeSchema, mealPlans, culturalCuisineCache, insertCulturalCuisineCacheSchema, userSavedCulturalMeals, insertUserSavedCulturalMealsSchema, userAchievements, insertUserAchievementSchema, mealCompletions, insertMealCompletionSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      email: text("email").notNull().unique(),
      phone: text("phone"),
      password_hash: text("password_hash"),
      full_name: text("full_name"),
      created_at: timestamp("created_at").defaultNow(),
      updated_at: timestamp("updated_at").defaultNow()
    });
    insertUserSchema = createInsertSchema(users).pick({
      email: true,
      phone: true,
      password_hash: true,
      full_name: true
    }).extend({
      password: z.string().min(8, "Password must be at least 8 characters")
    });
    loginSchema = z.object({
      email: z.string().email("Invalid email format"),
      password: z.string().min(1, "Password is required")
    });
    registerSchema = z.object({
      email: z.string().email("Invalid email format"),
      phone: z.string().regex(/^\+?[\d\s\-\(\)]{10,}$/, "Invalid phone number format"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      full_name: z.string().min(2, "Full name must be at least 2 characters")
    });
    profiles = pgTable("profiles", {
      id: serial("id").primaryKey(),
      user_id: integer("user_id").references(() => users.id).notNull(),
      profile_name: text("profile_name"),
      // e.g., "Smith Family" or "Jessica"
      primary_goal: text("primary_goal"),
      // e.g., "Save Money", "Eat Healthier", "Gain Muscle", "Family Wellness"
      family_size: integer("family_size").default(1),
      members: json("members").default([]),
      // Array of family member objects
      profile_type: text("profile_type").default("family"),
      // "individual" or "family"
      preferences: json("preferences").default([]),
      // For individual profiles
      goals: json("goals").default([]),
      // For individual profiles
      cultural_background: json("cultural_background").default([]),
      // Array of cultural cuisine tags
      questionnaire_answers: json("questionnaire_answers").default({}),
      // Questionnaire answers for smart profile
      questionnaire_selections: json("questionnaire_selections").default([]),
      // Selected options from questionnaire
      created_at: timestamp("created_at").defaultNow(),
      updated_at: timestamp("updated_at").defaultNow()
    });
    familyMemberSchema = z.object({
      name: z.string().optional(),
      ageGroup: z.enum(["Child", "Teen", "Adult"]).optional(),
      preferences: z.array(z.string()).default([]),
      // dietary preferences, allergies, dislikes
      dietaryRestrictions: z.array(z.string()).default([]),
      // mandatory dietary restrictions for this member
      goals: z.array(z.string()).default([])
      // individual goals
    });
    insertProfileSchema = createInsertSchema(profiles).pick({
      user_id: true,
      profile_name: true,
      primary_goal: true,
      family_size: true,
      members: true,
      profile_type: true,
      preferences: true,
      goals: true,
      cultural_background: true,
      questionnaire_answers: true,
      questionnaire_selections: true
    }).extend({
      members: z.array(familyMemberSchema).optional(),
      profile_type: z.enum(["individual", "family"]).optional(),
      preferences: z.array(z.string()).optional(),
      goals: z.array(z.string()).optional(),
      cultural_background: z.array(z.string()).optional(),
      questionnaire_answers: z.record(z.array(z.string())).optional(),
      questionnaire_selections: z.array(z.object({
        questionId: z.string(),
        questionTitle: z.string(),
        optionId: z.string(),
        optionLabel: z.string(),
        optionDescription: z.string()
      })).optional()
    });
    goalWeightsSchema = z.object({
      cost: z.number().min(0).max(1).default(0.5),
      // Save money priority (0-1)
      health: z.number().min(0).max(1).default(0.5),
      // Nutrition/wellness priority (0-1)
      cultural: z.number().min(0).max(1).default(0.5),
      // Cultural cuisine priority (0-1)
      variety: z.number().min(0).max(1).default(0.5),
      // Meal diversity priority (0-1)
      time: z.number().min(0).max(1).default(0.5)
      // Quick/easy meal priority (0-1)
    });
    simplifiedUserProfileSchema = z.object({
      // Mandatory (100% compliance)
      dietaryRestrictions: z.array(z.string()).default([]),
      // Weight-based priorities
      goalWeights: goalWeightsSchema,
      // Basic info
      culturalBackground: z.array(z.string()).default([]),
      familySize: z.number().min(1).max(12).default(1),
      availableIngredients: z.array(z.string()).optional(),
      // Optional questionnaire data
      profileName: z.string().optional(),
      questionnaire_answers: z.record(z.array(z.string())).optional(),
      questionnaire_selections: z.array(z.object({
        questionId: z.string(),
        questionTitle: z.string(),
        optionId: z.string(),
        optionLabel: z.string(),
        optionDescription: z.string()
      })).optional()
    });
    mealPlanRequestSchema = z.object({
      profile: simplifiedUserProfileSchema,
      numDays: z.number().min(1).max(14).default(7),
      mealsPerDay: z.number().min(1).max(4).default(3),
      maxCookTime: z.number().min(10).max(180).optional(),
      maxDifficulty: z.number().min(1).max(5).optional()
    });
    weightBasedMealSchema = z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      ingredients: z.array(z.string()),
      instructions: z.array(z.string()),
      nutrition: z.object({
        calories: z.number(),
        protein_g: z.number(),
        carbs_g: z.number(),
        fat_g: z.number()
      }),
      cook_time_minutes: z.number(),
      difficulty: z.number(),
      // Weight-based metadata
      objectiveOverlap: z.array(z.string()).default([]),
      // Which objectives this meal satisfies
      heroIngredients: z.array(z.string()).default([]),
      // Which hero ingredients used
      culturalSource: z.string().optional(),
      // If from predetermined cultural meals
      weightSatisfaction: goalWeightsSchema,
      // How well it satisfies each weight
      adaptationNotes: z.array(z.string()).optional()
      // If meal was adapted from predetermined
    });
    recipes = pgTable("recipes", {
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
      user_id: integer("user_id").references(() => users.id)
    });
    insertRecipeSchema = createInsertSchema(recipes).pick({
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
      user_id: true
    });
    mealPlans = pgTable("meal_plans", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      name: varchar("name").notNull(),
      description: text("description"),
      mealPlan: json("meal_plan").notNull(),
      isAutoSaved: boolean("is_auto_saved").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    culturalCuisineCache = pgTable("cultural_cuisine_cache", {
      id: serial("id").primaryKey(),
      cuisine_name: text("cuisine_name").notNull(),
      meals_data: json("meals_data").notNull(),
      // Array of meal objects
      summary_data: json("summary_data").notNull(),
      // Common ingredients and techniques
      data_version: text("data_version").notNull().default("1.0.0"),
      quality_score: integer("quality_score").default(0),
      access_count: integer("access_count").default(0),
      last_accessed: timestamp("last_accessed").defaultNow(),
      created_at: timestamp("created_at").defaultNow(),
      updated_at: timestamp("updated_at").defaultNow()
    }, (table) => ({
      cuisineNameIdx: index("cuisine_name_idx").on(table.cuisine_name)
    }));
    insertCulturalCuisineCacheSchema = createInsertSchema(culturalCuisineCache).pick({
      cuisine_name: true,
      meals_data: true,
      summary_data: true,
      data_version: true,
      quality_score: true
    });
    userSavedCulturalMeals = pgTable("user_saved_cultural_meals", {
      id: serial("id").primaryKey(),
      user_id: integer("user_id").notNull(),
      cuisine_name: text("cuisine_name").notNull(),
      meals_data: json("meals_data").notNull(),
      // Array of meal objects
      summary_data: json("summary_data").notNull(),
      // Common ingredients and techniques
      custom_name: text("custom_name"),
      // User can name their saved collection
      notes: text("notes"),
      // User notes about the saved meals
      created_at: timestamp("created_at").defaultNow(),
      updated_at: timestamp("updated_at").defaultNow()
    }, (table) => ({
      userCuisineIdx: index("user_cuisine_idx").on(table.user_id, table.cuisine_name)
    }));
    insertUserSavedCulturalMealsSchema = createInsertSchema(userSavedCulturalMeals).pick({
      user_id: true,
      cuisine_name: true,
      meals_data: true,
      summary_data: true,
      custom_name: true,
      notes: true
    });
    userAchievements = pgTable("user_achievements", {
      id: serial("id").primaryKey(),
      user_id: integer("user_id").notNull().references(() => users.id),
      achievement_id: text("achievement_id").notNull(),
      title: text("title").notNull(),
      description: text("description").notNull(),
      category: text("category").notNull(),
      is_unlocked: boolean("is_unlocked").default(false),
      progress: integer("progress").default(0),
      max_progress: integer("max_progress").notNull(),
      points: integer("points").notNull(),
      rarity: text("rarity").notNull(),
      // "common", "rare", "epic", "legendary"
      unlocked_date: timestamp("unlocked_date"),
      created_at: timestamp("created_at").defaultNow(),
      updated_at: timestamp("updated_at").defaultNow()
    }, (table) => ({
      userAchievementIdx: index("user_achievement_idx").on(table.user_id, table.achievement_id)
    }));
    insertUserAchievementSchema = createInsertSchema(userAchievements).pick({
      user_id: true,
      achievement_id: true,
      title: true,
      description: true,
      category: true,
      is_unlocked: true,
      progress: true,
      max_progress: true,
      points: true,
      rarity: true,
      unlocked_date: true
    });
    mealCompletions = pgTable("meal_completions", {
      id: serial("id").primaryKey(),
      user_id: integer("user_id").notNull().references(() => users.id),
      meal_plan_id: integer("meal_plan_id").notNull().references(() => mealPlans.id),
      day_key: text("day_key").notNull(),
      // e.g., "day_1", "day_2"
      meal_type: text("meal_type").notNull(),
      // "breakfast", "lunch", "dinner", "snack"
      is_completed: boolean("is_completed").default(false),
      completed_at: timestamp("completed_at"),
      created_at: timestamp("created_at").defaultNow(),
      updated_at: timestamp("updated_at").defaultNow()
    }, (table) => ({
      userMealIdx: index("user_meal_idx").on(table.user_id, table.meal_plan_id, table.day_key, table.meal_type)
    }));
    insertMealCompletionSchema = createInsertSchema(mealCompletions).pick({
      user_id: true,
      meal_plan_id: true,
      day_key: true,
      meal_type: true,
      is_completed: true,
      completed_at: true
    });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 3e4,
      connectionTimeoutMillis: 1e4
    });
    db = drizzle(pool, { schema: schema_exports });
  }
});

// server/dbStorage.ts
import { eq, desc, and } from "drizzle-orm";
var DatabaseStorage;
var init_dbStorage = __esm({
  "server/dbStorage.ts"() {
    "use strict";
    init_db();
    init_schema();
    DatabaseStorage = class {
      // User methods
      async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
      }
      async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user;
      }
      async createUser(userData) {
        const [user] = await db.insert(users).values({
          email: userData.email,
          phone: userData.phone,
          password_hash: userData.password_hash,
          full_name: userData.full_name
        }).returning();
        return user;
      }
      async updateUser(id, userData) {
        const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
        return user || null;
      }
      // Recipe methods
      async createRecipe(recipe) {
        const [createdRecipe] = await db.insert(recipes).values(recipe).returning();
        return createdRecipe;
      }
      async getRecipe(id) {
        const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
        return recipe;
      }
      async getPopularRecipes() {
        const baselineRecipes = await db.select().from(recipes).where(eq(recipes.id, 210));
        const recipe211 = await db.select().from(recipes).where(eq(recipes.id, 211));
        const recipe212 = await db.select().from(recipes).where(eq(recipes.id, 212));
        const recipe213 = await db.select().from(recipes).where(eq(recipes.id, 213));
        let result = [...baselineRecipes, ...recipe211, ...recipe212, ...recipe213];
        if (result.length < 6) {
          const otherRecipes = await db.select().from(recipes).orderBy(desc(recipes.created_at)).limit(6 - result.length);
          const filteredOthers = otherRecipes.filter(
            (recipe) => !result.some((existing) => existing.id === recipe.id)
          );
          result = [...result, ...filteredOthers];
        }
        return result.slice(0, 6);
      }
      async getSavedRecipes(userId) {
        if (userId) {
          return await db.select().from(recipes).where(and(eq(recipes.is_saved, true), eq(recipes.user_id, userId))).orderBy(desc(recipes.created_at));
        }
        return await db.select().from(recipes).where(eq(recipes.is_saved, true)).orderBy(desc(recipes.created_at));
      }
      async getGeneratedRecipes(userId) {
        if (userId) {
          return await db.select().from(recipes).where(and(eq(recipes.is_saved, false), eq(recipes.user_id, userId))).orderBy(desc(recipes.created_at));
        }
        return await db.select().from(recipes).where(eq(recipes.is_saved, false)).orderBy(desc(recipes.created_at));
      }
      async getRecipeById(recipeId) {
        try {
          const recipe = await db.select().from(recipes).where(eq(recipes.id, recipeId)).limit(1);
          return recipe.length > 0 ? recipe[0] : null;
        } catch (error) {
          console.error("Error getting recipe by ID:", error);
          throw error;
        }
      }
      async saveRecipe(recipeId) {
        try {
          console.log(`DatabaseStorage: Saving recipe ${recipeId}`);
          const existingRecipe = await this.getRecipeById(recipeId);
          if (!existingRecipe) {
            console.log(`DatabaseStorage: Recipe ${recipeId} not found`);
            return null;
          }
          console.log(`DatabaseStorage: Found recipe ${recipeId}, updating is_saved to true`);
          await db.update(recipes).set({ is_saved: true }).where(eq(recipes.id, recipeId));
          console.log(`DatabaseStorage: Successfully updated recipe ${recipeId}`);
          const updatedRecipe = { ...existingRecipe, is_saved: true };
          return updatedRecipe;
        } catch (error) {
          console.error("DatabaseStorage: Error saving recipe:", error);
          throw error;
        }
      }
      async unsaveRecipe(recipeId) {
        try {
          console.log(`DatabaseStorage: Unsaving recipe ${recipeId}`);
          const result = await db.update(recipes).set({ is_saved: false }).where(eq(recipes.id, recipeId));
          console.log(`DatabaseStorage: Successfully unsaved recipe ${recipeId}`);
        } catch (error) {
          console.error("DatabaseStorage: Error unsaving recipe:", error);
          throw error;
        }
      }
      // Meal plan operations
      async getSavedMealPlans(userId) {
        try {
          const plans = await db.select().from(mealPlans).where(eq(mealPlans.userId, userId)).orderBy(desc(mealPlans.updatedAt));
          console.log("Database returned meal plans:", plans?.length || 0);
          return Array.isArray(plans) ? plans : [];
        } catch (error) {
          console.error("Database error fetching meal plans:", error);
          return [];
        }
      }
      async saveMealPlan(data) {
        const [savedPlan] = await db.insert(mealPlans).values({
          userId: data.userId,
          name: data.name,
          description: data.description,
          mealPlan: data.mealPlan,
          isAutoSaved: data.isAutoSaved || false,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return savedPlan;
      }
      async updateMealPlan(planId, userId, data) {
        try {
          console.log("Updating meal plan in database:", { planId, userId, dataKeys: Object.keys(data) });
          const [updatedPlan] = await db.update(mealPlans).set({
            name: data.name,
            description: data.description,
            mealPlan: data.mealPlan,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(mealPlans.id, planId)).returning();
          console.log("Database update result:", updatedPlan ? "success" : "no result");
          return updatedPlan || null;
        } catch (error) {
          console.error("Database error updating meal plan:", error);
          throw error;
        }
      }
      async getMealPlan(planId, userId) {
        const [plan] = await db.select().from(mealPlans).where(eq(mealPlans.id, planId));
        return plan || null;
      }
      async deleteMealPlan(planId, userId) {
        try {
          console.log("Deleting meal plan from database:", { planId, userId });
          const result = await db.delete(mealPlans).where(eq(mealPlans.id, planId)).returning();
          const success = result.length > 0;
          console.log("Database delete result:", success ? "success" : "no rows affected");
          return success;
        } catch (error) {
          console.error("Database error deleting meal plan:", error);
          return false;
        }
      }
      // Profile methods
      async getProfile(userId) {
        const [profile] = await db.select().from(profiles).where(eq(profiles.user_id, userId));
        return profile;
      }
      async createProfile(profile) {
        try {
          console.log("DatabaseStorage: Creating profile with data:", profile);
          const [createdProfile] = await db.insert(profiles).values({
            user_id: profile.user_id,
            profile_name: profile.profile_name,
            primary_goal: profile.primary_goal,
            family_size: profile.family_size || 1,
            members: profile.members || [],
            profile_type: profile.profile_type || "family",
            preferences: profile.preferences || [],
            goals: profile.goals || [],
            cultural_background: profile.cultural_background || [],
            questionnaire_answers: profile.questionnaire_answers || {},
            questionnaire_selections: profile.questionnaire_selections || []
          }).returning();
          console.log("DatabaseStorage: Successfully created profile:", createdProfile);
          return createdProfile;
        } catch (error) {
          console.error("DatabaseStorage: Error creating profile:", error);
          throw error;
        }
      }
      async updateProfile(userId, profile) {
        try {
          const [updatedProfile] = await db.update(profiles).set({
            profile_name: profile.profile_name,
            primary_goal: profile.primary_goal,
            family_size: profile.family_size,
            members: profile.members,
            profile_type: profile.profile_type,
            preferences: profile.preferences,
            goals: profile.goals,
            cultural_background: profile.cultural_background,
            questionnaire_answers: profile.questionnaire_answers,
            questionnaire_selections: profile.questionnaire_selections,
            updated_at: /* @__PURE__ */ new Date()
          }).where(eq(profiles.user_id, userId)).returning();
          return updatedProfile || null;
        } catch (error) {
          console.error("Database error updating profile:", error);
          return null;
        }
      }
      // Achievement methods
      async getUserAchievements(userId) {
        const achievements = await db.select().from(userAchievements).where(eq(userAchievements.user_id, userId)).orderBy(desc(userAchievements.created_at));
        return achievements;
      }
      async initializeUserAchievements(userId) {
        const achievementDefinitions = [
          {
            achievement_id: "first_steps",
            title: "First Steps",
            description: "Generate your first meal plan",
            category: "cooking",
            max_progress: 1,
            points: 100,
            rarity: "common"
          },
          {
            achievement_id: "meal_master",
            title: "Meal Master",
            description: "Generate 10 meal plans",
            category: "cooking",
            max_progress: 10,
            points: 500,
            rarity: "rare"
          },
          {
            achievement_id: "healthy_start",
            title: "Healthy Start",
            description: "Save your first healthy meal plan",
            category: "wellness",
            max_progress: 1,
            points: 150,
            rarity: "common"
          }
        ];
        const insertData = achievementDefinitions.map((def) => ({
          user_id: userId,
          achievement_id: def.achievement_id,
          title: def.title,
          description: def.description,
          category: def.category,
          is_unlocked: false,
          progress: 0,
          max_progress: def.max_progress,
          points: def.points,
          rarity: def.rarity,
          unlocked_date: null
        }));
        const createdAchievements = await db.insert(userAchievements).values(insertData).returning();
        return createdAchievements;
      }
      async updateUserAchievement(userId, achievementId, data) {
        const [updatedAchievement] = await db.update(userAchievements).set({
          progress: data.progress,
          is_unlocked: data.is_unlocked,
          unlocked_date: data.unlocked_date,
          updated_at: /* @__PURE__ */ new Date()
        }).where(and(
          eq(userAchievements.user_id, userId),
          eq(userAchievements.achievement_id, achievementId)
        )).returning();
        return updatedAchievement || null;
      }
      async getUserAchievement(userId, achievementId) {
        const [achievement] = await db.select().from(userAchievements).where(and(
          eq(userAchievements.user_id, userId),
          eq(userAchievements.achievement_id, achievementId)
        ));
        return achievement || null;
      }
      // Meal completion methods
      async getMealCompletions(userId, mealPlanId) {
        const completions = await db.select().from(mealCompletions).where(and(
          eq(mealCompletions.user_id, userId),
          eq(mealCompletions.meal_plan_id, mealPlanId)
        ));
        return completions;
      }
      async toggleMealCompletion(userId, mealPlanId, dayKey, mealType) {
        const [existing] = await db.select().from(mealCompletions).where(and(
          eq(mealCompletions.user_id, userId),
          eq(mealCompletions.meal_plan_id, mealPlanId),
          eq(mealCompletions.day_key, dayKey),
          eq(mealCompletions.meal_type, mealType)
        ));
        if (existing) {
          const [updated] = await db.update(mealCompletions).set({
            is_completed: !existing.is_completed,
            completed_at: !existing.is_completed ? /* @__PURE__ */ new Date() : null,
            updated_at: /* @__PURE__ */ new Date()
          }).where(and(
            eq(mealCompletions.user_id, userId),
            eq(mealCompletions.meal_plan_id, mealPlanId),
            eq(mealCompletions.day_key, dayKey),
            eq(mealCompletions.meal_type, mealType)
          )).returning();
          return updated;
        } else {
          const [created] = await db.insert(mealCompletions).values({
            user_id: userId,
            meal_plan_id: mealPlanId,
            day_key: dayKey,
            meal_type: mealType,
            is_completed: true,
            completed_at: /* @__PURE__ */ new Date()
          }).returning();
          return created;
        }
      }
      async getMealCompletion(userId, mealPlanId, dayKey, mealType) {
        const [completion] = await db.select().from(mealCompletions).where(and(
          eq(mealCompletions.user_id, userId),
          eq(mealCompletions.meal_plan_id, mealPlanId),
          eq(mealCompletions.day_key, dayKey),
          eq(mealCompletions.meal_type, mealType)
        ));
        return completion || null;
      }
      async completeMealPlan(userId, mealPlanId) {
        try {
          console.log(`\u{1F50D} COMPLETE PLAN DEBUG: Starting for user ${userId}, plan ${mealPlanId}`);
          const [plan] = await db.select().from(mealPlans).where(and(
            eq(mealPlans.id, mealPlanId),
            eq(mealPlans.userId, userId)
          ));
          if (!plan) {
            console.log(`\u274C COMPLETE PLAN DEBUG: No meal plan found for user ${userId} and plan ${mealPlanId}`);
            return null;
          }
          console.log(`\u2705 COMPLETE PLAN DEBUG: Found meal plan ${mealPlanId} for user ${userId}`);
          const existingCompletions = await db.select().from(mealCompletions).where(and(
            eq(mealCompletions.meal_plan_id, mealPlanId),
            eq(mealCompletions.user_id, userId)
          ));
          console.log(`\u{1F4CA} COMPLETE PLAN DEBUG: Found ${existingCompletions.length} completions to delete`);
          return await db.transaction(async (tx) => {
            console.log(`\u{1F504} COMPLETE PLAN DEBUG: Starting transaction for plan ${mealPlanId}`);
            const deletedCompletions = await tx.delete(mealCompletions).where(and(
              eq(mealCompletions.meal_plan_id, mealPlanId),
              eq(mealCompletions.user_id, userId)
            ));
            console.log(`\u{1F5D1}\uFE0F COMPLETE PLAN DEBUG: Deleted meal completions for plan ${mealPlanId}:`, deletedCompletions);
            const remainingCompletions = await tx.select().from(mealCompletions).where(eq(mealCompletions.meal_plan_id, mealPlanId));
            console.log(`\u{1F50D} COMPLETE PLAN DEBUG: Remaining completions after deletion: ${remainingCompletions.length}`);
            if (remainingCompletions.length > 0) {
              console.log(`\u26A0\uFE0F COMPLETE PLAN DEBUG: Still found completions:`, remainingCompletions);
            }
            console.log(`\u{1F5D1}\uFE0F COMPLETE PLAN DEBUG: Now deleting meal plan ${mealPlanId}`);
            const deletedPlan = await tx.delete(mealPlans).where(and(
              eq(mealPlans.id, mealPlanId),
              eq(mealPlans.userId, userId)
            ));
            console.log(`\u2705 COMPLETE PLAN DEBUG: Successfully deleted meal plan ${mealPlanId}:`, deletedPlan);
            return plan;
          });
        } catch (error) {
          console.error("\u274C COMPLETE PLAN DEBUG: Database error completing meal plan:", error);
          return null;
        }
      }
    };
  }
});

// server/storage.ts
var storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_dbStorage();
    storage = new DatabaseStorage();
  }
});

// server/smartIngredientOptimizer.ts
var smartIngredientOptimizer_exports = {};
__export(smartIngredientOptimizer_exports, {
  generateIngredientOptimizedMeal: () => generateIngredientOptimizedMeal,
  generateOrganizedShoppingList: () => generateOrganizedShoppingList,
  optimizeMealPlanForIngredients: () => optimizeMealPlanForIngredients,
  scoreMealOverlap: () => scoreMealOverlap
});
function optimizeMealPlanForIngredients(mealPlan) {
  const allIngredients = extractAllIngredients(mealPlan);
  const ingredientAnalysis = analyzeIngredientFrequency(allIngredients);
  const savings = calculateBulkSavings(ingredientAnalysis);
  const shoppingList = generateOptimizedShoppingList(ingredientAnalysis);
  return {
    optimizedPlan: mealPlan,
    ingredientAnalysis,
    estimatedSavings: savings,
    shoppingList
  };
}
function extractAllIngredients(mealPlan) {
  const ingredientFrequency = {};
  Object.values(mealPlan.meal_plan).forEach((day) => {
    Object.values(day).forEach((meal) => {
      if (meal.ingredients) {
        meal.ingredients.forEach((ingredient) => {
          const normalizedName = normalizeIngredientName(ingredient);
          ingredientFrequency[normalizedName] = (ingredientFrequency[normalizedName] || 0) + 1;
        });
      }
    });
  });
  return ingredientFrequency;
}
function normalizeIngredientName(ingredient) {
  return ingredient.toLowerCase().replace(/\b(fresh|dried|organic|chopped|sliced|diced)\b/g, "").replace(/\s+/g, " ").trim();
}
function analyzeIngredientFrequency(ingredients) {
  return Object.entries(ingredients).map(([name, count]) => {
    const basePrice = getBaseIngredientPrice(name);
    const totalQuantity = count;
    const regularCost = totalQuantity * basePrice;
    const bulkMultiplier = getBulkMultiplier(totalQuantity);
    const bulkCost = regularCost * bulkMultiplier;
    const savings = regularCost - bulkCost;
    return {
      name,
      totalQuantity,
      usageCount: count,
      estimatedCost: bulkCost,
      bulkSavings: savings
    };
  });
}
function getBaseIngredientPrice(ingredient) {
  const priceMap = {
    // Proteins
    "chicken": 3.5,
    "beef": 5,
    "salmon": 6,
    "turkey": 4,
    "eggs": 0.25,
    "pork": 4.5,
    "fish": 5.5,
    "shrimp": 7,
    "tuna": 3,
    "bacon": 5.5,
    "ground beef": 5,
    "chicken breast": 4,
    "chicken thigh": 3,
    // Vegetables
    "spinach": 2.5,
    "broccoli": 2,
    "bell pepper": 1.5,
    "onion": 1,
    "tomato": 2,
    "carrot": 1,
    "garlic": 0.5,
    "lettuce": 2,
    "cucumber": 1.5,
    "potato": 1.2,
    "sweet potato": 1.8,
    "zucchini": 1.5,
    "mushroom": 2.5,
    "celery": 1.5,
    "cabbage": 1,
    "corn": 1.3,
    "peas": 2,
    // Pantry items
    "olive oil": 0.3,
    "soy sauce": 0.2,
    "salt": 0.05,
    "pepper": 0.1,
    "rice": 1,
    "pasta": 1.5,
    "bread": 2.5,
    "flour": 1.2,
    "sugar": 0.8,
    "vinegar": 0.15,
    "honey": 0.4,
    "oil": 0.25,
    // Dairy
    "cheese": 3,
    "milk": 1,
    "butter": 0.5,
    "yogurt": 1.5,
    "cream": 2,
    "sour cream": 1.8,
    "mozzarella": 3.5,
    "parmesan": 4,
    // Herbs/Spices
    "basil": 1,
    "oregano": 0.5,
    "thyme": 0.5,
    "ginger": 1.5,
    "cilantro": 1,
    "parsley": 1,
    "rosemary": 0.8,
    "paprika": 0.6,
    // Grains & Legumes
    "quinoa": 2.5,
    "beans": 1.5,
    "lentils": 1.8,
    "chickpeas": 1.6,
    "oats": 1.2,
    "barley": 1.4,
    "couscous": 1.8
  };
  const normalizedIngredient = ingredient.toLowerCase().trim();
  if (priceMap[normalizedIngredient]) {
    return priceMap[normalizedIngredient];
  }
  let bestMatch = { score: 0, price: 2 };
  for (const [key, price] of Object.entries(priceMap)) {
    const score = calculateIngredientMatchScore(normalizedIngredient, key);
    if (score > bestMatch.score && score > 0.5) {
      bestMatch = { score, price };
    }
  }
  return bestMatch.price;
}
function calculateIngredientMatchScore(ingredient, reference) {
  if (ingredient === reference) return 1;
  if (ingredient.includes(reference) || reference.includes(ingredient)) {
    return 0.8;
  }
  const ingredientWords = ingredient.split(/\s+/);
  const referenceWords = reference.split(/\s+/);
  let matchingWords = 0;
  for (const word of ingredientWords) {
    if (referenceWords.some(
      (refWord) => word.includes(refWord) || refWord.includes(word) || levenshteinDistance(word, refWord) <= 2
    )) {
      matchingWords++;
    }
  }
  return matchingWords / Math.max(ingredientWords.length, referenceWords.length);
}
function levenshteinDistance(str1, str2) {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        // deletion
        matrix[j - 1][i] + 1,
        // insertion
        matrix[j - 1][i - 1] + substitutionCost
        // substitution
      );
    }
  }
  return matrix[str2.length][str1.length];
}
function getBulkMultiplier(quantity) {
  if (quantity >= 7) return 0.55;
  if (quantity >= 5) return 0.65;
  if (quantity >= 3) return 0.75;
  if (quantity >= 2) return 0.85;
  return 1;
}
function getBulkRecommendation(ingredient, usageCount) {
  const ingredientType = classifyIngredientType(ingredient);
  if (usageCount >= 5) {
    switch (ingredientType) {
      case "protein":
        return "Buy family pack - freeze portions";
      case "produce":
        return "Buy bulk - prep and store properly";
      case "pantry":
        return "Buy largest size available";
      case "dairy":
        return "Buy larger container if within expiry";
      default:
        return "Consider bulk purchase";
    }
  } else if (usageCount >= 3) {
    return "Buy medium/bulk size";
  } else if (usageCount >= 2) {
    return "Buy regular size";
  }
  return "";
}
function classifyIngredientType(ingredient) {
  const lowerIngredient = ingredient.toLowerCase();
  if (/chicken|beef|pork|fish|salmon|turkey|bacon|ground|meat/.test(lowerIngredient)) {
    return "protein";
  }
  if (/tomato|onion|carrot|potato|pepper|spinach|broccoli|lettuce|cucumber/.test(lowerIngredient)) {
    return "produce";
  }
  if (/milk|cheese|butter|yogurt|cream|dairy/.test(lowerIngredient)) {
    return "dairy";
  }
  if (/rice|pasta|flour|oil|sauce|salt|pepper|sugar|honey|vinegar/.test(lowerIngredient)) {
    return "pantry";
  }
  return "other";
}
function calculateBulkSavings(ingredientAnalysis) {
  return ingredientAnalysis.reduce((total, ingredient) => total + ingredient.bulkSavings, 0);
}
function generateOptimizedShoppingList(ingredientAnalysis) {
  return ingredientAnalysis.sort((a, b) => {
    if (b.bulkSavings !== a.bulkSavings) {
      return b.bulkSavings - a.bulkSavings;
    }
    return b.usageCount - a.usageCount;
  }).map((ingredient) => {
    const bulkRecommendation = getBulkRecommendation(ingredient.name, ingredient.usageCount);
    const savingsIndicator = ingredient.bulkSavings > 0.5 ? ` - Save $${ingredient.bulkSavings.toFixed(2)}` : "";
    const usageIndicator = ingredient.usageCount > 1 ? ` (used ${ingredient.usageCount}x)` : "";
    let itemText = ingredient.name;
    if (bulkRecommendation) {
      itemText += ` - ${bulkRecommendation}`;
    }
    itemText += usageIndicator + savingsIndicator;
    return itemText;
  });
}
function generateOrganizedShoppingList(ingredientAnalysis) {
  const sections = {
    produce: [],
    meat: [],
    dairy: [],
    pantry: [],
    other: []
  };
  const highValueItems = [];
  const totalSavings = ingredientAnalysis.reduce((sum, item) => sum + item.bulkSavings, 0);
  ingredientAnalysis.sort((a, b) => b.bulkSavings - a.bulkSavings).forEach((ingredient) => {
    const type = classifyIngredientType(ingredient.name);
    const bulkRecommendation = getBulkRecommendation(ingredient.name, ingredient.usageCount);
    const savingsText = ingredient.bulkSavings > 0.5 ? ` - Save $${ingredient.bulkSavings.toFixed(2)}` : "";
    const usageText = ingredient.usageCount > 1 ? ` (${ingredient.usageCount}x)` : "";
    let itemText = ingredient.name;
    if (bulkRecommendation) {
      itemText += ` - ${bulkRecommendation}`;
    }
    itemText += usageText + savingsText;
    if (ingredient.bulkSavings > 1) {
      highValueItems.push(ingredient.name);
    }
    switch (type) {
      case "produce":
        sections.produce.push(itemText);
        break;
      case "protein":
        sections.meat.push(itemText);
        break;
      case "dairy":
        sections.dairy.push(itemText);
        break;
      case "pantry":
        sections.pantry.push(itemText);
        break;
      default:
        sections.other.push(itemText);
    }
  });
  return {
    ...sections,
    totalSavings,
    highValueItems
  };
}
function scoreMealOverlap(meal1, meal2) {
  if (!meal1.ingredients || !meal2.ingredients) return 0;
  const set1 = new Set(meal1.ingredients.map(normalizeIngredientName));
  const set2 = new Set(meal2.ingredients.map(normalizeIngredientName));
  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = /* @__PURE__ */ new Set([...set1, ...set2]);
  return intersection.size / union.size;
}
async function generateIngredientOptimizedMeal(mealType, dayNumber, existingIngredients, cookTime, difficulty, nutritionGoal, dietaryRestrictions) {
  const commonIngredients = existingIngredients.slice(0, 2);
  const ingredientHint = commonIngredients.length > 0 ? `Try to include: ${commonIngredients.join(", ")}.` : "";
  const prompt = `Generate a ${mealType} recipe for day ${dayNumber}. Max ${cookTime} minutes, difficulty MAXIMUM ${difficulty}/5 (use 0.5 increments: 1, 1.5, 2, 2.5, 3, etc.). ${nutritionGoal ? `Goal: ${nutritionGoal}.` : ""} ${dietaryRestrictions ? `Restrictions: ${dietaryRestrictions}.` : ""} ${ingredientHint}

Return JSON:
{
  "title": "Recipe Name",
  "cook_time_minutes": ${Math.min(cookTime, 30)},
  "difficulty": ${difficulty},
  "ingredients": ["ingredient1", "ingredient2", "ingredient3"]
}`;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Generate meal recipes that efficiently reuse ingredients when possible. CRITICAL: Respect difficulty constraints and use 0.5 increments for precise difficulty ratings." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 150
      })
    });
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    return {
      title: `Quick ${mealType}`,
      cook_time_minutes: Math.min(cookTime, 20),
      difficulty,
      ingredients: [...commonIngredients, "protein", "vegetable"].slice(0, 3)
    };
  }
}
var init_smartIngredientOptimizer = __esm({
  "server/smartIngredientOptimizer.ts"() {
    "use strict";
  }
});

// server/instacart.ts
var instacart_exports = {};
__export(instacart_exports, {
  createInstacartRecipePage: () => createInstacartRecipePage,
  createOptimizedShoppingList: () => createOptimizedShoppingList,
  getNearbyRetailers: () => getNearbyRetailers
});
import fetch2 from "node-fetch";
async function createInstacartRecipePage(recipeData) {
  const API_KEY = process.env.INSTACART_API_KEY;
  if (!API_KEY) {
    throw new Error("Instacart API key is required. Set the INSTACART_API_KEY environment variable.");
  }
  const url = "https://connect.dev.instacart.tools/idp/v1/products/recipe";
  const headers = {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
    "Accept": "application/json"
  };
  const recipe = {
    title: recipeData.title,
    image_url: recipeData.image_url,
    link_type: "recipe",
    instructions: recipeData.instructions,
    ingredients: formatIngredientsForInstacart(recipeData.ingredients),
    landing_page_configuration: {
      partner_linkback_url: process.env.REPLIT_DOMAINS ? process.env.REPLIT_DOMAINS.split(",")[0] : "https://example.com",
      enable_pantry_items: true
    }
  };
  try {
    const response = await fetch2(url, {
      method: "POST",
      headers,
      body: JSON.stringify(recipe)
    });
    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = `HTTP error ${response.status}: ${JSON.stringify(errorData)}`;
      } catch (e) {
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error("Instacart API error:", error);
    throw new Error(`Failed to create Instacart recipe: ${error.message}`);
  }
}
async function getNearbyRetailers(postalCode, countryCode = "US") {
  const API_KEY = process.env.INSTACART_API_KEY;
  if (!API_KEY) {
    throw new Error("Instacart API key is required. Set the INSTACART_API_KEY environment variable.");
  }
  const url = `https://connect.dev.instacart.tools/idp/v1/retailers?postal_code=${postalCode}&country_code=${countryCode}`;
  const headers = {
    "Authorization": `Bearer ${API_KEY}`,
    "Accept": "application/json"
  };
  try {
    const response = await fetch2(url, {
      method: "GET",
      headers
    });
    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = `HTTP error ${response.status}: ${JSON.stringify(errorData)}`;
      } catch (e) {
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error("Instacart API error:", error);
    throw new Error(`Failed to get nearby retailers: ${error.message}`);
  }
}
function formatIngredientsForInstacart(ingredients) {
  return ingredients.map((ingredient) => {
    if (typeof ingredient === "string") {
      const parsed = parseIngredientString(ingredient);
      return {
        name: parsed.ingredient,
        display_text: ingredient,
        measurements: parsed.quantity && parsed.unit ? [{
          quantity: parseFloat(parsed.quantity) || 1,
          unit: normalizeUnit(parsed.unit)
        }] : []
      };
    } else if (ingredient.display_text) {
      return ingredient;
    } else {
      return {
        name: ingredient.name || "Unknown ingredient",
        display_text: ingredient.display_text || ingredient.name || "Unknown ingredient",
        measurements: ingredient.measurements || []
      };
    }
  });
}
function parseIngredientString(ingredientStr) {
  const cleaned = ingredientStr.trim();
  const patterns = [
    // "2 cups flour" or "1/2 cup milk"
    /^(\d+(?:\/\d+)?(?:\.\d+)?)\s+(\w+)\s+(.+?)(?:,\s*(.+))?$/,
    // "1 large onion, diced"
    /^(\d+)\s+(\w+)\s+(.+?)(?:,\s*(.+))?$/,
    // "Salt and pepper to taste"
    /^(.+?)\s+to\s+taste$/
  ];
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      if (pattern.source.includes("to\\s+taste")) {
        return {
          quantity: "",
          unit: "",
          ingredient: match[1],
          preparation: "to taste"
        };
      } else {
        return {
          quantity: match[1] || "",
          unit: match[2] || "",
          ingredient: match[3] || "",
          preparation: match[4] || void 0
        };
      }
    }
  }
  return {
    quantity: "",
    unit: "",
    ingredient: cleaned
  };
}
function normalizeUnit(unit) {
  const unitMap = {
    "cups": "cup",
    "tbsp": "tablespoon",
    "tsp": "teaspoon",
    "lbs": "pound",
    "lb": "pound",
    "oz": "ounce",
    "kg": "kilogram",
    "g": "gram",
    "ml": "milliliter",
    "l": "liter"
  };
  const lowerUnit = unit.toLowerCase();
  return unitMap[lowerUnit] || lowerUnit;
}
async function createOptimizedShoppingList(mealPlan, userPreferences) {
  try {
    const { optimizeMealPlanForIngredients: optimizeMealPlanForIngredients2, generateOrganizedShoppingList: generateOrganizedShoppingList2 } = await Promise.resolve().then(() => (init_smartIngredientOptimizer(), smartIngredientOptimizer_exports));
    const optimization = optimizeMealPlanForIngredients2(mealPlan);
    const organizedList = generateOrganizedShoppingList2(optimization.ingredientAnalysis);
    return {
      shoppingList: optimization.shoppingList,
      organizedSections: organizedList,
      totalSavings: organizedList.totalSavings,
      highValueItems: organizedList.highValueItems,
      ingredientAnalysis: optimization.ingredientAnalysis,
      recommendations: generateShoppingRecommendations(organizedList)
    };
  } catch (error) {
    console.error("Error creating optimized shopping list:", error);
    throw new Error(`Failed to create shopping list: ${error.message}`);
  }
}
function generateShoppingRecommendations(organizedList) {
  const recommendations = [];
  if (organizedList.totalSavings > 5) {
    recommendations.push(`\u{1F4B0} Estimated total savings: $${organizedList.totalSavings.toFixed(2)} with bulk buying`);
  }
  if (organizedList.highValueItems.length > 0) {
    recommendations.push(`\u{1F3AF} Priority items for maximum savings: ${organizedList.highValueItems.slice(0, 3).join(", ")}`);
  }
  if (organizedList.meat.length > 2) {
    recommendations.push(`\u{1F969} Consider buying proteins in bulk and freezing portions`);
  }
  if (organizedList.produce.length > 3) {
    recommendations.push(`\u{1F96C} Shop produce section first and prep items that can be washed/chopped in advance`);
  }
  recommendations.push(`\u{1F4CB} Shop by department: Produce \u2192 Meat \u2192 Dairy \u2192 Pantry for efficiency`);
  return recommendations;
}
var init_instacart = __esm({
  "server/instacart.ts"() {
    "use strict";
  }
});

// server/auth.ts
var auth_exports = {};
__export(auth_exports, {
  authenticateToken: () => authenticateToken,
  generateToken: () => generateToken,
  getCurrentUser: () => getCurrentUser,
  hashPassword: () => hashPassword,
  loginUser: () => loginUser,
  registerUser: () => registerUser,
  verifyPassword: () => verifyPassword,
  verifyToken: () => verifyToken
});
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}
async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}
async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: "Invalid token" });
  }
  try {
    const user = await storage.getUser(Number(decoded.userId));
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Authentication error" });
  }
}
async function registerUser(req, res) {
  try {
    const validatedData = registerSchema.parse(req.body);
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }
    const hashedPassword = await hashPassword(validatedData.password);
    const user = await storage.createUser({
      email: validatedData.email,
      phone: validatedData.phone,
      password_hash: hashedPassword,
      full_name: validatedData.full_name
    });
    const token = generateToken(user.id.toString());
    const { password_hash, ...userWithoutPassword } = user;
    res.status(201).json({
      user: userWithoutPassword,
      token,
      message: "User registered successfully"
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors
      });
    }
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
}
async function loginUser(req, res) {
  try {
    const validatedData = loginSchema.parse(req.body);
    const user = await storage.getUserByEmail(validatedData.email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.password_hash || !await verifyPassword(validatedData.password, user.password_hash)) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = generateToken(user.id.toString());
    const { password_hash, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token,
      message: "Login successful"
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors
      });
    }
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
}
async function getCurrentUser(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const { password_hash, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Failed to get user" });
  }
}
var JWT_SECRET, JWT_EXPIRES_IN;
var init_auth = __esm({
  "server/auth.ts"() {
    "use strict";
    init_storage();
    init_schema();
    JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
    JWT_EXPIRES_IN = "7d";
  }
});

// server/nutritionCalculator.ts
var nutritionCalculator_exports = {};
__export(nutritionCalculator_exports, {
  calculateRecipeNutrition: () => calculateRecipeNutrition
});
function parseIngredientQuantity(ingredientText) {
  const text2 = ingredientText.toLowerCase().trim();
  const patterns = [
    // Fractions: 1/2, 3/4, etc.
    /^(\d+\/\d+)\s*(\w+)?\s+(.+)/,
    // Decimals: 1.5, 0.25, etc.
    /^(\d*\.?\d+)\s*(\w+)?\s+(.+)/,
    // Range: 1-2, 2-3, etc.
    /^(\d+)-\d+\s*(\w+)?\s+(.+)/,
    // Just number: 2 cups, 1 pound, etc.
    /^(\d+)\s*(\w+)?\s+(.+)/
  ];
  for (const pattern of patterns) {
    const match = text2.match(pattern);
    if (match) {
      let quantity = 1;
      if (match[1].includes("/")) {
        const [num, den] = match[1].split("/").map(Number);
        quantity = num / den;
      } else {
        quantity = parseFloat(match[1]);
      }
      const unit = match[2] || "";
      const foodName = match[3].trim();
      return { quantity, unit, foodName };
    }
  }
  return { quantity: 1, unit: "", foodName: text2 };
}
function convertToGrams(quantity, unit, foodType) {
  const unitConversions = {
    // Weight units (already in grams or convert to grams)
    "g": 1,
    "gram": 1,
    "grams": 1,
    "kg": 1e3,
    "kilogram": 1e3,
    "lb": 453.592,
    "lbs": 453.592,
    "pound": 453.592,
    "pounds": 453.592,
    "oz": 28.3495,
    "ounce": 28.3495,
    "ounces": 28.3495,
    // Volume to weight conversions (approximate)
    "cup": 240,
    // ml, varies by ingredient
    "cups": 240,
    "tbsp": 15,
    // ml
    "tablespoon": 15,
    "tablespoons": 15,
    "tsp": 5,
    // ml
    "teaspoon": 5,
    "teaspoons": 5,
    "ml": 1,
    // for liquids, 1ml ≈ 1g
    "milliliter": 1,
    "l": 1e3,
    // liters
    "liter": 1e3,
    "liters": 1e3
  };
  const densityAdjustments = {
    "flour": 0.5,
    // flour is lighter
    "sugar": 0.8,
    // sugar is denser
    "oil": 0.9,
    // oil is less dense than water
    "butter": 0.9,
    // butter density
    "rice": 0.8,
    // dry rice
    "pasta": 0.6
    // dry pasta
  };
  let grams = quantity * (unitConversions[unit.toLowerCase()] || 100);
  if (["cup", "cups", "tbsp", "tablespoon", "tablespoons", "tsp", "teaspoon", "teaspoons"].includes(unit.toLowerCase())) {
    for (const [food, adjustment] of Object.entries(densityAdjustments)) {
      if (foodType.toLowerCase().includes(food)) {
        grams *= adjustment;
        break;
      }
    }
  }
  return Math.max(grams, 10);
}
async function calculateIngredientNutrition(ingredientText, usdaNutrition) {
  const { quantity, unit, foodName } = parseIngredientQuantity(ingredientText);
  const grams = convertToGrams(quantity, unit, foodName);
  const scale = grams / 100;
  const calories = (usdaNutrition.calories || 0) * scale;
  const protein = (usdaNutrition.protein || 0) * scale;
  const carbs = (usdaNutrition.carbs || 0) * scale;
  const fat = (usdaNutrition.fat || 0) * scale;
  const fiber = (usdaNutrition.fiber || 0) * scale;
  const sugar = (usdaNutrition.sugar || 0) * scale;
  const sodium = (usdaNutrition.sodium || 0) * scale;
  console.log(`Nutrition for ${ingredientText}: ${Math.round(calories)}cal (${grams}g scaled from ${quantity} ${unit})`);
  return {
    calories: Math.round(calories),
    protein: Math.round(protein * 100) / 100,
    carbs: Math.round(carbs * 100) / 100,
    fat: Math.round(fat * 100) / 100,
    fiber: Math.round(fiber * 100) / 100,
    sugar: Math.round(sugar * 100) / 100,
    sodium: Math.round(sodium * 100) / 100
  };
}
function estimateServings(recipe) {
  const title = recipe.title?.toLowerCase() || "";
  const instructions = recipe.instructions?.join(" ").toLowerCase() || "";
  const description = recipe.description?.toLowerCase() || "";
  const servingPatterns = [
    /serves?\s+(\d+)/,
    /(\d+)\s+servings?/,
    /makes?\s+(\d+)/,
    /portions?\s+(\d+)/,
    /(\d+)\s+portions?/,
    /feeds?\s+(\d+)/,
    /for\s+(\d+)\s+people/
  ];
  const allText = `${title} ${instructions} ${description}`;
  for (const pattern of servingPatterns) {
    const match = allText.match(pattern);
    if (match) {
      const servings = parseInt(match[1]);
      if (servings >= 1 && servings <= 12) {
        return servings;
      }
    }
  }
  const hasLargeQuantities = recipe.ingredients?.some((ing) => {
    const ingredientText = typeof ing === "string" ? ing : ing.display_text || ing.name || String(ing);
    const text2 = String(ingredientText).toLowerCase();
    return text2.includes("lb") || text2.includes("pound") || text2.includes("2 cup") || text2.includes("3 cup") || text2.includes("large") || text2.includes("whole");
  });
  if (title.includes("family") || hasLargeQuantities) return 6;
  if (title.includes("single") || title.includes("one")) return 1;
  if (title.includes("couple") || title.includes("two")) return 2;
  return 4;
}
async function calculateRecipeNutrition(recipe, getUSDANutrition) {
  const servings = estimateServings(recipe);
  console.log(`Estimated servings for "${recipe.title}": ${servings}`);
  let totalNutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0
  };
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    for (const ingredient of recipe.ingredients) {
      const ingredientText = typeof ingredient === "string" ? ingredient : ingredient.display_text || ingredient.name || String(ingredient);
      try {
        const cleanIngredientText = String(ingredientText).trim();
        if (!cleanIngredientText) continue;
        const { foodName } = parseIngredientQuantity(cleanIngredientText);
        const usdaNutrition = await getUSDANutrition(foodName);
        if (usdaNutrition) {
          const nutrition = await calculateIngredientNutrition(cleanIngredientText, usdaNutrition);
          totalNutrition.calories += nutrition.calories;
          totalNutrition.protein += nutrition.protein;
          totalNutrition.carbs += nutrition.carbs;
          totalNutrition.fat += nutrition.fat;
          totalNutrition.fiber += nutrition.fiber;
          totalNutrition.sugar += nutrition.sugar;
          totalNutrition.sodium += nutrition.sodium;
        }
      } catch (error) {
        console.error(`Error calculating nutrition for ${ingredientText}:`, error);
      }
    }
  }
  const perServing = {
    calories: Math.round(totalNutrition.calories / servings),
    protein: Math.round(totalNutrition.protein / servings * 100) / 100,
    carbs: Math.round(totalNutrition.carbs / servings * 100) / 100,
    fat: Math.round(totalNutrition.fat / servings * 100) / 100,
    fiber: Math.round(totalNutrition.fiber / servings * 100) / 100,
    sugar: Math.round(totalNutrition.sugar / servings * 100) / 100,
    sodium: Math.round(totalNutrition.sodium / servings * 100) / 100
  };
  console.log(`Total nutrition: ${totalNutrition.calories}cal for ${servings} servings`);
  console.log(`Per serving: ${perServing.calories}cal, ${perServing.protein}g protein, ${perServing.carbs}g carbs, ${perServing.fat}g fat`);
  return {
    ...totalNutrition,
    servings,
    perServing
  };
}
var init_nutritionCalculator = __esm({
  "server/nutritionCalculator.ts"() {
    "use strict";
  }
});

// server/familiarDishNameMapper.ts
var familiarDishNameMapper_exports = {};
__export(familiarDishNameMapper_exports, {
  FAMILIAR_DISH_MAPPINGS: () => FAMILIAR_DISH_MAPPINGS,
  GENERIC_DISH_PATTERNS: () => GENERIC_DISH_PATTERNS,
  getCuisineEnhancements: () => getCuisineEnhancements,
  getFamiliarDishesByCuisine: () => getFamiliarDishesByCuisine,
  mapToFamiliarDishName: () => mapToFamiliarDishName,
  searchFamiliarDishes: () => searchFamiliarDishes,
  validateDishCuisineMatch: () => validateDishCuisineMatch
});
function mapToFamiliarDishName(originalTitle, detectedCuisine, ingredients) {
  if (!originalTitle) {
    return {
      familiarName: "Unknown Dish",
      cuisine: "International",
      confidence: 0.1
    };
  }
  if (detectedCuisine) {
    const cuisineMapping = FAMILIAR_DISH_MAPPINGS.find(
      (c) => c.cuisine.toLowerCase() === detectedCuisine.toLowerCase()
    );
    if (cuisineMapping) {
      for (const dish of cuisineMapping.commonDishes) {
        if (matchesDishPattern(originalTitle, dish.originalPattern)) {
          return {
            familiarName: dish.familiarName,
            cuisine: dish.cuisine,
            confidence: 0.9,
            mapping: dish
          };
        }
      }
    }
  }
  for (const cuisineMapping of FAMILIAR_DISH_MAPPINGS) {
    for (const dish of cuisineMapping.commonDishes) {
      if (matchesDishPattern(originalTitle, dish.originalPattern)) {
        return {
          familiarName: dish.familiarName,
          cuisine: dish.cuisine,
          confidence: 0.8,
          mapping: dish
        };
      }
    }
  }
  for (const pattern of GENERIC_DISH_PATTERNS) {
    if (matchesDishPattern(originalTitle, pattern.originalPattern)) {
      const enhancedName = enhanceGenericName(originalTitle, pattern, ingredients);
      return {
        familiarName: enhancedName,
        cuisine: pattern.cuisine,
        confidence: 0.6,
        mapping: pattern
      };
    }
  }
  const cleanedTitle = cleanUpDishTitle(originalTitle);
  const detectedCuisineFromTitle = detectCuisineFromTitle(originalTitle);
  return {
    familiarName: cleanedTitle,
    cuisine: detectedCuisineFromTitle || "International",
    confidence: 0.4
  };
}
function getFamiliarDishesByCuisine(cuisine) {
  const cuisineMapping = FAMILIAR_DISH_MAPPINGS.find(
    (c) => c.cuisine.toLowerCase() === cuisine.toLowerCase()
  );
  return cuisineMapping ? cuisineMapping.commonDishes : [];
}
function searchFamiliarDishes(query) {
  const results = [];
  const normalizedQuery = query.toLowerCase();
  for (const cuisineMapping of FAMILIAR_DISH_MAPPINGS) {
    for (const dish of cuisineMapping.commonDishes) {
      if (dish.familiarName.toLowerCase().includes(normalizedQuery)) {
        results.push(dish);
        continue;
      }
      if (dish.aliases.some((alias) => alias.toLowerCase().includes(normalizedQuery))) {
        results.push(dish);
        continue;
      }
      if (matchesDishPattern(query, dish.originalPattern)) {
        results.push(dish);
      }
    }
  }
  return results;
}
function matchesDishPattern(title, pattern) {
  if (pattern instanceof RegExp) {
    return pattern.test(title);
  }
  return title.toLowerCase().includes(pattern.toLowerCase());
}
function enhanceGenericName(originalTitle, pattern, ingredients) {
  let enhanced = pattern.familiarName;
  if (ingredients && ingredients.length > 0) {
    const mainIngredient = findMainIngredient(ingredients);
    if (mainIngredient) {
      enhanced = `${mainIngredient} ${enhanced}`;
    }
  } else {
    const extractedIngredient = extractMainIngredientFromTitle(originalTitle);
    if (extractedIngredient) {
      enhanced = `${extractedIngredient} ${enhanced}`;
    }
  }
  return enhanced;
}
function findMainIngredient(ingredients) {
  const proteins = ["chicken", "beef", "pork", "fish", "salmon", "shrimp", "tofu", "turkey"];
  const vegetables = ["broccoli", "mushroom", "pepper", "onion", "carrot", "spinach"];
  for (const ingredient of ingredients) {
    const ingredientStr = typeof ingredient === "string" ? ingredient : ingredient.name || "";
    for (const protein of proteins) {
      if (ingredientStr.toLowerCase().includes(protein)) {
        return protein.charAt(0).toUpperCase() + protein.slice(1);
      }
    }
  }
  for (const ingredient of ingredients) {
    const ingredientStr = typeof ingredient === "string" ? ingredient : ingredient.name || "";
    for (const vegetable of vegetables) {
      if (ingredientStr.toLowerCase().includes(vegetable)) {
        return vegetable.charAt(0).toUpperCase() + vegetable.slice(1);
      }
    }
  }
  return null;
}
function extractMainIngredientFromTitle(title) {
  const words = title.toLowerCase().split(/\s+/);
  const proteins = ["chicken", "beef", "pork", "fish", "salmon", "shrimp", "tofu", "turkey"];
  const vegetables = ["broccoli", "mushroom", "pepper", "onion", "carrot", "spinach"];
  for (const word of words) {
    for (const protein of proteins) {
      if (word.includes(protein)) {
        return protein.charAt(0).toUpperCase() + protein.slice(1);
      }
    }
  }
  for (const word of words) {
    for (const vegetable of vegetables) {
      if (word.includes(vegetable)) {
        return vegetable.charAt(0).toUpperCase() + vegetable.slice(1);
      }
    }
  }
  return null;
}
function cleanUpDishTitle(title) {
  let cleaned = title.replace(/^(AI\s+|Generated\s+|Recipe\s+for\s+)/i, "");
  cleaned = cleaned.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned;
}
function detectCuisineFromTitle(title) {
  const cuisineKeywords = {
    "Italian": ["italian", "pasta", "pizza", "risotto", "parmesan", "marinara"],
    "Chinese": ["chinese", "stir-fry", "wok", "soy sauce", "rice", "noodles"],
    "Mexican": ["mexican", "tacos", "salsa", "guacamole", "beans", "tortilla"],
    "Indian": ["indian", "curry", "spices", "turmeric", "cumin", "garam"],
    "Thai": ["thai", "coconut", "lemongrass", "basil", "lime", "chili"],
    "Japanese": ["japanese", "sushi", "soy", "miso", "wasabi", "sake"],
    "American": ["american", "bbq", "grill", "fries", "burger", "ranch"]
  };
  const normalizedTitle = title.toLowerCase();
  for (const [cuisine, keywords] of Object.entries(cuisineKeywords)) {
    if (keywords.some((keyword) => normalizedTitle.includes(keyword))) {
      return cuisine;
    }
  }
  return null;
}
function getCuisineEnhancements(cuisine) {
  const cuisineMapping = FAMILIAR_DISH_MAPPINGS.find(
    (c) => c.cuisine.toLowerCase() === cuisine.toLowerCase()
  );
  return {
    modifiers: cuisineMapping?.defaultModifiers || ["Traditional"],
    cookingMethods: cuisineMapping?.cookingMethods || ["Cooked"]
  };
}
function validateDishCuisineMatch(dishName, expectedCuisine) {
  const mapping = mapToFamiliarDishName(dishName, expectedCuisine);
  const isMatch = mapping.cuisine.toLowerCase() === expectedCuisine.toLowerCase();
  if (!isMatch && mapping.confidence > 0.7) {
    const correctCuisineDishes = getFamiliarDishesByCuisine(expectedCuisine);
    const suggested = correctCuisineDishes[0]?.familiarName;
    return {
      isMatch: false,
      confidence: mapping.confidence,
      suggestedCorrection: suggested
    };
  }
  return {
    isMatch,
    confidence: mapping.confidence
  };
}
var FAMILIAR_DISH_MAPPINGS, GENERIC_DISH_PATTERNS;
var init_familiarDishNameMapper = __esm({
  "server/familiarDishNameMapper.ts"() {
    "use strict";
    FAMILIAR_DISH_MAPPINGS = [
      {
        cuisine: "Italian",
        defaultModifiers: ["Classic", "Homestyle", "Traditional"],
        cookingMethods: ["Baked", "Pan-fried", "Grilled"],
        commonDishes: [
          {
            originalPattern: /spaghetti.*carbonara/i,
            familiarName: "Spaghetti Carbonara",
            cuisine: "Italian",
            category: "pasta",
            aliases: ["carbonara pasta", "creamy bacon pasta"]
          },
          {
            originalPattern: /lasagna|lasagne/i,
            familiarName: "Lasagna",
            cuisine: "Italian",
            category: "pasta",
            aliases: ["layered pasta", "baked pasta"]
          },
          {
            originalPattern: /chicken.*parmigiana|chicken.*parmesan/i,
            familiarName: "Chicken Parmesan",
            cuisine: "Italian",
            category: "entree",
            aliases: ["chicken parmigiana", "breaded chicken"]
          },
          {
            originalPattern: /fettuccine.*alfredo/i,
            familiarName: "Fettuccine Alfredo",
            cuisine: "Italian",
            category: "pasta",
            aliases: ["creamy pasta", "alfredo pasta"]
          },
          {
            originalPattern: /margherita.*pizza/i,
            familiarName: "Margherita Pizza",
            cuisine: "Italian",
            category: "pizza",
            aliases: ["cheese pizza", "tomato basil pizza"]
          },
          {
            originalPattern: /risotto/i,
            familiarName: "Risotto",
            cuisine: "Italian",
            category: "rice",
            aliases: ["creamy rice", "italian rice"]
          }
        ]
      },
      {
        cuisine: "Chinese",
        defaultModifiers: ["Authentic", "Traditional", "Classic"],
        cookingMethods: ["Stir-fried", "Steamed", "Braised"],
        commonDishes: [
          {
            originalPattern: /beef.*stir.?fry|stir.?fry.*beef/i,
            familiarName: "Beef Stir Fry",
            cuisine: "Chinese",
            category: "entree",
            aliases: ["beef and vegetables", "wok beef"]
          },
          {
            originalPattern: /fried.*rice/i,
            familiarName: "Fried Rice",
            cuisine: "Chinese",
            category: "rice",
            aliases: ["chinese fried rice", "wok rice"]
          },
          {
            originalPattern: /sweet.*sour.*pork|sweet.*sour.*chicken/i,
            familiarName: "Sweet and Sour Pork",
            cuisine: "Chinese",
            category: "entree",
            aliases: ["sweet sour pork", "glazed pork"]
          },
          {
            originalPattern: /kung.*pao.*chicken/i,
            familiarName: "Kung Pao Chicken",
            cuisine: "Chinese",
            category: "entree",
            aliases: ["spicy peanut chicken", "sichuan chicken"]
          },
          {
            originalPattern: /lo.*mein/i,
            familiarName: "Lo Mein",
            cuisine: "Chinese",
            category: "noodles",
            aliases: ["soft noodles", "chinese noodles"]
          },
          {
            originalPattern: /dumplings|potstickers/i,
            familiarName: "Dumplings",
            cuisine: "Chinese",
            category: "appetizer",
            aliases: ["potstickers", "steamed dumplings"]
          }
        ]
      },
      {
        cuisine: "Mexican",
        defaultModifiers: ["Authentic", "Traditional", "Classic"],
        cookingMethods: ["Grilled", "Slow-cooked", "Pan-fried"],
        commonDishes: [
          {
            originalPattern: /beef.*tacos|chicken.*tacos|fish.*tacos/i,
            familiarName: "Tacos",
            cuisine: "Mexican",
            category: "entree",
            aliases: ["soft tacos", "street tacos"]
          },
          {
            originalPattern: /quesadilla/i,
            familiarName: "Quesadilla",
            cuisine: "Mexican",
            category: "entree",
            aliases: ["cheese tortilla", "grilled tortilla"]
          },
          {
            originalPattern: /enchiladas/i,
            familiarName: "Enchiladas",
            cuisine: "Mexican",
            category: "entree",
            aliases: ["rolled tortillas", "sauced tortillas"]
          },
          {
            originalPattern: /burrito/i,
            familiarName: "Burrito",
            cuisine: "Mexican",
            category: "entree",
            aliases: ["wrapped tortilla", "stuffed tortilla"]
          },
          {
            originalPattern: /guacamole/i,
            familiarName: "Guacamole",
            cuisine: "Mexican",
            category: "appetizer",
            aliases: ["avocado dip", "mexican avocado"]
          },
          {
            originalPattern: /carnitas/i,
            familiarName: "Carnitas",
            cuisine: "Mexican",
            category: "entree",
            aliases: ["slow-cooked pork", "shredded pork"]
          }
        ]
      },
      {
        cuisine: "Indian",
        defaultModifiers: ["Authentic", "Traditional", "Spiced"],
        cookingMethods: ["Curried", "Tandoori", "Slow-cooked"],
        commonDishes: [
          {
            originalPattern: /chicken.*tikka.*masala/i,
            familiarName: "Chicken Tikka Masala",
            cuisine: "Indian",
            category: "curry",
            aliases: ["creamy chicken curry", "tomato chicken curry"]
          },
          {
            originalPattern: /butter.*chicken/i,
            familiarName: "Butter Chicken",
            cuisine: "Indian",
            category: "curry",
            aliases: ["murgh makhani", "creamy chicken"]
          },
          {
            originalPattern: /biryani/i,
            familiarName: "Biryani",
            cuisine: "Indian",
            category: "rice",
            aliases: ["spiced rice", "layered rice"]
          },
          {
            originalPattern: /naan/i,
            familiarName: "Naan Bread",
            cuisine: "Indian",
            category: "bread",
            aliases: ["indian bread", "flatbread"]
          },
          {
            originalPattern: /dal|lentil.*curry/i,
            familiarName: "Dal",
            cuisine: "Indian",
            category: "curry",
            aliases: ["lentil curry", "spiced lentils"]
          },
          {
            originalPattern: /samosa/i,
            familiarName: "Samosa",
            cuisine: "Indian",
            category: "appetizer",
            aliases: ["fried pastry", "stuffed pastry"]
          }
        ]
      },
      {
        cuisine: "Thai",
        defaultModifiers: ["Authentic", "Traditional", "Fresh"],
        cookingMethods: ["Stir-fried", "Steamed", "Grilled"],
        commonDishes: [
          {
            originalPattern: /pad.*thai/i,
            familiarName: "Pad Thai",
            cuisine: "Thai",
            category: "noodles",
            aliases: ["thai noodles", "stir-fried noodles"]
          },
          {
            originalPattern: /green.*curry|red.*curry|yellow.*curry/i,
            familiarName: "Thai Curry",
            cuisine: "Thai",
            category: "curry",
            aliases: ["coconut curry", "thai coconut curry"]
          },
          {
            originalPattern: /tom.*yum/i,
            familiarName: "Tom Yum Soup",
            cuisine: "Thai",
            category: "soup",
            aliases: ["spicy thai soup", "lemongrass soup"]
          },
          {
            originalPattern: /massaman.*curry/i,
            familiarName: "Massaman Curry",
            cuisine: "Thai",
            category: "curry",
            aliases: ["mild thai curry", "peanut curry"]
          },
          {
            originalPattern: /som.*tam/i,
            familiarName: "Som Tam",
            cuisine: "Thai",
            category: "salad",
            aliases: ["papaya salad", "green papaya salad"]
          }
        ]
      },
      {
        cuisine: "Japanese",
        defaultModifiers: ["Authentic", "Traditional", "Fresh"],
        cookingMethods: ["Grilled", "Steamed", "Raw"],
        commonDishes: [
          {
            originalPattern: /sushi/i,
            familiarName: "Sushi",
            cuisine: "Japanese",
            category: "appetizer",
            aliases: ["raw fish", "rice rolls"]
          },
          {
            originalPattern: /ramen/i,
            familiarName: "Ramen",
            cuisine: "Japanese",
            category: "soup",
            aliases: ["japanese noodle soup", "noodle bowl"]
          },
          {
            originalPattern: /tempura/i,
            familiarName: "Tempura",
            cuisine: "Japanese",
            category: "appetizer",
            aliases: ["battered vegetables", "fried vegetables"]
          },
          {
            originalPattern: /teriyaki.*chicken|chicken.*teriyaki/i,
            familiarName: "Chicken Teriyaki",
            cuisine: "Japanese",
            category: "entree",
            aliases: ["glazed chicken", "sweet soy chicken"]
          },
          {
            originalPattern: /miso.*soup/i,
            familiarName: "Miso Soup",
            cuisine: "Japanese",
            category: "soup",
            aliases: ["soybean soup", "japanese soup"]
          }
        ]
      },
      {
        cuisine: "American",
        defaultModifiers: ["Classic", "Traditional", "Homestyle"],
        cookingMethods: ["Grilled", "Fried", "Baked"],
        commonDishes: [
          {
            originalPattern: /burger|hamburger/i,
            familiarName: "Hamburger",
            cuisine: "American",
            category: "entree",
            aliases: ["burger", "beef patty"]
          },
          {
            originalPattern: /mac.*cheese|macaroni.*cheese/i,
            familiarName: "Mac and Cheese",
            cuisine: "American",
            category: "entree",
            aliases: ["macaroni and cheese", "cheese pasta"]
          },
          {
            originalPattern: /fried.*chicken/i,
            familiarName: "Fried Chicken",
            cuisine: "American",
            category: "entree",
            aliases: ["crispy chicken", "southern chicken"]
          },
          {
            originalPattern: /bbq.*ribs|barbecue.*ribs/i,
            familiarName: "BBQ Ribs",
            cuisine: "American",
            category: "entree",
            aliases: ["barbecue ribs", "smoked ribs"]
          },
          {
            originalPattern: /caesar.*salad/i,
            familiarName: "Caesar Salad",
            cuisine: "American",
            category: "salad",
            aliases: ["romaine salad", "parmesan salad"]
          }
        ]
      }
    ];
    GENERIC_DISH_PATTERNS = [
      {
        originalPattern: /stir.?fry/i,
        familiarName: "Stir Fry",
        cuisine: "International",
        category: "entree",
        aliases: ["wok dish", "stir-fried vegetables"]
      },
      {
        originalPattern: /curry/i,
        familiarName: "Curry",
        cuisine: "International",
        category: "curry",
        aliases: ["spiced stew", "curried dish"]
      },
      {
        originalPattern: /soup/i,
        familiarName: "Soup",
        cuisine: "International",
        category: "soup",
        aliases: ["broth", "stew"]
      },
      {
        originalPattern: /salad/i,
        familiarName: "Salad",
        cuisine: "International",
        category: "salad",
        aliases: ["mixed greens", "fresh vegetables"]
      },
      {
        originalPattern: /pasta/i,
        familiarName: "Pasta",
        cuisine: "International",
        category: "pasta",
        aliases: ["noodles", "spaghetti"]
      }
    ];
  }
});

// server/dietaryCulturalConflictResolver.ts
var dietaryCulturalConflictResolver_exports = {};
__export(dietaryCulturalConflictResolver_exports, {
  CONFLICT_PATTERNS: () => CONFLICT_PATTERNS,
  getIngredientSubstitutions: () => getIngredientSubstitutions,
  hasQuickConflict: () => hasQuickConflict,
  resolveConflictsWithCuisineData: () => resolveConflictsWithCuisineData,
  resolveDietaryCulturalConflicts: () => resolveDietaryCulturalConflicts
});
async function resolveDietaryCulturalConflicts(mealRequest, dietaryRestrictions, culturalBackground) {
  const startTime = Date.now();
  console.log(`\u{1F50D} Analyzing conflicts for: "${mealRequest}" with restrictions: [${dietaryRestrictions.join(", ")}] and cultures: [${culturalBackground.join(", ")}]`);
  const normalizedRequest = mealRequest.toLowerCase();
  const normalizedRestrictions = dietaryRestrictions.map((r) => r.toLowerCase());
  const conflicts = detectConflicts(normalizedRequest, normalizedRestrictions);
  if (conflicts.length === 0) {
    return {
      hasConflict: false,
      conflictType: "none",
      originalRequest: mealRequest,
      suggestedAlternatives: [],
      confidence: 1,
      culturalAuthenticity: 1,
      explanations: ["No conflicts detected - meal aligns with dietary restrictions"]
    };
  }
  const alternatives = await generateAlternatives(
    mealRequest,
    conflicts,
    normalizedRestrictions,
    culturalBackground
  );
  const confidence = calculateConfidenceScore(conflicts, alternatives);
  const culturalAuthenticity = calculateCulturalAuthenticity(alternatives, culturalBackground);
  const explanations = generateConflictExplanations(conflicts, alternatives);
  console.log(`\u2705 Conflict resolution complete in ${Date.now() - startTime}ms. Found ${alternatives.length} alternatives.`);
  return {
    hasConflict: true,
    conflictType: determineConflictType(conflicts),
    originalRequest: mealRequest,
    suggestedAlternatives: alternatives,
    confidence,
    culturalAuthenticity,
    explanations
  };
}
function detectConflicts(mealRequest, dietaryRestrictions) {
  const conflicts = [];
  for (const restriction of dietaryRestrictions) {
    const pattern = CONFLICT_PATTERNS.find(
      (p) => p.dietary.some((d) => restriction.includes(d))
    );
    if (pattern) {
      const foundConflicts = pattern.conflictsWith.filter(
        (conflictItem) => mealRequest.includes(conflictItem)
      );
      if (foundConflicts.length > 0) {
        conflicts.push({
          restriction,
          pattern,
          conflictingItems: foundConflicts
        });
      }
    }
  }
  return conflicts;
}
async function generateAlternatives(originalRequest, conflicts, dietaryRestrictions, culturalBackground) {
  const alternatives = [];
  for (const culture of culturalBackground) {
    const culturalAlternatives = generateCulturalAlternatives(
      originalRequest,
      conflicts,
      culture,
      dietaryRestrictions
    );
    alternatives.push(...culturalAlternatives);
  }
  if (culturalBackground.length === 0) {
    const genericAlternatives = generateGenericAlternatives(originalRequest, conflicts);
    alternatives.push(...genericAlternatives);
  }
  return alternatives.sort((a, b) => b.culturalAuthenticity - a.culturalAuthenticity).slice(0, 5);
}
function generateCulturalAlternatives(originalRequest, conflicts, culture, dietaryRestrictions) {
  const alternatives = [];
  const culturalContext = CULTURAL_SUBSTITUTION_CONTEXT[culture] || {};
  const dishType = extractDishType(originalRequest);
  for (const conflict of conflicts) {
    for (const conflictingItem of conflict.conflictingItems) {
      const substitutions = conflict.pattern.substitutions[conflictingItem] || [];
      for (const substitute of substitutions.slice(0, 2)) {
        const culturalSubstitute = culturalContext[conflictingItem] || {
          substitute,
          preparation: `traditional ${culture.toLowerCase()} style`,
          culturalNote: `Adapted for ${culture} cuisine`
        };
        const newDishName = generateDishName(originalRequest, conflictingItem, culturalSubstitute.substitute, culture);
        alternatives.push({
          dishName: newDishName,
          cuisine: culture,
          description: `${culture} ${dishType} with ${culturalSubstitute.substitute} instead of ${conflictingItem}`,
          substituteIngredients: [{
            original: conflictingItem,
            substitute: culturalSubstitute.substitute,
            reason: `Dietary restriction: ${conflict.restriction}`,
            culturalContext: culturalSubstitute.culturalNote
          }],
          difficultyRating: estimateDifficulty(newDishName, culturalSubstitute.substitute),
          cookTime: estimateCookTime(newDishName, culturalSubstitute.substitute),
          culturalNotes: culturalSubstitute.culturalNote,
          dietaryCompliance: dietaryRestrictions
        });
      }
    }
  }
  return alternatives;
}
function generateGenericAlternatives(originalRequest, conflicts) {
  const alternatives = [];
  for (const conflict of conflicts) {
    for (const conflictingItem of conflict.conflictingItems) {
      const substitutions = conflict.pattern.substitutions[conflictingItem] || [];
      const bestSubstitute = substitutions[0];
      if (bestSubstitute) {
        const newDishName = generateDishName(originalRequest, conflictingItem, bestSubstitute, "International");
        alternatives.push({
          dishName: newDishName,
          cuisine: "International",
          description: `Modified version with ${bestSubstitute} instead of ${conflictingItem}`,
          substituteIngredients: [{
            original: conflictingItem,
            substitute: bestSubstitute,
            reason: `Dietary restriction: ${conflict.restriction}`
          }],
          difficultyRating: estimateDifficulty(newDishName, bestSubstitute),
          cookTime: estimateCookTime(newDishName, bestSubstitute),
          culturalNotes: "International fusion adaptation",
          dietaryCompliance: [conflict.restriction]
        });
      }
    }
  }
  return alternatives;
}
function extractDishType(request) {
  const dishTypes = ["stir-fry", "curry", "soup", "salad", "pasta", "rice", "noodles", "casserole", "sandwich"];
  const found = dishTypes.find((type) => request.toLowerCase().includes(type));
  return found || "dish";
}
function generateDishName(original, conflictItem, substitute, culture) {
  const baseName = original.replace(new RegExp(conflictItem, "gi"), substitute);
  return `${culture} ${baseName}`.replace(/\s+/g, " ").trim();
}
function estimateDifficulty(dishName, substitute) {
  const complexSubstitutes = ["tempeh", "seitan", "cashew cheese"];
  const mediumSubstitutes = ["tofu", "mushrooms", "nutritional yeast"];
  if (complexSubstitutes.some((s) => substitute.includes(s))) return 3;
  if (mediumSubstitutes.some((s) => substitute.includes(s))) return 2;
  return 1.5;
}
function estimateCookTime(dishName, substitute) {
  if (dishName.includes("stir-fry")) return 15;
  if (dishName.includes("soup") || dishName.includes("curry")) return 30;
  if (dishName.includes("casserole") || dishName.includes("baked")) return 45;
  return 25;
}
function determineConflictType(conflicts) {
  if (conflicts.length === 0) return "none";
  if (conflicts.some((c) => c.conflictingItems.length > 0)) return "ingredient";
  return "dietary_restriction";
}
function calculateConfidenceScore(conflicts, alternatives) {
  if (alternatives.length === 0) return 0.1;
  if (alternatives.length >= 3) return 0.9;
  return 0.7;
}
function calculateCulturalAuthenticity(alternatives, culturalBackground) {
  if (culturalBackground.length === 0) return 1;
  const authenticAlternatives = alternatives.filter(
    (alt) => culturalBackground.includes(alt.cuisine)
  );
  return authenticAlternatives.length / Math.max(alternatives.length, 1);
}
function generateConflictExplanations(conflicts, alternatives) {
  const explanations = [];
  for (const conflict of conflicts) {
    explanations.push(
      `${conflict.restriction} restriction conflicts with: ${conflict.conflictingItems.join(", ")}`
    );
  }
  if (alternatives.length > 0) {
    explanations.push(`Generated ${alternatives.length} culturally appropriate alternatives`);
  }
  return explanations;
}
function hasQuickConflict(mealRequest, dietaryRestrictions) {
  const normalizedRequest = mealRequest.toLowerCase();
  const normalizedRestrictions = dietaryRestrictions.map((r) => r.toLowerCase());
  return detectConflicts(normalizedRequest, normalizedRestrictions).length > 0;
}
function getIngredientSubstitutions(ingredient, dietaryRestriction) {
  const pattern = CONFLICT_PATTERNS.find(
    (p) => p.dietary.some((d) => dietaryRestriction.toLowerCase().includes(d))
  );
  if (!pattern) return [];
  return pattern.substitutions[ingredient.toLowerCase()] || [];
}
async function resolveConflictsWithCuisineData(mealRequest, dietaryRestrictions, cultureParserResult) {
  const normalizedRequest = mealRequest.toLowerCase();
  const normalizedRestrictions = dietaryRestrictions.map((r) => r.toLowerCase());
  const conflicts = detectConflicts(normalizedRequest, normalizedRestrictions);
  if (conflicts.length === 0) {
    return {
      hasConflict: false,
      conflictType: "none",
      originalRequest: mealRequest,
      suggestedAlternatives: [],
      confidence: 1,
      culturalAuthenticity: 1,
      explanations: ["No dietary conflicts detected"]
    };
  }
  const alternatives = generateEnhancedAlternatives(
    mealRequest,
    conflicts,
    cultureParserResult,
    dietaryRestrictions
  );
  return {
    hasConflict: true,
    conflictType: determineConflictType(conflicts),
    originalRequest: mealRequest,
    suggestedAlternatives: alternatives,
    confidence: calculateConfidenceScore(conflicts, alternatives),
    culturalAuthenticity: calculateEnhancedAuthenticity(alternatives, cultureParserResult),
    explanations: generateEnhancedExplanations(conflicts, alternatives, cultureParserResult)
  };
}
function generateEnhancedAlternatives(originalRequest, conflicts, cultureResult, dietaryRestrictions) {
  const alternatives = [];
  for (const cultureName of cultureResult.cultureTags) {
    const cuisineData = cultureResult.cuisineData?.[cultureName];
    if (!cuisineData) continue;
    const cultureAlternatives = generateCultureSpecificAlternatives(
      originalRequest,
      conflicts,
      cultureName,
      cuisineData,
      dietaryRestrictions
    );
    alternatives.push(...cultureAlternatives);
  }
  if (alternatives.length === 0) {
    for (const cultureName of cultureResult.cultureTags) {
      const fallbackAlts = generateCulturalAlternatives(
        originalRequest,
        conflicts,
        cultureName,
        dietaryRestrictions
      );
      alternatives.push(...fallbackAlts);
    }
  }
  return alternatives.sort((a, b) => b.culturalAuthenticity - a.culturalAuthenticity).slice(0, 5);
}
function generateCultureSpecificAlternatives(originalRequest, conflicts, cultureName, cuisineData, dietaryRestrictions) {
  const alternatives = [];
  for (const stapleDish of cuisineData.staple_dishes.slice(0, 3)) {
    for (const conflict of conflicts) {
      for (const conflictingItem of conflict.conflictingItems) {
        const substitutes = findCulturalSubstitutes(
          conflictingItem,
          cuisineData,
          conflict.restriction
        );
        for (const substitute of substitutes.slice(0, 2)) {
          const adaptedDish = adaptDishToDietaryRestriction(
            stapleDish,
            conflictingItem,
            substitute,
            cultureName,
            cuisineData
          );
          alternatives.push(adaptedDish);
        }
      }
    }
  }
  return alternatives;
}
function findCulturalSubstitutes(conflictingItem, cuisineData, restriction) {
  const substitutes = [];
  const healthySwap = cuisineData.healthy_swaps.find(
    (swap) => swap.original.toLowerCase().includes(conflictingItem.toLowerCase())
  );
  if (healthySwap) {
    substitutes.push(healthySwap.swap);
  }
  if (restriction.includes("vegetarian") || restriction.includes("vegan")) {
    substitutes.push(...cuisineData.common_vegetables.slice(0, 2));
    const proteinAlts = cuisineData.common_proteins.filter(
      (p) => p.includes("tofu") || p.includes("tempeh") || p.includes("beans")
    );
    substitutes.push(...proteinAlts);
  }
  const pattern = CONFLICT_PATTERNS.find(
    (p) => p.dietary.some((d) => restriction.toLowerCase().includes(d))
  );
  if (pattern) {
    const traditionalSubs = pattern.substitutions[conflictingItem.toLowerCase()] || [];
    substitutes.push(...traditionalSubs.slice(0, 2));
  }
  return [...new Set(substitutes)];
}
function adaptDishToDietaryRestriction(stapleDish, conflictingItem, substitute, cultureName, cuisineData) {
  const adaptedName = stapleDish.name.replace(
    new RegExp(conflictingItem, "gi"),
    substitute
  );
  return {
    dishName: adaptedName || `${cultureName} ${substitute} dish`,
    cuisine: cultureName,
    description: `Traditional ${stapleDish.name} adapted with ${substitute} instead of ${conflictingItem}`,
    substituteIngredients: [{
      original: conflictingItem,
      substitute,
      reason: `Dietary adaptation maintaining ${cultureName} authenticity`,
      culturalContext: `Common in traditional ${cultureName} cooking`
    }],
    difficultyRating: estimateDifficulty(stapleDish.name, substitute),
    cookTime: estimateCookTime(stapleDish.name, substitute),
    culturalNotes: `Uses traditional ${cultureName} cooking methods: ${cuisineData.cooking_methods.join(", ")}`,
    dietaryCompliance: cuisineData.dietary_restrictions || []
  };
}
function calculateEnhancedAuthenticity(alternatives, cultureResult) {
  if (alternatives.length === 0) return 0;
  const authenticityScores = alternatives.map((alt) => {
    const hasStructuredData = cultureResult.cuisineData?.[alt.cuisine] ? 0.5 : 0;
    const culturalMatch = cultureResult.cultureTags.includes(alt.cuisine) ? 0.5 : 0;
    return hasStructuredData + culturalMatch;
  });
  return authenticityScores.reduce((sum, score) => sum + score, 0) / alternatives.length;
}
function generateEnhancedExplanations(conflicts, alternatives, cultureResult) {
  const explanations = [];
  for (const conflict of conflicts) {
    explanations.push(
      `${conflict.restriction} restriction conflicts with: ${conflict.conflictingItems.join(", ")}`
    );
  }
  if (cultureResult.cuisineData) {
    const culturesWithData = Object.keys(cultureResult.cuisineData);
    explanations.push(
      `Used detailed ${culturesWithData.join(", ")} cuisine data for authentic alternatives`
    );
  }
  if (alternatives.length > 0) {
    explanations.push(
      `Generated ${alternatives.length} culturally authentic alternatives using traditional cooking methods and ingredients`
    );
  }
  return explanations;
}
var CONFLICT_PATTERNS, CULTURAL_SUBSTITUTION_CONTEXT;
var init_dietaryCulturalConflictResolver = __esm({
  "server/dietaryCulturalConflictResolver.ts"() {
    "use strict";
    CONFLICT_PATTERNS = [
      // VEGETARIAN CONFLICTS
      {
        dietary: ["vegetarian", "veggie"],
        conflictsWith: ["beef", "pork", "chicken", "lamb", "fish", "seafood", "meat", "bacon", "ham", "sausage"],
        substitutions: {
          "beef": ["tofu", "tempeh", "mushrooms", "seitan", "plant-based meat"],
          "chicken": ["tofu", "cauliflower", "chickpeas", "mushrooms"],
          "pork": ["jackfruit", "mushrooms", "tempeh"],
          "fish": ["tofu", "hearts of palm", "banana peels"],
          "bacon": ["tempeh bacon", "coconut bacon", "shiitake bacon"],
          "ground meat": ["lentils", "mushrooms", "crumbled tofu"],
          "sausage": ["plant-based sausage", "seasoned mushrooms"]
        },
        cookingMethodAlternatives: {
          "bbq meat": ["grilled vegetables", "bbq tofu", "grilled portobello"],
          "stir-fry meat": ["stir-fry tofu", "stir-fry tempeh", "vegetable stir-fry"]
        }
      },
      // VEGAN CONFLICTS
      {
        dietary: ["vegan"],
        conflictsWith: ["beef", "pork", "chicken", "fish", "dairy", "milk", "cheese", "butter", "eggs", "honey"],
        substitutions: {
          "beef": ["tofu", "tempeh", "mushrooms", "lentils"],
          "chicken": ["tofu", "cauliflower", "jackfruit"],
          "cheese": ["nutritional yeast", "cashew cheese", "almond cheese"],
          "milk": ["almond milk", "oat milk", "coconut milk"],
          "butter": ["coconut oil", "olive oil", "vegan butter"],
          "eggs": ["flax eggs", "aquafaba", "chia eggs"],
          "honey": ["maple syrup", "agave nectar", "date syrup"]
        }
      },
      // HALAL CONFLICTS
      {
        dietary: ["halal"],
        conflictsWith: ["pork", "bacon", "ham", "alcohol", "wine", "beer", "gelatin"],
        substitutions: {
          "pork": ["beef", "lamb", "chicken", "turkey"],
          "bacon": ["turkey bacon", "beef bacon", "halal bacon"],
          "wine": ["grape juice", "pomegranate juice", "halal cooking wine"],
          "alcohol": ["vinegar", "citrus juice", "broth"]
        }
      },
      // KOSHER CONFLICTS
      {
        dietary: ["kosher"],
        conflictsWith: ["pork", "shellfish", "mixing meat and dairy"],
        substitutions: {
          "pork": ["beef", "lamb", "chicken", "turkey"],
          "shellfish": ["fish with scales", "chicken", "vegetables"],
          "cream with meat": ["coconut cream", "cashew cream", "broth"]
        }
      },
      // GLUTEN-FREE CONFLICTS
      {
        dietary: ["gluten-free", "gluten free", "celiac"],
        conflictsWith: ["wheat", "pasta", "bread", "flour", "soy sauce", "beer"],
        substitutions: {
          "pasta": ["rice noodles", "zucchini noodles", "gluten-free pasta"],
          "bread": ["gluten-free bread", "lettuce wraps", "rice paper"],
          "flour": ["rice flour", "almond flour", "coconut flour"],
          "soy sauce": ["tamari", "coconut aminos", "gluten-free soy sauce"],
          "noodles": ["rice noodles", "shirataki noodles", "zucchini noodles"]
        }
      },
      // DAIRY-FREE CONFLICTS
      {
        dietary: ["dairy-free", "dairy free", "lactose intolerant"],
        conflictsWith: ["milk", "cheese", "butter", "cream", "yogurt"],
        substitutions: {
          "milk": ["almond milk", "oat milk", "coconut milk"],
          "cheese": ["nutritional yeast", "dairy-free cheese", "cashew cheese"],
          "butter": ["coconut oil", "olive oil", "dairy-free butter"],
          "cream": ["coconut cream", "cashew cream", "oat cream"],
          "yogurt": ["coconut yogurt", "almond yogurt", "oat yogurt"]
        }
      },
      // KETO CONFLICTS
      {
        dietary: ["keto", "ketogenic", "low-carb"],
        conflictsWith: ["rice", "pasta", "bread", "potatoes", "sugar", "beans", "fruit"],
        substitutions: {
          "rice": ["cauliflower rice", "shirataki rice", "broccoli rice"],
          "pasta": ["zucchini noodles", "shirataki noodles", "spaghetti squash"],
          "bread": ["lettuce wraps", "portobello caps", "cauliflower bread"],
          "potatoes": ["cauliflower", "turnips", "radishes"],
          "sugar": ["stevia", "erythritol", "monk fruit"],
          "beans": ["green beans", "asparagus", "broccoli"]
        }
      }
    ];
    CULTURAL_SUBSTITUTION_CONTEXT = {
      "Chinese": {
        "beef": { substitute: "tofu", preparation: "marinated in soy sauce and cornstarch", culturalNote: "Tofu is traditional in Chinese cuisine" },
        "chicken": { substitute: "mushrooms", preparation: "shiitake or king oyster mushrooms", culturalNote: "Mushrooms are prized in Chinese cooking" },
        "pork": { substitute: "tempeh", preparation: "five-spice seasoned tempeh", culturalNote: "Maintains umami depth" }
      },
      "Italian": {
        "meat": { substitute: "mushrooms", preparation: "mixed wild mushrooms", culturalNote: "Italy has rich vegetarian traditions" },
        "cheese": { substitute: "nutritional yeast", preparation: "with herbs and garlic", culturalNote: "Provides umami like parmesan" }
      },
      "Mexican": {
        "beef": { substitute: "black beans", preparation: "seasoned with cumin and chili", culturalNote: "Beans are traditional Mexican protein" },
        "cheese": { substitute: "cashew crema", preparation: "blended cashews with lime", culturalNote: "Maintains creamy texture" }
      },
      "Indian": {
        "meat": { substitute: "paneer or legumes", preparation: "traditional preparation methods", culturalNote: "India has extensive vegetarian tradition" },
        "dairy": { substitute: "coconut milk", preparation: "full-fat coconut milk", culturalNote: "Common in South Indian cuisine" }
      },
      "Japanese": {
        "meat": { substitute: "tofu", preparation: "silken or firm tofu", culturalNote: "Tofu originated in Japan" },
        "fish": { substitute: "mushrooms", preparation: "dashi-marinated mushrooms", culturalNote: "Provides umami depth" }
      },
      "Thai": {
        "meat": { substitute: "tofu", preparation: "pressed and marinated tofu", culturalNote: "Common in Thai Buddhist cuisine" },
        "fish sauce": { substitute: "soy sauce with seaweed", preparation: "adds oceanic flavor", culturalNote: "Maintains umami profile" }
      }
    };
  }
});

// server/dietaryValidationService.ts
var dietaryValidationService_exports = {};
__export(dietaryValidationService_exports, {
  getSuggestedRecipeFixes: () => getSuggestedRecipeFixes,
  hasQuickDietaryViolation: () => hasQuickDietaryViolation,
  validateMealPlanDietaryCompliance: () => validateMealPlanDietaryCompliance,
  validateRecipeDietaryCompliance: () => validateRecipeDietaryCompliance,
  validationUtils: () => validationUtils
});
async function validateRecipeDietaryCompliance(recipe, restrictions) {
  const startTime = Date.now();
  if (!recipe || !restrictions || restrictions.length === 0) {
    return {
      isCompliant: true,
      violations: [],
      suggestions: [],
      confidence: 1,
      validationTime: Date.now() - startTime
    };
  }
  const violations = [];
  const suggestions = [];
  const normalizedRestrictions = restrictions.map((r) => r.toLowerCase().trim());
  if (recipe.title) {
    const titleViolations = await scanTextForViolations(
      recipe.title,
      normalizedRestrictions,
      "title"
    );
    violations.push(...titleViolations);
  }
  if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
    for (const ingredient of recipe.ingredients) {
      const ingredientStr = typeof ingredient === "string" ? ingredient : ingredient.name || "";
      const ingredientViolations = await scanTextForViolations(
        ingredientStr,
        normalizedRestrictions,
        "ingredients"
      );
      violations.push(...ingredientViolations);
    }
  }
  if (recipe.instructions && Array.isArray(recipe.instructions)) {
    const instructionsText = recipe.instructions.join(" ");
    const instructionViolations = await scanTextForViolations(
      instructionsText,
      normalizedRestrictions,
      "instructions"
    );
    violations.push(...instructionViolations);
  }
  if (violations.length > 0) {
    const uniqueViolations = removeDuplicateViolations(violations);
    for (const violation of uniqueViolations) {
      if (violation.alternativeSuggestions.length > 0) {
        suggestions.push(
          `Replace "${violation.ingredient}" with ${violation.alternativeSuggestions.slice(0, 2).join(" or ")}`
        );
      }
    }
    try {
      const resolution = await resolveDietaryCulturalConflicts(
        recipe.title || "dish",
        restrictions,
        []
        // No cultural context for basic validation
      );
      if (resolution.suggestedAlternatives.length > 0) {
        suggestions.push(`Consider alternative: "${resolution.suggestedAlternatives[0].dishName}"`);
      }
    } catch (error) {
      console.warn("Error getting AI resolution suggestions:", error);
    }
  }
  const confidence = calculateValidationConfidence(violations, recipe);
  return {
    isCompliant: violations.length === 0,
    violations: removeDuplicateViolations(violations),
    suggestions,
    confidence,
    validationTime: Date.now() - startTime
  };
}
async function validateMealPlanDietaryCompliance(mealPlan, restrictions) {
  if (!mealPlan?.meal_plan || !restrictions || restrictions.length === 0) {
    return {
      overallCompliance: 100,
      totalMeals: 0,
      compliantMeals: 0,
      violations: {},
      summary: ["No dietary restrictions specified or no meal plan provided"]
    };
  }
  const violations = {};
  let totalMeals = 0;
  let compliantMeals = 0;
  for (const dayKey in mealPlan.meal_plan) {
    const day = mealPlan.meal_plan[dayKey];
    for (const mealType in day) {
      const meal = day[mealType];
      totalMeals++;
      const mealKey = `${dayKey}_${mealType}`;
      const validation = await validateRecipeDietaryCompliance(meal, restrictions);
      if (!validation.isCompliant) {
        violations[mealKey] = validation;
      } else {
        compliantMeals++;
      }
    }
  }
  const overallCompliance = totalMeals > 0 ? Math.round(compliantMeals / totalMeals * 100) : 100;
  const summary = [];
  summary.push(`${compliantMeals}/${totalMeals} meals (${overallCompliance}%) comply with dietary restrictions`);
  if (Object.keys(violations).length > 0) {
    const violationTypes = /* @__PURE__ */ new Set();
    Object.values(violations).forEach((v) => {
      v.violations.forEach((viol) => violationTypes.add(viol.restrictionViolated));
    });
    summary.push(`Violations found for: ${Array.from(violationTypes).join(", ")}`);
    summary.push(`Most common violations: ${getMostCommonViolations(violations)}`);
  } else {
    summary.push("All meals comply with specified dietary restrictions");
  }
  return {
    overallCompliance,
    totalMeals,
    compliantMeals,
    violations,
    summary
  };
}
function hasQuickDietaryViolation(text2, restrictions) {
  if (!text2 || !restrictions || restrictions.length === 0) return false;
  const normalizedText = text2.toLowerCase();
  const normalizedRestrictions = restrictions.map((r) => r.toLowerCase());
  for (const restriction of normalizedRestrictions) {
    const pattern = getConflictPattern(restriction);
    if (pattern) {
      const hasConflict = pattern.conflictsWith.some(
        (conflictItem) => normalizedText.includes(conflictItem.toLowerCase())
      );
      if (hasConflict) return true;
    }
  }
  return false;
}
async function getSuggestedRecipeFixes(recipe, validationResult, restrictions) {
  if (validationResult.isCompliant) {
    return recipe;
  }
  let fixedRecipe = { ...recipe };
  for (const violation of validationResult.violations) {
    if (violation.alternativeSuggestions.length > 0) {
      const bestAlternative = violation.alternativeSuggestions[0];
      if (violation.detectedIn === "title" && fixedRecipe.title) {
        fixedRecipe.title = fixedRecipe.title.replace(
          new RegExp(violation.ingredient, "gi"),
          bestAlternative
        );
      }
      if (violation.detectedIn === "ingredients" && fixedRecipe.ingredients) {
        fixedRecipe.ingredients = fixedRecipe.ingredients.map((ing) => {
          const ingredientStr = typeof ing === "string" ? ing : ing.name || "";
          if (ingredientStr.toLowerCase().includes(violation.ingredient.toLowerCase())) {
            return typeof ing === "string" ? ingredientStr.replace(new RegExp(violation.ingredient, "gi"), bestAlternative) : { ...ing, name: ingredientStr.replace(new RegExp(violation.ingredient, "gi"), bestAlternative) };
          }
          return ing;
        });
      }
    }
  }
  return fixedRecipe;
}
async function scanTextForViolations(text2, restrictions, location) {
  const violations = [];
  const normalizedText = text2.toLowerCase();
  for (const restriction of restrictions) {
    const pattern = getConflictPattern(restriction);
    if (pattern) {
      for (const conflictItem of pattern.conflictsWith) {
        if (normalizedText.includes(conflictItem.toLowerCase())) {
          violations.push({
            ingredient: conflictItem,
            restrictionViolated: restriction,
            severity: getSeverityLevel(conflictItem, restriction),
            alternativeSuggestions: pattern.substitutions[conflictItem] || [],
            detectedIn: location
          });
        }
      }
    }
  }
  return violations;
}
function getConflictPattern(restriction) {
  return CONFLICT_PATTERNS.find(
    (p) => p.dietary.some((d) => restriction.toLowerCase().includes(d.toLowerCase()))
  );
}
function getSeverityLevel(ingredient, restriction) {
  const highSeverityIngredients = ["milk", "eggs", "nuts", "shellfish", "wheat", "soy"];
  const strictRestrictions = ["vegan", "vegetarian", "gluten-free", "halal", "kosher"];
  if (strictRestrictions.some((strict) => restriction.toLowerCase().includes(strict)) && highSeverityIngredients.some((severe) => ingredient.toLowerCase().includes(severe))) {
    return "high";
  }
  if (ingredient.toLowerCase().includes("meat") || ingredient.toLowerCase().includes("dairy") || ingredient.toLowerCase().includes("gluten")) {
    return "high";
  }
  return "medium";
}
function removeDuplicateViolations(violations) {
  const seen = /* @__PURE__ */ new Set();
  return violations.filter((violation) => {
    const key = `${violation.ingredient}-${violation.restrictionViolated}-${violation.detectedIn}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function calculateValidationConfidence(violations, recipe) {
  let confidence = 0.9;
  confidence -= violations.length * 0.1;
  if (!recipe.ingredients || recipe.ingredients.length < 3) {
    confidence -= 0.2;
  }
  if (!recipe.instructions || recipe.instructions.length < 2) {
    confidence -= 0.1;
  }
  return Math.max(0.1, Math.min(1, confidence));
}
function getMostCommonViolations(violations) {
  const violationCounts = {};
  Object.values(violations).forEach((result) => {
    result.violations.forEach((violation) => {
      const key = violation.ingredient;
      violationCounts[key] = (violationCounts[key] || 0) + 1;
    });
  });
  const sorted = Object.entries(violationCounts).sort(([, a], [, b]) => b - a).slice(0, 3).map(([ingredient, count]) => `${ingredient} (${count}x)`);
  return sorted.join(", ") || "Various ingredients";
}
var validationUtils;
var init_dietaryValidationService = __esm({
  "server/dietaryValidationService.ts"() {
    "use strict";
    init_dietaryCulturalConflictResolver();
    validationUtils = {
      scanTextForViolations,
      getConflictPattern,
      getSeverityLevel,
      removeDuplicateViolations,
      calculateValidationConfidence
    };
  }
});

// server/perplexitySearchLogger.ts
var perplexitySearchLogger_exports = {};
__export(perplexitySearchLogger_exports, {
  logPerplexitySearch: () => logPerplexitySearch,
  perplexityLogger: () => perplexityLogger
});
import fs from "fs/promises";
import path from "path";
async function logPerplexitySearch(query, response, category = "general", cached = false, userId, executionTime) {
  return perplexityLogger.logSearch(query, response, category, cached, userId, executionTime);
}
var PerplexitySearchLogger, perplexityLogger;
var init_perplexitySearchLogger = __esm({
  "server/perplexitySearchLogger.ts"() {
    "use strict";
    PerplexitySearchLogger = class {
      logFile;
      maxEntries = 1e3;
      maxFileSize = 10 * 1024 * 1024;
      // 10MB
      constructor() {
        this.logFile = path.join(__dirname, "../logs/perplexity-searches.json");
        this.ensureLogDirectory();
      }
      async ensureLogDirectory() {
        const logDir = path.dirname(this.logFile);
        try {
          await fs.mkdir(logDir, { recursive: true });
        } catch (error) {
          console.error("Failed to create log directory:", error);
        }
      }
      generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      truncateText(text2, maxLength = 200) {
        if (text2.length <= maxLength) return text2;
        return text2.substring(0, maxLength) + "...";
      }
      async logSearch(query, response, category = "general", cached = false, userId, executionTime) {
        const searchEntry = {
          id: this.generateId(),
          query: this.truncateText(query, 500),
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          responseSize: JSON.stringify(response).length,
          cached,
          category,
          responsePreview: this.extractPreview(response),
          fullResponse: response,
          userId,
          executionTime
        };
        try {
          await this.saveEntry(searchEntry);
          console.log(`\u{1F4DD} Logged Perplexity search: ${category} - ${this.truncateText(query, 50)}`);
          return searchEntry.id;
        } catch (error) {
          console.error("Failed to log Perplexity search:", error);
          return "";
        }
      }
      extractPreview(response) {
        if (!response) return "Empty response";
        if (typeof response === "string") {
          return this.truncateText(response, 300);
        }
        if (response.meals && Array.isArray(response.meals)) {
          const mealNames = response.meals.slice(0, 3).map((meal) => meal.name || "Unnamed dish");
          return `Found ${response.meals.length} dishes: ${mealNames.join(", ")}${response.meals.length > 3 ? "..." : ""}`;
        }
        if (response.message) {
          return this.truncateText(response.message, 300);
        }
        if (response.content) {
          return this.truncateText(response.content, 300);
        }
        return this.truncateText(JSON.stringify(response), 300);
      }
      async saveEntry(entry) {
        let existingEntries = [];
        try {
          const fileContent = await fs.readFile(this.logFile, "utf-8");
          existingEntries = JSON.parse(fileContent);
        } catch (error) {
          existingEntries = [];
        }
        existingEntries.unshift(entry);
        if (existingEntries.length > this.maxEntries) {
          existingEntries = existingEntries.slice(0, this.maxEntries);
        }
        const content = JSON.stringify(existingEntries, null, 2);
        if (content.length > this.maxFileSize) {
          await this.rotateLog();
          existingEntries = existingEntries.slice(0, Math.floor(this.maxEntries / 2));
        }
        await fs.writeFile(this.logFile, content, "utf-8");
      }
      async rotateLog() {
        const timestamp2 = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
        const rotatedFile = this.logFile.replace(".json", `-${timestamp2}.json`);
        try {
          await fs.rename(this.logFile, rotatedFile);
          console.log(`\u{1F4E6} Rotated Perplexity log to: ${rotatedFile}`);
        } catch (error) {
          console.error("Failed to rotate log file:", error);
        }
      }
      async getSearchHistory(limit = 50) {
        try {
          const fileContent = await fs.readFile(this.logFile, "utf-8");
          const entries = JSON.parse(fileContent);
          return entries.slice(0, limit);
        } catch (error) {
          console.error("Failed to read search history:", error);
          return [];
        }
      }
      async clearSearchHistory() {
        try {
          await fs.writeFile(this.logFile, JSON.stringify([], null, 2), "utf-8");
          console.log("\u{1F9F9} Cleared Perplexity search history");
        } catch (error) {
          console.error("Failed to clear search history:", error);
        }
      }
      async getSearchStats() {
        try {
          const entries = await this.getSearchHistory(1e3);
          const now = Date.now();
          const twentyFourHoursAgo = now - 24 * 60 * 60 * 1e3;
          const recentSearches = entries.filter(
            (entry) => new Date(entry.timestamp).getTime() > twentyFourHoursAgo
          ).length;
          const cachedCount = entries.filter((entry) => entry.cached).length;
          const cacheHitRate = entries.length > 0 ? cachedCount / entries.length * 100 : 0;
          const categoryCounts = entries.reduce((acc, entry) => {
            acc[entry.category] = (acc[entry.category] || 0) + 1;
            return acc;
          }, {});
          const averageResponseSize = entries.length > 0 ? entries.reduce((sum, entry) => sum + entry.responseSize, 0) / entries.length : 0;
          return {
            totalSearches: entries.length,
            cacheHitRate: Math.round(cacheHitRate),
            categoryCounts,
            averageResponseSize: Math.round(averageResponseSize),
            recentSearches
          };
        } catch (error) {
          console.error("Failed to get search stats:", error);
          return {
            totalSearches: 0,
            cacheHitRate: 0,
            categoryCounts: {},
            averageResponseSize: 0,
            recentSearches: 0
          };
        }
      }
    };
    perplexityLogger = new PerplexitySearchLogger();
  }
});

// server/cultureCacheManager.ts
var cultureCacheManager_exports = {};
__export(cultureCacheManager_exports, {
  batchFetchCulturalCuisines: () => batchFetchCulturalCuisines,
  clearAllCache: () => clearAllCache,
  clearGlobalCache: () => clearGlobalCache,
  clearUserCache: () => clearUserCache,
  getCacheStats: () => getCacheStats,
  getCachedCuisines: () => getCachedCuisines,
  getCachedCulturalCuisine: () => getCachedCulturalCuisine,
  getCulturalCuisineData: () => getCulturalCuisineData,
  getGlobalCacheStats: () => getGlobalCacheStats,
  performCacheCleanup: () => performCacheCleanup,
  refreshUserCulturalData: () => refreshUserCulturalData,
  startCacheMaintenanceScheduler: () => startCacheMaintenanceScheduler
});
import { eq as eq2 } from "drizzle-orm";
async function getGlobalCacheStats() {
  try {
    const result = await db.select({
      total_cuisines: "count(*)",
      total_access_count: "sum(access_count)",
      avg_quality_score: "avg(quality_score)",
      oldest_entry: "min(created_at)",
      newest_entry: "max(created_at)"
    }).from(culturalCuisineCache);
    return {
      ...result[0],
      memory_cache_metrics: cache_metrics
    };
  } catch (error) {
    console.error("\u274C Error getting cache stats:", error);
    return null;
  }
}
async function clearGlobalCache() {
  try {
    await db.delete(culturalCuisineCache);
    console.log("\u{1F5D1}\uFE0F Cleared global cultural cuisine cache");
    return true;
  } catch (error) {
    console.error("\u274C Error clearing global cache:", error);
    return false;
  }
}
async function getCulturalCuisineData(userId, cultureTag, options = {}) {
  const normalizedCuisine = cultureTag.toLowerCase().trim();
  try {
    if (!options.forceRefresh) {
      console.log(`\u{1F50D} Looking for cached data for: "${normalizedCuisine}"`);
      const cachedEntries = await db.select().from(culturalCuisineCache).where(eq2(culturalCuisineCache.cuisine_name, normalizedCuisine)).limit(1);
      console.log(`\u{1F50D} Database query returned ${cachedEntries.length} results`);
      const cachedEntry = cachedEntries[0];
      if (cachedEntry) {
        const ageHours = (Date.now() - new Date(cachedEntry.created_at).getTime()) / (1e3 * 60 * 60);
        if (ageHours < CACHE_CONFIG.DEFAULT_TTL_HOURS) {
          console.log(`\u2705 Global cache hit for ${normalizedCuisine}, age: ${ageHours.toFixed(1)}h`);
          await db.update(culturalCuisineCache).set({
            access_count: cachedEntry.access_count + 1,
            last_accessed: /* @__PURE__ */ new Date()
          }).where(eq2(culturalCuisineCache.id, cachedEntry.id));
          cache_metrics.hits++;
          const cachedResult = {
            meals: cachedEntry.meals_data,
            summary: cachedEntry.summary_data,
            cached_at: new Date(cachedEntry.created_at),
            last_accessed: /* @__PURE__ */ new Date(),
            access_count: cachedEntry.access_count + 1,
            data_version: cachedEntry.data_version,
            source_quality_score: cachedEntry.quality_score || 0
          };
          try {
            const { logPerplexitySearch: logPerplexitySearch2 } = await Promise.resolve().then(() => (init_perplexitySearchLogger(), perplexitySearchLogger_exports));
            await logPerplexitySearch2(
              `Cultural cuisine research: ${normalizedCuisine} (cached)`,
              cachedResult,
              "cultural-cuisine",
              true,
              // cached
              userId,
              0
              // no execution time for cache hit
            );
          } catch (logError) {
            console.error("Failed to log cached search:", logError);
          }
          return cachedResult;
        } else {
          console.log(`\u23F0 Global cache expired for ${normalizedCuisine}, age: ${ageHours.toFixed(1)}h`);
          await db.delete(culturalCuisineCache).where(eq2(culturalCuisineCache.id, cachedEntry.id));
        }
      }
    }
    console.log(`\u{1F50D} Global cache miss for ${normalizedCuisine}, fetching fresh data`);
    console.log(`\u{1F50D} Cache miss details - forceRefresh: ${options.forceRefresh}, normalized: "${normalizedCuisine}"`);
    cache_metrics.misses++;
    const freshData = await fetchCulturalDataFromPerplexityWithRetry(cultureTag);
    if (freshData) {
      try {
        await db.insert(culturalCuisineCache).values({
          cuisine_name: normalizedCuisine,
          meals_data: freshData.meals,
          summary_data: freshData.summary,
          data_version: freshData.data_version,
          quality_score: freshData.source_quality_score || 0,
          access_count: 1
        }).onConflictDoUpdate({
          target: culturalCuisineCache.cuisine_name,
          set: {
            meals_data: freshData.meals,
            summary_data: freshData.summary,
            data_version: freshData.data_version,
            quality_score: freshData.source_quality_score || 0,
            updated_at: /* @__PURE__ */ new Date(),
            access_count: 1
          }
        });
        console.log(`\u2705 Successfully cached fresh data globally for ${normalizedCuisine}`);
        updateCacheMetrics();
        return freshData;
      } catch (error) {
        console.error(`\u274C Error caching data for ${normalizedCuisine}:`, error);
        return freshData;
      }
    } else {
      cache_metrics.errors++;
      console.log(`\u274C Failed to fetch data for ${normalizedCuisine}`);
    }
    return freshData;
  } catch (error) {
    cache_metrics.errors++;
    console.error(`\u274C Error in getCulturalCuisineData for ${normalizedCuisine}:`, error);
    return null;
  }
}
function updateCacheMetrics() {
  cache_metrics.total_entries = Object.values(culture_dish_cache).reduce((sum, userCache) => sum + Object.keys(userCache).length, 0);
  cache_metrics.memory_usage_bytes = JSON.stringify(culture_dish_cache).length;
}
function isRateLimited() {
  const now = Date.now();
  const oneMinuteAgo = now - 6e4;
  const recentCalls = api_call_timestamps.filter((timestamp2) => timestamp2 > oneMinuteAgo);
  api_call_timestamps.length = 0;
  api_call_timestamps.push(...recentCalls);
  return recentCalls.length >= MAX_CALLS_PER_MINUTE;
}
async function fetchCulturalDataFromPerplexityWithRetry(cultureTag) {
  for (let attempt = 1; attempt <= CACHE_CONFIG.MAX_RETRIES; attempt++) {
    try {
      if (isRateLimited()) {
        console.log(`Rate limited, waiting before retry attempt ${attempt}`);
        await new Promise((resolve) => setTimeout(resolve, CACHE_CONFIG.RETRY_DELAY_MS * attempt));
        continue;
      }
      const result = await fetchCulturalDataFromPerplexity(cultureTag);
      if (result) {
        console.log(`\u2705 Successfully fetched ${cultureTag} data on attempt ${attempt}`);
        return result;
      }
    } catch (error) {
      console.error(`\u274C Attempt ${attempt} failed for ${cultureTag}:`, error);
      if (attempt < CACHE_CONFIG.MAX_RETRIES) {
        const delay = CACHE_CONFIG.RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`\u23F3 Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  console.error(`\u{1F4A5} All ${CACHE_CONFIG.MAX_RETRIES} attempts failed for ${cultureTag}`);
  return null;
}
async function fetchCulturalDataFromPerplexity(cultureTag) {
  const startTime = Date.now();
  try {
    console.log(`\u{1F50D} Fetching cultural data for: ${cultureTag}`);
    api_call_timestamps.push(Date.now());
    const prompt = `Give me a JSON list of the 10 most culturally authentic and popular meals from ${cultureTag} cuisine. For each meal, include:

A brief description of the dish and its cultural significance or popularity.
The most common cooking techniques used.
The top healthy ingredients naturally present in the dish.
Healthy alternatives or modifications (ingredient swaps, cooking method tweaks, or ways to make the dish healthier while keeping it authentic).

Focus on dishes that are beloved and widely eaten in the culture, not just the healthiest. The goal is to keep the meal recognizable and authentic, but with a healthier twist. Do not include nutrient info or macro estimates.

At the end, summarize the most common healthy ingredients and cooking techniques found across all 10 dishes.

Please respond with a JSON object in this exact format:
{
  "culture": "${cultureTag}",
  "meals": [
    {
      "name": "Authentic Dish Name",
      "description": "Brief description and cultural significance",
      "cooking_techniques": ["technique 1", "technique 2"],
      "healthy_ingredients": ["naturally healthy ingredients in this dish"],
      "healthy_modifications": ["authentic healthy swaps", "cooking tweaks that preserve authenticity"]
    }
  ],
  "summary": {
    "common_healthy_ingredients": ["most frequent healthy ingredients across all dishes"],
    "common_cooking_techniques": ["most frequent cooking methods across all dishes"]
  }
}`;
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: "You are a cultural cuisine expert with deep knowledge of traditional healthy foods from around the world. Provide accurate, authentic information about cultural cuisines in valid JSON format only. Always provide exactly 10 meals per cuisine as requested."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 3e3,
        temperature: 0.2,
        top_p: 0.9,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: "month",
        stream: false
      })
    });
    if (!response.ok) {
      console.error(`\u{1F6A8} Perplexity API error: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    const responseContent = data.choices[0].message.content;
    console.log(`\u{1F4DD} Raw Perplexity response for ${cultureTag}:`, responseContent.substring(0, 200) + "...");
    try {
      const cleanedContent = responseContent.replace(/```json\n?|\n?```/g, "").trim();
      const parsedData = JSON.parse(cleanedContent);
      const qualityScore = calculateDataQualityScore(parsedData);
      const cultureData = {
        ...parsedData,
        cached_at: /* @__PURE__ */ new Date(),
        last_accessed: /* @__PURE__ */ new Date(),
        access_count: 0,
        data_version: CACHE_CONFIG.DATA_VERSION,
        source_quality_score: qualityScore
      };
      console.log(`\u2705 Successfully fetched data for ${cultureTag}:`, {
        meals: cultureData.meals.length,
        common_ingredients: cultureData.summary?.common_healthy_ingredients?.length || 0,
        common_techniques: cultureData.summary?.common_cooking_techniques?.length || 0,
        quality_score: qualityScore
      });
      try {
        const { logPerplexitySearch: logPerplexitySearch2 } = await Promise.resolve().then(() => (init_perplexitySearchLogger(), perplexitySearchLogger_exports));
        const executionTime = Date.now() - startTime;
        await logPerplexitySearch2(
          `Cultural cuisine research: ${cultureTag}`,
          cultureData,
          "cultural-cuisine",
          false,
          // not cached since we just fetched it
          0,
          // temporary userId
          executionTime
        );
      } catch (logError) {
        console.error("Failed to log Perplexity search:", logError);
      }
      return cultureData;
    } catch (parseError) {
      console.error(`\u{1F6A8} Error parsing Perplexity response for ${cultureTag}:`, parseError);
      console.error("Raw response:", responseContent);
      return null;
    }
  } catch (error) {
    console.error(`\u{1F6A8} Error fetching from Perplexity for ${cultureTag}:`, error);
    return null;
  }
}
function calculateDataQualityScore(data) {
  let score = 0;
  let maxScore = 100;
  if (data.meals && Array.isArray(data.meals)) {
    score += Math.min(data.meals.length * 8, 40);
    const detailBonus = data.meals.reduce((bonus, meal) => {
      let mealScore = 0;
      if (meal.description && meal.description.length > 20) mealScore += 2;
      if (meal.healthy_mods && meal.healthy_mods.length > 0) mealScore += 2;
      if (meal.macros && Object.keys(meal.macros).length >= 4) mealScore += 2;
      return bonus + Math.min(mealScore, 6);
    }, 0);
    score += Math.min(detailBonus, 20);
  }
  const arrayFields = ["styles", "key_ingredients", "cooking_techniques", "health_benefits"];
  arrayFields.forEach((field) => {
    if (data[field] && Array.isArray(data[field]) && data[field].length > 0) {
      score += Math.min(data[field].length * 2, 10);
    }
  });
  return Math.round(Math.min(score, maxScore));
}
async function batchFetchCulturalCuisines(userId, cultures) {
  const result = {
    success: {},
    failed: [],
    errors: {}
  };
  console.log(`\u{1F504} Batch fetching ${cultures.length} cultures for user ${userId}`);
  const batches = [];
  for (let i = 0; i < cultures.length; i += CACHE_CONFIG.BATCH_SIZE) {
    batches.push(cultures.slice(i, i + CACHE_CONFIG.BATCH_SIZE));
  }
  for (const batch of batches) {
    const batchPromises = batch.map(async (culture) => {
      try {
        const data = await getCulturalCuisineData(userId, culture);
        if (data) {
          result.success[culture] = data;
          console.log(`\u2705 Batch success: ${culture}`);
        } else {
          result.failed.push(culture);
          result.errors[culture] = "Failed to fetch data";
          console.log(`\u274C Batch failed: ${culture}`);
        }
      } catch (error) {
        result.failed.push(culture);
        result.errors[culture] = error instanceof Error ? error.message : "Unknown error";
        console.error(`\u{1F4A5} Batch error for ${culture}:`, error);
      }
    });
    await Promise.all(batchPromises);
    if (batch !== batches[batches.length - 1]) {
      await new Promise((resolve) => setTimeout(resolve, 2e3));
    }
  }
  console.log(`\u{1F4CA} Batch complete: ${Object.keys(result.success).length} success, ${result.failed.length} failed`);
  return result;
}
function performCacheCleanup() {
  const now = (/* @__PURE__ */ new Date()).getTime();
  let removedCount = 0;
  Object.keys(culture_dish_cache).forEach((userIdStr) => {
    const userId = parseInt(userIdStr);
    const userCache = culture_dish_cache[userId];
    Object.keys(userCache).forEach((cultureTag) => {
      const data = userCache[cultureTag];
      const age = now - data.cached_at.getTime();
      const maxAge = CACHE_CONFIG.DEFAULT_TTL_HOURS * 60 * 60 * 1e3;
      if (age > maxAge) {
        delete userCache[cultureTag];
        removedCount++;
      }
    });
    if (Object.keys(userCache).length === 0) {
      delete culture_dish_cache[userId];
    }
  });
  cache_metrics.last_cleanup = /* @__PURE__ */ new Date();
  updateCacheMetrics();
  console.log(`\u{1F9F9} Cache cleanup complete: removed ${removedCount} expired entries`);
}
function getCachedCuisines(userId) {
  return Object.keys(culture_dish_cache[userId] || {});
}
async function getCachedCulturalCuisine(userId, culturalBackground, options = {}) {
  console.log(`\u{1F50D} Loading cultural cuisine data for user ${userId}, cultures: ${culturalBackground.join(", ")}`);
  if (!culturalBackground || culturalBackground.length === 0) {
    console.log("No cultural background provided");
    return null;
  }
  if (options.useBatch && culturalBackground.length > 1) {
    console.log(`\u{1F504} Using batch processing for ${culturalBackground.length} cultures`);
    const batchResult = await batchFetchCulturalCuisines(userId, culturalBackground);
    if (Object.keys(batchResult.success).length > 0) {
      return batchResult.success;
    } else {
      console.log("\u274C Batch processing failed for all cultures");
      return null;
    }
  }
  const culturalCuisineData = {};
  for (const culture of culturalBackground) {
    console.log(`Loading data for culture: ${culture}`);
    const cultureData = await getCulturalCuisineData(userId, culture, options);
    if (cultureData) {
      culturalCuisineData[culture] = cultureData;
      console.log(`\u2705 Successfully loaded ${culture} cuisine data`);
    } else {
      console.log(`\u274C Failed to load ${culture} cuisine data`);
    }
  }
  const loadedCultures = Object.keys(culturalCuisineData);
  console.log(`\u{1F4CA} Cultural cuisine data loaded for: ${loadedCultures.join(", ")}`);
  return loadedCultures.length > 0 ? culturalCuisineData : null;
}
function clearUserCache(userId) {
  if (culture_dish_cache[userId]) {
    delete culture_dish_cache[userId];
    updateCacheMetrics();
    console.log(`\u{1F5D1}\uFE0F Cleared cultural cache for user ${userId}`);
    return true;
  }
  return false;
}
function clearAllCache() {
  Object.keys(culture_dish_cache).forEach((userId) => {
    delete culture_dish_cache[parseInt(userId)];
  });
  cache_metrics.hits = 0;
  cache_metrics.misses = 0;
  cache_metrics.errors = 0;
  cache_metrics.last_cleanup = /* @__PURE__ */ new Date();
  cache_metrics.total_entries = 0;
  cache_metrics.memory_usage_bytes = 0;
  console.log(`\u{1F5D1}\uFE0F CLEARED ALL CULTURAL CACHE DATA - Starting fresh!`);
}
async function refreshUserCulturalData(userId, cultures) {
  console.log(`\u{1F504} Force refreshing cultural data for user ${userId}, cultures: ${cultures.join(", ")}`);
  if (culture_dish_cache[userId]) {
    cultures.forEach((culture) => {
      if (culture_dish_cache[userId][culture]) {
        delete culture_dish_cache[userId][culture];
      }
    });
  }
  await getCachedCulturalCuisine(userId, cultures, { forceRefresh: true });
}
function getCacheStats() {
  updateCacheMetrics();
  const totalUsers = Object.keys(culture_dish_cache).length;
  const totalCuisines = Object.values(culture_dish_cache).reduce(
    (sum, userCache) => sum + Object.keys(userCache).length,
    0
  );
  const totalRequests = cache_metrics.hits + cache_metrics.misses;
  const hitRate = totalRequests > 0 ? cache_metrics.hits / totalRequests * 100 : 0;
  const cultureAccessCounts = {};
  Object.values(culture_dish_cache).forEach((userCache) => {
    Object.entries(userCache).forEach(([culture, data]) => {
      cultureAccessCounts[culture] = (cultureAccessCounts[culture] || 0) + (data.access_count || 0);
    });
  });
  const topCultures = Object.entries(cultureAccessCounts).map(([culture, accessCount]) => ({ culture, accessCount })).sort((a, b) => b.accessCount - a.accessCount).slice(0, 10);
  const memoryUsageMB = cache_metrics.memory_usage_bytes / (1024 * 1024);
  return {
    totalUsers,
    totalCuisines,
    cacheSize: `${Math.round(cache_metrics.memory_usage_bytes / 1024)} KB`,
    hitRate: Math.round(hitRate * 100) / 100,
    metrics: { ...cache_metrics },
    topCultures,
    memoryUsageMB: Math.round(memoryUsageMB * 100) / 100
  };
}
function startCacheMaintenanceScheduler() {
  const maintenanceInterval = CACHE_CONFIG.CLEANUP_INTERVAL_HOURS * 60 * 60 * 1e3;
  setInterval(() => {
    console.log("\u{1F527} Starting scheduled cache maintenance...");
    performCacheCleanup();
    const stats = getCacheStats();
    console.log("\u{1F4CA} Cache stats after cleanup:", {
      users: stats.totalUsers,
      cuisines: stats.totalCuisines,
      hitRate: `${stats.hitRate}%`,
      memoryUsage: `${stats.memoryUsageMB}MB`
    });
    if (stats.memoryUsageMB > CACHE_CONFIG.MAX_CACHE_SIZE_MB) {
      console.warn(`\u26A0\uFE0F High memory usage: ${stats.memoryUsageMB}MB (limit: ${CACHE_CONFIG.MAX_CACHE_SIZE_MB}MB)`);
    }
  }, maintenanceInterval);
  console.log(`\u2705 Cache maintenance scheduler started (interval: ${CACHE_CONFIG.CLEANUP_INTERVAL_HOURS}h)`);
}
var culture_dish_cache, cache_metrics, CACHE_CONFIG, api_call_timestamps, MAX_CALLS_PER_MINUTE;
var init_cultureCacheManager = __esm({
  "server/cultureCacheManager.ts"() {
    "use strict";
    init_db();
    init_schema();
    culture_dish_cache = {};
    cache_metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      last_cleanup: /* @__PURE__ */ new Date(),
      total_entries: 0,
      memory_usage_bytes: 0
    };
    CACHE_CONFIG = {
      DEFAULT_TTL_HOURS: 24,
      MAX_CACHE_SIZE_MB: 50,
      CLEANUP_INTERVAL_HOURS: 6,
      MAX_RETRIES: 3,
      RETRY_DELAY_MS: 1e3,
      BATCH_SIZE: 5,
      DATA_VERSION: "1.2.0"
    };
    api_call_timestamps = [];
    MAX_CALLS_PER_MINUTE = 10;
  }
});

// server/cookingTimeCalculator.ts
var cookingTimeCalculator_exports = {};
__export(cookingTimeCalculator_exports, {
  calculateCookingTimeAndDifficulty: () => calculateCookingTimeAndDifficulty,
  estimateBatchCookingTime: () => estimateBatchCookingTime,
  getEasyAlternatives: () => getEasyAlternatives
});
function calculateCookingTimeAndDifficulty(recipe) {
  const breakdown = analyzeRecipeComplexity(recipe);
  const timeCalculation = calculateTotalTime(breakdown, recipe);
  const difficultyScore = calculateDifficultyScore(breakdown, recipe);
  const recommendations = generateRecommendations(breakdown, timeCalculation, difficultyScore);
  return {
    totalMinutes: timeCalculation.total,
    prepTime: timeCalculation.prep,
    cookTime: timeCalculation.cook,
    difficulty: Math.min(5, Math.max(1, Math.round(difficultyScore))),
    breakdown: {
      ingredients: breakdown.ingredients.map((ing) => ({
        name: ing.name,
        prepTime: ing.prepTimeMinutes,
        cookTime: ing.cookTimeMinutes
      })),
      methods: breakdown.methods,
      complexityFactors: breakdown.complexityFactors
    },
    recommendations
  };
}
function analyzeRecipeComplexity(recipe) {
  const methods = extractCookingMethods(recipe);
  const ingredients = analyzeIngredients(recipe.ingredients);
  const complexityFactors = identifyComplexityFactors(recipe);
  return {
    methods,
    ingredients,
    complexityFactors,
    servings: recipe.servings || 4
  };
}
function detectBakingType(recipe) {
  const text2 = `${recipe.title} ${(recipe.instructions || []).join(" ")}`.toLowerCase();
  for (const bakingRecipe of BAKING_RECIPES) {
    for (const pattern of bakingRecipe.patterns) {
      if (text2.includes(pattern)) {
        return bakingRecipe;
      }
    }
  }
  return null;
}
function extractCookingMethods(recipe) {
  const text2 = `${recipe.title} ${(recipe.instructions || []).join(" ")}`.toLowerCase();
  const detectedMethods = [];
  COOKING_METHODS.forEach((method) => {
    if (text2.includes(method.name) || text2.includes(method.name.slice(0, -3)) || // Handle "frying" -> "fry"
    text2.includes(method.name + "ed") || text2.includes(method.name + "d")) {
      detectedMethods.push(method.name);
    }
  });
  if (detectedMethods.length === 0) {
    if (text2.includes("salad") || text2.includes("raw")) {
      detectedMethods.push("raw preparation");
    } else {
      detectedMethods.push("saut\xE9ing");
    }
  }
  return detectedMethods;
}
function analyzeIngredients(ingredients) {
  return ingredients.map((ingredient) => {
    const cleanIngredient = normalizeIngredientName3(ingredient);
    if (INGREDIENT_COMPLEXITY[cleanIngredient]) {
      return INGREDIENT_COMPLEXITY[cleanIngredient];
    }
    const bestMatch = findBestIngredientMatch(cleanIngredient);
    if (bestMatch) {
      return bestMatch;
    }
    return createDefaultIngredientComplexity(cleanIngredient);
  });
}
function normalizeIngredientName3(ingredient) {
  return ingredient.toLowerCase().replace(/\d+|\s*(cups?|tbsp|tsp|lbs?|oz|grams?|ml|cloves?|large|medium|small|fresh|dried|chopped|diced|sliced)\s*/g, "").replace(/\s+/g, " ").trim();
}
function findBestIngredientMatch(ingredient) {
  let bestMatch = null;
  let bestScore = 0;
  Object.values(INGREDIENT_COMPLEXITY).forEach((complexity) => {
    const score = calculateIngredientSimilarity(ingredient, complexity.name);
    if (score > bestScore && score > 0.6) {
      bestScore = score;
      bestMatch = complexity;
    }
  });
  return bestMatch;
}
function calculateIngredientSimilarity(a, b) {
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.8;
  const aWords = a.split(" ");
  const bWords = b.split(" ");
  let matchingWords = 0;
  aWords.forEach((wordA) => {
    bWords.forEach((wordB) => {
      if (wordA === wordB || wordA.includes(wordB) || wordB.includes(wordA)) {
        matchingWords++;
      }
    });
  });
  return matchingWords / Math.max(aWords.length, bWords.length);
}
function createDefaultIngredientComplexity(ingredient) {
  let category = "other";
  let prepTime = 3;
  let cookTime = 8;
  let difficulty = 2;
  if (/meat|chicken|beef|pork|fish|salmon|turkey/.test(ingredient)) {
    category = "protein";
    prepTime = 5;
    cookTime = 18;
    difficulty = 2;
  } else if (/vegetable|carrot|potato|onion|pepper|broccoli/.test(ingredient)) {
    category = "vegetable";
    prepTime = 4;
    cookTime = 10;
    difficulty = 1;
  } else if (/rice|pasta|grain|quinoa|bread/.test(ingredient)) {
    category = "grain";
    prepTime = 2;
    cookTime = 15;
    difficulty = 1;
  } else if (/cheese|milk|cream|butter|yogurt/.test(ingredient)) {
    category = "dairy";
    prepTime = 1;
    cookTime = 3;
    difficulty = 1;
  } else if (/oil|sauce|seasoning|herb|spice/.test(ingredient)) {
    category = "sauce";
    prepTime = 0;
    cookTime = 1;
    difficulty = 1;
  }
  return {
    name: ingredient,
    prepTimeMinutes: prepTime,
    cookTimeMinutes: cookTime,
    difficultyScore: difficulty,
    category
  };
}
function identifyComplexityFactors(recipe) {
  const factors = [];
  const text2 = `${recipe.title} ${(recipe.instructions || []).join(" ")}`.toLowerCase();
  if (text2.includes("marinade") || text2.includes("marinate")) {
    factors.push("Requires marinating time");
  }
  if (text2.includes("dough") || text2.includes("knead") || text2.includes("rising") || text2.includes("proof")) {
    factors.push("Involves dough preparation");
  }
  if (text2.includes("sauce from scratch") || text2.includes("homemade sauce") || text2.includes("reduction")) {
    factors.push("Homemade sauce preparation");
  }
  if (recipe.ingredients.length > 12) {
    factors.push("High ingredient count");
  }
  if (text2.includes("julienne") || text2.includes("brunoise") || text2.includes("chiffonade")) {
    factors.push("Advanced knife skills required");
  }
  if (text2.includes("temperature") || text2.includes("thermometer") || text2.includes("internal temp")) {
    factors.push("Temperature monitoring required");
  }
  if (text2.includes("timing") || text2.includes("simultaneously") || text2.includes("coordinate")) {
    factors.push("Multiple timing coordination");
  }
  if (text2.includes("wellington") || text2.includes("en croute") || text2.includes("wrapped in pastry")) {
    factors.push("Advanced pastry techniques");
  }
  if (text2.includes("sear") || text2.includes("caramelize") || text2.includes("deglaze")) {
    factors.push("Professional cooking techniques");
  }
  if (text2.includes("confit") || text2.includes("sous vide") || text2.includes("braising")) {
    factors.push("Specialized cooking methods");
  }
  if (text2.includes("clarify") || text2.includes("emulsify") || text2.includes("tempering")) {
    factors.push("Advanced culinary skills");
  }
  if (text2.includes("one pot") || text2.includes("sheet pan")) {
    factors.push("Simplified cooking method");
  }
  if (text2.includes("quick") || text2.includes("easy") || text2.includes("simple")) {
    factors.push("Quick preparation method");
  }
  if (recipe.ingredients.length <= 5) {
    factors.push("Minimal ingredients");
  }
  return factors;
}
function calculateTotalTime(breakdown, recipe) {
  let totalPrepTime = 0;
  let maxCookTime = 0;
  let simultaneousCookTime = 0;
  const bakingType = detectBakingType(recipe);
  if (bakingType && breakdown.methods.includes("baking")) {
    totalPrepTime = bakingType.prepTimeMinutes;
    maxCookTime = bakingType.baseTimeMinutes;
    let complexityPenalty2 = breakdown.complexityFactors.length * 3;
    if (breakdown.complexityFactors.includes("Involves dough preparation")) {
      complexityPenalty2 += 20;
    }
    if (breakdown.complexityFactors.includes("Advanced pastry techniques")) {
      complexityPenalty2 += 25;
    }
    const totalTime2 = totalPrepTime + maxCookTime + complexityPenalty2;
    return {
      total: Math.round(totalTime2),
      prep: Math.round(totalPrepTime),
      cook: Math.round(maxCookTime + complexityPenalty2)
    };
  }
  breakdown.ingredients.forEach((ing) => {
    totalPrepTime += ing.prepTimeMinutes;
  });
  const cookingMethods = breakdown.methods.map(
    (method) => COOKING_METHODS.find((m) => m.name === method)
  ).filter(Boolean);
  if (cookingMethods.length > 0) {
    maxCookTime = Math.max(...cookingMethods.map((m) => m.baseTimeMinutes));
    const totalIngredientCookTime = breakdown.ingredients.reduce(
      (sum, ing) => sum + ing.cookTimeMinutes,
      0
    );
    if (cookingMethods.length > 1) {
      simultaneousCookTime = totalIngredientCookTime * 0.7;
    } else {
      simultaneousCookTime = totalIngredientCookTime;
    }
    maxCookTime = Math.max(maxCookTime, simultaneousCookTime);
  }
  let complexityPenalty = breakdown.complexityFactors.length * 5;
  if (breakdown.complexityFactors.includes("Involves dough preparation")) {
    complexityPenalty += 30;
  }
  if (breakdown.complexityFactors.includes("Requires marinating time")) {
    complexityPenalty += 45;
  }
  if (breakdown.complexityFactors.includes("Advanced knife skills required")) {
    complexityPenalty += 15;
  }
  if (breakdown.complexityFactors.includes("Temperature monitoring required")) {
    complexityPenalty += 20;
  }
  const ingredientComplexityMultiplier = breakdown.ingredients.length > 8 ? 1.3 : 1;
  const adjustedCookTime = maxCookTime * ingredientComplexityMultiplier;
  const totalTime = totalPrepTime + adjustedCookTime + complexityPenalty;
  return {
    total: Math.round(totalTime),
    prep: Math.round(totalPrepTime),
    cook: Math.round(adjustedCookTime + complexityPenalty)
  };
}
function calculateDifficultyScore(breakdown, recipe) {
  let baseScore = 1;
  const bakingType = detectBakingType(recipe);
  if (bakingType && breakdown.methods.includes("baking")) {
    baseScore = bakingType.difficultyScore;
    breakdown.complexityFactors.forEach((factor) => {
      if (factor.includes("Advanced") || factor.includes("Professional") || factor.includes("Specialized")) {
        baseScore += 1;
      } else if (factor.includes("Involves dough preparation")) {
        baseScore += 0.5;
      } else if (factor.includes("High ingredient count")) {
        baseScore += 0.3;
      }
    });
    return Math.max(1, Math.min(5, baseScore));
  }
  breakdown.methods.forEach((methodName) => {
    const method = COOKING_METHODS.find((m) => m.name === methodName);
    if (method) {
      baseScore += (method.difficultyMultiplier - 1) * 2;
    }
  });
  const avgIngredientDifficulty = breakdown.ingredients.reduce(
    (sum, ing) => sum + ing.difficultyScore,
    0
  ) / breakdown.ingredients.length;
  baseScore += avgIngredientDifficulty - 1;
  breakdown.complexityFactors.forEach((factor) => {
    if (factor.includes("Advanced") || factor.includes("Professional") || factor.includes("Specialized")) {
      baseScore += 1.5;
    } else if (factor.includes("High ingredient count") || factor.includes("Multiple timing")) {
      baseScore += 1;
    } else {
      baseScore += 0.5;
    }
  });
  if (recipe.ingredients.length > 10) {
    baseScore += 0.5;
  } else if (recipe.ingredients.length <= 5) {
    baseScore -= 0.5;
  }
  if (breakdown.methods.length > 1) {
    baseScore += 0.5;
  }
  return Math.max(1, Math.min(5, baseScore));
}
function generateRecommendations(breakdown, timeCalculation, difficulty) {
  const recommendations = [];
  if (timeCalculation.prep > 20) {
    recommendations.push("\u{1F52A} Prep ingredients in advance to save time");
  }
  if (breakdown.methods.length > 1) {
    recommendations.push("\u23F2\uFE0F Use timers to coordinate multiple cooking methods");
  }
  if (difficulty >= 4) {
    recommendations.push("\u{1F468}\u200D\u{1F373} Consider watching a video tutorial for this recipe");
  }
  if (breakdown.complexityFactors.includes("High ingredient count")) {
    recommendations.push("\u{1F4DD} Organize ingredients by cooking order before starting");
  }
  if (timeCalculation.total > 60) {
    recommendations.push("\u23F0 Plan ahead - this recipe takes over an hour");
  }
  if (breakdown.methods.includes("marinating")) {
    recommendations.push("\u{1F550} Start marinating several hours before cooking");
  }
  const proteinCount = breakdown.ingredients.filter(
    (ing) => ing.category === "protein"
  ).length;
  if (proteinCount > 1) {
    recommendations.push("\u{1F969} Cook proteins separately to ensure proper doneness");
  }
  return recommendations;
}
function getEasyAlternatives(recipe) {
  const alternatives = [];
  const text2 = recipe.title.toLowerCase();
  if (text2.includes("pasta")) {
    alternatives.push("Use pre-made sauce instead of homemade");
    alternatives.push("Try one-pot pasta method");
  }
  if (text2.includes("stir fry") || text2.includes("stir-fry")) {
    alternatives.push("Use frozen stir-fry vegetables");
    alternatives.push("Pre-cut vegetables from store");
  }
  if (text2.includes("salad")) {
    alternatives.push("Use pre-washed salad mix");
    alternatives.push("Buy pre-cut vegetables");
  }
  if (text2.includes("soup")) {
    alternatives.push("Use slow cooker for hands-off cooking");
    alternatives.push("Use pre-made broth");
  }
  if (recipe.ingredients.length > 8) {
    alternatives.push("Reduce to essential ingredients only");
    alternatives.push("Use seasoning blends instead of individual spices");
  }
  return alternatives;
}
function estimateBatchCookingTime(recipes2) {
  const individualTimes = recipes2.map(
    (recipe) => calculateCookingTimeAndDifficulty(recipe).totalMinutes
  );
  const totalSequential = individualTimes.reduce((sum, time) => sum + time, 0);
  const parallelEfficiency = Math.max(0.6, 1 - recipes2.length * 0.1);
  const parallelTime = Math.round(totalSequential * parallelEfficiency);
  const efficiencyGains = [
    "\u{1F525} Share oven/stovetop time between recipes",
    "\u{1F96C} Batch prep similar ingredients",
    "\u26A1 Cook proteins together when possible",
    "\u{1F4E6} Prepare bulk ingredients once"
  ];
  return {
    totalTime: totalSequential,
    parallelTime,
    efficiencyGains
  };
}
var BAKING_RECIPES, COOKING_METHODS, INGREDIENT_COMPLEXITY;
var init_cookingTimeCalculator = __esm({
  "server/cookingTimeCalculator.ts"() {
    "use strict";
    BAKING_RECIPES = [
      { patterns: ["cookie", "biscotti", "macaroon"], baseTimeMinutes: 12, difficultyScore: 2, prepTimeMinutes: 15 },
      { patterns: ["muffin", "cupcake"], baseTimeMinutes: 18, difficultyScore: 2, prepTimeMinutes: 10 },
      { patterns: ["bread", "loaf", "sourdough"], baseTimeMinutes: 45, difficultyScore: 4, prepTimeMinutes: 30 },
      { patterns: ["cake", "layer cake"], baseTimeMinutes: 35, difficultyScore: 3, prepTimeMinutes: 20 },
      { patterns: ["pie", "tart"], baseTimeMinutes: 40, difficultyScore: 3, prepTimeMinutes: 25 },
      { patterns: ["pizza", "flatbread"], baseTimeMinutes: 15, difficultyScore: 2, prepTimeMinutes: 20 },
      { patterns: ["casserole", "lasagna"], baseTimeMinutes: 45, difficultyScore: 3, prepTimeMinutes: 25 },
      { patterns: ["roast chicken", "roasted chicken", "roast turkey", "roasted turkey"], baseTimeMinutes: 60, difficultyScore: 3, prepTimeMinutes: 15 },
      { patterns: ["brownie", "bar"], baseTimeMinutes: 25, difficultyScore: 2, prepTimeMinutes: 15 },
      { patterns: ["scone", "biscuit"], baseTimeMinutes: 20, difficultyScore: 2, prepTimeMinutes: 12 }
    ];
    COOKING_METHODS = [
      { name: "boiling", baseTimeMinutes: 15, difficultyMultiplier: 1, simultaneousCapable: true },
      { name: "saut\xE9ing", baseTimeMinutes: 8, difficultyMultiplier: 1.2, simultaneousCapable: true },
      { name: "roasting", baseTimeMinutes: 45, difficultyMultiplier: 1.1, simultaneousCapable: false },
      { name: "grilling", baseTimeMinutes: 20, difficultyMultiplier: 1.3, simultaneousCapable: false },
      { name: "baking", baseTimeMinutes: 30, difficultyMultiplier: 1.2, simultaneousCapable: false },
      // This will be overridden by smart detection
      { name: "frying", baseTimeMinutes: 12, difficultyMultiplier: 1.4, simultaneousCapable: true },
      { name: "steaming", baseTimeMinutes: 20, difficultyMultiplier: 1, simultaneousCapable: true },
      { name: "braising", baseTimeMinutes: 120, difficultyMultiplier: 1.5, simultaneousCapable: false },
      { name: "stir-frying", baseTimeMinutes: 10, difficultyMultiplier: 1.3, simultaneousCapable: true },
      { name: "slow cooking", baseTimeMinutes: 240, difficultyMultiplier: 0.8, simultaneousCapable: false },
      { name: "pressure cooking", baseTimeMinutes: 25, difficultyMultiplier: 1.1, simultaneousCapable: false },
      { name: "marinating", baseTimeMinutes: 60, difficultyMultiplier: 0.5, simultaneousCapable: true },
      { name: "blanching", baseTimeMinutes: 5, difficultyMultiplier: 1.1, simultaneousCapable: true },
      { name: "poaching", baseTimeMinutes: 15, difficultyMultiplier: 1.2, simultaneousCapable: true },
      { name: "smoking", baseTimeMinutes: 180, difficultyMultiplier: 1.8, simultaneousCapable: false }
    ];
    INGREDIENT_COMPLEXITY = {
      // Proteins (high prep/cook time, varying difficulty)
      "chicken breast": { name: "chicken breast", prepTimeMinutes: 5, cookTimeMinutes: 20, difficultyScore: 2, category: "protein" },
      "chicken thigh": { name: "chicken thigh", prepTimeMinutes: 3, cookTimeMinutes: 25, difficultyScore: 2, category: "protein" },
      "ground beef": { name: "ground beef", prepTimeMinutes: 2, cookTimeMinutes: 15, difficultyScore: 1, category: "protein" },
      "salmon": { name: "salmon", prepTimeMinutes: 3, cookTimeMinutes: 15, difficultyScore: 3, category: "protein" },
      "shrimp": { name: "shrimp", prepTimeMinutes: 8, cookTimeMinutes: 5, difficultyScore: 2, category: "protein" },
      "beef steak": { name: "beef steak", prepTimeMinutes: 2, cookTimeMinutes: 12, difficultyScore: 3, category: "protein" },
      "pork chops": { name: "pork chops", prepTimeMinutes: 3, cookTimeMinutes: 18, difficultyScore: 2, category: "protein" },
      "eggs": { name: "eggs", prepTimeMinutes: 1, cookTimeMinutes: 8, difficultyScore: 1, category: "protein" },
      "tofu": { name: "tofu", prepTimeMinutes: 5, cookTimeMinutes: 12, difficultyScore: 1, category: "protein" },
      // Vegetables (variable prep time, low-medium difficulty)
      "onion": { name: "onion", prepTimeMinutes: 5, cookTimeMinutes: 10, difficultyScore: 1, category: "vegetable" },
      "garlic": { name: "garlic", prepTimeMinutes: 2, cookTimeMinutes: 2, difficultyScore: 1, category: "vegetable" },
      "bell pepper": { name: "bell pepper", prepTimeMinutes: 4, cookTimeMinutes: 8, difficultyScore: 1, category: "vegetable" },
      "broccoli": { name: "broccoli", prepTimeMinutes: 5, cookTimeMinutes: 12, difficultyScore: 1, category: "vegetable" },
      "carrots": { name: "carrots", prepTimeMinutes: 8, cookTimeMinutes: 15, difficultyScore: 1, category: "vegetable" },
      "potatoes": { name: "potatoes", prepTimeMinutes: 10, cookTimeMinutes: 25, difficultyScore: 1, category: "vegetable" },
      "mushrooms": { name: "mushrooms", prepTimeMinutes: 5, cookTimeMinutes: 8, difficultyScore: 1, category: "vegetable" },
      "spinach": { name: "spinach", prepTimeMinutes: 3, cookTimeMinutes: 5, difficultyScore: 1, category: "vegetable" },
      "tomatoes": { name: "tomatoes", prepTimeMinutes: 3, cookTimeMinutes: 5, difficultyScore: 1, category: "vegetable" },
      "zucchini": { name: "zucchini", prepTimeMinutes: 4, cookTimeMinutes: 10, difficultyScore: 1, category: "vegetable" },
      // Grains & Starches (low prep, variable cook time)
      "rice": { name: "rice", prepTimeMinutes: 2, cookTimeMinutes: 20, difficultyScore: 1, category: "grain" },
      "pasta": { name: "pasta", prepTimeMinutes: 1, cookTimeMinutes: 12, difficultyScore: 1, category: "grain" },
      "quinoa": { name: "quinoa", prepTimeMinutes: 2, cookTimeMinutes: 15, difficultyScore: 1, category: "grain" },
      "bread": { name: "bread", prepTimeMinutes: 0, cookTimeMinutes: 5, difficultyScore: 1, category: "grain" },
      "noodles": { name: "noodles", prepTimeMinutes: 1, cookTimeMinutes: 8, difficultyScore: 1, category: "grain" },
      // Dairy (minimal prep/cook)
      "cheese": { name: "cheese", prepTimeMinutes: 1, cookTimeMinutes: 3, difficultyScore: 1, category: "dairy" },
      "milk": { name: "milk", prepTimeMinutes: 0, cookTimeMinutes: 2, difficultyScore: 1, category: "dairy" },
      "butter": { name: "butter", prepTimeMinutes: 0, cookTimeMinutes: 1, difficultyScore: 1, category: "dairy" },
      "yogurt": { name: "yogurt", prepTimeMinutes: 0, cookTimeMinutes: 0, difficultyScore: 1, category: "dairy" },
      // Spices & Seasonings (minimal time)
      "salt": { name: "salt", prepTimeMinutes: 0, cookTimeMinutes: 0, difficultyScore: 1, category: "spice" },
      "pepper": { name: "pepper", prepTimeMinutes: 0, cookTimeMinutes: 0, difficultyScore: 1, category: "spice" },
      "herbs": { name: "herbs", prepTimeMinutes: 1, cookTimeMinutes: 0, difficultyScore: 1, category: "spice" },
      "spices": { name: "spices", prepTimeMinutes: 0, cookTimeMinutes: 0, difficultyScore: 1, category: "spice" },
      // Sauces & Liquids
      "olive oil": { name: "olive oil", prepTimeMinutes: 0, cookTimeMinutes: 0, difficultyScore: 1, category: "sauce" },
      "soy sauce": { name: "soy sauce", prepTimeMinutes: 0, cookTimeMinutes: 0, difficultyScore: 1, category: "sauce" },
      "tomato sauce": { name: "tomato sauce", prepTimeMinutes: 1, cookTimeMinutes: 5, difficultyScore: 1, category: "sauce" },
      "broth": { name: "broth", prepTimeMinutes: 0, cookTimeMinutes: 5, difficultyScore: 1, category: "sauce" }
    };
  }
});

// server/recipeIntelligenceTypes.ts
var EQUIPMENT_COMPLEXITY, CUISINE_COMPLEXITY, TECHNIQUE_COMPLEXITY, DIETARY_COMPLEXITY;
var init_recipeIntelligenceTypes = __esm({
  "server/recipeIntelligenceTypes.ts"() {
    "use strict";
    EQUIPMENT_COMPLEXITY = {
      "stovetop": 1,
      "oven": 1.5,
      "microwave": 0.5,
      "toaster": 0.5,
      "blender": 2,
      "food_processor": 2,
      "stand_mixer": 2.5,
      "hand_mixer": 1.5,
      "sous_vide": 4,
      "smoker": 3.5,
      "deep_fryer": 3,
      "pressure_cooker": 2.5,
      "slow_cooker": 1,
      "pasta_machine": 3,
      "mandoline": 3.5,
      "mortar_pestle": 2,
      "grill": 2.5,
      "air_fryer": 1.5,
      "rice_cooker": 1
    };
    CUISINE_COMPLEXITY = {
      "american": 0,
      "italian": 0.5,
      "mexican": 0.5,
      "chinese": 1,
      "indian": 1.5,
      "french": 2,
      "thai": 1.5,
      "japanese": 1.5,
      "mediterranean": 0.5,
      "korean": 1.5,
      "vietnamese": 1,
      "middle_eastern": 1,
      "moroccan": 1.5,
      "ethiopian": 2,
      "molecular": 3
    };
    TECHNIQUE_COMPLEXITY = {
      // Basic techniques (Level 1)
      "mixing": 1,
      "heating": 1,
      "assembly": 1,
      "basic_seasoning": 1,
      "basic_browning": 1.5,
      // Simple browning (like ground beef)
      // Easy techniques (Level 2)
      "saut\xE9ing": 2,
      "boiling": 2,
      "basic_knife_skills": 2,
      "layering": 2,
      "steaming": 2,
      // Moderate techniques (Level 3)
      "roasting": 3,
      "braising": 3,
      "sauce_making": 3,
      "temperature_control": 3,
      "grilling": 3,
      "stir_frying": 3,
      "advanced_knife_skills": 3,
      // Advanced techniques (Level 4)
      "emulsification": 4,
      "reduction": 4,
      "caramelization": 4,
      // True caramelization (onions, sugar)
      "precise_seasoning": 4,
      "pan_searing": 4,
      "deglazing": 4,
      // Expert techniques (Level 5)
      "tempering": 5,
      "confit": 5,
      "molecular_techniques": 5,
      "pastry_work": 5,
      "fermentation": 5,
      "smoking": 5
    };
    DIETARY_COMPLEXITY = {
      "vegetarian": 0,
      "vegan": 0.5,
      "gluten-free": 0.5,
      "dairy-free": 0.3,
      "nut-free": 0.2,
      "soy-free": 0.2,
      "keto": 1,
      "paleo": 0.5,
      "low-carb": 0.3,
      "low-sodium": 0.3,
      "diabetic": 0.5,
      "raw": 2,
      "whole30": 0.8
    };
  }
});

// server/recipeComplexityCalculator.ts
var RecipeComplexityCalculator;
var init_recipeComplexityCalculator = __esm({
  "server/recipeComplexityCalculator.ts"() {
    "use strict";
    init_recipeIntelligenceTypes();
    RecipeComplexityCalculator = class {
      difficultyLevels = [
        {
          level: 1,
          description: "Beginner - Basic mixing, heating, assembly",
          timeMultiplier: 1,
          techniques: ["mixing", "heating", "assembly", "basic_seasoning"]
        },
        {
          level: 1.5,
          description: "Easy Beginner - Simple prep with basic cooking",
          timeMultiplier: 1.1,
          techniques: ["mixing", "heating", "basic_knife_skills", "assembly"]
        },
        {
          level: 2,
          description: "Easy - Simple cooking methods, minimal timing",
          timeMultiplier: 1.2,
          techniques: ["saut\xE9ing", "boiling", "basic_knife_skills", "layering", "steaming"]
        },
        {
          level: 2.5,
          description: "Easy-Moderate - Basic cooking with some technique",
          timeMultiplier: 1.3,
          techniques: ["saut\xE9ing", "basic_seasoning", "simple_grilling", "pan_cooking"]
        },
        {
          level: 3,
          description: "Moderate - Multiple steps, some technique required",
          timeMultiplier: 1.4,
          techniques: ["roasting", "braising", "sauce_making", "temperature_control", "grilling"]
        },
        {
          level: 3.5,
          description: "Moderate-Advanced - Complex preparations",
          timeMultiplier: 1.55,
          techniques: ["advanced_seasoning", "sauce_making", "timing_coordination", "marinating"]
        },
        {
          level: 4,
          description: "Advanced - Complex techniques, precise timing",
          timeMultiplier: 1.7,
          techniques: ["emulsification", "reduction", "caramelization", "precise_seasoning", "pan_searing"]
        },
        {
          level: 4.5,
          description: "Advanced-Expert - Professional techniques",
          timeMultiplier: 1.85,
          techniques: ["advanced_techniques", "critical_timing", "complex_preparations"]
        },
        {
          level: 5,
          description: "Expert - Professional techniques, critical timing",
          timeMultiplier: 2,
          techniques: ["tempering", "confit", "molecular_techniques", "pastry_work", "fermentation"]
        }
      ];
      /**
       * Calculate overall complexity score for a recipe with 0.5 increments
       */
      calculateComplexity(factors) {
        let score = 0;
        score += factors.techniqueComplexity * 0.45;
        const ingredientScore = this.calculateIngredientComplexity(factors.ingredientCount);
        score += ingredientScore * 0.25;
        score += factors.timingCritical ? 2 : 0;
        score += factors.multiStep ? 1 : 0;
        const roundedScore = Math.round(score * 2) / 2;
        return Math.min(Math.max(roundedScore, 1), 5);
      }
      /**
       * Calculate ingredient complexity based on count
       */
      calculateIngredientComplexity(count) {
        if (count <= 3) return 1;
        if (count <= 6) return 2;
        if (count <= 10) return 3;
        if (count <= 15) return 4;
        return 5;
      }
      /**
       * Calculate equipment complexity score
       */
      calculateEquipmentComplexity(equipment) {
        if (equipment.length === 0) return 1;
        const totalComplexity = equipment.reduce((sum, item) => {
          const cleanItem = item.toLowerCase().replace(/[^a-z_]/g, "");
          return sum + (EQUIPMENT_COMPLEXITY[cleanItem] || 1);
        }, 0);
        const avgComplexity = totalComplexity / equipment.length;
        return Math.min(Math.max(avgComplexity, 1), 5);
      }
      /**
       * Analyze techniques mentioned in recipe description
       */
      analyzeTechniques(description, ingredients) {
        const foundTechniques = [];
        const descLower = description.toLowerCase();
        Object.keys(TECHNIQUE_COMPLEXITY).forEach((technique) => {
          const keywords = this.getTechniqueKeywords(technique);
          if (keywords.some((keyword) => descLower.includes(keyword))) {
            foundTechniques.push(technique);
          }
        });
        ingredients.forEach((ingredient) => {
          const impliedTechniques = this.getImpliedTechniques(ingredient);
          foundTechniques.push(...impliedTechniques);
        });
        const uniqueTechniques = [...new Set(foundTechniques)];
        const avgComplexity = uniqueTechniques.length > 0 ? uniqueTechniques.reduce((sum, tech) => sum + (TECHNIQUE_COMPLEXITY[tech] || 1), 0) / uniqueTechniques.length : 1;
        return {
          techniques: uniqueTechniques,
          avgComplexity: Math.min(Math.max(avgComplexity, 1), 5)
        };
      }
      /**
       * Get keyword variations for technique detection
       */
      getTechniqueKeywords(technique) {
        const keywordMap = {
          "saut\xE9ing": ["saut\xE9", "saut\xE9ed", "saut\xE9ing", "pan fry"],
          "roasting": ["roast", "roasted", "roasting", "bake in oven"],
          "braising": ["braise", "braised", "braising", "slow cook"],
          "grilling": ["grill", "grilled", "grilling", "barbecue", "bbq"],
          "steaming": ["steam", "steamed", "steaming"],
          "boiling": ["boil", "boiled", "boiling"],
          "emulsification": ["emulsify", "whisk until thick", "mayonnaise", "hollandaise"],
          "reduction": ["reduce", "reduced", "reducing", "simmer until thick"],
          "caramelization": ["caramelize", "caramelized", "deeply golden", "golden brown and crispy"],
          "basic_browning": ["brown", "browned", "browning"],
          // Separate from caramelization
          "tempering": ["temper", "tempering", "chocolate work"],
          "fermentation": ["ferment", "fermented", "fermentation", "cultured"],
          "basic_knife_skills": ["chop", "dice", "mince"],
          // Basic chopping
          "advanced_knife_skills": ["julienne", "brunoise", "chiffonade"],
          // Advanced cuts
          "sauce_making": ["sauce", "gravy", "reduction", "pan sauce"],
          "basic_seasoning": ["season", "seasoning", "salt and pepper", "add spices"]
        };
        return keywordMap[technique] || [technique];
      }
      /**
       * Get techniques implied by ingredients
       */
      getImpliedTechniques(ingredient) {
        const ingredientLower = ingredient.toLowerCase();
        const implications = [];
        if (["onion", "garlic", "carrot", "celery", "pepper", "tomato"].some((v) => ingredientLower.includes(v))) {
          implications.push("basic_knife_skills");
        }
        if (["chicken", "beef", "pork", "fish", "lamb"].some((p) => ingredientLower.includes(p))) {
          implications.push("temperature_control");
        }
        if (["cream", "butter", "egg"].some((d) => ingredientLower.includes(d))) {
          implications.push("emulsification");
        }
        return implications;
      }
      /**
       * Get difficulty level details with 0.5 increment support
       */
      getDifficultyLevel(complexity) {
        const exactMatch = this.difficultyLevels.find((level) => level.level === complexity);
        if (exactMatch) {
          return exactMatch;
        }
        const closestLevel = this.difficultyLevels.reduce((closest, current) => {
          return Math.abs(current.level - complexity) < Math.abs(closest.level - complexity) ? current : closest;
        });
        return closestLevel;
      }
      /**
       * Estimate complexity from recipe text analysis
       */
      estimateComplexityFromText(description, ingredients, instructions) {
        const techniqueAnalysis = this.analyzeTechniques(description, ingredients);
        const instructionText = instructions.join(" ").toLowerCase();
        const stepCount = instructions.length;
        const timingCritical = /precise|exactly|immediately|quickly|don't overcook|watch carefully/.test(instructionText);
        const multiStep = stepCount > 3 || /meanwhile|while|at the same time|separately/.test(instructionText);
        const equipment = this.extractEquipmentFromInstructions(instructionText);
        return {
          techniqueComplexity: techniqueAnalysis.avgComplexity,
          ingredientCount: ingredients.length,
          equipmentRequired: equipment,
          timingCritical,
          multiStep,
          skillRequired: techniqueAnalysis.techniques
        };
      }
      /**
       * Extract equipment mentioned in instructions
       */
      extractEquipmentFromInstructions(instructionText) {
        const equipment = [];
        Object.keys(EQUIPMENT_COMPLEXITY).forEach((eq4) => {
          if (instructionText.includes(eq4.replace("_", " "))) {
            equipment.push(eq4);
          }
        });
        if (instructionText.includes("oven") || instructionText.includes("bake")) equipment.push("oven");
        if (instructionText.includes("pan") || instructionText.includes("skillet")) equipment.push("stovetop");
        if (instructionText.includes("blender") || instructionText.includes("blend")) equipment.push("blender");
        if (instructionText.includes("food processor") || instructionText.includes("process")) equipment.push("food_processor");
        if (instructionText.includes("grill")) equipment.push("grill");
        return [...new Set(equipment)];
      }
    };
  }
});

// server/enhancedCookingTimeCalculator.ts
var EnhancedCookingTimeCalculator;
var init_enhancedCookingTimeCalculator = __esm({
  "server/enhancedCookingTimeCalculator.ts"() {
    "use strict";
    EnhancedCookingTimeCalculator = class {
      /**
       * Calculate total cooking time with detailed breakdown
       */
      calculateTotalTime(factors, complexity) {
        const difficultyMultiplier = this.getDifficultyMultiplier(complexity);
        const prepTime = (factors.prepWork.chopping + factors.prepWork.mixing + factors.prepWork.setup) * difficultyMultiplier;
        const activeTime = (factors.activeTime.cooking + factors.activeTime.monitoring) * difficultyMultiplier;
        const passiveTime = factors.passiveTime.baking + factors.passiveTime.simmering + factors.passiveTime.resting;
        const marinatingTime = factors.prepWork.marinating;
        const totalTime = prepTime + activeTime + passiveTime;
        const breakdown = this.generateTimeBreakdown(factors, difficultyMultiplier);
        return {
          totalTime: Math.round(totalTime),
          prepTime: Math.round(prepTime),
          activeTime: Math.round(activeTime),
          passiveTime: Math.round(passiveTime),
          breakdown
        };
      }
      /**
       * Get difficulty multiplier for time calculations with 0.5 increment support
       * More conservative multipliers for realistic timing
       */
      getDifficultyMultiplier(complexity) {
        const multiplierMap = {
          1: 1,
          1.5: 1.025,
          2: 1.05,
          2.5: 1.075,
          3: 1.1,
          3.5: 1.15,
          4: 1.2,
          4.5: 1.25,
          5: 1.3
        };
        if (multiplierMap[complexity]) {
          return multiplierMap[complexity];
        }
        const levels = Object.keys(multiplierMap).map(Number).sort((a, b) => a - b);
        const lowerLevel = levels.filter((level) => level <= complexity).pop() || 1;
        const upperLevel = levels.filter((level) => level >= complexity)[0] || 5;
        if (lowerLevel === upperLevel) {
          return multiplierMap[lowerLevel];
        }
        const ratio = (complexity - lowerLevel) / (upperLevel - lowerLevel);
        const lowerMultiplier = multiplierMap[lowerLevel];
        const upperMultiplier = multiplierMap[upperLevel];
        return lowerMultiplier + ratio * (upperMultiplier - lowerMultiplier);
      }
      /**
       * Generate detailed time breakdown
       */
      generateTimeBreakdown(factors, multiplier) {
        const breakdown = [];
        if (factors.prepWork.chopping > 0) {
          breakdown.push(`Chopping: ${Math.round(factors.prepWork.chopping * multiplier)}min`);
        }
        if (factors.prepWork.mixing > 0) {
          breakdown.push(`Mixing/Prep: ${Math.round(factors.prepWork.mixing * multiplier)}min`);
        }
        if (factors.prepWork.setup > 0) {
          breakdown.push(`Setup: ${Math.round(factors.prepWork.setup * multiplier)}min`);
        }
        if (factors.activeTime.cooking > 0) {
          breakdown.push(`Active Cooking: ${Math.round(factors.activeTime.cooking * multiplier)}min`);
        }
        if (factors.activeTime.monitoring > 0) {
          breakdown.push(`Monitoring: ${Math.round(factors.activeTime.monitoring * multiplier)}min`);
        }
        if (factors.passiveTime.baking > 0) {
          breakdown.push(`Baking: ${factors.passiveTime.baking}min`);
        }
        if (factors.passiveTime.simmering > 0) {
          breakdown.push(`Simmering: ${factors.passiveTime.simmering}min`);
        }
        if (factors.passiveTime.resting > 0) {
          breakdown.push(`Resting: ${factors.passiveTime.resting}min`);
        }
        if (factors.prepWork.marinating > 0) {
          breakdown.push(`Marinating: ${factors.prepWork.marinating}min (can be done ahead)`);
        }
        return breakdown;
      }
      /**
       * Estimate time factors from recipe analysis
       */
      estimateFromRecipeDescription(description, ingredients, instructions, mealType = "dinner") {
        const factors = {
          prepWork: { chopping: 0, marinating: 0, mixing: 0, setup: 0 },
          activeTime: { cooking: 0, monitoring: 0 },
          passiveTime: { baking: 0, simmering: 0, resting: 0 }
        };
        factors.prepWork.chopping = this.estimateChoppingTime(ingredients);
        factors.prepWork.marinating = this.estimateMarinatingTime(description, instructions);
        factors.passiveTime.baking = this.estimateBakingTime(description, instructions);
        factors.passiveTime.simmering = this.estimateSimmeringTime(description, instructions);
        factors.passiveTime.resting = this.estimateRestingTime(description, instructions);
        factors.activeTime.cooking = this.estimateActiveCookingTime(description, instructions, mealType);
        factors.activeTime.monitoring = this.estimateMonitoringTime(description, instructions);
        factors.prepWork.setup = this.getBaseSetupTime(mealType);
        factors.prepWork.mixing = this.getBaseMixingTime(ingredients.length, instructions.length);
        return factors;
      }
      /**
       * Estimate chopping time based on ingredients
       */
      estimateChoppingTime(ingredients) {
        let choppingTime = 0;
        ingredients.forEach((ingredient) => {
          const ingredientLower = ingredient.toLowerCase();
          if (["onion", "garlic", "shallot"].some((v) => ingredientLower.includes(v))) {
            choppingTime += 1.5;
          }
          if (["carrot", "celery", "pepper", "mushroom"].some((v) => ingredientLower.includes(v))) {
            choppingTime += 2;
          }
          if (["tomato", "potato", "zucchini", "eggplant"].some((v) => ingredientLower.includes(v))) {
            choppingTime += 2.5;
          }
          if (["herbs", "parsley", "cilantro", "basil"].some((h) => ingredientLower.includes(h))) {
            choppingTime += 0.5;
          }
          if (["ginger", "jalape\xF1o", "chili"].some((s) => ingredientLower.includes(s))) {
            choppingTime += 1;
          }
        });
        return Math.min(choppingTime, 15);
      }
      /**
       * Estimate marinating time from recipe text
       */
      estimateMarinatingTime(description, instructions) {
        const text2 = (description + " " + instructions.join(" ")).toLowerCase();
        if (text2.includes("overnight") || text2.includes("24 hour")) return 720;
        if (text2.includes("4 hour") || text2.includes("4-hour")) return 240;
        if (text2.includes("2 hour") || text2.includes("2-hour")) return 120;
        if (text2.includes("1 hour") || text2.includes("1-hour")) return 60;
        if (text2.includes("30 min") || text2.includes("half hour")) return 30;
        if (text2.includes("marinate") || text2.includes("marinade")) return 30;
        return 0;
      }
      /**
       * Estimate baking time
       */
      estimateBakingTime(description, instructions) {
        const text2 = (description + " " + instructions.join(" ")).toLowerCase();
        const bakingTimeMatch = text2.match(/bake.*?(\d+)\s*(?:min|minute)/);
        if (bakingTimeMatch) {
          return parseInt(bakingTimeMatch[1]);
        }
        if (text2.includes("oven") || text2.includes("bake")) {
          if (text2.includes("casserole") || text2.includes("roast")) return 45;
          if (text2.includes("cookie") || text2.includes("muffin")) return 15;
          if (text2.includes("bread") || text2.includes("cake")) return 30;
          return 25;
        }
        return 0;
      }
      /**
       * Estimate simmering time
       */
      estimateSimmeringTime(description, instructions) {
        const text2 = (description + " " + instructions.join(" ")).toLowerCase();
        const simmerTimeMatch = text2.match(/simmer.*?(\d+)\s*(?:min|minute)/);
        if (simmerTimeMatch) {
          return parseInt(simmerTimeMatch[1]);
        }
        if (text2.includes("simmer") || text2.includes("reduce")) {
          if (text2.includes("sauce") || text2.includes("reduction")) return 10;
          if (text2.includes("soup") || text2.includes("stew")) return 20;
          return 15;
        }
        return 0;
      }
      /**
       * Estimate resting time
       */
      estimateRestingTime(description, instructions) {
        const text2 = (description + " " + instructions.join(" ")).toLowerCase();
        if (text2.includes("rest") || text2.includes("cool") || text2.includes("set aside")) {
          if (text2.includes("meat") || text2.includes("steak")) return 5;
          if (text2.includes("dough") || text2.includes("bread")) return 15;
          return 3;
        }
        return 0;
      }
      /**
       * Estimate active cooking time
       */
      estimateActiveCookingTime(description, instructions, mealType) {
        const text2 = (description + " " + instructions.join(" ")).toLowerCase();
        const stepCount = instructions.length;
        let baseTime = 8;
        if (mealType === "breakfast") baseTime = 3;
        if (mealType === "lunch") baseTime = 6;
        if (mealType === "dinner") baseTime = 10;
        if (text2.includes("saut\xE9") || text2.includes("fry")) baseTime += 3;
        if (text2.includes("grill") || text2.includes("roast")) baseTime += 5;
        if (text2.includes("braise") || text2.includes("stew")) baseTime += 8;
        if (text2.includes("sauce") && text2.includes("from scratch")) baseTime += 5;
        baseTime += Math.max(0, stepCount - 4) * 1;
        return Math.min(baseTime, 30);
      }
      /**
       * Estimate monitoring time
       */
      estimateMonitoringTime(description, instructions) {
        const text2 = (description + " " + instructions.join(" ")).toLowerCase();
        let monitoringTime = 0;
        if (text2.includes("stir frequently") || text2.includes("stir occasionally")) monitoringTime += 3;
        if (text2.includes("watch carefully") || text2.includes("don't burn")) monitoringTime += 5;
        if (text2.includes("temperature") || text2.includes("thermometer")) monitoringTime += 2;
        if (text2.includes("reduce") || text2.includes("thicken")) monitoringTime += 3;
        return Math.min(monitoringTime, 15);
      }
      /**
       * Get base setup time by meal type
       */
      getBaseSetupTime(mealType) {
        const setupTimes = {
          "breakfast": 2,
          "lunch": 3,
          "dinner": 4,
          "snack": 1
        };
        return setupTimes[mealType] || 3;
      }
      /**
       * Get base mixing time
       */
      getBaseMixingTime(ingredientCount, stepCount) {
        const baseTime = Math.min(ingredientCount / 3, 5);
        const stepTime = Math.min(stepCount / 2, 3);
        return Math.round(baseTime + stepTime);
      }
      /**
       * Create time factors for a specific meal type with base estimates
       */
      createBaseMealTimeFactors(mealType, complexity) {
        const baseTimes = {
          breakfast: {
            prepWork: { chopping: 2, marinating: 0, mixing: 2, setup: 1 },
            activeTime: { cooking: 5, monitoring: 1 },
            passiveTime: { baking: 0, simmering: 0, resting: 0 }
          },
          lunch: {
            prepWork: { chopping: 4, marinating: 0, mixing: 3, setup: 2 },
            activeTime: { cooking: 8, monitoring: 2 },
            passiveTime: { baking: 0, simmering: 3, resting: 0 }
          },
          dinner: {
            prepWork: { chopping: 6, marinating: 0, mixing: 3, setup: 2 },
            activeTime: { cooking: 12, monitoring: 3 },
            passiveTime: { baking: 8, simmering: 5, resting: 2 }
          },
          snack: {
            prepWork: { chopping: 0, marinating: 0, mixing: 1, setup: 1 },
            activeTime: { cooking: 2, monitoring: 0 },
            passiveTime: { baking: 0, simmering: 0, resting: 0 }
          }
        };
        const base = baseTimes[mealType] || baseTimes.dinner;
        const complexityMultiplier = 0.9 + (complexity - 1) * 0.05;
        return {
          prepWork: {
            chopping: Math.round(base.prepWork.chopping * complexityMultiplier),
            marinating: base.prepWork.marinating,
            mixing: Math.round(base.prepWork.mixing * complexityMultiplier),
            setup: Math.round(base.prepWork.setup * complexityMultiplier)
          },
          activeTime: {
            cooking: Math.round(base.activeTime.cooking * complexityMultiplier),
            monitoring: Math.round(base.activeTime.monitoring * complexityMultiplier)
          },
          passiveTime: {
            baking: Math.round(base.passiveTime.baking * complexityMultiplier),
            simmering: Math.round(base.passiveTime.simmering * complexityMultiplier),
            resting: base.passiveTime.resting
          }
        };
      }
    };
  }
});

// server/intelligentRecipeAnalyzer.ts
var IntelligentRecipeAnalyzer;
var init_intelligentRecipeAnalyzer = __esm({
  "server/intelligentRecipeAnalyzer.ts"() {
    "use strict";
    init_recipeComplexityCalculator();
    init_enhancedCookingTimeCalculator();
    init_recipeIntelligenceTypes();
    IntelligentRecipeAnalyzer = class {
      complexityCalc = new RecipeComplexityCalculator();
      timeCalc = new EnhancedCookingTimeCalculator();
      /**
       * Analyze recipe requirements for each meal type
       */
      analyzeRecipeRequirements(mealType, cuisineType, maxCookTime, targetDifficulty, dietaryRestrictions) {
        const baseFactors = this.getBaseMealFactors(mealType);
        const cuisineAdjustment = this.getCuisineComplexity(cuisineType);
        baseFactors.techniqueComplexity = Math.min(baseFactors.techniqueComplexity + cuisineAdjustment, 5);
        const restrictionAdjustment = this.getDietaryComplexity(dietaryRestrictions);
        baseFactors.techniqueComplexity = Math.min(baseFactors.techniqueComplexity + restrictionAdjustment, 5);
        const complexity = this.complexityCalc.calculateComplexity(baseFactors);
        const timeFactors = this.estimateTimeRequirements(
          mealType,
          cuisineType,
          maxCookTime,
          complexity
        );
        const timeAnalysis = this.timeCalc.calculateTotalTime(timeFactors, complexity);
        return {
          complexity,
          estimatedTime: timeAnalysis.totalTime,
          timeBreakdown: timeAnalysis.breakdown,
          feasible: timeAnalysis.totalTime <= maxCookTime,
          recommendations: this.generateRecommendations(
            complexity,
            timeAnalysis.totalTime,
            maxCookTime,
            targetDifficulty
          )
        };
      }
      /**
       * Analyze requirements for an entire meal plan
       */
      async analyzeMealPlanRequirements(filters) {
        const mealTypes = this.getMealTypes(filters.mealsPerDay);
        const analysis = {};
        const primaryCuisine = filters.culturalBackground?.[0] || "american";
        const dietaryRestrictions = filters.dietaryRestrictions ? [filters.dietaryRestrictions] : [];
        for (const mealType of mealTypes) {
          const requirements = this.analyzeRecipeRequirements(
            mealType,
            primaryCuisine,
            filters.cookTime,
            filters.difficulty,
            dietaryRestrictions
          );
          analysis[mealType] = {
            targetComplexity: requirements.complexity,
            estimatedTime: requirements.estimatedTime,
            timeBreakdown: requirements.timeBreakdown,
            feasible: requirements.feasible,
            recommendations: requirements.recommendations
          };
        }
        return analysis;
      }
      /**
       * Get base complexity factors by meal type
       */
      getBaseMealFactors(mealType) {
        const baseMeals = {
          breakfast: {
            techniqueComplexity: 2,
            ingredientCount: 5,
            equipmentRequired: ["stovetop"],
            timingCritical: false,
            multiStep: false,
            skillRequired: ["basic_cooking"]
          },
          lunch: {
            techniqueComplexity: 2.5,
            ingredientCount: 7,
            equipmentRequired: ["stovetop"],
            timingCritical: false,
            multiStep: true,
            skillRequired: ["basic_cooking", "assembly"]
          },
          dinner: {
            techniqueComplexity: 3,
            ingredientCount: 9,
            equipmentRequired: ["stovetop", "oven"],
            timingCritical: true,
            multiStep: true,
            skillRequired: ["cooking", "seasoning", "timing"]
          },
          snack: {
            techniqueComplexity: 1,
            ingredientCount: 3,
            equipmentRequired: [],
            timingCritical: false,
            multiStep: false,
            skillRequired: ["assembly"]
          }
        };
        return baseMeals[mealType] || baseMeals.dinner;
      }
      /**
       * Get cuisine complexity adjustment
       */
      getCuisineComplexity(cuisine) {
        return CUISINE_COMPLEXITY[cuisine.toLowerCase()] || 0;
      }
      /**
       * Get dietary restriction complexity adjustment
       */
      getDietaryComplexity(restrictions) {
        let adjustment = 0;
        restrictions.forEach((restriction) => {
          adjustment += DIETARY_COMPLEXITY[restriction.toLowerCase()] || 0;
        });
        return Math.min(adjustment, 2);
      }
      /**
       * Estimate time requirements based on meal parameters
       */
      estimateTimeRequirements(mealType, cuisine, maxTime, complexity) {
        const baseTimeFactors = this.timeCalc.createBaseMealTimeFactors(mealType, complexity);
        const cuisineTimeMultiplier = this.getCuisineTimeMultiplier(cuisine);
        return {
          prepWork: {
            chopping: Math.round(baseTimeFactors.prepWork.chopping * cuisineTimeMultiplier),
            marinating: baseTimeFactors.prepWork.marinating,
            mixing: Math.round(baseTimeFactors.prepWork.mixing * cuisineTimeMultiplier),
            setup: baseTimeFactors.prepWork.setup
          },
          activeTime: {
            cooking: Math.round(baseTimeFactors.activeTime.cooking * cuisineTimeMultiplier),
            monitoring: Math.round(baseTimeFactors.activeTime.monitoring * cuisineTimeMultiplier)
          },
          passiveTime: {
            baking: baseTimeFactors.passiveTime.baking,
            simmering: Math.round(baseTimeFactors.passiveTime.simmering * cuisineTimeMultiplier),
            resting: baseTimeFactors.passiveTime.resting
          }
        };
      }
      /**
       * Get cuisine-specific time multipliers
       */
      getCuisineTimeMultiplier(cuisine) {
        const timeMultipliers = {
          "american": 1,
          "italian": 1.1,
          // More sauce work
          "mexican": 1,
          "chinese": 1.2,
          // More prep work, stir-frying
          "indian": 1.3,
          // Spice preparation, longer cooking
          "french": 1.4,
          // Technique-heavy
          "thai": 1.2,
          // Fresh ingredient prep
          "japanese": 1.1,
          // Precise preparation
          "mediterranean": 1,
          "korean": 1.2,
          // Fermented ingredients, marinades
          "vietnamese": 1.1,
          // Fresh herb preparation
          "middle_eastern": 1.1,
          "moroccan": 1.3,
          // Spice blending, slow cooking
          "ethiopian": 1.4,
          // Complex spice preparations
          "molecular": 2
          // Specialized techniques
        };
        return timeMultipliers[cuisine.toLowerCase()] || 1;
      }
      /**
       * Generate recommendations based on analysis
       */
      generateRecommendations(complexity, estimatedTime, maxTime, targetDifficulty) {
        const recommendations = [];
        if (estimatedTime > maxTime) {
          recommendations.push(`Consider reducing complexity to meet ${maxTime}min time limit`);
          recommendations.push("Focus on one-pot meals or sheet pan recipes");
          recommendations.push("Use pre-prepared ingredients to save time");
        }
        if (complexity > targetDifficulty) {
          recommendations.push("Simplify cooking techniques for target difficulty");
          recommendations.push("Use fewer specialized equipment requirements");
          recommendations.push("Reduce number of simultaneous cooking processes");
        }
        if (complexity < targetDifficulty - 1) {
          recommendations.push("Consider adding more advanced techniques");
          recommendations.push("Include more sophisticated flavor development");
          recommendations.push("Add multi-step cooking processes for complexity");
        }
        if (estimatedTime < maxTime * 0.6) {
          recommendations.push("Can add more elaborate preparation steps");
          recommendations.push("Consider techniques that develop deeper flavors");
        }
        return recommendations;
      }
      /**
       * Get meal types based on meals per day
       */
      getMealTypes(mealsPerDay) {
        const allMeals = ["breakfast", "lunch", "dinner", "snack"];
        return allMeals.slice(0, mealsPerDay);
      }
      /**
       * Generate complexity guidance for GPT prompts
       */
      generateComplexityGuidance(difficulty) {
        const guidanceMap = {
          1: `
- Level 1: Use basic techniques (mixing, heating, assembly)
- Simple ingredients, minimal prep work  
- Single-step cooking methods
- Total time should include realistic beginner pace`,
          2: `
- Level 2: Simple cooking methods (saut\xE9ing, boiling)
- Basic knife skills acceptable
- 2-3 step processes maximum
- Allow extra time for learning curve`,
          3: `
- Level 3: Multiple cooking steps allowed
- Roasting, braising, basic sauce making
- Temperature control required
- Moderate prep work and timing coordination`,
          4: `
- Level 4: Advanced techniques (emulsification, reduction)
- Precise timing and temperature control
- Complex layering of flavors
- Skilled knife work expected`,
          5: `
- Level 5: Professional techniques
- Critical timing requirements
- Advanced equipment usage
- Expert-level skills assumed`
        };
        return guidanceMap[difficulty] || guidanceMap[3];
      }
      /**
       * Analyze existing recipe for accuracy validation
       */
      analyzeExistingRecipe(recipe) {
        const factors = this.complexityCalc.estimateComplexityFromText(
          recipe.description || recipe.title,
          recipe.ingredients,
          recipe.instructions
        );
        const predictedComplexity = this.complexityCalc.calculateComplexity(factors);
        const timeFactors = this.timeCalc.estimateFromRecipeDescription(
          recipe.description || recipe.title,
          recipe.ingredients,
          recipe.instructions
        );
        const timeAnalysis = this.timeCalc.calculateTotalTime(timeFactors, predictedComplexity);
        const predictedTime = timeAnalysis.totalTime;
        const timeDifference = Math.abs(predictedTime - recipe.cookTime);
        const complexityDifference = Math.abs(predictedComplexity - recipe.difficulty);
        return {
          predictedComplexity,
          predictedTime,
          accuracyAssessment: {
            timeAccurate: timeDifference <= recipe.cookTime * 0.2,
            // Within 20%
            complexityAccurate: complexityDifference <= 1,
            // Within 1 level
            timeDifference,
            complexityDifference
          }
        };
      }
    };
  }
});

// server/enhancedRecipeGenerationService.ts
var EnhancedRecipeGenerationService;
var init_enhancedRecipeGenerationService = __esm({
  "server/enhancedRecipeGenerationService.ts"() {
    "use strict";
    init_intelligentRecipeAnalyzer();
    EnhancedRecipeGenerationService = class {
      analyzer = new IntelligentRecipeAnalyzer();
      /**
       * Generate enhanced meal plan with pre-analysis intelligence
       */
      async generateMealPlan(filters) {
        try {
          console.log("\u{1F680} Starting enhanced meal plan generation...");
          const mealAnalysis = await this.analyzeMealRequirements(filters);
          const enhancedPrompt = this.buildEnhancedPrompt(filters, mealAnalysis);
          const response = await this.callAIService(enhancedPrompt, filters);
          const validatedResponse = this.validateAndAdjustResponse(response, mealAnalysis);
          return {
            success: true,
            data: validatedResponse,
            metadata: {
              generatedAt: /* @__PURE__ */ new Date(),
              calculatorVersion: "2.0",
              timingAccuracy: this.getTimingAccuracy(validatedResponse),
              complexityValidation: this.getComplexityValidation(validatedResponse),
              preAnalysis: mealAnalysis
            }
          };
        } catch (error) {
          console.error("\u274C Enhanced recipe generation failed:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            metadata: {
              generatedAt: /* @__PURE__ */ new Date(),
              calculatorVersion: "2.0",
              timingAccuracy: 0,
              complexityValidation: 0,
              preAnalysis: {}
            }
          };
        }
      }
      /**
       * Analyze meal requirements for each meal type
       */
      async analyzeMealRequirements(filters) {
        const mealTypes = this.getMealTypes(filters.mealsPerDay);
        const analysis = {};
        const primaryCuisine = filters.culturalBackground?.[0] || "american";
        const dietaryRestrictions = filters.dietaryRestrictions ? [filters.dietaryRestrictions] : [];
        for (const mealType of mealTypes) {
          const requirements = this.analyzer.analyzeRecipeRequirements(
            mealType,
            primaryCuisine,
            filters.cookTime,
            filters.difficulty,
            dietaryRestrictions
          );
          analysis[mealType] = {
            targetComplexity: requirements.complexity,
            estimatedTime: requirements.estimatedTime,
            timeBreakdown: requirements.timeBreakdown,
            feasible: requirements.feasible,
            recommendations: requirements.recommendations
          };
        }
        return analysis;
      }
      /**
       * Build enhanced prompt with pre-analysis intelligence
       */
      buildEnhancedPrompt(filters, analysis) {
        let prompt = `Create exactly a ${filters.numDays}-day meal plan with ${filters.mealsPerDay} meals per day`;
        if (filters.primaryGoal === "Save Money") {
          prompt += ` focused on cost-effectiveness and budget-friendly meals with ingredient reuse`;
        } else if (filters.primaryGoal === "Eat Healthier") {
          prompt += ` focused on nutritious, wholesome meals`;
        } else if (filters.primaryGoal === "Save Time") {
          prompt += ` focused on quick, efficient meal preparation`;
        }
        if (filters.profileType === "family" && filters.familySize) {
          prompt += ` for a family of ${filters.familySize}`;
        }
        prompt += `

REQUIREMENTS:`;
        prompt += `
- Max cook time: ${filters.cookTime} minutes (including prep + cook time)`;
        prompt += `
- Difficulty level: ${filters.difficulty}/5`;
        prompt += `

MEAL-SPECIFIC REQUIREMENTS (CRITICAL - FOLLOW EXACTLY):`;
        Object.entries(analysis).forEach(([mealType, data]) => {
          prompt += `
${mealType.toUpperCase()}:`;
          prompt += `
- Target complexity: ${data.targetComplexity}/5`;
          prompt += `
- Target time: ${data.estimatedTime} minutes (prep + cook combined)`;
          prompt += `
- Time breakdown guidance: ${data.timeBreakdown.slice(0, 3).join(", ")}`;
          if (!data.feasible) {
            prompt += `
- \u26A0\uFE0F IMPORTANT: Simplify this meal - current estimates exceed time limit`;
          }
          if (data.recommendations.length > 0) {
            prompt += `
- Recommendations: ${data.recommendations[0]}`;
          }
        });
        prompt += `

COMPLEXITY GUIDANCE BY DIFFICULTY LEVEL:`;
        prompt += this.analyzer.generateComplexityGuidance(filters.difficulty);
        prompt += `

TIME ACCURACY REQUIREMENTS (CRITICAL):`;
        prompt += `
- MUST provide realistic cook_time_minutes that includes BOTH prep AND cooking time`;
        prompt += `
- Break down time estimates: "15 min prep + 20 min cook = 35 min total"`;
        prompt += `
- Consider skill level: difficulty ${filters.difficulty} recipes need appropriate time`;
        prompt += `
- Passive time (baking, simmering) should be noted separately in instructions`;
        prompt += `
- Time estimates must be realistic for home cooks, not professional chefs`;
        if (filters.culturalBackground && filters.culturalBackground.length > 0) {
          prompt += `

\u{1F30D} CULTURAL CUISINE INTEGRATION:`;
          prompt += `
- Incorporate ${filters.culturalBackground.join(", ")} cuisine elements`;
          prompt += `
- Use authentic cooking techniques and ingredients when possible`;
          prompt += `
- Respect cultural food traditions and flavor profiles`;
        }
        if (filters.dietaryRestrictions) {
          prompt += `

\u{1F957} DIETARY REQUIREMENTS:`;
          prompt += `
- STRICT adherence to ${filters.dietaryRestrictions} requirements`;
          prompt += `
- Double-check all ingredients for compliance`;
          prompt += `
- Suggest alternatives if traditional recipes need modification`;
        }
        prompt += `

OUTPUT FORMAT - Generate ALL ${filters.numDays} days in this exact JSON format:`;
        prompt += `
{`;
        prompt += `
  "meal_plan": {`;
        prompt += `
    "day_1": {`;
        const mealTypes = this.getMealTypes(filters.mealsPerDay);
        mealTypes.forEach((meal, index2) => {
          const mealAnalysis = analysis[meal];
          prompt += `
      "${meal}": {`;
          prompt += `
        "title": "Recipe Name",`;
          prompt += `
        "cook_time_minutes": ${mealAnalysis?.estimatedTime || 20}, // Target: ${mealAnalysis?.estimatedTime || 20}min`;
          prompt += `
        "difficulty": ${mealAnalysis?.targetComplexity || filters.difficulty}, // Target: ${mealAnalysis?.targetComplexity || filters.difficulty}/5`;
          prompt += `
        "time_breakdown": "X min prep + Y min cook", // REQUIRED breakdown`;
          prompt += `
        "ingredients": ["ingredient1", "ingredient2"],`;
          prompt += `
        "instructions": ["step1", "step2"],`;
          prompt += `
        "nutrition": {"calories": 350, "protein_g": 20, "carbs_g": 30, "fat_g": 15}`;
          prompt += `
      }${index2 !== mealTypes.length - 1 ? "," : ""}`;
        });
        prompt += `
    },`;
        prompt += `
    "day_2": { ... similar structure ... },`;
        prompt += `
    ... continue for all ${filters.numDays} days ...`;
        prompt += `
  },`;
        prompt += `
  "shopping_list": ["ingredient list"],`;
        prompt += `
  "prep_tips": ["tip 1", "tip 2"],`;
        prompt += `
  "time_optimization_tips": ["batch prep suggestions", "advance prep options"]`;
        prompt += `
}`;
        if (filters.encourageOverlap) {
          prompt += `

MAXIMIZE INGREDIENT REUSE for bulk buying opportunities and cost savings!`;
        }
        return prompt;
      }
      /**
       * Call AI service (placeholder for your existing OpenAI integration)
       */
      async callAIService(prompt, filters) {
        console.log("\u{1F4DD} Enhanced prompt generated (length:", prompt.length, "chars)");
        console.log("\u{1F916} Would call AI service here with enhanced prompt...");
        return {
          meal_plan: {
            day_1: {
              breakfast: {
                title: "Scrambled Eggs with Toast",
                cook_time_minutes: 12,
                difficulty: 1,
                time_breakdown: "3 min prep + 9 min cook",
                ingredients: ["eggs", "butter", "bread", "salt"],
                instructions: ["Crack eggs", "Heat pan", "Scramble eggs", "Toast bread"],
                nutrition: { calories: 320, protein_g: 18, carbs_g: 24, fat_g: 15 }
              }
            }
          },
          shopping_list: ["eggs", "butter", "bread", "salt"],
          prep_tips: ["Pre-crack eggs the night before"],
          time_optimization_tips: ["Toast bread while eggs cook"]
        };
      }
      /**
       * Validate and adjust the AI response
       */
      validateAndAdjustResponse(response, analysis) {
        if (!response.meal_plan) {
          console.warn("\u26A0\uFE0F Response missing meal_plan structure");
          return response;
        }
        for (const dayKey in response.meal_plan) {
          const day = response.meal_plan[dayKey];
          for (const mealType in day) {
            const meal = day[mealType];
            const expected = analysis[mealType];
            if (!expected) continue;
            const timeAccurate = meal.cook_time_minutes <= expected.estimatedTime * 1.2;
            if (!timeAccurate) {
              console.warn(`\u26A0\uFE0F ${mealType} time estimate high: ${meal.cook_time_minutes}min vs expected ${expected.estimatedTime}min`);
            }
            const complexityAccurate = Math.abs(meal.difficulty - expected.targetComplexity) <= 1;
            if (!complexityAccurate) {
              console.warn(`\u26A0\uFE0F ${mealType} difficulty mismatch: ${meal.difficulty} vs expected ${expected.targetComplexity}`);
            }
            meal.validation = {
              timeAccurate,
              complexityAccurate,
              feasible: expected.feasible
            };
          }
        }
        return response;
      }
      /**
       * Calculate timing accuracy percentage
       */
      getTimingAccuracy(response) {
        let accurateCount = 0;
        let totalCount = 0;
        for (const dayKey in response.meal_plan) {
          const day = response.meal_plan[dayKey];
          for (const mealKey in day) {
            const meal = day[mealKey];
            totalCount++;
            if (meal.validation?.timeAccurate) {
              accurateCount++;
            }
          }
        }
        return totalCount > 0 ? Math.round(accurateCount / totalCount * 100) : 0;
      }
      /**
       * Calculate complexity validation percentage
       */
      getComplexityValidation(response) {
        let accurateCount = 0;
        let totalCount = 0;
        for (const dayKey in response.meal_plan) {
          const day = response.meal_plan[dayKey];
          for (const mealKey in day) {
            const meal = day[mealKey];
            totalCount++;
            if (meal.validation?.complexityAccurate) {
              accurateCount++;
            }
          }
        }
        return totalCount > 0 ? Math.round(accurateCount / totalCount * 100) : 0;
      }
      /**
       * Get meal types based on meals per day
       */
      getMealTypes(mealsPerDay) {
        const allMeals = ["breakfast", "lunch", "dinner", "snack"];
        return allMeals.slice(0, mealsPerDay);
      }
      /**
       * Build system message for AI service
       */
      buildSystemMessage(filters) {
        let systemMsg = `You are an expert meal planning chef with deep knowledge of cooking times and recipe complexity.`;
        if (filters.primaryGoal === "Save Money") {
          systemMsg += ` You specialize in cost-optimization meal planning that maximizes ingredient reuse to reduce grocery costs and enable bulk buying.`;
        }
        systemMsg += ` 
CRITICAL ACCURACY REQUIREMENTS:
- Cooking times must be realistic and include BOTH prep AND active cooking time
- Difficulty ratings must match the actual techniques required
- Time estimates should account for skill level - beginners need more time
- Always provide time breakdowns to show your reasoning
- Validate that total time fits within user's constraints

Your meal plans should be practical, delicious, and precisely timed for real home cooks.
Always return valid JSON with the exact structure requested.`;
        return systemMsg;
      }
    };
  }
});

// server/intelligentPromptBuilder.ts
var intelligentPromptBuilder_exports = {};
__export(intelligentPromptBuilder_exports, {
  UNIFIED_GOALS: () => UNIFIED_GOALS,
  buildEnhancedIntelligentPrompt: () => buildEnhancedIntelligentPrompt,
  buildIntelligentPrompt: () => buildIntelligentPrompt,
  enhanceMealWithIntelligentTiming: () => enhanceMealWithIntelligentTiming,
  extractFamilyDietaryNeeds: () => extractFamilyDietaryNeeds,
  generateEnhancedMealPlan: () => generateEnhancedMealPlan,
  generateStandardMealPlan: () => generateStandardMealPlan,
  getDifficultyAdjustedPromptSuffix: () => getDifficultyAdjustedPromptSuffix,
  getUnifiedGoal: () => getUnifiedGoal,
  validateEnhancedMealPlan: () => validateEnhancedMealPlan,
  validateMealConstraints: () => validateMealConstraints
});
async function buildIntelligentPrompt(filters) {
  console.log("\n\u{1F528} PROMPT BUILDER STARTED");
  console.log("\u{1F4CB} Input Filters:", JSON.stringify(filters, null, 2));
  let prompt = `Create exactly a ${filters.numDays}-day meal plan with ${filters.mealsPerDay} meals per day`;
  console.log("1\uFE0F\u20E3 Base prompt:", prompt);
  if (filters.profileType === "family" && filters.familySize) {
    prompt += ` for a family of ${filters.familySize}`;
    console.log("2\uFE0F\u20E3 Added family size:", `family of ${filters.familySize}`);
    if (filters.familyMembers && filters.familyMembers.length > 0) {
      const childrenCount = filters.familyMembers.filter((m) => m.ageGroup === "Child").length;
      const adultCount = filters.familyMembers.filter((m) => m.ageGroup === "Adult").length;
      console.log("\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466} Family composition:", { adults: adultCount, children: childrenCount });
      if (childrenCount > 0) {
        prompt += ` (${adultCount} adults, ${childrenCount} children)`;
        console.log("2\uFE0F\u20E3 Updated with ages:", `(${adultCount} adults, ${childrenCount} children)`);
      }
    }
  }
  if (filters.primaryGoal) {
    const goalAdjustments = applyPrimaryGoalLogic(filters.primaryGoal, filters);
    prompt += goalAdjustments.prompt;
    Object.assign(filters, goalAdjustments.adjustedFilters);
  }
  prompt += `

REQUIREMENTS:`;
  prompt += `
- Max cook time: ${filters.cookTime} minutes (including prep + cook time)`;
  prompt += `
- Difficulty level: MAXIMUM ${filters.difficulty}/5 (use 0.5 increments: 1, 1.5, 2, 2.5, 3, etc.)`;
  prompt += `
- CRITICAL: ALL recipes must have difficulty <= ${filters.difficulty}`;
  prompt += `
- Use precise difficulty ratings in 0.5 increments for accurate complexity assessment`;
  if (filters.prepTimePreference === "minimal") {
    prompt += `
- Prioritize minimal prep time recipes (under 10 minutes prep)`;
    prompt += `
- Focus on one-pot or sheet pan meals when possible`;
  } else if (filters.prepTimePreference === "enjoys_cooking") {
    prompt += `
- Include recipes with more involved preparation when appropriate`;
    prompt += `
- Can include multi-step cooking processes`;
  }
  prompt += getDifficultyAdjustedPromptSuffix(filters.difficulty);
  if (filters.nutritionGoal) {
    prompt += `
- Nutrition goal: ${filters.nutritionGoal}`;
  }
  if (filters.familyMembers && filters.familyMembers.length > 0) {
    console.log("\u{1F465} Processing family members:");
    filters.familyMembers.forEach((member, index2) => {
      console.log(`   Member ${index2 + 1}: ${member.name} (${member.ageGroup})`);
      console.log(`   - Preferences: [${member.preferences.join(", ")}]`);
      console.log(`   - Goals: [${member.goals.join(", ")}]`);
    });
    const allPreferences = filters.familyMembers.flatMap((m) => m.preferences);
    const uniquePreferences = [...new Set(allPreferences)];
    console.log("\u{1F37D}\uFE0F All family preferences combined:", uniquePreferences);
    if (uniquePreferences.length > 0) {
      prompt += `
- Family dietary preferences: ${uniquePreferences.join(", ")}`;
      console.log("3\uFE0F\u20E3 Added family preferences to prompt:", uniquePreferences.join(", "));
    }
    const hasChildren = filters.familyMembers.some((m) => m.ageGroup === "Child");
    if (hasChildren) {
      prompt += `
- Include child-friendly options that are appealing to kids`;
      prompt += `
- Avoid overly spicy or complex flavors for children`;
      console.log("\u{1F476} Added child-friendly requirements");
    }
  }
  if (filters.dietaryRestrictions) {
    prompt += `
- Dietary restrictions: ${filters.dietaryRestrictions}`;
    console.log("\u{1F6AB} Added dietary restrictions:", filters.dietaryRestrictions);
  }
  if (filters.availableIngredients) {
    const usagePercent = filters.availableIngredientUsagePercent || (filters.primaryGoal === "Save Money" ? 80 : 50);
    prompt += `
- Use these available ingredients in at least ${usagePercent}% of meals: ${filters.availableIngredients}`;
    prompt += `
- You may suggest additional ingredients for variety and nutritional completeness`;
  }
  if (filters.excludeIngredients) {
    prompt += `
- Completely avoid these ingredients: ${filters.excludeIngredients}`;
  }
  if (filters.encourageOverlap) {
    prompt += `
- IMPORTANT: Maximize ingredient reuse across meals to minimize shopping costs`;
    prompt += `
- Aim for 3+ shared ingredients between different meals`;
    prompt += `
- Suggest bulk buying opportunities when possible`;
  }
  console.log("\u{1F30D} Cultural cuisine data available:", !!filters.culturalCuisineData);
  console.log("\u{1F30D} Cultural background:", filters.culturalBackground);
  if (filters.culturalCuisineData && filters.culturalBackground && filters.culturalBackground.length > 0) {
    prompt += `

\u{1F30D} CULTURAL CUISINE INTEGRATION:`;
    prompt += `
- Include authentic dishes from user's cultural background: ${filters.culturalBackground.join(", ")}`;
    console.log("4\uFE0F\u20E3 Added cultural background to prompt:", filters.culturalBackground.join(", "));
    for (const culture of filters.culturalBackground) {
      if (filters.culturalCuisineData[culture]) {
        const cultureData = filters.culturalCuisineData[culture];
        const mealNames = cultureData.meals ? cultureData.meals.map((meal) => meal.name).slice(0, 3) : [];
        const keyIngredients = cultureData.key_ingredients ? cultureData.key_ingredients.slice(0, 5) : [];
        console.log(`   \u{1F4DD} ${culture} specific dishes:`, mealNames);
        console.log(`   \u{1F958} ${culture} key ingredients:`, keyIngredients);
        const cookingStyles = cultureData.styles ? cultureData.styles.slice(0, 3) : [];
        if (mealNames.length > 0) {
          prompt += `
- ${culture} dishes to consider: ${mealNames.join(", ")}`;
        }
        if (keyIngredients.length > 0) {
          prompt += `
- ${culture} key ingredients: ${keyIngredients.join(", ")}`;
        }
        if (cookingStyles.length > 0) {
          prompt += `
- ${culture} cooking styles: ${cookingStyles.join(", ")}`;
        }
        if (cultureData.meals && cultureData.meals.length > 0) {
          const healthyMods = cultureData.meals.flatMap((meal) => meal.healthy_mods || []).slice(0, 3);
          if (healthyMods.length > 0) {
            prompt += `
- ${culture} healthy modifications: ${healthyMods.join(", ")}`;
          }
        }
      }
    }
    prompt += `
- Aim for exactly 50% of meals to incorporate cultural cuisine elements`;
    prompt += `
- For cultural meals, use the specific dish suggestions provided above when possible`;
    prompt += `
- Balance cultural authenticity with dietary restrictions and family preferences`;
    prompt += `
- Non-cultural meals should focus on variety and user's primary dietary goals`;
    prompt += await addConflictResolutionGuidance(filters);
  }
  if (filters.varietyPreference === "high_variety") {
    prompt += `
- Vary cuisines: Italian, Asian, Mexican, Mediterranean, American`;
    prompt += `
- Include diverse cooking methods: grilling, baking, stir-frying, slow cooking`;
  } else if (filters.varietyPreference === "consistent") {
    prompt += `
- Keep cuisines consistent and familiar`;
    prompt += `
- Focus on proven, reliable recipes`;
  }
  if (filters.prepTimePreference === "minimal") {
    prompt += `
- Prioritize quick prep and one-pot meals`;
    prompt += `
- Include meal prep suggestions for efficiency`;
  } else if (filters.prepTimePreference === "enjoys_cooking") {
    prompt += `
- Include some complex, rewarding recipes`;
    prompt += `
- Add cooking techniques that are educational and fun`;
  }
  const dayStructure = [];
  for (let i = 1; i <= filters.numDays; i++) {
    dayStructure.push(`"day_${i}"`);
  }
  prompt += `

CRITICAL: Generate exactly ${filters.numDays} days: ${dayStructure.join(", ")}.`;
  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];
  const selectedMealTypes = mealTypes.slice(0, filters.mealsPerDay);
  const mealExamples = selectedMealTypes.map((mealType, index2) => {
    const calories = 350 + index2 * 50;
    const protein = 20 + index2 * 5;
    const carbs = 30 + index2 * 5;
    const fat = 15 + index2 * 3;
    return `      "${mealType}": {"title": "Recipe Name", "cook_time_minutes": ${15 + index2 * 5}, "difficulty": ${2 + index2}, "ingredients": ["ingredient${index2 + 1}"], "instructions": ["step${index2 + 1}"], "nutrition": {"calories": ${calories}, "protein_g": ${protein}, "carbs_g": ${carbs}, "fat_g": ${fat}}}`;
  }).join(",\n");
  prompt += `

RETURN FORMAT: Valid JSON with this exact structure:
{
  "meal_plan": {
    "day_1": {
${mealExamples}
    }
    // ... continue for all ${filters.numDays} days with ${filters.mealsPerDay} meals each
  },
  "shopping_list": ["consolidated ingredient list"],
  "prep_tips": ["helpful preparation suggestions"],
  "estimated_savings": ${filters.encourageOverlap ? 15.5 : 0}
}`;
  console.log("\n\u2705 FINAL PROMPT BUILT:");
  console.log("=".repeat(50));
  console.log(prompt);
  console.log("=".repeat(50));
  console.log("\u{1F528} PROMPT BUILDER COMPLETED\n");
  return prompt;
}
function getUnifiedGoal(goalValue) {
  return UNIFIED_GOALS.find((goal) => goal.value.toLowerCase() === goalValue.toLowerCase()) || null;
}
function applyPrimaryGoalLogic(primaryGoal, filters) {
  const unifiedGoal = getUnifiedGoal(primaryGoal);
  if (unifiedGoal) {
    let prompt = ` ${unifiedGoal.prompts[0].toLowerCase().replace(":", "")}`;
    const goalPrompts = unifiedGoal.prompts.slice(1).map((p) => `
- ${p}`).join("");
    prompt += goalPrompts;
    const adjustedFilters = {
      ...unifiedGoal.filterAdjustments,
      nutritionGoal: unifiedGoal.nutritionFocus
    };
    return { prompt, adjustedFilters };
  }
  return {
    prompt: ` with balanced nutrition and practical meal planning`,
    adjustedFilters: {
      availableIngredientUsagePercent: 60,
      nutritionGoal: "general_wellness"
    }
  };
}
function extractFamilyDietaryNeeds(familyMembers) {
  const allPreferences = familyMembers.flatMap((m) => m.preferences);
  const allGoals = familyMembers.flatMap((m) => m.goals);
  const preferences = [...new Set(allPreferences)];
  const goals = [...new Set(allGoals)];
  const restrictions = preferences.filter(
    (pref) => pref.toLowerCase().includes("gluten-free") || pref.toLowerCase().includes("dairy-free") || pref.toLowerCase().includes("vegan") || pref.toLowerCase().includes("vegetarian") || pref.toLowerCase().includes("keto") || pref.toLowerCase().includes("paleo")
  );
  return { preferences, restrictions, goals };
}
function enhanceMealWithIntelligentTiming(meal) {
  if (!meal.ingredients || !meal.title) {
    return meal;
  }
  const recipe = {
    title: meal.title,
    ingredients: meal.ingredients,
    instructions: meal.instructions || [],
    servings: 4
  };
  const calculation = calculateCookingTimeAndDifficulty(recipe);
  return {
    ...meal,
    cook_time_minutes: calculation.totalMinutes,
    prep_time_minutes: calculation.prepTime,
    actual_cook_time_minutes: calculation.cookTime,
    difficulty: calculation.difficulty,
    timing_breakdown: calculation.breakdown,
    cooking_recommendations: calculation.recommendations,
    easy_alternatives: getEasyAlternatives(recipe)
  };
}
function validateMealConstraints(meal, filters) {
  const issues = [];
  const suggestions = [];
  if (meal.cook_time_minutes > filters.cookTime) {
    issues.push(`Cooking time (${meal.cook_time_minutes}min) exceeds limit (${filters.cookTime}min)`);
    suggestions.push("Consider using meal prep techniques to reduce active cooking time");
    suggestions.push("Look for one-pot or sheet pan alternatives");
  }
  if (meal.difficulty > filters.difficulty) {
    issues.push(`Difficulty level (${meal.difficulty}) exceeds preference (${filters.difficulty})`);
    if (meal.easy_alternatives && meal.easy_alternatives.length > 0) {
      suggestions.push(`Easy alternatives: ${meal.easy_alternatives.slice(0, 2).join(", ")}`);
    }
  }
  if (filters.prepTimePreference === "minimal" && meal.prep_time_minutes > 15) {
    issues.push("High prep time may not suit minimal prep preference");
    suggestions.push("Consider using pre-cut vegetables or convenience ingredients");
  }
  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  };
}
function getDifficultyAdjustedPromptSuffix(difficulty) {
  let suffix = "\n\nCOOKING TIME GUIDANCE:";
  switch (difficulty) {
    case 1:
      suffix += "\n- Focus on simple, quick-prep ingredients";
      suffix += "\n- Prioritize one-pot or microwave-friendly meals";
      suffix += "\n- Minimal knife work required";
      break;
    case 2:
      suffix += "\n- Basic cooking methods (saute, boil, bake)";
      suffix += "\n- Some prep work acceptable (chopping, mixing)";
      suffix += "\n- Simple timing coordination";
      break;
    case 3:
      suffix += "\n- Multiple cooking methods can be combined";
      suffix += "\n- Moderate prep time and ingredient complexity";
      suffix += "\n- Basic timing and temperature control";
      break;
    case 4:
      suffix += "\n- Advanced techniques welcome (searing, reducing, etc.)";
      suffix += "\n- Complex ingredient preparation acceptable";
      suffix += "\n- Multi-step processes with timing coordination";
      break;
    case 5:
      suffix += "\n- Professional-level techniques encouraged";
      suffix += "\n- Complex preparations and advanced skills";
      suffix += "\n- Precise timing and temperature control required";
      break;
  }
  suffix += "\n\nIMPORTANT: Provide realistic cook_time_minutes that includes both prep and cooking time.";
  return suffix;
}
async function generateEnhancedMealPlan(filters) {
  const enhancedService = new EnhancedRecipeGenerationService();
  console.log("\u{1F680} Using Enhanced Recipe Generation System");
  console.log(`Target: ${filters.difficulty}/5 difficulty, ${filters.cookTime}min max time`);
  try {
    const result = await enhancedService.generateMealPlan(filters);
    if (result.success) {
      console.log(`\u2705 Enhanced generation complete - Time accuracy: ${result.metadata.timingAccuracy}%`);
      return {
        success: true,
        data: result.data,
        metadata: {
          ...result.metadata,
          enhancedSystem: true,
          preAnalysisUsed: Object.keys(result.metadata.preAnalysis).length > 0
        }
      };
    } else {
      console.log("\u274C Enhanced generation failed, falling back to standard system");
      return generateStandardMealPlan(filters);
    }
  } catch (error) {
    console.error("Enhanced generation error:", error);
    return generateStandardMealPlan(filters);
  }
}
function generateStandardMealPlan(filters) {
  console.log("\u{1F4DD} Using Standard Recipe Generation System (fallback)");
  const prompt = buildIntelligentPrompt(filters);
  return {
    success: true,
    prompt,
    metadata: {
      generatedAt: /* @__PURE__ */ new Date(),
      enhancedSystem: false,
      calculatorVersion: "1.0"
    }
  };
}
async function buildEnhancedIntelligentPrompt(filters) {
  const enhancedService = new EnhancedRecipeGenerationService();
  try {
    const mealAnalysis = await enhancedService.analyzeMealRequirements(filters);
    let enhancedPrompt = buildIntelligentPrompt(filters);
    enhancedPrompt += `

\u{1F9E0} ENHANCED MEAL-SPECIFIC GUIDANCE:`;
    Object.entries(mealAnalysis).forEach(([mealType, analysis]) => {
      enhancedPrompt += `
${mealType.toUpperCase()}:`;
      enhancedPrompt += `
- Target complexity: ${analysis.targetComplexity}/5`;
      enhancedPrompt += `
- Target time: ${analysis.estimatedTime} minutes`;
      enhancedPrompt += `
- Time breakdown: ${analysis.timeBreakdown.slice(0, 2).join(", ")}`;
      if (!analysis.feasible) {
        enhancedPrompt += `
- \u26A0\uFE0F IMPORTANT: Simplify - current estimates exceed time limit`;
      }
    });
    enhancedPrompt += `

\u23F1\uFE0F ENHANCED TIME ACCURACY REQUIREMENTS:`;
    enhancedPrompt += `
- CRITICAL: cook_time_minutes must include BOTH prep AND cooking time`;
    enhancedPrompt += `
- Provide time breakdown: "X min prep + Y min cook = Z min total"`;
    enhancedPrompt += `
- Account for difficulty level ${filters.difficulty} skill requirements`;
    enhancedPrompt += `
- Be realistic for home cooks, not professional kitchens`;
    return enhancedPrompt;
  } catch (error) {
    console.warn("Enhanced prompt building failed, using standard prompt:", error);
    return buildIntelligentPrompt(filters);
  }
}
function validateEnhancedMealPlan(mealPlan, filters) {
  const issues = [];
  const suggestions = [];
  let timeAccurateCount = 0;
  let complexityAccurateCount = 0;
  let totalMeals = 0;
  if (!mealPlan.meal_plan) {
    return {
      isValid: false,
      accuracy: { timingAccuracy: 0, complexityAccuracy: 0 },
      issues: ["Missing meal_plan structure"],
      suggestions: ["Ensure response follows correct JSON format"]
    };
  }
  for (const dayKey in mealPlan.meal_plan) {
    const day = mealPlan.meal_plan[dayKey];
    for (const mealType in day) {
      const meal = day[mealType];
      totalMeals++;
      if (meal.cook_time_minutes <= filters.cookTime) {
        timeAccurateCount++;
      } else {
        issues.push(`${mealType} exceeds time limit: ${meal.cook_time_minutes}min > ${filters.cookTime}min`);
      }
      if (meal.difficulty <= filters.difficulty) {
        complexityAccurateCount++;
      } else {
        issues.push(`${mealType} exceeds difficulty: ${meal.difficulty} > ${filters.difficulty}`);
      }
      if (!meal.time_breakdown) {
        issues.push(`${mealType} missing time breakdown`);
        suggestions.push('Add time breakdown format: "X min prep + Y min cook"');
      }
    }
  }
  const timingAccuracy = totalMeals > 0 ? Math.round(timeAccurateCount / totalMeals * 100) : 0;
  const complexityAccuracy = totalMeals > 0 ? Math.round(complexityAccurateCount / totalMeals * 100) : 0;
  return {
    isValid: issues.length === 0,
    accuracy: { timingAccuracy, complexityAccuracy },
    issues,
    suggestions
  };
}
async function addConflictResolutionGuidance(filters) {
  let guidance = ``;
  const allDietaryRestrictions = [];
  if (filters.dietaryRestrictions) {
    allDietaryRestrictions.push(filters.dietaryRestrictions);
  }
  if (filters.familyMembers && filters.familyMembers.length > 0) {
    const familyRestrictions = filters.familyMembers.flatMap((member) => member.preferences).filter(
      (pref) => pref.toLowerCase().includes("vegetarian") || pref.toLowerCase().includes("vegan") || pref.toLowerCase().includes("gluten-free") || pref.toLowerCase().includes("dairy-free") || pref.toLowerCase().includes("halal") || pref.toLowerCase().includes("kosher") || pref.toLowerCase().includes("keto") || pref.toLowerCase().includes("paleo")
    );
    allDietaryRestrictions.push(...familyRestrictions);
  }
  const uniqueRestrictions = [...new Set(allDietaryRestrictions)];
  if (uniqueRestrictions.length === 0 || !filters.culturalBackground || filters.culturalBackground.length === 0) {
    return guidance;
  }
  console.log(`\u{1F50D} Checking for conflicts between cultural background [${filters.culturalBackground.join(", ")}] and dietary restrictions [${uniqueRestrictions.join(", ")}]`);
  const culturalDishes = getCulturalDishExamples(filters.culturalBackground);
  let hasConflicts = false;
  const conflictResolutions = [];
  for (const dish of culturalDishes) {
    if (hasQuickConflict(dish, uniqueRestrictions)) {
      hasConflicts = true;
      try {
        const resolution = await resolveDietaryCulturalConflicts(
          dish,
          uniqueRestrictions,
          filters.culturalBackground
        );
        if (resolution.suggestedAlternatives.length > 0) {
          const bestAlternative = resolution.suggestedAlternatives[0];
          conflictResolutions.push(
            `Instead of "${dish}", suggest "${bestAlternative.dishName}" (${bestAlternative.description})`
          );
        }
      } catch (error) {
        console.error(`Error resolving conflict for ${dish}:`, error);
      }
    }
  }
  if (hasConflicts) {
    guidance += `

\u{1F527} DIETARY-CULTURAL CONFLICT RESOLUTION:`;
    guidance += `
- CRITICAL: Some traditional dishes conflict with dietary restrictions`;
    guidance += `
- Use these culturally authentic alternatives that comply with dietary needs:`;
    for (const resolution of conflictResolutions.slice(0, 5)) {
      guidance += `
  \u2022 ${resolution}`;
    }
    guidance += `
- Maintain cultural authenticity by using traditional cooking methods and spices`;
    guidance += `
- Focus on dishes that naturally align with dietary restrictions rather than heavily modified versions`;
    guidance += `
- When suggesting alternatives, explain the cultural context and preparation method`;
  }
  return guidance;
}
function getCulturalDishExamples(culturalBackground) {
  const culturalDishes = {
    "Chinese": ["beef stir-fry", "pork dumplings", "chicken fried rice", "shrimp lo mein"],
    "Italian": ["chicken parmesan", "beef bolognese", "cheese pizza", "carbonara pasta"],
    "Mexican": ["beef tacos", "chicken quesadilla", "pork carnitas", "cheese enchiladas"],
    "Indian": ["chicken curry", "lamb biryani", "paneer makhani", "beef vindaloo"],
    "Japanese": ["chicken teriyaki", "beef sukiyaki", "pork ramen", "fish tempura"],
    "Thai": ["pad thai with shrimp", "green curry with chicken", "pork larb", "beef massaman"],
    "Korean": ["beef bulgogi", "pork kimchi stew", "chicken bibimbap", "seafood pancake"],
    "Vietnamese": ["beef pho", "pork banh mi", "chicken vermicelli", "fish curry"],
    "Greek": ["lamb gyros", "chicken souvlaki", "feta cheese salad", "beef moussaka"],
    "Lebanese": ["lamb kebab", "chicken shawarma", "hummus with pita", "beef kibbeh"],
    "French": ["coq au vin", "beef bourguignon", "cheese souffle", "duck confit"]
  };
  const examples = [];
  for (const culture of culturalBackground) {
    const dishes = culturalDishes[culture];
    if (dishes) {
      examples.push(...dishes.slice(0, 3));
    }
  }
  return examples;
}
var UNIFIED_GOALS;
var init_intelligentPromptBuilder = __esm({
  "server/intelligentPromptBuilder.ts"() {
    "use strict";
    init_cookingTimeCalculator();
    init_enhancedRecipeGenerationService();
    init_dietaryCulturalConflictResolver();
    UNIFIED_GOALS = [
      {
        value: "Save Money",
        label: "\u{1F4B8} Save Money",
        nutritionFocus: "general_wellness",
        prompts: [
          "Generate a cost-effective meal plan that reduces food expenses through strategic ingredient overlap and simplicity",
          "Use a small set of base ingredients repeatedly across meals to minimize waste and maximize value",
          "Focus on affordable, versatile staples (e.g., beans, rice, eggs, seasonal produce)",
          "Structure the plan for [number] main meals per day, with batch-prep options and clear storage instructions",
          "For each meal, list ingredients, estimated cost, and preparation steps",
          "The plan should be low-waste, scalable, and easy to prepare in advance"
        ],
        filterAdjustments: {
          encourageOverlap: true,
          availableIngredientUsagePercent: 80,
          budgetConstraints: "low",
          varietyPreference: "consistent"
        }
      },
      {
        value: "Eat Healthier",
        label: "\u{1F34E} Eat Healthier",
        nutritionFocus: "general_wellness",
        prompts: [
          "Create a daily meal plan focused on long-term food quality and better daily choices",
          "Each meal should promote nourishment, food diversity, and satiety, using simple and consistent recipes",
          "Include a variety of whole foods: vegetables, fruits, whole grains, lean proteins, and healthy fats",
          "Structure the plan with [number] main meals, with clear portion guidance",
          "For each meal, provide a brief description, ingredients, and preparation steps",
          "The goal is to reinforce healthy eating patterns that gradually reshape meal habits"
        ],
        filterAdjustments: {
          encourageOverlap: false,
          availableIngredientUsagePercent: 50,
          varietyPreference: "high_variety"
        }
      },
      {
        value: "Gain Muscle",
        label: "\u{1F3CB}\uFE0F Build Muscle",
        nutritionFocus: "muscle_gain",
        prompts: [
          "Generate a structured daily meal plan for a user training regularly to build muscle",
          "Meals should emphasize foods naturally rich in protein, complex carbohydrates, and healthy fats to support muscle growth and recovery",
          "Prioritize nutrient-dense, satisfying foods that aid physical repair and consistent energy",
          "Structure the plan with [number] main meals, spaced to fuel workouts and recovery periods",
          "Each meal should include portion sizes, estimated protein content, calorie estimates, and preparation instructions",
          "Include a variety of lean proteins (e.g., chicken, fish, tofu, legumes), whole grains, and colorful vegetables",
          "The plan should promote steady nourishment, muscle repair, and strength gains throughout the day"
        ],
        filterAdjustments: {
          encourageOverlap: true,
          availableIngredientUsagePercent: 60,
          prepTimePreference: "moderate"
        }
      },
      {
        value: "Lose Weight",
        label: "\u2696\uFE0F Lose Weight",
        nutritionFocus: "weight_loss",
        prompts: [
          "Generate a structured daily meal plan for a user aiming to reduce body fat while staying satisfied and energized",
          "Meals should support a lower total calorie intake but maintain high food volume and routine",
          "Use foods that are filling, high in fiber or protein, and take time to eat and digest",
          "Structure the plan to include [number] main meals, spaced evenly throughout the day",
          "Each meal should include portion sizes, calorie estimates, and preparation instructions",
          "Avoid high-calorie, low-volume foods and minimize added sugars and processed fats",
          "The plan should naturally reduce overconsumption through meal timing, food choices, and eating rhythm"
        ],
        filterAdjustments: {
          encourageOverlap: false,
          availableIngredientUsagePercent: 60,
          varietyPreference: "high_variety",
          prepTimePreference: "minimal"
        }
      },
      {
        value: "Family Nutrition",
        label: "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466} Family Nutrition",
        nutritionFocus: "general_wellness",
        prompts: [
          "FAMILY-FRIENDLY: Create meals that appeal to all family members",
          "Include kid-friendly options that are still nutritious",
          "Balance adult nutrition needs with children's preferences",
          "Ensure appropriate portions for different age groups"
        ],
        filterAdjustments: {
          encourageOverlap: true,
          availableIngredientUsagePercent: 65,
          varietyPreference: "moderate"
        }
      },
      {
        value: "Energy & Performance",
        label: "\u26A1 Energy & Performance",
        nutritionFocus: "energy_performance",
        prompts: [
          "Design a meal plan to sustain steady energy and focus for a physically and mentally active user",
          "Emphasize meals with balanced macronutrients and a steady release of energy (complex carbs, lean proteins, healthy fats)",
          "Structure the plan with [number] main meals, timed to align with periods of activity and rest",
          "Avoid foods that cause energy spikes or crashes (e.g., high sugar, refined carbs)",
          "For each meal, provide a description, ingredients, and timing guidance",
          "The plan should support reliable energy, focus, and performance throughout the day"
        ],
        filterAdjustments: {
          availableIngredientUsagePercent: 60,
          prepTimePreference: "enjoys_cooking"
        }
      },
      {
        value: "Digestive Health",
        label: "\u{1F966} Digestive Health",
        nutritionFocus: "digestive_health",
        prompts: [
          "Create a meal plan that promotes digestive comfort, ease, and regularity",
          "Meals should be light, soft, and simple, using easily digestible ingredients and gentle cooking methods",
          "Include fiber-rich foods and fermented items",
          "Structure the plan with [number] main meals, spaced for natural digestive pacing",
          "For each meal, provide a description, ingredients, and preparation steps",
          "The goal is to reduce digestive strain and support regular, comfortable digestion"
        ],
        filterAdjustments: {
          availableIngredientUsagePercent: 60,
          varietyPreference: "moderate"
        }
      }
    ];
  }
});

// server/mealPlanEnhancer.ts
var mealPlanEnhancer_exports = {};
__export(mealPlanEnhancer_exports, {
  analyzeMealPlanNamingQuality: () => analyzeMealPlanNamingQuality,
  enhanceMealName: () => enhanceMealName,
  enhanceMealPlanNames: () => enhanceMealPlanNames,
  suggestFamiliarDishesForCuisine: () => suggestFamiliarDishesForCuisine
});
async function enhanceMealPlanNames(mealPlan, culturalBackground, targetCuisineDistribution) {
  if (!mealPlan?.meal_plan) {
    return {
      enhancedMealPlan: mealPlan,
      enhancementStats: {
        totalMeals: 0,
        enhancedMeals: 0,
        familiarNameChanges: 0,
        cuisineCorrections: 0,
        averageConfidence: 0
      },
      enhancementLog: ["No meal plan structure found"]
    };
  }
  const enhancedMealPlan = JSON.parse(JSON.stringify(mealPlan));
  const enhancementLog = [];
  let totalMeals = 0;
  let enhancedMeals = 0;
  let familiarNameChanges = 0;
  let cuisineCorrections = 0;
  let totalConfidence = 0;
  for (const dayKey in enhancedMealPlan.meal_plan) {
    const day = enhancedMealPlan.meal_plan[dayKey];
    for (const mealType in day) {
      const meal = day[mealType];
      totalMeals++;
      if (meal.title) {
        try {
          const expectedCuisine = determineExpectedCuisine(
            mealType,
            dayKey,
            culturalBackground,
            targetCuisineDistribution
          );
          const mapping = mapToFamiliarDishName(
            meal.title,
            expectedCuisine,
            meal.ingredients
          );
          totalConfidence += mapping.confidence;
          if (mapping.confidence > 0.6 && mapping.familiarName !== meal.title) {
            const oldTitle = meal.title;
            meal.title = mapping.familiarName;
            meal.cuisine_type = mapping.cuisine;
            familiarNameChanges++;
            enhancedMeals++;
            enhancementLog.push(
              `${dayKey}_${mealType}: "${oldTitle}" \u2192 "${mapping.familiarName}" (${mapping.cuisine}, confidence: ${mapping.confidence.toFixed(2)})`
            );
          }
          if (expectedCuisine && mapping.cuisine !== expectedCuisine) {
            const validation = validateDishCuisineMatch(meal.title, expectedCuisine);
            if (!validation.isMatch && validation.suggestedCorrection) {
              meal.title = validation.suggestedCorrection;
              meal.cuisine_type = expectedCuisine;
              cuisineCorrections++;
              enhancementLog.push(
                `${dayKey}_${mealType}: Cuisine correction to ${expectedCuisine} \u2192 "${validation.suggestedCorrection}"`
              );
            }
          }
          meal.name_enhancement = {
            original_title: meal.title === mapping.familiarName ? void 0 : meal.title,
            mapping_confidence: mapping.confidence,
            detected_cuisine: mapping.cuisine,
            enhanced: mapping.confidence > 0.6
          };
        } catch (error) {
          enhancementLog.push(`${dayKey}_${mealType}: Enhancement error - ${error.message}`);
        }
      }
    }
  }
  const averageConfidence = totalMeals > 0 ? totalConfidence / totalMeals : 0;
  enhancedMealPlan.enhancement_summary = {
    total_meals: totalMeals,
    enhanced_meals: enhancedMeals,
    familiar_name_changes: familiarNameChanges,
    cuisine_corrections: cuisineCorrections,
    average_confidence: Math.round(averageConfidence * 100) / 100,
    enhancement_timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  return {
    enhancedMealPlan,
    enhancementStats: {
      totalMeals,
      enhancedMeals,
      familiarNameChanges,
      cuisineCorrections,
      averageConfidence
    },
    enhancementLog
  };
}
function enhanceMealName(meal, expectedCuisine, mealType) {
  if (!meal?.title) {
    return {
      enhancedMeal: meal,
      wasEnhanced: false,
      enhancement: { error: "No meal title provided" }
    };
  }
  const mapping = mapToFamiliarDishName(
    meal.title,
    expectedCuisine,
    meal.ingredients
  );
  const wasEnhanced = mapping.confidence > 0.6 && mapping.familiarName !== meal.title;
  const enhancedMeal = {
    ...meal,
    title: wasEnhanced ? mapping.familiarName : meal.title,
    cuisine_type: mapping.cuisine,
    name_enhancement: {
      original_title: wasEnhanced ? meal.title : void 0,
      mapping_confidence: mapping.confidence,
      detected_cuisine: mapping.cuisine,
      enhanced: wasEnhanced,
      meal_type: mealType
    }
  };
  return {
    enhancedMeal,
    wasEnhanced,
    enhancement: {
      original: meal.title,
      familiar: mapping.familiarName,
      cuisine: mapping.cuisine,
      confidence: mapping.confidence
    }
  };
}
function determineExpectedCuisine(mealType, dayKey, culturalBackground, targetDistribution) {
  if (!culturalBackground || culturalBackground.length === 0) {
    return void 0;
  }
  if (targetDistribution) {
    const totalMeals = Object.values(targetDistribution).reduce((sum, count) => sum + count, 0);
    if (totalMeals > 0) {
      const maxCuisine = Object.entries(targetDistribution).reduce(
        (max, [cuisine, count]) => count > max.count ? { cuisine, count } : max,
        { cuisine: "", count: 0 }
      );
      return maxCuisine.cuisine;
    }
  }
  const dayNumber = parseInt(dayKey.replace("day_", "")) || 1;
  const cuisineIndex = (dayNumber - 1) % culturalBackground.length;
  return culturalBackground[cuisineIndex];
}
function analyzeMealPlanNamingQuality(mealPlan) {
  if (!mealPlan?.meal_plan) {
    return {
      totalMeals: 0,
      recognizableMeals: 0,
      cuisineDistribution: {},
      qualityScore: 0,
      recommendations: ["No meal plan structure found"]
    };
  }
  let totalMeals = 0;
  let recognizableMeals = 0;
  const cuisineDistribution = {};
  const recommendations = [];
  let totalConfidence = 0;
  for (const dayKey in mealPlan.meal_plan) {
    const day = mealPlan.meal_plan[dayKey];
    for (const mealType in day) {
      const meal = day[mealType];
      totalMeals++;
      if (meal.title) {
        const mapping = mapToFamiliarDishName(meal.title);
        totalConfidence += mapping.confidence;
        if (mapping.confidence > 0.6) {
          recognizableMeals++;
        }
        const cuisine = meal.cuisine_type || mapping.cuisine || "Unknown";
        cuisineDistribution[cuisine] = (cuisineDistribution[cuisine] || 0) + 1;
      }
    }
  }
  const qualityScore = totalMeals > 0 ? totalConfidence / totalMeals * 100 : 0;
  const recognitionRate = totalMeals > 0 ? recognizableMeals / totalMeals * 100 : 0;
  if (recognitionRate < 70) {
    recommendations.push("Consider using more familiar dish names for better user recognition");
  }
  if (Object.keys(cuisineDistribution).length > 5) {
    recommendations.push("Meal plan has high cuisine variety - consider focusing on fewer cuisines for better consistency");
  }
  if (qualityScore < 60) {
    recommendations.push("Dish names could be more recognizable - focus on well-known dishes");
  }
  return {
    totalMeals,
    recognizableMeals,
    cuisineDistribution,
    qualityScore: Math.round(qualityScore),
    recommendations
  };
}
function suggestFamiliarDishesForCuisine(cuisine, mealType, dietaryRestrictions) {
  const { getFamiliarDishesByCuisine: getFamiliarDishesByCuisine2 } = (init_familiarDishNameMapper(), __toCommonJS(familiarDishNameMapper_exports));
  const dishes = getFamiliarDishesByCuisine2(cuisine);
  let filteredDishes = dishes.filter((dish) => {
    if (mealType === "breakfast" && !isBreakfastDish(dish.familiarName)) {
      return false;
    }
    if (dietaryRestrictions) {
    }
    return true;
  });
  return filteredDishes.slice(0, 5).map((dish) => dish.familiarName);
}
function isBreakfastDish(dishName) {
  const breakfastKeywords = [
    "pancake",
    "waffle",
    "omelette",
    "egg",
    "toast",
    "cereal",
    "porridge",
    "oatmeal",
    "smoothie",
    "yogurt",
    "muffin"
  ];
  return breakfastKeywords.some(
    (keyword) => dishName.toLowerCase().includes(keyword)
  );
}
var init_mealPlanEnhancer = __esm({
  "server/mealPlanEnhancer.ts"() {
    "use strict";
    init_familiarDishNameMapper();
  }
});

// server/SmartCulturalSelector.ts
var SmartCulturalSelector_exports = {};
__export(SmartCulturalSelector_exports, {
  SmartCulturalSelector: () => SmartCulturalSelector
});
var SmartCulturalSelector;
var init_SmartCulturalSelector = __esm({
  "server/SmartCulturalSelector.ts"() {
    "use strict";
    SmartCulturalSelector = class {
      /**
       * Determine if a cultural meal should be used for this slot
       */
      shouldUseCulturalMeal(context, mealSlotContext, weights) {
        if (!context.availableCulturalMeals || context.availableCulturalMeals.length === 0) {
          return false;
        }
        const culturalMealsUsed = context.culturalMealsUsed || 0;
        const optimalCount = context.optimalCulturalMealCount || 0;
        if (culturalMealsUsed >= optimalCount) {
          return weights.cultural > 0.8;
        }
        let probability = weights.cultural;
        const progress = mealSlotContext.slotIndex / context.totalMeals;
        const culturalProgress = culturalMealsUsed / optimalCount;
        if (culturalProgress < progress) {
          probability += 0.2;
        }
        if (mealSlotContext.mealType === "dinner") {
          probability += 0.1;
        } else if (mealSlotContext.mealType === "breakfast") {
          probability -= 0.1;
        }
        const recentMeals = mealSlotContext.previousMeals.slice(-3);
        const recentCulturalCount = recentMeals.filter((m) => m.culturalSource).length;
        if (recentCulturalCount >= 2) {
          probability -= 0.3;
        }
        probability = Math.max(0, Math.min(1, probability));
        return Math.random() < probability;
      }
      /**
       * Select the best cultural meal for this slot
       */
      selectBestCulturalMeal(availableMeals, weights, mealSlotContext) {
        if (availableMeals.length === 0) {
          throw new Error("No cultural meals available to select from");
        }
        const scoredMeals = availableMeals.map((meal) => {
          let score = 0;
          if (weights.time > 0.5) {
            const timeScore = meal.cookTime <= 30 ? 1 : meal.cookTime <= 45 ? 0.7 : 0.4;
            score += timeScore * weights.time;
          }
          if (weights.cost > 0.5) {
            const commonIngredients = ["rice", "beans", "chicken", "eggs", "pasta", "potatoes"];
            const costScore = meal.ingredients.filter(
              (ing) => commonIngredients.some((common) => ing.toLowerCase().includes(common))
            ).length / meal.ingredients.length;
            score += costScore * weights.cost;
          }
          if (weights.health > 0.5 && meal.nutrition) {
            const healthScore = this.calculateHealthScore(meal.nutrition);
            score += healthScore * weights.health;
          }
          if (weights.variety > 0.5) {
            const recentCultures = mealSlotContext.previousMeals.filter((m) => m.culturalSource).map((m) => m.culturalSource).slice(-5);
            const varietyScore = recentCultures.includes(meal.culture) ? 0.3 : 1;
            score += varietyScore * weights.variety;
          }
          const appropriatenessScore = this.getMealTypeScore(meal, mealSlotContext.mealType);
          score += appropriatenessScore * 0.2;
          return { meal, score };
        });
        scoredMeals.sort((a, b) => b.score - a.score);
        const topCandidates = scoredMeals.slice(0, Math.min(3, scoredMeals.length));
        const selectedIndex = Math.floor(Math.random() * topCandidates.length);
        return topCandidates[selectedIndex].meal;
      }
      /**
       * Calculate health score based on nutrition
       */
      calculateHealthScore(nutrition) {
        if (!nutrition) return 0.5;
        let score = 0;
        const totalMacros = (nutrition.protein_g || 0) + (nutrition.carbs_g || 0) + (nutrition.fat_g || 0);
        if (totalMacros > 0) {
          const proteinRatio = (nutrition.protein_g || 0) / totalMacros;
          const carbRatio = (nutrition.carbs_g || 0) / totalMacros;
          const fatRatio = (nutrition.fat_g || 0) / totalMacros;
          score += 1 - Math.abs(proteinRatio - 0.3) * 2;
          score += 1 - Math.abs(carbRatio - 0.4) * 2;
          score += 1 - Math.abs(fatRatio - 0.3) * 2;
          score /= 3;
        }
        const calories = nutrition.calories || 0;
        if (calories >= 300 && calories <= 800) {
          score = (score + 1) / 2;
        } else {
          score = (score + 0.5) / 2;
        }
        return Math.max(0, Math.min(1, score));
      }
      /**
       * Score meal appropriateness for meal type
       */
      getMealTypeScore(meal, mealType) {
        const title = meal.title.toLowerCase();
        switch (mealType) {
          case "breakfast":
            if (title.includes("breakfast") || title.includes("morning") || title.includes("pancake") || title.includes("egg") || title.includes("oatmeal") || title.includes("cereal")) {
              return 1;
            }
            return 0.3;
          case "lunch":
            if (title.includes("sandwich") || title.includes("salad") || title.includes("soup") || title.includes("wrap")) {
              return 1;
            }
            return 0.7;
          case "dinner":
            if (title.includes("dinner") || title.includes("roast") || title.includes("steak") || title.includes("curry")) {
              return 1;
            }
            return 0.8;
          case "snack":
            if (title.includes("snack") || title.includes("bite") || title.includes("bar") || title.includes("smoothie")) {
              return 1;
            }
            return 0.2;
          default:
            return 0.5;
        }
      }
    };
  }
});

// server/MealAdaptationEngine.ts
var MealAdaptationEngine_exports = {};
__export(MealAdaptationEngine_exports, {
  MealAdaptationEngine: () => MealAdaptationEngine
});
var MealAdaptationEngine;
var init_MealAdaptationEngine = __esm({
  "server/MealAdaptationEngine.ts"() {
    "use strict";
    MealAdaptationEngine = class {
      // Common ingredient substitutions for dietary restrictions
      substitutions = {
        "vegetarian": {
          "chicken": ["tofu", "tempeh", "chickpeas", "mushrooms"],
          "beef": ["black beans", "lentils", "plant-based ground", "mushrooms"],
          "pork": ["jackfruit", "tempeh", "mushrooms"],
          "fish": ["tofu", "hearts of palm", "banana blossom"],
          "seafood": ["king oyster mushrooms", "hearts of palm"],
          "bacon": ["tempeh bacon", "mushroom bacon", "coconut bacon"],
          "meat": ["plant protein", "beans", "lentils", "tofu"]
        },
        "vegan": {
          "chicken": ["tofu", "tempeh", "chickpeas", "seitan"],
          "beef": ["black beans", "lentils", "plant-based ground", "mushrooms"],
          "pork": ["jackfruit", "tempeh", "mushrooms"],
          "fish": ["tofu", "hearts of palm", "banana blossom"],
          "seafood": ["king oyster mushrooms", "hearts of palm"],
          "milk": ["almond milk", "oat milk", "soy milk", "coconut milk"],
          "cheese": ["nutritional yeast", "cashew cheese", "vegan cheese"],
          "butter": ["vegan butter", "coconut oil", "olive oil"],
          "eggs": ["flax eggs", "chia eggs", "tofu scramble", "chickpea flour"],
          "cream": ["coconut cream", "cashew cream", "oat cream"],
          "yogurt": ["coconut yogurt", "almond yogurt", "soy yogurt"],
          "honey": ["maple syrup", "agave nectar", "date syrup"]
        },
        "gluten-free": {
          "wheat flour": ["rice flour", "almond flour", "coconut flour", "gluten-free flour blend"],
          "pasta": ["rice pasta", "corn pasta", "zucchini noodles", "gluten-free pasta"],
          "bread": ["gluten-free bread", "rice cakes", "corn tortillas"],
          "soy sauce": ["tamari", "coconut aminos"],
          "flour": ["gluten-free flour", "almond flour", "rice flour"],
          "breadcrumbs": ["gluten-free breadcrumbs", "crushed rice crackers", "almond meal"]
        },
        "dairy-free": {
          "milk": ["almond milk", "oat milk", "soy milk", "coconut milk"],
          "cheese": ["nutritional yeast", "cashew cheese", "dairy-free cheese"],
          "butter": ["olive oil", "coconut oil", "dairy-free butter"],
          "cream": ["coconut cream", "cashew cream", "oat cream"],
          "yogurt": ["coconut yogurt", "almond yogurt", "soy yogurt"],
          "ice cream": ["coconut ice cream", "banana ice cream", "dairy-free ice cream"]
        },
        "nut-free": {
          "almonds": ["sunflower seeds", "pumpkin seeds"],
          "almond milk": ["oat milk", "soy milk", "rice milk"],
          "peanut butter": ["sunflower seed butter", "tahini", "soy butter"],
          "cashews": ["sunflower seeds", "hemp seeds"],
          "walnuts": ["pumpkin seeds", "sunflower seeds"],
          "pecans": ["pepitas", "sunflower seeds"],
          "nut": ["seed", "coconut"]
        },
        "keto": {
          "rice": ["cauliflower rice", "shirataki rice"],
          "pasta": ["zucchini noodles", "shirataki noodles", "spaghetti squash"],
          "potatoes": ["cauliflower", "turnips", "radishes"],
          "bread": ["cloud bread", "almond flour bread", "coconut flour bread"],
          "sugar": ["stevia", "erythritol", "monk fruit sweetener"],
          "flour": ["almond flour", "coconut flour"]
        }
      };
      /**
       * Check if meal needs adaptation and adapt if necessary
       */
      async adaptMealIfNeeded(meal, dietaryRestrictions, weights) {
        if (!dietaryRestrictions || dietaryRestrictions.length === 0) {
          return { meal, adaptations: [], isAdapted: false };
        }
        const adaptations = [];
        let adaptedMeal = { ...meal };
        let needsAdaptation = false;
        for (const restriction of dietaryRestrictions) {
          const normalizedRestriction = restriction.toLowerCase().trim();
          const substitutionMap = this.substitutions[normalizedRestriction];
          if (substitutionMap) {
            adaptedMeal.ingredients = adaptedMeal.ingredients.map((ingredient) => {
              const lowerIngredient = ingredient.toLowerCase();
              for (const [original, substitutes] of Object.entries(substitutionMap)) {
                if (lowerIngredient.includes(original)) {
                  needsAdaptation = true;
                  const substitute = this.selectBestSubstitute(substitutes, weights);
                  const adaptedIngredient = ingredient.replace(
                    new RegExp(original, "gi"),
                    substitute
                  );
                  adaptations.push(`Replaced ${original} with ${substitute} for ${restriction}`);
                  return adaptedIngredient;
                }
              }
              return ingredient;
            });
            if (needsAdaptation) {
              adaptedMeal.instructions = adaptedMeal.instructions.map((instruction) => {
                let adaptedInstruction = instruction;
                for (const [original, substitutes] of Object.entries(substitutionMap)) {
                  if (adaptedInstruction.toLowerCase().includes(original)) {
                    const substitute = substitutes[0];
                    adaptedInstruction = adaptedInstruction.replace(
                      new RegExp(original, "gi"),
                      substitute
                    );
                  }
                }
                return adaptedInstruction;
              });
            }
          }
          if (normalizedRestriction.includes("allerg")) {
            const allergen = this.extractAllergen(normalizedRestriction);
            if (allergen) {
              adaptedMeal = this.removeAllergen(adaptedMeal, allergen, adaptations);
              needsAdaptation = true;
            }
          }
        }
        if (needsAdaptation && adaptations.length > 2) {
          const mainRestriction = dietaryRestrictions[0];
          adaptedMeal.title = `${mainRestriction}-Friendly ${adaptedMeal.title}`;
        }
        return {
          meal: adaptedMeal,
          adaptations,
          isAdapted: needsAdaptation
        };
      }
      /**
       * Select the best substitute based on goal weights
       */
      selectBestSubstitute(substitutes, weights) {
        if (substitutes.length === 1) return substitutes[0];
        if (weights.cost > 0.7) {
          const economical = ["beans", "lentils", "tofu", "oat milk", "rice flour"];
          const costEffective = substitutes.find(
            (sub) => economical.some((econ) => sub.includes(econ))
          );
          if (costEffective) return costEffective;
        }
        if (weights.health > 0.7) {
          const healthy = ["tempeh", "chickpeas", "almond", "cashew", "quinoa"];
          const nutritious = substitutes.find(
            (sub) => healthy.some((h) => sub.includes(h))
          );
          if (nutritious) return nutritious;
        }
        return substitutes[0];
      }
      /**
       * Extract allergen from allergy string
       */
      extractAllergen(allergyString) {
        const commonAllergens = ["peanut", "tree nut", "milk", "egg", "soy", "wheat", "fish", "shellfish"];
        const lower = allergyString.toLowerCase();
        for (const allergen of commonAllergens) {
          if (lower.includes(allergen)) {
            return allergen;
          }
        }
        const match = lower.match(/allergic to (\w+)/);
        return match ? match[1] : null;
      }
      /**
       * Remove allergen from meal
       */
      removeAllergen(meal, allergen, adaptations) {
        const adaptedMeal = { ...meal };
        const originalCount = adaptedMeal.ingredients.length;
        adaptedMeal.ingredients = adaptedMeal.ingredients.filter((ingredient) => {
          const contains = ingredient.toLowerCase().includes(allergen.toLowerCase());
          if (contains) {
            adaptations.push(`Removed ${ingredient} due to ${allergen} allergy`);
          }
          return !contains;
        });
        if (adaptedMeal.ingredients.length < originalCount * 0.7) {
          adaptations.push(`Warning: Significant ingredients removed due to ${allergen} allergy`);
        }
        return adaptedMeal;
      }
      /**
       * Validate that a meal complies with all dietary restrictions
       */
      validateCompliance(meal, dietaryRestrictions) {
        const violations = [];
        for (const restriction of dietaryRestrictions) {
          const normalizedRestriction = restriction.toLowerCase().trim();
          const restrictionChecks = {
            "vegetarian": ["meat", "chicken", "beef", "pork", "fish", "seafood"],
            "vegan": ["meat", "chicken", "beef", "pork", "fish", "seafood", "dairy", "milk", "cheese", "eggs", "honey"],
            "gluten-free": ["wheat", "flour", "bread", "pasta", "gluten"],
            "dairy-free": ["milk", "cheese", "butter", "cream", "yogurt", "dairy"],
            "nut-free": ["nut", "almond", "cashew", "peanut", "walnut", "pecan"]
          };
          const forbiddenItems = restrictionChecks[normalizedRestriction] || [];
          const ingredientText = meal.ingredients.join(" ").toLowerCase();
          for (const forbidden of forbiddenItems) {
            if (ingredientText.includes(forbidden)) {
              if (forbidden === "nut" && ingredientText.includes("coconut")) {
                continue;
              }
              violations.push(`Contains ${forbidden} (violates ${restriction})`);
            }
          }
        }
        return {
          isCompliant: violations.length === 0,
          violations
        };
      }
    };
  }
});

// server/WeightBasedMealPlanner.ts
var WeightBasedMealPlanner_exports = {};
__export(WeightBasedMealPlanner_exports, {
  WeightBasedMealPlanner: () => WeightBasedMealPlanner
});
var WeightBasedMealPlanner, MockCulturalSelector, MockMealLibrary, MockAdaptationEngine, MockHeroIngredientManager;
var init_WeightBasedMealPlanner = __esm({
  "server/WeightBasedMealPlanner.ts"() {
    "use strict";
    WeightBasedMealPlanner = class {
      smartCulturalSelector;
      // Will be injected
      predeterminedMealLibrary;
      // Will be injected
      mealAdaptationEngine;
      // Will be injected
      heroIngredientManager;
      // Will be injected
      constructor(dependencies) {
        this.smartCulturalSelector = dependencies?.smartCulturalSelector;
        this.predeterminedMealLibrary = dependencies?.predeterminedMealLibrary;
        this.mealAdaptationEngine = dependencies?.mealAdaptationEngine;
        this.heroIngredientManager = dependencies?.heroIngredientManager;
        if (!this.smartCulturalSelector) {
          Promise.resolve().then(() => (init_SmartCulturalSelector(), SmartCulturalSelector_exports)).then((module) => {
            this.smartCulturalSelector = new module.SmartCulturalSelector();
          }).catch(() => {
            this.smartCulturalSelector = new MockCulturalSelector();
          });
        }
        if (!this.mealAdaptationEngine) {
          Promise.resolve().then(() => (init_MealAdaptationEngine(), MealAdaptationEngine_exports)).then((module) => {
            this.mealAdaptationEngine = new module.MealAdaptationEngine();
          }).catch(() => {
            this.mealAdaptationEngine = new MockAdaptationEngine();
          });
        }
        if (!this.predeterminedMealLibrary) {
          this.predeterminedMealLibrary = new MockMealLibrary();
        }
        if (!this.heroIngredientManager) {
          this.heroIngredientManager = new MockHeroIngredientManager();
        }
      }
      /**
       * Generate complete meal plan using weight-based decision system
       */
      async generateMealPlan(request) {
        const startTime = Date.now();
        console.log("\u{1F680} Starting weight-based meal plan generation");
        console.log("Profile weights:", request.profile.goalWeights);
        try {
          const planningContext = await this.initializePlanningContext(request);
          const mealPlan = await this.generateMealSlots(request, planningContext);
          const optimizedPlan = await this.validateAndOptimizePlan(mealPlan, request);
          const finalPlan = await this.finalizeMealPlan(optimizedPlan, planningContext);
          const metadata = {
            culturalMealsUsed: planningContext.culturalMealsUsed,
            heroIngredientsSelected: planningContext.heroIngredients,
            averageObjectiveOverlap: this.calculateAverageObjectiveOverlap(finalPlan),
            weightSatisfactionScores: this.calculateWeightSatisfaction(finalPlan, request.profile.goalWeights),
            generationStrategy: "weight-based-with-cultural-integration",
            processingTimeMs: Date.now() - startTime
          };
          console.log("\u2705 Weight-based meal plan generated successfully");
          console.log(`Cultural meals used: ${metadata.culturalMealsUsed}/${this.calculateOptimalCulturalMealCount(request)}`);
          console.log(`Hero ingredients: ${metadata.heroIngredientsSelected.join(", ")}`);
          return {
            success: true,
            mealPlan: finalPlan,
            metadata
          };
        } catch (error) {
          console.error("\u274C Weight-based meal plan generation failed:", error);
          return {
            success: false,
            mealPlan: null,
            metadata: {
              culturalMealsUsed: 0,
              heroIngredientsSelected: [],
              averageObjectiveOverlap: 0,
              weightSatisfactionScores: { cost: 0, health: 0, cultural: 0, variety: 0, time: 0 },
              generationStrategy: "failed",
              error: error.message
            }
          };
        }
      }
      /**
       * Initialize planning context with hero ingredients and cultural meal analysis
       */
      async initializePlanningContext(request) {
        const totalMeals = request.numDays * request.mealsPerDay;
        const heroIngredients = await this.heroIngredientManager.selectHeroIngredients(
          request.profile.culturalBackground,
          request.profile.availableIngredients,
          request.profile.goalWeights.cost
        );
        const optimalCulturalMealCount = this.calculateOptimalCulturalMealCount(request);
        const availableCulturalMeals = await this.predeterminedMealLibrary.getCompatibleMeals(
          request.profile.culturalBackground,
          request.profile.dietaryRestrictions
        );
        return {
          totalMeals,
          heroIngredients,
          optimalCulturalMealCount,
          availableCulturalMeals,
          culturalMealsUsed: 0,
          mealsGenerated: []
        };
      }
      /**
       * Generate each meal slot using weight-based decision logic
       */
      async generateMealSlots(request, context) {
        const meals = [];
        const totalMeals = request.numDays * request.mealsPerDay;
        for (let mealIndex = 0; mealIndex < totalMeals; mealIndex++) {
          const mealSlotContext = {
            day: Math.floor(mealIndex / request.mealsPerDay) + 1,
            mealType: this.getMealType(mealIndex % request.mealsPerDay),
            slotIndex: mealIndex,
            previousMeals: meals
          };
          console.log(`Generating meal ${mealIndex + 1}/${totalMeals}: ${mealSlotContext.mealType} for day ${mealSlotContext.day}`);
          const shouldUseCulturalMeal = this.smartCulturalSelector.shouldUseCulturalMeal(
            context,
            mealSlotContext,
            request.profile.goalWeights
          );
          let meal;
          if (shouldUseCulturalMeal && context.availableCulturalMeals.length > 0) {
            meal = await this.generateCulturalMeal(context, mealSlotContext, request);
            context.culturalMealsUsed++;
          } else {
            meal = await this.generateNewMeal(context, mealSlotContext, request);
          }
          meals.push(meal);
        }
        return meals;
      }
      /**
       * Use predetermined cultural meal with potential adaptation
       */
      async generateCulturalMeal(context, mealSlotContext, request) {
        const selectedCulturalMeal = this.smartCulturalSelector.selectBestCulturalMeal(
          context.availableCulturalMeals,
          request.profile.goalWeights,
          mealSlotContext
        );
        const adaptedMeal = await this.mealAdaptationEngine.adaptMealIfNeeded(
          selectedCulturalMeal,
          request.profile.dietaryRestrictions,
          request.profile.goalWeights
        );
        const enhancedMeal = await this.heroIngredientManager.enhanceWithHeroIngredients(
          adaptedMeal,
          context.heroIngredients,
          request.profile.goalWeights.cost
        );
        return {
          ...enhancedMeal,
          id: `cultural_${mealSlotContext.slotIndex}`,
          culturalSource: selectedCulturalMeal.culture,
          objectiveOverlap: this.calculateObjectiveOverlap(enhancedMeal, request.profile.goalWeights),
          weightSatisfaction: this.calculateMealWeightSatisfaction(enhancedMeal, request.profile.goalWeights)
        };
      }
      /**
       * Generate new meal using weight-based prompt system
       */
      async generateNewMeal(context, mealSlotContext, request) {
        const prompt = this.buildWeightBasedPrompt(
          request.profile.goalWeights,
          context.heroIngredients,
          mealSlotContext,
          request.profile.dietaryRestrictions,
          request.profile.familySize
        );
        console.log("Generated prompt for new meal:", prompt.substring(0, 200) + "...");
        const generatedMeal = await this.callAIMealGeneration(prompt, request);
        const validatedMeal = await this.validateGeneratedMeal(generatedMeal, request, context);
        return {
          ...validatedMeal,
          id: `generated_${mealSlotContext.slotIndex}`,
          objectiveOverlap: this.calculateObjectiveOverlap(validatedMeal, request.profile.goalWeights),
          weightSatisfaction: this.calculateMealWeightSatisfaction(validatedMeal, request.profile.goalWeights)
        };
      }
      /**
       * Build weight-based prompt using the generalized system
       */
      buildWeightBasedPrompt(weights, heroIngredients, mealContext, dietaryRestrictions, familySize) {
        let prompt = `\u{1F3C6} Generate a meal using weight-based decision priorities. You are an expert meal planner creating a ${mealContext.mealType} for ${familySize} people.

`;
        prompt += `\u{1F3AF} CORE CONCEPT:
`;
        prompt += `Weights are decision priorities for resolving conflicts, not meal quotas.
`;
        prompt += `Most meals should satisfy multiple objectives simultaneously.
`;
        prompt += `Dietary restrictions are NON-NEGOTIABLE and apply to 100% of the meal.

`;
        if (dietaryRestrictions.length > 0) {
          prompt += `\u{1F6AB} MANDATORY DIETARY RESTRICTIONS (100% compliance required):
`;
          dietaryRestrictions.forEach((restriction) => {
            prompt += `- ${restriction}
`;
          });
          prompt += `ALL ingredients and preparations must be safe for these restrictions.

`;
        }
        prompt += `\u2696\uFE0F WEIGHT-BASED PRIORITIES (use to resolve conflicts):
`;
        if (weights.cost >= 0.7) {
          prompt += `- VERY HIGH PRIORITY (${(weights.cost * 100).toFixed(0)}%): Cost savings through smart ingredient choices
`;
        } else if (weights.cost >= 0.5) {
          prompt += `- HIGH PRIORITY (${(weights.cost * 100).toFixed(0)}%): Balance cost and quality
`;
        }
        if (weights.health >= 0.7) {
          prompt += `- VERY HIGH PRIORITY (${(weights.health * 100).toFixed(0)}%): Nutritional density and balanced macros
`;
        } else if (weights.health >= 0.5) {
          prompt += `- HIGH PRIORITY (${(weights.health * 100).toFixed(0)}%): Healthy ingredients and preparation
`;
        }
        if (weights.cultural >= 0.5) {
          prompt += `- CULTURAL PRIORITY (${(weights.cultural * 100).toFixed(0)}%): Incorporate cultural flavors and techniques
`;
        }
        if (weights.time >= 0.7) {
          prompt += `- VERY HIGH PRIORITY (${(weights.time * 100).toFixed(0)}%): Minimize prep and cooking time
`;
        } else if (weights.time >= 0.5) {
          prompt += `- HIGH PRIORITY (${(weights.time * 100).toFixed(0)}%): Keep preparation practical
`;
        }
        if (weights.variety >= 0.5) {
          prompt += `- VARIETY PRIORITY (${(weights.variety * 100).toFixed(0)}%): Use diverse ingredients and techniques
`;
        }
        if (heroIngredients.length > 0) {
          prompt += `
\u{1F3AF} HERO INGREDIENT STRATEGY:
`;
          prompt += `Incorporate 2-3 of these versatile ingredients: ${heroIngredients.join(", ")}
`;
          prompt += `These ingredients work across cuisines and maximize cost savings.
`;
        }
        prompt += `
\u{1F3AF} OBJECTIVE OVERLAP (CRITICAL):
`;
        prompt += `This meal should demonstrate meaningful overlap of objectives:
`;
        prompt += `- Meets dietary restrictions (mandatory)
`;
        prompt += `- Satisfies at least 2-3 high-priority weight goals
`;
        prompt += `- Uses practical cooking methods for the time priority
`;
        prompt += `- Balances cost with nutritional value

`;
        prompt += `\u{1F4CB} IMPLEMENTATION:
`;
        prompt += `1. Start with a base recipe that naturally satisfies multiple objectives
`;
        prompt += `2. Modify ingredients/techniques based on weight priorities
`;
        prompt += `3. When objectives conflict, use weights to guide decisions
`;
        prompt += `4. Ensure the final meal is practical and appealing

`;
        prompt += `RETURN FORMAT: Valid JSON with this structure:
`;
        prompt += `{
`;
        prompt += `  "title": "Meal Name",
`;
        prompt += `  "description": "Brief description",
`;
        prompt += `  "ingredients": ["ingredient1", "ingredient2"],
`;
        prompt += `  "instructions": ["step1", "step2"],
`;
        prompt += `  "nutrition": {"calories": 450, "protein_g": 25, "carbs_g": 35, "fat_g": 18},
`;
        prompt += `  "cook_time_minutes": 25,
`;
        prompt += `  "difficulty": 2.5,
`;
        prompt += `  "objective_satisfaction": ["cost_effective", "healthy", "quick"],
`;
        prompt += `  "weight_rationale": "Brief explanation of how weights guided decisions"
`;
        prompt += `}`;
        return prompt;
      }
      // Helper methods
      calculateOptimalCulturalMealCount(request) {
        const totalMeals = request.numDays * request.mealsPerDay;
        const culturalWeight = request.profile.goalWeights.cultural;
        const basePortion = totalMeals * 0.25;
        const weightAdjustment = culturalWeight * 0.15;
        const optimalCount = Math.ceil(basePortion + basePortion * weightAdjustment);
        if (totalMeals <= 7) return Math.min(Math.max(optimalCount, 1), 3);
        if (totalMeals <= 14) return Math.min(Math.max(optimalCount, 2), 4);
        return Math.min(Math.max(optimalCount, 3), 6);
      }
      getMealType(mealIndex) {
        const mealTypes = ["breakfast", "lunch", "dinner", "snack"];
        return mealTypes[mealIndex] || "meal";
      }
      calculateObjectiveOverlap(meal, weights) {
        const satisfied = [];
        return satisfied;
      }
      calculateMealWeightSatisfaction(meal, weights) {
        return {
          cost: 0.8,
          // Placeholder - would analyze actual meal properties
          health: 0.7,
          cultural: 0.6,
          variety: 0.9,
          time: 0.8
        };
      }
      calculateAverageObjectiveOverlap(mealPlan) {
        const totalOverlaps = mealPlan.reduce((sum, meal) => sum + meal.objectiveOverlap.length, 0);
        return totalOverlaps / mealPlan.length;
      }
      calculateWeightSatisfaction(mealPlan, weights) {
        return {
          cost: 0.8,
          // Placeholder - would calculate from actual meal data
          health: 0.7,
          cultural: 0.6,
          variety: 0.9,
          time: 0.8
        };
      }
      // Placeholder methods for integration points
      async validateAndOptimizePlan(mealPlan, request) {
        return mealPlan;
      }
      async finalizeMealPlan(mealPlan, context) {
        return {
          meal_plan: this.formatMealPlanForClient(mealPlan),
          shopping_list: this.generateShoppingList(mealPlan),
          prep_tips: this.generatePrepTips(mealPlan),
          hero_ingredients: context.heroIngredients
        };
      }
      formatMealPlanForClient(meals) {
        const formatted = {};
        meals.forEach((meal, index2) => {
          const day = Math.floor(index2 / 3) + 1;
          const mealType = this.getMealType(index2 % 3);
          if (!formatted[`day_${day}`]) {
            formatted[`day_${day}`] = {};
          }
          formatted[`day_${day}`][mealType] = {
            title: meal.title,
            description: meal.description,
            ingredients: meal.ingredients,
            instructions: meal.instructions,
            nutrition: meal.nutrition,
            cook_time_minutes: meal.cook_time_minutes,
            difficulty: meal.difficulty
          };
        });
        return formatted;
      }
      generateShoppingList(meals) {
        const allIngredients = meals.flatMap((meal) => meal.ingredients);
        return [...new Set(allIngredients)];
      }
      generatePrepTips(meals) {
        return [
          "Group similar prep tasks together to save time",
          "Prep hero ingredients in batches for multiple meals",
          "Focus on weight-based priorities when making substitutions"
        ];
      }
      async callAIMealGeneration(prompt, request) {
        console.log("Calling AI generation with weight-based prompt");
        try {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: `You are a weight-based meal planning expert. Generate a single meal following the specific priority weights. Always return valid JSON in the exact format requested.`
                },
                {
                  role: "user",
                  content: prompt
                }
              ],
              temperature: 0.8,
              max_tokens: 1e3
            })
          });
          if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
          }
          const data = await response.json();
          const content = data.choices[0]?.message?.content;
          if (!content) {
            throw new Error("No content received from OpenAI");
          }
          const cleanedContent = content.replace(/```json\n?|\n?```/g, "").trim();
          const mealData = JSON.parse(cleanedContent);
          return mealData;
        } catch (error) {
          console.error("AI meal generation failed:", error);
          return {
            title: "Simple Balanced Meal",
            description: "A nutritious and balanced meal option",
            ingredients: ["protein source", "vegetables", "whole grains", "healthy fats"],
            instructions: ["Prepare protein", "Cook vegetables", "Serve with grains"],
            nutrition: { calories: 450, protein_g: 25, carbs_g: 35, fat_g: 18 },
            cook_time_minutes: 25,
            difficulty: 2,
            objective_satisfaction: ["health", "time"],
            weight_rationale: "Fallback meal designed for balanced nutrition and quick preparation"
          };
        }
      }
      async validateGeneratedMeal(meal, request, context) {
        console.log("Validating generated meal:", meal.title || "Untitled");
        const validatedMeal = {
          title: meal.title || "Generated Meal",
          description: meal.description || "A delicious meal created with weight-based priorities",
          ingredients: Array.isArray(meal.ingredients) ? meal.ingredients : ["basic ingredients"],
          instructions: Array.isArray(meal.instructions) ? meal.instructions : ["prepare ingredients", "cook meal"],
          nutrition: {
            calories: meal.nutrition?.calories || 400,
            protein_g: meal.nutrition?.protein_g || 20,
            carbs_g: meal.nutrition?.carbs_g || 30,
            fat_g: meal.nutrition?.fat_g || 15
          },
          cook_time_minutes: meal.cook_time_minutes || 30,
          difficulty: Math.min(Math.max(meal.difficulty || 2, 1), 5),
          // Clamp between 1-5
          // Weight-based specific fields
          objective_satisfaction: Array.isArray(meal.objective_satisfaction) ? meal.objective_satisfaction : ["balanced"],
          weight_rationale: meal.weight_rationale || "Generated using weight-based priorities"
        };
        if (request.profile.dietaryRestrictions.length > 0) {
          if (this.mealAdaptationEngine && this.mealAdaptationEngine.validateCompliance) {
            const compliance = this.mealAdaptationEngine.validateCompliance(
              validatedMeal,
              request.profile.dietaryRestrictions
            );
            if (!compliance.isCompliant) {
              console.warn("\u274C Meal violates dietary restrictions:", compliance.violations);
              console.log("Attempting to adapt meal for compliance...");
              const adaptationResult = await this.mealAdaptationEngine.adaptMealIfNeeded(
                validatedMeal,
                request.profile.dietaryRestrictions,
                request.profile.goalWeights
              );
              if (adaptationResult.isAdapted) {
                console.log("\u2705 Meal successfully adapted:", adaptationResult.adaptations);
                return {
                  ...adaptationResult.meal,
                  adaptationNotes: adaptationResult.adaptations,
                  dietary_compliant: true
                };
              } else {
                validatedMeal.dietary_warnings = compliance.violations;
                validatedMeal.dietary_compliant = false;
              }
            } else {
              validatedMeal.dietary_compliant = true;
            }
          } else {
            const restrictionCompliance = this.checkDietaryCompliance(
              validatedMeal.ingredients,
              request.profile.dietaryRestrictions
            );
            if (!restrictionCompliance.isCompliant) {
              console.warn("Meal may not comply with dietary restrictions:", restrictionCompliance.violations);
              validatedMeal.dietary_warnings = restrictionCompliance.violations;
              validatedMeal.dietary_compliant = false;
            } else {
              validatedMeal.dietary_compliant = true;
            }
          }
        } else {
          validatedMeal.dietary_compliant = true;
        }
        if (context.heroIngredients && context.heroIngredients.length > 0) {
          const heroIngredientsUsed = validatedMeal.ingredients.filter(
            (ingredient) => context.heroIngredients.some(
              (hero) => ingredient.toLowerCase().includes(hero.toLowerCase())
            )
          );
          if (heroIngredientsUsed.length > 0) {
            validatedMeal.hero_ingredients_used = heroIngredientsUsed;
          }
        }
        return validatedMeal;
      }
      checkDietaryCompliance(ingredients, restrictions) {
        const violations = [];
        const ingredientText = ingredients.join(" ").toLowerCase();
        const restrictionChecks = {
          "vegetarian": ["meat", "chicken", "beef", "pork", "fish", "seafood"],
          "vegan": ["meat", "chicken", "beef", "pork", "fish", "seafood", "dairy", "milk", "cheese", "eggs"],
          "gluten-free": ["wheat", "flour", "bread", "pasta", "gluten"],
          "dairy-free": ["milk", "cheese", "butter", "cream", "yogurt"],
          "nut-free": ["nuts", "almond", "peanut", "walnut", "cashew"],
          "keto": [],
          // More complex validation needed
          "paleo": ["grain", "wheat", "rice", "beans", "dairy"]
        };
        restrictions.forEach((restriction) => {
          const restrictionKey = restriction.toLowerCase().replace(/[^a-z-]/g, "");
          const forbiddenItems = restrictionChecks[restrictionKey] || [];
          forbiddenItems.forEach((item) => {
            if (ingredientText.includes(item)) {
              violations.push(`${restriction}: contains ${item}`);
            }
          });
        });
        return {
          isCompliant: violations.length === 0,
          violations
        };
      }
    };
    MockCulturalSelector = class {
      shouldUseCulturalMeal(context, mealSlotContext, weights) {
        return weights.cultural > 0.5 && context.availableCulturalMeals.length > 0;
      }
      selectBestCulturalMeal(availableMeals, weights, mealSlotContext) {
        return availableMeals[0] || {
          title: "Traditional Cultural Dish",
          ingredients: ["traditional ingredients"],
          instructions: ["traditional preparation"],
          culture: "mixed"
        };
      }
    };
    MockMealLibrary = class {
      async getCompatibleMeals(culturalBackground, dietaryRestrictions) {
        return [];
      }
    };
    MockAdaptationEngine = class {
      async adaptMealIfNeeded(meal, dietaryRestrictions, weights) {
        return meal;
      }
    };
    MockHeroIngredientManager = class {
      async selectHeroIngredients(culturalBackground, availableIngredients = [], costWeight) {
        const basicHeroIngredients = [
          "rice",
          "beans",
          "chicken",
          "eggs",
          "potatoes",
          "onions",
          "garlic",
          "olive oil"
        ];
        const count = costWeight > 0.7 ? 6 : costWeight > 0.5 ? 4 : 2;
        return basicHeroIngredients.slice(0, count);
      }
      async enhanceWithHeroIngredients(meal, heroIngredients, costWeight) {
        const enhancedMeal = { ...meal };
        heroIngredients.forEach((hero) => {
          if (!meal.ingredients.some((ing) => ing.toLowerCase().includes(hero.toLowerCase()))) {
            enhancedMeal.ingredients.push(hero);
          }
        });
        return enhancedMeal;
      }
    };
  }
});

// server/HeroIngredientManager.ts
var HeroIngredientManager_exports = {};
__export(HeroIngredientManager_exports, {
  HeroIngredientManager: () => HeroIngredientManager
});
var HeroIngredientManager;
var init_HeroIngredientManager = __esm({
  "server/HeroIngredientManager.ts"() {
    "use strict";
    HeroIngredientManager = class {
      // Comprehensive ingredient database with versatility scores
      INGREDIENT_DATABASE = {
        // Proteins - High versatility
        "eggs": {
          name: "eggs",
          versatility_score: 0.95,
          cost_efficiency: 0.9,
          cultural_compatibility: ["American", "French", "Asian", "Italian", "Mexican"],
          storage_life: 14,
          bulk_friendly: true,
          dietary_safe: ["vegetarian"],
          usage_contexts: ["protein", "binding", "breakfast"],
          seasonal_availability: { peak_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], off_season_months: [] }
        },
        "chicken_thighs": {
          name: "chicken thighs",
          versatility_score: 0.9,
          cost_efficiency: 0.85,
          cultural_compatibility: ["American", "Asian", "Mediterranean", "Mexican", "Indian"],
          storage_life: 3,
          bulk_friendly: true,
          dietary_safe: [],
          usage_contexts: ["protein", "main"],
          seasonal_availability: { peak_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], off_season_months: [] }
        },
        "ground_turkey": {
          name: "ground turkey",
          versatility_score: 0.85,
          cost_efficiency: 0.8,
          cultural_compatibility: ["American", "Italian", "Mexican", "Mediterranean"],
          storage_life: 2,
          bulk_friendly: true,
          dietary_safe: [],
          usage_contexts: ["protein", "main"],
          seasonal_availability: { peak_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], off_season_months: [] }
        },
        // Vegetables - High versatility
        "onions": {
          name: "onions",
          versatility_score: 0.98,
          cost_efficiency: 0.95,
          cultural_compatibility: ["American", "French", "Italian", "Asian", "Mexican", "Indian", "Mediterranean"],
          storage_life: 30,
          bulk_friendly: true,
          dietary_safe: ["vegetarian", "vegan", "gluten-free", "dairy-free"],
          usage_contexts: ["aromatics", "base", "vegetable"],
          seasonal_availability: { peak_months: [8, 9, 10], off_season_months: [] }
        },
        "garlic": {
          name: "garlic",
          versatility_score: 0.95,
          cost_efficiency: 0.9,
          cultural_compatibility: ["Italian", "Asian", "Mediterranean", "Mexican", "Indian"],
          storage_life: 60,
          bulk_friendly: true,
          dietary_safe: ["vegetarian", "vegan", "gluten-free", "dairy-free"],
          usage_contexts: ["aromatics", "seasoning"],
          seasonal_availability: { peak_months: [6, 7, 8], off_season_months: [] }
        },
        "bell_peppers": {
          name: "bell peppers",
          versatility_score: 0.85,
          cost_efficiency: 0.75,
          cultural_compatibility: ["American", "Italian", "Mexican", "Asian", "Mediterranean"],
          storage_life: 7,
          bulk_friendly: false,
          dietary_safe: ["vegetarian", "vegan", "gluten-free", "dairy-free"],
          usage_contexts: ["vegetable", "color", "crunch"],
          seasonal_availability: { peak_months: [6, 7, 8, 9], off_season_months: [12, 1, 2] }
        },
        "carrots": {
          name: "carrots",
          versatility_score: 0.8,
          cost_efficiency: 0.85,
          cultural_compatibility: ["American", "French", "Asian", "Mediterranean"],
          storage_life: 21,
          bulk_friendly: true,
          dietary_safe: ["vegetarian", "vegan", "gluten-free", "dairy-free"],
          usage_contexts: ["vegetable", "sweetness", "base"],
          seasonal_availability: { peak_months: [9, 10, 11], off_season_months: [] }
        },
        // Pantry staples
        "rice": {
          name: "rice",
          versatility_score: 0.9,
          cost_efficiency: 0.95,
          cultural_compatibility: ["Asian", "Mexican", "Indian", "Mediterranean"],
          storage_life: 365,
          bulk_friendly: true,
          dietary_safe: ["vegetarian", "vegan", "gluten-free", "dairy-free"],
          usage_contexts: ["carbohydrate", "base", "filling"],
          seasonal_availability: { peak_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], off_season_months: [] }
        },
        "olive_oil": {
          name: "olive oil",
          versatility_score: 0.92,
          cost_efficiency: 0.8,
          cultural_compatibility: ["Italian", "Mediterranean", "American", "Mexican"],
          storage_life: 365,
          bulk_friendly: true,
          dietary_safe: ["vegetarian", "vegan", "gluten-free", "dairy-free"],
          usage_contexts: ["fat", "cooking", "flavor"],
          seasonal_availability: { peak_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], off_season_months: [] }
        },
        "canned_tomatoes": {
          name: "canned tomatoes",
          versatility_score: 0.85,
          cost_efficiency: 0.9,
          cultural_compatibility: ["Italian", "Mexican", "American", "Mediterranean", "Indian"],
          storage_life: 730,
          bulk_friendly: true,
          dietary_safe: ["vegetarian", "vegan", "gluten-free", "dairy-free"],
          usage_contexts: ["base", "sauce", "acidity"],
          seasonal_availability: { peak_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], off_season_months: [] }
        },
        // Legumes
        "black_beans": {
          name: "black beans",
          versatility_score: 0.75,
          cost_efficiency: 0.95,
          cultural_compatibility: ["Mexican", "American", "Latin American"],
          storage_life: 730,
          bulk_friendly: true,
          dietary_safe: ["vegetarian", "vegan", "gluten-free", "dairy-free"],
          usage_contexts: ["protein", "fiber", "filling"],
          seasonal_availability: { peak_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], off_season_months: [] }
        },
        "lentils": {
          name: "lentils",
          versatility_score: 0.8,
          cost_efficiency: 0.9,
          cultural_compatibility: ["Indian", "Mediterranean", "American"],
          storage_life: 365,
          bulk_friendly: true,
          dietary_safe: ["vegetarian", "vegan", "gluten-free", "dairy-free"],
          usage_contexts: ["protein", "fiber", "base"],
          seasonal_availability: { peak_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], off_season_months: [] }
        }
      };
      /**
       * Select optimal hero ingredients based on user context
       */
      async selectHeroIngredients(culturalBackground, availableIngredients = [], costPriority = 0.5, dietaryRestrictions = []) {
        console.log("Selecting hero ingredients...");
        console.log(`Cultural background: ${culturalBackground.join(", ")}`);
        console.log(`Cost priority: ${costPriority}`);
        console.log(`Dietary restrictions: ${dietaryRestrictions.join(", ")}`);
        const safeIngredients = this.filterBySafetyRequirements(dietaryRestrictions);
        const scoredIngredients = this.scoreIngredients(
          safeIngredients,
          culturalBackground,
          availableIngredients,
          costPriority
        );
        const selectedIngredients = this.selectOptimalCombination(scoredIngredients, culturalBackground);
        const usageFrequency = this.calculateUsageFrequency(selectedIngredients);
        const costSavings = this.estimateCostSavings(selectedIngredients, usageFrequency);
        const coverage = this.analyzeCoverage(selectedIngredients, culturalBackground);
        const rationale = this.generateSelectionRationale(selectedIngredients, culturalBackground, costPriority);
        console.log(`Selected ${selectedIngredients.length} hero ingredients: ${selectedIngredients.map((i) => i.name).join(", ")}`);
        console.log(`Estimated weekly savings: $${costSavings.toFixed(2)}`);
        return {
          selected_ingredients: selectedIngredients,
          selection_rationale: rationale,
          expected_usage_frequency: usageFrequency,
          cost_savings_estimate: costSavings,
          coverage_analysis: coverage
        };
      }
      /**
       * Enhance a meal with hero ingredients where appropriate
       */
      async enhanceWithHeroIngredients(meal, heroIngredients, costPriority = 0.5) {
        if (!meal || !heroIngredients.length) return meal;
        console.log(`Enhancing meal "${meal.title || meal.name}" with hero ingredients`);
        const enhancedMeal = { ...meal };
        let modificationsApplied = 0;
        const maxModifications = 3;
        const targetHeroCount = Math.min(3, heroIngredients.length);
        const applicableHeros = this.findApplicableHeroIngredients(meal, heroIngredients);
        for (let i = 0; i < Math.min(targetHeroCount, applicableHeros.length) && modificationsApplied < maxModifications; i++) {
          const heroIngredient = applicableHeros[i];
          const ingredient = this.INGREDIENT_DATABASE[heroIngredient];
          if (ingredient && this.canEnhanceMealWithIngredient(meal, ingredient)) {
            const enhancement = this.applyHeroIngredientEnhancement(enhancedMeal, ingredient);
            if (enhancement.applied) {
              modificationsApplied++;
              console.log(`Enhanced meal with ${ingredient.name}: ${enhancement.description}`);
            }
          }
        }
        enhancedMeal.heroIngredients = heroIngredients.filter(
          (hero) => enhancedMeal.ingredients.some(
            (ing) => ing.toLowerCase().includes(hero.toLowerCase())
          )
        );
        return enhancedMeal;
      }
      /**
       * Track hero ingredient usage across meal plan
       */
      trackHeroIngredientUsage(mealPlan, targetHeroIngredients) {
        const usageStats = {};
        const targetUsage = 3;
        targetHeroIngredients.forEach((hero) => {
          usageStats[hero] = { count: 0, meals: [] };
        });
        mealPlan.forEach((meal, index2) => {
          const mealId = meal.title || meal.name || `Meal ${index2 + 1}`;
          const mealIngredients = meal.ingredients || [];
          targetHeroIngredients.forEach((hero) => {
            const used = mealIngredients.some(
              (ing) => ing.toLowerCase().includes(hero.toLowerCase())
            );
            if (used) {
              usageStats[hero].count++;
              usageStats[hero].meals.push(mealId);
            }
          });
        });
        const targetAchievement = {};
        targetHeroIngredients.forEach((hero) => {
          const actual = usageStats[hero].count;
          const percentage = Math.round(actual / targetUsage * 100);
          targetAchievement[hero] = {
            target: targetUsage,
            actual,
            percentage
          };
        });
        const recommendations = this.generateUsageRecommendations(targetAchievement, usageStats);
        return {
          usage_stats: usageStats,
          target_achievement: targetAchievement,
          recommendations
        };
      }
      // Private helper methods
      filterBySafetyRequirements(dietaryRestrictions) {
        if (dietaryRestrictions.length === 0) {
          return Object.values(this.INGREDIENT_DATABASE);
        }
        return Object.values(this.INGREDIENT_DATABASE).filter((ingredient) => {
          return dietaryRestrictions.every(
            (restriction) => ingredient.dietary_safe.includes(restriction.toLowerCase()) || this.isIngredientSafeForRestriction(ingredient, restriction)
          );
        });
      }
      isIngredientSafeForRestriction(ingredient, restriction) {
        const restrictionLower = restriction.toLowerCase();
        const ingredientName = ingredient.name.toLowerCase();
        switch (restrictionLower) {
          case "vegetarian":
            return !["chicken_thighs", "ground_turkey"].includes(ingredientName);
          case "vegan":
            return !["eggs", "chicken_thighs", "ground_turkey"].includes(ingredientName);
          case "gluten-free":
            return true;
          // All our hero ingredients are naturally gluten-free
          case "dairy-free":
            return true;
          // None of our hero ingredients contain dairy
          case "nut-free":
            return true;
          // None of our hero ingredients are nuts
          default:
            return true;
        }
      }
      scoreIngredients(ingredients, culturalBackground, availableIngredients, costPriority) {
        return ingredients.map((ingredient) => {
          let score = 0;
          score += ingredient.versatility_score * 0.3;
          score += ingredient.cost_efficiency * (0.2 + costPriority * 0.2);
          const culturalMatch = culturalBackground.some(
            (culture) => ingredient.cultural_compatibility.some(
              (compatible) => compatible.toLowerCase().includes(culture.toLowerCase()) || culture.toLowerCase().includes(compatible.toLowerCase())
            )
          );
          if (culturalMatch) score += 0.15;
          const alreadyAvailable = availableIngredients.some(
            (available) => available.toLowerCase().includes(ingredient.name.toLowerCase()) || ingredient.name.toLowerCase().includes(available.toLowerCase())
          );
          if (alreadyAvailable) score += 0.1;
          if (ingredient.storage_life > 14) score += 0.05;
          if (ingredient.bulk_friendly) score += 0.05;
          return { ingredient, score };
        });
      }
      selectOptimalCombination(scoredIngredients, culturalBackground) {
        scoredIngredients.sort((a, b) => b.score - a.score);
        const selected = [];
        const maxIngredients = 5;
        const minIngredients = 3;
        const neededContexts = ["protein", "vegetable", "aromatics", "base"];
        const contextCoverage = {};
        for (const scored of scoredIngredients) {
          if (selected.length >= maxIngredients) break;
          const ingredient = scored.ingredient;
          const providesNeededContext = ingredient.usage_contexts.some(
            (context) => neededContexts.includes(context) && !contextCoverage[context]
          );
          if (providesNeededContext || selected.length < minIngredients) {
            selected.push(ingredient);
            ingredient.usage_contexts.forEach((context) => {
              if (neededContexts.includes(context)) {
                contextCoverage[context] = true;
              }
            });
          }
        }
        for (const scored of scoredIngredients) {
          if (selected.length >= maxIngredients) break;
          if (!selected.includes(scored.ingredient)) {
            selected.push(scored.ingredient);
          }
        }
        return selected;
      }
      calculateUsageFrequency(ingredients) {
        const frequency = {};
        ingredients.forEach((ingredient) => {
          if (ingredient.versatility_score >= 0.9) {
            frequency[ingredient.name] = 4;
          } else if (ingredient.versatility_score >= 0.8) {
            frequency[ingredient.name] = 3;
          } else {
            frequency[ingredient.name] = 2;
          }
        });
        return frequency;
      }
      estimateCostSavings(ingredients, usageFrequency) {
        let totalSavings = 0;
        ingredients.forEach((ingredient) => {
          const weeklyUsage = usageFrequency[ingredient.name] || 0;
          const estimatedSavingsPerUse = ingredient.cost_efficiency * 2;
          totalSavings += weeklyUsage * estimatedSavingsPerUse;
        });
        return totalSavings;
      }
      analyzeCoverage(ingredients, culturalBackground) {
        const cuisineCoverage = /* @__PURE__ */ new Set();
        const dietaryCoverage = /* @__PURE__ */ new Set();
        const mealTypeCoverage = /* @__PURE__ */ new Set();
        ingredients.forEach((ingredient) => {
          ingredient.cultural_compatibility.forEach((cuisine) => cuisineCoverage.add(cuisine));
          ingredient.dietary_safe.forEach((diet) => dietaryCoverage.add(diet));
          ingredient.usage_contexts.forEach((context) => mealTypeCoverage.add(context));
        });
        return {
          cuisine_coverage: Array.from(cuisineCoverage),
          dietary_coverage: Array.from(dietaryCoverage),
          meal_type_coverage: Array.from(mealTypeCoverage)
        };
      }
      generateSelectionRationale(ingredients, culturalBackground, costPriority) {
        const rationale = [];
        rationale.push(`Selected ${ingredients.length} hero ingredients for optimal cost savings and versatility`);
        if (costPriority >= 0.7) {
          rationale.push("High cost priority: Emphasized bulk-friendly ingredients with long storage life");
        }
        const highVersatility = ingredients.filter((ing) => ing.versatility_score >= 0.9);
        if (highVersatility.length > 0) {
          rationale.push(`${highVersatility.length} highly versatile ingredients selected: ${highVersatility.map((ing) => ing.name).join(", ")}`);
        }
        if (culturalBackground.length > 0) {
          const culturalMatches = ingredients.filter(
            (ing) => ing.cultural_compatibility.some(
              (compat) => culturalBackground.some(
                (bg) => compat.toLowerCase().includes(bg.toLowerCase()) || bg.toLowerCase().includes(compat.toLowerCase())
              )
            )
          );
          if (culturalMatches.length > 0) {
            rationale.push(`${culturalMatches.length} ingredients selected for cultural compatibility with ${culturalBackground.join(", ")}`);
          }
        }
        return rationale;
      }
      findApplicableHeroIngredients(meal, heroIngredients) {
        return heroIngredients.filter((hero) => {
          const ingredient = this.INGREDIENT_DATABASE[hero];
          if (!ingredient) return false;
          const alreadyHasIngredient = meal.ingredients?.some(
            (ing) => ing.toLowerCase().includes(hero.toLowerCase())
          );
          if (alreadyHasIngredient) return false;
          const mealTitle = (meal.title || meal.name || "").toLowerCase();
          const mealIngredients = (meal.ingredients || []).join(" ").toLowerCase();
          if (ingredient.usage_contexts.includes("protein") && (mealTitle.includes("salad") || mealIngredients.includes("protein"))) {
            return true;
          }
          if (ingredient.usage_contexts.includes("vegetable") && (!mealIngredients.includes(hero) && mealIngredients.length < 8)) {
            return true;
          }
          if (ingredient.usage_contexts.includes("aromatics") && !mealIngredients.includes("onion") && !mealIngredients.includes("garlic")) {
            return true;
          }
          return false;
        });
      }
      canEnhanceMealWithIngredient(meal, ingredient) {
        const mealIngredients = (meal.ingredients || []).join(" ").toLowerCase();
        if (mealIngredients.includes(ingredient.name.toLowerCase())) {
          return false;
        }
        if (meal.ingredients && meal.ingredients.length > 12) {
          return false;
        }
        return true;
      }
      applyHeroIngredientEnhancement(meal, ingredient) {
        if (!meal.ingredients) meal.ingredients = [];
        if (!meal.instructions) meal.instructions = [];
        const originalIngredientCount = meal.ingredients.length;
        switch (ingredient.usage_contexts[0]) {
          case "protein":
            meal.ingredients.push(ingredient.name);
            meal.instructions.push(`Add ${ingredient.name} as protein component.`);
            break;
          case "vegetable":
            meal.ingredients.push(ingredient.name);
            meal.instructions.push(`Include ${ingredient.name} for added nutrition and flavor.`);
            break;
          case "aromatics":
            meal.ingredients.unshift(ingredient.name);
            if (meal.instructions.length > 0) {
              meal.instructions[0] = `Start by cooking ${ingredient.name}, then ${meal.instructions[0].toLowerCase()}`;
            } else {
              meal.instructions.push(`Cook ${ingredient.name} as aromatic base.`);
            }
            break;
          default:
            meal.ingredients.push(ingredient.name);
            meal.instructions.push(`Incorporate ${ingredient.name} as needed.`);
        }
        const enhanced = meal.ingredients.length > originalIngredientCount;
        const description = enhanced ? `Added ${ingredient.name} as ${ingredient.usage_contexts[0]}` : "No enhancement applied";
        return { applied: enhanced, description };
      }
      generateUsageRecommendations(targetAchievement, usageStats) {
        const recommendations = [];
        Object.entries(targetAchievement).forEach(([ingredient, achievement]) => {
          if (achievement.percentage < 75) {
            recommendations.push(
              `Increase ${ingredient} usage: currently ${achievement.actual}/${achievement.target} meals (${achievement.percentage}%)`
            );
          } else if (achievement.percentage > 125) {
            recommendations.push(
              `Consider reducing ${ingredient} usage: currently ${achievement.actual}/${achievement.target} meals (${achievement.percentage}%)`
            );
          }
        });
        const totalUsage = Object.values(usageStats).reduce((sum, stat) => sum + stat.count, 0);
        const averageUsage = totalUsage / Object.keys(usageStats).length;
        if (averageUsage < 2.5) {
          recommendations.push("Overall hero ingredient usage is low - consider featuring them more prominently");
        } else if (averageUsage > 4.5) {
          recommendations.push("Hero ingredients may be overused - ensure variety with other ingredients");
        }
        if (recommendations.length === 0) {
          recommendations.push("Hero ingredient usage is well-balanced across the meal plan");
        }
        return recommendations;
      }
    };
  }
});

// server/culturalMealRankingEngine.ts
var culturalMealRankingEngine_exports = {};
__export(culturalMealRankingEngine_exports, {
  CulturalMealRankingEngine: () => CulturalMealRankingEngine,
  culturalMealRankingEngine: () => culturalMealRankingEngine
});
var CulturalMealRankingEngine, culturalMealRankingEngine;
var init_culturalMealRankingEngine = __esm({
  "server/culturalMealRankingEngine.ts"() {
    "use strict";
    init_cultureCacheManager();
    CulturalMealRankingEngine = class {
      structuredMeals = [];
      lastCacheUpdate = 0;
      cachedCultures = [];
      CACHE_TTL = 5 * 60 * 1e3;
      // 5 minutes
      constructor() {
        console.log("\u{1F3AF} Cultural Meal Ranking Engine initialized");
      }
      /**
       * Convert cached cultural cuisine data to structured meal format
       */
      async buildStructuredMealDatabase(userId, cultures) {
        console.log(`\u{1F4DA} Building structured meal database for cultures: ${cultures.join(", ")}`);
        const culturalData = await getCachedCulturalCuisine(userId, cultures, { useBatch: true, forceRefresh: true });
        console.log(`\u{1F4CA} Cultural data keys received: ${culturalData ? Object.keys(culturalData).join(", ") : "null"}`);
        if (!culturalData) {
          console.log("\u274C No cultural data available");
          return [];
        }
        const structuredMeals = [];
        let mealCounter = 0;
        for (const [cuisine, cultureData] of Object.entries(culturalData)) {
          console.log(`\u{1F37D}\uFE0F Processing ${cultureData.meals?.length || 0} meals from ${cuisine}`);
          if (!cultureData.meals) continue;
          for (const meal of cultureData.meals) {
            const structuredMeal = {
              id: `${cuisine.toLowerCase()}_${++mealCounter}`,
              name: meal.name,
              cuisine,
              description: meal.description || "",
              // Calculate core scores from cached data
              authenticity_score: this.calculateAuthenticityScore(meal, cultureData),
              health_score: this.calculateHealthScore(meal),
              cost_score: this.calculateCostScore(meal),
              time_score: this.calculateTimeScore(meal),
              // Extract metadata
              cooking_techniques: meal.cooking_techniques || this.extractCookingTechniques(meal.description),
              ingredients: meal.full_ingredients || meal.healthy_ingredients || [],
              healthy_modifications: meal.healthy_modifications || [],
              estimated_prep_time: this.estimatePrepTime(meal),
              estimated_cook_time: this.estimateCookTime(meal),
              difficulty_level: this.estimateDifficulty(meal),
              // Dietary compliance analysis
              dietary_tags: this.analyzeDietaryTags(meal),
              egg_free: this.isEggFree(meal),
              vegetarian: this.isVegetarian(meal),
              vegan: this.isVegan(meal),
              gluten_free: this.isGlutenFree(meal),
              dairy_free: this.isDairyFree(meal),
              // Source metadata
              source_quality: cultureData.source_quality_score || 0.8,
              cache_data: cultureData
            };
            structuredMeals.push(structuredMeal);
          }
        }
        console.log(`\u2705 Built structured database with ${structuredMeals.length} meals`);
        return structuredMeals;
      }
      /**
       * Score a meal based on user's cultural profile and weights
       */
      scoreMeal(meal, userProfile) {
        const culturalPreference = userProfile.cultural_preferences[meal.cuisine] || 0.5;
        const cultural_score = culturalPreference * meal.authenticity_score;
        const component_scores = {
          cultural_score,
          health_score: meal.health_score,
          cost_score: meal.cost_score,
          time_score: meal.time_score
        };
        const total_score = (userProfile.priority_weights.cultural * cultural_score + userProfile.priority_weights.health * meal.health_score + userProfile.priority_weights.cost * meal.cost_score + userProfile.priority_weights.time * meal.time_score) / (userProfile.priority_weights.cultural + userProfile.priority_weights.health + userProfile.priority_weights.cost + userProfile.priority_weights.time);
        const ranking_explanation = this.generateRankingExplanation(meal, component_scores, userProfile);
        return {
          meal,
          total_score,
          component_scores,
          ranking_explanation
        };
      }
      /**
       * Get top-ranked meals for a user with dietary filtering
       */
      async getRankedMeals(userId, userProfile, limit = 20, relevanceThreshold = 0.8) {
        const cultures = Object.keys(userProfile.cultural_preferences);
        console.log(`\u{1F3AF} Requested cultures: ${cultures.join(", ")}`);
        console.log(`\u{1F4CA} Current cache has ${this.structuredMeals.length} meals`);
        console.log(`\u23F0 Cache age: ${Date.now() - this.lastCacheUpdate}ms (TTL: ${this.CACHE_TTL}ms)`);
        const culturesDifferent = JSON.stringify(cultures.sort()) !== JSON.stringify(this.cachedCultures.sort());
        if (this.structuredMeals.length === 0 || Date.now() - this.lastCacheUpdate > this.CACHE_TTL || culturesDifferent) {
          console.log(`\u{1F504} Refreshing meal database. Cultures different: ${culturesDifferent}`);
          console.log(`\u{1F9F9} Clearing old cache of ${this.structuredMeals.length} meals`);
          this.structuredMeals = [];
          this.structuredMeals = await this.buildStructuredMealDatabase(userId, cultures);
          this.cachedCultures = [...cultures];
          this.lastCacheUpdate = Date.now();
          console.log(`\u2705 New cache built with ${this.structuredMeals.length} meals for ${cultures.join(", ")}`);
        }
        console.log(`\u{1F50D} Ranking ${this.structuredMeals.length} meals for user preferences`);
        const filteredMeals = this.structuredMeals.filter(
          (meal) => this.meetsDietaryRestrictions(meal, userProfile.dietary_restrictions)
        );
        console.log(`\u2705 ${filteredMeals.length} meals after dietary filtering`);
        const scoredMeals = filteredMeals.map((meal) => this.scoreMeal(meal, userProfile));
        scoredMeals.sort((a, b) => b.total_score - a.total_score);
        const maxScore = scoredMeals[0]?.total_score || 0;
        const relevantMeals = scoredMeals.filter(
          (meal) => meal.total_score >= relevanceThreshold * maxScore
        );
        console.log(`\u{1F3AF} ${relevantMeals.length} meals within relevance threshold (${relevanceThreshold})`);
        return relevantMeals.slice(0, limit);
      }
      // Helper methods for scoring
      calculateAuthenticityScore(meal, cultureData) {
        let score = 0.7;
        if (cultureData.summary?.common_healthy_ingredients) {
          const traditionalIngredients = cultureData.summary.common_healthy_ingredients.filter(
            (ingredient) => meal.description?.toLowerCase().includes(ingredient.toLowerCase()) || meal.name?.toLowerCase().includes(ingredient.toLowerCase())
          );
          score += Math.min(traditionalIngredients.length * 0.1, 0.3);
        }
        return Math.min(score, 1);
      }
      calculateHealthScore(meal) {
        let score = 0.4;
        const description = meal.description?.toLowerCase() || "";
        const name = meal.name?.toLowerCase() || "";
        if (description.includes("steamed") || description.includes("grilled")) score += 0.3;
        if (description.includes("fried") || description.includes("deep-fried")) score -= 0.2;
        if (description.includes("boiled") || description.includes("poached")) score += 0.2;
        if (description.includes("vegetable") || description.includes("tofu")) score += 0.2;
        if (description.includes("lean") || description.includes("fish")) score += 0.25;
        if (description.includes("oil") || description.includes("butter")) score -= 0.1;
        if (description.includes("cream") || description.includes("cheese")) score -= 0.15;
        if (name.includes("soup") || name.includes("salad")) score += 0.2;
        if (name.includes("dumpling") || name.includes("roll")) score += 0.1;
        if (name.includes("duck") || name.includes("pork")) score -= 0.1;
        return Math.max(0.3, Math.min(score, 1));
      }
      calculateCostScore(meal) {
        let score = 0.7;
        const description = meal.description?.toLowerCase() || "";
        const name = meal.name?.toLowerCase() || "";
        if (description.includes("duck") || description.includes("beef")) score -= 0.2;
        if (description.includes("saffron") || description.includes("truffle")) score -= 0.3;
        if (description.includes("wine") || description.includes("cream")) score -= 0.1;
        if (description.includes("seafood") || description.includes("fish")) score -= 0.15;
        if (description.includes("tofu") || description.includes("bean")) score += 0.2;
        if (description.includes("noodle") || description.includes("rice")) score += 0.15;
        if (description.includes("vegetable") || description.includes("cabbage")) score += 0.1;
        if (description.includes("egg") || description.includes("chicken")) score += 0.1;
        if (description.includes("stir-fry") || description.includes("steamed")) score += 0.1;
        if (description.includes("soup") || description.includes("boiled")) score += 0.15;
        if (description.includes("stuffed") || description.includes("marinated")) score -= 0.1;
        if (description.includes("slow-cooked") || description.includes("braised")) score -= 0.05;
        return Math.max(0.3, Math.min(score, 1));
      }
      calculateTimeScore(meal) {
        let score = 0.5;
        const description = meal.description?.toLowerCase() || "";
        const name = meal.name?.toLowerCase() || "";
        if (description.includes("stir-fry") || description.includes("stir-fried")) score += 0.4;
        if (description.includes("steamed") && !description.includes("slow")) score += 0.3;
        if (description.includes("grilled") || description.includes("saut\xE9ed")) score += 0.3;
        if (description.includes("boiled") || description.includes("poached")) score += 0.2;
        if (description.includes("braised") || description.includes("slow-cook")) score -= 0.3;
        if (description.includes("roasted") || description.includes("baked")) score -= 0.2;
        if (description.includes("marinated") || description.includes("cured")) score -= 0.4;
        if (description.includes("stuffed") || description.includes("layered")) score -= 0.2;
        if (name.includes("soup") || name.includes("noodle")) score += 0.1;
        if (name.includes("dumpling") || name.includes("spring roll")) score += 0.1;
        if (name.includes("duck") || name.includes("whole")) score -= 0.3;
        if (name.includes("risotto") || name.includes("lasagne")) score -= 0.2;
        if (description.includes("homemade") || description.includes("fresh pasta")) score -= 0.1;
        if (description.includes("sauce") && description.includes("from scratch")) score -= 0.15;
        return Math.max(0.2, Math.min(score, 1));
      }
      extractCookingTechniques(description) {
        const techniques = [];
        const text2 = description.toLowerCase();
        const techniqueKeywords = [
          "stir-fry",
          "steam",
          "boil",
          "saute",
          "grill",
          "roast",
          "braise",
          "fry",
          "bake",
          "simmer",
          "poach",
          "blanch"
        ];
        for (const technique of techniqueKeywords) {
          if (text2.includes(technique)) {
            techniques.push(technique);
          }
        }
        return techniques.length > 0 ? techniques : ["saute"];
      }
      estimatePrepTime(meal) {
        const ingredientCount = meal.full_ingredients?.length || 5;
        return Math.min(ingredientCount * 2, 20);
      }
      estimateCookTime(meal) {
        const techniques = meal.cooking_techniques || this.extractCookingTechniques(meal.description);
        if (techniques.includes("stir-fry")) return 10;
        if (techniques.includes("steam")) return 15;
        if (techniques.includes("saute")) return 12;
        if (techniques.includes("braise")) return 45;
        if (techniques.includes("roast")) return 30;
        return 20;
      }
      estimateDifficulty(meal) {
        const techniques = meal.cooking_techniques || this.extractCookingTechniques(meal.description);
        const ingredientCount = meal.full_ingredients?.length || 5;
        let difficulty = 2;
        if (techniques.includes("braise") || techniques.includes("roast")) difficulty += 1;
        if (ingredientCount > 10) difficulty += 0.5;
        if (meal.healthy_modifications && meal.healthy_modifications.length > 2) difficulty += 0.5;
        return Math.min(difficulty, 5);
      }
      analyzeDietaryTags(meal) {
        const tags = [];
        const text2 = `${meal.name} ${meal.description}`.toLowerCase();
        if (this.isVegetarian(meal)) tags.push("vegetarian");
        if (this.isVegan(meal)) tags.push("vegan");
        if (this.isGlutenFree(meal)) tags.push("gluten-free");
        if (this.isDairyFree(meal)) tags.push("dairy-free");
        if (this.isEggFree(meal)) tags.push("egg-free");
        return tags;
      }
      isEggFree(meal) {
        const text2 = `${meal.name} ${meal.description} ${meal.full_ingredients?.join(" ") || ""}`.toLowerCase();
        const eggKeywords = ["egg", "eggs", "mayonnaise", "mayo"];
        return !eggKeywords.some((keyword) => text2.includes(keyword));
      }
      isVegetarian(meal) {
        const text2 = `${meal.name} ${meal.description} ${meal.full_ingredients?.join(" ") || ""}`.toLowerCase();
        const meatKeywords = ["chicken", "beef", "pork", "fish", "meat", "lamb", "turkey"];
        return !meatKeywords.some((keyword) => text2.includes(keyword));
      }
      isVegan(meal) {
        if (!this.isVegetarian(meal)) return false;
        const text2 = `${meal.name} ${meal.description} ${meal.full_ingredients?.join(" ") || ""}`.toLowerCase();
        const animalProducts = ["dairy", "milk", "cheese", "butter", "cream", "yogurt", "honey"];
        return !animalProducts.some((product) => text2.includes(product));
      }
      isGlutenFree(meal) {
        const text2 = `${meal.name} ${meal.description} ${meal.full_ingredients?.join(" ") || ""}`.toLowerCase();
        const glutenKeywords = ["wheat", "flour", "bread", "pasta", "noodles", "soy sauce"];
        return !glutenKeywords.some((keyword) => text2.includes(keyword));
      }
      isDairyFree(meal) {
        const text2 = `${meal.name} ${meal.description} ${meal.full_ingredients?.join(" ") || ""}`.toLowerCase();
        const dairyKeywords = ["milk", "cheese", "butter", "cream", "yogurt", "dairy"];
        return !dairyKeywords.some((keyword) => text2.includes(keyword));
      }
      meetsDietaryRestrictions(meal, restrictions) {
        for (const restriction of restrictions) {
          const lowerRestriction = restriction.toLowerCase();
          if (lowerRestriction.includes("egg") && !meal.egg_free) return false;
          if (lowerRestriction.includes("dairy") && !meal.dairy_free) return false;
          if (lowerRestriction.includes("gluten") && !meal.gluten_free) return false;
          if (lowerRestriction.includes("vegetarian") && !meal.vegetarian) return false;
          if (lowerRestriction.includes("vegan") && !meal.vegan) return false;
        }
        return true;
      }
      generateRankingExplanation(meal, scores, userProfile) {
        const explanations = [];
        if (scores.cultural_score > 0.8) {
          explanations.push(`High cultural match (${(scores.cultural_score * 100).toFixed(0)}%)`);
        }
        if (meal.authenticity_score > 0.8) {
          explanations.push(`Authentic ${meal.cuisine} recipe`);
        }
        if (scores.health_score > 0.7) {
          explanations.push(`Good health score`);
        }
        if (scores.cost_score > 0.7) {
          explanations.push(`Cost-efficient ingredients`);
        }
        if (scores.time_score > 0.7) {
          explanations.push(`Quick preparation`);
        }
        return explanations.join(", ") || "Balanced meal option";
      }
    };
    culturalMealRankingEngine = new CulturalMealRankingEngine();
  }
});

// server/intelligentPromptBuilderV2.ts
var intelligentPromptBuilderV2_exports = {};
__export(intelligentPromptBuilderV2_exports, {
  UNIFIED_GOALS: () => UNIFIED_GOALS2,
  buildEnhancedIntelligentPrompt: () => buildEnhancedIntelligentPrompt2,
  buildIntelligentPrompt: () => buildIntelligentPrompt2,
  buildWeightBasedIntelligentPrompt: () => buildWeightBasedIntelligentPrompt,
  enhanceMealWithIntelligentTiming: () => enhanceMealWithIntelligentTiming2,
  extractFamilyDietaryNeeds: () => extractFamilyDietaryNeeds2,
  generateEnhancedMealPlan: () => generateEnhancedMealPlan2,
  generateStandardMealPlan: () => generateStandardMealPlan2,
  getDifficultyAdjustedPromptSuffix: () => getDifficultyAdjustedPromptSuffix2,
  getUnifiedGoal: () => getUnifiedGoal2,
  validateEnhancedMealPlan: () => validateEnhancedMealPlan2,
  validateMealConstraints: () => validateMealConstraints2
});
async function buildWeightBasedIntelligentPrompt(filters, goalWeights, heroIngredients = []) {
  console.log("\u{1F680} Using Prompt Builder V2 with weight-based intelligence");
  console.log("\u{1F4CA} PROMPT DEBUG - Input parameters:");
  console.log("  - Goal weights:", JSON.stringify(goalWeights, null, 2));
  console.log("  - Cultural background:", filters.culturalBackground);
  console.log("  - Hero ingredients:", heroIngredients);
  console.log("  - Dietary restrictions:", filters.dietaryRestrictions);
  const basePrompt = await buildIntelligentPrompt2({
    ...filters,
    goalWeights,
    heroIngredients,
    weightBasedEnhanced: true
  });
  console.log("\n\u{1F4DD} PROMPT DEBUG - Base prompt length:", basePrompt.length);
  console.log("\u{1F4DD} PROMPT DEBUG - Base prompt preview:", basePrompt.substring(0, 500) + "...");
  const weightEnhancedPrompt = applyWeightBasedEnhancements(
    basePrompt,
    goalWeights,
    heroIngredients,
    filters
  );
  console.log("\n\u2705 V2 prompt generated with main goals + weight-based priorities");
  console.log("\u{1F4DD} PROMPT DEBUG - Final prompt length:", weightEnhancedPrompt.length);
  console.log("\u{1F4DD} PROMPT DEBUG - Weight enhancements added:", weightEnhancedPrompt.length - basePrompt.length, "characters");
  console.log("\n\u{1F3AF} PROMPT DEBUG - COMPLETE FINAL PROMPT:");
  console.log("=====================================");
  console.log(weightEnhancedPrompt);
  console.log("=====================================\n");
  return weightEnhancedPrompt;
}
async function buildIntelligentPrompt2(filters) {
  let prompt = `Create exactly a ${filters.numDays}-day meal plan with ${filters.mealsPerDay} meals per day`;
  if (filters.profileType === "family" && filters.familySize) {
    prompt += ` for a family of ${filters.familySize}`;
    if (filters.familyMembers && filters.familyMembers.length > 0) {
      const childrenCount = filters.familyMembers.filter((m) => m.ageGroup === "Child").length;
      const adultCount = filters.familyMembers.filter((m) => m.ageGroup === "Adult").length;
      if (childrenCount > 0) {
        prompt += ` (${adultCount} adults, ${childrenCount} children)`;
      }
    }
  }
  if (filters.primaryGoal) {
    const goalAdjustments = applyPrimaryGoalLogic2(filters.primaryGoal, filters);
    prompt += goalAdjustments.prompt;
    Object.assign(filters, goalAdjustments.adjustedFilters);
  }
  if (filters.weightBasedEnhanced && filters.goalWeights) {
    prompt += `

\u{1F3AF} WEIGHT-BASED PRIORITY SYSTEM ACTIVE:`;
    prompt += `
This plan will balance objectives using priority weights when conflicts arise.`;
    prompt += `
Main goal guidance takes precedence, weights refine decisions.`;
  }
  prompt += `

REQUIREMENTS:`;
  prompt += `
- Max cook time: ${filters.cookTime} minutes (including prep + cook time)`;
  prompt += `
- Difficulty level: MAXIMUM ${filters.difficulty}/5 (use 0.5 increments: 1, 1.5, 2, 2.5, 3, etc.)`;
  prompt += `
- CRITICAL: ALL recipes must have difficulty <= ${filters.difficulty}`;
  prompt += `
- Use precise difficulty ratings in 0.5 increments for accurate complexity assessment`;
  if (filters.prepTimePreference === "minimal") {
    prompt += `
- Prioritize minimal prep time recipes (under 10 minutes prep)`;
    prompt += `
- Focus on one-pot or sheet pan meals when possible`;
  } else if (filters.prepTimePreference === "enjoys_cooking") {
    prompt += `
- Include recipes with more involved preparation when appropriate`;
    prompt += `
- Can include multi-step cooking processes`;
  }
  prompt += getDifficultyAdjustedPromptSuffix2(filters.difficulty);
  if (filters.nutritionGoal) {
    prompt += `
- Nutrition goal: ${filters.nutritionGoal}`;
  }
  if (filters.familyMembers && filters.familyMembers.length > 0) {
    const allPreferences = filters.familyMembers.flatMap((m) => m.preferences);
    const uniquePreferences = [...new Set(allPreferences)];
    if (uniquePreferences.length > 0) {
      prompt += `
- Family dietary preferences: ${uniquePreferences.join(", ")}`;
    }
    const hasChildren = filters.familyMembers.some((m) => m.ageGroup === "Child");
    if (hasChildren) {
      prompt += `
- Include child-friendly options that are appealing to kids`;
      prompt += `
- Avoid overly spicy or complex flavors for children`;
    }
  }
  if (filters.dietaryRestrictions) {
    prompt += `
- Dietary restrictions: ${filters.dietaryRestrictions}`;
  }
  if (filters.availableIngredients) {
    const usagePercent = filters.availableIngredientUsagePercent || (filters.primaryGoal === "Save Money" ? 80 : 50);
    prompt += `
- Use these available ingredients in at least ${usagePercent}% of meals: ${filters.availableIngredients}`;
    prompt += `
- You may suggest additional ingredients for variety and nutritional completeness`;
  }
  if (filters.excludeIngredients) {
    prompt += `
- Completely avoid these ingredients: ${filters.excludeIngredients}`;
  }
  if (filters.encourageOverlap) {
    prompt += `
- IMPORTANT: Maximize ingredient reuse across meals to minimize shopping costs`;
    prompt += `
- Aim for 3+ shared ingredients between different meals`;
    prompt += `
- Suggest bulk buying opportunities when possible`;
  }
  console.log("\n\u{1F30D} PROMPT DEBUG - Cultural Integration Check:");
  console.log("  - Cultural cuisine data available:", !!filters.culturalCuisineData);
  console.log("  - Cultural background:", filters.culturalBackground);
  console.log("  - Goal weights available:", !!filters.goalWeights);
  console.log("  - Cultural weight value:", filters.goalWeights?.cultural);
  if (filters.culturalCuisineData && filters.culturalBackground && filters.culturalBackground.length > 0 && filters.goalWeights) {
    console.log("  \u2705 Adding WEIGHT-BASED CULTURAL RANKING section");
    prompt += `

\u{1F30D} CULTURAL CUISINE INTEGRATION:`;
    prompt += `
- Include authentic dishes from user's cultural background: ${filters.culturalBackground.join(", ")}`;
    try {
      const { culturalMealRankingEngine: culturalMealRankingEngine2 } = await Promise.resolve().then(() => (init_culturalMealRankingEngine(), culturalMealRankingEngine_exports));
      const culturalPreferences = {};
      filters.culturalBackground.forEach((culture) => {
        culturalPreferences[culture] = 1;
      });
      const userCulturalProfile = {
        cultural_preferences: culturalPreferences,
        priority_weights: {
          cultural: filters.goalWeights.cultural || 0.5,
          health: filters.goalWeights.health || 0.5,
          cost: filters.goalWeights.cost || 0.5,
          time: filters.goalWeights.time || 0.5,
          variety: filters.goalWeights.variety || 0.5
        }
      };
      console.log("  \u{1F50D} Getting ranked meals with full weight profile:", userCulturalProfile.priority_weights);
      const rankedMeals = await culturalMealRankingEngine2.getRankedMeals(
        filters.userId || 1,
        // Use provided userId or fallback
        userCulturalProfile,
        8,
        // Get top 8 meals for selection
        0.6
        // Relevance threshold
      );
      console.log(`  \u{1F4CA} Got ${rankedMeals.length} weight-ranked cultural meals`);
      if (rankedMeals.length > 0) {
        const topMeals = rankedMeals.slice(0, 5);
        const mealNames = topMeals.map((meal) => meal.meal.name);
        const mealIngredients = [...new Set(topMeals.flatMap((meal) => meal.meal.ingredients))].slice(0, 8);
        const mealTechniques = [...new Set(topMeals.flatMap((meal) => meal.meal.cooking_techniques))].slice(0, 5);
        prompt += `
- TOP-RANKED ${filters.culturalBackground[0].toUpperCase()} MEALS (based on your complete weight profile):`;
        prompt += `
  ${mealNames.join(", ")}`;
        if (mealIngredients.length > 0) {
          prompt += `
- Key ingredients from top-ranked meals: ${mealIngredients.join(", ")}`;
        }
        if (mealTechniques.length > 0) {
          prompt += `
- Cooking techniques from top-ranked meals: ${mealTechniques.join(", ")}`;
        }
        const avgCulturalScore = topMeals.reduce((sum, meal) => sum + meal.component_scores.cultural_score, 0) / topMeals.length;
        const avgCostScore = topMeals.reduce((sum, meal) => sum + meal.component_scores.cost_score, 0) / topMeals.length;
        const avgHealthScore = topMeals.reduce((sum, meal) => sum + meal.component_scores.health_score, 0) / topMeals.length;
        const avgTimeScore = topMeals.reduce((sum, meal) => sum + meal.component_scores.time_score, 0) / topMeals.length;
        prompt += `
- These meals rank highest based on best alignment with your complete profile across all weighted factors`;
        prompt += `
- Average scores: Cultural ${Math.round(avgCulturalScore * 100)}%, Cost ${Math.round(avgCostScore * 100)}%, Health ${Math.round(avgHealthScore * 100)}%, Time ${Math.round(avgTimeScore * 100)}%`;
        console.log("  \u2705 Added weight-based ranked meal data to prompt");
      } else {
        console.log("  \u26A0\uFE0F No ranked meals found, using fallback cultural data");
        prompt += addBasicCulturalDataFallback(filters);
      }
    } catch (error) {
      console.log("  \u274C Cultural ranking engine failed, using fallback:", error.message);
      prompt += addBasicCulturalDataFallback(filters);
    }
    const culturalWeight = filters.goalWeights?.cultural || 0.5;
    const culturalIntensity = Math.round(culturalWeight * 100);
    if (culturalWeight >= 0.7) {
      prompt += `
- VERY HIGH CULTURAL PRIORITY (${culturalIntensity}%): Strongly emphasize authentic cultural flavors, ingredients, and techniques in most meals`;
      prompt += `
- Weave cultural elements into regular meal types rather than creating separate "cultural meals"`;
      prompt += `
- Use cultural spices, cooking methods, and ingredient combinations as primary choices`;
    } else if (culturalWeight >= 0.5) {
      prompt += `
- HIGH CULTURAL PRIORITY (${culturalIntensity}%): Include cultural flavors and techniques when possible`;
      prompt += `
- Blend cultural ingredients with familiar meal formats`;
      prompt += `
- Use cultural elements as flavor enhancers and inspiration`;
    } else {
      prompt += `
- MODERATE CULTURAL INFLUENCE (${culturalIntensity}%): Incorporate cultural elements subtly`;
      prompt += `
- Use cultural spices and ingredients as accent flavors`;
    }
    prompt += `
- Balance cultural authenticity with dietary restrictions and family preferences`;
    prompt += `
- Cultural dishes listed above are suggestions - adapt them to meal contexts naturally`;
    prompt += await addConflictResolutionGuidance2(filters);
  }
  if (filters.varietyPreference === "high_variety") {
    prompt += `
- Vary cuisines: Italian, Asian, Mexican, Mediterranean, American`;
    prompt += `
- Include diverse cooking methods: grilling, baking, stir-frying, slow cooking`;
  } else if (filters.varietyPreference === "consistent") {
    prompt += `
- Keep cuisines consistent and familiar`;
    prompt += `
- Focus on proven, reliable recipes`;
  }
  if (filters.prepTimePreference === "minimal") {
    prompt += `
- Prioritize quick prep and one-pot meals`;
    prompt += `
- Include meal prep suggestions for efficiency`;
  } else if (filters.prepTimePreference === "enjoys_cooking") {
    prompt += `
- Include some complex, rewarding recipes`;
    prompt += `
- Add cooking techniques that are educational and fun`;
  }
  const dayStructure = [];
  for (let i = 1; i <= filters.numDays; i++) {
    dayStructure.push(`"day_${i}"`);
  }
  prompt += `

CRITICAL: Generate exactly ${filters.numDays} days: ${dayStructure.join(", ")}.`;
  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];
  const selectedMealTypes = mealTypes.slice(0, filters.mealsPerDay);
  const mealExamples = selectedMealTypes.map((mealType, index2) => {
    const calories = 350 + index2 * 50;
    const protein = 20 + index2 * 5;
    const carbs = 30 + index2 * 5;
    const fat = 15 + index2 * 3;
    return `      "${mealType}": {"title": "Recipe Name", "cook_time_minutes": ${15 + index2 * 5}, "difficulty": ${2 + index2}, "ingredients": ["ingredient${index2 + 1}"], "instructions": ["step${index2 + 1}"], "nutrition": {"calories": ${calories}, "protein_g": ${protein}, "carbs_g": ${carbs}, "fat_g": ${fat}}}`;
  }).join(",\n");
  prompt += `

RETURN FORMAT: Valid JSON with this exact structure:
{
  "meal_plan": {
    "day_1": {
${mealExamples}
    }
    // ... continue for all ${filters.numDays} days with ${filters.mealsPerDay} meals each
  },
  "shopping_list": ["consolidated ingredient list"],
  "prep_tips": ["helpful preparation suggestions"],
  "estimated_savings": ${filters.encourageOverlap ? 15.5 : 0}
}`;
  return prompt;
}
function applyWeightBasedEnhancements(basePrompt, goalWeights, heroIngredients, filters) {
  console.log("\n\u{1F527} PROMPT DEBUG - Applying weight-based enhancements");
  console.log("  - Cultural weight:", goalWeights.cultural);
  console.log("  - Cultural background in filters:", filters.culturalBackground);
  let enhancedPrompt = basePrompt;
  enhancedPrompt += `

\u2696\uFE0F WEIGHT-BASED PRIORITY REFINEMENTS:`;
  enhancedPrompt += `
When the main goal guidance creates conflicts, use these weights to resolve decisions:`;
  const sortedWeights = Object.entries(goalWeights).sort(([, a], [, b]) => b - a).filter(([, weight]) => weight >= 0.3);
  console.log("  - Sorted weights above 0.3 threshold:", sortedWeights);
  for (const [goal, weight] of sortedWeights) {
    const percentage = Math.round(weight * 100);
    if (weight >= 0.7) {
      enhancedPrompt += `
- VERY HIGH PRIORITY (${percentage}%): ${getWeightDescription(goal)}`;
      console.log(`  - Added VERY HIGH priority for ${goal}: ${percentage}%`);
    } else if (weight >= 0.5) {
      enhancedPrompt += `
- HIGH PRIORITY (${percentage}%): ${getWeightDescription(goal)}`;
      console.log(`  - Added HIGH priority for ${goal}: ${percentage}%`);
    } else if (weight >= 0.3) {
      enhancedPrompt += `
- MODERATE PRIORITY (${percentage}%): ${getWeightDescription(goal)}`;
      console.log(`  - Added MODERATE priority for ${goal}: ${percentage}%`);
    }
  }
  if (heroIngredients.length > 0) {
    enhancedPrompt += `

\u{1F3AF} SMART INGREDIENT STRATEGY:`;
    enhancedPrompt += `
Incorporate 2-3 of these cost-effective versatile ingredients: ${heroIngredients.join(", ")}`;
    enhancedPrompt += `
These ingredients maximize value and work across multiple cuisines.`;
  }
  enhancedPrompt += `

\u{1F3AF} INTELLIGENT OBJECTIVE OVERLAP:`;
  enhancedPrompt += `
Each meal should demonstrate smart overlap of objectives:`;
  enhancedPrompt += `
- Satisfy the main goal (${filters.primaryGoal || "balanced nutrition"}) as primary focus`;
  enhancedPrompt += `
- Use weight priorities to refine choices when multiple options exist`;
  enhancedPrompt += `
- Dietary restrictions remain 100% non-negotiable`;
  enhancedPrompt += `
- Balance cost efficiency with nutritional quality based on weight priorities`;
  enhancedPrompt += `

\u{1F4CB} WEIGHT-BASED IMPLEMENTATION:`;
  enhancedPrompt += `
1. Start with main goal requirements (${filters.primaryGoal || "balanced nutrition"})`;
  enhancedPrompt += `
2. When choosing between similar options, prioritize higher-weighted objectives`;
  enhancedPrompt += `
3. Ensure final meals are practical and appealing to the target family`;
  enhancedPrompt += `
4. Use weights for smart trade-offs, not rigid constraints`;
  return enhancedPrompt;
}
function getWeightDescription(goal) {
  const descriptions = {
    cost: "Cost savings through smart ingredient choices and reuse",
    health: "Nutritional density and balanced macronutrients",
    cultural: "Incorporate authentic cultural flavors and techniques",
    time: "Minimize prep and cooking time for efficiency",
    variety: "Use diverse ingredients and cooking methods"
  };
  return descriptions[goal] || "Balanced approach";
}
function getUnifiedGoal2(goalValue) {
  return UNIFIED_GOALS2.find((goal) => goal.value.toLowerCase() === goalValue.toLowerCase()) || null;
}
function applyPrimaryGoalLogic2(primaryGoal, filters) {
  const unifiedGoal = getUnifiedGoal2(primaryGoal);
  if (unifiedGoal) {
    let prompt = ` ${unifiedGoal.prompts[0].toLowerCase().replace(":", "")}`;
    const goalPrompts = unifiedGoal.prompts.slice(1).map((p) => `
- ${p}`).join("");
    prompt += goalPrompts;
    const adjustedFilters = {
      ...unifiedGoal.filterAdjustments,
      nutritionGoal: unifiedGoal.nutritionFocus
    };
    return { prompt, adjustedFilters };
  }
  return {
    prompt: ` with balanced nutrition and practical meal planning`,
    adjustedFilters: {
      availableIngredientUsagePercent: 60,
      nutritionGoal: "general_wellness"
    }
  };
}
function extractFamilyDietaryNeeds2(familyMembers) {
  const allPreferences = familyMembers.flatMap((m) => m.preferences);
  const allGoals = familyMembers.flatMap((m) => m.goals);
  const preferences = [...new Set(allPreferences)];
  const goals = [...new Set(allGoals)];
  const restrictions = preferences.filter(
    (pref) => pref.toLowerCase().includes("gluten-free") || pref.toLowerCase().includes("dairy-free") || pref.toLowerCase().includes("vegan") || pref.toLowerCase().includes("vegetarian") || pref.toLowerCase().includes("keto") || pref.toLowerCase().includes("paleo")
  );
  return { preferences, restrictions, goals };
}
function enhanceMealWithIntelligentTiming2(meal) {
  if (!meal.ingredients || !meal.title) {
    return meal;
  }
  const recipe = {
    title: meal.title,
    ingredients: meal.ingredients,
    instructions: meal.instructions || [],
    servings: 4
  };
  const calculation = calculateCookingTimeAndDifficulty(recipe);
  return {
    ...meal,
    cook_time_minutes: calculation.totalMinutes,
    prep_time_minutes: calculation.prepTime,
    actual_cook_time_minutes: calculation.cookTime,
    difficulty: calculation.difficulty,
    timing_breakdown: calculation.breakdown,
    cooking_recommendations: calculation.recommendations,
    easy_alternatives: getEasyAlternatives(recipe)
  };
}
function validateMealConstraints2(meal, filters) {
  const issues = [];
  const suggestions = [];
  if (meal.cook_time_minutes > filters.cookTime) {
    issues.push(`Cooking time (${meal.cook_time_minutes}min) exceeds limit (${filters.cookTime}min)`);
    suggestions.push("Consider using meal prep techniques to reduce active cooking time");
    suggestions.push("Look for one-pot or sheet pan alternatives");
  }
  if (meal.difficulty > filters.difficulty) {
    issues.push(`Difficulty level (${meal.difficulty}) exceeds preference (${filters.difficulty})`);
    if (meal.easy_alternatives && meal.easy_alternatives.length > 0) {
      suggestions.push(`Easy alternatives: ${meal.easy_alternatives.slice(0, 2).join(", ")}`);
    }
  }
  if (filters.prepTimePreference === "minimal" && meal.prep_time_minutes > 15) {
    issues.push("High prep time may not suit minimal prep preference");
    suggestions.push("Consider using pre-cut vegetables or convenience ingredients");
  }
  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  };
}
function getDifficultyAdjustedPromptSuffix2(difficulty) {
  let suffix = "\n\nCOOKING TIME GUIDANCE:";
  switch (difficulty) {
    case 1:
      suffix += "\n- Focus on simple, quick-prep ingredients";
      suffix += "\n- Prioritize one-pot or microwave-friendly meals";
      suffix += "\n- Minimal knife work required";
      break;
    case 2:
      suffix += "\n- Basic cooking methods (saute, boil, bake)";
      suffix += "\n- Some prep work acceptable (chopping, mixing)";
      suffix += "\n- Simple timing coordination";
      break;
    case 3:
      suffix += "\n- Multiple cooking methods can be combined";
      suffix += "\n- Moderate prep time and ingredient complexity";
      suffix += "\n- Basic timing and temperature control";
      break;
    case 4:
      suffix += "\n- Advanced techniques welcome (searing, reducing, etc.)";
      suffix += "\n- Complex ingredient preparation acceptable";
      suffix += "\n- Multi-step processes with timing coordination";
      break;
    case 5:
      suffix += "\n- Professional-level techniques encouraged";
      suffix += "\n- Complex preparations and advanced skills";
      suffix += "\n- Precise timing and temperature control required";
      break;
  }
  suffix += "\n\nIMPORTANT: Provide realistic cook_time_minutes that includes both prep and cooking time.";
  return suffix;
}
async function generateEnhancedMealPlan2(filters) {
  const enhancedService = new EnhancedRecipeGenerationService();
  console.log("\u{1F680} Using Enhanced Recipe Generation System");
  console.log(`Target: ${filters.difficulty}/5 difficulty, ${filters.cookTime}min max time`);
  try {
    const result = await enhancedService.generateMealPlan(filters);
    if (result.success) {
      console.log(`\u2705 Enhanced generation complete - Time accuracy: ${result.metadata.timingAccuracy}%`);
      return {
        success: true,
        data: result.data,
        metadata: {
          ...result.metadata,
          enhancedSystem: true,
          preAnalysisUsed: Object.keys(result.metadata.preAnalysis).length > 0
        }
      };
    } else {
      console.log("\u274C Enhanced generation failed, falling back to standard system");
      return generateStandardMealPlan2(filters);
    }
  } catch (error) {
    console.error("Enhanced generation error:", error);
    return generateStandardMealPlan2(filters);
  }
}
function generateStandardMealPlan2(filters) {
  console.log("\u{1F4DD} Using Standard Recipe Generation System (fallback)");
  const prompt = buildIntelligentPrompt2(filters);
  return {
    success: true,
    prompt,
    metadata: {
      generatedAt: /* @__PURE__ */ new Date(),
      enhancedSystem: false,
      calculatorVersion: "1.0"
    }
  };
}
async function buildEnhancedIntelligentPrompt2(filters) {
  const enhancedService = new EnhancedRecipeGenerationService();
  try {
    const mealAnalysis = await enhancedService.analyzeMealRequirements(filters);
    let enhancedPrompt = buildIntelligentPrompt2(filters);
    enhancedPrompt += `

\u{1F9E0} ENHANCED MEAL-SPECIFIC GUIDANCE:`;
    Object.entries(mealAnalysis).forEach(([mealType, analysis]) => {
      enhancedPrompt += `
${mealType.toUpperCase()}:`;
      enhancedPrompt += `
- Target complexity: ${analysis.targetComplexity}/5`;
      enhancedPrompt += `
- Target time: ${analysis.estimatedTime} minutes`;
      enhancedPrompt += `
- Time breakdown: ${analysis.timeBreakdown.slice(0, 2).join(", ")}`;
      if (!analysis.feasible) {
        enhancedPrompt += `
- \u26A0\uFE0F IMPORTANT: Simplify - current estimates exceed time limit`;
      }
    });
    enhancedPrompt += `

\u23F1\uFE0F ENHANCED TIME ACCURACY REQUIREMENTS:`;
    enhancedPrompt += `
- CRITICAL: cook_time_minutes must include BOTH prep AND cooking time`;
    enhancedPrompt += `
- Provide time breakdown: "X min prep + Y min cook = Z min total"`;
    enhancedPrompt += `
- Account for difficulty level ${filters.difficulty} skill requirements`;
    enhancedPrompt += `
- Be realistic for home cooks, not professional kitchens`;
    return enhancedPrompt;
  } catch (error) {
    console.warn("Enhanced prompt building failed, using standard prompt:", error);
    return buildIntelligentPrompt2(filters);
  }
}
function validateEnhancedMealPlan2(mealPlan, filters) {
  const issues = [];
  const suggestions = [];
  let timeAccurateCount = 0;
  let complexityAccurateCount = 0;
  let totalMeals = 0;
  if (!mealPlan.meal_plan) {
    return {
      isValid: false,
      accuracy: { timingAccuracy: 0, complexityAccuracy: 0 },
      issues: ["Missing meal_plan structure"],
      suggestions: ["Ensure response follows correct JSON format"]
    };
  }
  for (const dayKey in mealPlan.meal_plan) {
    const day = mealPlan.meal_plan[dayKey];
    for (const mealType in day) {
      const meal = day[mealType];
      totalMeals++;
      if (meal.cook_time_minutes <= filters.cookTime) {
        timeAccurateCount++;
      } else {
        issues.push(`${mealType} exceeds time limit: ${meal.cook_time_minutes}min > ${filters.cookTime}min`);
      }
      if (meal.difficulty <= filters.difficulty) {
        complexityAccurateCount++;
      } else {
        issues.push(`${mealType} exceeds difficulty: ${meal.difficulty} > ${filters.difficulty}`);
      }
      if (!meal.time_breakdown) {
        issues.push(`${mealType} missing time breakdown`);
        suggestions.push('Add time breakdown format: "X min prep + Y min cook"');
      }
    }
  }
  const timingAccuracy = totalMeals > 0 ? Math.round(timeAccurateCount / totalMeals * 100) : 0;
  const complexityAccuracy = totalMeals > 0 ? Math.round(complexityAccurateCount / totalMeals * 100) : 0;
  return {
    isValid: issues.length === 0,
    accuracy: { timingAccuracy, complexityAccuracy },
    issues,
    suggestions
  };
}
async function addConflictResolutionGuidance2(filters) {
  let guidance = ``;
  const allDietaryRestrictions = [];
  if (filters.dietaryRestrictions) {
    allDietaryRestrictions.push(filters.dietaryRestrictions);
  }
  if (filters.familyMembers && filters.familyMembers.length > 0) {
    const familyRestrictions = filters.familyMembers.flatMap((member) => member.preferences).filter(
      (pref) => pref.toLowerCase().includes("vegetarian") || pref.toLowerCase().includes("vegan") || pref.toLowerCase().includes("gluten-free") || pref.toLowerCase().includes("dairy-free") || pref.toLowerCase().includes("halal") || pref.toLowerCase().includes("kosher") || pref.toLowerCase().includes("keto") || pref.toLowerCase().includes("paleo")
    );
    allDietaryRestrictions.push(...familyRestrictions);
  }
  const uniqueRestrictions = [...new Set(allDietaryRestrictions)];
  if (uniqueRestrictions.length === 0 || !filters.culturalBackground || filters.culturalBackground.length === 0) {
    return guidance;
  }
  console.log(`\u{1F50D} Checking for conflicts between cultural background [${filters.culturalBackground.join(", ")}] and dietary restrictions [${uniqueRestrictions.join(", ")}]`);
  const culturalDishes = getCulturalDishExamples2(filters.culturalBackground);
  let hasConflicts = false;
  const conflictResolutions = [];
  for (const dish of culturalDishes) {
    if (hasQuickConflict(dish, uniqueRestrictions)) {
      hasConflicts = true;
      try {
        const resolution = await resolveDietaryCulturalConflicts(
          dish,
          uniqueRestrictions,
          filters.culturalBackground
        );
        if (resolution.suggestedAlternatives.length > 0) {
          const bestAlternative = resolution.suggestedAlternatives[0];
          conflictResolutions.push(
            `Instead of "${dish}", suggest "${bestAlternative.dishName}" (${bestAlternative.description})`
          );
        }
      } catch (error) {
        console.error(`Error resolving conflict for ${dish}:`, error);
      }
    }
  }
  if (hasConflicts) {
    guidance += `

\u{1F527} DIETARY-CULTURAL CONFLICT RESOLUTION:`;
    guidance += `
- CRITICAL: Some traditional dishes conflict with dietary restrictions`;
    guidance += `
- Use these culturally authentic alternatives that comply with dietary needs:`;
    for (const resolution of conflictResolutions.slice(0, 5)) {
      guidance += `
  \u2022 ${resolution}`;
    }
    guidance += `
- Maintain cultural authenticity by using traditional cooking methods and spices`;
    guidance += `
- Focus on dishes that naturally align with dietary restrictions rather than heavily modified versions`;
    guidance += `
- When suggesting alternatives, explain the cultural context and preparation method`;
  }
  return guidance;
}
function getCulturalDishExamples2(culturalBackground) {
  const culturalDishes = {
    "Chinese": ["beef stir-fry", "pork dumplings", "chicken fried rice", "shrimp lo mein"],
    "Italian": ["chicken parmesan", "beef bolognese", "cheese pizza", "carbonara pasta"],
    "Mexican": ["beef tacos", "chicken quesadilla", "pork carnitas", "cheese enchiladas"],
    "Indian": ["chicken curry", "lamb biryani", "paneer makhani", "beef vindaloo"],
    "Japanese": ["chicken teriyaki", "beef sukiyaki", "pork ramen", "fish tempura"],
    "Thai": ["pad thai with shrimp", "green curry with chicken", "pork larb", "beef massaman"],
    "Korean": ["beef bulgogi", "pork kimchi stew", "chicken bibimbap", "seafood pancake"],
    "Vietnamese": ["beef pho", "pork banh mi", "chicken vermicelli", "fish curry"],
    "Greek": ["lamb gyros", "chicken souvlaki", "feta cheese salad", "beef moussaka"],
    "Lebanese": ["lamb kebab", "chicken shawarma", "hummus with pita", "beef kibbeh"],
    "French": ["coq au vin", "beef bourguignon", "cheese souffle", "duck confit"]
  };
  const examples = [];
  for (const culture of culturalBackground) {
    const dishes = culturalDishes[culture];
    if (dishes) {
      examples.push(...dishes.slice(0, 3));
    }
  }
  return examples;
}
function addBasicCulturalDataFallback(filters) {
  let culturalContent = "";
  for (const culture of filters.culturalBackground) {
    if (filters.culturalCuisineData[culture]) {
      const cultureData = filters.culturalCuisineData[culture];
      const mealNames = cultureData.meals ? cultureData.meals.map((meal) => meal.name).slice(0, 3) : [];
      const keyIngredients = cultureData.key_ingredients ? cultureData.key_ingredients.slice(0, 5) : [];
      const cookingStyles = cultureData.styles ? cultureData.styles.slice(0, 3) : [];
      if (mealNames.length > 0) {
        culturalContent += `
- ${culture} dishes to consider: ${mealNames.join(", ")}`;
      }
      if (culture.toLowerCase() === "peruvian") {
        culturalContent += `
- Peruvian flavor profile: Aji amarillo (yellow chili), cumin, cilantro, lime, garlic`;
        culturalContent += `
- Peruvian ingredients: Quinoa, potatoes, corn, plantains, yuca, black beans, fish/seafood`;
        culturalContent += `
- Peruvian techniques: Marinating with citrus, anticuchos grilling, stir-frying (saltado style)`;
        culturalContent += `
- Peruvian adaptations: Add aji amarillo to sauces, use lime in marinades, incorporate quinoa and potatoes`;
      }
      if (keyIngredients.length > 0) {
        culturalContent += `
- ${culture} key ingredients: ${keyIngredients.join(", ")}`;
      }
      if (cookingStyles.length > 0) {
        culturalContent += `
- ${culture} cooking styles: ${cookingStyles.join(", ")}`;
      }
      if (cultureData.meals && cultureData.meals.length > 0) {
        const healthyMods = cultureData.meals.flatMap((meal) => meal.healthy_mods || []).slice(0, 3);
        if (healthyMods.length > 0) {
          culturalContent += `
- ${culture} healthy modifications: ${healthyMods.join(", ")}`;
        }
      }
    }
  }
  return culturalContent;
}
var UNIFIED_GOALS2;
var init_intelligentPromptBuilderV2 = __esm({
  "server/intelligentPromptBuilderV2.ts"() {
    "use strict";
    init_cookingTimeCalculator();
    init_enhancedRecipeGenerationService();
    init_dietaryCulturalConflictResolver();
    UNIFIED_GOALS2 = [
      {
        value: "Save Money",
        label: "\u{1F4B8} Save Money",
        nutritionFocus: "general_wellness",
        prompts: [
          "Generate a cost-effective meal plan that reduces food expenses through strategic ingredient overlap and simplicity",
          "Use a small set of base ingredients repeatedly across meals to minimize waste and maximize value",
          "Focus on affordable, versatile staples (e.g., beans, rice, eggs, seasonal produce)",
          "Structure the plan for [number] main meals per day, with batch-prep options and clear storage instructions",
          "For each meal, list ingredients, estimated cost, and preparation steps",
          "The plan should be low-waste, scalable, and easy to prepare in advance"
        ],
        filterAdjustments: {
          encourageOverlap: true,
          availableIngredientUsagePercent: 80,
          budgetConstraints: "low",
          varietyPreference: "consistent"
        }
      },
      {
        value: "Eat Healthier",
        label: "\u{1F34E} Eat Healthier",
        nutritionFocus: "general_wellness",
        prompts: [
          "Create a daily meal plan focused on long-term food quality and better daily choices",
          "Each meal should promote nourishment, food diversity, and satiety, using simple and consistent recipes",
          "Include a variety of whole foods: vegetables, fruits, whole grains, lean proteins, and healthy fats",
          "Structure the plan with [number] main meals, with clear portion guidance",
          "For each meal, provide a brief description, ingredients, and preparation steps",
          "The goal is to reinforce healthy eating patterns that gradually reshape meal habits"
        ],
        filterAdjustments: {
          encourageOverlap: false,
          availableIngredientUsagePercent: 50,
          varietyPreference: "high_variety"
        }
      },
      {
        value: "Gain Muscle",
        label: "\u{1F3CB}\uFE0F Build Muscle",
        nutritionFocus: "muscle_gain",
        prompts: [
          "Generate a structured daily meal plan for a user training regularly to build muscle",
          "Meals should emphasize foods naturally rich in protein, complex carbohydrates, and healthy fats to support muscle growth and recovery",
          "Prioritize nutrient-dense, satisfying foods that aid physical repair and consistent energy",
          "Structure the plan with [number] main meals, spaced to fuel workouts and recovery periods",
          "Each meal should include portion sizes, estimated protein content, calorie estimates, and preparation instructions",
          "Include a variety of lean proteins (e.g., chicken, fish, tofu, legumes), whole grains, and colorful vegetables",
          "The plan should promote steady nourishment, muscle repair, and strength gains throughout the day"
        ],
        filterAdjustments: {
          encourageOverlap: true,
          availableIngredientUsagePercent: 60,
          prepTimePreference: "moderate"
        }
      },
      {
        value: "Lose Weight",
        label: "\u2696\uFE0F Lose Weight",
        nutritionFocus: "weight_loss",
        prompts: [
          "Generate a structured daily meal plan for a user aiming to reduce body fat while staying satisfied and energized",
          "Meals should support a lower total calorie intake but maintain high food volume and routine",
          "Use foods that are filling, high in fiber or protein, and take time to eat and digest",
          "Structure the plan to include [number] main meals, spaced evenly throughout the day",
          "Each meal should include portion sizes, calorie estimates, and preparation instructions",
          "Avoid high-calorie, low-volume foods and minimize added sugars and processed fats",
          "The plan should naturally reduce overconsumption through meal timing, food choices, and eating rhythm"
        ],
        filterAdjustments: {
          encourageOverlap: false,
          availableIngredientUsagePercent: 60,
          varietyPreference: "high_variety",
          prepTimePreference: "minimal"
        }
      },
      {
        value: "Family Nutrition",
        label: "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466} Family Nutrition",
        nutritionFocus: "general_wellness",
        prompts: [
          "FAMILY-FRIENDLY: Create meals that appeal to all family members",
          "Include kid-friendly options that are still nutritious",
          "Balance adult nutrition needs with children's preferences",
          "Ensure appropriate portions for different age groups"
        ],
        filterAdjustments: {
          encourageOverlap: true,
          availableIngredientUsagePercent: 65,
          varietyPreference: "moderate"
        }
      },
      {
        value: "Energy & Performance",
        label: "\u26A1 Energy & Performance",
        nutritionFocus: "energy_performance",
        prompts: [
          "Design a meal plan to sustain steady energy and focus for a physically and mentally active user",
          "Emphasize meals with balanced macronutrients and a steady release of energy (complex carbs, lean proteins, healthy fats)",
          "Structure the plan with [number] main meals, timed to align with periods of activity and rest",
          "Avoid foods that cause energy spikes or crashes (e.g., high sugar, refined carbs)",
          "For each meal, provide a description, ingredients, and timing guidance",
          "The plan should support reliable energy, focus, and performance throughout the day"
        ],
        filterAdjustments: {
          availableIngredientUsagePercent: 60,
          prepTimePreference: "enjoys_cooking"
        }
      },
      {
        value: "Digestive Health",
        label: "\u{1F966} Digestive Health",
        nutritionFocus: "digestive_health",
        prompts: [
          "Create a meal plan that promotes digestive comfort, ease, and regularity",
          "Meals should be light, soft, and simple, using easily digestible ingredients and gentle cooking methods",
          "Include fiber-rich foods and fermented items",
          "Structure the plan with [number] main meals, spaced for natural digestive pacing",
          "For each meal, provide a description, ingredients, and preparation steps",
          "The goal is to reduce digestive strain and support regular, comfortable digestion"
        ],
        filterAdjustments: {
          availableIngredientUsagePercent: 60,
          varietyPreference: "moderate"
        }
      }
    ];
  }
});

// server/cuisineMasterlistMigration.ts
import fs2 from "fs";
import path2 from "path";
async function loadMasterlist(preferV2 = true) {
  const basePath = path2.join(process.cwd(), "client", "src", "data");
  if (preferV2) {
    try {
      const v2Path = path2.join(basePath, "cultural_cuisine_masterlist_v2.json");
      const v2Data = await fs2.promises.readFile(v2Path, "utf-8");
      return JSON.parse(v2Data);
    } catch (error) {
      console.log("\u{1F4C4} V2 masterlist not found, falling back to legacy format");
    }
  }
  const legacyPath = path2.join(basePath, "cultural_cuisine_masterlist.json");
  const legacyData = await fs2.promises.readFile(legacyPath, "utf-8");
  return JSON.parse(legacyData);
}
var init_cuisineMasterlistMigration = __esm({
  "server/cuisineMasterlistMigration.ts"() {
    "use strict";
  }
});

// server/nlpCultureParser.ts
var nlpCultureParser_exports = {};
__export(nlpCultureParser_exports, {
  clearParseCache: () => clearParseCache,
  getCacheSize: () => getCacheSize,
  getParserStats: () => getParserStats,
  nlpCultureParser: () => nlpCultureParser
});
async function nlpCultureParser(textInput, options = {}) {
  const startTime = Date.now();
  const normalizedInput = normalizeInput(textInput);
  try {
    if (options.enableCaching !== false) {
      const cached = getCachedResult(normalizedInput);
      if (cached && !options.forceRefresh) {
        console.log(`\u{1F3AF} NLP cache hit for input: "${textInput.substring(0, 50)}..."`);
        return { ...cached, processingTime: Date.now() - startTime };
      }
    }
    console.log(`\u{1F9E0} Processing cultural input: "${textInput.substring(0, 100)}..."`);
    const masterlist = await loadCuisineMasterlist();
    let result;
    let fallbackUsed = false;
    if (PARSER_CONFIG.USE_CLAUDE) {
      result = await parseWithClaude(normalizedInput, masterlist, startTime);
    } else {
      result = await parseWithPatternMatching(normalizedInput, masterlist, startTime);
      fallbackUsed = true;
    }
    if (options.enableCaching !== false) {
      setCachedResult(normalizedInput, result);
    }
    console.log(`\u2705 NLP parsing complete: ${result.cultureTags.length} cultures detected (confidence: ${result.confidence})`);
    return { ...result, fallbackUsed };
  } catch (error) {
    console.error("\u{1F6A8} Error in NLP culture parser:", error);
    if (PARSER_CONFIG.FALLBACK_TO_PATTERN_MATCHING) {
      console.log("\u{1F504} Attempting fallback pattern matching...");
      try {
        const masterlist = await loadCuisineMasterlist();
        const fallbackResult = await parseWithPatternMatching(normalizedInput, masterlist, startTime);
        return { ...fallbackResult, fallbackUsed: true };
      } catch (fallbackError) {
        console.error("\u{1F4A5} Fallback parsing also failed:", fallbackError);
      }
    }
    return {
      cultureTags: [],
      needsManualReview: true,
      confidence: 0,
      processingTime: Date.now() - startTime,
      fallbackUsed: true
    };
  }
}
async function parseWithClaude(input, masterlist, startTime) {
  const availableCuisines = masterlist.map((c) => `${c.label} (${c.aliases.join(", ")})`).join("\n");
  const prompt = `You are an expert in cultural cuisine identification. Parse the user's input to identify their cultural culinary background.

User Input: "${input}"

Available Cuisine Categories:
${availableCuisines}

Instructions:
1. Identify up to 3 most relevant cultural cuisines from the user's input
2. Use EXACT labels from the available categories (e.g., "Italian", "Chinese", "Mexican")
3. Consider aliases and regional variations (e.g., "Sicilian" \u2192 "Italian", "Cantonese" \u2192 "Chinese")
4. Look for cultural indicators: family heritage, geographic mentions, specific dishes, cooking styles
5. Assign confidence scores (0.0-1.0) based on clarity of cultural indicators
6. If input is too vague or unrelated to food culture, return empty arrays
7. ENHANCED: For each detected culture, also extract structured cuisine data

For each detected culture, extract this structured data:
- Staple dishes (top 5-10), short description, and primary ingredients
- Most common proteins, carbs, and vegetables used in home-cooking
- Typical meal structure (what's for breakfast, lunch, dinner, snacks)
- Any notable healthy swaps or lighter/common "diet" versions locals use
- Regional flavor profiles and signature seasonings
- Important cultural dietary restrictions or traditions (if any)
- Popular cooking methods (e.g. stir-fry, stewing, baking, grilling)

Examples:
- "My grandmother from Sicily makes the best pasta" \u2192 Italian (0.9)
- "We love Korean BBQ and my mom is from Seoul" \u2192 Korean (0.95)
- "Mixed family - dad's Mexican, mom's Chinese" \u2192 Mexican (0.8), Chinese (0.8)
- "I like healthy food" \u2192 [] (too vague)

Return JSON in this exact format:
{
  "primary_cultures": ["Culture1", "Culture2"],
  "confidence_scores": [0.8, 0.7],
  "detected_keywords": ["keyword1", "keyword2"],
  "regional_indicators": ["region1", "region2"],
  "dietary_context": ["context1", "context2"],
  "cuisine_data": {
    "Culture1": {
      "staple_dishes": [{"name": "dish", "description": "brief desc", "ingredients": ["ing1", "ing2"]}],
      "common_proteins": ["protein1", "protein2"],
      "common_carbs": ["carb1", "carb2"], 
      "common_vegetables": ["veg1", "veg2"],
      "meal_structure": {
        "breakfast": ["typical breakfast foods"],
        "lunch": ["typical lunch foods"],
        "dinner": ["typical dinner foods"],
        "snacks": ["typical snacks"]
      },
      "healthy_swaps": [{"original": "food", "swap": "healthier version"}],
      "flavor_profiles": ["flavor1", "flavor2"],
      "signature_seasonings": ["seasoning1", "seasoning2"],
      "dietary_restrictions": ["restriction1", "restriction2"],
      "cooking_methods": ["method1", "method2"]
    }
  }
}`;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });
  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  try {
    const responseContent = data.content[0].text;
    console.log(`\u{1F4DD} Claude raw response: ${responseContent.substring(0, 200)}...`);
    const cleanedContent = responseContent.replace(/```json\n?|\n?```/g, "").trim();
    const parsedIntent = JSON.parse(cleanedContent);
    const cultureTags = validateAndMapCultures(parsedIntent.primary_cultures || [], masterlist);
    const avgConfidence = parsedIntent.confidence_scores?.length > 0 ? parsedIntent.confidence_scores.reduce((a, b) => a + b, 0) / parsedIntent.confidence_scores.length : 0;
    const needsManualReview = cultureTags.length === 0 || avgConfidence < PARSER_CONFIG.MIN_CONFIDENCE;
    return {
      cultureTags,
      needsManualReview,
      confidence: Math.round(avgConfidence * 100) / 100,
      detectedRegions: parsedIntent.regional_indicators,
      suggestedAliases: extractAliasesForCultures(cultureTags, masterlist),
      processingTime: Date.now() - startTime,
      fallbackUsed: false,
      cuisineData: parsedIntent.cuisine_data
    };
  } catch (parseError) {
    console.error("\u{1F6A8} Failed to parse Claude response:", parseError);
    throw new Error(`Claude response parsing failed: ${parseError}`);
  }
}
async function parseWithPatternMatching(input, masterlist, startTime) {
  console.log("\u{1F50D} Using pattern matching fallback for cultural parsing");
  const lowercaseInput = input.toLowerCase();
  const matches = [];
  masterlist.forEach((cuisine) => {
    let score = 0;
    const matchedTerms = [];
    if (lowercaseInput.includes(cuisine.label.toLowerCase())) {
      score += 10;
      matchedTerms.push(cuisine.label);
    }
    cuisine.aliases.forEach((alias) => {
      const aliasLower = alias.toLowerCase();
      if (lowercaseInput.includes(aliasLower)) {
        score += 8;
        matchedTerms.push(alias);
      }
    });
    const contextTerms = extractContextTerms(lowercaseInput, cuisine);
    score += contextTerms.length * 3;
    matchedTerms.push(...contextTerms);
    if (score > 0) {
      matches.push({ culture: cuisine.label, score, matchedTerms });
    }
  });
  matches.sort((a, b) => b.score - a.score);
  const topMatches = matches.slice(0, PARSER_CONFIG.MAX_CULTURES);
  const cultureTags = topMatches.map((m) => m.culture);
  const avgScore = topMatches.length > 0 ? topMatches.reduce((sum, m) => sum + m.score, 0) / topMatches.length : 0;
  const confidence = Math.min(avgScore / 15, 1);
  const needsManualReview = cultureTags.length === 0 || confidence < PARSER_CONFIG.MIN_CONFIDENCE;
  console.log(`\u{1F3AF} Pattern matching found ${cultureTags.length} cultures with confidence ${confidence}`);
  return {
    cultureTags,
    needsManualReview,
    confidence: Math.round(confidence * 100) / 100,
    detectedRegions: topMatches.flatMap((m) => m.matchedTerms),
    suggestedAliases: extractAliasesForCultures(cultureTags, masterlist),
    processingTime: Date.now() - startTime,
    fallbackUsed: true
  };
}
function normalizeInput(input) {
  return input.trim().toLowerCase().replace(/[^\w\s'-]/g, " ").replace(/\s+/g, " ").substring(0, 500);
}
async function loadCuisineMasterlist() {
  if (cachedMasterlist) {
    return cachedMasterlist;
  }
  try {
    const masterlistData = await loadMasterlist(true);
    if ("cuisines" in masterlistData) {
      cachedMasterlist = masterlistData.cuisines.map((cuisine) => ({
        id: cuisine.id,
        label: cuisine.label,
        aliases: cuisine.aliases,
        metadata: cuisine.metadata
      }));
      console.log(`\u{1F4DA} Loaded enhanced v2 masterlist: ${cachedMasterlist.length} cuisines`);
    } else {
      cachedMasterlist = masterlistData;
      console.log(`\u{1F4DA} Loaded legacy masterlist: ${cachedMasterlist.length} cuisines`);
    }
    return cachedMasterlist;
  } catch (error) {
    console.error("\u{1F6A8} Failed to load cuisine masterlist:", error);
    cachedMasterlist = [
      {
        label: "Italian",
        aliases: ["Mediterranean Italian", "Tuscan", "Sicilian"],
        metadata: {
          searchability: { keywords: ["pasta", "pizza", "mediterranean"] },
          characteristics: { key_ingredients: ["olive oil", "tomatoes", "basil"] }
        }
      },
      {
        label: "Mexican",
        aliases: ["Tex-Mex", "Oaxacan", "Yucatecan"],
        metadata: {
          searchability: { keywords: ["spicy", "authentic", "street food"] },
          characteristics: { key_ingredients: ["chiles", "corn", "cilantro"] }
        }
      },
      {
        label: "Chinese",
        aliases: ["Cantonese", "Sichuan", "Mandarin"],
        metadata: {
          searchability: { keywords: ["stir fry", "healthy", "quick"] },
          characteristics: { key_ingredients: ["soy sauce", "ginger", "garlic"] }
        }
      },
      {
        label: "Indian",
        aliases: ["North Indian", "South Indian", "Bengali"],
        metadata: {
          searchability: { keywords: ["curry", "spicy", "vegetarian"] },
          characteristics: { key_ingredients: ["cumin", "turmeric", "garam masala"] }
        }
      },
      {
        label: "Japanese",
        aliases: ["Washoku", "Traditional Japanese"],
        metadata: {
          searchability: { keywords: ["healthy", "fresh", "minimalist"] },
          characteristics: { key_ingredients: ["soy sauce", "miso", "rice"] }
        }
      }
    ];
    return cachedMasterlist;
  }
}
function validateAndMapCultures(cultures, masterlist) {
  const validCultures = [];
  cultures.forEach((culture) => {
    const directMatch = masterlist.find((c) => c.label.toLowerCase() === culture.toLowerCase());
    if (directMatch) {
      validCultures.push(directMatch.label);
      return;
    }
    const aliasMatch = masterlist.find(
      (c) => c.aliases.some((alias) => alias.toLowerCase() === culture.toLowerCase())
    );
    if (aliasMatch) {
      validCultures.push(aliasMatch.label);
      return;
    }
    const fuzzyMatch = masterlist.find(
      (c) => c.label.toLowerCase().includes(culture.toLowerCase()) || culture.toLowerCase().includes(c.label.toLowerCase()) || c.aliases.some(
        (alias) => alias.toLowerCase().includes(culture.toLowerCase()) || culture.toLowerCase().includes(alias.toLowerCase())
      )
    );
    if (fuzzyMatch) {
      validCultures.push(fuzzyMatch.label);
    }
  });
  return [...new Set(validCultures)];
}
function extractContextTerms(input, cuisine) {
  const contextTerms = [];
  if (cuisine.metadata?.characteristics) {
    const { key_ingredients, signature_dishes } = cuisine.metadata.characteristics;
    key_ingredients?.forEach((ingredient) => {
      if (input.toLowerCase().includes(ingredient.toLowerCase())) {
        contextTerms.push(ingredient);
      }
    });
    signature_dishes?.forEach((dish) => {
      if (input.toLowerCase().includes(dish.toLowerCase())) {
        contextTerms.push(dish);
      }
    });
  }
  if (cuisine.metadata?.searchability?.keywords) {
    cuisine.metadata.searchability.keywords.forEach((keyword) => {
      if (input.toLowerCase().includes(keyword.toLowerCase())) {
        contextTerms.push(keyword);
      }
    });
  }
  const cultureContexts = {
    "Italian": ["pasta", "pizza", "risotto", "gelato", "parmesan", "basil", "olive oil", "rome", "italy", "milan", "nonna"],
    "Mexican": ["tacos", "salsa", "guacamole", "mole", "tortilla", "mexico", "oaxaca", "puebla", "abuela"],
    "Chinese": ["rice", "noodles", "wok", "soy sauce", "dim sum", "china", "beijing", "shanghai", "taiwan"],
    "Indian": ["curry", "spices", "naan", "biryani", "turmeric", "india", "mumbai", "delhi", "bollywood"],
    "Japanese": ["sushi", "ramen", "miso", "sake", "tempura", "japan", "tokyo", "kyoto", "washoku"],
    "Korean": ["kimchi", "bulgogi", "bibimbap", "korea", "seoul", "korean bbq"],
    "Thai": ["pad thai", "curry", "coconut", "thailand", "bangkok", "thai basil"],
    "Vietnamese": ["pho", "banh mi", "vietnam", "saigon", "vietnamese"],
    "Southern US": ["fried chicken", "gumbo", "cornbread", "bbq", "south", "louisiana", "texas"],
    "French": ["wine", "cheese", "baguette", "croissant", "france", "paris", "provence"],
    "Greek": ["feta", "olives", "yogurt", "greece", "athens", "mediterranean"],
    "Ethiopian": ["injera", "berbere", "ethiopia", "addis ababa", "east africa"],
    "Lebanese": ["hummus", "tabbouleh", "lebanon", "beirut", "middle east"],
    "Peruvian": ["quinoa", "ceviche", "peru", "lima", "andes", "south america"]
  };
  if (contextTerms.length === 0) {
    const fallbackTerms = cultureContexts[cuisine.label] || [];
    fallbackTerms.forEach((term) => {
      if (input.toLowerCase().includes(term.toLowerCase())) {
        contextTerms.push(term);
      }
    });
  }
  return [...new Set(contextTerms)];
}
function extractAliasesForCultures(cultures, masterlist) {
  const aliases = [];
  cultures.forEach((culture) => {
    const def = masterlist.find((c) => c.label === culture);
    if (def) {
      aliases.push(...def.aliases);
    }
  });
  return aliases;
}
function getCachedResult(input) {
  const cached = parseCache.get(input);
  if (cached && Date.now() - cached.timestamp < PARSER_CONFIG.CACHE_DURATION_MS) {
    return cached.result;
  }
  return null;
}
function setCachedResult(input, result) {
  parseCache.set(input, { result, timestamp: Date.now() });
  if (parseCache.size > 1e3) {
    const now = Date.now();
    for (const [key, value] of parseCache.entries()) {
      if (now - value.timestamp > PARSER_CONFIG.CACHE_DURATION_MS) {
        parseCache.delete(key);
      }
    }
  }
}
function getCacheSize() {
  return parseCache.size;
}
function clearParseCache() {
  parseCache.clear();
  console.log("\u{1F9F9} NLP parse cache cleared");
}
function getParserStats() {
  return {
    cacheSize: parseCache.size,
    masterlistLoaded: cachedMasterlist !== null,
    cacheHitRatio: 0
    // TODO: Implement hit ratio tracking
  };
}
var PARSER_CONFIG, parseCache, cachedMasterlist;
var init_nlpCultureParser = __esm({
  "server/nlpCultureParser.ts"() {
    "use strict";
    init_cuisineMasterlistMigration();
    PARSER_CONFIG = {
      MAX_CULTURES: 3,
      MIN_CONFIDENCE: 0.3,
      MIN_INPUT_LENGTH: 5,
      CACHE_DURATION_MS: 30 * 60 * 1e3,
      // 30 minutes
      USE_CLAUDE: true,
      FALLBACK_TO_PATTERN_MATCHING: true
    };
    parseCache = /* @__PURE__ */ new Map();
    cachedMasterlist = null;
  }
});

// server/routes/save-cultural-meals.ts
var save_cultural_meals_exports = {};
__export(save_cultural_meals_exports, {
  saveCulturalMeals: () => saveCulturalMeals
});
import { eq as eq3, and as and2 } from "drizzle-orm";
async function saveCulturalMeals(req, res) {
  try {
    const userId = 9;
    const { cuisine_name, meals_data, summary_data, custom_name, notes } = req.body;
    if (!cuisine_name || !meals_data || !summary_data) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "cuisine_name, meals_data, and summary_data are required"
      });
    }
    const existingSave = await db.select().from(userSavedCulturalMeals).where(
      and2(
        eq3(userSavedCulturalMeals.user_id, userId),
        eq3(userSavedCulturalMeals.cuisine_name, cuisine_name.toLowerCase())
      )
    ).limit(1);
    if (existingSave.length > 0) {
      const [updatedSave] = await db.update(userSavedCulturalMeals).set({
        meals_data,
        summary_data,
        custom_name: custom_name || `${cuisine_name} Meal Collection`,
        notes,
        updated_at: /* @__PURE__ */ new Date()
      }).where(eq3(userSavedCulturalMeals.id, existingSave[0].id)).returning();
      console.log(`\u2705 Updated saved meals for user ${userId}, cuisine: ${cuisine_name}`);
      return res.json({
        success: true,
        message: `Updated ${cuisine_name} meals in your profile`,
        saved_meals: updatedSave
      });
    } else {
      const [newSave] = await db.insert(userSavedCulturalMeals).values({
        user_id: userId,
        cuisine_name: cuisine_name.toLowerCase(),
        meals_data,
        summary_data,
        custom_name: custom_name || `${cuisine_name} Meal Collection`,
        notes
      }).returning();
      console.log(`\u2705 Saved new meals for user ${userId}, cuisine: ${cuisine_name}`);
      return res.json({
        success: true,
        message: `Saved ${cuisine_name} meals to your profile`,
        saved_meals: newSave
      });
    }
  } catch (error) {
    console.error("\u274C Error saving cultural meals:", error);
    return res.status(500).json({
      error: "Failed to save meals",
      message: "An internal server error occurred while saving your meals"
    });
  }
}
var init_save_cultural_meals = __esm({
  "server/routes/save-cultural-meals.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// server/llamaMealRanker.ts
import fetch4 from "node-fetch";
var LlamaMealRanker, llamaMealRanker;
var init_llamaMealRanker = __esm({
  "server/llamaMealRanker.ts"() {
    "use strict";
    LlamaMealRanker = class {
      apiEndpoint;
      apiKey;
      model = "gpt-4o-mini";
      // OpenAI GPT-4o mini model
      constructor() {
        this.apiEndpoint = "https://api.openai.com/v1/chat/completions";
        this.apiKey = process.env.OPENAI_API_KEY || "";
        if (!this.apiKey) {
          console.warn("\u26A0\uFE0F OPENAI_API_KEY not found. Meal ranking requires API key.");
        }
      }
      /**
       * Rank meals using Llama 3 8B with weight-based intelligence
       */
      async rankMeals(request) {
        const startTime = Date.now();
        console.log(`\u{1F916} Ranking ${request.meals.length} meals with GPT-4o mini`);
        console.log(`\u{1F511} API Key available: ${this.apiKey ? "YES" : "NO"}`);
        console.log(`\u{1F517} Using endpoint: ${this.apiEndpoint}`);
        if (!this.apiKey) {
          throw new Error("OPENAI_API_KEY is required for GPT-4o mini ranking. Fallback system removed.");
        }
        const prompt = this.buildRankingPrompt(request);
        console.log(`\u{1F4DD} Prompt built, calling OpenAI API...`);
        console.log(`\u{1F4CF} Prompt length: ${prompt.length} characters`);
        const apiStartTime = Date.now();
        const response = await this.callLlamaAPI(prompt);
        const apiDuration = Date.now() - apiStartTime;
        console.log(`\u2705 OpenAI API response received in ${apiDuration}ms`);
        console.log(`\u{1F4CA} Response keys: ${Object.keys(response).join(", ")}`);
        const rankedMeals = this.parseRankingResponse(response, request.meals);
        return {
          rankedMeals,
          reasoning: response.reasoning || "Ranked by cultural authenticity, health, cost, and time preferences",
          processingTime: Date.now() - startTime
        };
      }
      /**
       * Build intelligent ranking prompt for AI to score and rank meals
       */
      buildRankingPrompt(request) {
        const { meals, userProfile, maxMeals = 9 } = request;
        const culturalPrefs = Object.entries(userProfile.cultural_preferences).map(([culture, weight]) => `${culture}: ${(weight * 100).toFixed(0)}%`).join(", ");
        const weights = userProfile.priority_weights;
        const weightsList = [
          `Cultural: ${(weights.cultural * 100).toFixed(0)}%`,
          `Health: ${(weights.health * 100).toFixed(0)}%`,
          `Cost: ${(weights.cost * 100).toFixed(0)}%`,
          `Time: ${(weights.time * 100).toFixed(0)}%`
        ].join(", ");
        const mealOptions = meals.slice(0, 15).map((mealScore, index2) => {
          const meal = mealScore.meal;
          return `${index2 + 1}. "${meal.name}" (${meal.cuisine})
   - Description: ${meal.description}
   - Authenticity Score: ${(meal.authenticity_score * 100).toFixed(0)}%`;
        }).join("\n\n");
        return `You are a meal ranking expert. Score and rank the best ${maxMeals} meals for this user profile.

USER PREFERENCES:
- Cultural Preferences: ${culturalPrefs}
- Priority Weights: ${weightsList}
- Dietary Restrictions: ${userProfile.dietary_restrictions.join(", ") || "None"}

SCORING INSTRUCTIONS:
For each meal, YOU must calculate scores (0-100%) for:
1. Cultural Score: How well it matches user's cultural preference (use authenticity score \xD7 cultural preference)
2. Health Score: Based on cooking method and ingredients (steamed/grilled=high, fried=low, vegetables=high, heavy sauces=low)
3. Cost Score: Based on ingredients (simple ingredients=high, premium ingredients=low)
4. Time Score: Based on preparation complexity (stir-fry/simple=high, slow-cooked/complex=low)

Then calculate Total Score using the user's weights:
Total = (Cultural Weight \xD7 Cultural Score + Health Weight \xD7 Health Score + Cost Weight \xD7 Cost Score + Time Weight \xD7 Time Score) / Sum of Weights

MEAL OPTIONS:
${mealOptions}

CRITICAL: Return ONLY a JSON response with NO calculation strings, NO formulas, NO math expressions.
Use this EXACT format with abbreviated keys to save space:
{
  "meals": [
    {"id": 1, "cs": 85, "hs": 70, "cos": 90, "ts": 60, "tot": 78}
  ],
  "reason": "Brief explanation"
}

Keys: cs=cultural score, hs=health score, cos=cost score, ts=time score, tot=total score
Score ALL ${maxMeals} meals. Numbers only, NO text in meal objects.`;
      }
      /**
       * Call OpenAI API for GPT-4o mini inference
       */
      async callLlamaAPI(prompt) {
        const response = await fetch4(this.apiEndpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              {
                role: "system",
                content: "You are a meal ranking expert. Respond only with valid JSON."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            max_tokens: 2500,
            temperature: 0.3,
            // Low temperature for consistent ranking
            response_format: { type: "json_object" }
            // Force JSON response for GPT-4o mini
          })
        });
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorBody}`);
        }
        const data = await response.json();
        const content = data.choices[0].message.content;
        try {
          return JSON.parse(content);
        } catch (parseError) {
          console.error("Failed to parse OpenAI response:", content);
          throw new Error("Invalid JSON response from OpenAI");
        }
      }
      /**
       * Parse AI response and create scored meals
       */
      parseRankingResponse(aiResponse, originalMeals) {
        if (aiResponse.ranked_meal_ids) {
          const rankedMeals2 = [];
          for (const mealId of aiResponse.ranked_meal_ids) {
            const mealIndex = mealId - 1;
            if (mealIndex >= 0 && mealIndex < originalMeals.length) {
              rankedMeals2.push(originalMeals[mealIndex]);
            }
          }
          return rankedMeals2;
        }
        const mealsArray = aiResponse.meals || aiResponse.ranked_meals;
        if (!Array.isArray(mealsArray)) {
          console.error("Invalid AI response format:", aiResponse);
          throw new Error("No meals array found in AI response");
        }
        const rankedMeals = [];
        for (const meal of mealsArray) {
          const mealIndex = meal.id - 1;
          if (mealIndex >= 0 && mealIndex < originalMeals.length) {
            const originalMeal = originalMeals[mealIndex];
            let culturalScore, healthScore, costScore, timeScore, totalScore;
            if (meal.cs !== void 0) {
              culturalScore = meal.cs;
              healthScore = meal.hs;
              costScore = meal.cos;
              timeScore = meal.ts;
              totalScore = meal.tot;
            } else if (meal.scores) {
              culturalScore = meal.scores.cultural;
              healthScore = meal.scores.health;
              costScore = meal.scores.cost;
              timeScore = meal.scores.time;
              totalScore = meal.total_score;
            } else {
              console.warn("Unknown meal format:", meal);
              continue;
            }
            const aiScoredMeal = {
              meal: originalMeal.meal,
              total_score: totalScore / 100,
              // Convert from percentage to 0-1
              component_scores: {
                cultural_score: culturalScore / 100,
                health_score: healthScore / 100,
                cost_score: costScore / 100,
                time_score: timeScore / 100
              },
              ranking_explanation: `AI Score: ${totalScore}% (C:${culturalScore}% H:${healthScore}% $:${costScore}% T:${timeScore}%)`
            };
            rankedMeals.push(aiScoredMeal);
          }
        }
        rankedMeals.sort((a, b) => b.total_score - a.total_score);
        console.log(`\u2705 GPT-4o mini scored and ranked ${rankedMeals.length} meals`);
        console.log(`\u{1F3AF} Reasoning: ${aiResponse.reason || aiResponse.reasoning || "No reasoning provided"}`);
        return rankedMeals;
      }
      /**
       * Fallback ranking when Llama API is unavailable
       */
      fallbackRanking(request, startTime) {
        console.log("\u{1F504} Using fallback ranking algorithm");
        const { meals, userProfile, maxMeals = 9 } = request;
        const weights = userProfile.priority_weights;
        const sortedMeals = [...meals].sort((a, b) => {
          const priorityEntries = Object.entries(weights).sort(([, a2], [, b2]) => b2 - a2);
          const topPriority = priorityEntries[0][0];
          const secondPriority = priorityEntries[1][0];
          let aScore = a.total_score;
          let bScore = b.total_score;
          if (topPriority === "cultural") {
            aScore += a.component_scores.cultural_score * 0.5;
            bScore += b.component_scores.cultural_score * 0.5;
          } else if (topPriority === "health") {
            aScore += a.component_scores.health_score * 0.5;
            bScore += b.component_scores.health_score * 0.5;
          } else if (topPriority === "cost") {
            aScore += a.component_scores.cost_score * 0.5;
            bScore += b.component_scores.cost_score * 0.5;
          } else if (topPriority === "time") {
            aScore += a.component_scores.time_score * 0.5;
            bScore += b.component_scores.time_score * 0.5;
          }
          return bScore - aScore;
        });
        return {
          rankedMeals: sortedMeals.slice(0, maxMeals),
          reasoning: `Fallback ranking by ${Object.entries(weights).sort(([, a], [, b]) => b - a)[0][0]} priority`,
          processingTime: Date.now() - startTime
        };
      }
      /**
       * Quick meal selection for meal plan generation - NO FALLBACK VERSION
       */
      async selectMealsForPlan(userId, userProfile, mealCount = 9) {
        console.log(`\u{1F3AF} selectMealsForPlan called for ${mealCount} meals`);
        const { culturalMealRankingEngine: culturalMealRankingEngine2 } = await Promise.resolve().then(() => (init_culturalMealRankingEngine(), culturalMealRankingEngine_exports));
        const scoredMeals = await culturalMealRankingEngine2.getRankedMeals(
          userId,
          userProfile,
          mealCount * 2,
          // Get extra meals for better Llama selection
          0.7
          // Lower threshold for more variety
        );
        console.log(`\u{1F4CA} Got ${scoredMeals.length} scored meals from ranking engine`);
        if (scoredMeals.length === 0) {
          throw new Error("No scored meals available from cultural ranking engine");
        }
        console.log(`\u{1F916} Calling GPT-4o mini rankMeals with ${scoredMeals.length} meals...`);
        const rankingResult = await this.rankMeals({
          meals: scoredMeals,
          userProfile,
          maxMeals: mealCount
        });
        console.log(`\u{1F3AF} GPT-4o mini selected ${rankingResult.rankedMeals.length} meals: ${rankingResult.reasoning}`);
        return rankingResult.rankedMeals.map((score) => score.meal);
      }
      /**
       * Rank meals in parallel batches for faster processing
       */
      async rankMealsInParallel(request) {
        const startTime = Date.now();
        const { meals, userProfile, maxMeals = 10 } = request;
        console.log(`\u{1F680} Starting parallel ranking of ${meals.length} meals in batches of 2`);
        const batches = [];
        for (let i = 0; i < meals.length; i += 2) {
          batches.push(meals.slice(i, i + 2));
        }
        console.log(`\u{1F4E6} Created ${batches.length} batches for parallel processing`);
        const batchPromises = batches.map(async (batch, batchIndex) => {
          console.log(`\u{1F504} Processing batch ${batchIndex + 1}/${batches.length} with ${batch.length} meals`);
          try {
            const batchRequest = {
              meals: batch,
              userProfile,
              maxMeals: batch.length
            };
            const batchResult = await this.rankMeals(batchRequest);
            console.log(`\u2705 Batch ${batchIndex + 1} completed with ${batchResult.rankedMeals.length} meals`);
            return batchResult.rankedMeals;
          } catch (error) {
            console.error(`\u274C Batch ${batchIndex + 1} failed:`, error);
            console.error(`\u274C Failed batch contained meals:`, batch.map((m) => m.meal.name));
            return [];
          }
        });
        const batchResults = await Promise.all(batchPromises);
        console.log(`\u{1F3AF} All ${batches.length} batches completed`);
        const allRankedMeals = batchResults.flat();
        const finalRankedMeals = allRankedMeals.sort((a, b) => b.total_score - a.total_score).slice(0, maxMeals);
        const totalProcessingTime = Date.now() - startTime;
        console.log(`\u{1F3C1} Parallel ranking complete: ${finalRankedMeals.length} meals in ${totalProcessingTime}ms`);
        return {
          rankedMeals: finalRankedMeals,
          reasoning: `Parallel AI ranking of ${meals.length} meals using GPT-4o mini with user weight preferences`,
          processingTime: totalProcessingTime
        };
      }
    };
    llamaMealRanker = new LlamaMealRanker();
  }
});

// server/enhancedMealPlanGenerator.ts
var enhancedMealPlanGenerator_exports = {};
__export(enhancedMealPlanGenerator_exports, {
  EnhancedMealPlanGenerator: () => EnhancedMealPlanGenerator,
  enhancedMealPlanGenerator: () => enhancedMealPlanGenerator
});
var EnhancedMealPlanGenerator, enhancedMealPlanGenerator;
var init_enhancedMealPlanGenerator = __esm({
  "server/enhancedMealPlanGenerator.ts"() {
    "use strict";
    init_llamaMealRanker();
    EnhancedMealPlanGenerator = class {
      /**
       * Generate intelligent meal plan using cultural ranking + Llama selection
       */
      async generateMealPlan(request) {
        const startTime = Date.now();
        console.log(`\u{1F37D}\uFE0F Generating enhanced meal plan: ${request.numDays} days, ${request.mealsPerDay} meals/day`);
        try {
          const totalMeals = request.numDays * request.mealsPerDay;
          const selectedMeals = await llamaMealRanker.selectMealsForPlan(
            request.userId,
            request.userProfile,
            totalMeals
          );
          if (selectedMeals.length === 0) {
            throw new Error("No meals available matching user preferences");
          }
          console.log(`\u2705 Selected ${selectedMeals.length} meals for plan`);
          const mealPlan = this.buildMealPlanStructure(
            selectedMeals,
            request.numDays,
            request.mealsPerDay,
            request.servingSize || 1
          );
          const metadata = {
            type: "enhanced-cultural-ranking-v1",
            cultural_ranking_used: true,
            llama_ranking_used: true,
            meals_analyzed: selectedMeals.length,
            selection_reasoning: this.generateSelectionReasoning(selectedMeals, request.userProfile),
            processing_time_ms: Date.now() - startTime
          };
          return {
            meal_plan: mealPlan,
            generation_metadata: metadata
          };
        } catch (error) {
          console.error("\u274C Enhanced meal plan generation failed:", error);
          throw error;
        }
      }
      /**
       * Build structured meal plan from selected meals
       */
      buildMealPlanStructure(meals, numDays, mealsPerDay, servingSize) {
        const mealPlan = {};
        const mealTypes = ["breakfast", "lunch", "dinner", "snack", "dessert"];
        let mealIndex = 0;
        for (let day = 1; day <= numDays; day++) {
          const dayKey = `day_${day}`;
          mealPlan[dayKey] = {};
          for (let mealNum = 0; mealNum < mealsPerDay; mealNum++) {
            if (mealIndex >= meals.length) {
              mealIndex = 0;
            }
            const meal = meals[mealIndex];
            const mealType = mealTypes[mealNum] || `meal_${mealNum + 1}`;
            mealPlan[dayKey][mealType] = {
              title: meal.name,
              description: meal.description,
              cuisine: meal.cuisine,
              ingredients: this.scaleIngredients(meal.ingredients, servingSize),
              cooking_techniques: meal.cooking_techniques,
              cook_time_minutes: meal.estimated_prep_time + meal.estimated_cook_time,
              difficulty: meal.difficulty_level,
              nutrition: this.estimateNutrition(meal, servingSize),
              cultural_authenticity: meal.authenticity_score,
              ranking_explanation: `Selected for ${meal.cuisine} authenticity and weight-based preferences`,
              source: `Cultural cache + Llama ranking`
            };
            mealIndex++;
          }
        }
        return mealPlan;
      }
      /**
       * Scale ingredients for serving size
       */
      scaleIngredients(ingredients, servingSize) {
        if (servingSize === 1) return ingredients;
        return ingredients.map((ingredient) => {
          if (servingSize > 1) {
            return `${ingredient} (x${servingSize})`;
          }
          return ingredient;
        });
      }
      /**
       * Estimate nutrition info (mock implementation)
       */
      estimateNutrition(meal, servingSize) {
        const baseCalories = 400;
        const baseProtein = 25;
        const baseCarbs = 45;
        const baseFat = 15;
        let calorieMultiplier = 1;
        if (meal.cuisine.toLowerCase().includes("italian")) calorieMultiplier = 1.2;
        if (meal.cuisine.toLowerCase().includes("chinese")) calorieMultiplier = 0.9;
        return {
          calories: Math.round(baseCalories * calorieMultiplier * servingSize),
          protein_g: Math.round(baseProtein * servingSize),
          carbs_g: Math.round(baseCarbs * servingSize),
          fat_g: Math.round(baseFat * servingSize)
        };
      }
      /**
       * Generate human-readable selection reasoning
       */
      generateSelectionReasoning(meals, userProfile) {
        const cuisines = [...new Set(meals.map((m) => m.cuisine))];
        const avgAuthenticity = meals.reduce((sum, m) => sum + m.authenticity_score, 0) / meals.length;
        const topPriority = Object.entries(userProfile.priority_weights).sort(([, a], [, b]) => b - a)[0][0];
        return `Selected ${meals.length} meals from ${cuisines.join(", ")} cuisines. Average authenticity: ${(avgAuthenticity * 100).toFixed(0)}%. Prioritized ${topPriority}-focused selections using Llama 3 8B ranking.`;
      }
      /**
       * Convert user profile data to UserCulturalProfile format
       */
      static buildUserProfile(profile, goalWeights) {
        const cultural_preferences = {};
        if (profile.cultural_background) {
          for (const culture of profile.cultural_background) {
            cultural_preferences[culture] = 0.9;
          }
        }
        if (profile.preferences) {
          for (const pref of profile.preferences) {
            if (pref.toLowerCase().includes("asian")) {
              cultural_preferences["Chinese"] = 0.8;
              cultural_preferences["Japanese"] = 0.7;
            }
          }
        }
        return {
          cultural_preferences,
          priority_weights: {
            cultural: goalWeights?.cultural || 0.5,
            health: goalWeights?.health || 0.5,
            cost: goalWeights?.cost || 0.5,
            time: goalWeights?.time || 0.5,
            variety: goalWeights?.variety || 0.5
          },
          dietary_restrictions: this.extractDietaryRestrictions(profile),
          preferences: profile.preferences || []
        };
      }
      static extractDietaryRestrictions(profile) {
        const restrictions = [];
        if (profile.preferences) {
          for (const pref of profile.preferences) {
            const lower = pref.toLowerCase();
            if (lower.includes("egg-free") || lower.includes("no egg")) {
              restrictions.push("Egg-Free");
            }
            if (lower.includes("dairy-free") || lower.includes("no dairy")) {
              restrictions.push("Dairy-Free");
            }
            if (lower.includes("gluten-free")) {
              restrictions.push("Gluten-Free");
            }
            if (lower.includes("vegetarian")) {
              restrictions.push("Vegetarian");
            }
            if (lower.includes("vegan")) {
              restrictions.push("Vegan");
            }
          }
        }
        if (profile.members) {
          for (const member of profile.members) {
            if (member.dietaryRestrictions) {
              restrictions.push(...member.dietaryRestrictions);
            }
          }
        }
        return [...new Set(restrictions)];
      }
    };
    enhancedMealPlanGenerator = new EnhancedMealPlanGenerator();
  }
});

// server/intelligentMealBaseSelector.ts
var intelligentMealBaseSelector_exports = {};
__export(intelligentMealBaseSelector_exports, {
  IntelligentMealBaseSelector: () => IntelligentMealBaseSelector,
  intelligentMealBaseSelector: () => intelligentMealBaseSelector
});
var IntelligentMealBaseSelector, intelligentMealBaseSelector;
var init_intelligentMealBaseSelector = __esm({
  "server/intelligentMealBaseSelector.ts"() {
    "use strict";
    init_llamaMealRanker();
    init_culturalMealRankingEngine();
    IntelligentMealBaseSelector = class {
      /**
       * Find the best base meal that aligns with user's questionnaire-derived weights
       */
      async findOptimalBaseMeal(userId, userProfile, preferredCuisines = []) {
        console.log("\u{1F3AF} Finding optimal base meal for user preferences");
        console.log("\u{1F50D} User weights:", userProfile.priority_weights);
        console.log("\u{1F30D} Preferred cuisines:", preferredCuisines);
        const cultures = preferredCuisines.length > 0 ? preferredCuisines : Object.keys(userProfile.cultural_preferences);
        if (cultures.length === 0) {
          cultures.push("Italian", "Chinese", "Indian");
        }
        try {
          const rankedMeals = await culturalMealRankingEngine.getRankedMeals(
            userId,
            userProfile,
            15,
            // Get more options for better base selection
            0.4
            // Lower threshold to consider more variety
          );
          console.log(`\u{1F4CA} Got ${rankedMeals.length} ranked meals for base selection`);
          if (rankedMeals.length === 0) {
            console.log("\u274C No meals available for base selection");
            return null;
          }
          const aiRanking = await llamaMealRanker.rankMealsInParallel({
            meals: rankedMeals,
            userProfile,
            maxMeals: 5
            // Focus on top 5 candidates
          });
          if (aiRanking.rankedMeals.length === 0) {
            console.log("\u274C AI ranking failed, using top scored meal");
            return this.createBaseMealSelection(rankedMeals[0], userProfile);
          }
          const topMeal = aiRanking.rankedMeals[0];
          console.log(`\u{1F3AF} Selected base meal: ${topMeal.meal.name} (Score: ${Math.round(topMeal.total_score * 100)}%)`);
          return this.createBaseMealSelection(topMeal, userProfile);
        } catch (error) {
          console.error("\u274C Error finding optimal base meal:", error);
          return null;
        }
      }
      /**
       * Generate a complete meal plan using the selected base meal as a foundation
       */
      async generateMealPlanWithBase(userId, userProfile, baseMealSelection, totalMeals = 9) {
        console.log(`\u{1F37D}\uFE0F Generating meal plan with base: ${baseMealSelection.baseMeal.name}`);
        const baseInfluence = this.calculateBaseInfluence(userProfile);
        const similarMealsCount = Math.ceil(totalMeals * baseInfluence);
        const varietyMealsCount = totalMeals - similarMealsCount - 1;
        console.log(`\u{1F4C8} Base influence: ${Math.round(baseInfluence * 100)}%`);
        console.log(`\u{1F3AF} Similar meals: ${similarMealsCount}, Variety meals: ${varietyMealsCount}`);
        try {
          const complementaryMeals = await this.findComplementaryMeals(
            userId,
            userProfile,
            baseMealSelection.baseMeal,
            similarMealsCount
          );
          const varietyBoostMeals = await this.findVarietyBoostMeals(
            userId,
            userProfile,
            baseMealSelection.baseMeal,
            varietyMealsCount
          );
          const reasoning = this.generateMealPlanReasoning(
            baseMealSelection,
            complementaryMeals,
            varietyBoostMeals,
            userProfile
          );
          return {
            baseMeal: baseMealSelection,
            complementaryMeals,
            variety_boost_meals: varietyBoostMeals,
            reasoning
          };
        } catch (error) {
          console.error("\u274C Error generating meal plan with base:", error);
          return {
            baseMeal: baseMealSelection,
            complementaryMeals: [],
            variety_boost_meals: [],
            reasoning: `Meal plan focused on ${baseMealSelection.baseMeal.name} and similar ${baseMealSelection.baseMeal.cuisine} dishes.`
          };
        }
      }
      /**
       * Find meals that complement the base meal (similar style/cuisine)
       */
      async findComplementaryMeals(userId, userProfile, baseMeal, count) {
        const complementaryProfile = {
          ...userProfile,
          cultural_preferences: {
            ...userProfile.cultural_preferences,
            [baseMeal.cuisine]: Math.min((userProfile.cultural_preferences[baseMeal.cuisine] || 0.5) + 0.3, 1)
          }
        };
        const rankedMeals = await culturalMealRankingEngine.getRankedMeals(
          userId,
          complementaryProfile,
          count * 2,
          // Get extra for filtering
          0.3
        );
        const complementary = rankedMeals.filter((meal) => meal.meal.id !== baseMeal.id).filter((meal) => meal.meal.cuisine === baseMeal.cuisine).slice(0, count).map((score) => score.meal);
        console.log(`\u{1F91D} Found ${complementary.length} complementary meals for ${baseMeal.cuisine} cuisine`);
        return complementary;
      }
      /**
       * Find meals that add variety while still respecting user preferences
       */
      async findVarietyBoostMeals(userId, userProfile, baseMeal, count) {
        const varietyProfile = {
          ...userProfile,
          priority_weights: {
            ...userProfile.priority_weights,
            variety: Math.min(userProfile.priority_weights.variety + 0.3, 1)
          }
        };
        const rankedMeals = await culturalMealRankingEngine.getRankedMeals(
          userId,
          varietyProfile,
          count * 3,
          // Get many options for variety
          0.2
          // Lower threshold for more diversity
        );
        const varietyMeals = rankedMeals.filter((meal) => meal.meal.id !== baseMeal.id).filter((meal) => meal.meal.cuisine !== baseMeal.cuisine).slice(0, count).map((score) => score.meal);
        console.log(`\u{1F31F} Found ${varietyMeals.length} variety meals from different cuisines`);
        return varietyMeals;
      }
      /**
       * Calculate how much the base meal should influence the overall meal plan
       */
      calculateBaseInfluence(userProfile) {
        const weights = userProfile.priority_weights;
        const culturalInfluence = weights.cultural * 0.4;
        const varietyReduction = weights.variety * 0.3;
        const timeReduction = weights.time * 0.1;
        const baseInfluence = Math.max(0.2, Math.min(0.7, culturalInfluence - varietyReduction + timeReduction));
        return baseInfluence;
      }
      /**
       * Create a structured base meal selection with rationale
       */
      createBaseMealSelection(mealScore, userProfile) {
        const weights = userProfile.priority_weights;
        const scores = mealScore.component_scores;
        const weightAlignment = {
          cultural: scores.cultural_score * weights.cultural,
          health: scores.health_score * weights.health,
          cost: scores.cost_score * weights.cost,
          time: scores.time_score * weights.time
        };
        const strongestAlignment = Object.entries(weightAlignment).sort(([, a], [, b]) => b - a)[0];
        const usageRationale = this.generateUsageRationale(mealScore.meal, strongestAlignment[0], userProfile);
        return {
          baseMeal: mealScore.meal,
          similarity_score: mealScore.total_score,
          usage_rationale: usageRationale,
          weight_alignment: weightAlignment
        };
      }
      /**
       * Generate a rationale for why this meal was selected as the base
       */
      generateUsageRationale(meal, strongestAlignment, userProfile) {
        const alignmentReasons = {
          cultural: `strongly matches your ${meal.cuisine} cuisine preference`,
          health: `offers excellent nutritional balance with ${meal.cooking_techniques.join(", ")} preparation`,
          cost: `uses affordable, accessible ingredients like ${meal.ingredients.slice(0, 3).join(", ")}`,
          time: `can be prepared quickly with ${meal.estimated_prep_time + meal.estimated_cook_time} minutes total time`
        };
        const reason = alignmentReasons[strongestAlignment] || "aligns well with your preferences";
        return `Selected as base meal because it ${reason}. This will guide similar meal selections in your plan.`;
      }
      /**
       * Generate reasoning for the complete meal plan
       */
      generateMealPlanReasoning(baseMeal, complementaryMeals, varietyMeals, userProfile) {
        const totalMeals = 1 + complementaryMeals.length + varietyMeals.length;
        const cuisines = [baseMeal.baseMeal.cuisine, ...complementaryMeals.map((m) => m.cuisine), ...varietyMeals.map((m) => m.cuisine)];
        const uniqueCuisines = [...new Set(cuisines)];
        return `Meal plan generated around ${baseMeal.baseMeal.name} as the foundation. Includes ${complementaryMeals.length} similar ${baseMeal.baseMeal.cuisine} dishes for consistency and ${varietyMeals.length} variety meals from ${uniqueCuisines.length - 1} other cuisines. Total ${totalMeals} meals optimized for your ${Object.entries(userProfile.priority_weights).sort(([, a], [, b]) => b - a).slice(0, 2).map(([key]) => key).join(" and ")} priorities.`;
      }
    };
    intelligentMealBaseSelector = new IntelligentMealBaseSelector();
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_storage();
import { createServer } from "http";
import fetch5 from "node-fetch";

// server/grok.ts
import OpenAI from "openai";
function buildPromptFromParams(params) {
  let prompt = `Generate a detailed recipe with the following requirements:

`;
  if (params.recipeType && params.recipeType !== "Any Type") {
    prompt += `Recipe Type: ${params.recipeType}
`;
  }
  if (params.cuisine && params.cuisine !== "Any Cuisine") {
    prompt += `Cuisine: ${params.cuisine}
`;
  }
  if (params.dietRestrictions && params.dietRestrictions !== "None") {
    prompt += `Dietary Restriction: ${params.dietRestrictions}
`;
  }
  if (params.cookingTime) {
    prompt += `Cooking Time: Around ${params.cookingTime} minutes
`;
  }
  if (params.availableIngredients) {
    prompt += `Use these ingredients: ${params.availableIngredients}
`;
  }
  if (params.excludeIngredients) {
    prompt += `Exclude these ingredients: ${params.excludeIngredients}
`;
  }
  prompt += `
Description: ${params.description}

`;
  prompt += `Please format the response as a JSON object with the following structure:
  {
    "title": "Recipe Title",
    "description": "Brief description of the recipe",
    "time_minutes": total cooking time in minutes (number),
    "cuisine": "Cuisine type",
    "diet": "Diet type if applicable",
    "ingredients": [
      {
        "name": "ingredient name lowercase",
        "display_text": "Ingredient display name",
        "measurements": [
          {
            "quantity": amount as number,
            "unit": "unit of measurement"
          }
        ]
      }
    ],
    "instructions": [
      "Step 1 instruction",
      "Step 2 instruction"
    ]
  }`;
  return prompt;
}
async function generateRecipeWithGrok(params) {
  const API_KEY = process.env.XAI_API_KEY;
  if (!API_KEY) {
    throw new Error("Grok API key is required. Set the XAI_API_KEY environment variable.");
  }
  const openai = new OpenAI({ baseURL: "https://api.x.ai/v1", apiKey: API_KEY });
  const prompt = buildPromptFromParams(params);
  try {
    const response = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });
    const recipeContent = response.choices[0].message.content;
    if (!recipeContent) {
      throw new Error("Empty response from Grok API");
    }
    const recipeData = JSON.parse(recipeContent);
    if (recipeData.ingredients && Array.isArray(recipeData.ingredients)) {
      console.log(`Generated recipe with ${recipeData.ingredients.length} ingredients`);
    }
    let imageCategory = recipeData.cuisine?.toLowerCase() || "";
    if (!imageCategory || imageCategory === "any cuisine") {
      imageCategory = recipeData.diet?.toLowerCase() || recipeData.title.split(" ")[0].toLowerCase();
    }
    const recipeName = encodeURIComponent(recipeData.title.toLowerCase());
    recipeData.image_url = `https://source.unsplash.com/1200x900/?food,${recipeName},${imageCategory},cooking`;
    return recipeData;
  } catch (error) {
    console.error("Error generating recipe with Grok:", error);
    throw new Error(`Failed to generate recipe: ${error.message}`);
  }
}

// server/routes.ts
init_instacart();

// server/videoRecipeExtractor.ts
import fetch3 from "node-fetch";

// server/ingredientDeduplicator.ts
function parseIngredient(ingredientStr) {
  const cleaned = ingredientStr.trim();
  const patterns = [
    // Pattern: "2 cups all-purpose flour, sifted"
    /^(\d+(?:\/\d+)?(?:\.\d+)?)\s+(\w+)\s+(.+?)(?:,\s*(.+))?$/,
    // Pattern: "1/2 cup water"
    /^(\d+\/\d+)\s+(\w+)\s+(.+?)(?:,\s*(.+))?$/,
    // Pattern: "2 lbs ground beef"
    /^(\d+(?:\.\d+)?)\s+(\w+)\s+(.+?)(?:,\s*(.+))?$/,
    // Pattern: "1 large onion, diced"
    /^(\d+)\s+(\w+)\s+(.+?)(?:,\s*(.+))?$/,
    // Pattern: "Salt and pepper to taste"
    /^(.+?)\s+to\s+taste$/
  ];
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      if (pattern.source.includes("to\\s+taste")) {
        return {
          quantity: "to taste",
          unit: "",
          ingredient: match[1],
          original: cleaned
        };
      } else {
        return {
          quantity: match[1] || "",
          unit: match[2] || "",
          ingredient: match[3] || "",
          preparation: match[4] || void 0,
          original: cleaned
        };
      }
    }
  }
  return {
    quantity: "",
    unit: "",
    ingredient: cleaned,
    original: cleaned
  };
}
function normalizeIngredientName2(ingredient) {
  return ingredient.toLowerCase().replace(/[,\s]+/g, " ").replace(/\b(fresh|dried|ground|chopped|diced|minced|sliced)\b/g, "").replace(/\b(large|small|medium)\b/g, "").replace(/\s+/g, " ").trim();
}
function areIngredientsSimilar(ing1, ing2) {
  const norm1 = normalizeIngredientName2(ing1.ingredient);
  const norm2 = normalizeIngredientName2(ing2.ingredient);
  if (norm1 === norm2) return true;
  if (calculateStringSimilarity(norm1, norm2) > 0.8) return true;
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    const shorter = norm1.length < norm2.length ? norm1 : norm2;
    return shorter.length >= 3;
  }
  const variations = [
    ["onion", "onions", "yellow onion", "white onion", "red onion"],
    ["tomato", "tomatoes", "cherry tomato", "cherry tomatoes"],
    ["garlic", "garlic clove", "garlic cloves", "minced garlic"],
    ["cheese", "mozzarella", "parmesan", "ricotta", "cheddar"],
    ["beef", "ground beef", "lean ground beef"],
    ["oil", "olive oil", "cooking oil", "vegetable oil"],
    ["salt", "sea salt", "kosher salt", "table salt"],
    ["pepper", "black pepper", "ground pepper", "ground black pepper"],
    ["butter", "unsalted butter", "salted butter"],
    ["flour", "all purpose flour", "all-purpose flour"],
    ["potato", "potatoes", "baby potato", "baby potatoes"],
    ["chicken", "chicken breast", "chicken thigh", "chicken thighs"],
    ["thyme", "dried thyme", "fresh thyme"],
    ["rosemary", "dried rosemary", "fresh rosemary"],
    ["paprika", "smoked paprika", "sweet paprika"]
  ];
  for (const varGroup of variations) {
    if (varGroup.some((v) => norm1.includes(v)) && varGroup.some((v) => norm2.includes(v))) {
      return true;
    }
  }
  return false;
}
function calculateStringSimilarity(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));
  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;
  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,
        // deletion
        matrix[j][i - 1] + 1,
        // insertion
        matrix[j - 1][i - 1] + cost
        // substitution
      );
    }
  }
  const maxLen = Math.max(len1, len2);
  return (maxLen - matrix[len2][len1]) / maxLen;
}
function mergeIngredients(ing1, ing2) {
  if (ing1.quantity && ing1.unit && (!ing2.quantity || !ing2.unit)) {
    return ing1;
  }
  if (ing2.quantity && ing2.unit && (!ing1.quantity || !ing1.unit)) {
    return ing2;
  }
  if (ing1.preparation && !ing2.preparation) return ing1;
  if (ing2.preparation && !ing1.preparation) return ing2;
  if (ing1.ingredient.length > ing2.ingredient.length) return ing1;
  return ing2;
}
function deduplicateIngredients(ingredients) {
  if (!ingredients || ingredients.length === 0) return [];
  const parsedIngredients = ingredients.filter((ing) => ing && typeof ing === "string" && ing.trim().length > 0).map(parseIngredient);
  const deduplicated = [];
  for (const current of parsedIngredients) {
    const existingIndex = deduplicated.findIndex(
      (existing) => areIngredientsSimilar(current, existing)
    );
    if (existingIndex >= 0) {
      deduplicated[existingIndex] = mergeIngredients(deduplicated[existingIndex], current);
    } else {
      deduplicated.push(current);
    }
  }
  return deduplicated.map((ing) => ing.original);
}
function cleanIngredientList(ingredients) {
  const deduplicated = deduplicateIngredients(ingredients);
  return deduplicated.filter((ing) => {
    if (ing.length < 3) return false;
    const noise = ["recipe", "ingredients", "preparation", "instructions", "method"];
    const lower = ing.toLowerCase();
    if (noise.some((n) => lower === n)) return false;
    return true;
  }).sort();
}

// server/videoRecipeExtractor.ts
var YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
var YOUTUBE_API_KEY_BACKUP = process.env.YOUTUBE_API_KEY_BACKUP;
var YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";
async function getSpoonacularRecipe(query, filters) {
  try {
    if (!process.env.SPOONACULAR_API_KEY) {
      console.log("Spoonacular API key not configured, skipping");
      return null;
    }
    console.log(`Querying Spoonacular for: "${query}" with filters`);
    const params = new URLSearchParams({
      apiKey: process.env.SPOONACULAR_API_KEY,
      query,
      number: "3",
      addRecipeInformation: "true",
      sort: "popularity"
    });
    if (filters?.cookingTime && filters.cookingTime !== "Any Time") {
      const timeInMinutes = parseTimeFilter(filters.cookingTime);
      if (timeInMinutes > 0) {
        params.append("maxReadyTime", timeInMinutes.toString());
      }
    }
    if (filters?.cuisine && filters.cuisine !== "Any Cuisine") {
      params.append("cuisine", filters.cuisine.toLowerCase());
    }
    if (filters?.diet && filters.diet !== "None") {
      params.append("diet", filters.diet.toLowerCase());
    }
    if (filters?.availableIngredients) {
      const ingredients = filters.availableIngredients.split(",").map((i) => i.trim()).join(",");
      params.append("includeIngredients", ingredients);
    }
    if (filters?.excludeIngredients) {
      const excludeIngredients = filters.excludeIngredients.split(",").map((i) => i.trim()).join(",");
      params.append("excludeIngredients", excludeIngredients);
    }
    const spoonacularUrl = `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`;
    console.log(`Spoonacular API call: ${spoonacularUrl.replace(process.env.SPOONACULAR_API_KEY, "[API_KEY]")}`);
    const response = await fetch3(spoonacularUrl);
    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      console.log("No recipes found in Spoonacular");
      return null;
    }
    let bestMatch = data.results[0];
    let bestScore = 0;
    for (const recipe of data.results) {
      let score = 0;
      const titleLower = recipe.title.toLowerCase();
      const queryLower = query.toLowerCase();
      if (titleLower.includes(queryLower)) {
        score += 10;
      }
      const queryWords = queryLower.split(" ");
      for (const word of queryWords) {
        if (titleLower.includes(word)) {
          score += 2;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = recipe;
      }
    }
    console.log(`Selected Spoonacular recipe: "${bestMatch.title}" (${bestMatch.readyInMinutes} min)`);
    return bestMatch;
  } catch (error) {
    console.error("Error fetching from Spoonacular:", error);
    return null;
  }
}
function parseTimeFilter(timeFilter) {
  const timeMap = {
    "Under 15 min": 15,
    "Under 30 min": 30,
    "Under 1 hour": 60,
    "1+ hours": 999
  };
  return timeMap[timeFilter] || 0;
}
async function findBestRecipeVideo(query, filters, spoonacularTime) {
  try {
    if (!YOUTUBE_API_KEY && !YOUTUBE_API_KEY_BACKUP) {
      console.error("No YouTube API keys found in environment variables");
      return null;
    }
    let searchQuery = query;
    if (!searchQuery.toLowerCase().includes("recipe")) {
      searchQuery += " recipe";
    }
    if (filters?.cuisine && filters.cuisine !== "Any Cuisine" && filters.cuisine !== "None") {
      searchQuery += ` ${filters.cuisine}`;
    }
    if (filters?.diet && filters.diet !== "None" && filters.diet !== "Any Diet") {
      searchQuery += ` ${filters.diet}`;
    }
    if (filters?.cookingTime === "Under 15 min" || filters?.cookingTime === "Under 30 min") {
      searchQuery += " quick";
    }
    console.log(`Enhanced search query: "${searchQuery}"`);
    let currentApiKey = YOUTUBE_API_KEY;
    let searchUrl = `${YOUTUBE_API_BASE_URL}/search?part=snippet&q=${encodeURIComponent(searchQuery)}&maxResults=3&type=video&key=${currentApiKey}`;
    let searchResponse = await fetch3(searchUrl);
    let searchData = await searchResponse.json();
    if (searchResponse.status === 403 && searchData.error?.errors?.[0]?.reason === "quotaExceeded" && YOUTUBE_API_KEY_BACKUP) {
      console.log("Primary YouTube API key quota exceeded, switching to backup key");
      currentApiKey = YOUTUBE_API_KEY_BACKUP;
      searchUrl = `${YOUTUBE_API_BASE_URL}/search?part=snippet&q=${encodeURIComponent(searchQuery)}&maxResults=3&type=video&key=${currentApiKey}`;
      searchResponse = await fetch3(searchUrl);
      searchData = await searchResponse.json();
    }
    console.log("YouTube API Response Status:", searchResponse.status);
    console.log("YouTube API Response:", JSON.stringify(searchData, null, 2));
    if (!searchData.items || searchData.items.length === 0) {
      console.warn("No videos explicitly matching query terms, using most popular video");
      const simpleSearchUrl = `${YOUTUBE_API_BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=1&type=video&key=${currentApiKey}`;
      const simpleSearchResponse = await fetch3(simpleSearchUrl);
      const simpleSearchData = await simpleSearchResponse.json();
      if (!simpleSearchData.items || simpleSearchData.items.length === 0) {
        return null;
      }
      const videoId = simpleSearchData.items[0].id.videoId;
      const videoTitle = simpleSearchData.items[0].snippet.title;
      const channelTitle = simpleSearchData.items[0].snippet.channelTitle;
      const thumbnailUrl = simpleSearchData.items[0].snippet.thumbnails.high?.url;
      const videoUrl = `${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`;
      const videoResponse = await fetch3(videoUrl);
      const videoData = await videoResponse.json();
      if (!videoData.items || videoData.items.length === 0) {
        return null;
      }
      const description = videoData.items[0].snippet.description;
      return {
        id: videoId,
        title: videoTitle,
        description,
        channelTitle,
        thumbnailUrl
      };
    }
    let bestVideo = null;
    let maxScore = -1;
    for (const item of searchData.items) {
      const videoId = item.id.videoId;
      const videoUrl = `${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
      const videoResponse = await fetch3(videoUrl);
      const videoData = await videoResponse.json();
      if (!videoData.items || videoData.items.length === 0) {
        continue;
      }
      const viewCount = parseInt(videoData.items[0].statistics.viewCount) || 0;
      const description = videoData.items[0].snippet.description;
      const title = videoData.items[0].snippet.title;
      const channelTitle = videoData.items[0].snippet.channelTitle;
      const thumbnailUrl = item.snippet.thumbnails.high?.url;
      const duration = videoData.items[0].contentDetails?.duration || "";
      const durationMinutes = parseDuration(duration);
      console.log(`Video "${title}" duration: ${duration} -> ${durationMinutes} minutes, description length: ${description?.length || 0}`);
      if (durationMinutes < 0.5) {
        console.log(`Skipping short video: ${title}`);
        continue;
      }
      let score = viewCount * 1e-3;
      if (title.toLowerCase().includes("recipe") || title.toLowerCase().includes("how to")) {
        score += 1e7;
      }
      if (description.toLowerCase().includes("ingredient") || description.toLowerCase().includes("you will need")) {
        score += 5e6;
      }
      score += 1e6;
      if (filters) {
        if (filters.cuisine && filters.cuisine !== "Any Cuisine" && (title.toLowerCase().includes(filters.cuisine.toLowerCase()) || description.toLowerCase().includes(filters.cuisine.toLowerCase()))) {
          score += 5e5;
        }
        if (filters.diet && filters.diet !== "None" && (title.toLowerCase().includes(filters.diet.toLowerCase()) || description.toLowerCase().includes(filters.diet.toLowerCase()))) {
          score += 5e5;
        }
        if (spoonacularTime && spoonacularTime > 0) {
          const durationMinutes2 = parseDuration(duration);
          if (Math.abs(durationMinutes2 - spoonacularTime) <= 5) {
            score += 3e5;
          } else if (durationMinutes2 <= spoonacularTime + 10) {
            score += 15e4;
          }
        } else if (filters.cookingTime && filters.cookingTime !== "Any Time") {
          const durationMinutes2 = parseDuration(duration);
          const timeBonus = getTimeBonus(durationMinutes2, filters.cookingTime);
          score += timeBonus;
        }
        if (filters.availableIngredients) {
          const availableList = filters.availableIngredients.split(",").map((i) => i.trim().toLowerCase());
          const matchCount = availableList.filter(
            (ingredient) => description.toLowerCase().includes(ingredient) || title.toLowerCase().includes(ingredient)
          ).length;
          score += matchCount * 3e5;
        }
        if (filters.excludeIngredients) {
          const excludeList = filters.excludeIngredients.split(",").map((i) => i.trim().toLowerCase());
          const penaltyCount = excludeList.filter(
            (ingredient) => description.toLowerCase().includes(ingredient) || title.toLowerCase().includes(ingredient)
          ).length;
          score -= penaltyCount * 5e5;
        }
      }
      if (score > maxScore) {
        maxScore = score;
        bestVideo = {
          id: videoId,
          title,
          description,
          channelTitle,
          thumbnailUrl
        };
      }
    }
    if (!bestVideo && searchData.items && searchData.items.length > 0) {
      console.log("No video met scoring criteria, selecting first available video");
      for (const item of searchData.items) {
        const videoId = item.id.videoId;
        const title = item.snippet.title;
        const channelTitle = item.snippet.channelTitle;
        const thumbnailUrl = item.snippet.thumbnails.high?.url;
        bestVideo = {
          id: videoId,
          title,
          description: item.snippet.description || "",
          channelTitle,
          thumbnailUrl
        };
        console.log(`Fallback selected: "${title}" by ${channelTitle}`);
        break;
      }
    }
    if (bestVideo) {
      console.log(`Selected video: "${bestVideo.title}" by ${bestVideo.channelTitle}`);
    } else {
      console.log(`No suitable video found after filtering ${searchData.items.length} results`);
    }
    return bestVideo;
  } catch (error) {
    console.error("Error finding recipe video:", error);
    return null;
  }
}
function parseDuration(duration) {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  return hours * 60 + minutes + seconds / 60;
}
function getTimeBonus(durationMinutes, cookingTimeFilter) {
  const timeRanges = {
    "Under 15 min": { min: 0, max: 15 },
    "Under 30 min": { min: 0, max: 30 },
    "Under 1 hour": { min: 0, max: 60 },
    "1+ hours": { min: 60, max: 999 }
  };
  const range = timeRanges[cookingTimeFilter];
  if (!range) return 0;
  if (durationMinutes >= range.min && durationMinutes <= range.max) {
    return 3e5;
  }
  return 0;
}
async function getVideoComments(videoId) {
  try {
    if (!YOUTUBE_API_KEY) {
      return [];
    }
    const commentsUrl = `${YOUTUBE_API_BASE_URL}/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&key=${YOUTUBE_API_KEY}`;
    const response = await fetch3(commentsUrl);
    const data = await response.json();
    if (!data.items) {
      return [];
    }
    let pinnedComments = [];
    let regularComments = [];
    for (const item of data.items) {
      const comment = item.snippet.topLevelComment.snippet.textDisplay;
      if (item.snippet.canReply === false || item.snippet.isPinnedByCreator) {
        pinnedComments.push(comment);
      } else {
        regularComments.push(comment);
      }
    }
    console.log(`Found ${pinnedComments.length} pinned comments and ${regularComments.length} regular comments`);
    return [...pinnedComments, ...regularComments];
  } catch (error) {
    console.error("Error getting video comments:", error);
    return [];
  }
}
async function generateIngredientsFromTitle(videoTitle) {
  try {
    const response = await fetch3("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.XAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "grok-2-1212",
        messages: [{
          role: "system",
          content: "You are a culinary expert. Generate realistic ingredient lists for recipes based on video titles. Include proper measurements and quantities for typical serving sizes."
        }, {
          role: "user",
          content: `Generate a complete ingredient list for this recipe: "${videoTitle}". 

Include:
- Proper measurements (cups, tablespoons, teaspoons, ounces, pounds, etc.)
- Realistic quantities for 4-6 servings
- Common ingredients that would be used in this dish
- Seasonings and basic cooking ingredients

Return as JSON: {"ingredients": ["2 lbs ground beef", "1 large onion, diced", "2 cups beef broth", etc.]}`
        }],
        response_format: { type: "json_object" },
        max_tokens: 800
      })
    });
    if (!response.ok) {
      console.log("Grok ingredient generation failed");
      return [];
    }
    const result = await response.json();
    const content = result.choices[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      if (parsed.ingredients && Array.isArray(parsed.ingredients)) {
        return parsed.ingredients;
      }
    }
    return [];
  } catch (error) {
    console.error("Grok ingredient generation error:", error);
    return [];
  }
}
async function extractIngredientsWithLLaVA(text2) {
  if (!text2) return [];
  try {
    const response = await fetch3("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.XAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "grok-2-1212",
        messages: [{
          role: "system",
          content: "You are LLaVA-Chef, an AI specialized in extracting recipe ingredients from text. Extract ingredients with proper measurements and formatting."
        }, {
          role: "user",
          content: `Analyze this YouTube video description and extract ONLY the ingredients with their measurements. Format each ingredient properly with quantity and unit when available.

Text to analyze:
${text2}

Return as JSON: {"ingredients": ["1 cup flour", "2 large eggs", "1/2 tsp salt", etc.]}`
        }],
        response_format: { type: "json_object" },
        max_tokens: 800
      })
    });
    if (!response.ok) {
      console.log("LLaVA analysis failed, using simple extraction");
      return [];
    }
    const result = await response.json();
    const content = result.choices[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      if (parsed.ingredients && Array.isArray(parsed.ingredients)) {
        console.log(`LLaVA-Chef extracted ${parsed.ingredients.length} ingredients`);
        return parsed.ingredients;
      }
    }
    return [];
  } catch (error) {
    console.error("LLaVA-Chef extraction error:", error);
    return [];
  }
}
async function extractInstructionsWithLLaVA(transcript, description) {
  if (!transcript && !description) return [];
  try {
    let textToAnalyze = transcript || description || "";
    const maxChunkLength = 4e3;
    const chunks = [];
    if (textToAnalyze.length <= 800) {
      chunks.push(textToAnalyze);
      chunks.push(textToAnalyze);
    } else {
      const midPoint = Math.floor(textToAnalyze.length / 2);
      const overlap = 200;
      chunks.push(textToAnalyze.slice(0, midPoint + overlap));
      chunks.push(textToAnalyze.slice(midPoint - overlap));
    }
    let allInstructions = [];
    const chunkPromises = chunks.map(async (chunk, index2) => {
      try {
        const response = await fetch3("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.XAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "grok-2-1212",
            messages: [{
              role: "system",
              content: "You are LLaVA-Chef, an AI specialized in extracting cooking instructions from video transcripts. Extract clear, actionable cooking steps in chronological order."
            }, {
              role: "user",
              content: `Extract cooking instructions from this ${transcript ? "video transcript" : "description"} chunk ${index2 + 1}/${chunks.length}. Format as clear numbered steps. Focus ONLY on actionable cooking steps, ignore introductions, sponsorships, or unrelated content.

${chunk}

Return as JSON: {"instructions": ["Step description 1", "Step description 2", etc.]}`
            }],
            response_format: { type: "json_object" },
            max_tokens: 1e3
          })
        });
        if (response.ok) {
          const result = await response.json();
          const content = result.choices[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            if (parsed.instructions && Array.isArray(parsed.instructions)) {
              return { index: index2, instructions: parsed.instructions };
            }
          }
        }
        return { index: index2, instructions: [] };
      } catch (error) {
        console.error(`Error processing chunk ${index2}:`, error);
        return { index: index2, instructions: [] };
      }
    });
    const chunkResults = await Promise.all(chunkPromises);
    chunkResults.sort((a, b) => a.index - b.index).forEach((result) => {
      allInstructions.push(...result.instructions);
    });
    const uniqueInstructions = Array.from(new Set(allInstructions)).filter((instruction) => instruction.length > 10).slice(0, 15);
    console.log(`LLaVA-Chef extracted ${uniqueInstructions.length} instructions from ${transcript ? "transcript" : "description"}`);
    return uniqueInstructions;
  } catch (error) {
    console.error("LLaVA-Chef instruction extraction error:", error);
    return fallbackInstructionExtraction(description);
  }
}
function fallbackInstructionExtraction(text2) {
  const instructionSectionMarkers = [
    "Instructions:",
    "INSTRUCTIONS",
    "Directions:",
    "Method:",
    "Steps:",
    "Preparation:",
    "PREPARATION",
    "How to Make:",
    "Directions",
    "Method",
    "Steps",
    "Preparation",
    "Process:",
    "Cooking method:",
    "How to prepare:",
    "Cooking instructions:",
    "Instructions",
    "DIRECTIONS",
    "METHOD",
    "STEPS",
    "Pr\xE9paration:",
    "Instrucciones:",
    "Anleitung:",
    "Istruzioni:",
    "\u505A\u6CD5:",
    "\u6B65\u9AA4:",
    "\u0418\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u0438:"
  ];
  let instructionSection = "";
  for (const marker of instructionSectionMarkers) {
    if (text2.includes(marker)) {
      const parts = text2.split(marker);
      if (parts.length > 1) {
        instructionSection = parts[1];
        const endMarkers = [
          "Notes:",
          "NOTES:",
          "Tips:",
          "TIPS:",
          "Serving suggestion",
          "Nutrition",
          "Subscribe",
          "Follow",
          "Like",
          "Comment",
          "NUTRITION",
          "Equipment:",
          "EQUIPMENT",
          "Thank you",
          "Thanks for watching"
        ];
        for (const endMarker of endMarkers) {
          if (instructionSection.includes(endMarker)) {
            instructionSection = instructionSection.split(endMarker)[0];
          }
        }
        break;
      }
    }
  }
  if (!instructionSection) {
    const ingredientMarkers = [
      "Ingredients:",
      "INGREDIENTS",
      "INGREDIENTS:",
      "Ingredients",
      "You will need:",
      "What you need:",
      "Shopping list:"
    ];
    for (const marker of ingredientMarkers) {
      if (text2.includes(marker)) {
        const parts = text2.split(marker);
        if (parts.length > 1) {
          const afterIngredients = parts[1];
          const emptyLineSeparator = /\n\s*\n/;
          const sectionParts = afterIngredients.split(emptyLineSeparator);
          if (sectionParts.length > 1) {
            instructionSection = sectionParts[1];
          }
        }
      }
    }
  }
  let extractedSteps = [];
  if (instructionSection) {
    console.log("Found potential instruction section");
    const instructionLines = instructionSection.split(/\n|\r/).map((line) => line.trim()).filter((line) => line.length > 0);
    const numberedLines = instructionLines.filter((line) => /^\s*(\d+[\.)]\s*|step\s*\d+[\s:]*|[a-z][\.)]\s*)/i.test(line));
    const numberedSteps = numberedLines.map(
      (line) => line.replace(/^\s*(\d+[\.)]\s*|step\s*\d+[\s:]*|[a-z][\.)]\s*)/i, "").trim()
    ).filter((step) => step.length > 0);
    if (numberedSteps.length >= 2) {
      console.log(`Found ${numberedSteps.length} numbered steps in the instruction section`);
      extractedSteps = numberedSteps;
    } else {
      console.log("Looking for paragraph-based instructions");
      const paragraphs = instructionSection.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p.length > 15);
      const cookingParagraphs = paragraphs.filter((paragraph) => {
        const lower = paragraph.toLowerCase();
        if (lower.includes("http") || lower.includes("www.")) return false;
        if (lower.includes("subscribe") || lower.includes("follow")) return false;
        if (lower.includes("youtube") || lower.includes("instagram")) return false;
        return lower.includes("add") || lower.includes("mix") || lower.includes("stir") || lower.includes("cook") || lower.includes("heat") || lower.includes("bake") || lower.includes("pour") || lower.includes("place") || lower.includes("remove") || lower.includes("set") || lower.includes("let") || lower.includes("prepare");
      });
      if (cookingParagraphs.length >= 2) {
        console.log(`Found ${cookingParagraphs.length} instruction paragraphs`);
        extractedSteps = cookingParagraphs;
      }
    }
    if (extractedSteps.length === 0) {
      console.log("Looking for general instruction lines");
      const generalInstructionLines = instructionSection.split(/\n|\r/).map((line) => line.trim()).filter((line) => line.length > 15 && line.length < 500 && !line.includes("http")).filter((line) => !line.toLowerCase().includes("subscribe") && !line.toLowerCase().includes("follow"));
      if (generalInstructionLines.length >= 3) {
        console.log(`Found ${generalInstructionLines.length} instruction lines`);
        extractedSteps = generalInstructionLines;
      }
    }
  }
  if (extractedSteps.length === 0) {
    console.log("Looking for cooking verb instruction lines in entire text");
    const allTextLines = text2.split(/\n|\r/).map((line) => line.trim()).filter((line) => line.length > 0);
    const cookingVerbs = [
      "mix",
      "stir",
      "beat",
      "whisk",
      "fold",
      "pour",
      "add",
      "combine",
      "blend",
      "chop",
      "dice",
      "slice",
      "cut",
      "mince",
      "grate",
      "peel",
      "crush",
      "grind",
      "bake",
      "fry",
      "saut\xE9",
      "roast",
      "broil",
      "grill",
      "boil",
      "simmer",
      "steam",
      "cook",
      "heat",
      "warm",
      "chill",
      "freeze",
      "thaw",
      "marinate",
      "season",
      "serve",
      "garnish",
      "sprinkle",
      "drizzle",
      "spread",
      "layer",
      "arrange",
      "prepare",
      "preheat",
      "turn",
      "flip",
      "rotate",
      "lower",
      "raise",
      "increase",
      "decrease",
      "maintain",
      "check",
      "test",
      "cover",
      "uncover",
      // Additional cooking terms
      "place",
      "set",
      "let",
      "remove",
      "transfer",
      "cool",
      "top",
      "fill",
      "drain",
      "strain",
      "wash",
      "rinse",
      "break",
      "separate",
      "divide",
      "form",
      "shape",
      "store",
      "refrigerate",
      "rest",
      "knead",
      "roll",
      "stir-fry",
      "melt",
      "brown"
    ];
    const isLikelyCookingInstruction = (line) => {
      const lower = line.toLowerCase();
      const trimmed = line.trim();
      if (trimmed.length < 15 || trimmed.length > 200) return false;
      if (lower.includes("http") || lower.includes("www.")) return false;
      if (lower.includes("subscribe") || lower.includes("follow")) return false;
      if (lower.includes("youtube") || lower.includes("instagram")) return false;
      const hasEndingPeriod = /\.\s*$/.test(trimmed);
      const startsWithImperative = /^(Add|Stir|Mix|Pour|Place|Heat|Cook|Bake|Remove|Let|Set|Combine)/i.test(trimmed);
      const hasCookingTime = /(\d+)\s+(minute|min|hour|hr|second|sec)s?/i.test(trimmed);
      if (hasEndingPeriod && (startsWithImperative || hasCookingTime)) {
        return true;
      }
      for (const verb of cookingVerbs) {
        const verbPattern = new RegExp(`\\b${verb}\\b`, "i");
        if (verbPattern.test(lower)) {
          return true;
        }
      }
      return false;
    };
    const possibleInstructions = allTextLines.filter(isLikelyCookingInstruction);
    if (possibleInstructions.length >= 3) {
      console.log(`Found ${possibleInstructions.length} possible instruction lines in full text`);
      extractedSteps = possibleInstructions.map(
        (step) => step.replace(/^\d+[.)]?\s*/, "")
        // Remove any existing step numbers
      );
    }
  }
  if (extractedSteps.length === 0) {
    console.log("Looking for lengthy paragraphs that might be instructions");
    const paragraphs = text2.split(/\n\s*\n/).map((p) => p.trim());
    const longParagraphs = paragraphs.filter((p) => p.length > 60 && p.length < 500);
    const potentialInstructionParagraphs = longParagraphs.filter((p) => {
      const lower = p.toLowerCase();
      return !lower.includes("subscribe") && !lower.includes("follow") && !lower.includes("channel") && !lower.includes("comment") && !lower.includes("like this video");
    });
    if (potentialInstructionParagraphs.length >= 2) {
      console.log(`Found ${potentialInstructionParagraphs.length} potential instruction paragraphs`);
      extractedSteps = potentialInstructionParagraphs;
    }
  }
  if (extractedSteps.length > 20) {
    console.log("Too many steps detected, attempting to consolidate");
    const consolidatedSteps = [];
    let currentStep = "";
    for (const step of extractedSteps) {
      if (step.length < 30 && currentStep.length < 100) {
        currentStep += " " + step;
      } else {
        if (currentStep) {
          consolidatedSteps.push(currentStep.trim());
        }
        currentStep = step;
      }
    }
    if (currentStep) {
      consolidatedSteps.push(currentStep.trim());
    }
    extractedSteps = consolidatedSteps;
  }
  console.log(`Final instruction count: ${extractedSteps.length}`);
  return extractedSteps;
}
function extractMeasurements(ingredient) {
  const measurementRegex = /(\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|half|quarter)\s*(cup|tbsp|tsp|tablespoon|teaspoon|oz|ounce|pound|lb|g|gram|ml|l|liter)s?/gi;
  const measurements = [];
  let match;
  while ((match = measurementRegex.exec(ingredient)) !== null) {
    let quantity = match[1].toLowerCase();
    const wordToNumber = {
      "one": 1,
      "two": 2,
      "three": 3,
      "four": 4,
      "five": 5,
      "six": 6,
      "seven": 7,
      "eight": 8,
      "nine": 9,
      "ten": 10,
      "half": 0.5,
      "quarter": 0.25
    };
    const numericQuantity = wordToNumber[quantity] !== void 0 ? wordToNumber[quantity] : parseFloat(quantity);
    let unit = match[2].toLowerCase();
    const unitMap = {
      "tablespoon": "tbsp",
      "teaspoon": "tsp",
      "ounce": "oz",
      "pound": "lb",
      "gram": "g",
      "liter": "l"
    };
    const normalizedUnit = unitMap[unit] || unit;
    measurements.push({
      quantity: numericQuantity,
      unit: normalizedUnit
    });
  }
  return measurements;
}
async function getRecipeFromYouTube(query, filters) {
  try {
    console.log(`Starting generalized recipe workflow for: "${query}"`);
    let spoonacularRecipe = null;
    let cookingTimeMinutes = 30;
    try {
      spoonacularRecipe = await getSpoonacularRecipe(query, filters);
      if (spoonacularRecipe) {
        cookingTimeMinutes = spoonacularRecipe.readyInMinutes;
        console.log(`Spoonacular recipe found: "${spoonacularRecipe.title}" (${cookingTimeMinutes} min)`);
      } else {
        console.log("No Spoonacular recipe found, proceeding with YouTube-only workflow");
      }
    } catch (error) {
      console.warn("Spoonacular API failed, falling back to YouTube-only workflow:", error);
    }
    const videoInfo = await findBestRecipeVideo(query, filters, cookingTimeMinutes);
    if (!videoInfo) {
      console.error("Failed to find a suitable recipe video");
      return null;
    }
    console.log(`Found video: ${videoInfo.title} by ${videoInfo.channelTitle}`);
    videoInfo.comments = await getVideoComments(videoInfo.id);
    let ingredients = [];
    const descriptionIngredients = await extractIngredientsWithLLaVA(videoInfo.description);
    if (descriptionIngredients.length > 0) {
      console.log(`Found ${descriptionIngredients.length} ingredients in video description`);
      ingredients = descriptionIngredients.map(
        (ingredient) => ingredient.replace(/(\d+(?:\.\d+)?)\s*(cup|cups|tsp|tbsp|tablespoon|teaspoon|tablespoons|teaspoons)\s+\1\s*\2s?/gi, "$1 $2").replace(/(\d+(?:\.\d+)?)\s*(oz|ounce|ounces|pound|pounds|lb|lbs|g|gram|grams|ml|l|liter|liters)\s+\1\s*\2s?/gi, "$1 $2").replace(/(\b\w+)\s+\1\b/g, "$1").replace(/\s+/g, " ").trim()
      ).filter((ingredient) => ingredient.length > 0);
    } else if (videoInfo.comments && videoInfo.comments.length > 0) {
      const pinnedComments = videoInfo.comments.filter((comment) => comment.toLowerCase().includes("pinned") || comment.toLowerCase().includes("creator") || comment.toLowerCase().includes("highlighted"));
      if (pinnedComments.length > 0) {
        console.log(`Checking ${pinnedComments.length} pinned comments for ingredients`);
        for (const comment of pinnedComments) {
          const commentIngredients = await extractIngredientsWithLLaVA(comment);
          if (commentIngredients.length > 2) {
            console.log(`Found ${commentIngredients.length} ingredients in pinned comment`);
            ingredients = commentIngredients;
            break;
          }
        }
      }
    }
    if (ingredients.length > 0) {
      console.log(`Before deduplication: ${ingredients.length} ingredients`);
      const seen = /* @__PURE__ */ new Set();
      ingredients = ingredients.filter((ingredient) => {
        const normalized = ingredient.toLowerCase().trim();
        if (seen.has(normalized)) {
          return false;
        }
        seen.add(normalized);
        return true;
      });
      ingredients = cleanIngredientList(ingredients);
      console.log(`After deduplication: ${ingredients.length} ingredients`);
    }
    let instructions = [];
    try {
      const aiInstructions = await extractInstructionsWithLLaVA("", videoInfo.description);
      if (aiInstructions.length > 0) {
        console.log(`LLaVA-Chef extracted ${aiInstructions.length} instruction steps`);
        instructions = aiInstructions;
      } else {
        console.log("LLaVA-Chef could not extract instructions, trying fallback");
        instructions = fallbackInstructionExtraction(videoInfo.description);
      }
    } catch (error) {
      console.error("Error with LLaVA-Chef instruction extraction:", error);
      instructions = fallbackInstructionExtraction(videoInfo.description);
    }
    if (ingredients.length === 0) {
      console.log("No ingredients found in video description, generating from video title using Grok");
      try {
        const grokIngredients = await generateIngredientsFromTitle(videoInfo.title);
        if (grokIngredients.length > 0) {
          console.log(`Grok generated ${grokIngredients.length} ingredients from video title`);
          ingredients = grokIngredients;
        } else {
          console.log("Grok could not generate ingredients from title");
          ingredients = [];
        }
      } catch (error) {
        console.error("Error generating ingredients with Grok:", error);
        ingredients = [];
      }
    }
    if (instructions.length === 0) {
      console.log("Failed to extract instructions from video");
      instructions = [];
    }
    return {
      title: videoInfo.title,
      description: videoInfo.description,
      ingredients: ingredients.map((ingredient) => ({
        name: ingredient,
        display_text: ingredient,
        measurements: extractMeasurements(ingredient)
      })),
      instructions,
      videoUrl: `https://www.youtube.com/watch?v=${videoInfo.id}`,
      thumbnailUrl: videoInfo.thumbnailUrl,
      channelTitle: videoInfo.channelTitle,
      video_id: videoInfo.id,
      video_title: videoInfo.title,
      video_channel: videoInfo.channelTitle,
      source_url: `https://www.youtube.com/watch?v=${videoInfo.id}`,
      source_name: videoInfo.channelTitle
    };
    const formattedIngredients = ingredients.map((ingredient) => {
      let cleanedIngredient = ingredient.replace(/(\d+(?:\.\d+)?)\s*(cup|cups|tsp|tbsp|tablespoon|teaspoon|tablespoons|teaspoons)\s+\1\s*\2s?/gi, "$1 $2").replace(/(\d+(?:\.\d+)?)\s*(oz|ounce|ounces|pound|pounds|lb|lbs|g|gram|grams|ml|l|liter|liters)\s+\1\s*\2s?/gi, "$1 $2").replace(/(\b\w+)\s+\1\b/g, "$1").replace(/\s+/g, " ").trim();
      const measurementRegex = /^([\d\s\./]+)\s*(cup|cups|tbsp|tsp|tablespoon|teaspoons|teaspoon|tablespoons|oz|ounce|ounces|pound|pounds|lb|lbs|g|gram|grams|kg|ml|liter|liters|l|pinch|pinches|dash|dashes|clove|cloves|can|cans|jar|jars)\s+(.+)$/i;
      const match = cleanedIngredient.match(measurementRegex);
      if (match) {
        const quantity = match[1].trim();
        const unit = match[2].trim();
        const itemName = match[3].trim();
        return {
          name: itemName,
          display_text: itemName,
          measurements: [{
            quantity: parseFloat(quantity.replace(/\s+/g, "")) || 1,
            unit
          }]
        };
      } else {
        return {
          name: cleanedIngredient,
          display_text: cleanedIngredient,
          measurements: [{ quantity: 1, unit: "item" }]
        };
      }
    });
    const recipeTitle = spoonacularRecipe ? spoonacularRecipe.title : query.charAt(0).toUpperCase() + query.slice(1);
    let description = `A delicious recipe for ${query}`;
    if (videoInfo) {
      description += ` based on the video "${videoInfo.title}" by ${videoInfo.channelTitle}`;
    }
    if (spoonacularRecipe) {
      description += ` with verified cooking time of ${cookingTimeMinutes} minutes`;
    }
    description += ".";
    if (!videoInfo && spoonacularRecipe) {
      description += " No video found matching your filters and time, but here's a recipe.";
    }
    console.log("VideoInfo status before creating recipe:", {
      exists: !!videoInfo,
      id: videoInfo?.id,
      title: videoInfo?.title,
      channel: videoInfo?.channelTitle
    });
    const recipe = {
      title: recipeTitle,
      description,
      image_url: spoonacularRecipe?.image || videoInfo?.thumbnailUrl || "https://via.placeholder.com/350x200?text=Recipe+Image",
      time_minutes: cookingTimeMinutes,
      // Use Spoonacular time or fallback
      cuisine: filters?.cuisine || "Any Cuisine",
      diet: filters?.diet || "None",
      ingredients: formattedIngredients,
      instructions,
      source_url: videoInfo ? `https://www.youtube.com/watch?v=${videoInfo.id}` : void 0,
      source_name: videoInfo?.channelTitle,
      video_id: videoInfo?.id,
      video_title: videoInfo?.title,
      video_channel: videoInfo?.channelTitle,
      spoonacular_id: spoonacularRecipe?.id,
      spoonacular_title: spoonacularRecipe?.title
    };
    console.log(`Final recipe created with ${recipe.ingredients.length} ingredients and ${recipe.instructions.length} instructions`);
    console.log(`Video data in final recipe:`, {
      video_id: recipe.video_id,
      video_title: recipe.video_title,
      video_channel: recipe.video_channel
    });
    return recipe;
  } catch (error) {
    console.error("Error creating recipe:", error);
    return null;
  }
}

// server/routes.ts
init_auth();

// server/rateLimiter.ts
var RateLimiter = class {
  limits = /* @__PURE__ */ new Map();
  WINDOW_MS = 60 * 60 * 1e3;
  // 1 hour
  MAX_REQUESTS = 10;
  // 10 requests per hour for free users
  isAllowed(userId) {
    const now = Date.now();
    const userLimit = this.limits.get(userId);
    if (!userLimit || now > userLimit.resetTime) {
      this.limits.set(userId, {
        count: 1,
        resetTime: now + this.WINDOW_MS
      });
      return true;
    }
    if (userLimit.count >= this.MAX_REQUESTS) {
      return false;
    }
    userLimit.count++;
    return true;
  }
  getRemainingRequests(userId) {
    const userLimit = this.limits.get(userId);
    if (!userLimit || Date.now() > userLimit.resetTime) {
      return this.MAX_REQUESTS;
    }
    return Math.max(0, this.MAX_REQUESTS - userLimit.count);
  }
  getResetTime(userId) {
    const userLimit = this.limits.get(userId);
    if (!userLimit || Date.now() > userLimit.resetTime) {
      return Date.now() + this.WINDOW_MS;
    }
    return userLimit.resetTime;
  }
  cleanup() {
    const now = Date.now();
    for (const [userId, limit] of this.limits.entries()) {
      if (now > limit.resetTime) {
        this.limits.delete(userId);
      }
    }
  }
};
var rateLimiter = new RateLimiter();
setInterval(() => rateLimiter.cleanup(), 60 * 60 * 1e3);

// server/routes.ts
init_schema();
import jwt2 from "jsonwebtoken";
import Stripe from "stripe";
var YOUTUBE_API_KEY2 = process.env.YOUTUBE_API_KEY;
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil"
});
async function registerRoutes(app2) {
  app2.get("/test-auth", (req, res) => {
    const fs4 = __require("fs");
    const path5 = __require("path");
    const filePath = path5.join(__dirname, "../test-frontend-auth.html");
    fs4.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        res.status(404).send("Test file not found");
      } else {
        res.setHeader("Content-Type", "text/html");
        res.send(data);
      }
    });
  });
  app2.post("/api/auth/register", registerUser);
  app2.post("/api/auth/login", loginUser);
  app2.get("/api/auth/user", authenticateToken, getCurrentUser);
  app2.post("/api/auth/test-login", async (req, res) => {
    try {
      const testEmail = "test@example.com";
      const testPassword = "testuser123";
      const user = await storage.getUserByEmail(testEmail);
      if (!user) {
        const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
        const hashedPassword = await hashPassword2(testPassword);
        const newUser = await storage.createUser({
          email: testEmail,
          phone: "555-TEST-USER",
          password_hash: hashedPassword,
          full_name: "Test User"
        });
        const { generateToken: generateToken3 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
        const token2 = generateToken3(newUser.id.toString());
        const { password_hash: password_hash2, ...userWithoutPassword2 } = newUser;
        return res.json({
          user: userWithoutPassword2,
          token: token2,
          message: "Test user created and logged in successfully"
        });
      }
      const { generateToken: generateToken2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
      const token = generateToken2(user.id.toString());
      const { password_hash, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        token,
        message: "Test user login successful"
      });
    } catch (error) {
      console.error("Test login error:", error);
      res.status(500).json({ message: "Test login failed" });
    }
  });
  app2.post("/api/auth/reset-test-user", async (req, res) => {
    try {
      const testEmail = "test@example.com";
      const existingUser = await storage.getUserByEmail(testEmail);
      if (!existingUser) {
        return res.status(404).json({ message: "Test user not found" });
      }
      const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
      const defaultPassword = "testuser123";
      const hashedPassword = await hashPassword2(defaultPassword);
      await storage.updateUser(existingUser.id, {
        password_hash: hashedPassword
      });
      res.json({
        message: "Test user reset successfully. Password is now 'testuser123'",
        email: testEmail
      });
    } catch (error) {
      console.error("Test user reset error:", error);
      res.status(500).json({ message: "Failed to reset test user" });
    }
  });
  app2.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, paymentType } = req.body;
      let paymentAmount;
      let description;
      if (paymentType === "founders") {
        paymentAmount = 9900;
        description = "Healthy Mama Founders Offer - Lifetime Access";
      } else if (paymentType === "trial") {
        paymentAmount = 0;
        description = "Healthy Mama 21-Day Premium Trial Setup";
      } else {
        paymentAmount = Math.round((amount || 0) * 100);
        description = "Healthy Mama Payment";
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: paymentAmount,
        currency: "usd",
        description,
        metadata: {
          paymentType: paymentType || "general"
        }
      });
      res.json({
        clientSecret: paymentIntent.client_secret,
        amount: paymentAmount / 100
        // Send back amount in dollars
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({
        message: "Error creating payment intent: " + error.message
      });
    }
  });
  app2.post("/api/create-trial-subscription", async (req, res) => {
    try {
      const { email, name } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const customer = await stripe.customers.create({
        email,
        name: name || "",
        metadata: {
          trialType: "21-day-premium"
        }
      });
      const setupIntent = await stripe.setupIntents.create({
        customer: customer.id,
        payment_method_types: ["card"],
        usage: "off_session",
        metadata: {
          type: "21-day-trial"
        }
      });
      res.json({
        customerId: customer.id,
        clientSecret: setupIntent.client_secret,
        message: "Trial setup created successfully"
      });
    } catch (error) {
      console.error("Error creating trial subscription:", error);
      res.status(500).json({
        message: "Error setting up trial: " + error.message
      });
    }
  });
  app2.post("/api/recipes/generate", async (req, res) => {
    try {
      const {
        recipeType,
        cuisine,
        dietRestrictions,
        cookingTime,
        availableIngredients,
        excludeIngredients,
        description,
        difficulty,
        preferYouTube,
        generationMode,
        skipNutrition,
        skipVideoEnhancement
      } = req.body;
      if (!description) {
        return res.status(400).json({ message: "Recipe description is required" });
      }
      console.log(`Recipe generation request: ${description}`);
      console.log(`Generation mode: ${generationMode || "legacy"}`);
      let recipe;
      if (generationMode === "fast") {
        console.log("Fast mode: Finding YouTube video suggestion with Spoonacular time");
        try {
          let spoonacularTime = 30;
          if (process.env.SPOONACULAR_API_KEY) {
            try {
              const params = new URLSearchParams({
                apiKey: process.env.SPOONACULAR_API_KEY,
                query: description,
                number: "1",
                addRecipeInformation: "true"
              });
              if (cuisine && cuisine !== "Any Cuisine") {
                params.append("cuisine", cuisine.toLowerCase());
              }
              if (dietRestrictions && dietRestrictions !== "None") {
                params.append("diet", dietRestrictions.toLowerCase());
              }
              if (cookingTime && cookingTime !== "Any Time") {
                const timeMap = {
                  "Under 15 min": 15,
                  "Under 30 min": 30,
                  "Under 1 hour": 60,
                  "1+ hours": 999
                };
                const maxTime = timeMap[cookingTime];
                if (maxTime) {
                  params.append("maxReadyTime", maxTime.toString());
                }
              }
              const spoonacularUrl = `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`;
              const response = await fetch5(spoonacularUrl);
              const data = await response.json();
              if (data.results && data.results.length > 0) {
                spoonacularTime = data.results[0].readyInMinutes || 30;
                console.log(`Using Spoonacular cooking time: ${spoonacularTime} minutes`);
              }
            } catch (spoonError) {
              console.log("Spoonacular lookup failed, using default time");
            }
          }
          const videoInfo = await findBestRecipeVideo(description, {
            cuisine,
            diet: dietRestrictions,
            cookingTime,
            availableIngredients,
            excludeIngredients
          }, spoonacularTime);
          if (videoInfo) {
            recipe = {
              title: videoInfo.title,
              description: `Watch this video: "${videoInfo.title}" by ${videoInfo.channelTitle}`,
              image_url: videoInfo.thumbnailUrl,
              time_minutes: spoonacularTime,
              // Use Spoonacular time instead of default
              cuisine: cuisine || "Any Cuisine",
              diet: dietRestrictions || "None",
              ingredients: [`Watch the video for ingredients`],
              instructions: [`Follow along with the video: ${videoInfo.title}`],
              source_url: `https://www.youtube.com/watch?v=${videoInfo.id}`,
              source_name: videoInfo.channelTitle,
              video_id: videoInfo.id,
              video_title: videoInfo.title,
              video_channel: videoInfo.channelTitle,
              total_nutrition: {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                fiber: 0,
                sugar: 0,
                sodium: 0
              }
            };
          } else {
            return res.status(404).json({ message: "No suitable video found for your query" });
          }
        } catch (error) {
          console.error("Fast mode video search failed:", error);
          return res.status(500).json({ message: "Failed to find video suggestion" });
        }
      } else {
        console.log("Detailed mode: Generating complete recipe");
        try {
          const youtubeRecipe = await getRecipeFromYouTube(description, {
            cuisine,
            diet: dietRestrictions,
            cookingTime,
            availableIngredients,
            excludeIngredients
          });
          if (youtubeRecipe) {
            console.log("Successfully extracted recipe data from YouTube");
            console.log(`Recipe has ${youtubeRecipe.ingredients.length} ingredients and ${youtubeRecipe.instructions.length} instructions`);
            youtubeRecipe.cuisine = cuisine || youtubeRecipe.cuisine;
            youtubeRecipe.diet = dietRestrictions || youtubeRecipe.diet;
            youtubeRecipe.image_url = youtubeRecipe.thumbnailUrl || youtubeRecipe.image_url;
            recipe = youtubeRecipe;
          } else {
            console.log("No suitable YouTube recipe found, falling back to Grok");
            recipe = await generateRecipeWithGrok({
              recipeType,
              cuisine,
              dietRestrictions,
              cookingTime,
              availableIngredients,
              excludeIngredients,
              description
            });
          }
        } catch (youtubeError) {
          console.error("YouTube recipe extraction failed, falling back to Grok:", youtubeError);
          recipe = await generateRecipeWithGrok({
            recipeType,
            cuisine,
            dietRestrictions,
            cookingTime,
            availableIngredients,
            excludeIngredients,
            description
          });
        }
      }
      if (recipe) {
        if (generationMode === "detailed" && recipe.ingredients && recipe.ingredients.length > 0) {
          try {
            const { calculateRecipeNutrition: calculateRecipeNutrition2 } = await Promise.resolve().then(() => (init_nutritionCalculator(), nutritionCalculator_exports));
            const getUSDANutrition = async (foodName) => {
              try {
                console.log(`Looking up USDA nutrition for: "${foodName}"`);
                const searchResponse = await fetch5(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(foodName)}&api_key=${process.env.USDA_API_KEY}&pageSize=1`);
                if (searchResponse.ok) {
                  const searchData = await searchResponse.json();
                  if (searchData.foods && searchData.foods.length > 0) {
                    const foodId = searchData.foods[0].fdcId;
                    console.log(`Found USDA food ID ${foodId} for "${foodName}"`);
                    const nutritionResponse = await fetch5(`https://api.nal.usda.gov/fdc/v1/food/${foodId}?api_key=${process.env.USDA_API_KEY}`);
                    if (nutritionResponse.ok) {
                      const nutritionData2 = await nutritionResponse.json();
                      const nutrients = nutritionData2.foodNutrients || [];
                      let nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 };
                      nutrients.forEach((nutrient) => {
                        const name = nutrient.nutrient?.name?.toLowerCase() || "";
                        const value = parseFloat(nutrient.amount) || 0;
                        if (name.includes("energy")) nutrition.calories = value;
                        else if (name.includes("protein")) nutrition.protein = value;
                        else if (name.includes("carbohydrate")) nutrition.carbs = value;
                        else if (name.includes("total lipid") || name.includes("fat")) nutrition.fat = value;
                        else if (name.includes("fiber")) nutrition.fiber = value;
                        else if (name.includes("sugars")) nutrition.sugar = value;
                        else if (name.includes("sodium")) nutrition.sodium = value;
                      });
                      console.log(`USDA nutrition for "${foodName}": ${nutrition.calories}cal, ${nutrition.protein}g protein`);
                      return nutrition;
                    } else {
                      console.log(`Failed to get nutrition data for food ID ${foodId}`);
                    }
                  } else {
                    console.log(`No USDA foods found for "${foodName}"`);
                  }
                } else {
                  console.log(`USDA search failed for "${foodName}": ${searchResponse.status}`);
                }
                return null;
              } catch (error) {
                console.error(`Error fetching USDA nutrition for ${foodName}:`, error);
                return null;
              }
            };
            const nutritionData = await calculateRecipeNutrition2(recipe, getUSDANutrition);
            recipe.nutrition_info = {
              calories: nutritionData.perServing.calories,
              protein_g: nutritionData.perServing.protein,
              carbs_g: nutritionData.perServing.carbs,
              fat_g: nutritionData.perServing.fat,
              fiber_g: nutritionData.perServing.fiber,
              sugar_g: nutritionData.perServing.sugar,
              sodium_mg: nutritionData.perServing.sodium,
              servings: nutritionData.servings,
              total_calories: nutritionData.calories
            };
            console.log(`Added per-serving nutrition: ${nutritionData.perServing.calories}cal per serving (${nutritionData.servings} servings total, ${nutritionData.calories} total calories)`);
          } catch (nutritionError) {
            console.log("Nutrition calculation failed:", nutritionError.message);
            console.log("Proceeding without nutrition data");
          }
        }
        console.log("Recipe video data before saving:", {
          video_id: recipe.video_id,
          video_title: recipe.video_title,
          video_channel: recipe.video_channel
        });
        const recipeToSave = {
          ...recipe,
          video_id: recipe.video_id || null,
          video_title: recipe.video_title || null,
          video_channel: recipe.video_channel || null,
          time_minutes: recipe.time_minutes || recipe.timeMinutes || 30,
          // Default to 30 min if not set
          image_url: recipe.image_url || recipe.imageUrl || `https://source.unsplash.com/800x600/?food,${encodeURIComponent(recipe.title.toLowerCase())},cooking,delicious`
        };
        let familiarTitle = recipeToSave.title;
        try {
          const { mapToFamiliarDishName: mapToFamiliarDishName2 } = await Promise.resolve().then(() => (init_familiarDishNameMapper(), familiarDishNameMapper_exports));
          const mapping = mapToFamiliarDishName2(
            recipeToSave.title,
            "unknown",
            // default cuisine type if not available
            recipeToSave.ingredients
          );
          if (mapping.confidence > 0.6) {
            console.log(`\u{1F4DD} Dish name mapping: "${recipeToSave.title}" \u2192 "${mapping.familiarName}" (${mapping.cuisine}, confidence: ${mapping.confidence})`);
            familiarTitle = mapping.familiarName;
          }
        } catch (mappingError) {
          console.warn("Dish name mapping error:", mappingError);
        }
        let finalRecipe = { ...recipeToSave, title: familiarTitle };
        if (dietRestrictions) {
          try {
            const { validateRecipeDietaryCompliance: validateRecipeDietaryCompliance2, getSuggestedRecipeFixes: getSuggestedRecipeFixes2 } = await Promise.resolve().then(() => (init_dietaryValidationService(), dietaryValidationService_exports));
            const validation = await validateRecipeDietaryCompliance2(recipeToSave, [dietRestrictions]);
            console.log(`\u{1F50D} Dietary validation: ${validation.isCompliant ? "PASS" : "FAIL"} (${validation.violations.length} violations)`);
            if (!validation.isCompliant) {
              console.warn(`\u274C Dietary violations detected for "${dietRestrictions}":`, validation.violations.map((v) => v.ingredient));
              const fixedRecipe = await getSuggestedRecipeFixes2(recipeToSave, validation, [dietRestrictions]);
              const revalidation = await validateRecipeDietaryCompliance2(fixedRecipe, [dietRestrictions]);
              if (revalidation.isCompliant) {
                console.log(`\u2705 Recipe automatically fixed for dietary compliance`);
                finalRecipe = fixedRecipe;
              } else {
                console.warn(`\u26A0\uFE0F Could not fully fix recipe, serving with warnings`);
                finalRecipe.dietary_warnings = validation.suggestions;
                finalRecipe.dietary_compliance_score = validation.confidence;
              }
            } else {
              console.log(`\u2705 Recipe passes dietary validation for "${dietRestrictions}"`);
            }
          } catch (validationError) {
            console.error("Dietary validation error:", validationError);
          }
        }
        const savedRecipe = await storage.createRecipe(finalRecipe);
        console.log("Returning recipe with video data:", {
          id: savedRecipe.id,
          title: savedRecipe.title,
          video_id: savedRecipe.video_id,
          video_title: savedRecipe.video_title,
          video_channel: savedRecipe.video_channel,
          dietary_validated: !!dietRestrictions
        });
        return res.json(savedRecipe);
      } else {
        return res.status(500).json({ message: "Failed to generate recipe" });
      }
    } catch (error) {
      console.error("Error generating recipe:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return res.status(500).json({ message: `Failed to generate recipe: ${errorMessage}` });
    }
  });
  app2.get("/api/recipes/popular", async (_req, res) => {
    try {
      const recipes2 = await storage.getPopularRecipes();
      res.json(recipes2);
    } catch (error) {
      console.error("Error fetching popular recipes:", error);
      res.status(500).json({ message: "Failed to fetch popular recipes" });
    }
  });
  app2.get("/api/recipes/saved", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId) : void 0;
      const recipes2 = await storage.getSavedRecipes(userId);
      res.json(recipes2);
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
      res.status(500).json({ message: "Failed to fetch saved recipes" });
    }
  });
  app2.get("/api/recipes/generated", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId) : void 0;
      const recipes2 = await storage.getGeneratedRecipes(userId);
      res.json(recipes2);
    } catch (error) {
      console.error("Error fetching generated recipes:", error);
      res.status(500).json({ message: "Failed to fetch generated recipes" });
    }
  });
  app2.post("/api/recipes/:id/save", async (req, res) => {
    try {
      const recipeId = parseInt(req.params.id);
      if (isNaN(recipeId)) {
        console.log(`Invalid recipe ID: ${req.params.id}`);
        return res.status(400).json({ message: "Invalid recipe ID" });
      }
      console.log(`Attempting to save recipe ${recipeId}`);
      const recipe = await storage.getRecipeById(recipeId);
      if (!recipe) {
        console.log(`Recipe ${recipeId} not found in database`);
        return res.status(404).json({ message: "Recipe not found" });
      }
      const savedRecipe = await storage.saveRecipe(recipeId);
      if (savedRecipe) {
        console.log(`Recipe ${recipeId} saved successfully:`, savedRecipe);
        res.json({
          message: "Recipe saved successfully",
          recipe: savedRecipe,
          success: true
        });
      } else {
        console.log(`Failed to save recipe ${recipeId} - storage returned null`);
        res.status(500).json({ message: "Failed to save recipe - storage error" });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : void 0;
      console.error("Error saving recipe:", {
        recipeId: req.params.id,
        error: errorMessage,
        stack: errorStack
      });
      res.status(500).json({
        message: "Failed to save recipe",
        error: errorMessage,
        success: false
      });
    }
  });
  app2.delete("/api/recipes/:id/save", async (req, res) => {
    try {
      const recipeId = parseInt(req.params.id);
      if (isNaN(recipeId)) {
        console.log(`Invalid recipe ID for unsave: ${req.params.id}`);
        return res.status(400).json({ message: "Invalid recipe ID" });
      }
      console.log(`Attempting to unsave recipe ${recipeId}`);
      const result = await storage.unsaveRecipe(recipeId);
      console.log(`Recipe ${recipeId} unsaved successfully, result:`, result);
      res.json({
        message: "Recipe unsaved successfully",
        success: true
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : void 0;
      console.error("Error unsaving recipe:", {
        recipeId: req.params.id,
        error: errorMessage,
        stack: errorStack
      });
      res.status(500).json({
        message: "Failed to unsave recipe",
        error: errorMessage,
        success: false
      });
    }
  });
  app2.post("/api/recipes/instacart", async (req, res) => {
    try {
      const recipe = req.body;
      if (!recipe || !recipe.title) {
        return res.status(400).json({ message: "Recipe data is required" });
      }
      const shoppableRecipe = await createInstacartRecipePage(recipe);
      res.json(shoppableRecipe);
    } catch (error) {
      console.error("Error creating shoppable recipe:", error);
      res.status(500).json({ message: "Failed to create shoppable recipe" });
    }
  });
  app2.post("/api/instacart/create-list", async (req, res) => {
    try {
      const { ingredients, recipeName } = req.body;
      if (!ingredients || !Array.isArray(ingredients) || !recipeName) {
        return res.status(400).json({ message: "Recipe ingredients and name are required" });
      }
      const formattedIngredients = ingredients.map((ingredient, index2) => ({
        name: ingredient,
        display_text: ingredient,
        measurements: [{
          quantity: 1,
          unit: "item"
        }]
      }));
      const recipeData = {
        title: recipeName,
        image_url: "",
        // Optional - can be empty
        link_type: "recipe",
        instructions: ["Follow the recipe instructions"],
        ingredients: formattedIngredients,
        landing_page_configuration: {
          partner_linkback_url: process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : "https://example.com",
          enable_pantry_items: true
        }
      };
      const shoppableRecipe = await createInstacartRecipePage(recipeData);
      res.json({
        shopping_url: shoppableRecipe?.products_link_url || shoppableRecipe?.link_url || shoppableRecipe?.url,
        ...shoppableRecipe
      });
    } catch (error) {
      console.error("Error creating Instacart shopping list:", error);
      res.status(500).json({ message: "Failed to create shopping list" });
    }
  });
  app2.get("/api/meal-plans/saved", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const savedPlans = await storage.getSavedMealPlans(Number(userId));
      console.log("Raw meal plans from DB:", JSON.stringify(savedPlans.slice(0, 1), null, 2));
      const formattedPlans = savedPlans.map((plan) => {
        const { mealPlan, ...planWithoutMealPlan } = plan;
        return {
          ...planWithoutMealPlan,
          meal_plan: mealPlan
          // Map camelCase DB field to snake_case frontend field
        };
      });
      console.log("Formatted meal plans for frontend:", JSON.stringify(formattedPlans.slice(0, 1), null, 2));
      res.json(formattedPlans);
    } catch (error) {
      console.error("Error fetching saved meal plans:", error);
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });
  app2.post("/api/meal-plans", authenticateToken, async (req, res) => {
    try {
      console.log("\u{1F50D} MEAL PLAN SAVE DEBUG:");
      console.log("   - Request headers:", req.headers.authorization ? "Authorization Present" : "No Auth Header");
      console.log("   - User from token:", req.user?.id || "No user ID");
      console.log("   - Request body keys:", Object.keys(req.body));
      const userId = req.user?.id;
      if (!userId) {
        console.log("\u274C SAVE FAILED: User not authenticated");
        return res.status(401).json({ message: "User not authenticated" });
      }
      const { name, description, meal_plan, is_auto_saved } = req.body;
      console.log("   - Plan name:", name);
      console.log("   - Meal plan exists:", !!meal_plan);
      console.log("   - Meal plan days:", meal_plan ? Object.keys(meal_plan) : "none");
      if (!name || !meal_plan) {
        console.log("\u274C SAVE FAILED: Missing required fields");
        return res.status(400).json({ message: "Name and meal plan are required" });
      }
      if (typeof meal_plan !== "object" || meal_plan === null) {
        console.log("\u274C SAVE FAILED: meal_plan is not an object");
        return res.status(400).json({ message: "Invalid meal plan structure" });
      }
      const dayKeys = Object.keys(meal_plan);
      if (dayKeys.length === 0) {
        console.log("\u274C SAVE FAILED: meal_plan has no days");
        return res.status(400).json({ message: "Meal plan must contain at least one day" });
      }
      for (const dayKey of dayKeys) {
        const dayMeals = meal_plan[dayKey];
        if (!dayMeals || typeof dayMeals !== "object" || Object.keys(dayMeals).length === 0) {
          console.log(`\u274C SAVE FAILED: ${dayKey} has no meals`);
          return res.status(400).json({ message: `Day ${dayKey} must contain at least one meal` });
        }
      }
      console.log("\u{1F4BE} Calling storage.saveMealPlan...");
      const savedPlan = await storage.saveMealPlan({
        userId: Number(userId),
        name,
        description: description || "",
        mealPlan: meal_plan,
        isAutoSaved: is_auto_saved || false
      });
      console.log("\u2705 SAVE SUCCESS:", savedPlan?.id || "unknown ID");
      const allUserPlans = await storage.getSavedMealPlans(Number(userId));
      const isFirstMealPlan = allUserPlans.length === 1;
      res.json({
        ...savedPlan,
        achievements: {
          firstMealPlan: isFirstMealPlan
        }
      });
    } catch (error) {
      console.error("\u274C SAVE ERROR:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to save meal plan", error: errorMessage });
    }
  });
  app2.put("/api/meal-plans/:id", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      const planId = Number(req.params.id);
      const { name, description, meal_plan } = req.body;
      console.log("Update request - planId:", planId, "name:", name, "meal_plan exists:", !!meal_plan, "meal_plan type:", typeof meal_plan);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      if (!name || !meal_plan) {
        return res.status(400).json({ message: "Name and meal plan are required" });
      }
      const updatedPlan = await storage.updateMealPlan(planId, Number(userId), {
        name,
        description: description || "",
        mealPlan: meal_plan
      });
      if (!updatedPlan) {
        return res.status(404).json({ message: "Meal plan not found or unauthorized" });
      }
      console.log("Meal plan updated successfully:", updatedPlan.id);
      if (!updatedPlan) {
        return res.status(500).json({ message: "Update failed - no data returned" });
      }
      res.json(updatedPlan);
    } catch (error) {
      console.error("Error updating meal plan:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to update meal plan", error: errorMessage });
    }
  });
  app2.delete("/api/meal-plans/:id", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      const planId = Number(req.params.id);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const deleted = await storage.deleteMealPlan(planId, Number(userId));
      if (!deleted) {
        return res.status(404).json({ message: "Meal plan not found or unauthorized" });
      }
      console.log("Meal plan deleted successfully:", planId);
      res.json({ message: "Meal plan deleted successfully", success: true });
    } catch (error) {
      console.error("Error deleting meal plan:", error);
      res.status(500).json({ message: "Failed to delete meal plan" });
    }
  });
  app2.get("/api/meal-plans/:id/completions", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      const mealPlanId = Number(req.params.id);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const completions = await storage.getMealCompletions(Number(userId), mealPlanId);
      res.json(completions);
    } catch (error) {
      console.error("Error fetching meal completions:", error);
      res.status(500).json({ message: "Failed to fetch meal completions" });
    }
  });
  app2.post("/api/meal-plans/:id/completions/toggle", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      const mealPlanId = Number(req.params.id);
      const { dayKey, mealType } = req.body;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      if (!dayKey || !mealType) {
        return res.status(400).json({ message: "dayKey and mealType are required" });
      }
      const completion = await storage.toggleMealCompletion(Number(userId), mealPlanId, dayKey, mealType);
      res.json(completion);
    } catch (error) {
      console.error("Error toggling meal completion:", error);
      res.status(500).json({ message: "Failed to toggle meal completion" });
    }
  });
  app2.post("/api/meal-plans/:id/complete", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      const mealPlanId = Number(req.params.id);
      console.log(`\u{1F680} ROUTE DEBUG: Complete plan request - userId: ${userId}, mealPlanId: ${mealPlanId}`);
      if (!userId) {
        console.log(`\u274C ROUTE DEBUG: User not authenticated`);
        return res.status(401).json({ message: "User not authenticated" });
      }
      console.log(`\u2705 ROUTE DEBUG: User authenticated, calling storage.completeMealPlan`);
      const completedPlan = await storage.completeMealPlan(Number(userId), mealPlanId);
      console.log(`\u{1F4CA} ROUTE DEBUG: Storage returned:`, completedPlan ? "Plan object" : "null");
      if (!completedPlan) {
        console.log(`\u274C ROUTE DEBUG: No plan returned from storage, sending 404`);
        return res.status(404).json({ message: "Meal plan not found or unauthorized" });
      }
      console.log(`\u2705 ROUTE DEBUG: Plan completed successfully, sending response`);
      res.json({ message: "Meal plan completed successfully", plan: completedPlan });
    } catch (error) {
      console.error("\u274C ROUTE DEBUG: Error completing meal plan:", error);
      res.status(500).json({ message: "Failed to complete meal plan" });
    }
  });
  app2.get("/api/meal-plan/latest", async (req, res) => {
    try {
      return res.status(404).json({ message: "No recent meal plan found" });
    } catch (error) {
      console.error("Error fetching latest meal plan:", error);
      res.status(500).json({ message: "Failed to fetch latest meal plan" });
    }
  });
  app2.post("/api/meal-plan/generate", async (req, res) => {
    const startTime = Date.now();
    try {
      let userId = "anonymous";
      const authHeader = req.headers.authorization;
      console.log("\u{1F50D} JWT DEBUG - Authorization header:", authHeader ? "Present" : "Missing");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const token = authHeader.substring(7);
          console.log("\u{1F50D} JWT DEBUG - Token length:", token.length);
          console.log("\u{1F50D} JWT DEBUG - JWT_SECRET available:", !!process.env.JWT_SECRET);
          const decoded = jwt2.verify(token, process.env.JWT_SECRET);
          userId = decoded.userId;
          console.log("\u{1F50D} JWT DEBUG - Decoded userId:", userId);
          console.log("\u{1F50D} JWT DEBUG - Decoded token payload:", { userId: decoded.userId, email: decoded.email });
        } catch (error) {
          console.log("\u274C JWT DEBUG - Token verification failed:", error.message);
          userId = req.ip || "anonymous";
        }
      } else {
        console.log("\u{1F50D} JWT DEBUG - No Bearer token found");
        userId = req.ip || "anonymous";
      }
      if (!rateLimiter.isAllowed(userId)) {
        return res.status(429).json({
          message: "Rate limit exceeded. Please try again later.",
          remainingRequests: rateLimiter.getRemainingRequests(userId),
          resetTime: rateLimiter.getResetTime(userId)
        });
      }
      const {
        numDays,
        mealsPerDay,
        cookTime,
        difficulty,
        nutritionGoal,
        dietaryRestrictions,
        availableIngredients,
        excludeIngredients,
        primaryGoal,
        selectedFamilyMembers = [],
        useIntelligentPrompt = true,
        culturalBackground = [],
        planTargets = ["Everyone"]
        // New parameter for family member targeting (array)
      } = req.body;
      let userProfile = null;
      let culturalCuisineData = null;
      try {
        if (userId !== "anonymous" && useIntelligentPrompt) {
          console.log("Attempting to fetch user profile for userId:", userId);
          const userIdNum = parseInt(userId.toString());
          userProfile = await storage.getProfile(userIdNum);
          console.log("User profile found:", userProfile);
          if (userProfile && userProfile.cultural_background && Array.isArray(userProfile.cultural_background) && userProfile.cultural_background.length > 0) {
            console.log("User has cultural background:", userProfile.cultural_background);
            const { getCachedCulturalCuisine: getCachedCulturalCuisine2 } = await Promise.resolve().then(() => (init_cultureCacheManager(), cultureCacheManager_exports));
            culturalCuisineData = await getCachedCulturalCuisine2(userIdNum, userProfile.cultural_background);
            console.log(`Retrieved cultural cuisine data for: ${userProfile.cultural_background.join(", ")}`);
            console.log("Cultural cuisine data structure:", Object.keys(culturalCuisineData || {}));
          }
        } else {
          console.log("Skipping user profile fetch - userId:", userId, "useIntelligentPrompt:", useIntelligentPrompt);
        }
      } catch (error) {
        console.log("Could not fetch user profile, using basic prompt. Error:", error);
      }
      let prompt;
      const dayStructure = [];
      for (let i = 1; i <= numDays; i++) {
        dayStructure.push(`"day_${i}"`);
      }
      if (useIntelligentPrompt && (userProfile || culturalBackground.length > 0)) {
        const { buildIntelligentPrompt: buildIntelligentPrompt3 } = await Promise.resolve().then(() => (init_intelligentPromptBuilder(), intelligentPromptBuilder_exports));
        const { mergeFamilyDietaryRestrictions: mergeFamilyDietaryRestrictions2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const profileRestrictions = userProfile?.preferences || [];
        const familyMembers = Array.isArray(userProfile?.members) ? userProfile.members : [];
        const familyRestrictions = mergeFamilyDietaryRestrictions2(familyMembers);
        const allRestrictions = /* @__PURE__ */ new Set();
        if (dietaryRestrictions) {
          dietaryRestrictions.split(",").forEach((r) => {
            const trimmed = r.trim();
            if (trimmed) allRestrictions.add(trimmed);
          });
        }
        if (Array.isArray(familyRestrictions)) {
          familyRestrictions.forEach((r) => allRestrictions.add(r));
        }
        if (Array.isArray(profileRestrictions)) {
          profileRestrictions.forEach((r) => allRestrictions.add(r));
        }
        const mergedRestrictions = Array.from(allRestrictions).join(", ");
        console.log("Merged dietary restrictions:", mergedRestrictions);
        const filters = {
          numDays,
          mealsPerDay,
          cookTime,
          difficulty,
          nutritionGoal,
          dietaryRestrictions: mergedRestrictions,
          // Use merged restrictions
          availableIngredients,
          excludeIngredients,
          primaryGoal: primaryGoal || userProfile?.primary_goal,
          familySize: userProfile?.family_size || void 0,
          familyMembers,
          profileType: userProfile?.profile_type || "individual",
          // UNIFIED: Set intelligent defaults based on primary goal across entire system
          encourageOverlap: primaryGoal === "Save Money" || userProfile?.primary_goal === "Save Money",
          availableIngredientUsagePercent: primaryGoal === "Save Money" ? 80 : 60,
          // Add cultural cuisine data
          culturalCuisineData,
          culturalBackground: userProfile?.cultural_background || culturalBackground || []
        };
        prompt = await buildIntelligentPrompt3(filters);
        console.log("Using intelligent prompt with family profile data");
      } else {
        prompt = `Create exactly a ${numDays}-day meal plan with ${mealsPerDay} meals per day.

CRITICAL: You must generate exactly ${numDays} days. Generate days: ${dayStructure.join(", ")}.

Requirements:
- Vary proteins: chicken, fish, beef, turkey, plant-based, eggs
- Mix cuisines: Italian, Asian, Mexican, Mediterranean  
- Max cook time: ${cookTime} minutes
- Difficulty: MAXIMUM ${difficulty}/5 (use 0.5 increments: 1, 1.5, 2, 2.5, 3, etc.)
- CRITICAL: ALL recipes must have difficulty <= ${difficulty}
- Use precise difficulty ratings in 0.5 increments for accurate complexity assessment
- Goal: ${nutritionGoal || "balanced nutrition"}`;
        if (dietaryRestrictions) {
          prompt += `
- Dietary restrictions: ${dietaryRestrictions}`;
        }
        if (availableIngredients) {
          prompt += `
- Use these ingredients: ${availableIngredients}`;
        }
        if (excludeIngredients) {
          prompt += `
- Avoid these ingredients: ${excludeIngredients}`;
        }
        if (selectedFamilyMembers && selectedFamilyMembers.length > 0) {
          prompt += `
- Creating meal plan for: ${selectedFamilyMembers.join(", ")}`;
          prompt += `
- Consider preferences and portions for ${selectedFamilyMembers.length} selected family members`;
        }
        if (primaryGoal === "Save Money") {
          prompt += `
- COST OPTIMIZATION: Maximize ingredient reuse across meals to minimize shopping costs`;
          prompt += `
- Aim for 3+ shared ingredients between different meals`;
          prompt += `
- Suggest bulk buying opportunities when possible`;
        } else if (primaryGoal === "Gain Muscle") {
          prompt += `
- MUSCLE BUILDING: Focus on high-protein meals (25-35g protein per meal)`;
          prompt += `
- Include complete proteins like chicken, fish, eggs, legumes`;
        } else if (primaryGoal === "Lose Weight") {
          prompt += `
- WEIGHT MANAGEMENT: Create calorie-controlled, satisfying meals`;
          prompt += `
- Prioritize high-volume, low-calorie foods like vegetables`;
        } else if (primaryGoal === "Family Nutrition") {
          prompt += `
- FAMILY-FRIENDLY: Create meals that appeal to all family members`;
          prompt += `
- Include kid-friendly options that are still nutritious`;
        }
        const mealTypes = ["breakfast", "lunch", "dinner", "snack"];
        const selectedMealTypes = mealTypes.slice(0, mealsPerDay);
        const exampleDays = [];
        for (let i = 1; i <= Math.min(numDays, 3); i++) {
          if (i === 1) {
            const mealsExample = selectedMealTypes.map((mealType, index2) => {
              const calories = 350 + index2 * 50;
              const protein = 20 + index2 * 5;
              const carbs = 30 + index2 * 5;
              const fat = 15 + index2 * 3;
              return `        "${mealType}": {"title": "Recipe Name", "cook_time_minutes": ${15 + index2 * 5}, "difficulty": ${difficulty}, "ingredients": ["ingredient ${index2 + 1}"], "instructions": ["step ${index2 + 1}"], "nutrition": {"calories": ${calories}, "protein_g": ${protein}, "carbs_g": ${carbs}, "fat_g": ${fat}}}`;
            }).join(",\n");
            exampleDays.push(`    "day_${i}": {
${mealsExample}
      }`);
          } else {
            exampleDays.push(`    "day_${i}": { ... similar structure with ${mealsPerDay} meals ... }`);
          }
        }
        if (numDays > 3) {
          exampleDays.push(`    ... continue for all ${numDays} days ...`);
        }
        prompt += `

IMPORTANT: Generate ALL ${numDays} days in this exact JSON format:
{
  "meal_plan": {
${exampleDays.join(",\n")}
  },
  "shopping_list": ["ingredient list"],
  "prep_tips": ["tip 1", "tip 2"]
}

Remember: You MUST include all ${numDays} days (${dayStructure.join(", ")}) in the meal_plan object.`;
      }
      const response = await fetch5("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a meal planning expert. You MUST generate exactly the requested number of days. Follow the user's specifications precisely and generate complete meal plans with all requested days. Always return valid JSON.`
            },
            {
              role: "user",
              content: prompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
          // Lower for more consistent adherence to requirements
          max_tokens: 4e3
          // Increased to ensure all days fit
        })
      });
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }
      const data = await response.json();
      let mealPlan;
      try {
        const content = data.choices[0].message.content;
        if (!content || content.trim() === "") {
          throw new Error("Empty response from AI");
        }
        mealPlan = JSON.parse(content);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("AI Response:", data.choices[0].message.content);
        throw new Error("Invalid response format from AI. Please try again.");
      }
      if (!mealPlan.meal_plan || typeof mealPlan.meal_plan !== "object") {
        throw new Error("Invalid meal plan structure - missing meal_plan object");
      }
      validateAndRoundDifficulties(mealPlan.meal_plan, difficulty);
      let finalMealPlan = mealPlan;
      if (dietaryRestrictions) {
        try {
          const { validateMealPlanDietaryCompliance: validateMealPlanDietaryCompliance2 } = await Promise.resolve().then(() => (init_dietaryValidationService(), dietaryValidationService_exports));
          const validation = await validateMealPlanDietaryCompliance2(mealPlan, [dietaryRestrictions]);
          console.log(`\u{1F50D} Meal plan dietary validation: ${validation.overallCompliance}% compliance (${validation.compliantMeals}/${validation.totalMeals} meals)`);
          if (validation.overallCompliance < 80) {
            console.warn(`\u274C Low dietary compliance for "${dietaryRestrictions}":`, validation.summary);
            finalMealPlan.dietary_validation = {
              compliance_score: validation.overallCompliance,
              compliant_meals: validation.compliantMeals,
              total_meals: validation.totalMeals,
              violations_summary: validation.summary,
              validation_timestamp: (/* @__PURE__ */ new Date()).toISOString()
            };
            Object.entries(validation.violations).forEach(([mealKey, result]) => {
              console.warn(`  - ${mealKey}: ${result.violations.length} violations`);
            });
          } else {
            console.log(`\u2705 Meal plan passes dietary validation for "${dietaryRestrictions}" (${validation.overallCompliance}% compliance)`);
            finalMealPlan.dietary_validation = {
              compliance_score: validation.overallCompliance,
              compliant_meals: validation.compliantMeals,
              total_meals: validation.totalMeals,
              validation_timestamp: (/* @__PURE__ */ new Date()).toISOString()
            };
          }
        } catch (validationError) {
          console.error("Meal plan dietary validation error:", validationError);
        }
      }
      try {
        const { enhanceMealPlanNames: enhanceMealPlanNames2 } = await Promise.resolve().then(() => (init_mealPlanEnhancer(), mealPlanEnhancer_exports));
        const culturalBackgroundArray = userProfile?.cultural_background || [];
        const enhancement = await enhanceMealPlanNames2(
          finalMealPlan,
          culturalBackgroundArray
        );
        console.log(`\u{1F4DD} Meal plan enhancement: ${enhancement.enhancementStats.familiarNameChanges} name changes, ${enhancement.enhancementStats.cuisineCorrections} cuisine corrections`);
        console.log(`   Average naming confidence: ${(enhancement.enhancementStats.averageConfidence * 100).toFixed(1)}%`);
        if (enhancement.enhancementStats.familiarNameChanges > 0) {
          finalMealPlan = enhancement.enhancedMealPlan;
          console.log("   Enhanced meal names:");
          enhancement.enhancementLog.slice(0, 3).forEach((log2) => console.log(`     ${log2}`));
        }
      } catch (enhancementError) {
        console.error("Meal plan enhancement error:", enhancementError);
      }
      const dayCount = Object.keys(finalMealPlan.meal_plan).length;
      console.log(`Generated meal plan has ${dayCount} days, expected ${numDays}`);
      if (dayCount !== numDays) {
        console.error(`CRITICAL ERROR: Day count mismatch: generated ${dayCount}, expected ${numDays}`);
        throw new Error(`AI generated ${dayCount} days instead of requested ${numDays} days. Please try again.`);
      }
      console.log(`\u2705 Generated fresh meal plan in ${Date.now() - startTime}ms (no caching)`);
      res.json(finalMealPlan);
    } catch (error) {
      console.error("Error generating meal plan:", error);
      res.status(500).json({ message: "Failed to generate meal plan" });
    }
  });
  app2.post("/api/meal-plan/generate-weight-based", authenticateToken, async (req, res) => {
    const startTime = Date.now();
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      if (!rateLimiter.isAllowed(userId.toString())) {
        return res.status(429).json({
          message: "Rate limit exceeded. Please try again later.",
          remainingRequests: rateLimiter.getRemainingRequests(userId.toString()),
          resetTime: rateLimiter.getResetTime(userId.toString())
        });
      }
      const {
        numDays,
        mealsPerDay,
        goalWeights,
        dietaryRestrictions = [],
        culturalBackground = [],
        availableIngredients = "",
        excludeIngredients = "",
        familySize = 2,
        planTargets = ["Everyone"]
        // New parameter for family member targeting (array)
      } = req.body;
      let weightBasedProfile = null;
      let userProfile = null;
      let culturalCuisineData = null;
      try {
        userProfile = await storage.getProfile(Number(userId));
        console.log("Retrieved user profile for weight-based system:", userProfile?.profile_name);
        console.log("\u{1F50D} PROFILE TYPE DEBUG:", {
          profile_type: userProfile?.profile_type,
          has_goals: !!userProfile?.goals,
          goals_length: userProfile?.goals?.length,
          profile_name: userProfile?.profile_name
        });
        if (userProfile && userProfile.goals && Array.isArray(userProfile.goals) && userProfile.goals.length > 0) {
          const storedGoalWeights = {};
          userProfile.goals.forEach((goal) => {
            const [key, value] = goal.split(":");
            storedGoalWeights[key] = parseFloat(value) || 0.5;
          });
          console.log("\u2705 PARSED GOAL WEIGHTS:", storedGoalWeights);
          weightBasedProfile = {
            profileName: userProfile.profile_name,
            familySize: userProfile.family_size,
            goalWeights: storedGoalWeights,
            dietaryRestrictions: userProfile.preferences || [],
            culturalBackground: userProfile.cultural_background || []
          };
          console.log("\u2705 WEIGHT-BASED PROFILE CREATED:", {
            goalWeights: weightBasedProfile.goalWeights,
            culturalBackground: weightBasedProfile.culturalBackground
          });
        } else {
          console.log("\u274C No weight-based profile data found - no goals in profile");
        }
        if (userProfile && userProfile.cultural_background && Array.isArray(userProfile.cultural_background) && userProfile.cultural_background.length > 0) {
          console.log("Weight-based system: User has cultural background:", userProfile.cultural_background);
          const { getCachedCulturalCuisine: getCachedCulturalCuisine2 } = await Promise.resolve().then(() => (init_cultureCacheManager(), cultureCacheManager_exports));
          culturalCuisineData = await getCachedCulturalCuisine2(Number(userId), userProfile.cultural_background);
          console.log(`Weight-based system: Retrieved cultural cuisine data for: ${userProfile.cultural_background.join(", ")}`);
        }
      } catch (error) {
        console.log("Could not fetch user profile for weight-based system, using request data. Error:", error);
      }
      const { mergeFamilyDietaryRestrictions: mergeFamilyDietaryRestrictions2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const allRestrictions = /* @__PURE__ */ new Set();
      if (weightBasedProfile?.dietaryRestrictions && Array.isArray(weightBasedProfile.dietaryRestrictions)) {
        weightBasedProfile.dietaryRestrictions.forEach((r) => allRestrictions.add(r));
      }
      if (userProfile?.preferences && Array.isArray(userProfile.preferences)) {
        userProfile.preferences.forEach((r) => allRestrictions.add(r));
      }
      if (userProfile?.members && Array.isArray(userProfile.members)) {
        const familyRestrictions = mergeFamilyDietaryRestrictions2(userProfile.members);
        familyRestrictions.forEach((r) => allRestrictions.add(r));
      }
      if (dietaryRestrictions && Array.isArray(dietaryRestrictions)) {
        dietaryRestrictions.forEach((r) => {
          if (r && r.trim()) allRestrictions.add(r.trim());
        });
      }
      const mergedDietaryRestrictions = Array.from(allRestrictions);
      console.log("Weight-based system - Merged dietary restrictions:", mergedDietaryRestrictions);
      let targetMemberRestrictions = mergedDietaryRestrictions;
      let targetMemberNames = planTargets;
      if (!planTargets.includes("Everyone") && userProfile?.members && Array.isArray(userProfile.members)) {
        console.log(`\u{1F3AF} Filtering meal plan for specific members: "${planTargets.join(", ")}"`);
        const memberRestrictions = /* @__PURE__ */ new Set();
        planTargets.forEach((targetName) => {
          const targetMember = userProfile.members.find((member) => member.name === targetName);
          if (targetMember) {
            console.log(`\u2705 Found target member: ${targetName}`, targetMember);
            if (targetMember.dietaryRestrictions && Array.isArray(targetMember.dietaryRestrictions)) {
              targetMember.dietaryRestrictions.forEach((restriction) => {
                if (restriction && restriction.trim()) {
                  memberRestrictions.add(restriction.trim());
                }
              });
            }
            if (targetMember.preferences && Array.isArray(targetMember.preferences)) {
              targetMember.preferences.forEach((pref) => {
                const lowerPref = pref.toLowerCase().trim();
                if (lowerPref.includes("allerg") || lowerPref.includes("intoleran") || lowerPref.includes("free") || lowerPref.includes("vegan") || lowerPref.includes("vegetarian") || lowerPref.includes("kosher") || lowerPref.includes("halal") || lowerPref.includes("diet")) {
                  memberRestrictions.add(pref.trim());
                }
              });
            }
          } else {
            console.warn(`\u26A0\uFE0F Could not find family member "${targetName}", skipping`);
          }
        });
        if (dietaryRestrictions && Array.isArray(dietaryRestrictions)) {
          dietaryRestrictions.forEach((r) => {
            if (r && r.trim()) memberRestrictions.add(r.trim());
          });
        }
        targetMemberRestrictions = Array.from(memberRestrictions);
        console.log(`\u{1F3AF} Combined restrictions for selected members [${planTargets.join(", ")}]:`, targetMemberRestrictions);
      } else if (!planTargets.includes("Everyone") && planTargets.length > 0) {
        console.log(`\u2139\uFE0F Plan targets "${planTargets.join(", ")}" specified but no family members found, using merged restrictions`);
      }
      const finalGoalWeights = goalWeights && Object.keys(goalWeights || {}).length > 0 ? goalWeights : weightBasedProfile?.goalWeights || {
        cost: 0.5,
        health: 0.5,
        cultural: 0.5,
        variety: 0.5,
        time: 0.5
      };
      const finalDietaryRestrictions = targetMemberRestrictions;
      const finalCulturalBackground = culturalBackground && culturalBackground.length > 0 ? culturalBackground : weightBasedProfile?.culturalBackground || [];
      console.log("\n\u{1F3AF} CULTURAL INTEGRATION CHECK:");
      console.log("  - Cultural weight:", finalGoalWeights.cultural);
      console.log("  - Cultural weight > 0.3?", finalGoalWeights.cultural > 0.3);
      console.log("  - Cultural background:", finalCulturalBackground);
      console.log("  - Will integrate cultural meals?", finalGoalWeights.cultural > 0.3 && finalCulturalBackground.length > 0);
      console.log("\u{1F50D} FINAL VALUES DEBUG:");
      console.log("  - Final goal weights:", JSON.stringify(finalGoalWeights, null, 2));
      console.log("  - Final cultural background:", finalCulturalBackground);
      console.log("  - Request goalWeights:", goalWeights ? "provided" : "undefined");
      console.log("  - Request culturalBackground:", culturalBackground?.length > 0 ? culturalBackground : "empty/undefined");
      console.log("  - Profile goalWeights:", weightBasedProfile?.goalWeights ? "available" : "not available");
      console.log("  - Profile culturalBackground:", weightBasedProfile?.culturalBackground || "not available");
      let finalFamilySize;
      if (!planTargets.includes("Everyone") && userProfile?.members && Array.isArray(userProfile.members)) {
        const validTargetCount = planTargets.filter(
          (targetName) => userProfile.members.find((member) => member.name === targetName)
        ).length;
        if (validTargetCount > 0) {
          finalFamilySize = validTargetCount;
          console.log(`\u{1F3AF} Final family size set to ${validTargetCount} for selected members: ${planTargets.join(", ")}`);
        } else {
          finalFamilySize = familySize || weightBasedProfile?.familySize || 2;
        }
      } else {
        finalFamilySize = familySize || weightBasedProfile?.familySize || 2;
      }
      const { WeightBasedMealPlanner: WeightBasedMealPlanner2 } = await Promise.resolve().then(() => (init_WeightBasedMealPlanner(), WeightBasedMealPlanner_exports));
      const planner = new WeightBasedMealPlanner2();
      let heroIngredients = [];
      if (finalGoalWeights.cost > 0.6) {
        const { HeroIngredientManager: HeroIngredientManager2 } = await Promise.resolve().then(() => (init_HeroIngredientManager(), HeroIngredientManager_exports));
        const heroManager = new HeroIngredientManager2();
        const heroSelection = await heroManager.selectHeroIngredients(
          finalCulturalBackground,
          availableIngredients.split(",").map((i) => i.trim()).filter(Boolean),
          finalGoalWeights.cost,
          finalDietaryRestrictions
        );
        heroIngredients = Array.isArray(heroSelection?.selected_ingredients) ? heroSelection.selected_ingredients.map((ing) => ing.name) : [];
        console.log("Selected hero ingredients:", heroIngredients);
      }
      let prompt;
      const primaryGoal = userProfile?.primary_goal || "Save Money";
      console.log("Weight-based system: Processing main goal:", primaryGoal);
      try {
        const { buildWeightBasedIntelligentPrompt: buildWeightBasedIntelligentPrompt2 } = await Promise.resolve().then(() => (init_intelligentPromptBuilderV2(), intelligentPromptBuilderV2_exports));
        const advancedFilters = {
          numDays,
          mealsPerDay,
          cookTime: 45,
          // Default reasonable cook time
          difficulty: 3,
          // Default moderate difficulty  
          primaryGoal,
          familySize: finalFamilySize,
          familyMembers: Array.isArray(userProfile?.members) ? userProfile.members : [],
          profileType: userProfile?.profile_type || "individual",
          dietaryRestrictions: finalDietaryRestrictions.join(", "),
          culturalBackground: finalCulturalBackground,
          userId: Number(userId),
          // Pass userId for cultural ranking engine
          culturalCuisineData,
          availableIngredients,
          excludeIngredients,
          // Member targeting
          planTargets,
          targetMemberNames,
          // Weight-based enhancements
          goalWeights: finalGoalWeights,
          heroIngredients,
          weightBasedEnhanced: true
        };
        prompt = await buildWeightBasedIntelligentPrompt2(
          advancedFilters,
          finalGoalWeights,
          heroIngredients
        );
        console.log("\u2705 Generated V2 weight-based prompt with main goal integration");
        console.log("Main goal:", primaryGoal);
        console.log("Goal weights:", finalGoalWeights);
        console.log("Hero ingredients:", heroIngredients);
      } catch (error) {
        console.error("V2 prompt builder failed, falling back to original weight-based prompt:", error);
        const mealContext = {
          numDays,
          mealsPerDay,
          availableIngredients,
          excludeIngredients,
          familySize: finalFamilySize
        };
        prompt = planner.buildWeightBasedPrompt(
          finalGoalWeights,
          heroIngredients,
          mealContext,
          finalDietaryRestrictions,
          finalFamilySize
        );
        console.log("\u26A0\uFE0F Using fallback weight-based prompt");
        console.log("Goal weights:", finalGoalWeights);
        console.log("Hero ingredients:", heroIngredients);
      }
      const openai = new (await import("openai")).OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an advanced meal planning expert with weight-based intelligence. You understand main goals (like "${primaryGoal}") and can apply weight-based priorities to refine decisions. ${!planTargets.includes("Everyone") ? `This meal plan is specifically designed for "${planTargets.join(", ")}" with their combined dietary restrictions and preferences.` : "This meal plan is designed for the entire family with merged dietary restrictions."} Generate exactly the requested number of days following the main goal guidance first, then using weights to resolve conflicts. Always return valid JSON with proper day structure.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 6e3
        // Increased from 4000 to allow for more detailed cultural integration
      });
      let mealPlan;
      try {
        mealPlan = JSON.parse(completion.choices[0].message.content || "{}");
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        throw new Error("Invalid response format from AI");
      }
      console.log("\n\u{1F3AF} CULTURAL INTEGRATION CHECK:");
      console.log("  - Cultural weight:", finalGoalWeights.cultural);
      console.log("  - Cultural weight > 0.3?", finalGoalWeights.cultural > 0.3);
      console.log("  - Cultural background:", finalCulturalBackground);
      console.log("  - Has cultural background?", finalCulturalBackground.length > 0);
      console.log("  - Will integrate cultural meals?", finalGoalWeights.cultural > 0.3 && finalCulturalBackground.length > 0);
      if (finalGoalWeights.cultural > 0.3 && finalCulturalBackground.length > 0) {
        console.log("\u2705 Cultural integration conditions met! Using prompt-based cultural integration...");
        console.log(`   - Cultural weight: ${finalGoalWeights.cultural} (${Math.round(finalGoalWeights.cultural * 100)}% priority)`);
        console.log(`   - Cultural background: ${finalCulturalBackground.join(", ")}`);
        console.log("   - Cultural elements will be integrated through enhanced AI prompting");
      } else {
        console.log("\u274C Cultural integration skipped - conditions not met");
        if (finalGoalWeights.cultural <= 0.3) {
          console.log("   Reason: Cultural weight too low (need > 0.3, have", finalGoalWeights.cultural, ")");
        }
        if (finalCulturalBackground.length === 0) {
          console.log("   Reason: No cultural background specified");
        }
      }
      const finalMealPlan = {
        ...mealPlan,
        generation_metadata: {
          type: "weight-based-v2",
          main_goal: primaryGoal,
          goal_weights: finalGoalWeights,
          hero_ingredients: heroIngredients,
          cultural_integration: finalGoalWeights.cultural > 0.3,
          advanced_prompt_used: true,
          prompt_builder_version: "V2",
          generation_time_ms: Date.now() - startTime
        }
      };
      console.log(`\u2705 Generated weight-based meal plan in ${Date.now() - startTime}ms`);
      res.json(finalMealPlan);
    } catch (error) {
      console.error("Error generating weight-based meal plan:", error);
      res.status(500).json({ message: "Failed to generate weight-based meal plan" });
    }
  });
  app2.get("/api/cache/stats", (req, res) => {
    res.json({
      cacheSize: 0,
      hitRate: "0.0%",
      estimatedSavings: "$0.0000 per request"
    });
  });
  app2.post("/api/shopping-list/optimize", async (req, res) => {
    try {
      const { mealPlan, userPreferences } = req.body;
      if (!mealPlan) {
        return res.status(400).json({ message: "Meal plan data is required" });
      }
      const { createOptimizedShoppingList: createOptimizedShoppingList2 } = await Promise.resolve().then(() => (init_instacart(), instacart_exports));
      const optimizedData = await createOptimizedShoppingList2(mealPlan, userPreferences);
      res.json(optimizedData);
    } catch (error) {
      console.error("Error creating optimized shopping list:", error);
      res.status(500).json({ message: `Failed to optimize shopping list: ${error.message}` });
    }
  });
  app2.post("/api/recipes/calculate-timing", async (req, res) => {
    try {
      const { recipe, constraints } = req.body;
      if (!recipe || !recipe.title || !recipe.ingredients) {
        return res.status(400).json({ message: "Recipe with title and ingredients is required" });
      }
      const { calculateCookingTimeAndDifficulty: calculateCookingTimeAndDifficulty2, getEasyAlternatives: getEasyAlternatives2 } = await Promise.resolve().then(() => (init_cookingTimeCalculator(), cookingTimeCalculator_exports));
      const { validateMealConstraints: validateMealConstraints3 } = await Promise.resolve().then(() => (init_intelligentPromptBuilder(), intelligentPromptBuilder_exports));
      const calculation = calculateCookingTimeAndDifficulty2(recipe);
      const alternatives = getEasyAlternatives2(recipe);
      let validation = null;
      if (constraints) {
        validation = validateMealConstraints3(
          { ...recipe, ...calculation },
          constraints
        );
      }
      res.json({
        timing: calculation,
        alternatives,
        validation,
        enhanced_recipe: {
          ...recipe,
          cook_time_minutes: calculation.totalMinutes,
          prep_time_minutes: calculation.prepTime,
          actual_cook_time_minutes: calculation.cookTime,
          difficulty: calculation.difficulty
        }
      });
    } catch (error) {
      console.error("Error calculating cooking timing:", error);
      res.status(500).json({ message: `Failed to calculate timing: ${error.message}` });
    }
  });
  app2.post("/api/recipes/batch-timing", async (req, res) => {
    try {
      const { recipes: recipes2 } = req.body;
      if (!recipes2 || !Array.isArray(recipes2)) {
        return res.status(400).json({ message: "Array of recipes is required" });
      }
      const { estimateBatchCookingTime: estimateBatchCookingTime2 } = await Promise.resolve().then(() => (init_cookingTimeCalculator(), cookingTimeCalculator_exports));
      const batchEstimate = estimateBatchCookingTime2(recipes2);
      res.json(batchEstimate);
    } catch (error) {
      console.error("Error calculating batch timing:", error);
      res.status(500).json({ message: `Failed to calculate batch timing: ${error.message}` });
    }
  });
  app2.post("/api/recipes/resolve-conflicts", async (req, res) => {
    try {
      const { mealRequest, dietaryRestrictions, culturalBackground } = req.body;
      if (!mealRequest) {
        return res.status(400).json({ message: "Meal request is required" });
      }
      const { resolveDietaryCulturalConflicts: resolveDietaryCulturalConflicts2, hasQuickConflict: hasQuickConflict3, getIngredientSubstitutions: getIngredientSubstitutions2 } = await Promise.resolve().then(() => (init_dietaryCulturalConflictResolver(), dietaryCulturalConflictResolver_exports));
      const restrictions = dietaryRestrictions || [];
      const cultural = culturalBackground || [];
      const resolution = await resolveDietaryCulturalConflicts2(
        mealRequest,
        restrictions,
        cultural
      );
      res.json({
        success: true,
        mealRequest,
        resolution,
        quickCheck: hasQuickConflict3(mealRequest, restrictions)
      });
    } catch (error) {
      console.error("Error resolving dietary conflicts:", error);
      res.status(500).json({
        success: false,
        message: `Failed to resolve conflicts: ${error.message}`
      });
    }
  });
  app2.post("/api/recipes/ingredient-substitutions", async (req, res) => {
    try {
      const { ingredient, dietaryRestriction } = req.body;
      if (!ingredient || !dietaryRestriction) {
        return res.status(400).json({ message: "Ingredient and dietary restriction are required" });
      }
      const { getIngredientSubstitutions: getIngredientSubstitutions2 } = await Promise.resolve().then(() => (init_dietaryCulturalConflictResolver(), dietaryCulturalConflictResolver_exports));
      const substitutions = getIngredientSubstitutions2(ingredient, dietaryRestriction);
      res.json({
        success: true,
        ingredient,
        dietaryRestriction,
        substitutions
      });
    } catch (error) {
      console.error("Error getting ingredient substitutions:", error);
      res.status(500).json({
        success: false,
        message: `Failed to get substitutions: ${error.message}`
      });
    }
  });
  app2.get("/api/profile", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const profile = await storage.getProfile(Number(userId));
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });
  app2.post("/api/profile", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        console.error("Profile creation failed: User not authenticated");
        return res.status(401).json({ message: "User not authenticated" });
      }
      console.log("Creating profile for user:", userId);
      console.log("Request body:", req.body);
      const { profile_name, primary_goal } = req.body;
      if (!profile_name?.trim()) {
        console.error("Profile creation failed: Missing profile name");
        return res.status(400).json({ message: "Profile name is required" });
      }
      if (!primary_goal) {
        console.error("Profile creation failed: Missing primary goal");
        return res.status(400).json({ message: "Primary goal is required" });
      }
      try {
        const profileData = insertProfileSchema.parse({
          user_id: Number(userId),
          ...req.body
        });
        console.log("Parsed profile data:", profileData);
        const profile = await storage.createProfile(profileData);
        console.log("Created profile:", profile);
        if (profileData.cultural_background && Array.isArray(profileData.cultural_background) && profileData.cultural_background.length > 0) {
          try {
            console.log(`\u{1F680} Auto-caching cultural data for new profile: [${profileData.cultural_background.join(", ")}]`);
            Promise.resolve().then(() => (init_cultureCacheManager(), cultureCacheManager_exports)).then(async ({ getCachedCulturalCuisine: getCachedCulturalCuisine2 }) => {
              try {
                for (const culture of profileData.cultural_background || []) {
                  await getCachedCulturalCuisine2(Number(userId), [culture]);
                  console.log(`   \u2705 Cached cultural data for: ${culture}`);
                }
                console.log(`\u{1F3AF} Auto-caching complete for user ${userId}`);
              } catch (cacheError) {
                console.warn("Auto-caching failed:", cacheError);
              }
            });
          } catch (error) {
            console.warn("Failed to trigger auto-caching:", error);
          }
        }
        res.json(profile);
      } catch (parseError) {
        console.error("Profile creation failed: Schema validation error:", parseError);
        if (parseError instanceof Error) {
          return res.status(400).json({
            message: "Invalid profile data",
            details: parseError.message
          });
        }
        return res.status(400).json({ message: "Invalid profile data format" });
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create profile";
      res.status(500).json({
        message: "Failed to create profile",
        error: errorMessage
      });
    }
  });
  app2.put("/api/profile", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const profile = await storage.updateProfile(Number(userId), req.body);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      if (req.body.cultural_background) {
        try {
          console.log(`\u{1F504} Profile cultural background updated for user ${userId}: [${req.body.cultural_background.join(", ")}]`);
          Promise.resolve().then(() => (init_cultureCacheManager(), cultureCacheManager_exports)).then(async ({ clearUserCache: clearUserCache2, getCachedCulturalCuisine: getCachedCulturalCuisine2 }) => {
            try {
              clearUserCache2(Number(userId));
              console.log(`   \u{1F5D1}\uFE0F Cleared old cultural cache for user ${userId}`);
              if (req.body.cultural_background && req.body.cultural_background.length > 0) {
                for (const culture of req.body.cultural_background) {
                  await getCachedCulturalCuisine2(Number(userId), [culture]);
                  console.log(`   \u2705 Refreshed cultural data for: ${culture}`);
                }
                console.log(`\u{1F3AF} Cache refresh complete for user ${userId}`);
              }
            } catch (cacheError) {
              console.warn("Cache refresh failed:", cacheError);
            }
          });
        } catch (error) {
          console.warn("Failed to trigger cache refresh:", error);
        }
      }
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.get("/api/profile/weight-based", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const existingProfile = await storage.getProfile(Number(userId));
      if (existingProfile) {
        console.log("\u{1F50D} Processing existing profile for weight extraction:", {
          profile_name: existingProfile.profile_name,
          goals: existingProfile.goals,
          goalsType: typeof existingProfile.goals,
          goalsIsArray: Array.isArray(existingProfile.goals),
          goalsLength: existingProfile.goals?.length
        });
        const storedGoalWeights = {
          cost: 0.5,
          health: 0.5,
          cultural: 0.5,
          variety: 0.5,
          time: 0.5
        };
        let parsedWeightsCount = 0;
        if (existingProfile.goals) {
          console.log("\u{1F4CB} Processing goals data:", existingProfile.goals, "type:", typeof existingProfile.goals);
          if (typeof existingProfile.goals === "object" && !Array.isArray(existingProfile.goals)) {
            console.log("\u{1F4CB} Processing goals as object format");
            Object.entries(existingProfile.goals).forEach(([key, value]) => {
              console.log(`\u{1F50D} Processing goal object entry: key="${key}", value="${value}"`);
              if (typeof value === "number" && value >= 0 && value <= 1) {
                storedGoalWeights[key] = value;
                parsedWeightsCount++;
                console.log(`   \u2705 Set ${key} = ${value}`);
              } else {
                console.log(`   \u274C Invalid weight value: ${value}`);
              }
            });
          } else if (Array.isArray(existingProfile.goals)) {
            console.log("\u{1F4CB} Processing goals as array format");
            existingProfile.goals.forEach((goal, index2) => {
              console.log(`\u{1F50D} Processing goal ${index2}:`, goal, typeof goal);
              if (typeof goal === "string" && goal.includes(":")) {
                const [key, value] = goal.split(":");
                console.log(`   Split result: key="${key}", value="${value}"`);
                if (key && value) {
                  const weight = parseFloat(value);
                  console.log(`   Parsed weight: ${weight}, isNaN: ${isNaN(weight)}`);
                  if (!isNaN(weight) && weight >= 0 && weight <= 1) {
                    storedGoalWeights[key] = weight;
                    parsedWeightsCount++;
                    console.log(`   \u2705 Set ${key} = ${weight}`);
                  } else {
                    console.log(`   \u274C Invalid weight value: ${weight}`);
                  }
                } else {
                  console.log(`   \u274C Missing key or value after split`);
                }
              } else {
                console.log(`   \u274C Goal is not string or doesn't contain ":"`);
              }
            });
          } else {
            console.log("\u274C Goals is neither object nor array");
          }
        } else {
          console.log("\u274C Goals is null/undefined");
        }
        console.log("\u{1F4CA} Final extracted stored goal weights:", storedGoalWeights);
        console.log(`\u{1F4CA} Successfully parsed ${parsedWeightsCount} weights from ${existingProfile.goals?.length || 0} goals`);
        const weightBasedProfile = {
          profileName: existingProfile.profile_name || "My Profile",
          familySize: existingProfile.family_size || 2,
          goalWeights: storedGoalWeights,
          dietaryRestrictions: existingProfile.preferences || [],
          culturalBackground: existingProfile.cultural_background || []
        };
        res.json(weightBasedProfile);
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Error fetching weight-based profile:", error);
      res.status(500).json({ message: "Failed to fetch weight-based profile" });
    }
  });
  app2.post("/api/profile/weight-based", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const { profileName, familySize, goalWeights, dietaryRestrictions, culturalBackground, questionnaire_answers, questionnaire_selections } = req.body;
      console.log("\u{1F4BE} Creating weight-based profile with data:", {
        profileName,
        familySize,
        goalWeights,
        dietaryRestrictions,
        culturalBackground,
        questionnaire_answers,
        questionnaire_selections
      });
      const goalsArray = Object.entries(goalWeights).map(([goal, weight]) => `${goal}:${weight}`);
      console.log("\u{1F4BE} Converted goalWeights to goals array for creation:", goalsArray);
      const profileData = {
        user_id: Number(userId),
        profile_name: profileName,
        primary_goal: "Save Money",
        // Default to Save Money for weight-based profiles
        family_size: familySize,
        members: [],
        // Empty for weight-based approach
        profile_type: "individual",
        preferences: dietaryRestrictions,
        goals: goalsArray,
        cultural_background: culturalBackground
      };
      console.log("\u{1F4BE} Final profileData being created:", profileData);
      const profile = await storage.createProfile(profileData);
      console.log("\u{1F4BE} Profile created successfully:", {
        profile_name: profile.profile_name,
        goals: profile.goals,
        savedGoalWeights: goalWeights
      });
      const response = {
        profileName: profile.profile_name,
        familySize: profile.family_size,
        goalWeights,
        dietaryRestrictions: profile.preferences,
        culturalBackground: profile.cultural_background
      };
      console.log("\u{1F4BE} Returning creation response to client:", response);
      res.json(response);
    } catch (error) {
      console.error("Error creating weight-based profile:", error);
      res.status(500).json({ message: "Failed to create weight-based profile" });
    }
  });
  app2.put("/api/profile/weight-based", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const { profileName, familySize, goalWeights, dietaryRestrictions, culturalBackground, questionnaire_answers, questionnaire_selections } = req.body;
      console.log("\u{1F4BE} Saving weight-based profile with data:", {
        profileName,
        familySize,
        goalWeights,
        dietaryRestrictions,
        culturalBackground,
        questionnaire_answers,
        questionnaire_selections
      });
      const goalsArray = Object.entries(goalWeights).map(([goal, weight]) => `${goal}:${weight}`);
      console.log("\u{1F4BE} Converted goalWeights to goals array:", goalsArray);
      const profileData = {
        profile_name: profileName,
        primary_goal: "Save Money",
        // Default to Save Money for weight-based profiles
        family_size: familySize,
        members: [],
        profile_type: "individual",
        preferences: dietaryRestrictions,
        goals: goalsArray,
        cultural_background: culturalBackground
      };
      console.log("\u{1F4BE} Final profileData being saved:", profileData);
      const profile = await storage.updateProfile(Number(userId), profileData);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      console.log("\u{1F4BE} Profile saved successfully:", {
        profile_name: profile.profile_name,
        goals: profile.goals,
        savedGoalWeights: goalWeights
      });
      const response = {
        profileName: profile.profile_name,
        familySize: profile.family_size,
        goalWeights,
        dietaryRestrictions: profile.preferences,
        culturalBackground: profile.cultural_background
      };
      console.log("\u{1F4BE} Returning response to client:", response);
      res.json(response);
    } catch (error) {
      console.error("Error updating weight-based profile:", error);
      res.status(500).json({ message: "Failed to update weight-based profile" });
    }
  });
  app2.post("/api/culture-parser", authenticateToken, async (req, res) => {
    try {
      const { text: text2 } = req.body;
      if (!text2 || typeof text2 !== "string") {
        return res.status(400).json({ message: "Text input is required" });
      }
      const { nlpCultureParser: nlpCultureParser2 } = await Promise.resolve().then(() => (init_nlpCultureParser(), nlpCultureParser_exports));
      const result = await nlpCultureParser2(text2);
      res.json(result);
    } catch (error) {
      console.error("Error in culture parser:", error);
      res.status(500).json({ message: "Failed to parse cultural input" });
    }
  });
  app2.get("/api/cultural-cuisine/:cuisine", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      const { cuisine } = req.params;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      if (!cuisine) {
        return res.status(400).json({ message: "Cuisine parameter is required" });
      }
      const { getCulturalCuisineData: getCulturalCuisineData2 } = await Promise.resolve().then(() => (init_cultureCacheManager(), cultureCacheManager_exports));
      const cuisineData = await getCulturalCuisineData2(Number(userId), cuisine);
      if (!cuisineData) {
        return res.status(404).json({ message: "Cuisine data not found" });
      }
      res.json(cuisineData);
    } catch (error) {
      console.error("Error fetching cultural cuisine data:", error);
      res.status(500).json({ message: "Failed to fetch cuisine data" });
    }
  });
  app2.post("/api/cache-cultural-cuisines", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const profile = await storage.getProfile(Number(userId));
      if (!profile || !profile.cultural_background) {
        return res.status(404).json({ message: "No cultural preferences found in profile" });
      }
      const culturalBackground = Array.isArray(profile.cultural_background) ? profile.cultural_background : [];
      if (culturalBackground.length === 0) {
        return res.json({ message: "No cultural cuisines to cache", cached: [] });
      }
      const { getCulturalCuisineData: getCulturalCuisineData2 } = await Promise.resolve().then(() => (init_cultureCacheManager(), cultureCacheManager_exports));
      const cachePromises = culturalBackground.map(
        (cuisine) => getCulturalCuisineData2(Number(userId), cuisine)
      );
      const results = await Promise.allSettled(cachePromises);
      const cached = culturalBackground.filter(
        (_, index2) => results[index2].status === "fulfilled" && results[index2].value !== null
      );
      res.json({
        message: `Cached data for ${cached.length} cuisines`,
        cached,
        total: culturalBackground.length
      });
    } catch (error) {
      console.error("Error caching cultural cuisines:", error);
      res.status(500).json({ message: "Failed to cache cultural cuisine data" });
    }
  });
  app2.get("/api/culture-cache-stats", authenticateToken, async (req, res) => {
    try {
      const { getCacheStats: getCacheStats2 } = await Promise.resolve().then(() => (init_cultureCacheManager(), cultureCacheManager_exports));
      const stats = getCacheStats2();
      res.json(stats);
    } catch (error) {
      console.error("Error getting cache stats:", error);
      res.status(500).json({ message: "Failed to get cache statistics" });
    }
  });
  app2.post("/api/clear-cultural-cache", async (req, res) => {
    try {
      const { clearAllCache: clearAllCache2 } = await Promise.resolve().then(() => (init_cultureCacheManager(), cultureCacheManager_exports));
      clearAllCache2();
      res.json({
        success: true,
        message: "All cultural cache data has been cleared. Fresh research will be performed for all cuisines."
      });
    } catch (error) {
      console.error("\u{1F6A8} Error clearing cultural cache:", error);
      res.status(500).json({
        error: "Failed to clear cache",
        message: "Unable to clear cultural cache data"
      });
    }
  });
  app2.post("/api/save-cultural-meals", async (req, res) => {
    const { saveCulturalMeals: saveCulturalMeals2 } = await Promise.resolve().then(() => (init_save_cultural_meals(), save_cultural_meals_exports));
    return saveCulturalMeals2(req, res);
  });
  app2.get("/api/saved-cultural-meals", async (req, res) => {
    try {
      const userId = 9;
      const { userSavedCulturalMeals: userSavedCulturalMeals2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq4 } = await import("drizzle-orm");
      const savedMeals = [];
      res.json({
        success: true,
        saved_meals: savedMeals
      });
    } catch (error) {
      console.error("\u274C Error fetching saved cultural meals:", error);
      res.status(500).json({
        error: "Failed to fetch saved meals",
        message: "An internal server error occurred"
      });
    }
  });
  app2.post("/api/cultural-cuisine-research", async (req, res) => {
    try {
      const { cuisine } = req.body;
      if (!cuisine || typeof cuisine !== "string") {
        return res.status(400).json({
          error: "Missing or invalid cuisine parameter",
          message: "Please provide a valid cuisine name to research"
        });
      }
      if (cuisine.trim().length === 0) {
        return res.status(400).json({
          error: "Empty cuisine name",
          message: "Cuisine name cannot be empty"
        });
      }
      const trimmedCuisine = cuisine.trim();
      console.log(`\u{1F50D} Research request for cuisine: ${trimmedCuisine}`);
      const { getCulturalCuisineData: getCulturalCuisineData2 } = await Promise.resolve().then(() => (init_cultureCacheManager(), cultureCacheManager_exports));
      const cuisineData = await getCulturalCuisineData2(0, trimmedCuisine);
      if (!cuisineData) {
        console.error(`\u274C Failed to fetch research data for cuisine: ${trimmedCuisine}`);
        return res.status(404).json({
          error: "Research failed",
          message: `Unable to find detailed information for ${trimmedCuisine} cuisine. Please try again or check the cuisine name.`
        });
      }
      console.log(`\u2705 Successfully researched ${trimmedCuisine} cuisine`);
      res.json({
        cuisine: trimmedCuisine,
        culture: cuisineData.culture || trimmedCuisine,
        meals: cuisineData.meals || [],
        summary: cuisineData.summary || {
          common_healthy_ingredients: [],
          common_cooking_techniques: []
        },
        research_timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        data_source: "Perplexity AI"
      });
    } catch (error) {
      console.error("\u{1F6A8} Error in cultural cuisine research endpoint:", error);
      if (error instanceof Error) {
        if (error.message.includes("rate limit") || error.message.includes("Rate limited")) {
          return res.status(429).json({
            error: "Rate limit exceeded",
            message: "Too many research requests. Please wait a moment before trying again.",
            retry_after: 60
          });
        }
        if (error.message.includes("API key") || error.message.includes("Authorization")) {
          return res.status(503).json({
            error: "Service configuration error",
            message: "Research service is temporarily unavailable. Please try again later."
          });
        }
      }
      res.status(500).json({
        error: "Internal server error",
        message: "An unexpected error occurred while researching the cuisine. Please try again."
      });
    }
  });
  app2.get("/api/perplexity-cache", async (req, res) => {
    try {
      const { perplexityLogger: perplexityLogger2 } = await Promise.resolve().then(() => (init_perplexitySearchLogger(), perplexitySearchLogger_exports));
      const searchHistory = await perplexityLogger2.getSearchHistory(100);
      res.json(searchHistory);
    } catch (error) {
      console.error("Failed to get Perplexity cache:", error);
      res.status(500).json({ error: "Failed to load search history" });
    }
  });
  app2.delete("/api/perplexity-cache", async (req, res) => {
    try {
      const { perplexityLogger: perplexityLogger2 } = await Promise.resolve().then(() => (init_perplexitySearchLogger(), perplexitySearchLogger_exports));
      await perplexityLogger2.clearSearchHistory();
      res.json({ success: true, message: "Search history cleared" });
    } catch (error) {
      console.error("Failed to clear Perplexity cache:", error);
      res.status(500).json({ error: "Failed to clear search history" });
    }
  });
  app2.get("/api/perplexity-cache/stats", async (req, res) => {
    try {
      const { perplexityLogger: perplexityLogger2 } = await Promise.resolve().then(() => (init_perplexitySearchLogger(), perplexitySearchLogger_exports));
      const stats = await perplexityLogger2.getSearchStats();
      res.json(stats);
    } catch (error) {
      console.error("Failed to get Perplexity cache stats:", error);
      res.status(500).json({ error: "Failed to load cache statistics" });
    }
  });
  function validateAndRoundDifficulties(mealPlan, maxDifficulty) {
    Object.keys(mealPlan).forEach((day) => {
      const dayMeals = mealPlan[day];
      if (typeof dayMeals === "object") {
        Object.keys(dayMeals).forEach((mealType) => {
          const meal = dayMeals[mealType];
          if (meal && typeof meal.difficulty === "number") {
            const roundedDifficulty = Math.round(meal.difficulty * 2) / 2;
            const finalDifficulty = Math.min(roundedDifficulty, maxDifficulty);
            if (meal.difficulty !== finalDifficulty) {
              console.log(`Adjusted difficulty: ${day} ${mealType} from ${meal.difficulty} to ${finalDifficulty}`);
              meal.difficulty = finalDifficulty;
            }
          }
        });
      }
    });
  }
  app2.get("/api/achievements", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      let achievements = await storage.getUserAchievements(userId);
      if (achievements.length === 0) {
        achievements = await storage.initializeUserAchievements(userId);
      }
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });
  app2.post("/api/achievements/trigger", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const { achievementId, progress } = req.body;
      if (!achievementId) {
        return res.status(400).json({ message: "Achievement ID is required" });
      }
      const achievement = await storage.getUserAchievement(userId, achievementId);
      if (!achievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      const newProgress = progress || (achievement.progress || 0) + 1;
      const isUnlocked = newProgress >= achievement.max_progress;
      const updatedAchievement = await storage.updateUserAchievement(userId, achievementId, {
        progress: newProgress,
        is_unlocked: isUnlocked,
        unlocked_date: isUnlocked ? /* @__PURE__ */ new Date() : void 0
      });
      res.json({
        achievement: updatedAchievement,
        isNewlyUnlocked: isUnlocked && !achievement.is_unlocked
      });
    } catch (error) {
      console.error("Error triggering achievement:", error);
      res.status(500).json({ message: "Failed to trigger achievement" });
    }
  });
  app2.get("/api/achievements/:achievementId", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const { achievementId } = req.params;
      const achievement = await storage.getUserAchievement(userId, achievementId);
      if (!achievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      res.json(achievement);
    } catch (error) {
      console.error("Error fetching achievement:", error);
      res.status(500).json({ message: "Failed to fetch achievement" });
    }
  });
  app2.post("/api/enhanced-meal-plan", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const {
        numDays = 3,
        mealsPerDay = 3,
        goalWeights,
        profile: userProfile
      } = req.body;
      console.log(`\u{1F680} Enhanced meal plan request: ${numDays} days, ${mealsPerDay} meals/day`);
      const profile = userProfile || await storage.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      const { enhancedMealPlanGenerator: enhancedMealPlanGenerator2, EnhancedMealPlanGenerator: EnhancedMealPlanGenerator2 } = await Promise.resolve().then(() => (init_enhancedMealPlanGenerator(), enhancedMealPlanGenerator_exports));
      const culturalProfile = EnhancedMealPlanGenerator2.buildUserProfile(profile, goalWeights);
      console.log("\u{1F3AF} Cultural profile:", {
        culturalPrefs: Object.keys(culturalProfile.cultural_preferences),
        weights: culturalProfile.priority_weights,
        restrictions: culturalProfile.dietary_restrictions
      });
      const mealPlan = await enhancedMealPlanGenerator2.generateMealPlan({
        userId: Number(userId),
        numDays,
        mealsPerDay,
        userProfile: culturalProfile,
        servingSize: profile.family_size || 1
      });
      console.log(`\u2705 Generated enhanced meal plan in ${mealPlan.generation_metadata.processing_time_ms}ms`);
      res.json(mealPlan);
    } catch (error) {
      console.error("\u274C Enhanced meal plan generation failed:", error);
      res.status(500).json({
        message: "Failed to generate enhanced meal plan",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/test-simple", (req, res) => {
    res.json({ message: "API is working", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.post("/api/intelligent-meal-selection", async (req, res) => {
    try {
      console.log("\u{1F916} Intelligent meal selection endpoint called");
      const { userId = 1, userProfile, selectedMeal, totalMeals = 9 } = req.body;
      if (!userProfile) {
        return res.status(400).json({ error: "User profile is required" });
      }
      const { intelligentMealBaseSelector: intelligentMealBaseSelector2 } = await Promise.resolve().then(() => (init_intelligentMealBaseSelector(), intelligentMealBaseSelector_exports));
      if (selectedMeal) {
        console.log(`\u{1F3AF} Generating meal plan around selected base: ${selectedMeal.meal.name}`);
        const baseMealSelection = {
          baseMeal: selectedMeal.meal,
          similarity_score: selectedMeal.total_score,
          usage_rationale: selectedMeal.ranking_explanation || "Selected by user as preferred base meal",
          weight_alignment: selectedMeal.component_scores
        };
        const mealPlan = await intelligentMealBaseSelector2.generateMealPlanWithBase(
          userId,
          userProfile,
          baseMealSelection,
          totalMeals
        );
        console.log(`\u2705 Generated meal plan with ${mealPlan.complementaryMeals.length + mealPlan.variety_boost_meals.length + 1} meals`);
        res.json({
          success: true,
          mealPlan,
          processingTime: Date.now()
        });
      } else {
        console.log("\u{1F50D} Auto-selecting optimal base meal from user preferences");
        const cultures = Object.keys(userProfile.cultural_preferences);
        const baseMealSelection = await intelligentMealBaseSelector2.findOptimalBaseMeal(
          userId,
          userProfile,
          cultures
        );
        if (!baseMealSelection) {
          return res.status(404).json({
            error: "No suitable base meal found for your preferences",
            suggestion: "Try adjusting your cultural preferences or dietary restrictions"
          });
        }
        const mealPlan = await intelligentMealBaseSelector2.generateMealPlanWithBase(
          userId,
          userProfile,
          baseMealSelection,
          totalMeals
        );
        console.log(`\u2705 Auto-generated meal plan with optimal base: ${baseMealSelection.baseMeal.name}`);
        res.json({
          success: true,
          mealPlan,
          autoSelectedBase: true,
          processingTime: Date.now()
        });
      }
    } catch (error) {
      console.error("\u274C Error in intelligent meal selection:", error);
      res.status(500).json({
        error: "Internal server error during intelligent meal selection",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs3 from "fs";
import path4 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path3 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path3.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use(async (req, res, next) => {
    if (req.originalUrl.startsWith("/api/")) {
      return next();
    }
    const url = req.originalUrl;
    try {
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path4.resolve(import.meta.dirname, "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import dotenv from "dotenv";
dotenv.config();
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      log(`Port ${port} is already in use. Exiting...`);
      process.exit(1);
    } else {
      log(`Server error: ${error.message}`);
      throw error;
    }
  });
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();

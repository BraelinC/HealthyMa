import { db } from "./db";
import { users, recipes, mealPlans, profiles, type User, type InsertUser, type Recipe, type InsertRecipe, type MealPlan, type Profile, type InsertProfile, type IStorage } from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: {
    email: string;
    phone?: string;
    password_hash: string;
    full_name: string;
  }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        phone: userData.phone,
        password_hash: userData.password_hash,
        full_name: userData.full_name,
      })
      .returning();
    return user;
  }

  // Recipe methods
  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const [createdRecipe] = await db
      .insert(recipes)
      .values(recipe)
      .returning();
    return createdRecipe;
  }

  async getRecipe(id: number): Promise<Recipe | undefined> {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
    return recipe;
  }

  async getPopularRecipes(): Promise<Recipe[]> {
    // First try to get the 4 baseline recipes with working YouTube thumbnails
    const baselineRecipes = await db.select().from(recipes)
      .where(eq(recipes.id, 210));

    const recipe211 = await db.select().from(recipes).where(eq(recipes.id, 211));
    const recipe212 = await db.select().from(recipes).where(eq(recipes.id, 212)); 
    const recipe213 = await db.select().from(recipes).where(eq(recipes.id, 213));

    let result = [...baselineRecipes, ...recipe211, ...recipe212, ...recipe213];

    // If we need more recipes to reach 6, add others
    if (result.length < 6) {
      const otherRecipes = await db.select().from(recipes)
        .orderBy(desc(recipes.created_at))
        .limit(6 - result.length);

      // Only add recipes that aren't already in our baseline set
      const filteredOthers = otherRecipes.filter(recipe => 
        !result.some(existing => existing.id === recipe.id)
      );

      result = [...result, ...filteredOthers];
    }

    return result.slice(0, 6);
  }

  async getSavedRecipes(userId?: number): Promise<Recipe[]> {
    if (userId) {
      return await db.select().from(recipes)
        .where(and(eq(recipes.is_saved, true), eq(recipes.user_id, userId)))
        .orderBy(desc(recipes.created_at));
    }

    return await db.select().from(recipes)
      .where(eq(recipes.is_saved, true))
      .orderBy(desc(recipes.created_at));
  }

  async getGeneratedRecipes(userId?: number): Promise<Recipe[]> {
    if (userId) {
      return await db.select().from(recipes)
        .where(and(eq(recipes.is_saved, false), eq(recipes.user_id, userId)))
        .orderBy(desc(recipes.created_at));
    }

    return await db.select().from(recipes)
      .where(eq(recipes.is_saved, false))
      .orderBy(desc(recipes.created_at));
  }

  async getRecipeById(recipeId: number): Promise<any> {
    try {
      const recipe = await db
        .select()
        .from(recipes)
        .where(eq(recipes.id, recipeId))
        .limit(1);

      return recipe.length > 0 ? recipe[0] : null;
    } catch (error) {
      console.error("Error getting recipe by ID:", error);
      throw error;
    }
  }

  async saveRecipe(recipeId: number): Promise<any> {
    try {
      console.log(`DatabaseStorage: Saving recipe ${recipeId}`);

      // First get the recipe to check if it exists
      const existingRecipe = await this.getRecipeById(recipeId);

      if (!existingRecipe) {
        console.log(`DatabaseStorage: Recipe ${recipeId} not found`);
        return null;
      }

      console.log(`DatabaseStorage: Found recipe ${recipeId}, updating is_saved to true`);

      // Update the recipe to mark it as saved
      await db
        .update(recipes)
        .set({ is_saved: true })
        .where(eq(recipes.id, recipeId));

      console.log(`DatabaseStorage: Successfully updated recipe ${recipeId}`);

      // Return the updated recipe
      const updatedRecipe = { ...existingRecipe, is_saved: true };
      return updatedRecipe;
    } catch (error) {
      console.error("DatabaseStorage: Error saving recipe:", error);
      throw error;
    }
  }

  async unsaveRecipe(recipeId: number): Promise<void> {
    try {
      console.log(`DatabaseStorage: Unsaving recipe ${recipeId}`);

      const result = await db
        .update(recipes)
        .set({ is_saved: false })
        .where(eq(recipes.id, recipeId));

      console.log(`DatabaseStorage: Successfully unsaved recipe ${recipeId}`);
    } catch (error) {
      console.error("DatabaseStorage: Error unsaving recipe:", error);
      throw error;
    }
  }

  // Meal plan operations
  async getSavedMealPlans(userId: number): Promise<MealPlan[]> {
    try {
      const plans = await db.select()
        .from(mealPlans)
        .where(eq(mealPlans.userId, userId))
        .orderBy(desc(mealPlans.updatedAt));

      console.log('Database returned meal plans:', plans?.length || 0);
      // Ensure we always return an array
      return Array.isArray(plans) ? plans : [];
    } catch (error) {
      console.error('Database error fetching meal plans:', error);
      return [];
    }
  }

  async saveMealPlan(data: {
    userId: number;
    name: string;
    description: string;
    mealPlan: any;
    isAutoSaved?: boolean;
  }): Promise<MealPlan> {
    const [savedPlan] = await db.insert(mealPlans)
      .values({
        userId: data.userId,
        name: data.name,
        description: data.description,
        mealPlan: data.mealPlan,
        isAutoSaved: data.isAutoSaved || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return savedPlan;
  }

  async updateMealPlan(planId: number, userId: number, data: {
    name: string;
    description: string;
    mealPlan: any;
  }): Promise<MealPlan | null> {
    try {
      console.log('Updating meal plan in database:', { planId, userId, dataKeys: Object.keys(data) });

      const [updatedPlan] = await db.update(mealPlans)
        .set({
          name: data.name,
          description: data.description,
          mealPlan: data.mealPlan,
          updatedAt: new Date(),
        })
        .where(eq(mealPlans.id, planId))
        .returning();

      console.log('Database update result:', updatedPlan ? 'success' : 'no result');
      return updatedPlan || null;
    } catch (error) {
      console.error('Database error updating meal plan:', error);
      throw error;
    }
  }

  async getMealPlan(planId: number, userId: number): Promise<MealPlan | null> {
    const [plan] = await db.select()
      .from(mealPlans)
      .where(eq(mealPlans.id, planId));

    return plan || null;
  }

  async deleteMealPlan(planId: number, userId: number): Promise<boolean> {
    try {
      console.log('Deleting meal plan from database:', { planId, userId });

      const result = await db.delete(mealPlans)
        .where(eq(mealPlans.id, planId))
        .returning();

      const success = result.length > 0;
      console.log('Database delete result:', success ? 'success' : 'no rows affected');
      return success;
    } catch (error) {
      console.error('Database error deleting meal plan:', error);
      return false;
    }
  }

  // Profile methods
  async getProfile(userId: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.user_id, userId));
    return profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    try {
      console.log('DatabaseStorage: Creating profile with data:', profile);
      
      const [createdProfile] = await db
        .insert(profiles)
        .values({
          user_id: profile.user_id,
          profile_name: profile.profile_name,
          primary_goal: profile.primary_goal,
          family_size: profile.family_size || 1,
          members: profile.members || [],
          profile_type: profile.profile_type || 'family',
          preferences: profile.preferences || [],
          goals: profile.goals || [],
          cultural_background: profile.cultural_background || [],
        })
        .returning();
      
      console.log('DatabaseStorage: Successfully created profile:', createdProfile);
      return createdProfile;
    } catch (error) {
      console.error('DatabaseStorage: Error creating profile:', error);
      throw error;
    }
  }

  async updateProfile(userId: number, profile: Partial<InsertProfile>): Promise<Profile | null> {
    try {
      const [updatedProfile] = await db
        .update(profiles)
        .set({
          profile_name: profile.profile_name,
          primary_goal: profile.primary_goal,
          family_size: profile.family_size,
          members: profile.members,
          profile_type: profile.profile_type,
          preferences: profile.preferences,
          goals: profile.goals,
          cultural_background: profile.cultural_background,
          updated_at: new Date(),
        })
        .where(eq(profiles.user_id, userId))
        .returning();
      return updatedProfile || null;
    } catch (error) {
      console.error('Database error updating profile:', error);
      return null;
    }
  }
}
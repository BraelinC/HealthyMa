import type { Express } from "express";
import { createServer, type Server } from "http";
import fetch from "node-fetch";
import { storage } from "./storage";
import { generateRecipeWithGrok } from "./grok";
import { createInstacartRecipePage } from "./instacart";
import { getRecipeFromYouTube, findBestRecipeVideo } from "./videoRecipeExtractor";
import { extractFoodNameForNutrition, getServingSizeMultiplier } from "./nutritionParser";
import { parseIngredientsWithGPT } from "./gptIngredientParser";
import { registerUser, loginUser, getCurrentUser, authenticateToken, type AuthRequest } from "./auth";
import { rateLimiter } from "./rateLimiter";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import { insertProfileSchema, type InsertProfile } from "@shared/schema";

// YouTube API utilities
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Stripe configuration
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Test route for frontend auth debugging
  app.get("/test-auth", (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../test-frontend-auth.html');
    fs.readFile(filePath, 'utf8', (err: any, data: string) => {
      if (err) {
        res.status(404).send('Test file not found');
      } else {
        res.setHeader('Content-Type', 'text/html');
        res.send(data);
      }
    });
  });

  // Authentication routes
  app.post("/api/auth/register", registerUser);
  app.post("/api/auth/login", loginUser);
  app.get("/api/auth/user", authenticateToken, getCurrentUser);

  // Test user routes
  app.post("/api/auth/test-login", async (req, res) => {
    try {
      // Login with test user credentials
      const testEmail = "test@example.com";
      const testPassword = "testuser123";

      const user = await storage.getUserByEmail(testEmail);
      if (!user) {
        // Create test user if it doesn't exist
        const { hashPassword } = await import("./auth");
        const hashedPassword = await hashPassword(testPassword);
        
        const newUser = await storage.createUser({
          email: testEmail,
          phone: "555-TEST-USER",
          password_hash: hashedPassword,
          full_name: "Test User"
        });

        const { generateToken } = await import("./auth");
        const token = generateToken(newUser.id.toString());

        const { password_hash, ...userWithoutPassword } = newUser;
        return res.json({
          user: userWithoutPassword,
          token,
          message: "Test user created and logged in successfully"
        });
      }

      // User exists, generate token
      const { generateToken } = await import("./auth");
      const token = generateToken(user.id.toString());

      const { password_hash, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        token,
        message: "Test user login successful"
      });

    } catch (error: any) {
      console.error("Test login error:", error);
      res.status(500).json({ message: "Test login failed" });
    }
  });

  app.post("/api/auth/reset-test-user", async (req, res) => {
    try {
      const testEmail = "test@example.com";
      
      // Check if test user exists
      const existingUser = await storage.getUserByEmail(testEmail);
      if (!existingUser) {
        return res.status(404).json({ message: "Test user not found" });
      }

      // Reset password to default
      const { hashPassword } = await import("./auth");
      const defaultPassword = "testuser123";
      const hashedPassword = await hashPassword(defaultPassword);

      // Update user password in database
      await storage.updateUser(existingUser.id, {
        password_hash: hashedPassword
      });
      
      res.json({ 
        message: "Test user reset successfully. Password is now 'testuser123'",
        email: testEmail 
      });

    } catch (error: any) {
      console.error("Test user reset error:", error);
      res.status(500).json({ message: "Failed to reset test user" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, paymentType } = req.body;

      // Set amount based on payment type
      let paymentAmount;
      let description;

      if (paymentType === 'founders') {
        paymentAmount = 9900; // $99.00 in cents
        description = "Healthy Mama Founders Offer - Lifetime Access";
      } else if (paymentType === 'trial') {
        paymentAmount = 0; // $0 for trial setup
        description = "Healthy Mama 21-Day Premium Trial Setup";
      } else {
        paymentAmount = Math.round((amount || 0) * 100); // Convert to cents
        description = "Healthy Mama Payment";
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: paymentAmount,
        currency: "usd",
        description: description,
        metadata: {
          paymentType: paymentType || 'general'
        }
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: paymentAmount / 100 // Send back amount in dollars
      });
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message 
      });
    }
  });

  // Create subscription for 21-day trial (sets up future billing)
  app.post('/api/create-trial-subscription', async (req, res) => {
    try {
      const { email, name } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Create customer
      const customer = await stripe.customers.create({
        email: email,
        name: name || '',
        metadata: {
          trialType: '21-day-premium'
        }
      });

      // Create setup intent for future payments (trial)
      const setupIntent = await stripe.setupIntents.create({
        customer: customer.id,
        payment_method_types: ['card'],
        usage: 'off_session',
        metadata: {
          type: '21-day-trial'
        }
      });

      res.json({
        customerId: customer.id,
        clientSecret: setupIntent.client_secret,
        message: 'Trial setup created successfully'
      });
    } catch (error: any) {
      console.error('Error creating trial subscription:', error);
      res.status(500).json({ 
        message: "Error setting up trial: " + error.message 
      });
    }
  });

  // Recipe generation API
  app.post("/api/recipes/generate", async (req, res) => {
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
      console.log(`Generation mode: ${generationMode || 'legacy'}`);

      let recipe;

      if (generationMode === 'fast') {
        console.log("Fast mode: Finding YouTube video suggestion with Spoonacular time");

        try {
          // First get Spoonacular data for accurate cooking time
          let spoonacularTime = 30; // fallback

          if (process.env.SPOONACULAR_API_KEY) {
            try {
              const params = new URLSearchParams({
                apiKey: process.env.SPOONACULAR_API_KEY,
                query: description,
                number: '1',
                addRecipeInformation: 'true'
              });

              // Add filters to Spoonacular search
              if (cuisine && cuisine !== 'Any Cuisine') {
                params.append('cuisine', cuisine.toLowerCase());
              }
              if (dietRestrictions && dietRestrictions !== 'None') {
                params.append('diet', dietRestrictions.toLowerCase());
              }
              if (cookingTime && cookingTime !== 'Any Time') {
                const timeMap: Record<string, number> = {
                  'Under 15 min': 15,
                  'Under 30 min': 30,
                  'Under 1 hour': 60,
                  '1+ hours': 999
                };
                const maxTime = timeMap[cookingTime];
                if (maxTime) {
                  params.append('maxReadyTime', maxTime.toString());
                }
              }

              const spoonacularUrl = `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`;
              const response = await fetch(spoonacularUrl);
              const data = await response.json() as any;

              if (data.results && data.results.length > 0) {
                spoonacularTime = data.results[0].readyInMinutes || 30;
                console.log(`Using Spoonacular cooking time: ${spoonacularTime} minutes`);
              }
            } catch (spoonError) {
              console.log("Spoonacular lookup failed, using default time");
            }
          }

          // Fast mode: Just find a YouTube video without full recipe extraction
          const videoInfo = await findBestRecipeVideo(description, {
            cuisine,
            diet: dietRestrictions,
            cookingTime,
            availableIngredients,
            excludeIngredients
          }, spoonacularTime);

          if (videoInfo) {
            // Create a minimal recipe object with just video info and Spoonacular time
            recipe = {
              title: videoInfo.title,
              description: `Watch this video: "${videoInfo.title}" by ${videoInfo.channelTitle}`,
              image_url: videoInfo.thumbnailUrl,
              time_minutes: spoonacularTime, // Use Spoonacular time instead of default
              cuisine: cuisine || 'Any Cuisine',
              diet: dietRestrictions || 'None',
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
        // Detailed mode: Full recipe generation with YouTube extraction
        console.log("Detailed mode: Generating complete recipe");

        try {
          // Get a complete recipe from YouTube video with enhanced filter-aware search
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

            // Add any additional user preferences and ensure image URL is set
            youtubeRecipe.cuisine = cuisine || youtubeRecipe.cuisine;
            youtubeRecipe.diet = dietRestrictions || youtubeRecipe.diet;
            youtubeRecipe.image_url = youtubeRecipe.thumbnailUrl || youtubeRecipe.image_url;

            recipe = youtubeRecipe;
          } else {
            console.log("No suitable YouTube recipe found, falling back to Grok");
            // Fall back to Grok if YouTube extraction fails
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
          // Fall back to Grok if YouTube search fails
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

      // Save and return the recipe (for both fast and detailed modes)
      if (recipe) {
        // Add nutrition calculation for detailed recipes
        if (generationMode === 'detailed' && recipe.ingredients && recipe.ingredients.length > 0) {
          try {
            const { calculateRecipeNutrition } = await import('./nutritionCalculator');

            // Helper function to get USDA nutrition data
            const getUSDANutrition = async (foodName: string) => {
              try {
                console.log(`Looking up USDA nutrition for: "${foodName}"`);
                const searchResponse = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(foodName)}&api_key=${process.env.USDA_API_KEY}&pageSize=1`);

                if (searchResponse.ok) {
                  const searchData: any = await searchResponse.json();
                  if (searchData.foods && searchData.foods.length > 0) {
                    const foodId = searchData.foods[0].fdcId;
                    console.log(`Found USDA food ID ${foodId} for "${foodName}"`);
                    const nutritionResponse = await fetch(`https://api.nal.usda.gov/fdc/v1/food/${foodId}?api_key=${process.env.USDA_API_KEY}`);

                    if (nutritionResponse.ok) {
                      const nutritionData: any = await nutritionResponse.json();
                      const nutrients = nutritionData.foodNutrients || [];

                      let nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 };

                      nutrients.forEach((nutrient: any) => {
                        const name = nutrient.nutrient?.name?.toLowerCase() || '';
                        const value = parseFloat(nutrient.amount) || 0;

                        if (name.includes('energy')) nutrition.calories = value;
                        else if (name.includes('protein')) nutrition.protein = value;
                        else if (name.includes('carbohydrate')) nutrition.carbs = value;
                        else if (name.includes('total lipid') || name.includes('fat')) nutrition.fat = value;
                        else if (name.includes('fiber')) nutrition.fiber = value;
                        else if (name.includes('sugars')) nutrition.sugar = value;
                        else if (name.includes('sodium')) nutrition.sodium = value;
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

            // Calculate nutrition with proper serving breakdown
            const nutritionData = await calculateRecipeNutrition(recipe, getUSDANutrition);

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
          } catch (nutritionError: any) {
            console.log('Nutrition calculation failed:', nutritionError.message);
            console.log('Proceeding without nutrition data');
          }
        }

        // Debug: Check video data before saving
        console.log("Recipe video data before saving:", {
          video_id: recipe.video_id,
          video_title: recipe.video_title,
          video_channel: recipe.video_channel
        });

        // Ensure all required fields are included when saving
        const recipeToSave = {
          ...recipe,
          video_id: recipe.video_id || null,
          video_title: recipe.video_title || null,
          video_channel: recipe.video_channel || null,
          time_minutes: recipe.time_minutes || recipe.timeMinutes || 30, // Default to 30 min if not set
          image_url: recipe.image_url || recipe.imageUrl || `https://source.unsplash.com/800x600/?food,${encodeURIComponent(recipe.title.toLowerCase())},cooking,delicious`
        };

        // DISH NAME MAPPING: Map to familiar, recognizable names
        let familiarTitle = recipeToSave.title;
        try {
          const { mapToFamiliarDishName } = await import('./familiarDishNameMapper');
          const mapping = mapToFamiliarDishName(
            recipeToSave.title,
            'unknown', // default cuisine type if not available
            recipeToSave.ingredients
          );

          if (mapping.confidence > 0.6) {
            console.log(`📝 Dish name mapping: "${recipeToSave.title}" → "${mapping.familiarName}" (${mapping.cuisine}, confidence: ${mapping.confidence})`);
            familiarTitle = mapping.familiarName;
          }
        } catch (mappingError) {
          console.warn('Dish name mapping error:', mappingError);
          // Continue with original title
        }

        // DIETARY VALIDATION: Check recipe compliance before saving
        let finalRecipe = { ...recipeToSave, title: familiarTitle };
        if (dietRestrictions) {
          try {
            const { validateRecipeDietaryCompliance, getSuggestedRecipeFixes } = await import('./dietaryValidationService');

            const validation = await validateRecipeDietaryCompliance(recipeToSave, [dietRestrictions]);
            console.log(`🔍 Dietary validation: ${validation.isCompliant ? 'PASS' : 'FAIL'} (${validation.violations.length} violations)`);

            if (!validation.isCompliant) {
              console.warn(`❌ Dietary violations detected for "${dietRestrictions}":`, validation.violations.map(v => v.ingredient));

              // Try to automatically fix the recipe
              const fixedRecipe = await getSuggestedRecipeFixes(recipeToSave, validation, [dietRestrictions]);

              // Re-validate the fixed recipe
              const revalidation = await validateRecipeDietaryCompliance(fixedRecipe, [dietRestrictions]);

              if (revalidation.isCompliant) {
                console.log(`✅ Recipe automatically fixed for dietary compliance`);
                finalRecipe = fixedRecipe;
              } else {
                console.warn(`⚠️ Could not fully fix recipe, serving with warnings`);
                // Add validation warnings to recipe metadata
                finalRecipe.dietary_warnings = validation.suggestions;
                finalRecipe.dietary_compliance_score = validation.confidence;
              }
            } else {
              console.log(`✅ Recipe passes dietary validation for "${dietRestrictions}"`);
            }
          } catch (validationError) {
            console.error('Dietary validation error:', validationError);
            // Continue without validation rather than failing
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ message: `Failed to generate recipe: ${errorMessage}` });
    }
  });

  // Get popular recipes
  app.get("/api/recipes/popular", async (_req, res) => {
    try {
      const recipes = await storage.getPopularRecipes();
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching popular recipes:", error);
      res.status(500).json({ message: "Failed to fetch popular recipes" });
    }
  });

  // Get saved recipes
  app.get("/api/recipes/saved", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const recipes = await storage.getSavedRecipes(userId);
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
      res.status(500).json({ message: "Failed to fetch saved recipes" });
    }
  });

  // Get generated recipes
  app.get("/api/recipes/generated", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const recipes = await storage.getGeneratedRecipes(userId);
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching generated recipes:", error);
      res.status(500).json({ message: "Failed to fetch generated recipes" });
    }
  });

  // Save a recipe
  app.post("/api/recipes/:id/save", async (req, res) => {
    try {
      const recipeId = parseInt(req.params.id);

      if (isNaN(recipeId)) {
        console.log(`Invalid recipe ID: ${req.params.id}`);
        return res.status(400).json({ message: "Invalid recipe ID" });
      }

      console.log(`Attempting to save recipe ${recipeId}`);

      // Check if recipe exists first
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
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

  // Unsave a recipe
  app.delete("/api/recipes/:id/save", async (req, res) => {
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
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

  // Create shoppable recipe with Instacart
  app.post("/api/recipes/instacart", async (req, res) => {
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

  // Create Instacart shopping list (for Search page)
  app.post("/api/instacart/create-list", async (req, res) => {
    try {
      const { ingredients, recipeName } = req.body;

      if (!ingredients || !Array.isArray(ingredients) || !recipeName) {
        return res.status(400).json({ message: "Recipe ingredients and name are required" });
      }

      // Format ingredients for Instacart API
      const formattedIngredients = ingredients.map((ingredient: string, index: number) => ({
        name: ingredient,
        display_text: ingredient,
        measurements: [{
          quantity: 1,
          unit: "item"
        }]
      }));

      const recipeData = {
        title: recipeName,
        image_url: "", // Optional - can be empty
        link_type: "recipe",
        instructions: ["Follow the recipe instructions"],
        ingredients: formattedIngredients,
        landing_page_configuration: {
          partner_linkback_url: process.env.REPLIT_DOMAINS ? 
            `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 
            "https://example.com",
          enable_pantry_items: true
        }
      };

      const shoppableRecipe: any = await createInstacartRecipePage(recipeData);

      // Return the shopping URL that the frontend expects
      res.json({ 
        shopping_url: shoppableRecipe?.products_link_url || shoppableRecipe?.link_url || shoppableRecipe?.url,
        ...shoppableRecipe 
      });
    } catch (error) {
      console.error("Error creating Instacart shopping list:", error);
      res.status(500).json({ message: "Failed to create shopping list" });
    }
  });

  // Meal plan CRUD operations
  app.get("/api/meal-plans/saved", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const savedPlans = await storage.getSavedMealPlans(Number(userId));
      console.log('Raw meal plans from DB:', JSON.stringify(savedPlans.slice(0, 1), null, 2));

      // CRITICAL FIX: Map database field (mealPlan) to frontend field (meal_plan)
      const formattedPlans = savedPlans.map(plan => {
        const { mealPlan, ...planWithoutMealPlan } = plan;
        return {
          ...planWithoutMealPlan,
          meal_plan: mealPlan // Map camelCase DB field to snake_case frontend field
        };
      });

      console.log('Formatted meal plans for frontend:', JSON.stringify(formattedPlans.slice(0, 1), null, 2));
      res.json(formattedPlans);
    } catch (error) {
      console.error("Error fetching saved meal plans:", error);
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });

  app.post("/api/meal-plans", authenticateToken, async (req: AuthRequest, res) => {
    try {
      console.log('🔍 MEAL PLAN SAVE DEBUG:');
      console.log('   - Request headers:', req.headers.authorization ? 'Authorization Present' : 'No Auth Header');
      console.log('   - User from token:', req.user?.id || 'No user ID');
      console.log('   - Request body keys:', Object.keys(req.body));
      
      const userId = req.user?.id;
      if (!userId) {
        console.log('❌ SAVE FAILED: User not authenticated');
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { name, description, meal_plan, is_auto_saved } = req.body;
      console.log('   - Plan name:', name);
      console.log('   - Meal plan exists:', !!meal_plan);
      console.log('   - Meal plan days:', meal_plan ? Object.keys(meal_plan) : 'none');

      if (!name || !meal_plan) {
        console.log('❌ SAVE FAILED: Missing required fields');
        return res.status(400).json({ message: "Name and meal plan are required" });
      }

      // Enhanced validation for meal plan structure
      if (typeof meal_plan !== 'object' || meal_plan === null) {
        console.log('❌ SAVE FAILED: meal_plan is not an object');
        return res.status(400).json({ message: "Invalid meal plan structure" });
      }

      const dayKeys = Object.keys(meal_plan);
      if (dayKeys.length === 0) {
        console.log('❌ SAVE FAILED: meal_plan has no days');
        return res.status(400).json({ message: "Meal plan must contain at least one day" });
      }

      // Validate each day has at least one meal
      for (const dayKey of dayKeys) {
        const dayMeals = meal_plan[dayKey];
        if (!dayMeals || typeof dayMeals !== 'object' || Object.keys(dayMeals).length === 0) {
          console.log(`❌ SAVE FAILED: ${dayKey} has no meals`);
          return res.status(400).json({ message: `Day ${dayKey} must contain at least one meal` });
        }
      }

      console.log('💾 Calling storage.saveMealPlan...');
      const savedPlan = await storage.saveMealPlan({
        userId: Number(userId),
        name,
        description: description || "",
        mealPlan: meal_plan,
        isAutoSaved: is_auto_saved || false
      });

      console.log('✅ SAVE SUCCESS:', savedPlan?.id || 'unknown ID');
      
      // Check if this is the user's first meal plan for achievement tracking
      const allUserPlans = await storage.getSavedMealPlans(Number(userId));
      const isFirstMealPlan = allUserPlans.length === 1; // Just saved their first one
      
      // Return achievement data for frontend to trigger notifications
      res.json({
        ...savedPlan,
        achievements: {
          firstMealPlan: isFirstMealPlan
        }
      });
    } catch (error) {
      console.error("❌ SAVE ERROR:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Failed to save meal plan", error: errorMessage });
    }
  });

  app.put("/api/meal-plans/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      const planId = Number(req.params.id);
      const { name, description, meal_plan } = req.body;

      console.log('Update request - planId:', planId, 'name:', name, 'meal_plan exists:', !!meal_plan, 'meal_plan type:', typeof meal_plan);

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

      console.log('Meal plan updated successfully:', updatedPlan.id);

      // Ensure we return valid JSON
      if (!updatedPlan) {
        return res.status(500).json({ message: "Update failed - no data returned" });
      }

      res.json(updatedPlan);
    } catch (error) {
      console.error("Error updating meal plan:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Failed to update meal plan", error: errorMessage });
    }
  });

  app.delete("/api/meal-plans/:id", authenticateToken, async (req: AuthRequest, res) => {
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

      console.log('Meal plan deleted successfully:', planId);
      res.json({ message: "Meal plan deleted successfully", success: true });
    } catch (error) {
      console.error("Error deleting meal plan:", error);
      res.status(500).json({ message: "Failed to delete meal plan" });
    }
  });

  // Meal completion routes
  app.get("/api/meal-plans/:id/completions", authenticateToken, async (req: AuthRequest, res) => {
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

  app.post("/api/meal-plans/:id/completions/toggle", authenticateToken, async (req: AuthRequest, res) => {
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

  // Complete entire meal plan
  app.post("/api/meal-plans/:id/complete", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      const mealPlanId = Number(req.params.id);

      console.log(`🚀 ROUTE DEBUG: Complete plan request - userId: ${userId}, mealPlanId: ${mealPlanId}`);

      if (!userId) {
        console.log(`❌ ROUTE DEBUG: User not authenticated`);
        return res.status(401).json({ message: "User not authenticated" });
      }

      console.log(`✅ ROUTE DEBUG: User authenticated, calling storage.completeMealPlan`);

      // Mark the meal plan as completed by setting a completion flag
      const completedPlan = await storage.completeMealPlan(Number(userId), mealPlanId);
      
      console.log(`📊 ROUTE DEBUG: Storage returned:`, completedPlan ? 'Plan object' : 'null');

      if (!completedPlan) {
        console.log(`❌ ROUTE DEBUG: No plan returned from storage, sending 404`);
        return res.status(404).json({ message: "Meal plan not found or unauthorized" });
      }

      console.log(`✅ ROUTE DEBUG: Plan completed successfully, sending response`);
      res.json({ message: "Meal plan completed successfully", plan: completedPlan });
    } catch (error) {
      console.error("❌ ROUTE DEBUG: Error completing meal plan:", error);
      res.status(500).json({ message: "Failed to complete meal plan" });
    }
  });

  app.get("/api/meal-plan/latest", async (req, res) => {
    try {
      // Disabled caching - return empty response for now
      return res.status(404).json({ message: "No recent meal plan found" });
    } catch (error) {
      console.error("Error fetching latest meal plan:", error);
      res.status(500).json({ message: "Failed to fetch latest meal plan" });
    }
  });

  // Generate meal plan using ChatGPT with caching and rate limiting
  app.post("/api/meal-plan/generate", async (req, res) => {
    const startTime = Date.now(); // Fix: Define startTime
    try {
      // Try to get user ID from token, fallback to IP-based rate limiting
      let userId = 'anonymous';
      const authHeader = req.headers.authorization;
      console.log('🔍 JWT DEBUG - Authorization header:', authHeader ? 'Present' : 'Missing');
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          console.log('🔍 JWT DEBUG - Token length:', token.length);
          console.log('🔍 JWT DEBUG - JWT_SECRET available:', !!process.env.JWT_SECRET);
          
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
          userId = decoded.userId;
          console.log('🔍 JWT DEBUG - Decoded userId:', userId);
          console.log('🔍 JWT DEBUG - Decoded token payload:', { userId: decoded.userId, email: decoded.email });
        } catch (error: any) {
          console.log('❌ JWT DEBUG - Token verification failed:', error.message);
          // Use IP as fallback for rate limiting
          userId = req.ip || 'anonymous';
        }
      } else {
        console.log('🔍 JWT DEBUG - No Bearer token found');
        userId = req.ip || 'anonymous';
      }

      // Check rate limit
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
        planTargets = ["Everyone"] // New parameter for family member targeting (array)
      } = req.body;

      // Disable caching - always generate fresh meal plans
        // const cacheKey = JSON.stringify({
        //   numDays,
        //   mealsPerDay,
        //   cookTime,
        //   difficulty,
        //   nutritionGoal,
        //   dietaryRestrictions,
        //   availableIngredients,
        //   excludeIngredients,
        //   primaryGoal,
        //   selectedFamilyMembers: selectedFamilyMembers?.sort(),
        //   useIntelligentPrompt
        // });

        // const cachedResult = getCachedMealPlan(cacheKey);
        // if (cachedResult) {
        //   console.log('Serving cached meal plan');
        //   return res.json(cachedResult);
        // }

      // Get user profile for intelligent prompt building
      let userProfile = null;
      let culturalCuisineData = null;
      try {
        if (userId !== 'anonymous' && useIntelligentPrompt) {
          console.log('Attempting to fetch user profile for userId:', userId);
          const userIdNum = parseInt(userId.toString());
          userProfile = await storage.getProfile(userIdNum);
          console.log('User profile found:', userProfile);

          // Get cultural cuisine data if user has cultural preferences
          if (userProfile && userProfile.cultural_background && Array.isArray(userProfile.cultural_background) && userProfile.cultural_background.length > 0) {
            console.log('User has cultural background:', userProfile.cultural_background);
            const { getCachedCulturalCuisine } = await import('./cultureCacheManager');
            culturalCuisineData = await getCachedCulturalCuisine(userIdNum, userProfile.cultural_background);
            console.log(`Retrieved cultural cuisine data for: ${userProfile.cultural_background.join(', ')}`);
            console.log('Cultural cuisine data structure:', Object.keys(culturalCuisineData || {}));
          }
        } else {
          console.log('Skipping user profile fetch - userId:', userId, 'useIntelligentPrompt:', useIntelligentPrompt);
        }
      } catch (error) {
        console.log('Could not fetch user profile, using basic prompt. Error:', error);
      }

      let prompt;

      // Generate day structure for all cases
      const dayStructure = [];
      for (let i = 1; i <= numDays; i++) {
        dayStructure.push(`"day_${i}"`);
      }

      if (useIntelligentPrompt && (userProfile || culturalBackground.length > 0)) {
        // Use intelligent prompt builder with profile data or cultural preferences
        const { buildIntelligentPrompt } = await import('./intelligentPromptBuilder');
        const { mergeFamilyDietaryRestrictions } = await import('../shared/schema');

        // Merge dietary restrictions from profile and family members
        const profileRestrictions = userProfile?.preferences || [];
        const familyMembers = Array.isArray(userProfile?.members) ? userProfile.members : [];
        const familyRestrictions = mergeFamilyDietaryRestrictions(familyMembers);
        
        // Combine all restrictions: request > family > profile
        const allRestrictions = new Set<string>();
        
        // Add request restrictions (highest priority)
        if (dietaryRestrictions) {
          dietaryRestrictions.split(',').forEach((r: string) => {
            const trimmed = r.trim();
            if (trimmed) allRestrictions.add(trimmed);
          });
        }
        
        // Add family member restrictions
        if (Array.isArray(familyRestrictions)) {
          familyRestrictions.forEach((r: string) => allRestrictions.add(r));
        }
        
        // Add profile restrictions
        if (Array.isArray(profileRestrictions)) {
          profileRestrictions.forEach((r: string) => allRestrictions.add(r));
        }
        
        const mergedRestrictions = Array.from(allRestrictions).join(', ');
        console.log('Merged dietary restrictions:', mergedRestrictions);

        const filters = {
          numDays,
          mealsPerDay,
          cookTime,
          difficulty,
          nutritionGoal,
          dietaryRestrictions: mergedRestrictions, // Use merged restrictions
          availableIngredients,
          excludeIngredients,
          primaryGoal: primaryGoal || userProfile?.primary_goal,
          familySize: userProfile?.family_size || undefined,
          familyMembers: familyMembers,
          profileType: userProfile?.profile_type as 'individual' | 'family' || 'individual',
          // UNIFIED: Set intelligent defaults based on primary goal across entire system
          encourageOverlap: primaryGoal === 'Save Money' || userProfile?.primary_goal === 'Save Money',
          availableIngredientUsagePercent: primaryGoal === 'Save Money' ? 80 : 60,
          // Add cultural cuisine data
          culturalCuisineData: culturalCuisineData,
          culturalBackground: userProfile?.cultural_background || culturalBackground || []
        };

        prompt = await buildIntelligentPrompt(filters);
        console.log('Using intelligent prompt with family profile data');
      } else {
        // Use original prompt builder
        prompt = `Create exactly a ${numDays}-day meal plan with ${mealsPerDay} meals per day.

CRITICAL: You must generate exactly ${numDays} days. Generate days: ${dayStructure.join(', ')}.

Requirements:
- Vary proteins: chicken, fish, beef, turkey, plant-based, eggs
- Mix cuisines: Italian, Asian, Mexican, Mediterranean  
- Max cook time: ${cookTime} minutes
- Difficulty: MAXIMUM ${difficulty}/5 (use 0.5 increments: 1, 1.5, 2, 2.5, 3, etc.)
- CRITICAL: ALL recipes must have difficulty <= ${difficulty}
- Use precise difficulty ratings in 0.5 increments for accurate complexity assessment
- Goal: ${nutritionGoal || 'balanced nutrition'}`;

        if (dietaryRestrictions) {
          prompt += `\n- Dietary restrictions: ${dietaryRestrictions}`;
        }
        if (availableIngredients) {
          prompt += `\n- Use these ingredients: ${availableIngredients}`;
        }
        if (excludeIngredients) {
          prompt += `\n- Avoid these ingredients: ${excludeIngredients}`;
        }

        // Add family member information if provided
        if (selectedFamilyMembers && selectedFamilyMembers.length > 0) {
          prompt += `\n- Creating meal plan for: ${selectedFamilyMembers.join(', ')}`;
          prompt += `\n- Consider preferences and portions for ${selectedFamilyMembers.length} selected family members`;
        }

        // UNIFIED GOAL SYSTEM: Apply goal-specific optimizations
        if (primaryGoal === 'Save Money') {
          prompt += `\n- COST OPTIMIZATION: Maximize ingredient reuse across meals to minimize shopping costs`;
          prompt += `\n- Aim for 3+ shared ingredients between different meals`;
          prompt += `\n- Suggest bulk buying opportunities when possible`;
        } else if (primaryGoal === 'Gain Muscle') {
          prompt += `\n- MUSCLE BUILDING: Focus on high-protein meals (25-35g protein per meal)`;
          prompt += `\n- Include complete proteins like chicken, fish, eggs, legumes`;
        } else if (primaryGoal === 'Lose Weight') {
          prompt += `\n- WEIGHT MANAGEMENT: Create calorie-controlled, satisfying meals`;
          prompt += `\n- Prioritize high-volume, low-calorie foods like vegetables`;
        } else if (primaryGoal === 'Family Nutrition') {
          prompt += `\n- FAMILY-FRIENDLY: Create meals that appeal to all family members`;
          prompt += `\n- Include kid-friendly options that are still nutritious`;
        }

        // Generate explicit day structure example based on mealsPerDay
        const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
        const selectedMealTypes = mealTypes.slice(0, mealsPerDay);

        const exampleDays = [];
        for (let i = 1; i <= Math.min(numDays, 3); i++) {
          if (i === 1) {
            const mealsExample = selectedMealTypes.map((mealType, index) => {
              const calories = 350 + (index * 50);
              const protein = 20 + (index * 5);
              const carbs = 30 + (index * 5);
              const fat = 15 + (index * 3);
              return `        "${mealType}": {"title": "Recipe Name", "cook_time_minutes": ${15 + (index * 5)}, "difficulty": ${difficulty}, "ingredients": ["ingredient ${index + 1}"], "instructions": ["step ${index + 1}"], "nutrition": {"calories": ${calories}, "protein_g": ${protein}, "carbs_g": ${carbs}, "fat_g": ${fat}}}`;
            }).join(',\n');

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
${exampleDays.join(',\n')}
  },
  "shopping_list": ["ingredient list"],
  "prep_tips": ["tip 1", "tip 2"]
}

Remember: You MUST include all ${numDays} days (${dayStructure.join(', ')}) in the meal_plan object.`;
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a meal planning expert. You MUST generate exactly the requested number of days. Follow the user's specifications precisely and generate complete meal plans with all requested days. Always return valid JSON.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.2, // Lower for more consistent adherence to requirements
          max_tokens: 4000 // Increased to ensure all days fit
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: any = await response.json();
      let mealPlan;

      try {
        const content = data.choices[0].message.content;
        if (!content || content.trim() === '') {
          throw new Error('Empty response from AI');
        }
        mealPlan = JSON.parse(content);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('AI Response:', data.choices[0].message.content);
        throw new Error('Invalid response format from AI. Please try again.');
      }

      // Validate the meal plan structure
      if (!mealPlan.meal_plan || typeof mealPlan.meal_plan !== 'object') {
        throw new Error('Invalid meal plan structure - missing meal_plan object');
      }

      // Apply difficulty rounding and validation
      validateAndRoundDifficulties(mealPlan.meal_plan, difficulty);

      // DIETARY VALIDATION: Check meal plan compliance before caching
      let finalMealPlan = mealPlan;
      if (dietaryRestrictions) {
        try {
          const { validateMealPlanDietaryCompliance } = await import('./dietaryValidationService');

          const validation = await validateMealPlanDietaryCompliance(mealPlan, [dietaryRestrictions]);
          console.log(`🔍 Meal plan dietary validation: ${validation.overallCompliance}% compliance (${validation.compliantMeals}/${validation.totalMeals} meals)`);

          if (validation.overallCompliance < 80) {
            console.warn(`❌ Low dietary compliance for "${dietaryRestrictions}":`, validation.summary);

            // Add validation metadata to meal plan
            finalMealPlan.dietary_validation = {
              compliance_score: validation.overallCompliance,
              compliant_meals: validation.compliantMeals,
              total_meals: validation.totalMeals,
              violations_summary: validation.summary,
              validation_timestamp: new Date().toISOString()
            };

            // Log specific violations for debugging
            Object.entries(validation.violations).forEach(([mealKey, result]) => {
              console.warn(`  - ${mealKey}: ${result.violations.length} violations`);
            });
          } else {
            console.log(`✅ Meal plan passes dietary validation for "${dietaryRestrictions}" (${validation.overallCompliance}% compliance)`);
            finalMealPlan.dietary_validation = {
              compliance_score: validation.overallCompliance,
              compliant_meals: validation.compliantMeals,
              total_meals: validation.totalMeals,
              validation_timestamp: new Date().toISOString()
            };
          }
        } catch (validationError) {
          console.error('Meal plan dietary validation error:', validationError);
          // Continue without validation rather than failing
        }
      }

      // DISH NAME ENHANCEMENT: Map to familiar, recognizable names
      try {
        const { enhanceMealPlanNames } = await import('./mealPlanEnhancer');

        // Extract cultural background from profile or request body
        const culturalBackgroundArray = userProfile?.cultural_background || [];

        const enhancement = await enhanceMealPlanNames(
          finalMealPlan,
          culturalBackgroundArray as string[]
        );

        console.log(`📝 Meal plan enhancement: ${enhancement.enhancementStats.familiarNameChanges} name changes, ${enhancement.enhancementStats.cuisineCorrections} cuisine corrections`);
        console.log(`   Average naming confidence: ${(enhancement.enhancementStats.averageConfidence * 100).toFixed(1)}%`);

        if (enhancement.enhancementStats.familiarNameChanges > 0) {
          finalMealPlan = enhancement.enhancedMealPlan;
          console.log('   Enhanced meal names:');
          enhancement.enhancementLog.slice(0, 3).forEach(log => console.log(`     ${log}`));
        }

      } catch (enhancementError) {
        console.error('Meal plan enhancement error:', enhancementError);
        // Continue without enhancement rather than failing
      }

      const dayCount = Object.keys(finalMealPlan.meal_plan).length;
      console.log(`Generated meal plan has ${dayCount} days, expected ${numDays}`);

      // Ensure we have the correct number of days
      if (dayCount !== numDays) {
        console.error(`CRITICAL ERROR: Day count mismatch: generated ${dayCount}, expected ${numDays}`);
        throw new Error(`AI generated ${dayCount} days instead of requested ${numDays} days. Please try again.`);
      }

      // Disable caching - always generate fresh meal plans
      console.log(`✅ Generated fresh meal plan in ${Date.now() - startTime}ms (no caching)`);
      res.json(finalMealPlan);

    } catch (error) {
      console.error("Error generating meal plan:", error);
      res.status(500).json({ message: "Failed to generate meal plan" });
    }
  });

  // Weight-based meal plan generation
  app.post("/api/meal-plan/generate-weight-based", authenticateToken, async (req: AuthRequest, res) => {
    console.log('\n🚀 HYBRID SYSTEM ACTIVATION - Weight-based meal plan generation started');
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    const startTime = Date.now();
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Check rate limit
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
        planTargets = ["Everyone"], // New parameter for family member targeting (array)
        maxCookTime = 45, // Default 45 minutes, but can be overridden from UI
        maxDifficulty = 3 // Default difficulty 3, but can be overridden from UI
      } = req.body;

      // Get weight-based profile and user profile for advanced prompt integration
      let weightBasedProfile = null;
      let userProfile = null;
      let culturalCuisineData = null;
      
      try {
        userProfile = await storage.getProfile(Number(userId));
        console.log('Retrieved user profile for weight-based system:', userProfile?.profile_name);
        
        console.log('🔍 PROFILE TYPE DEBUG:', {
          profile_type: userProfile?.profile_type,
          has_goals: !!userProfile?.goals,
          goals_length: userProfile?.goals?.length,
          profile_name: userProfile?.profile_name
        });
        
        // FIXED: Handle profiles with goals regardless of profile_type
        if (userProfile && userProfile.goals && Array.isArray(userProfile.goals) && userProfile.goals.length > 0) {
          // Parse goal weights from stored goals
          const storedGoalWeights: any = {};
          userProfile.goals.forEach((goal: string) => {
            const [key, value] = goal.split(':');
            storedGoalWeights[key] = parseFloat(value) || 0.5;
          });
          
          console.log('✅ PARSED GOAL WEIGHTS:', storedGoalWeights);
          
          weightBasedProfile = {
            profileName: userProfile.profile_name,
            familySize: userProfile.family_size,
            goalWeights: storedGoalWeights,
            dietaryRestrictions: userProfile.preferences || [],
            culturalBackground: userProfile.cultural_background || []
          };
          
          console.log('✅ WEIGHT-BASED PROFILE CREATED:', {
            goalWeights: weightBasedProfile.goalWeights,
            culturalBackground: weightBasedProfile.culturalBackground
          });
        } else {
          console.log('❌ No weight-based profile data found - no goals in profile');
        }

        // Get cultural cuisine data if user has cultural preferences (for advanced prompt integration)
        if (userProfile && userProfile.cultural_background && Array.isArray(userProfile.cultural_background) && userProfile.cultural_background.length > 0) {
          console.log('Weight-based system: User has cultural background:', userProfile.cultural_background);
          const { getCachedCulturalCuisine } = await import('./cultureCacheManager');
          culturalCuisineData = await getCachedCulturalCuisine(Number(userId), userProfile.cultural_background);
          console.log(`Weight-based system: Retrieved cultural cuisine data for: ${userProfile.cultural_background.join(', ')}`);
        }
      } catch (error) {
        console.log('Could not fetch user profile for weight-based system, using request data. Error:', error);
      }

      // Import helper function
      const { mergeFamilyDietaryRestrictions } = await import('../shared/schema');
      
      // Merge dietary restrictions from all sources
      const allRestrictions = new Set<string>();
      
      // Add weight-based profile restrictions
      if (weightBasedProfile?.dietaryRestrictions && Array.isArray(weightBasedProfile.dietaryRestrictions)) {
        weightBasedProfile.dietaryRestrictions.forEach((r: string) => allRestrictions.add(r));
      }
      
      // Add traditional profile restrictions (preferences field)
      if (userProfile?.preferences && Array.isArray(userProfile.preferences)) {
        userProfile.preferences.forEach(r => allRestrictions.add(r));
      }
      
      // Add family member restrictions if traditional profile
      if (userProfile?.members && Array.isArray(userProfile.members)) {
        const familyRestrictions = mergeFamilyDietaryRestrictions(userProfile.members);
        familyRestrictions.forEach(r => allRestrictions.add(r));
      }
      
      // Add request restrictions (highest priority)
      if (dietaryRestrictions && Array.isArray(dietaryRestrictions)) {
        dietaryRestrictions.forEach((r: any) => {
          if (r && r.trim()) allRestrictions.add(r.trim());
        });
      }
      
      const mergedDietaryRestrictions = Array.from(allRestrictions);
      console.log('Weight-based system - Merged dietary restrictions:', mergedDietaryRestrictions);

      // MEMBER-SPECIFIC FILTERING: Apply planTargets filtering for specific family members
      let targetMemberRestrictions = mergedDietaryRestrictions;
      let targetMemberNames = planTargets;
      
      if (!planTargets.includes("Everyone") && userProfile?.members && Array.isArray(userProfile.members)) {
        console.log(`🎯 Filtering meal plan for specific members: "${planTargets.join(', ')}"`);
        
        // Collect restrictions from all selected members
        const memberRestrictions = new Set<string>();
        
        planTargets.forEach(targetName => {
          const targetMember = userProfile.members.find((member: any) => member.name === targetName);
          
          if (targetMember) {
            console.log(`✅ Found target member: ${targetName}`, targetMember);
            
            // Add member's specific dietary restrictions
            if (targetMember.dietaryRestrictions && Array.isArray(targetMember.dietaryRestrictions)) {
              targetMember.dietaryRestrictions.forEach((restriction: string) => {
                if (restriction && restriction.trim()) {
                  memberRestrictions.add(restriction.trim());
                }
              });
            }
            
            // Also check preferences for dietary restrictions (backward compatibility)
            if (targetMember.preferences && Array.isArray(targetMember.preferences)) {
              targetMember.preferences.forEach((pref: string) => {
                const lowerPref = pref.toLowerCase().trim();
                if (lowerPref.includes('allerg') || lowerPref.includes('intoleran') || 
                    lowerPref.includes('free') || lowerPref.includes('vegan') || 
                    lowerPref.includes('vegetarian') || lowerPref.includes('kosher') ||
                    lowerPref.includes('halal') || lowerPref.includes('diet')) {
                  memberRestrictions.add(pref.trim());
                }
              });
            }
          } else {
            console.warn(`⚠️ Could not find family member "${targetName}", skipping`);
          }
        });
        
        // Still include request-level restrictions (highest priority)
        if (dietaryRestrictions && Array.isArray(dietaryRestrictions)) {
          dietaryRestrictions.forEach((r: any) => {
            if (r && r.trim()) memberRestrictions.add(r.trim());
          });
        }
        
        targetMemberRestrictions = Array.from(memberRestrictions);
        console.log(`🎯 Combined restrictions for selected members [${planTargets.join(', ')}]:`, targetMemberRestrictions);
        
      } else if (!planTargets.includes("Everyone") && planTargets.length > 0) {
        console.log(`ℹ️ Plan targets "${planTargets.join(', ')}" specified but no family members found, using merged restrictions`);
      }

      // Use profile data or fallback to request data
      // FIXED: Properly prioritize profile data over request data when request data is empty/undefined
      const finalGoalWeights = (goalWeights && Object.keys(goalWeights || {}).length > 0) ? 
        goalWeights : (weightBasedProfile?.goalWeights || {
          cost: 0.5, health: 0.5, cultural: 0.5, variety: 0.5, time: 0.5
        });
      const finalDietaryRestrictions = targetMemberRestrictions; // Use member-filtered restrictions
      const finalCulturalBackground = (culturalBackground && culturalBackground.length > 0) ? 
        culturalBackground : (weightBasedProfile?.culturalBackground || []);

      // 🔍 DEBUG: Check the final values being passed to prompt builder
      console.log('\n🎯 CULTURAL INTEGRATION CHECK:');
      console.log('  - Cultural weight:', finalGoalWeights.cultural);
      console.log('  - Cultural weight > 0.3?', finalGoalWeights.cultural > 0.3);
      console.log('  - Cultural background:', finalCulturalBackground);
      console.log('  - Will integrate cultural meals?', finalGoalWeights.cultural > 0.3 && finalCulturalBackground.length > 0);
      console.log('🔍 FINAL VALUES DEBUG:');
      console.log('  - Final goal weights:', JSON.stringify(finalGoalWeights, null, 2));
      console.log('  - Final cultural background:', finalCulturalBackground);
      console.log('  - Request goalWeights:', goalWeights ? 'provided' : 'undefined');
      console.log('  - Request culturalBackground:', culturalBackground?.length > 0 ? culturalBackground : 'empty/undefined');
      console.log('  - Profile goalWeights:', weightBasedProfile?.goalWeights ? 'available' : 'not available');
      console.log('  - Profile culturalBackground:', weightBasedProfile?.culturalBackground || 'not available');

      // Adjust final family size based on plan targets
      let finalFamilySize;
      if (!planTargets.includes("Everyone") && userProfile?.members && Array.isArray(userProfile.members)) {
        // Count how many valid target members we found
        const validTargetCount = planTargets.filter(targetName => 
          userProfile.members.find((member: any) => member.name === targetName)
        ).length;
        
        if (validTargetCount > 0) {
          finalFamilySize = validTargetCount; // Size based on selected members
          console.log(`🎯 Final family size set to ${validTargetCount} for selected members: ${planTargets.join(', ')}`);
        } else {
          finalFamilySize = familySize || weightBasedProfile?.familySize || 2;
        }
      } else {
        finalFamilySize = familySize || weightBasedProfile?.familySize || 2;
      }

      // Initialize weight-based meal planner
      const { WeightBasedMealPlanner } =  await import('./WeightBasedMealPlanner');
      const planner = new WeightBasedMealPlanner();

      // Get hero ingredients for cost optimization
      let heroIngredients: string[] = [];
      if (finalGoalWeights.cost > 0.6) {
        const { HeroIngredientManager } = await import('./HeroIngredientManager');
        const heroManager = new HeroIngredientManager();
        const heroSelection = await heroManager.selectHeroIngredients(
          finalCulturalBackground,
          availableIngredients.split(',').map((i: string) => i.trim()).filter(Boolean),
          finalGoalWeights.cost,
          finalDietaryRestrictions
        );
        heroIngredients = Array.isArray(heroSelection?.selected_ingredients) ? 
          heroSelection.selected_ingredients.map(ing => ing.name) : [];
        console.log('Selected hero ingredients:', heroIngredients);
      }

      // V2 INTEGRATION: Use Prompt Builder V2 with main goal + weight-based enhancement
      let prompt: string;
      
      // Extract main goal from profile for advanced prompt integration
      const primaryGoal = userProfile?.primary_goal || 'Save Money'; // Default to Save Money instead of Weight-Based Planning
      console.log('\n🎯 HYBRID GOAL SYSTEM DEBUG:');
      console.log('  - User profile primary_goal:', userProfile?.primary_goal);
      console.log('  - Final primaryGoal:', primaryGoal);
      console.log('  - Goal weights:', JSON.stringify(finalGoalWeights, null, 2));
      console.log('  - Cultural background:', finalCulturalBackground);
      console.log('  - Cultural weight value:', finalGoalWeights?.cultural);
      
      try {
        console.log('🚀 ROUTES: Starting V2/V3 prompt generation...');
        // Import V2 prompt builder with weight-based intelligence
        const { buildWeightBasedIntelligentPrompt } = await import('./intelligentPromptBuilderV2');
        
        console.log('📦 ROUTES: Building advanced filters...');
        // Build advanced filters for V2 prompt builder
        const advancedFilters = {
          numDays,
          mealsPerDay,
          cookTime: maxCookTime, // Use value from request (UI)
          difficulty: maxDifficulty, // Use value from request (UI)
          primaryGoal,
          familySize: finalFamilySize,
          familyMembers: Array.isArray(userProfile?.members) ? userProfile.members : [],
          profileType: userProfile?.profile_type as 'individual' | 'family' || 'individual',
          dietaryRestrictions: finalDietaryRestrictions.join(', '),
          culturalBackground: finalCulturalBackground,
          userId: Number(userId), // Pass userId for cultural ranking engine
          culturalCuisineData: culturalCuisineData,
          availableIngredients,
          excludeIngredients,
          // Member targeting
          planTargets: planTargets,
          targetMemberNames: targetMemberNames,
          // Weight-based enhancements
          goalWeights: finalGoalWeights,
          heroIngredients,
          weightBasedEnhanced: true
        };
        
        console.log('🔨 ROUTES: Calling buildWeightBasedIntelligentPrompt...');
        // Generate prompt using V2 system (main goals + weight-based intelligence)
        prompt = await buildWeightBasedIntelligentPrompt(
          advancedFilters,
          finalGoalWeights,
          heroIngredients
        );
        
        console.log('✅ ROUTES: Received prompt from V2/V3 system');
        console.log('✅ Generated V2 weight-based prompt with main goal integration');
        console.log('Main goal:', primaryGoal);
        console.log('Goal weights:', finalGoalWeights);
        console.log('Hero ingredients:', heroIngredients);
        
      } catch (error) {
        console.error('V2 prompt builder failed, falling back to original weight-based prompt:', error);
        
        // Fallback to original weight-based prompt system
        const mealContext = {
          numDays,
          mealsPerDay,
          availableIngredients,
          excludeIngredients,
          familySize: finalFamilySize
        };

        prompt = (planner as any).buildWeightBasedPrompt(
          finalGoalWeights,
          heroIngredients,
          mealContext,
          finalDietaryRestrictions,
          finalFamilySize
        );
        
        console.log('⚠️ Using fallback weight-based prompt');
        console.log('Goal weights:', finalGoalWeights);
        console.log('Hero ingredients:', heroIngredients);
      }

      // Generate meal plan using OpenAI
      const openai = new (await import('openai')).OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: 'system',
            content: `You are an advanced meal planning expert with weight-based intelligence. You understand main goals (like "${primaryGoal}") and can apply weight-based priorities to refine decisions. ${!planTargets.includes("Everyone") ? `This meal plan is specifically designed for "${planTargets.join(', ')}" with their combined dietary restrictions and preferences.` : 'This meal plan is designed for the entire family with merged dietary restrictions.'} Generate exactly the requested number of days following the main goal guidance first, then using weights to resolve conflicts. Always return valid JSON with proper day structure.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 6000  // Increased from 4000 to allow for more detailed cultural integration
      });

      let mealPlan;
      try {
        mealPlan = JSON.parse(completion.choices[0].message.content || '{}');
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        throw new Error('Invalid response format from AI');
      }

      // Validate and enhance meal plan with cultural meal integration
      console.log('\n🎯 CULTURAL INTEGRATION CHECK:');
      console.log('  - Cultural weight:', finalGoalWeights.cultural);
      console.log('  - Cultural weight > 0.3?', finalGoalWeights.cultural > 0.3);
      console.log('  - Cultural background:', finalCulturalBackground);
      console.log('  - Has cultural background?', finalCulturalBackground.length > 0);
      console.log('  - Will integrate cultural meals?', finalGoalWeights.cultural > 0.3 && finalCulturalBackground.length > 0);
      
      if (finalGoalWeights.cultural > 0.3 && finalCulturalBackground.length > 0) {
        console.log('✅ Cultural integration conditions met! Using prompt-based cultural integration...');
        console.log(`   - Cultural weight: ${finalGoalWeights.cultural} (${Math.round(finalGoalWeights.cultural * 100)}% priority)`);
        console.log(`   - Cultural background: ${finalCulturalBackground.join(', ')}`);
        console.log('   - Cultural elements will be integrated through enhanced AI prompting');
      } else {
        console.log('❌ Cultural integration skipped - conditions not met');
        if (finalGoalWeights.cultural <= 0.3) {
          console.log('   Reason: Cultural weight too low (need > 0.3, have', finalGoalWeights.cultural, ')');
        }
        if (finalCulturalBackground.length === 0) {
          console.log('   Reason: No cultural background specified');
        }
      }

      // Add metadata about the V2 weight-based generation
      const finalMealPlan = {
        ...mealPlan,
        generation_metadata: {
          type: 'weight-based-v2',
          main_goal: primaryGoal,
          goal_weights: finalGoalWeights,
          hero_ingredients: heroIngredients,
          cultural_integration: finalGoalWeights.cultural > 0.3,
          advanced_prompt_used: true,
          prompt_builder_version: 'V2',
          generation_time_ms: Date.now() - startTime
        },
        debugInfo: {
          promptSystem: 'V3-Template',
          promptLength: prompt.length,
          isNewGeneration: true,
          timestamp: new Date().toISOString(),
          maxCookTime: maxCookTime,
          maxDifficulty: maxDifficulty
        }
      };

      // Add debug prompt only in development
      if (process.env.NODE_ENV === 'development') {
        (finalMealPlan as any).debugPrompt = prompt;
      }

      console.log(`✅ Generated weight-based meal plan in ${Date.now() - startTime}ms`);
      res.json(finalMealPlan);

    } catch (error) {
      console.error("Error generating weight-based meal plan:", error);
      res.status(500).json({ message: "Failed to generate weight-based meal plan" });
    }
  });

  // Cache statistics endpoint
  app.get("/api/cache/stats", (req, res) => {
    // Temporary mock stats while caching is disabled
    res.json({
      cacheSize: 0,
      hitRate: "0.0%",
      estimatedSavings: "$0.0000 per request"
    });
  });

  // Optimized shopping list endpoint
  app.post("/api/shopping-list/optimize", async (req, res) => {
    try {
      const { mealPlan, userPreferences } = req.body;

      if (!mealPlan) {
        return res.status(400).json({ message: "Meal plan data is required" });
      }

      const { createOptimizedShoppingList } = await import("./instacart");
      const optimizedData = await createOptimizedShoppingList(mealPlan, userPreferences);

      res.json(optimizedData);
    } catch (error: any) {
      console.error("Error creating optimized shopping list:", error);
      res.status(500).json({ message: `Failed to optimize shopping list: ${error.message}` });
    }
  });

  // Intelligent cooking time and difficulty calculation endpoint
  app.post("/api/recipes/calculate-timing", async (req, res) => {
    try {
      const { recipe, constraints } = req.body;

      if (!recipe || !recipe.title || !recipe.ingredients) {
        return res.status(400).json({ message: "Recipe with title and ingredients is required" });
      }

      const { calculateCookingTimeAndDifficulty, getEasyAlternatives } = await import("./cookingTimeCalculator");
      const { validateMealConstraints } = await import("./intelligentPromptBuilder");

      const calculation = calculateCookingTimeAndDifficulty(recipe);
      const alternatives = getEasyAlternatives(recipe);

      let validation = null;
      if (constraints) {
        validation = validateMealConstraints(
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
    } catch (error: any) {
      console.error("Error calculating cooking timing:", error);
      res.status(500).json({ message: `Failed to calculate timing: ${error.message}` });
    }
  });

  // Batch cooking time estimation for meal planning
  app.post("/api/recipes/batch-timing", async (req, res) => {
    try {
      const { recipes } = req.body;

      if (!recipes || !Array.isArray(recipes)) {
        return res.status(400).json({ message: "Array of recipes is required" });
      }

      const { estimateBatchCookingTime } = await import("./cookingTimeCalculator");
      const batchEstimate = estimateBatchCookingTime(recipes);

      res.json(batchEstimate);
    } catch (error: any) {
      console.error("Error calculating batch timing:", error);
      res.status(500).json({ message: `Failed to calculate batch timing: ${error.message}` });
    }
  });

  // Dietary-cultural conflict resolution endpoint
  app.post("/api/recipes/resolve-conflicts", async (req, res) => {
    try {
      const { mealRequest, dietaryRestrictions, culturalBackground } = req.body;

      if (!mealRequest) {
        return res.status(400).json({ message: "Meal request is required" });
      }

      const { resolveDietaryCulturalConflicts, hasQuickConflict, getIngredientSubstitutions } = await import("./dietaryCulturalConflictResolver");

      // Provide defaults for optional parameters
      const restrictions = dietaryRestrictions || [];
      const cultural = culturalBackground || [];

      const resolution = await resolveDietaryCulturalConflicts(
        mealRequest,
        restrictions,
        cultural
      );

      res.json({
        success: true,
        mealRequest,
        resolution,
        quickCheck: hasQuickConflict(mealRequest, restrictions)
      });
    } catch (error: any) {
      console.error("Error resolving dietary conflicts:", error);
      res.status(500).json({ 
        success: false,
        message: `Failed to resolve conflicts: ${error.message}` 
      });
    }
  });

  // Get ingredient substitutions endpoint
  app.post("/api/recipes/ingredient-substitutions", async (req, res) => {
    try {
      const { ingredient, dietaryRestriction } = req.body;

      if (!ingredient || !dietaryRestriction) {
        return res.status(400).json({ message: "Ingredient and dietary restriction are required" });
      }

      const { getIngredientSubstitutions } = await import("./dietaryCulturalConflictResolver");
      const substitutions = getIngredientSubstitutions(ingredient, dietaryRestriction);

      res.json({
        success: true,
        ingredient,
        dietaryRestriction,
        substitutions
      });
    } catch (error: any) {
      console.error("Error getting ingredient substitutions:", error);
      res.status(500).json({ 
        success: false,
        message: `Failed to get substitutions: ${error.message}` 
      });
    }
  });

  // Profile routes
  app.get("/api/profile", authenticateToken, async (req: AuthRequest, res) => {
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

  app.post("/api/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        console.error('Profile creation failed: User not authenticated');
        return res.status(401).json({ message: "User not authenticated" });
      }

      console.log('Creating profile for user:', userId);
      console.log('Request body:', req.body);

      // Validate required fields
      const { profile_name, primary_goal } = req.body;
      if (!profile_name?.trim()) {
        console.error('Profile creation failed: Missing profile name');
        return res.status(400).json({ message: "Profile name is required" });
      }

      if (!primary_goal) {
        console.error('Profile creation failed: Missing primary goal');
        return res.status(400).json({ message: "Primary goal is required" });
      }

      try {
        const profileData = insertProfileSchema.parse({
          user_id: Number(userId),
          ...req.body
        });

        console.log('Parsed profile data:', profileData);

        const profile = await storage.createProfile(profileData);
        console.log('Created profile:', profile);

        // PROACTIVE CULTURAL DATA CACHING: Auto-cache cultural data after profile creation
        if (profileData.cultural_background && Array.isArray(profileData.cultural_background) && profileData.cultural_background.length > 0) {
          try {
            console.log(`🚀 Auto-caching cultural data for new profile: [${profileData.cultural_background.join(', ')}]`);

            // Import and trigger cultural data caching asynchronously
            import('./cultureCacheManager').then(async ({ getCachedCulturalCuisine }) => {
              try {
                for (const culture of profileData.cultural_background || []) {
                  await getCachedCulturalCuisine(Number(userId), [culture]);
                  console.log(`   ✅ Cached cultural data for: ${culture}`);
                }
                console.log(`🎯 Auto-caching complete for user ${userId}`);
              } catch (cacheError) {
                console.warn('Auto-caching failed:', cacheError);
              }
            });
          } catch (error) {
            console.warn('Failed to trigger auto-caching:', error);
          }
        }

        res.json(profile);
      } catch (parseError) {
        console.error('Profile creation failed: Schema validation error:', parseError);
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

  app.put("/api/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const profile = await storage.updateProfile(Number(userId), req.body);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // CACHE INVALIDATION AND REFRESH: Clear old cache and refresh cultural data on profile update
      if (req.body.cultural_background) {
        try {
          console.log(`🔄 Profile cultural background updated for user ${userId}: [${req.body.cultural_background.join(', ')}]`);

          import('./cultureCacheManager').then(async ({ clearUserCache, getCachedCulturalCuisine }) => {
            try {
              // Clear existing cache for this user
              clearUserCache(Number(userId));
              console.log(`   🗑️ Cleared old cultural cache for user ${userId}`);

              // Refresh cache with new cultural background
              if (req.body.cultural_background && req.body.cultural_background.length > 0) {
                for (const culture of req.body.cultural_background) {
                  await getCachedCulturalCuisine(Number(userId), [culture]);
                  console.log(`   ✅ Refreshed cultural data for: ${culture}`);
                }
                console.log(`🎯 Cache refresh complete for user ${userId}`);
              }
            } catch (cacheError) {
              console.warn('Cache refresh failed:', cacheError);
            }
          });
        } catch (error) {
          console.warn('Failed to trigger cache refresh:', error);
        }
      }

      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Weight-based profile routes
  app.get("/api/profile/weight-based", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Try to get existing profile first
      const existingProfile = await storage.getProfile(Number(userId));
      
      if (existingProfile) {
        console.log('🔍 Processing existing profile for weight extraction:', {
          profile_name: existingProfile.profile_name,
          goals: existingProfile.goals,
          goalsType: typeof existingProfile.goals,
          goalsIsArray: Array.isArray(existingProfile.goals),
          goalsLength: existingProfile.goals?.length
        });

        // Extract stored goal weights - handle both object and array formats
        const storedGoalWeights: any = {
          cost: 0.5,
          health: 0.5,
          cultural: 0.5,
          variety: 0.5,
          time: 0.5
        };

        let parsedWeightsCount = 0;

        if (existingProfile.goals) {
          console.log('📋 Processing goals data:', existingProfile.goals, 'type:', typeof existingProfile.goals);
          
          // Handle object format (e.g., {"cost":0.8,"health":0.5,...})
          if (typeof existingProfile.goals === 'object' && !Array.isArray(existingProfile.goals)) {
            console.log('📋 Processing goals as object format');
            
            Object.entries(existingProfile.goals).forEach(([key, value]) => {
              console.log(`🔍 Processing goal object entry: key="${key}", value="${value}"`);
              
              if (typeof value === 'number' && value >= 0 && value <= 1) {
                storedGoalWeights[key] = value;
                parsedWeightsCount++;
                console.log(`   ✅ Set ${key} = ${value}`);
              } else {
                console.log(`   ❌ Invalid weight value: ${value}`);
              }
            });
          }
          // Handle array format (e.g., ["cost:0.8", "health:0.5", ...])
          else if (Array.isArray(existingProfile.goals)) {
            console.log('📋 Processing goals as array format');
            
            existingProfile.goals.forEach((goal: string, index: number) => {
              console.log(`🔍 Processing goal ${index}:`, goal, typeof goal);
              
              if (typeof goal === 'string' && goal.includes(':')) {
                const [key, value] = goal.split(':');
                console.log(`   Split result: key="${key}", value="${value}"`);
                
                if (key && value) {
                  const weight = parseFloat(value);
                  console.log(`   Parsed weight: ${weight}, isNaN: ${isNaN(weight)}`);
                  
                  if (!isNaN(weight) && weight >= 0 && weight <= 1) {
                    storedGoalWeights[key] = weight;
                    parsedWeightsCount++;
                    console.log(`   ✅ Set ${key} = ${weight}`);
                  } else {
                    console.log(`   ❌ Invalid weight value: ${weight}`);
                  }
                } else {
                  console.log(`   ❌ Missing key or value after split`);
                }
              } else {
                console.log(`   ❌ Goal is not string or doesn't contain ":"`);
              }
            });
          } else {
            console.log('❌ Goals is neither object nor array');
          }
        } else {
          console.log('❌ Goals is null/undefined');
        }

        console.log('📊 Final extracted stored goal weights:', storedGoalWeights);
        console.log(`📊 Successfully parsed ${parsedWeightsCount} weights from ${existingProfile.goals?.length || 0} goals`);
        
        // Convert existing profile to weight-based format
        const weightBasedProfile = {
          profileName: existingProfile.profile_name || 'My Profile',
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

  app.post("/api/profile/weight-based", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { profileName, familySize, goalWeights, dietaryRestrictions, culturalBackground, questionnaire_answers, questionnaire_selections } = req.body;

      console.log('💾 Creating weight-based profile with data:', {
        profileName,
        familySize,
        goalWeights,
        dietaryRestrictions,
        culturalBackground,
        questionnaire_answers,
        questionnaire_selections
      });

      // Convert goalWeights to goals array format
      const goalsArray = Object.entries(goalWeights).map(([goal, weight]) => `${goal}:${weight}`);
      console.log('💾 Converted goalWeights to goals array for creation:', goalsArray);

      // Create profile using existing schema structure
      const profileData = {
        user_id: Number(userId),
        profile_name: profileName,
        primary_goal: 'Save Money', // Default to Save Money for weight-based profiles
        family_size: familySize,
        members: [], // Empty for weight-based approach
        profile_type: 'individual' as const,
        preferences: dietaryRestrictions,
        goals: goalsArray,
        cultural_background: culturalBackground
      };

      console.log('💾 Final profileData being created:', profileData);

      const profile = await storage.createProfile(profileData);
      
      console.log('💾 Profile created successfully:', {
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

      console.log('💾 Returning creation response to client:', response);
      res.json(response);
    } catch (error) {
      console.error("Error creating weight-based profile:", error);
      res.status(500).json({ message: "Failed to create weight-based profile" });
    }
  });

  app.put("/api/profile/weight-based", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { profileName, familySize, goalWeights, dietaryRestrictions, culturalBackground, questionnaire_answers, questionnaire_selections } = req.body;

      console.log('💾 Saving weight-based profile with data:', {
        profileName,
        familySize,
        goalWeights,
        dietaryRestrictions,
        culturalBackground,
        questionnaire_answers,
        questionnaire_selections
      });

      // Convert goalWeights to goals array format
      const goalsArray = Object.entries(goalWeights).map(([goal, weight]) => `${goal}:${weight}`);
      console.log('💾 Converted goalWeights to goals array:', goalsArray);

      // Update profile using existing schema structure
      const profileData = {
        profile_name: profileName,
        primary_goal: 'Save Money', // Default to Save Money for weight-based profiles
        family_size: familySize,
        members: [],
        profile_type: 'individual' as const,
        preferences: dietaryRestrictions,
        goals: goalsArray,
        cultural_background: culturalBackground
      };

      console.log('💾 Final profileData being saved:', profileData);

      const profile = await storage.updateProfile(Number(userId), profileData);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      console.log('💾 Profile saved successfully:', {
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

      console.log('💾 Returning response to client:', response);
      res.json(response);
    } catch (error) {
      console.error("Error updating weight-based profile:", error);
      res.status(500).json({ message: "Failed to update weight-based profile" });
    }
  });

  // NLP Culture Parser route
  app.post("/api/culture-parser", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: "Text input is required" });
      }

      // Import the NLP culture parser
      const { nlpCultureParser } = await import('./nlpCultureParser');
      const result = await nlpCultureParser(text);

      res.json(result);
    } catch (error) {
      console.error("Error in culture parser:", error);
      res.status(500).json({ message: "Failed to parse cultural input" });
    }
  });

  // Cultural cuisine data route
  app.get("/api/cultural-cuisine/:cuisine", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      const { cuisine } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!cuisine) {
        return res.status(400).json({ message: "Cuisine parameter is required" });
      }

      const { getCulturalCuisineData } = await import('./cultureCacheManager');
      const cuisineData = await getCulturalCuisineData(Number(userId), cuisine);

      if (!cuisineData) {
        return res.status(404).json({ message: "Cuisine data not found" });
      }

      res.json(cuisineData);
    } catch (error) {
      console.error("Error fetching cultural cuisine data:", error);
      res.status(500).json({ message: "Failed to fetch cuisine data" });
    }
  });

  // Trigger cultural cuisine caching for user's profile
  app.post("/api/cache-cultural-cuisines", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Get user's cultural background
      const profile = await storage.getProfile(Number(userId));
      if (!profile || !profile.cultural_background) {
        return res.status(404).json({ message: "No cultural preferences found in profile" });
      }

      const culturalBackground = Array.isArray(profile.cultural_background) 
        ? profile.cultural_background 
        : [];

      if (culturalBackground.length === 0) {
        return res.json({ message: "No cultural cuisines to cache", cached: [] });
      }

      const { getCulturalCuisineData } = await import('./cultureCacheManager');
      const cachePromises = culturalBackground.map(cuisine => 
        getCulturalCuisineData(Number(userId), cuisine)
      );

      const results = await Promise.allSettled(cachePromises);
      const cached = culturalBackground.filter((_, index) => 
        results[index].status === 'fulfilled' && results[index].value !== null
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

  // Get cache statistics
  app.get("/api/culture-cache-stats", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { getCacheStats } = await import('./cultureCacheManager');
      const stats = getCacheStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting cache stats:", error);
      res.status(500).json({ message: "Failed to get cache statistics" });
    }
  });

  // Clear all cultural cache data endpoint  
  app.post("/api/clear-cultural-cache", async (req, res) => {
    try {
      const { clearAllCache } = await import('./cultureCacheManager');
      clearAllCache();

      res.json({
        success: true,
        message: "All cultural cache data has been cleared. Fresh research will be performed for all cuisines."
      });
    } catch (error) {
      console.error('🚨 Error clearing cultural cache:', error);
      res.status(500).json({
        error: 'Failed to clear cache',
        message: 'Unable to clear cultural cache data'
      });
    }
  });

  // Save cultural meals to user profile
  app.post("/api/save-cultural-meals", async (req, res) => {
    const { saveCulturalMeals } = await import('./routes/save-cultural-meals');
    return saveCulturalMeals(req, res);
  });

  // Get user's saved cultural meals
  app.get("/api/saved-cultural-meals", async (req, res) => {
    try {
      const userId = 9; // Default user ID for testing
      const { userSavedCulturalMeals } = await import('../shared/schema');
      const { eq } = await import('drizzle-orm');

      // Mock response for saved cultural meals
      const savedMeals: any[] = [];

      res.json({
        success: true,
        saved_meals: savedMeals
      });

    } catch (error) {
      console.error('❌ Error fetching saved cultural meals:', error);
      res.status(500).json({
        error: 'Failed to fetch saved meals',
        message: 'An internal server error occurred'
      });
    }
  });

  // Cultural cuisine research endpoint
  app.post("/api/cultural-cuisine-research", async (req, res) => {
    try {
      const { cuisine } = req.body;

      if (!cuisine || typeof cuisine !== 'string') {
        return res.status(400).json({
          error: 'Missing or invalid cuisine parameter',
          message: 'Please provide a valid cuisine name to research'
        });
      }

      if (cuisine.trim().length === 0) {
        return res.status(400).json({
          error: 'Empty cuisine name',
          message: 'Cuisine name cannot be empty'
        });
      }

      const trimmedCuisine = cuisine.trim();
      console.log(`🔍 Research request for cuisine: ${trimmedCuisine}`);

      // Use the existing Perplexity integration to fetch detailed cuisine data
      // Using a temporary userId (0) since this is for research only - check cache first
      const { getCulturalCuisineData } = await import('./cultureCacheManager');
      const cuisineData = await getCulturalCuisineData(0, trimmedCuisine);

      if (!cuisineData) {
        console.error(`❌ Failed to fetch research data for cuisine: ${trimmedCuisine}`);
        return res.status(404).json({
          error: 'Research failed',
          message: `Unable to find detailed information for ${trimmedCuisine} cuisine. Please try again or check the cuisine name.`
        });
      }

      console.log(`✅ Successfully researched ${trimmedCuisine} cuisine`);

      // Return the detailed cuisine research data
      res.json({
        cuisine: trimmedCuisine,
        culture: (cuisineData as any).culture || trimmedCuisine,
        meals: cuisineData.meals || [],
        summary: cuisineData.summary || {
          common_healthy_ingredients: [],
          common_cooking_techniques: []
        },
        research_timestamp: new Date().toISOString(),
        data_source: 'Perplexity AI'
      });

    } catch (error) {
      console.error('🚨 Error in cultural cuisine research endpoint:', error);

      // Handle different types of errors
      if (error instanceof Error) {
        if (error.message.includes('rate limit') || error.message.includes('Rate limited')) {
          return res.status(429).json({
            error: 'Rate limit exceeded',
            message: 'Too many research requests. Please wait a moment before trying again.',
            retry_after: 60
          });
        }

        if (error.message.includes('API key') || error.message.includes('Authorization')) {
          return res.status(503).json({
            error: 'Service configuration error',
            message: 'Research service is temporarily unavailable. Please try again later.'
          });
        }
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred while researching the cuisine. Please try again.'
      });
    }
  });

  // Perplexity Search Cache Endpoints
  app.get("/api/perplexity-cache", async (req, res) => {
    try {
      const { perplexityLogger } = await import('./perplexitySearchLogger');
      const searchHistory = await perplexityLogger.getSearchHistory(100);
      res.json(searchHistory);
    } catch (error) {
      console.error('Failed to get Perplexity cache:', error);
      res.status(500).json({ error: 'Failed to load search history' });
    }
  });

  app.delete("/api/perplexity-cache", async (req, res) => {
    try {
      const { perplexityLogger } = await import('./perplexitySearchLogger');
      await perplexityLogger.clearSearchHistory();
      res.json({ success: true, message: 'Search history cleared' });
    } catch (error) {
      console.error('Failed to clear Perplexity cache:', error);
      res.status(500).json({ error: 'Failed to clear search history' });
    }
  });

  app.get("/api/perplexity-cache/stats", async (req, res) => {
    try {
      const { perplexityLogger } = await import('./perplexitySearchLogger');
      const stats = await perplexityLogger.getSearchStats();
      res.json(stats);
    } catch (error) {
      console.error('Failed to get Perplexity cache stats:', error);
      res.status(500).json({ error: 'Failed to load cache statistics' });
    }
  });

  /**
   * Validate and round difficulties to nearest 0.5 within max constraint
   */
  function validateAndRoundDifficulties(mealPlan: any, maxDifficulty: number) {
    Object.keys(mealPlan).forEach(day => {
      const dayMeals = mealPlan[day];
      if (typeof dayMeals === 'object') {
        Object.keys(dayMeals).forEach(mealType => {
          const meal = dayMeals[mealType];
          if (meal && typeof meal.difficulty === 'number') {
            // Round to nearest 0.5 increment
            const roundedDifficulty = Math.round(meal.difficulty * 2) / 2;

            // Ensure it doesn't exceed the maximum
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

  // Achievement routes
  app.get("/api/achievements", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      let achievements = await storage.getUserAchievements(userId);
      
      // Initialize achievements if none exist
      if (achievements.length === 0) {
        achievements = await storage.initializeUserAchievements(userId);
      }

      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.post("/api/achievements/trigger", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { achievementId, progress } = req.body;

      if (!achievementId) {
        return res.status(400).json({ message: "Achievement ID is required" });
      }

      // Get current achievement
      const achievement = await storage.getUserAchievement(userId, achievementId);
      if (!achievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }

      const newProgress = progress || (achievement.progress || 0) + 1;
      const isUnlocked = newProgress >= achievement.max_progress;

      const updatedAchievement = await storage.updateUserAchievement(userId, achievementId, {
        progress: newProgress,
        is_unlocked: isUnlocked,
        unlocked_date: isUnlocked ? new Date() : undefined
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

  app.get("/api/achievements/:achievementId", authenticateToken, async (req: AuthRequest, res) => {
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

  // Enhanced Cultural Ranking + Llama Meal Plan Generation
  app.post("/api/enhanced-meal-plan", authenticateToken, async (req: AuthRequest, res) => {
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

      console.log(`🚀 Enhanced meal plan request: ${numDays} days, ${mealsPerDay} meals/day`);

      // Get user's profile data
      const profile = userProfile || await storage.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // Import enhanced meal plan generator
      const { enhancedMealPlanGenerator, EnhancedMealPlanGenerator } = await import('./enhancedMealPlanGenerator');
      
      // Build cultural profile from user data
      const culturalProfile = EnhancedMealPlanGenerator.buildUserProfile(profile, goalWeights);
      
      console.log('🎯 Cultural profile:', {
        culturalPrefs: Object.keys(culturalProfile.cultural_preferences),
        weights: culturalProfile.priority_weights,
        restrictions: culturalProfile.dietary_restrictions
      });

      // Generate enhanced meal plan
      const mealPlan = await enhancedMealPlanGenerator.generateMealPlan({
        userId: Number(userId),
        numDays,
        mealsPerDay,
        userProfile: culturalProfile,
        servingSize: profile.family_size || 1
      });

      console.log(`✅ Generated enhanced meal plan in ${mealPlan.generation_metadata.processing_time_ms}ms`);

      res.json(mealPlan);

    } catch (error) {
      console.error("❌ Enhanced meal plan generation failed:", error);
      res.status(500).json({ 
        message: "Failed to generate enhanced meal plan",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Simple test endpoint to verify API is working
  app.get("/api/test-simple", (req, res) => {
    res.json({ message: "API is working", timestamp: new Date().toISOString() });
  });



  // Intelligent Meal Base Selection Endpoint
  app.post("/api/intelligent-meal-selection", async (req, res) => {
    try {
      console.log('🤖 Intelligent meal selection endpoint called');
      const { userId = 1, userProfile, selectedMeal, totalMeals = 9 } = req.body;

      if (!userProfile) {
        return res.status(400).json({ error: 'User profile is required' });
      }

      // Import the intelligent meal base selector
      const { intelligentMealBaseSelector } = await import('./intelligentMealBaseSelector.js');

      if (selectedMeal) {
        // User selected a specific base meal - generate plan around it
        console.log(`🎯 Generating meal plan around selected base: ${selectedMeal.meal.name}`);
        
        // Create base meal selection object
        const baseMealSelection = {
          baseMeal: selectedMeal.meal,
          similarity_score: selectedMeal.total_score,
          usage_rationale: selectedMeal.ranking_explanation || 'Selected by user as preferred base meal',
          weight_alignment: selectedMeal.component_scores
        };

        const mealPlan = await intelligentMealBaseSelector.generateMealPlanWithBase(
          userId,
          userProfile,
          baseMealSelection,
          totalMeals
        );

        console.log(`✅ Generated meal plan with ${mealPlan.complementaryMeals.length + mealPlan.variety_boost_meals.length + 1} meals`);

        res.json({
          success: true,
          mealPlan,
          processingTime: Date.now()
        });

      } else {
        // Auto-select optimal base meal using questionnaire weights
        console.log('🔍 Auto-selecting optimal base meal from user preferences');
        
        const cultures = Object.keys(userProfile.cultural_preferences);
        const baseMealSelection = await intelligentMealBaseSelector.findOptimalBaseMeal(
          userId,
          userProfile,
          cultures
        );

        if (!baseMealSelection) {
          return res.status(404).json({ 
            error: 'No suitable base meal found for your preferences',
            suggestion: 'Try adjusting your cultural preferences or dietary restrictions'
          });
        }

        const mealPlan = await intelligentMealBaseSelector.generateMealPlanWithBase(
          userId,
          userProfile,
          baseMealSelection,
          totalMeals
        );

        console.log(`✅ Auto-generated meal plan with optimal base: ${baseMealSelection.baseMeal.name}`);

        res.json({
          success: true,
          mealPlan,
          autoSelectedBase: true,
          processingTime: Date.now()
        });
      }

    } catch (error) {
      console.error('❌ Error in intelligent meal selection:', error);
      res.status(500).json({ 
        error: 'Internal server error during intelligent meal selection',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
/**
 * Enhanced Dynamic Prompt Builder V2 for Healthy Mama
 * Integrates with family profiles, individual goals, and WEIGHT-BASED INTELLIGENCE
 * Enhanced with intelligent recipe analysis system for improved time accuracy
 * ADDS: Weight-based priority system integration while preserving all V1 features
 */

import { calculateCookingTimeAndDifficulty, getEasyAlternatives } from "./cookingTimeCalculator";
import { EnhancedRecipeGenerationService } from "./enhancedRecipeGenerationService";
import { resolveDietaryCulturalConflicts, hasQuickConflict, type ConflictResolution } from "./dietaryCulturalConflictResolver";
import { PromptTemplateEngine, PromptTemplateData, determineNutritionGoal } from "./promptTemplateEngine";

interface MealPlanFilters {
  // Basic filters
  numDays: number;
  mealsPerDay: number;
  cookTime: number;
  difficulty: number;
  nutritionGoal?: string;
  dietaryRestrictions?: string;
  availableIngredients?: string;
  excludeIngredients?: string;
  
  // Enhanced profile-based filters
  primaryGoal?: string; // 'Save Money', 'Eat Healthier', 'Gain Muscle', 'Lose Weight', etc.
  familySize?: number;
  familyMembers?: FamilyMember[];
  profileType?: 'individual' | 'family';
  profileName?: string;
  userId?: number;
  
  // Cultural cuisine integration
  culturalCuisineData?: any; // Cached cultural cuisine data from Perplexity
  culturalBackground?: string[];
  
  // Advanced options
  availableIngredientUsagePercent?: number;
  encourageOverlap?: boolean;
  budgetConstraints?: 'low' | 'medium' | 'high';
  prepTimePreference?: 'minimal' | 'moderate' | 'enjoys_cooking';
  varietyPreference?: 'consistent' | 'moderate' | 'high_variety';

  // V2 ENHANCEMENT: Weight-based priority system
  goalWeights?: GoalWeights;
  heroIngredients?: string[];
  weightBasedEnhanced?: boolean;
}

interface FamilyMember {
  name: string;
  ageGroup: 'Child' | 'Teen' | 'Adult' | 'Senior';
  preferences: string[];
  goals: string[];
  role?: string;
}

// V2 ADDITION: Goal weights interface
interface GoalWeights {
  cost: number;      // 0.0 - 1.0
  health: number;    // 0.0 - 1.0
  cultural: number;  // 0.0 - 1.0
  variety: number;   // 0.0 - 1.0
  time: number;      // 0.0 - 1.0
}

/**
 * V3 TEMPLATE-BASED: Dynamic prompt builder using template engine
 * This is the new recommended approach for full dynamic prompt generation
 */
export async function buildTemplateBasedPrompt(
  filters: MealPlanFilters,
  goalWeights: GoalWeights,
  heroIngredients: string[] = []
): Promise<string> {
  console.log('🚀 Using Template-Based Prompt Builder V3');
  console.log('📍 TEMPLATE SYSTEM ACTIVATED - This should replace old prompt system');
  console.log('📍 Input filters:', {
    numDays: filters.numDays,
    mealsPerDay: filters.mealsPerDay,
    cookTime: filters.cookTime,
    difficulty: filters.difficulty,
    primaryGoal: filters.primaryGoal,
    culturalBackground: filters.culturalBackground
  });
  
  const templateEngine = new PromptTemplateEngine();
  
  // Try to get ranked meals if cultural background is present
  let rankedMeals = undefined;
  if (filters.culturalBackground && filters.culturalBackground.length > 0 && filters.userId) {
    try {
      const { culturalMealRankingEngine } = await import('./culturalMealRankingEngine.js');
      
      // Build user profile for ranking
      const culturalPreferences: { [cuisine: string]: number } = {};
      filters.culturalBackground.forEach(culture => {
        culturalPreferences[culture] = 1.0;
      });
      
      const userProfile = {
        cultural_preferences: culturalPreferences,
        priority_weights: goalWeights,
        dietary_restrictions: filters.dietaryRestrictions?.split(',').map(r => r.trim()).filter(Boolean) || [],
        preferences: []
      };
      
      console.log('  🔍 Getting ranked meals with template engine');
      rankedMeals = await culturalMealRankingEngine.getRankedMeals(
        filters.userId,
        userProfile,
        10, // top 10 meals
        0.7 // relevance threshold
      );
      
      console.log(`  ✅ Got ${rankedMeals.length} ranked meals for template`);
    } catch (error) {
      console.error('  ❌ Failed to get ranked meals:', error.message);
    }
  }
  
  // Build template data
  const templateData: PromptTemplateData = {
    mealPlanDays: filters.numDays,
    mealsPerDay: filters.mealsPerDay,
    maxCookTime: filters.cookTime,
    maxDifficulty: filters.difficulty,
    primaryGoal: filters.primaryGoal || 'Save Money',
    nutritionGoal: determineNutritionGoal(filters.primaryGoal || 'Save Money'),
    goalWeights: goalWeights,
    culturalBackground: filters.culturalBackground || [],
    rankedMeals: rankedMeals,
    dietaryRestrictions: filters.dietaryRestrictions?.split(',').map(r => r.trim()).filter(Boolean) || [],
    userId: filters.userId || 1,
    profileName: filters.profileName || 'User',
    familySize: filters.familySize || 1
  };
  
  const prompt = templateEngine.generatePrompt(templateData);
  
  console.log('✅ Generated template-based prompt');
  console.log('📝 Prompt length:', prompt.length, 'characters');
  
  return prompt;
}

/**
 * V2 ENHANCED: Weight-based intelligent prompt builder
 * Processes main goals first, then applies weight-based enhancements
 */
export async function buildWeightBasedIntelligentPrompt(
  filters: MealPlanFilters,
  goalWeights: GoalWeights,
  heroIngredients: string[] = []
): Promise<string> {
  console.log('🚀 Using Prompt Builder V2 with weight-based intelligence');
  console.log('📊 PROMPT DEBUG - Input parameters:');
  console.log('  - Goal weights:', JSON.stringify(goalWeights, null, 2));
  console.log('  - Cultural background:', filters.culturalBackground);
  console.log('  - Hero ingredients:', heroIngredients);
  console.log('  - Dietary restrictions:', filters.dietaryRestrictions);
  console.log('  - Cook time:', filters.cookTime);
  console.log('  - Difficulty:', filters.difficulty);
  
  // Use the new template-based system
  try {
    console.log('🔄 Calling buildTemplateBasedPrompt (V3)...');
    const prompt = await buildTemplateBasedPrompt(filters, goalWeights, heroIngredients);
    
    // Log the complete final prompt for debugging
    console.log('\n🎯 PROMPT DEBUG - COMPLETE FINAL PROMPT (FROM V3 TEMPLATE):');
    console.log('=====================================');
    console.log(prompt);
    console.log('=====================================\n');
    
    return prompt;
  } catch (error) {
    console.error('❌ Template-based prompt builder failed:', error);
    console.error('Stack trace:', error.stack);
    throw error; // Re-throw to trigger fallback in routes.ts
  }
}

/**
 * V2 ENHANCED: Original buildIntelligentPrompt with weight-based awareness
 * @deprecated Use buildTemplateBasedPrompt instead
 */
async function buildIntelligentPrompt_OLD(filters: MealPlanFilters): Promise<string> {
  console.log('⚠️ WARNING: Old buildIntelligentPrompt_OLD is being called! This should not happen!');
  console.log('Stack trace:', new Error().stack);
  let prompt = `Create exactly a ${filters.numDays}-day meal plan with ${filters.mealsPerDay} meals per day`;

  // Add family context if available
  if (filters.profileType === 'family' && filters.familySize) {
    prompt += ` for a family of ${filters.familySize}`;
    
    if (filters.familyMembers && filters.familyMembers.length > 0) {
      const childrenCount = filters.familyMembers.filter(m => m.ageGroup === 'Child').length;
      const adultCount = filters.familyMembers.filter(m => m.ageGroup === 'Adult').length;
      
      if (childrenCount > 0) {
        prompt += ` (${adultCount} adults, ${childrenCount} children)`;
      }
    }
  }

  // Apply primary goal logic (this is the key main goal processing)
  if (filters.primaryGoal) {
    const goalAdjustments = applyPrimaryGoalLogic(filters.primaryGoal, filters);
    prompt += goalAdjustments.prompt;
    
    // Update filters based on primary goal
    Object.assign(filters, goalAdjustments.adjustedFilters);
  }

  // V2 ENHANCEMENT: Add weight-based context if available
  if (filters.weightBasedEnhanced && filters.goalWeights) {
    prompt += `\n\n🎯 WEIGHT-BASED PRIORITY SYSTEM ACTIVE:`;
    prompt += `\nThis plan will balance objectives using priority weights when conflicts arise.`;
    prompt += `\nMain goal guidance takes precedence, weights refine decisions.`;
  }

  // Build constraints section with intelligent timing guidance
  prompt += `\n\nREQUIREMENTS:`;
  prompt += `\n- Max cook time: ${filters.cookTime} minutes (including prep + cook time)`;
  prompt += `\n- Difficulty level: MAXIMUM ${filters.difficulty}/5 (use 0.5 increments: 1, 1.5, 2, 2.5, 3, etc.)`;
  prompt += `\n- CRITICAL: ALL recipes must have difficulty <= ${filters.difficulty}`;
  prompt += `\n- Use precise difficulty ratings in 0.5 increments for accurate complexity assessment`;
  
  // Add intelligent timing guidance based on preferences
  if (filters.prepTimePreference === 'minimal') {
    prompt += `\n- Prioritize minimal prep time recipes (under 10 minutes prep)`;
    prompt += `\n- Focus on one-pot or sheet pan meals when possible`;
  } else if (filters.prepTimePreference === 'enjoys_cooking') {
    prompt += `\n- Include recipes with more involved preparation when appropriate`;
    prompt += `\n- Can include multi-step cooking processes`;
  }
  
  // Add difficulty-appropriate cooking guidance
  prompt += getDifficultyAdjustedPromptSuffix(filters.difficulty);
  
  if (filters.nutritionGoal) {
    prompt += `\n- Nutrition goal: ${filters.nutritionGoal}`;
  }

  // Family-specific dietary needs
  if (filters.familyMembers && filters.familyMembers.length > 0) {
    const allPreferences = filters.familyMembers.flatMap(m => m.preferences);
    const uniquePreferences = [...new Set(allPreferences)];
    
    if (uniquePreferences.length > 0) {
      prompt += `\n- Family dietary preferences: ${uniquePreferences.join(', ')}`;
    }

    // Child-friendly requirements
    const hasChildren = filters.familyMembers.some(m => m.ageGroup === 'Child');
    if (hasChildren) {
      prompt += `\n- Include child-friendly options that are appealing to kids`;
      prompt += `\n- Avoid overly spicy or complex flavors for children`;
    }
  }

  if (filters.dietaryRestrictions) {
    prompt += `\n- Dietary restrictions: ${filters.dietaryRestrictions}`;
  }

  // Ingredient handling with intelligence
  if (filters.availableIngredients) {
    const usagePercent = filters.availableIngredientUsagePercent || 
                        (filters.primaryGoal === 'Save Money' ? 80 : 50);
    
    prompt += `\n- Use these available ingredients in at least ${usagePercent}% of meals: ${filters.availableIngredients}`;
    prompt += `\n- You may suggest additional ingredients for variety and nutritional completeness`;
  }

  if (filters.excludeIngredients) {
    prompt += `\n- Completely avoid these ingredients: ${filters.excludeIngredients}`;
  }

  // Cost optimization based on primary goal
  if (filters.encourageOverlap) {
    prompt += `\n- IMPORTANT: Maximize ingredient reuse across meals to minimize shopping costs`;
    prompt += `\n- Aim for 3+ shared ingredients between different meals`;
    prompt += `\n- Suggest bulk buying opportunities when possible`;
  }

  // Cultural cuisine integration from Perplexity API
  console.log('\n🌍 PROMPT DEBUG - Cultural Integration Check:');
  console.log('  - Cultural cuisine data available:', !!filters.culturalCuisineData);
  console.log('  - Cultural background:', filters.culturalBackground);
  console.log('  - Goal weights available:', !!filters.goalWeights);
  console.log('  - Cultural weight value:', filters.goalWeights?.cultural);
  
  // WEIGHT-BASED CULTURAL RANKING INTEGRATION
  if (filters.culturalCuisineData && filters.culturalBackground && filters.culturalBackground.length > 0 && filters.goalWeights) {
    console.log('  ✅ Adding WEIGHT-BASED CULTURAL RANKING section');
    prompt += `\n\n🌍 CULTURAL CUISINE INTEGRATION:`;
    prompt += `\n- Include authentic dishes from user's cultural background: ${filters.culturalBackground.join(', ')}`;
    
    try {
      // Import and use the cultural meal ranking engine
      const { culturalMealRankingEngine } = await import('./culturalMealRankingEngine.js');
      
      // Build UserCulturalProfile from weight-based data
      const culturalPreferences: { [cuisine: string]: number } = {};
      filters.culturalBackground.forEach(culture => {
        culturalPreferences[culture] = 1.0; // Strong preference for user's cultural background
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
      
      console.log('  🔍 Getting ranked meals with full weight profile:', userCulturalProfile.priority_weights);
      
      // Get top-ranked meals based on ALL weights combined
      const rankedMeals = await culturalMealRankingEngine.getRankedMeals(
        filters.userId || 1, // Use provided userId or fallback
        userCulturalProfile,
        8, // Get top 8 meals for selection
        0.6 // Relevance threshold
      );
      
      console.log(`  📊 Got ${rankedMeals.length} weight-ranked cultural meals`);
      
      if (rankedMeals.length > 0) {
        // Add top-ranked meals with their scoring details
        const topMeals = rankedMeals.slice(0, 5); // Top 5 meals
        const mealNames = topMeals.map(meal => meal.meal.name);
        const mealIngredients = [...new Set(topMeals.flatMap(meal => meal.meal.ingredients))].slice(0, 8);
        const mealTechniques = [...new Set(topMeals.flatMap(meal => meal.meal.cooking_techniques))].slice(0, 5);
        
        prompt += `\n- TOP-RANKED ${filters.culturalBackground[0].toUpperCase()} MEALS (based on your complete weight profile):`;
        prompt += `\n  ${mealNames.join(', ')}`;
        
        if (mealIngredients.length > 0) {
          prompt += `\n- Key ingredients from top-ranked meals: ${mealIngredients.join(', ')}`;
        }
        
        if (mealTechniques.length > 0) {
          prompt += `\n- Cooking techniques from top-ranked meals: ${mealTechniques.join(', ')}`;
        }
        
        // Add scoring explanation
        const avgCulturalScore = topMeals.reduce((sum, meal) => sum + meal.component_scores.cultural_score, 0) / topMeals.length;
        const avgCostScore = topMeals.reduce((sum, meal) => sum + meal.component_scores.cost_score, 0) / topMeals.length;
        const avgHealthScore = topMeals.reduce((sum, meal) => sum + meal.component_scores.health_score, 0) / topMeals.length;
        const avgTimeScore = topMeals.reduce((sum, meal) => sum + meal.component_scores.time_score, 0) / topMeals.length;
        
        prompt += `\n- These meals rank highest based on best alignment with your complete profile across all weighted factors`;
        prompt += `\n- Average scores: Cultural ${Math.round(avgCulturalScore * 100)}%, Cost ${Math.round(avgCostScore * 100)}%, Health ${Math.round(avgHealthScore * 100)}%, Time ${Math.round(avgTimeScore * 100)}%`;
        
        console.log('  ✅ Added weight-based ranked meal data to prompt');
      } else {
        console.log('  ⚠️ No ranked meals found, using fallback cultural data');
        // Fallback to basic cultural data processing
        prompt += addBasicCulturalDataFallback(filters);
      }
      
    } catch (error) {
      console.log('  ❌ Cultural ranking engine failed, using fallback:', error.message);
      // Fallback to basic cultural data processing
      prompt += addBasicCulturalDataFallback(filters);
    }
    
    // Use cultural weight as intensity/priority, not percentage
    const culturalWeight = filters.goalWeights?.cultural || 0.5;
    const culturalIntensity = Math.round(culturalWeight * 100);
    
    if (culturalWeight >= 0.7) {
      prompt += `\n- VERY HIGH CULTURAL PRIORITY (${culturalIntensity}%): Strongly emphasize authentic cultural flavors, ingredients, and techniques in most meals`;
      prompt += `\n- Weave cultural elements into regular meal types rather than creating separate "cultural meals"`;
      prompt += `\n- Use cultural spices, cooking methods, and ingredient combinations as primary choices`;
    } else if (culturalWeight >= 0.5) {
      prompt += `\n- HIGH CULTURAL PRIORITY (${culturalIntensity}%): Include cultural flavors and techniques when possible`;
      prompt += `\n- Blend cultural ingredients with familiar meal formats`;
      prompt += `\n- Use cultural elements as flavor enhancers and inspiration`;
    } else {
      prompt += `\n- MODERATE CULTURAL INFLUENCE (${culturalIntensity}%): Incorporate cultural elements subtly`;
      prompt += `\n- Use cultural spices and ingredients as accent flavors`;
    }
    
    prompt += `\n- Balance cultural authenticity with dietary restrictions and family preferences`;
    prompt += `\n- Cultural dishes listed above are suggestions - adapt them to meal contexts naturally`;
    
    // Add conflict resolution guidance
    prompt += await addConflictResolutionGuidance(filters);
  }

  // Cuisine and variety guidance
  if (filters.varietyPreference === 'high_variety') {
    prompt += `\n- Vary cuisines: Italian, Asian, Mexican, Mediterranean, American`;
    prompt += `\n- Include diverse cooking methods: grilling, baking, stir-frying, slow cooking`;
  } else if (filters.varietyPreference === 'consistent') {
    prompt += `\n- Keep cuisines consistent and familiar`;
    prompt += `\n- Focus on proven, reliable recipes`;
  }

  // Prep time considerations
  if (filters.prepTimePreference === 'minimal') {
    prompt += `\n- Prioritize quick prep and one-pot meals`;
    prompt += `\n- Include meal prep suggestions for efficiency`;
  } else if (filters.prepTimePreference === 'enjoys_cooking') {
    prompt += `\n- Include some complex, rewarding recipes`;
    prompt += `\n- Add cooking techniques that are educational and fun`;
  }

  // Generate explicit day structure
  const dayStructure = [];
  for (let i = 1; i <= filters.numDays; i++) {
    dayStructure.push(`"day_${i}"`);
  }

  prompt += `\n\nCRITICAL: Generate exactly ${filters.numDays} days: ${dayStructure.join(', ')}.`;

  // Add dynamic JSON format requirements based on mealsPerDay
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const selectedMealTypes = mealTypes.slice(0, filters.mealsPerDay);
  
  const mealExamples = selectedMealTypes.map((mealType, index) => {
    const calories = 350 + (index * 50);
    const protein = 20 + (index * 5);
    const carbs = 30 + (index * 5);
    const fat = 15 + (index * 3);
    return `      "${mealType}": {"title": "Recipe Name", "cook_time_minutes": ${15 + (index * 5)}, "difficulty": ${2 + index}, "ingredients": ["ingredient${index + 1}"], "instructions": ["step${index + 1}"], "nutrition": {"calories": ${calories}, "protein_g": ${protein}, "carbs_g": ${carbs}, "fat_g": ${fat}}}`;
  }).join(',\n');

  prompt += `\n\nRETURN FORMAT: Valid JSON with this exact structure:
{
  "meal_plan": {
    "day_1": {
${mealExamples}
    }
    // ... continue for all ${filters.numDays} days with ${filters.mealsPerDay} meals each
  },
  "shopping_list": ["consolidated ingredient list"],
  "prep_tips": ["helpful preparation suggestions"],
  "estimated_savings": ${filters.encourageOverlap ? 15.50 : 0}
}`;

  return prompt;
}

/**
 * V2 NEW: Apply weight-based enhancements to main goal prompt
 */
function applyWeightBasedEnhancements(
  basePrompt: string,
  goalWeights: GoalWeights,
  heroIngredients: string[],
  filters: MealPlanFilters
): string {
  console.log('\n🔧 WEIGHT ENHANCEMENT DEBUG - Applying selective weight-based enhancements');
  console.log('  - Primary goal from base prompt:', filters.primaryGoal);
  console.log('  - Cultural weight:', goalWeights.cultural);
  console.log('  - Cost weight:', goalWeights.cost);
  console.log('  - Health weight:', goalWeights.health);
  console.log('  - Variety weight:', goalWeights.variety);
  console.log('  - Time weight:', goalWeights.time);
  console.log('  - Cultural background in filters:', filters.culturalBackground);
  
  let enhancedPrompt = basePrompt;

  // Add weight-based priority section
  enhancedPrompt += `\n\n⚖️ WEIGHT-BASED PRIORITY REFINEMENTS:`;
  enhancedPrompt += `\nWhen the main goal guidance creates conflicts, use these weights to resolve decisions:`;

  // Priority order based on weights - Use 0.3 threshold to reduce system stress
  const sortedWeights = Object.entries(goalWeights)
    .sort(([,a], [,b]) => b - a)
    .filter(([,weight]) => weight >= 0.3);

  console.log('  - Sorted weights above 0.3 threshold:', sortedWeights);

  for (const [goal, weight] of sortedWeights) {
    const percentage = Math.round(weight * 100);
    
    if (weight >= 0.7) {
      enhancedPrompt += `\n- VERY HIGH PRIORITY (${percentage}%): ${getWeightDescription(goal)}`;
      console.log(`  - Added VERY HIGH priority for ${goal}: ${percentage}%`);
    } else if (weight >= 0.5) {
      enhancedPrompt += `\n- HIGH PRIORITY (${percentage}%): ${getWeightDescription(goal)}`;
      console.log(`  - Added HIGH priority for ${goal}: ${percentage}%`);
    } else if (weight >= 0.3) {
      enhancedPrompt += `\n- MODERATE PRIORITY (${percentage}%): ${getWeightDescription(goal)}`;
      console.log(`  - Added MODERATE priority for ${goal}: ${percentage}%`);
    }
  }

  // Hero ingredient integration
  if (heroIngredients.length > 0) {
    enhancedPrompt += `\n\n🎯 SMART INGREDIENT STRATEGY:`;
    enhancedPrompt += `\nIncorporate 2-3 of these cost-effective versatile ingredients: ${heroIngredients.join(', ')}`;
    enhancedPrompt += `\nThese ingredients maximize value and work across multiple cuisines.`;
  }

  // Weight-based objective overlap
  enhancedPrompt += `\n\n🎯 INTELLIGENT OBJECTIVE OVERLAP:`;
  enhancedPrompt += `\nEach meal should demonstrate smart overlap of objectives:`;
  enhancedPrompt += `\n- Satisfy the main goal (${filters.primaryGoal || 'balanced nutrition'}) as primary focus`;
  enhancedPrompt += `\n- Use weight priorities to refine choices when multiple options exist`;
  enhancedPrompt += `\n- Dietary restrictions remain 100% non-negotiable`;
  enhancedPrompt += `\n- Balance cost efficiency with nutritional quality based on weight priorities`;

  // Implementation guidance for weights
  enhancedPrompt += `\n\n📋 WEIGHT-BASED IMPLEMENTATION:`;
  enhancedPrompt += `\n1. Start with main goal requirements (${filters.primaryGoal || 'balanced nutrition'})`;
  enhancedPrompt += `\n2. When choosing between similar options, prioritize higher-weighted objectives`;
  enhancedPrompt += `\n3. Ensure final meals are practical and appealing to the target family`;
  enhancedPrompt += `\n4. Use weights for smart trade-offs, not rigid constraints`;

  return enhancedPrompt;
}

/**
 * V2 NEW: Get human-readable descriptions for weight priorities
 */
function getWeightDescription(goal: string): string {
  const descriptions = {
    cost: 'Cost savings through smart ingredient choices and reuse',
    health: 'Nutritional density and balanced macronutrients',
    cultural: 'Incorporate authentic cultural flavors and techniques',
    time: 'Minimize prep and cooking time for efficiency',
    variety: 'Use diverse ingredients and cooking methods'
  };
  
  return descriptions[goal as keyof typeof descriptions] || 'Balanced approach';
}

/**
 * UNIFIED GOAL SYSTEM - Consolidates primaryGoal and nutritionGoal throughout entire codebase
 * This replaces separate goal handling in frontend and backend
 */
interface UnifiedGoal {
  value: string;
  label: string;
  nutritionFocus: string;
  prompts: string[];
  filterAdjustments: Partial<MealPlanFilters>;
}

const UNIFIED_GOALS: UnifiedGoal[] = [
  {
    value: "Save Money",
    label: "💸 Save Money",
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
      budgetConstraints: 'low',
      varietyPreference: 'consistent'
    }
  },
  {
    value: "Eat Healthier",
    label: "🍎 Eat Healthier", 
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
      varietyPreference: 'high_variety'
    }
  },
  {
    value: "Gain Muscle",
    label: "🏋️ Build Muscle",
    nutritionFocus: "muscle_gain", 
    prompts: [
      "Generate a structured daily meal plan for a user training regularly to build muscle",
      "Meals should emphasize foods naturally rich in protein, complex carbohydrates, and healthy fats to support muscle growth and recovery",
      "Prioritize nutrient-dense, satisfying foods that aid physical repair and consistent energy",
      "Structure the plan with [number] main meals, spaced to fuel workouts and recovery periods",
      "Each meal should include portion sizes, estimated protein content, calorie estimates, and preparation instructions",
      "Include a variety of protein-rich foods appropriate to the cultural cuisine, whole grains, and colorful vegetables",
      "The plan should promote steady nourishment, muscle repair, and strength gains throughout the day"
    ],
    filterAdjustments: {
      encourageOverlap: true,
      availableIngredientUsagePercent: 60,
      prepTimePreference: 'moderate'
    }
  },
  {
    value: "Lose Weight",
    label: "⚖️ Lose Weight",
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
      varietyPreference: 'high_variety',
      prepTimePreference: 'minimal'
    }
  },
  {
    value: "Family Nutrition", 
    label: "👨‍👩‍👧‍👦 Family Nutrition",
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
      varietyPreference: 'moderate'
    }
  },
  {
    value: "Energy & Performance",
    label: "⚡ Energy & Performance", 
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
      prepTimePreference: 'enjoys_cooking'
    }
  },
  {
    value: "Digestive Health",
    label: "🥦 Digestive Health",
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
      varietyPreference: 'moderate'
    }
  }
];

/**
 * Get unified goal configuration by value
 */
export function getUnifiedGoal(goalValue: string): UnifiedGoal | null {
  return UNIFIED_GOALS.find(goal => goal.value.toLowerCase() === goalValue.toLowerCase()) || null;
}

/**
 * Export unified goals for frontend use
 */
export { UNIFIED_GOALS };

function applyPrimaryGoalLogic(primaryGoal: string, filters: MealPlanFilters) {
  console.log('\n📋 PRIMARY GOAL LOGIC DEBUG:');
  console.log('  - Requested primaryGoal:', primaryGoal);
  
  const unifiedGoal = getUnifiedGoal(primaryGoal);
  console.log('  - Found unified goal:', unifiedGoal ? unifiedGoal.value : 'NOT FOUND');
  
  if (unifiedGoal) {
    console.log('  - Using goal-specific prompts for:', unifiedGoal.label);
    console.log('  - Goal prompts count:', unifiedGoal.prompts.length);
    console.log('  - Nutrition focus:', unifiedGoal.nutritionFocus);
    
    // Use unified goal system
    let prompt = ` ${unifiedGoal.prompts[0].toLowerCase().replace(':', '')}`;
    
    // Add all goal-specific prompts
    const goalPrompts = unifiedGoal.prompts.slice(1).map(p => `\n- ${p}`).join('');
    prompt += goalPrompts;
    
    // Auto-set nutrition goal based on primary goal
    const adjustedFilters = {
      ...unifiedGoal.filterAdjustments,
      nutritionGoal: unifiedGoal.nutritionFocus
    };
    
    console.log('  - Generated goal prompt length:', prompt.length);
    console.log('  - Applied filter adjustments:', Object.keys(adjustedFilters));
    
    return { prompt, adjustedFilters };
  }
  
  // Fallback for unknown goals
  return { 
    prompt: ` with balanced nutrition and practical meal planning`,
    adjustedFilters: { 
      availableIngredientUsagePercent: 60,
      nutritionGoal: 'general_wellness'
    }
  };
}

// Helper function to extract family dietary preferences
export function extractFamilyDietaryNeeds(familyMembers: FamilyMember[]): {
  preferences: string[];
  restrictions: string[];
  goals: string[];
} {
  const allPreferences = familyMembers.flatMap(m => m.preferences);
  const allGoals = familyMembers.flatMap(m => m.goals);
  
  const preferences = [...new Set(allPreferences)];
  const goals = [...new Set(allGoals)];
  
  // Extract dietary restrictions from preferences
  const restrictions = preferences.filter(pref => 
    pref.toLowerCase().includes('gluten-free') ||
    pref.toLowerCase().includes('dairy-free') ||
    pref.toLowerCase().includes('vegan') ||
    pref.toLowerCase().includes('vegetarian') ||
    pref.toLowerCase().includes('keto') ||
    pref.toLowerCase().includes('paleo')
  );

  return { preferences, restrictions, goals };
}

/**
 * Enhance generated meal with intelligent cooking time and difficulty calculation
 */
export function enhanceMealWithIntelligentTiming(meal: any): any {
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

/**
 * Validate if meal fits within user's time and difficulty constraints
 */
export function validateMealConstraints(meal: any, filters: MealPlanFilters): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (meal.cook_time_minutes > filters.cookTime) {
    issues.push(`Cooking time (${meal.cook_time_minutes}min) exceeds limit (${filters.cookTime}min)`);
    suggestions.push("Consider using meal prep techniques to reduce active cooking time");
    suggestions.push("Look for one-pot or sheet pan alternatives");
  }

  if (meal.difficulty > filters.difficulty) {
    issues.push(`Difficulty level (${meal.difficulty}) exceeds preference (${filters.difficulty})`);
    if (meal.easy_alternatives && meal.easy_alternatives.length > 0) {
      suggestions.push(`Easy alternatives: ${meal.easy_alternatives.slice(0, 2).join(', ')}`);
    }
  }

  // Check prep time preferences
  if (filters.prepTimePreference === 'minimal' && meal.prep_time_minutes > 15) {
    issues.push("High prep time may not suit minimal prep preference");
    suggestions.push("Consider using pre-cut vegetables or convenience ingredients");
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  };
}

/**
 * Get difficulty-appropriate cooking tips for meal generation
 */
export function getDifficultyAdjustedPromptSuffix(difficulty: number): string {
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

// ==================== ENHANCED RECIPE GENERATION SYSTEM ====================

/**
 * Enhanced meal plan generation with pre-analysis intelligence
 * This is the new recommended approach for improved time accuracy
 */
export async function generateEnhancedMealPlan(filters: MealPlanFilters): Promise<any> {
  const enhancedService = new EnhancedRecipeGenerationService();
  
  console.log('🚀 Using Enhanced Recipe Generation System');
  console.log(`Target: ${filters.difficulty}/5 difficulty, ${filters.cookTime}min max time`);
  
  try {
    const result = await enhancedService.generateMealPlan(filters);
    
    if (result.success) {
      console.log(`✅ Enhanced generation complete - Time accuracy: ${result.metadata.timingAccuracy}%`);
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
      console.log('❌ Enhanced generation failed, falling back to standard system');
      // Fallback to original system
      return generateStandardMealPlan(filters);
    }
  } catch (error) {
    console.error('Enhanced generation error:', error);
    // Fallback to original system
    return generateStandardMealPlan(filters);
  }
}

/**
 * Standard meal plan generation (your original system)
 * Kept as fallback for the enhanced system
 */
export function generateStandardMealPlan(filters: MealPlanFilters): any {
  console.log('📝 Using Standard Recipe Generation System (fallback)');
  
  // Build the prompt using your existing system
  const prompt = buildIntelligentPrompt_OLD(filters);
  
  return {
    success: true,
    prompt,
    metadata: {
      generatedAt: new Date(),
      enhancedSystem: false,
      calculatorVersion: '1.0'
    }
  };
}

/**
 * Build enhanced prompt with pre-analysis (alternative approach)
 * Use this if you want to enhance your existing prompt building without changing the full flow
 */
export async function buildEnhancedIntelligentPrompt(filters: MealPlanFilters): Promise<string> {
  const enhancedService = new EnhancedRecipeGenerationService();
  
  try {
    // Get pre-analysis for meal requirements
    const mealAnalysis = await (enhancedService as any).analyzeMealRequirements(filters);
    
    // Start with your existing prompt
    let enhancedPrompt = buildIntelligentPrompt_OLD(filters);
    
    // Add enhanced guidance based on pre-analysis
    enhancedPrompt += `\n\n🧠 ENHANCED MEAL-SPECIFIC GUIDANCE:`;
    
    Object.entries(mealAnalysis).forEach(([mealType, analysis]: [string, any]) => {
      enhancedPrompt += `\n${mealType.toUpperCase()}:`;
      enhancedPrompt += `\n- Target complexity: ${analysis.targetComplexity}/5`;
      enhancedPrompt += `\n- Target time: ${analysis.estimatedTime} minutes`;
      enhancedPrompt += `\n- Time breakdown: ${analysis.timeBreakdown.slice(0, 2).join(', ')}`;
      
      if (!analysis.feasible) {
        enhancedPrompt += `\n- ⚠️ IMPORTANT: Simplify - current estimates exceed time limit`;
      }
    });
    
    // Enhanced time accuracy requirements
    enhancedPrompt += `\n\n⏱️ ENHANCED TIME ACCURACY REQUIREMENTS:`;
    enhancedPrompt += `\n- CRITICAL: cook_time_minutes must include BOTH prep AND cooking time`;
    enhancedPrompt += `\n- Provide time breakdown: "X min prep + Y min cook = Z min total"`;
    enhancedPrompt += `\n- Account for difficulty level ${filters.difficulty} skill requirements`;
    enhancedPrompt += `\n- Be realistic for home cooks, not professional kitchens`;
    
    return enhancedPrompt;
    
  } catch (error) {
    console.warn('Enhanced prompt building failed, using standard prompt:', error);
    return buildIntelligentPrompt_OLD(filters);
  }
}

/**
 * Validate generated meal plan against enhanced requirements
 */
export function validateEnhancedMealPlan(mealPlan: any, filters: MealPlanFilters): {
  isValid: boolean;
  accuracy: {
    timingAccuracy: number;
    complexityAccuracy: number;
  };
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let timeAccurateCount = 0;
  let complexityAccurateCount = 0;
  let totalMeals = 0;
  
  if (!mealPlan.meal_plan) {
    return {
      isValid: false,
      accuracy: { timingAccuracy: 0, complexityAccuracy: 0 },
      issues: ['Missing meal_plan structure'],
      suggestions: ['Ensure response follows correct JSON format']
    };
  }
  
  // Check each meal
  for (const dayKey in mealPlan.meal_plan) {
    const day = mealPlan.meal_plan[dayKey];
    
    for (const mealType in day) {
      const meal = day[mealType];
      totalMeals++;
      
      // Time validation
      if (meal.cook_time_minutes <= filters.cookTime) {
        timeAccurateCount++;
      } else {
        issues.push(`${mealType} exceeds time limit: ${meal.cook_time_minutes}min > ${filters.cookTime}min`);
      }
      
      // Complexity validation
      if (meal.difficulty <= filters.difficulty) {
        complexityAccurateCount++;
      } else {
        issues.push(`${mealType} exceeds difficulty: ${meal.difficulty} > ${filters.difficulty}`);
      }
      
      // Check for time breakdown
      if (!meal.time_breakdown) {
        issues.push(`${mealType} missing time breakdown`);
        suggestions.push('Add time breakdown format: "X min prep + Y min cook"');
      }
    }
  }
  
  const timingAccuracy = totalMeals > 0 ? Math.round((timeAccurateCount / totalMeals) * 100) : 0;
  const complexityAccuracy = totalMeals > 0 ? Math.round((complexityAccurateCount / totalMeals) * 100) : 0;
  
  return {
    isValid: issues.length === 0,
    accuracy: { timingAccuracy, complexityAccuracy },
    issues,
    suggestions
  };
}

/**
 * Add intelligent conflict resolution guidance to meal plan prompts
 * Analyzes potential conflicts between cultural cuisine and dietary restrictions
 */
async function addConflictResolutionGuidance(filters: MealPlanFilters): Promise<string> {
  let guidance = ``;
  
  // Extract all dietary restrictions from family members and filters
  const allDietaryRestrictions: string[] = [];
  
  if (filters.dietaryRestrictions) {
    allDietaryRestrictions.push(filters.dietaryRestrictions);
  }
  
  if (filters.familyMembers && filters.familyMembers.length > 0) {
    const familyRestrictions = filters.familyMembers
      .flatMap(member => member.preferences)
      .filter(pref => 
        pref.toLowerCase().includes('vegetarian') ||
        pref.toLowerCase().includes('vegan') ||
        pref.toLowerCase().includes('gluten-free') ||
        pref.toLowerCase().includes('dairy-free') ||
        pref.toLowerCase().includes('halal') ||
        pref.toLowerCase().includes('kosher') ||
        pref.toLowerCase().includes('keto') ||
        pref.toLowerCase().includes('paleo')
      );
    allDietaryRestrictions.push(...familyRestrictions);
  }
  
  // Remove duplicates
  const uniqueRestrictions = [...new Set(allDietaryRestrictions)];
  
  if (uniqueRestrictions.length === 0 || !filters.culturalBackground || filters.culturalBackground.length === 0) {
    return guidance; // No conflicts possible
  }
  
  console.log(`🔍 Checking for conflicts between cultural background [${filters.culturalBackground.join(', ')}] and dietary restrictions [${uniqueRestrictions.join(', ')}]`);
  
  // Check for potential conflicts with common cultural dishes
  const culturalDishes = getCulturalDishExamples(filters.culturalBackground);
  
  let hasConflicts = false;
  const conflictResolutions: string[] = [];
  
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
    guidance += `\n\n🔧 DIETARY-CULTURAL CONFLICT RESOLUTION:`;
    guidance += `\n- CRITICAL: Some traditional dishes conflict with dietary restrictions`;
    guidance += `\n- Use these culturally authentic alternatives that comply with dietary needs:`;
    
    for (const resolution of conflictResolutions.slice(0, 5)) { // Limit to top 5
      guidance += `\n  • ${resolution}`;
    }
    
    guidance += `\n- Maintain cultural authenticity by using traditional cooking methods and spices`;
    guidance += `\n- Focus on dishes that naturally align with dietary restrictions rather than heavily modified versions`;
    guidance += `\n- When suggesting alternatives, explain the cultural context and preparation method`;
  }
  
  return guidance;
}

/**
 * Get example dishes for cultural backgrounds to test for conflicts
 */
function getCulturalDishExamples(culturalBackground: string[]): string[] {
  const culturalDishes: { [key: string]: string[] } = {
    'Chinese': ['beef stir-fry', 'pork dumplings', 'chicken fried rice', 'shrimp lo mein'],
    'Italian': ['chicken parmesan', 'beef bolognese', 'cheese pizza', 'carbonara pasta'],
    'Mexican': ['beef tacos', 'chicken quesadilla', 'pork carnitas', 'cheese enchiladas'],
    'Indian': ['chicken curry', 'lamb biryani', 'paneer makhani', 'beef vindaloo'],
    'Japanese': ['chicken teriyaki', 'beef sukiyaki', 'pork ramen', 'fish tempura'],
    'Thai': ['pad thai with shrimp', 'green curry with chicken', 'pork larb', 'beef massaman'],
    'Korean': ['beef bulgogi', 'pork kimchi stew', 'chicken bibimbap', 'seafood pancake'],
    'Vietnamese': ['beef pho', 'pork banh mi', 'chicken vermicelli', 'fish curry'],
    'Greek': ['lamb gyros', 'chicken souvlaki', 'feta cheese salad', 'beef moussaka'],
    'Lebanese': ['lamb kebab', 'chicken shawarma', 'hummus with pita', 'beef kibbeh'],
    'French': ['coq au vin', 'beef bourguignon', 'cheese souffle', 'duck confit']
  };
  
  const examples: string[] = [];
  
  for (const culture of culturalBackground) {
    const dishes = culturalDishes[culture];
    if (dishes) {
      examples.push(...dishes.slice(0, 3)); // Take first 3 dishes per culture
    }
  }
  
  return examples;
}

/**
 * Fallback function for basic cultural data processing when ranking engine fails
 */
function addBasicCulturalDataFallback(filters: any): string {
  let culturalContent = '';
  
  for (const culture of filters.culturalBackground) {
    if (filters.culturalCuisineData[culture]) {
      const cultureData = filters.culturalCuisineData[culture];
      const mealNames = cultureData.meals ? cultureData.meals.map((meal: any) => meal.name).slice(0, 3) : [];
      const keyIngredients = cultureData.key_ingredients ? cultureData.key_ingredients.slice(0, 5) : [];
      const cookingStyles = cultureData.styles ? cultureData.styles.slice(0, 3) : [];
      
      if (mealNames.length > 0) {
        culturalContent += `\n- ${culture} dishes to consider: ${mealNames.join(', ')}`;
      }
      
      // Enhanced cultural guidance with fallback cultural knowledge
      if (culture.toLowerCase() === 'peruvian') {
        culturalContent += `\n- Peruvian flavor profile: Aji amarillo (yellow chili), cumin, cilantro, lime, garlic`;
        culturalContent += `\n- Peruvian ingredients: Quinoa, potatoes, corn, plantains, yuca, black beans, fish/seafood`;
        culturalContent += `\n- Peruvian techniques: Marinating with citrus, anticuchos grilling, stir-frying (saltado style)`;
        culturalContent += `\n- Peruvian adaptations: Add aji amarillo to sauces, use lime in marinades, incorporate quinoa and potatoes`;
      }
      
      if (keyIngredients.length > 0) {
        culturalContent += `\n- ${culture} key ingredients: ${keyIngredients.join(', ')}`;
      }
      if (cookingStyles.length > 0) {
        culturalContent += `\n- ${culture} cooking styles: ${cookingStyles.join(', ')}`;
      }
      
      // Add healthy modifications from Perplexity data
      if (cultureData.meals && cultureData.meals.length > 0) {
        const healthyMods = cultureData.meals.flatMap((meal: any) => meal.healthy_mods || []).slice(0, 3);
        if (healthyMods.length > 0) {
          culturalContent += `\n- ${culture} healthy modifications: ${healthyMods.join(', ')}`;
        }
      }
    }
  }
  
  return culturalContent;
}
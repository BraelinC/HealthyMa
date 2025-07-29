/**
 * Prompt Template Engine for Dynamic Meal Plan Generation
 * Converts template with placeholders into fully personalized prompts
 */

import { CulturalMealRankingEngine, MealScore } from './culturalMealRankingEngine';
import { UNIFIED_GOALS } from './intelligentPromptBuilderV2';

export interface PromptTemplateData {
  // Basic configuration
  mealPlanDays: number;
  mealsPerDay: number;
  maxCookTime: number;
  maxDifficulty: number;
  
  // Goal and nutrition
  primaryGoal: string;
  nutritionGoal: string;
  
  // Weights
  goalWeights: {
    cost: number;
    health: number;
    cultural: number;
    variety: number;
    time: number;
  };
  
  // Cultural data
  culturalBackground: string[];
  rankedMeals?: MealScore[];
  
  // Dietary
  dietaryRestrictions: string[];
  
  // User context
  userId: number;
  profileName: string;
  familySize: number;
}

export class PromptTemplateEngine {
  private template = `{MAIN_GOAL_PROMPT}

Create a {MEAL_PLAN_DAYS}-day meal plan with {MEALS_PER_DAY} meals per day with balanced nutrition.

🎯 DYNAMIC WEIGHT-BASED PRIORITY SYSTEM:
Objectives ranked by user preferences (weights dynamically calculated):
{DYNAMIC_WEIGHTS_LIST}

REQUIREMENTS:
- Max cook time: {MAX_COOK_TIME} minutes (including prep + cook time)
- Difficulty level: MAXIMUM {MAX_DIFFICULTY}/5 (calculated by RecipeComplexityCalculator)
- Nutrition goal: {NUTRITION_GOAL}

🌍 CULTURAL CUISINE INTEGRATION:
- Cultural background: {USER_CULTURE}
- Priority weight: {CULTURAL_WEIGHT}%

{RANKED_MEALS_SECTION}

{TECHNIQUE_GUIDANCE_SECTION}

ENHANCED TIME CALCULATIONS:
Each meal must include:
- prep_time_minutes: (integer value)
- active_cooking_minutes: (integer value)
- passive_time_minutes: (integer value, 0 if none)
- total_time_minutes: ≤{MAX_COOK_TIME}

{DIETARY_RESTRICTIONS_SECTION}

MEAL SELECTION ALGORITHM:
1. Pre-calculate complexity scores for all {USER_CULTURE} dishes
2. Apply weight matrix: {WEIGHT_MATRIX}
3. Rank meals by composite score
4. Select top meals within difficulty constraint ({MAX_DIFFICULTY})
5. Ensure variety across {MEAL_PLAN_DAYS} days

RETURN FORMAT: Enhanced JSON structure:
{JSON_STRUCTURE}`;

  /**
   * Generate prompt from template and data
   */
  generatePrompt(data: PromptTemplateData): string {
    console.log('\n📊 TEMPLATE ENGINE DEBUG - Input data:');
    console.log('  - Meal plan days:', data.mealPlanDays);
    console.log('  - Meals per day:', data.mealsPerDay);
    console.log('  - Max cook time:', data.maxCookTime, 'minutes');
    console.log('  - Max difficulty:', data.maxDifficulty, '/5');
    console.log('  - Primary goal:', data.primaryGoal);
    console.log('  - Cultural background:', data.culturalBackground);
    console.log('  - Goal weights:', JSON.stringify(data.goalWeights, null, 2));
    console.log('  - Ranked meals count:', data.rankedMeals?.length || 0);
    
    // Validate required data
    if (!data.maxCookTime || !data.maxDifficulty) {
      console.error('❌ TEMPLATE ENGINE ERROR: Missing required data!');
      console.error('  - maxCookTime:', data.maxCookTime);
      console.error('  - maxDifficulty:', data.maxDifficulty);
    }
    
    const replacements: Record<string, string> = {
      '{MAIN_GOAL_PROMPT}': this.generateMainGoalPrompt(data.primaryGoal),
      '{MEAL_PLAN_DAYS}': data.mealPlanDays.toString(),
      '{MEALS_PER_DAY}': data.mealsPerDay.toString(),
      '{DYNAMIC_WEIGHTS_LIST}': this.generateDynamicWeightsList(data.goalWeights),
      '{MAX_COOK_TIME}': data.maxCookTime.toString(),
      '{MAX_DIFFICULTY}': data.maxDifficulty.toString(),
      '{NUTRITION_GOAL}': data.nutritionGoal,
      '{USER_CULTURE}': data.culturalBackground.join(', ') || 'Not specified',
      '{CULTURAL_WEIGHT}': Math.round((data.goalWeights.cultural || 0.5) * 100).toString(),
      '{RANKED_MEALS_SECTION}': this.generateRankedMealsSection(data),
      '{TECHNIQUE_GUIDANCE_SECTION}': this.generateTechniqueGuidance(data.rankedMeals),
      '{DIETARY_RESTRICTIONS_SECTION}': this.generateDietarySection(data.dietaryRestrictions),
      '{WEIGHT_MATRIX}': JSON.stringify(data.goalWeights),
      '{JSON_STRUCTURE}': this.generateJSONStructure(data)
    };
    
    let prompt = this.template;
    for (const [placeholder, value] of Object.entries(replacements)) {
      prompt = prompt.replace(new RegExp(placeholder, 'g'), value);
    }
    
    console.log('\n✅ TEMPLATE ENGINE: Successfully generated prompt');
    console.log('  - Prompt length:', prompt.length, 'characters');
    console.log('  - First 200 chars:', prompt.substring(0, 200) + '...');
    
    return prompt;
  }
  
  /**
   * Generate main goal prompt section
   */
  private generateMainGoalPrompt(primaryGoal: string): string {
    const goal = UNIFIED_GOALS.find(g => g.value === primaryGoal);
    if (!goal) {
      return 'Generate a balanced meal plan with practical nutrition';
    }
    
    // Combine goal prompts into a coherent paragraph
    const mainPrompt = goal.prompts[0];
    const additionalPoints = goal.prompts.slice(1).map(p => `- ${p}`).join('\n');
    
    return `${mainPrompt}\n${additionalPoints}`;
  }
  
  /**
   * Generate dynamic weights list with descriptions
   */
  private generateDynamicWeightsList(weights: Record<string, number>): string {
    const weightDescriptions: Record<string, string> = {
      cost: 'Cost savings through smart ingredient choices and reuse',
      health: 'Nutritional density and balanced macronutrients',
      cultural: 'Incorporate authentic cultural flavors and techniques',
      time: 'Minimize prep and cooking time for efficiency',
      variety: 'Use diverse ingredients and cooking methods'
    };
    
    // Sort weights by value (highest first)
    const sortedWeights = Object.entries(weights)
      .sort(([,a], [,b]) => b - a)
      .filter(([,weight]) => weight > 0);
    
    return sortedWeights.map(([key, weight]) => {
      const percentage = Math.round(weight * 100);
      const priority = this.getPriorityLevel(weight);
      const description = weightDescriptions[key] || `Optimize for ${key}`;
      return `- ${priority} (${percentage}%): ${description}`;
    }).join('\n');
  }
  
  /**
   * Get priority level text based on weight
   */
  private getPriorityLevel(weight: number): string {
    if (weight >= 0.7) return 'VERY HIGH PRIORITY';
    if (weight >= 0.5) return 'HIGH PRIORITY';
    if (weight >= 0.3) return 'MODERATE PRIORITY';
    if (weight >= 0.15) return 'LOW PRIORITY';
    return 'MINIMAL PRIORITY';
  }
  
  /**
   * Generate ranked meals section
   */
  private generateRankedMealsSection(data: PromptTemplateData): string {
    if (!data.culturalBackground?.length) {
      return 'TOP-RANKED MEALS:\n- No cultural background specified';
    }
    
    const culture = data.culturalBackground[0];
    let section = `TOP-RANKED ${culture.toUpperCase()} MEALS (by complexity + weight algorithm):\n`;
    
    if (data.rankedMeals && data.rankedMeals.length > 0) {
      // Use actual ranked meals
      const topMeals = data.rankedMeals.slice(0, 5);
      section += topMeals.map((score, index) => 
        `${index + 1}. ${score.meal.name} (Score: ${Math.round(score.total_score * 100)}%)`
      ).join('\n');
      
      // Add key ingredients from top meals
      const allIngredients = new Set<string>();
      topMeals.forEach(score => {
        score.meal.ingredients.forEach(ing => allIngredients.add(ing));
      });
      const keyIngredients = Array.from(allIngredients).slice(0, 8);
      if (keyIngredients.length > 0) {
        section += `\n\nKey ingredients from top-ranked meals: ${keyIngredients.join(', ')}`;
      }
      
      // Add cooking techniques
      const allTechniques = new Set<string>();
      topMeals.forEach(score => {
        score.meal.cooking_techniques.forEach(tech => allTechniques.add(tech));
      });
      const techniques = Array.from(allTechniques).slice(0, 5);
      if (techniques.length > 0) {
        section += `\nCooking techniques: ${techniques.join(', ')}`;
      }
    } else {
      // Fallback meals based on culture
      section += this.getCulturalFallbackMeals(culture);
    }
    
    return section;
  }
  
  /**
   * Get fallback meals for a culture
   */
  private getCulturalFallbackMeals(culture: string): string {
    const fallbacks: Record<string, string[]> = {
      'Peruvian': ['Ceviche', 'Lomo Saltado', 'Aji de Gallina', 'Anticuchos', 'Causa Limeña'],
      'Chinese': ['Kung Pao Chicken', 'Mapo Tofu', 'Beef and Broccoli', 'Hot and Sour Soup', 'Fried Rice'],
      'Italian': ['Pasta Primavera', 'Chicken Marsala', 'Caprese Salad', 'Minestrone', 'Risotto'],
      'Mexican': ['Tacos al Pastor', 'Enchiladas Verdes', 'Pozole', 'Chiles Rellenos', 'Mole Poblano']
    };
    
    const meals = fallbacks[culture] || ['Traditional Dish 1', 'Traditional Dish 2', 'Traditional Dish 3'];
    return meals.slice(0, 5).map((meal, i) => `${i + 1}. ${meal}`).join('\n');
  }
  
  /**
   * Generate technique guidance from ranked meals
   */
  private generateTechniqueGuidance(rankedMeals?: MealScore[]): string {
    let section = 'TECHNIQUE-SPECIFIC GUIDANCE (from top-ranked meals):\n';
    
    if (rankedMeals && rankedMeals.length > 0) {
      // Extract unique techniques from top meals
      const techniqueMap = new Map<string, { count: number, avgTime: number }>();
      
      rankedMeals.slice(0, 5).forEach(score => {
        score.meal.cooking_techniques.forEach(technique => {
          const current = techniqueMap.get(technique) || { count: 0, avgTime: 0 };
          current.count++;
          current.avgTime = (score.meal.estimated_cook_time + score.meal.estimated_prep_time) / 2;
          techniqueMap.set(technique, current);
        });
      });
      
      // Sort by frequency
      const sortedTechniques = Array.from(techniqueMap.entries())
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 5);
      
      section += sortedTechniques.map(([technique, data]) => {
        const timeRange = `${Math.round(data.avgTime * 0.8)}-${Math.round(data.avgTime * 1.2)} min`;
        return `- ${technique}: ${timeRange} - Used in ${data.count} top-ranked dishes`;
      }).join('\n');
    } else {
      // Fallback techniques
      section += `- Stir-frying: 10-15 min - High heat, quick movements
- Braising: 45-60 min - Low and slow for tenderness
- Grilling: 15-20 min - Preheat well, oil grates
- Steaming: 10-20 min - Gentle, preserves nutrients
- Roasting: 30-45 min - Even browning, crispy exterior`;
    }
    
    return section;
  }
  
  /**
   * Generate dietary restrictions section
   */
  private generateDietarySection(restrictions: string[]): string {
    if (!restrictions || restrictions.length === 0) {
      return 'DIETARY RESTRICTIONS:\n- None specified';
    }
    
    return `DIETARY RESTRICTIONS:
- Must comply with: ${restrictions.join(', ')}
- All meals must be strictly ${restrictions.join(' and ')}
- Suggest appropriate substitutions when adapting traditional dishes
- Clearly indicate any modifications made for dietary compliance`;
  }
  
  /**
   * Generate enhanced JSON structure
   */
  private generateJSONStructure(data: PromptTemplateData): string {
    const dayKeys = Array.from({ length: data.mealPlanDays }, (_, i) => `day_${i + 1}`);
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'second_snack'].slice(0, data.mealsPerDay);
    
    const mealExample = {
      title: "Recipe Name",
      complexity_score: "{float between 0-1}",
      cultural_rank: "{1-10 based on cultural alignment}",
      time_breakdown: {
        prep_minutes: "{integer}",
        active_minutes: "{integer}",
        passive_minutes: "{integer}",
        total_minutes: "{integer ≤ " + data.maxCookTime + "}"
      },
      primary_techniques: ["technique1", "technique2"],
      difficulty_factors: {
        technique_complexity: "{1-5 scale}",
        ingredient_complexity: "{1-5 scale}",
        timing_precision: "{1-5 scale}"
      },
      ingredients: ["ingredient with amount"],
      instructions: ["Step 1", "Step 2"],
      nutrition: {
        calories: "{integer}",
        protein_g: "{integer}",
        carbs_g: "{integer}",
        fat_g: "{integer}"
      }
    };
    
    const dayStructure: any = {};
    mealTypes.forEach(mealType => {
      dayStructure[mealType] = mealExample;
    });
    
    const mealPlanStructure: any = {};
    dayKeys.forEach(dayKey => {
      mealPlanStructure[dayKey] = dayStructure;
    });
    
    const fullStructure = {
      meal_plan: mealPlanStructure,
      shopping_list: ["All unique ingredients consolidated"],
      prep_tips: ["Batch cooking suggestions", "Storage tips"],
      technique_guidance: {
        "technique_name": {
          difficulty: "{1-5}",
          time_required: "{X-Y minutes}",
          tips: "Specific tips for this technique"
        }
      },
      estimated_savings: "{numeric value based on ingredient reuse}"
    };
    
    return JSON.stringify(fullStructure, null, 2);
  }
}

/**
 * Helper function to determine nutrition goal from primary goal
 */
export function determineNutritionGoal(primaryGoal: string): string {
  const nutritionMap: Record<string, string> = {
    "Save Money": "general_wellness",
    "Eat Healthier": "general_wellness",
    "Gain Muscle": "muscle_gain",
    "Lose Weight": "weight_loss",
    "Family Nutrition": "general_wellness",
    "Energy & Performance": "energy_performance",
    "Digestive Health": "digestive_health"
  };
  
  return nutritionMap[primaryGoal] || "general_wellness";
}
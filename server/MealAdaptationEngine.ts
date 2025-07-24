/**
 * Meal Adaptation Engine
 * 
 * Smart meal modification system for dietary compliance. When predetermined cultural
 * meals almost fit user needs but require adaptation, this engine suggests intelligent
 * modifications while maintaining cultural authenticity and satisfying weight-based goals.
 */

import type { CulturalMeal } from './SmartCulturalMealSelector';
import type { GoalWeights } from './WeightBasedMealPlanner';

export interface AdaptationResult {
  success: boolean;
  adaptedMeal: CulturalMeal;
  modifications: MealModification[];
  authenticity_retained: number; // 0-1 score
  goal_satisfaction: GoalWeights;
  adaptation_notes: string[];
  fallback_to_generation: boolean;
}

export interface MealModification {
  type: 'ingredient_substitution' | 'ingredient_removal' | 'ingredient_addition' | 'cooking_method' | 'portion_adjustment';
  original: string;
  replacement: string;
  reason: string;
  impact_on_authenticity: number; // 0-1, lower means more authentic
  dietary_necessity: boolean; // true if required for compliance
}

export interface AdaptationRequest {
  meal: CulturalMeal;
  dietaryRestrictions: string[];
  goalWeights: GoalWeights;
  maxAuthenticityLoss: number; // 0-1, how much authenticity loss is acceptable
  adaptationContext: {
    familySize: number;
    availableIngredients?: string[];
    budgetConstraint?: 'low' | 'medium' | 'high';
  };
}

export class MealAdaptationEngine {
  private readonly AUTHENTICITY_THRESHOLD = 0.6; // Minimum authenticity to retain
  private readonly MAX_MODIFICATIONS = 5; // Maximum changes per meal

  // Ingredient substitution knowledge base
  private readonly SUBSTITUTION_RULES = {
    // Meat substitutions for vegetarian/vegan
    meat: {
      vegetarian: ['tofu', 'mushrooms', 'tempeh', 'seitan', 'legumes'],
      vegan: ['tofu', 'mushrooms', 'tempeh', 'seitan', 'legumes', 'jackfruit']
    },
    
    // Dairy substitutions for dairy-free/vegan
    dairy: {
      'dairy-free': ['coconut milk', 'almond milk', 'oat milk', 'cashew cream'],
      vegan: ['coconut milk', 'almond milk', 'oat milk', 'cashew cream', 'nutritional yeast']
    },
    
    // Gluten substitutions
    gluten: {
      'gluten-free': ['rice flour', 'almond flour', 'coconut flour', 'gluten-free pasta', 'rice noodles']
    },
    
    // Nut substitutions
    nuts: {
      'nut-free': ['seeds', 'coconut', 'tahini (if sesame ok)', 'sunflower seeds']
    }
  };

  // Cultural authenticity preservation rules
  private readonly AUTHENTICITY_PRESERVATION = {
    // Key spices/seasonings that define cultural identity
    essential_spices: {
      italian: ['basil', 'oregano', 'garlic', 'olive oil', 'parmesan'],
      mexican: ['cumin', 'chili', 'lime', 'cilantro', 'onion'],
      chinese: ['soy sauce', 'ginger', 'garlic', 'scallions', 'sesame oil'],
      indian: ['turmeric', 'cumin', 'coriander', 'garam masala', 'ginger'],
      thai: ['fish sauce', 'lime', 'chili', 'coconut milk', 'lemongrass'],
      japanese: ['soy sauce', 'miso', 'rice vinegar', 'mirin', 'dashi']
    },
    
    // Cooking methods that preserve cultural identity
    essential_methods: {
      italian: ['sautéing', 'simmering', 'al dente pasta'],
      mexican: ['charring', 'slow cooking', 'fresh assembly'],
      chinese: ['stir-frying', 'steaming', 'braising'],
      indian: ['tempering spices', 'slow cooking', 'layering flavors'],
      thai: ['balancing sweet-sour-spicy', 'quick cooking', 'fresh herbs'],
      japanese: ['gentle cooking', 'umami building', 'clean flavors']
    }
  };

  /**
   * Attempt to adapt a cultural meal for dietary compliance
   */
  async adaptMealIfNeeded(
    meal: CulturalMeal,
    dietaryRestrictions: string[],
    goalWeights: GoalWeights,
    adaptationContext?: any
  ): Promise<AdaptationResult> {
    console.log(`Attempting to adapt meal: ${meal.name}`);
    console.log(`Dietary restrictions: ${dietaryRestrictions.join(', ')}`);

    // Quick check if adaptation is needed
    if (this.checkFullCompliance(meal, dietaryRestrictions)) {
      console.log('Meal already fully compliant, no adaptation needed');
      return {
        success: true,
        adaptedMeal: meal,
        modifications: [],
        authenticity_retained: 1.0,
        goal_satisfaction: this.calculateGoalSatisfaction(meal, goalWeights),
        adaptation_notes: ['No adaptation required - meal already compliant'],
        fallback_to_generation: false
      };
    }

    // Analyze required modifications
    const requiredModifications = this.analyzeRequiredModifications(meal, dietaryRestrictions);
    
    if (requiredModifications.length === 0) {
      console.log('No viable modifications found');
      return this.createFailureResult(meal, 'No viable adaptations found');
    }

    // Calculate authenticity impact
    const totalAuthenticityLoss = requiredModifications.reduce(
      (sum, mod) => sum + mod.impact_on_authenticity, 0
    ) / requiredModifications.length;

    // Check if authenticity loss is acceptable
    if (totalAuthenticityLoss > (1 - this.AUTHENTICITY_THRESHOLD)) {
      console.log(`Authenticity loss too high: ${totalAuthenticityLoss.toFixed(2)}`);
      return this.createFailureResult(meal, 'Authenticity loss exceeds acceptable threshold');
    }

    // Apply modifications and create adapted meal
    const adaptedMeal = await this.applyModifications(meal, requiredModifications);
    
    // Validate the adapted meal
    if (!this.checkFullCompliance(adaptedMeal, dietaryRestrictions)) {
      console.log('Adapted meal still not compliant');
      return this.createFailureResult(meal, 'Adaptation failed to achieve compliance');
    }

    // Calculate final scores
    const authenticityRetained = 1 - totalAuthenticityLoss;
    const goalSatisfaction = this.calculateGoalSatisfaction(adaptedMeal, goalWeights);
    const adaptationNotes = this.generateAdaptationNotes(requiredModifications, meal.culture);

    console.log(`Meal adaptation successful: ${authenticityRetained.toFixed(2)} authenticity retained`);

    return {
      success: true,
      adaptedMeal,
      modifications: requiredModifications,
      authenticity_retained: authenticityRetained,
      goal_satisfaction: goalSatisfaction,
      adaptation_notes: adaptationNotes,
      fallback_to_generation: false
    };
  }

  /**
   * Check if meal is fully compliant with all dietary restrictions
   */
  private checkFullCompliance(meal: CulturalMeal, restrictions: string[]): boolean {
    for (const restriction of restrictions) {
      if (!this.checkSingleRestrictionCompliance(meal, restriction)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check compliance with a single dietary restriction
   */
  private checkSingleRestrictionCompliance(meal: CulturalMeal, restriction: string): boolean {
    const restrictionLower = restriction.toLowerCase();
    const ingredientText = meal.ingredients.join(' ').toLowerCase();
    const instructionText = meal.instructions.join(' ').toLowerCase();
    
    switch (restrictionLower) {
      case 'vegetarian':
        return !this.containsMeat(ingredientText + ' ' + instructionText);
      
      case 'vegan':
        return !this.containsMeat(ingredientText + ' ' + instructionText) && 
               !this.containsDairy(ingredientText + ' ' + instructionText) &&
               !this.containsEggs(ingredientText + ' ' + instructionText);
      
      case 'gluten-free':
        return !this.containsGluten(ingredientText + ' ' + instructionText);
      
      case 'dairy-free':
        return !this.containsDairy(ingredientText + ' ' + instructionText);
      
      case 'nut-free':
        return !this.containsNuts(ingredientText + ' ' + instructionText);
      
      case 'keto':
        return meal.nutrition.carbs_g < 20;
      
      case 'low-sodium':
        return !this.containsHighSodium(ingredientText + ' ' + instructionText);
      
      default:
        return true; // Unknown restrictions assumed compliant
    }
  }

  /**
   * Analyze what modifications are needed for compliance
   */
  private analyzeRequiredModifications(
    meal: CulturalMeal, 
    restrictions: string[]
  ): MealModification[] {
    const modifications: MealModification[] = [];

    for (const restriction of restrictions) {
      const restrictionMods = this.getModificationsForRestriction(meal, restriction);
      modifications.push(...restrictionMods);
    }

    // Remove duplicates and prioritize by necessity
    const uniqueModifications = this.deduplicateModifications(modifications);
    
    // Sort by dietary necessity (required first) and authenticity impact (lower impact first)
    uniqueModifications.sort((a, b) => {
      if (a.dietary_necessity !== b.dietary_necessity) {
        return a.dietary_necessity ? -1 : 1;
      }
      return a.impact_on_authenticity - b.impact_on_authenticity;
    });

    return uniqueModifications.slice(0, this.MAX_MODIFICATIONS);
  }

  /**
   * Get specific modifications needed for a dietary restriction
   */
  private getModificationsForRestriction(
    meal: CulturalMeal,
    restriction: string
  ): MealModification[] {
    const modifications: MealModification[] = [];
    const restrictionLower = restriction.toLowerCase();

    // Analyze ingredients for violations
    meal.ingredients.forEach((ingredient, index) => {
      const ingredientLower = ingredient.toLowerCase();
      
      switch (restrictionLower) {
        case 'vegetarian':
        case 'vegan':
          if (this.isMeatIngredient(ingredientLower)) {
            modifications.push({
              type: 'ingredient_substitution',
              original: ingredient,
              replacement: this.getBestMeatSubstitute(ingredient, meal.culture),
              reason: `Substitute meat for ${restriction} compliance`,
              impact_on_authenticity: this.calculateMeatSubstitutionImpact(ingredient, meal.culture),
              dietary_necessity: true
            });
          }
          
          if (restrictionLower === 'vegan' && this.isDairyIngredient(ingredientLower)) {
            modifications.push({
              type: 'ingredient_substitution',
              original: ingredient,
              replacement: this.getBestDairySubstitute(ingredient, meal.culture),
              reason: 'Substitute dairy for vegan compliance',
              impact_on_authenticity: this.calculateDairySubstitutionImpact(ingredient, meal.culture),
              dietary_necessity: true
            });
          }
          break;

        case 'gluten-free':
          if (this.isGlutenIngredient(ingredientLower)) {
            modifications.push({
              type: 'ingredient_substitution',
              original: ingredient,
              replacement: this.getBestGlutenSubstitute(ingredient, meal.culture),
              reason: 'Substitute gluten-containing ingredient',
              impact_on_authenticity: this.calculateGlutenSubstitutionImpact(ingredient, meal.culture),
              dietary_necessity: true
            });
          }
          break;

        case 'dairy-free':
          if (this.isDairyIngredient(ingredientLower)) {
            modifications.push({
              type: 'ingredient_substitution',
              original: ingredient,
              replacement: this.getBestDairySubstitute(ingredient, meal.culture),
              reason: 'Remove dairy for dairy-free compliance',
              impact_on_authenticity: this.calculateDairySubstitutionImpact(ingredient, meal.culture),
              dietary_necessity: true
            });
          }
          break;

        case 'nut-free':
          if (this.isNutIngredient(ingredientLower)) {
            modifications.push({
              type: 'ingredient_removal',
              original: ingredient,
              replacement: 'remove or substitute with seeds',
              reason: 'Remove nuts for nut-free compliance',
              impact_on_authenticity: this.calculateNutRemovalImpact(ingredient, meal.culture),
              dietary_necessity: true
            });
          }
          break;
      }
    });

    return modifications;
  }

  /**
   * Apply modifications to create adapted meal
   */
  private async applyModifications(
    originalMeal: CulturalMeal,
    modifications: MealModification[]
  ): Promise<CulturalMeal> {
    // Deep copy the original meal
    const adaptedMeal: CulturalMeal = JSON.parse(JSON.stringify(originalMeal));
    
    // Apply each modification
    for (const modification of modifications) {
      switch (modification.type) {
        case 'ingredient_substitution':
          this.applyIngredientSubstitution(adaptedMeal, modification);
          break;
        
        case 'ingredient_removal':
          this.applyIngredientRemoval(adaptedMeal, modification);
          break;
        
        case 'ingredient_addition':
          this.applyIngredientAddition(adaptedMeal, modification);
          break;
        
        case 'cooking_method':
          this.applyCookingMethodChange(adaptedMeal, modification);
          break;
        
        case 'portion_adjustment':
          this.applyPortionAdjustment(adaptedMeal, modification);
          break;
      }
    }

    // Update adaptation metadata
    adaptedMeal.adaptation_notes = modifications.map(mod => 
      `${mod.type}: ${mod.original} → ${mod.replacement} (${mod.reason})`
    );

    // Recalculate nutrition if needed (simplified)
    this.recalculateNutrition(adaptedMeal, modifications);

    return adaptedMeal;
  }

  // Modification application methods
  private applyIngredientSubstitution(meal: CulturalMeal, modification: MealModification): void {
    // Find and replace in ingredients list
    const ingredientIndex = meal.ingredients.findIndex(ing => 
      ing.toLowerCase().includes(modification.original.toLowerCase())
    );
    
    if (ingredientIndex >= 0) {
      meal.ingredients[ingredientIndex] = modification.replacement;
    }

    // Update instructions if they mention the ingredient
    meal.instructions = meal.instructions.map(instruction => 
      instruction.replace(
        new RegExp(modification.original, 'gi'), 
        modification.replacement
      )
    );
  }

  private applyIngredientRemoval(meal: CulturalMeal, modification: MealModification): void {
    // Remove from ingredients list
    meal.ingredients = meal.ingredients.filter(ing => 
      !ing.toLowerCase().includes(modification.original.toLowerCase())
    );

    // Remove or modify instructions that mention the ingredient
    meal.instructions = meal.instructions.map(instruction => {
      if (instruction.toLowerCase().includes(modification.original.toLowerCase())) {
        return instruction.replace(
          new RegExp(`[^.]*${modification.original}[^.]*\\.?`, 'gi'),
          ''
        ).trim();
      }
      return instruction;
    }).filter(instruction => instruction.length > 0);
  }

  private applyIngredientAddition(meal: CulturalMeal, modification: MealModification): void {
    meal.ingredients.push(modification.replacement);
    // Add instruction for new ingredient if needed
    meal.instructions.push(`Add ${modification.replacement} as specified.`);
  }

  private applyCookingMethodChange(meal: CulturalMeal, modification: MealModification): void {
    // Update cooking instructions
    meal.instructions = meal.instructions.map(instruction => 
      instruction.replace(modification.original, modification.replacement)
    );
  }

  private applyPortionAdjustment(meal: CulturalMeal, modification: MealModification): void {
    // Adjust nutrition values proportionally
    const multiplier = parseFloat(modification.replacement) || 1;
    meal.nutrition.calories *= multiplier;
    meal.nutrition.protein_g *= multiplier;
    meal.nutrition.carbs_g *= multiplier;
    meal.nutrition.fat_g *= multiplier;
  }

  // Substitution helper methods
  private getBestMeatSubstitute(meatIngredient: string, culture: string): string {
    const ingredient = meatIngredient.toLowerCase();
    
    // Culture-specific substitutions
    if (culture.toLowerCase().includes('italian')) {
      if (ingredient.includes('ground')) return 'mushroom and walnut mixture';
      if (ingredient.includes('chicken')) return 'firm tofu or seitan';
      return 'plant-based protein';
    }
    
    if (culture.toLowerCase().includes('asian')) {
      if (ingredient.includes('pork')) return 'seasoned tofu or tempeh';
      if (ingredient.includes('chicken')) return 'firm tofu';
      return 'tofu or mushroom protein';
    }
    
    // Generic substitutions
    if (ingredient.includes('ground')) return 'lentils or mushroom crumbles';
    if (ingredient.includes('chicken')) return 'tofu or tempeh';
    if (ingredient.includes('beef')) return 'mushrooms or seitan';
    
    return 'plant-based protein substitute';
  }

  private getBestDairySubstitute(dairyIngredient: string, culture: string): string {
    const ingredient = dairyIngredient.toLowerCase();
    
    if (ingredient.includes('milk')) return 'coconut milk or oat milk';
    if (ingredient.includes('cream')) return 'cashew cream or coconut cream';
    if (ingredient.includes('cheese')) {
      if (culture.toLowerCase().includes('italian')) return 'nutritional yeast or vegan parmesan';
      return 'nutritional yeast or dairy-free cheese';
    }
    if (ingredient.includes('butter')) return 'olive oil or vegan butter';
    
    return 'dairy-free alternative';
  }

  private getBestGlutenSubstitute(glutenIngredient: string, culture: string): string {
    const ingredient = glutenIngredient.toLowerCase();
    
    if (ingredient.includes('pasta')) return 'rice noodles or gluten-free pasta';
    if (ingredient.includes('flour')) return 'rice flour or almond flour';
    if (ingredient.includes('bread')) return 'gluten-free bread';
    if (ingredient.includes('noodles')) return 'rice noodles or kelp noodles';
    
    return 'gluten-free alternative';
  }

  // Impact calculation methods
  private calculateMeatSubstitutionImpact(ingredient: string, culture: string): number {
    // Lower impact if culture has traditional vegetarian dishes
    const vegetarianFriendlyCultures = ['indian', 'thai', 'mediterranean'];
    const cultureFriendly = vegetarianFriendlyCultures.some(c => 
      culture.toLowerCase().includes(c)
    );
    
    return cultureFriendly ? 0.3 : 0.6;
  }

  private calculateDairySubstitutionImpact(ingredient: string, culture: string): number {
    // Cheese substitutions typically have higher impact
    if (ingredient.toLowerCase().includes('cheese')) return 0.7;
    if (ingredient.toLowerCase().includes('cream')) return 0.5;
    return 0.4;
  }

  private calculateGlutenSubstitutionImpact(ingredient: string, culture: string): number {
    // Pasta/noodle substitutions vary by culture
    if (culture.toLowerCase().includes('italian') && ingredient.includes('pasta')) return 0.8;
    if (culture.toLowerCase().includes('asian') && ingredient.includes('noodles')) return 0.6;
    return 0.5;
  }

  private calculateNutRemovalImpact(ingredient: string, culture: string): number {
    // Nuts are often garnish or texture, so removal has moderate impact
    return 0.4;
  }

  // Helper methods for ingredient detection
  private isMeatIngredient(ingredient: string): boolean {
    const meatKeywords = ['beef', 'pork', 'chicken', 'turkey', 'lamb', 'fish', 'salmon', 'tuna', 'shrimp', 'bacon', 'ham', 'sausage'];
    return meatKeywords.some(keyword => ingredient.includes(keyword));
  }

  private isDairyIngredient(ingredient: string): boolean {
    const dairyKeywords = ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'cheddar', 'mozzarella', 'parmesan'];
    return dairyKeywords.some(keyword => ingredient.includes(keyword));
  }

  private isGlutenIngredient(ingredient: string): boolean {
    const glutenKeywords = ['wheat', 'flour', 'bread', 'pasta', 'noodles', 'barley', 'rye'];
    return glutenKeywords.some(keyword => ingredient.includes(keyword));
  }

  private isNutIngredient(ingredient: string): boolean {
    const nutKeywords = ['almond', 'peanut', 'walnut', 'cashew', 'pistachio', 'hazelnut', 'pecan'];
    return nutKeywords.some(keyword => ingredient.includes(keyword));
  }

  // Utility methods from PredeterminedMealLibrary
  private containsMeat(text: string): boolean {
    const meatKeywords = ['beef', 'pork', 'chicken', 'turkey', 'lamb', 'fish', 'salmon', 'tuna', 'shrimp', 'meat', 'bacon', 'ham', 'sausage'];
    return meatKeywords.some(keyword => text.includes(keyword));
  }

  private containsDairy(text: string): boolean {
    const dairyKeywords = ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'dairy', 'cheddar', 'mozzarella', 'parmesan'];
    return dairyKeywords.some(keyword => text.includes(keyword));
  }

  private containsEggs(text: string): boolean {
    return text.includes('egg');
  }

  private containsGluten(text: string): boolean {
    const glutenKeywords = ['wheat', 'flour', 'bread', 'pasta', 'noodles', 'barley', 'rye', 'gluten'];
    return glutenKeywords.some(keyword => text.includes(keyword));
  }

  private containsNuts(text: string): boolean {
    const nutKeywords = ['almond', 'peanut', 'walnut', 'cashew', 'pistachio', 'hazelnut', 'pecan', 'nuts'];
    return nutKeywords.some(keyword => text.includes(keyword));
  }

  private containsHighSodium(text: string): boolean {
    const highSodiumKeywords = ['soy sauce', 'salt', 'sodium', 'canned', 'processed', 'pickle', 'olives'];
    return highSodiumKeywords.some(keyword => text.includes(keyword));
  }

  private deduplicateModifications(modifications: MealModification[]): MealModification[] {
    const seen = new Set<string>();
    return modifications.filter(mod => {
      const key = `${mod.type}_${mod.original}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private calculateGoalSatisfaction(meal: CulturalMeal, goalWeights: GoalWeights): GoalWeights {
    // Simplified goal satisfaction calculation
    return {
      cost: 0.7, // Placeholder - would analyze ingredient costs
      health: meal.nutrition.protein_g >= 20 ? 0.8 : 0.6,
      cultural: meal.authenticity_score,
      variety: 0.8, // Placeholder
      time: meal.cook_time_minutes <= 30 ? 0.9 : 0.6
    };
  }

  private generateAdaptationNotes(modifications: MealModification[], culture: string): string[] {
    const notes = [
      `Adapted ${culture} dish to meet dietary requirements`,
      `${modifications.length} modifications applied to ensure compliance`,
    ];

    const substitutions = modifications.filter(mod => mod.type === 'ingredient_substitution');
    if (substitutions.length > 0) {
      notes.push(`Key substitutions: ${substitutions.map(sub => `${sub.original} → ${sub.replacement}`).join(', ')}`);
    }

    const removals = modifications.filter(mod => mod.type === 'ingredient_removal');
    if (removals.length > 0) {
      notes.push(`Ingredients removed: ${removals.map(rem => rem.original).join(', ')}`);
    }

    return notes;
  }

  private createFailureResult(meal: CulturalMeal, reason: string): AdaptationResult {
    return {
      success: false,
      adaptedMeal: meal,
      modifications: [],
      authenticity_retained: 0,
      goal_satisfaction: { cost: 0, health: 0, cultural: 0, variety: 0, time: 0 },
      adaptation_notes: [reason],
      fallback_to_generation: true
    };
  }

  private recalculateNutrition(meal: CulturalMeal, modifications: MealModification[]): void {
    // Simplified nutrition recalculation
    // In a real implementation, this would use a nutrition database
    
    let calorieAdjustment = 0;
    let proteinAdjustment = 0;
    let carbAdjustment = 0;
    let fatAdjustment = 0;

    modifications.forEach(mod => {
      if (mod.type === 'ingredient_substitution') {
        // Rough adjustments based on common substitutions
        if (mod.original.toLowerCase().includes('meat')) {
          calorieAdjustment -= 50; // Plant proteins often lower calorie
          proteinAdjustment -= 5;
        }
        if (mod.original.toLowerCase().includes('cream')) {
          calorieAdjustment -= 30;
          fatAdjustment -= 5;
        }
      }
    });

    // Apply adjustments
    meal.nutrition.calories = Math.max(200, meal.nutrition.calories + calorieAdjustment);
    meal.nutrition.protein_g = Math.max(5, meal.nutrition.protein_g + proteinAdjustment);
    meal.nutrition.carbs_g = Math.max(10, meal.nutrition.carbs_g + carbAdjustment);
    meal.nutrition.fat_g = Math.max(5, meal.nutrition.fat_g + fatAdjustment);
  }
}
/**
 * Direct test of cooking time calculator without server
 */

// Import the TypeScript file directly using tsx
import { calculateCookingTimeAndDifficulty, getEasyAlternatives } from './server/cookingTimeCalculator.ts';

const testRecipes = [
  {
    title: "Simple Scrambled Eggs",
    ingredients: ["eggs", "butter", "salt", "pepper"],
    instructions: ["Beat eggs", "Heat butter in pan", "Add eggs and scramble"],
    servings: 2
  },
  {
    title: "Chicken Stir-Fry",
    ingredients: ["chicken breast", "bell peppers", "broccoli", "soy sauce", "garlic", "onion"],
    instructions: ["Cut chicken", "Stir-fry chicken", "Add vegetables", "Season with soy sauce"],
    servings: 4
  },
  {
    title: "Chocolate Chip Cookies",
    ingredients: ["flour", "butter", "brown sugar", "white sugar", "eggs", "vanilla", "baking soda", "chocolate chips"],
    instructions: ["Cream butter and sugars", "Add eggs and vanilla", "Mix in flour and baking soda", "Fold in chocolate chips", "Bake at 375°F for 9-11 minutes"],
    servings: 24
  },
  {
    title: "Homemade Bread Loaf",
    ingredients: ["bread flour", "yeast", "water", "salt", "sugar", "olive oil"],
    instructions: ["Mix yeast with warm water and sugar", "Combine flour and salt", "Add yeast mixture and oil", "Knead for 8 minutes", "Let rise 1 hour", "Shape and bake 45 minutes at 450°F"],
    servings: 8
  }
];

console.log("🧪 Testing Cooking Time Calculator Direct Import\n");

for (const recipe of testRecipes) {
  console.log(`\n📝 Testing: ${recipe.title}`);
  console.log(`   Ingredients: ${recipe.ingredients.join(", ")}`);
  
  try {
    const result = calculateCookingTimeAndDifficulty(recipe);
    const alternatives = getEasyAlternatives(recipe);
    
    console.log(`   ⏱️  Total Time: ${result.totalMinutes} minutes (Prep: ${result.prepTime}, Cook: ${result.cookTime})`);
    console.log(`   🔧 Difficulty: ${result.difficulty}/5`);
    console.log(`   🔍 Methods: ${result.breakdown.methods.join(", ")}`);
    console.log(`   📊 Complexity Factors: ${result.breakdown.complexityFactors.join(", ") || "None"}`);
    
    if (result.recommendations.length > 0) {
      console.log(`   💡 Recommendations: ${result.recommendations.slice(0, 2).join("; ")}`);
    }
    
    if (alternatives.length > 0) {
      console.log(`   🔄 Alternatives: ${alternatives.slice(0, 2).join("; ")}`);
    }
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
  }
}

console.log("\n✅ Direct calculator test completed!");
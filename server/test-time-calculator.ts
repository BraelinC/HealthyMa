/**
 * Test Script for EnhancedCookingTimeCalculator
 */

import { EnhancedCookingTimeCalculator } from './enhancedCookingTimeCalculator';
import { CookingTimeFactors } from './recipeIntelligenceTypes';

// Create test instance
const calculator = new EnhancedCookingTimeCalculator();

console.log('🧪 Testing EnhancedCookingTimeCalculator');
console.log('=' .repeat(50));

// Test 1: Simple Scrambled Eggs
console.log('\n1️⃣ Test: Simple Scrambled Eggs (Complexity 1)');
const scrambledEggsTime: CookingTimeFactors = {
  prepWork: { chopping: 1, marinating: 0, mixing: 2, setup: 2 },
  activeTime: { cooking: 5, monitoring: 2 },
  passiveTime: { baking: 0, simmering: 0, resting: 0 }
};

const scrambledEggsResult = calculator.calculateTotalTime(scrambledEggsTime, 1);
console.log('Time Factors:', scrambledEggsTime);
console.log('Result:', scrambledEggsResult);
console.log('Expected: ~10-12 minutes total');

// Test 2: Chicken Parmesan (Complexity 4)
console.log('\n2️⃣ Test: Chicken Parmesan (Complexity 4)');
const chickenParmTime: CookingTimeFactors = {
  prepWork: { chopping: 5, marinating: 0, mixing: 8, setup: 4 }, // Breading setup
  activeTime: { cooking: 15, monitoring: 8 }, // Frying + monitoring
  passiveTime: { baking: 20, simmering: 0, resting: 5 } // Oven time + rest
};

const chickenParmResult = calculator.calculateTotalTime(chickenParmTime, 4);
console.log('Time Factors:', chickenParmTime);
console.log('Result:', chickenParmResult);
console.log('Expected: ~45-50 minutes total (with difficulty multiplier)');

// Test 3: Estimate from Recipe Description
console.log('\n3️⃣ Test: Estimate from Recipe Text');
const testRecipe = {
  description: "Spaghetti with marinara sauce - sauté garlic, add tomatoes, simmer 15 minutes",
  ingredients: ["spaghetti", "garlic", "onion", "tomatoes", "basil", "olive oil"],
  instructions: [
    "Boil water for pasta",
    "Chop onion and garlic",
    "Sauté onion in oil until soft",
    "Add garlic, cook 1 minute",
    "Add tomatoes and simmer 15 minutes",
    "Cook pasta according to package directions",
    "Combine pasta and sauce"
  ]
};

const estimatedTime = calculator.estimateFromRecipeDescription(
  testRecipe.description,
  testRecipe.ingredients,
  testRecipe.instructions,
  'dinner'
);

console.log('Recipe:', testRecipe.description);
console.log('Estimated Time Factors:', estimatedTime);
const spaghettiResult = calculator.calculateTotalTime(estimatedTime, 2);
console.log('Calculated Result:', spaghettiResult);
console.log('Expected: ~25-30 minutes (includes pasta cooking)');

// Test 4: Base Meal Time Factors
console.log('\n4️⃣ Test: Base Meal Time Factors');
const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

mealTypes.forEach(mealType => {
  const baseFactors = calculator.createBaseMealTimeFactors(mealType, 3);
  const result = calculator.calculateTotalTime(baseFactors, 3);
  console.log(`${mealType.toUpperCase()}: ${result.totalTime} min (${result.prepTime}p + ${result.activeTime}a + ${result.passiveTime}passive)`);
});

// Test 5: Chopping Time Estimation
console.log('\n5️⃣ Test: Ingredient Analysis');
const testIngredients = [
  ["eggs", "butter"], // Minimal chopping
  ["onion", "garlic", "carrot", "celery"], // Medium chopping  
  ["onion", "garlic", "tomato", "potato", "pepper", "mushroom", "herbs"] // Heavy chopping
];

testIngredients.forEach((ingredients, index) => {
  const timeFactors = calculator.estimateFromRecipeDescription(
    "Test recipe",
    ingredients,
    ["Step 1", "Step 2"],
    'dinner'
  );
  console.log(`Ingredient Set ${index + 1}: ${ingredients.join(', ')}`);
  console.log(`  Chopping Time: ${timeFactors.prepWork.chopping} minutes`);
});

// Test 6: Difficulty Multiplier Impact
console.log('\n6️⃣ Test: Difficulty Multiplier Impact');
const baseTime: CookingTimeFactors = {
  prepWork: { chopping: 5, marinating: 0, mixing: 3, setup: 2 },
  activeTime: { cooking: 10, monitoring: 3 },
  passiveTime: { baking: 0, simmering: 0, resting: 0 }
};

for (let difficulty = 1; difficulty <= 5; difficulty++) {
  const result = calculator.calculateTotalTime(baseTime, difficulty);
  console.log(`Difficulty ${difficulty}: ${result.totalTime} min total (${result.prepTime}p + ${result.activeTime}a)`);
}

console.log('\n✅ EnhancedCookingTimeCalculator Test Complete!');
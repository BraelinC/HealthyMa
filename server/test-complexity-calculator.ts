/**
 * Test Script for RecipeComplexityCalculator
 */

import { RecipeComplexityCalculator } from './recipeComplexityCalculator';
import { RecipeComplexityFactors } from './recipeIntelligenceTypes';

// Create test instance
const calculator = new RecipeComplexityCalculator();

console.log('🧪 Testing RecipeComplexityCalculator');
console.log('=' .repeat(50));

// Test 1: Simple scrambled eggs (should be difficulty 1-2)
console.log('\n1️⃣ Test: Simple Scrambled Eggs');
const scrambledEggsFactors: RecipeComplexityFactors = {
  techniqueComplexity: 1,        // Just mixing and heating
  ingredientCount: 3,            // eggs, butter, salt
  equipmentRequired: ['stovetop'],
  timingCritical: false,
  multiStep: false,
  skillRequired: ['mixing', 'heating']
};

const scrambledEggsComplexity = calculator.calculateComplexity(scrambledEggsFactors);
console.log('Factors:', scrambledEggsFactors);
console.log('Calculated Complexity:', scrambledEggsComplexity);
console.log('Expected: 1-2');

// Test 2: Chicken Parmesan (should be difficulty 3-4)
console.log('\n2️⃣ Test: Chicken Parmesan');
const chickenParmFactors: RecipeComplexityFactors = {
  techniqueComplexity: 3,        // Breading, frying, baking
  ingredientCount: 8,            // chicken, flour, eggs, breadcrumbs, cheese, sauce, oil, seasonings
  equipmentRequired: ['stovetop', 'oven'],
  timingCritical: true,          // Don't overcook chicken
  multiStep: true,               // Bread, fry, then bake
  skillRequired: ['breading', 'frying', 'temperature_control']
};

const chickenParmComplexity = calculator.calculateComplexity(chickenParmFactors);
console.log('Factors:', chickenParmFactors);
console.log('Calculated Complexity:', chickenParmComplexity);
console.log('Expected: 3-4');

// Test 3: Beef Wellington (should be difficulty 5)
console.log('\n3️⃣ Test: Beef Wellington');
const beefWellingtonFactors: RecipeComplexityFactors = {
  techniqueComplexity: 5,        // Searing, pastry work, timing
  ingredientCount: 12,           // beef, pastry, mushrooms, herbs, etc.
  equipmentRequired: ['stovetop', 'oven', 'food_processor'],
  timingCritical: true,          // Critical temperature control
  multiStep: true,               // Multiple complex steps
  skillRequired: ['searing', 'pastry_work', 'temperature_control', 'precise_timing']
};

const beefWellingtonComplexity = calculator.calculateComplexity(beefWellingtonFactors);
console.log('Factors:', beefWellingtonFactors);
console.log('Calculated Complexity:', beefWellingtonComplexity);
console.log('Expected: 5');

// Test 4: Technique Analysis
console.log('\n4️⃣ Test: Technique Analysis');
const testDescription = "Sauté onions until golden, then add garlic and cook for 1 minute. Add wine to deglaze the pan, then simmer until reduced by half.";
const testIngredients = ["onions", "garlic", "white wine", "butter"];

const techniqueAnalysis = calculator.analyzeTechniques(testDescription, testIngredients);
console.log('Description:', testDescription);
console.log('Ingredients:', testIngredients);
console.log('Found Techniques:', techniqueAnalysis.techniques);
console.log('Average Complexity:', techniqueAnalysis.avgComplexity);
console.log('Expected techniques: sautéing, reduction, knife_skills');

// Test 5: Recipe Text Analysis
console.log('\n5️⃣ Test: Recipe Text Analysis');
const testRecipe = {
  description: "Pan-seared chicken breast with garlic butter sauce",
  ingredients: ["chicken breast", "garlic", "butter", "thyme", "salt", "pepper"],
  instructions: [
    "Season chicken with salt and pepper",
    "Heat oil in a large skillet over medium-high heat",
    "Sear chicken for 6-7 minutes per side until golden brown",
    "Remove chicken and let rest",
    "Add garlic to pan and cook for 30 seconds",
    "Add butter and thyme, stir to make sauce",
    "Return chicken to pan and coat with sauce"
  ]
};

const estimatedFactors = calculator.estimateComplexityFromText(
  testRecipe.description,
  testRecipe.ingredients,
  testRecipe.instructions
);

console.log('Recipe:', testRecipe.description);
console.log('Estimated Factors:', estimatedFactors);

const estimatedComplexity = calculator.calculateComplexity(estimatedFactors);
console.log('Estimated Complexity:', estimatedComplexity);
console.log('Expected: 2-3 (pan searing + sauce making)');

// Test 6: Difficulty Level Details
console.log('\n6️⃣ Test: Difficulty Level Details');
for (let i = 1; i <= 5; i++) {
  const difficultyLevel = calculator.getDifficultyLevel(i);
  console.log(`Level ${i}: ${difficultyLevel.description} (${difficultyLevel.timeMultiplier}x time)`);
}

console.log('\n✅ RecipeComplexityCalculator Test Complete!');
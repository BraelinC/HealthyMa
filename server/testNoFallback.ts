import { groqIngredientParser } from './groqIngredientParser';
import { usdaNutritionService } from './usdaNutritionService';
import { recipeNutritionCalculator } from './recipeNutritionCalculator';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env is loaded from project root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function testNoFallback() {
  console.log('\n=== Testing Nutrition System Without Fallbacks ===\n');
  
  const testIngredients = [
    '1/2 teaspoon sugar',
    '1/4 teaspoon salt',
    '2 tablespoons mayonnaise',
    '4 large eggs',
    '4 slices white bread',
    '1 tablespoon xyzabc123'  // Fake ingredient that won't exist in USDA
  ];

  console.log('Ingredients to test:');
  testIngredients.forEach(ing => console.log(`  - ${ing}`));
  
  // Test 1: Parse ingredients
  console.log('\n--- Parsing Ingredients ---');
  const parsed = await groqIngredientParser.parseIngredients(testIngredients);
  
  if (parsed.length === 0) {
    console.log('❌ No ingredients could be parsed (Groq unavailable)');
    return;
  }
  
  console.log(`✅ Parsed ${parsed.length} ingredients`);
  parsed.forEach(p => {
    console.log(`  ${p.ingredient}: ${p.amount} (${p.quantity} ${p.unit})`);
  });
  
  // Test 2: Look up nutrition for each
  console.log('\n--- Looking Up Nutrition Data ---');
  let foundCount = 0;
  let notFoundCount = 0;
  
  for (const ingredient of parsed) {
    const nutrition = await usdaNutritionService.getNutritionData(
      ingredient.ingredient,
      ingredient.quantity,
      ingredient.unit
    );
    
    if (nutrition) {
      console.log(`✅ ${ingredient.ingredient}: ${nutrition.calories} cal`);
      foundCount++;
    } else {
      console.log(`❌ ${ingredient.ingredient}: NO USDA DATA`);
      notFoundCount++;
    }
  }
  
  console.log(`\nSummary: ${foundCount} found, ${notFoundCount} not found`);
  
  // Test 3: Calculate recipe nutrition
  console.log('\n--- Calculating Recipe Nutrition ---');
  const recipeNutrition = await recipeNutritionCalculator.calculateRecipeNutrition(
    testIngredients,
    2 // servings
  );
  
  if (recipeNutrition) {
    console.log('✅ Nutrition calculation succeeded');
    console.log(`  Per serving: ${recipeNutrition.perServing.calories} calories`);
    console.log(`  Data coverage: ${recipeNutrition.ingredientBreakdown.length}/${testIngredients.length} ingredients`);
  } else {
    console.log('❌ Nutrition calculation failed (insufficient USDA data)');
  }
}

// Run test
testNoFallback().catch(console.error);
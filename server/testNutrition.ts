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

async function testIngredientParsing() {
  console.log('\n=== Testing Ingredient Parsing ===\n');
  
  const testIngredients = [
    '½ teaspoon sugar',
    '¼ teaspoon salt',
    '⅛ teaspoon white pepper',
    '2 tablespoons mayonnaise',
    '4 large eggs',
    '4 slices white bread'
  ];

  console.log('Input ingredients:');
  testIngredients.forEach(ing => console.log(`  - ${ing}`));
  
  const parsed = await groqIngredientParser.parseIngredients(testIngredients);
  
  console.log('\nParsed results:');
  console.log(groqIngredientParser.formatAsTable(parsed));
  
  return parsed;
}

async function testNutritionLookup() {
  console.log('\n=== Testing USDA Nutrition Lookup ===\n');
  
  const testFoods = ['sugar', 'eggs', 'mayonnaise', 'white bread'];
  
  for (const food of testFoods) {
    const nutrition = await usdaNutritionService.getNutritionData(food, 100, 'g');
    
    if (nutrition) {
      console.log(`\n${food} (per 100g):`);
      console.log(`  Calories: ${nutrition.calories}`);
      console.log(`  Protein: ${nutrition.protein}g`);
      console.log(`  Carbs: ${nutrition.carbs}g`);
      console.log(`  Fat: ${nutrition.fat}g`);
    } else {
      console.log(`\n${food}: No nutrition data found`);
    }
  }
}

async function testFullRecipeCalculation() {
  console.log('\n=== Testing Full Recipe Nutrition Calculation ===\n');
  
  const eggSandwichIngredients = [
    '½ teaspoon sugar',
    '¼ teaspoon salt',
    '⅛ teaspoon white pepper',
    '2 tablespoons mayonnaise',
    '4 large eggs',
    '4 slices white bread',
    '2 tablespoons butter'
  ];
  
  console.log('Recipe: Japanese Egg Sandwich (Tamago Sando)');
  console.log('Servings: 2');
  console.log('\nIngredients:');
  eggSandwichIngredients.forEach(ing => console.log(`  - ${ing}`));
  
  const nutrition = await recipeNutritionCalculator.calculateRecipeNutrition(
    eggSandwichIngredients,
    2 // servings
  );
  
  if (nutrition) {
    console.log('\n=== Nutrition Results ===');
    console.log('\nPer Serving:');
    console.log(recipeNutritionCalculator.formatNutritionSummary(nutrition.perServing));
    
    console.log('\nTotal Recipe:');
    console.log(recipeNutritionCalculator.formatNutritionSummary(nutrition.total));
    
    console.log('\n=== Ingredient Breakdown ===');
    nutrition.ingredientBreakdown.forEach(item => {
      console.log(`\n${item.ingredient} (${item.amount}):`);
      console.log(`  Calories: ${item.nutrition.calories}`);
      console.log(`  Protein: ${item.nutrition.protein}g`);
      console.log(`  Carbs: ${item.nutrition.carbs}g`);
      console.log(`  Fat: ${item.nutrition.fat}g`);
    });
  } else {
    console.log('\nFailed to calculate nutrition');
  }
}

async function testChickenRecipe() {
  console.log('\n=== Testing Grilled Chicken Recipe ===\n');
  
  const chickenIngredients = [
    '4 chicken breasts',
    '2 tablespoons olive oil',
    '1 teaspoon salt',
    '½ teaspoon black pepper',
    '2 cloves garlic, minced',
    '1 tablespoon lemon juice',
    '1 teaspoon dried oregano'
  ];
  
  console.log('Recipe: Grilled Chicken');
  console.log('Servings: 4');
  console.log('\nIngredients:');
  chickenIngredients.forEach(ing => console.log(`  - ${ing}`));
  
  const nutrition = await recipeNutritionCalculator.calculateRecipeNutrition(
    chickenIngredients,
    4 // servings
  );
  
  if (nutrition) {
    console.log('\n=== Nutrition Per Serving ===');
    console.log(recipeNutritionCalculator.formatNutritionSummary(nutrition.perServing));
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Nutrition System Tests\n');
  
  try {
    // Test 1: Ingredient parsing
    await testIngredientParsing();
    
    // Test 2: USDA nutrition lookup
    if (process.env.USDA_API_KEY) {
      await testNutritionLookup();
    } else {
      console.log('\n⚠️ Skipping USDA tests - no API key found');
    }
    
    // Test 3: Full recipe calculation
    await testFullRecipeCalculation();
    
    // Test 4: Another recipe
    await testChickenRecipe();
    
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

// Run tests
runTests();
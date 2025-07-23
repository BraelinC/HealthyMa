/**
 * Test Script for IntelligentRecipeAnalyzer
 */

import { IntelligentRecipeAnalyzer } from './intelligentRecipeAnalyzer';

// Create test instance
const analyzer = new IntelligentRecipeAnalyzer();

console.log('🧪 Testing IntelligentRecipeAnalyzer');
console.log('=' .repeat(50));

// Test 1: Analyze different meal types
console.log('\n1️⃣ Test: Meal Type Analysis');
const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

mealTypes.forEach(mealType => {
  const analysis = analyzer.analyzeRecipeRequirements(
    mealType,
    'american',     // cuisine
    30,             // max cook time
    3,              // target difficulty
    []              // dietary restrictions
  );
  
  console.log(`\n${mealType.toUpperCase()}:`);
  console.log(`  Complexity: ${analysis.complexity}/5`);
  console.log(`  Estimated Time: ${analysis.estimatedTime} min`);
  console.log(`  Feasible: ${analysis.feasible}`);
  console.log(`  Time Breakdown: ${analysis.timeBreakdown.slice(0,3).join(', ')}`);
  if (analysis.recommendations.length > 0) {
    console.log(`  Recommendations: ${analysis.recommendations[0]}`);
  }
});

// Test 2: Cuisine Complexity Impact
console.log('\n2️⃣ Test: Cuisine Complexity Impact');
const cuisines = ['american', 'italian', 'chinese', 'french', 'indian'];

cuisines.forEach(cuisine => {
  const analysis = analyzer.analyzeRecipeRequirements(
    'dinner',
    cuisine,
    45,             // max cook time
    3,              // target difficulty
    []              // dietary restrictions
  );
  
  console.log(`${cuisine.toUpperCase()}: Complexity ${analysis.complexity}/5, Time ${analysis.estimatedTime}min`);
});

// Test 3: Dietary Restrictions Impact
console.log('\n3️⃣ Test: Dietary Restrictions Impact');
const dietaryOptions = [
  [],
  ['vegetarian'],
  ['vegan'],
  ['gluten-free'],
  ['keto'],
  ['vegan', 'gluten-free'] // Multiple restrictions
];

dietaryOptions.forEach((restrictions, index) => {
  const analysis = analyzer.analyzeRecipeRequirements(
    'dinner',
    'american',
    30,
    3,
    restrictions
  );
  
  const restrictionLabel = restrictions.length > 0 ? restrictions.join(' + ') : 'none';
  console.log(`${restrictionLabel}: Complexity ${analysis.complexity}/5, Time ${analysis.estimatedTime}min`);
});

// Test 4: Time Constraint Analysis
console.log('\n4️⃣ Test: Time Constraint Analysis');
const timeConstraints = [15, 30, 45, 60];

timeConstraints.forEach(maxTime => {
  const analysis = analyzer.analyzeRecipeRequirements(
    'dinner',
    'italian',
    maxTime,
    3,
    []
  );
  
  console.log(`Max ${maxTime}min: ${analysis.feasible ? '✅' : '❌'} (${analysis.estimatedTime}min estimated)`);
  if (!analysis.feasible && analysis.recommendations.length > 0) {
    console.log(`  → ${analysis.recommendations[0]}`);
  }
});

// Test 5: Full Meal Plan Analysis
console.log('\n5️⃣ Test: Full Meal Plan Analysis');
const sampleFilters = {
  numDays: 2,
  mealsPerDay: 3,
  cookTime: 35,
  difficulty: 3,
  culturalBackground: ['italian', 'mexican'],
  dietaryRestrictions: 'vegetarian',
  primaryGoal: 'Save Money'
};

async function testMealPlanAnalysis() {
  const mealPlanAnalysis = await analyzer.analyzeMealPlanRequirements(sampleFilters);
  
  console.log('Meal Plan Requirements Analysis:');
  Object.entries(mealPlanAnalysis).forEach(([mealType, analysis]) => {
    console.log(`  ${mealType}: ${analysis.targetComplexity}/5 complexity, ${analysis.estimatedTime}min, feasible: ${analysis.feasible}`);
  });
}

await testMealPlanAnalysis();

// Test 6: Complexity Guidance Generation
console.log('\n6️⃣ Test: Complexity Guidance Generation');
for (let difficulty = 1; difficulty <= 5; difficulty++) {
  const guidance = analyzer.generateComplexityGuidance(difficulty);
  console.log(`Difficulty ${difficulty} guidance:${guidance.substring(0, 100)}...`);
}

// Test 7: Existing Recipe Analysis
console.log('\n7️⃣ Test: Existing Recipe Analysis');
const testRecipe = {
  title: "Pan-Seared Chicken with Lemon Garlic Sauce",
  ingredients: [
    "4 chicken breasts",
    "2 cloves garlic",
    "1 lemon",
    "2 tbsp butter",
    "1 tbsp olive oil",
    "salt and pepper",
    "fresh thyme"
  ],
  instructions: [
    "Season chicken with salt and pepper",
    "Heat oil in large skillet over medium-high heat",
    "Cook chicken 6-7 minutes per side until golden",
    "Remove chicken and let rest",
    "Add garlic to pan, cook 30 seconds",
    "Add lemon juice and butter, whisk to combine",
    "Return chicken to pan and coat with sauce",
    "Garnish with thyme and serve"
  ],
  cookTime: 25,
  difficulty: 3,
  description: "Simple pan-seared chicken with a bright lemon garlic sauce"
};

const recipeAnalysis = analyzer.analyzeExistingRecipe(testRecipe);
console.log('Recipe Analysis Results:');
console.log(`  Predicted Complexity: ${recipeAnalysis.predictedComplexity}/5 (actual: ${testRecipe.difficulty}/5)`);
console.log(`  Predicted Time: ${recipeAnalysis.predictedTime}min (actual: ${testRecipe.cookTime}min)`);
console.log(`  Time Accurate: ${recipeAnalysis.accuracyAssessment.timeAccurate ? '✅' : '❌'}`);
console.log(`  Complexity Accurate: ${recipeAnalysis.accuracyAssessment.complexityAccurate ? '✅' : '❌'}`);
console.log(`  Time Difference: ${recipeAnalysis.accuracyAssessment.timeDifference}min`);
console.log(`  Complexity Difference: ${recipeAnalysis.accuracyAssessment.complexityDifference} levels`);

console.log('\n✅ IntelligentRecipeAnalyzer Test Complete!');
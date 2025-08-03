/**
 * Test Script for EnhancedRecipeGenerationService
 */

import { EnhancedRecipeGenerationService } from './enhancedRecipeGenerationService';

// Create test instance
const service = new EnhancedRecipeGenerationService();

console.log('🧪 Testing EnhancedRecipeGenerationService');
console.log('=' .repeat(50));

// Test 1: Basic Meal Plan Generation
console.log('\n1️⃣ Test: Basic Meal Plan Generation');
const basicFilters = {
  numDays: 2,
  mealsPerDay: 2,
  cookTime: 30,
  difficulty: 3,
  primaryGoal: 'Save Money',
  familySize: 4,
  profileType: 'family' as const,
  culturalBackground: ['italian'],
  dietaryRestrictions: 'vegetarian',
  encourageOverlap: true
};

async function testBasicGeneration() {
  const result = await service.generateMealPlan(basicFilters);
  
  console.log('Generation Result:');
  console.log(`Success: ${result.success}`);
  console.log(`Generated at: ${result.metadata.generatedAt.toLocaleTimeString()}`);
  console.log(`Calculator Version: ${result.metadata.calculatorVersion}`);
  console.log(`Timing Accuracy: ${result.metadata.timingAccuracy}%`);
  console.log(`Complexity Validation: ${result.metadata.complexityValidation}%`);
  
  if (result.success && result.data) {
    console.log('\nSample Meal:');
    const firstDay = Object.keys(result.data.meal_plan)[0];
    const firstMeal = Object.keys(result.data.meal_plan[firstDay])[0];
    const meal = result.data.meal_plan[firstDay][firstMeal];
    
    console.log(`${firstMeal}: ${meal.title}`);
    console.log(`  Time: ${meal.cook_time_minutes}min (${meal.time_breakdown})`);
    console.log(`  Difficulty: ${meal.difficulty}/5`);
    console.log(`  Validation: Time=${meal.validation?.timeAccurate ? '✅' : '❌'}, Complexity=${meal.validation?.complexityAccurate ? '✅' : '❌'}`);
  }
  
  console.log('\nPre-Analysis Summary:');
  Object.entries(result.metadata.preAnalysis).forEach(([mealType, analysis]) => {
    console.log(`  ${mealType}: ${analysis.targetComplexity}/5 complexity, ${analysis.estimatedTime}min, feasible: ${analysis.feasible}`);
  });
}

await testBasicGeneration();

// Test 2: Quick Breakfast Generation
console.log('\n2️⃣ Test: Quick Breakfast Generation');
const quickBreakfastFilters = {
  numDays: 1,
  mealsPerDay: 1,
  cookTime: 10,
  difficulty: 1,
  primaryGoal: 'Save Time',
  profileType: 'individual' as const,
  prepTimePreference: 'minimal' as const
};

async function testQuickBreakfast() {
  const result = await service.generateMealPlan(quickBreakfastFilters);
  console.log(`Quick Breakfast - Success: ${result.success}, Timing Accuracy: ${result.metadata.timingAccuracy}%`);
  
  if (result.success) {
    const analysis = result.metadata.preAnalysis;
    console.log('Pre-analysis for breakfast:');
    Object.entries(analysis).forEach(([meal, data]) => {
      console.log(`  ${meal}: ${data.estimatedTime}min (feasible: ${data.feasible})`);
      if (data.recommendations.length > 0) {
        console.log(`    → ${data.recommendations[0]}`);
      }
    });
  }
}

await testQuickBreakfast();

// Test 3: Complex Dinner Generation
console.log('\n3️⃣ Test: Complex Dinner Generation');
const complexDinnerFilters = {
  numDays: 1,
  mealsPerDay: 1,
  cookTime: 60,
  difficulty: 5,
  primaryGoal: 'Eat Healthier',
  culturalBackground: ['french'],
  profileType: 'individual' as const,
  prepTimePreference: 'enjoys_cooking' as const
};

async function testComplexDinner() {
  const result = await service.generateMealPlan(complexDinnerFilters);
  console.log(`Complex Dinner - Success: ${result.success}, Complexity Validation: ${result.metadata.complexityValidation}%`);
  
  if (result.success) {
    const analysis = result.metadata.preAnalysis;
    Object.entries(analysis).forEach(([meal, data]) => {
      console.log(`  ${meal}: Complexity ${data.targetComplexity}/5, Time ${data.estimatedTime}min`);
      console.log(`    Breakdown: ${data.timeBreakdown.slice(0, 2).join(', ')}`);
    });
  }
}

await testComplexDinner();

// Test 4: System Message Generation
console.log('\n4️⃣ Test: System Message Generation');
const systemMessage = service.buildSystemMessage(basicFilters);
console.log('System Message Preview:');
console.log(systemMessage.substring(0, 200) + '...');
console.log(`Full length: ${systemMessage.length} characters`);

// Test 5: Dietary Restrictions Handling
console.log('\n5️⃣ Test: Dietary Restrictions Handling');
const dietaryFilters = [
  { dietaryRestrictions: 'vegan', culturalBackground: ['chinese'] },
  { dietaryRestrictions: 'gluten-free', culturalBackground: ['italian'] },
  { dietaryRestrictions: 'keto', culturalBackground: ['american'] }
];

for (const dietary of dietaryFilters) {
  const filters = {
    numDays: 1,
    mealsPerDay: 1,
    cookTime: 30,
    difficulty: 3,
    ...dietary
  };
  
  const result = await service.generateMealPlan(filters);
  console.log(`${dietary.dietaryRestrictions} + ${dietary.culturalBackground[0]}: Success ${result.success}`);
  
  if (result.success) {
    const dinnerAnalysis = result.metadata.preAnalysis.dinner || result.metadata.preAnalysis.breakfast;
    console.log(`  Complexity: ${dinnerAnalysis?.targetComplexity}/5, Feasible: ${dinnerAnalysis?.feasible}`);
  }
}

// Test 6: Error Handling
console.log('\n6️⃣ Test: Error Handling');
const invalidFilters = {
  numDays: 0,  // Invalid
  mealsPerDay: 5,  // Too many
  cookTime: -10,  // Invalid
  difficulty: 10  // Invalid
};

async function testErrorHandling() {
  try {
    const result = await service.generateMealPlan(invalidFilters);
    console.log(`Error handling - Success: ${result.success}`);
    if (!result.success) {
      console.log(`Error message: ${result.error}`);
    }
  } catch (error) {
    console.log('Caught error:', error instanceof Error ? error.message : 'Unknown error');
  }
}

await testErrorHandling();

console.log('\n✅ EnhancedRecipeGenerationService Test Complete!');
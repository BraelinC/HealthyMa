/**
 * Test Script for Enhanced Integration with intelligentPromptBuilder
 */

import { 
  generateEnhancedMealPlan, 
  buildEnhancedIntelligentPrompt, 
  validateEnhancedMealPlan,
  generateStandardMealPlan,
  buildIntelligentPrompt
} from './intelligentPromptBuilder';

console.log('🧪 Testing Enhanced Integration');
console.log('=' .repeat(50));

// Test 1: Compare Standard vs Enhanced Prompt Building
console.log('\n1️⃣ Test: Standard vs Enhanced Prompt Comparison');
const testFilters = {
  numDays: 2,
  mealsPerDay: 2,
  cookTime: 25,
  difficulty: 3,
  primaryGoal: 'Save Money',
  culturalBackground: ['italian'],
  dietaryRestrictions: 'vegetarian'
};

async function testPromptComparison() {
  console.log('Building Standard Prompt:');
  const standardPrompt = buildIntelligentPrompt(testFilters);
  console.log(`Length: ${standardPrompt.length} characters`);
  console.log('Preview:', standardPrompt.substring(0, 150) + '...');
  
  console.log('\nBuilding Enhanced Prompt:');
  const enhancedPrompt = await buildEnhancedIntelligentPrompt(testFilters);
  console.log(`Length: ${enhancedPrompt.length} characters`);
  console.log('Preview:', enhancedPrompt.substring(0, 150) + '...');
  
  console.log(`\nEnhancement: +${enhancedPrompt.length - standardPrompt.length} characters`);
  
  // Check for enhanced features
  const hasEnhancedGuidance = enhancedPrompt.includes('🧠 ENHANCED MEAL-SPECIFIC GUIDANCE');
  const hasTimeRequirements = enhancedPrompt.includes('⏱️ ENHANCED TIME ACCURACY REQUIREMENTS');
  console.log(`Enhanced features: ${hasEnhancedGuidance ? '✅' : '❌'} Meal Guidance, ${hasTimeRequirements ? '✅' : '❌'} Time Requirements`);
}

await testPromptComparison();

// Test 2: Enhanced vs Standard Generation
console.log('\n2️⃣ Test: Enhanced vs Standard Generation');

async function testGenerationComparison() {
  console.log('Standard Generation:');
  const standardResult = generateStandardMealPlan(testFilters);
  console.log(`Success: ${standardResult.success}, Enhanced: ${standardResult.metadata.enhancedSystem}`);
  
  console.log('\nEnhanced Generation:');
  const enhancedResult = await generateEnhancedMealPlan(testFilters);
  console.log(`Success: ${enhancedResult.success}, Enhanced: ${enhancedResult.metadata.enhancedSystem}`);
  console.log(`Timing Accuracy: ${enhancedResult.metadata.timingAccuracy}%`);
  console.log(`Complexity Validation: ${enhancedResult.metadata.complexityValidation}%`);
  console.log(`Pre-Analysis Used: ${enhancedResult.metadata.preAnalysisUsed}`);
}

await testGenerationComparison();

// Test 3: Meal Plan Validation
console.log('\n3️⃣ Test: Meal Plan Validation');
const mockMealPlan = {
  meal_plan: {
    day_1: {
      breakfast: {
        title: "Scrambled Eggs",
        cook_time_minutes: 12,
        difficulty: 1,
        time_breakdown: "3 min prep + 9 min cook",
        ingredients: ["eggs", "butter"],
        instructions: ["Scramble eggs"]
      },
      lunch: {
        title: "Complex Pasta",
        cook_time_minutes: 45, // Exceeds 25min limit
        difficulty: 4, // Exceeds difficulty 3
        // Missing time_breakdown
        ingredients: ["pasta", "sauce"],
        instructions: ["Cook pasta"]
      }
    }
  }
};

const validation = validateEnhancedMealPlan(mockMealPlan, testFilters);
console.log('Validation Results:');
console.log(`Valid: ${validation.isValid}`);
console.log(`Timing Accuracy: ${validation.accuracy.timingAccuracy}%`);
console.log(`Complexity Accuracy: ${validation.accuracy.complexityAccuracy}%`);
console.log(`Issues: ${validation.issues.length}`);
validation.issues.forEach(issue => console.log(`  - ${issue}`));
console.log(`Suggestions: ${validation.suggestions.length}`);
validation.suggestions.forEach(suggestion => console.log(`  - ${suggestion}`));

// Test 4: Different Goal Types
console.log('\n4️⃣ Test: Different Goal Types');
const goalTypes = [
  { primaryGoal: 'Save Money', cookTime: 30 },
  { primaryGoal: 'Save Time', cookTime: 15 },
  { primaryGoal: 'Eat Healthier', cookTime: 45 }
];

for (const goal of goalTypes) {
  const filters = {
    numDays: 1,
    mealsPerDay: 1,
    difficulty: 2,
    ...goal
  };
  
  const result = await generateEnhancedMealPlan(filters);
  console.log(`${goal.primaryGoal}: Success ${result.success}, Timing ${result.metadata.timingAccuracy}%`);
}

// Test 5: Family vs Individual Profiles
console.log('\n5️⃣ Test: Family vs Individual Profiles');
const profileTypes = [
  {
    profileType: 'individual' as const,
    mealsPerDay: 2,
    cookTime: 20
  },
  {
    profileType: 'family' as const,
    familySize: 4,
    mealsPerDay: 3,
    cookTime: 35
  }
];

for (const profile of profileTypes) {
  const filters = {
    numDays: 1,
    difficulty: 3,
    primaryGoal: 'Save Money',
    ...profile
  };
  
  const result = await generateEnhancedMealPlan(filters);
  console.log(`${profile.profileType}: Success ${result.success}, Pre-analysis meals: ${Object.keys(result.metadata.preAnalysis).join(', ')}`);
}

// Test 6: Error Handling and Fallback
console.log('\n6️⃣ Test: Error Handling and Fallback');
const problematicFilters = {
  numDays: 1,
  mealsPerDay: 1,
  cookTime: 5, // Very restrictive
  difficulty: 5, // High difficulty with low time
  dietaryRestrictions: 'vegan',
  culturalBackground: ['molecular'] // Complex cuisine
};

async function testErrorHandling() {
  try {
    const result = await generateEnhancedMealPlan(problematicFilters);
    console.log(`Challenging scenario: Success ${result.success}`);
    console.log(`Enhanced system used: ${result.metadata.enhancedSystem}`);
    
    if (result.success && result.metadata.preAnalysis) {
      const analysis = Object.values(result.metadata.preAnalysis)[0] as any;
      console.log(`Feasible: ${analysis.feasible}, Recommendations: ${analysis.recommendations.length}`);
    }
  } catch (error) {
    console.log('Error caught:', error instanceof Error ? error.message : 'Unknown');
  }
}

await testErrorHandling();

console.log('\n✅ Enhanced Integration Test Complete!');
/**
 * Debug V2 Integration Issues
 */

import { buildWeightBasedIntelligentPrompt } from './server/intelligentPromptBuilderV2.ts';

async function debugV2Integration() {
  console.log('🔍 Debugging V2 Integration...\n');

  try {
    // Test the V2 prompt builder directly
    console.log('1. Testing V2 prompt builder...');
    
    const testFilters = {
      numDays: 3,
      mealsPerDay: 3,
      cookTime: 45,
      difficulty: 3,
      primaryGoal: 'Save Money',
      familySize: 3,
      familyMembers: [],
      profileType: 'individual',
      dietaryRestrictions: 'vegetarian',
      culturalBackground: ['Italian'],
      culturalCuisineData: null,
      availableIngredients: 'rice, chicken, olive oil, tomatoes',
      excludeIngredients: 'beef, pork',
      goalWeights: {
        cost: 0.8,
        health: 0.6,
        cultural: 0.3,
        variety: 0.4,
        time: 0.7
      },
      heroIngredients: ['rice', 'olive oil'],
      weightBasedEnhanced: true
    };

    const goalWeights = testFilters.goalWeights;
    const heroIngredients = testFilters.heroIngredients;

    const prompt = await buildWeightBasedIntelligentPrompt(
      testFilters,
      goalWeights,
      heroIngredients
    );

    console.log('✅ V2 prompt builder test successful');
    console.log(`   - Prompt length: ${prompt.length} characters`);
    console.log(`   - Contains main goal: ${prompt.includes('Save Money')}`);
    console.log(`   - Contains weight priorities: ${prompt.includes('WEIGHT-BASED')}`);
    console.log(`   - Contains hero ingredients: ${prompt.includes('rice')}`);
    
    console.log('\n📝 Sample prompt excerpt:');
    console.log(prompt.substring(0, 500) + '...\n');

  } catch (error) {
    console.error('❌ V2 integration test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

debugV2Integration();
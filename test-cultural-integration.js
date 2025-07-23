import { getCachedCulturalCuisine } from './server/cultureCacheManager.js';

async function testCulturalIntegration() {
  const userId = 3;
  const culturalBackground = ['Peruvian'];
  
  console.log('Testing cultural cuisine integration for user:', userId);
  console.log('Cultural background:', culturalBackground);
  
  try {
    // Force cache the cultural cuisine data
    const culturalData = await getCachedCulturalCuisine(userId, culturalBackground);
    console.log('Cultural cuisine data retrieved:', culturalData);
    
    // Test the meal plan generation with this data
    const testFilters = {
      numDays: 3,
      mealsPerDay: 3,
      cookTime: 30,
      difficulty: 3,
      nutritionGoal: 'general_wellness',
      culturalCuisineData: culturalData,
      culturalBackground: culturalBackground
    };
    
    const { buildIntelligentPrompt } = await import('./server/intelligentPromptBuilder.js');
    const prompt = buildIntelligentPrompt(testFilters);
    
    console.log('\n=== GENERATED PROMPT ===');
    console.log(prompt);
    console.log('\n=== END PROMPT ===');
    
    // Count cultural references
    const peruvianCount = (prompt.match(/peruvian/gi) || []).length;
    const culturalCount = (prompt.match(/cultural/gi) || []).length;
    
    console.log(`\nCultural integration analysis:`);
    console.log(`- Peruvian references: ${peruvianCount}`);
    console.log(`- Cultural references: ${culturalCount}`);
    console.log(`- Has cultural cuisine section: ${prompt.includes('🌍 CULTURAL CUISINE INTEGRATION')}`);
    
  } catch (error) {
    console.error('Error testing cultural integration:', error);
  }
}

testCulturalIntegration();
// Test script to check cultural preferences and Perplexity integration
import { getCachedCulturalCuisine, getCulturalCuisineData } from './server/cultureCacheManager.js';

async function testCulturalPreferences() {
  console.log('🧪 Testing cultural preferences system...');
  
  const userId = 9;
  const culturalBackground = ['Peruvian'];
  
  console.log('\n📊 Testing individual culture data fetch:');
  const peruvianData = await getCulturalCuisineData(userId, 'Peruvian');
  
  if (peruvianData) {
    console.log('✅ Successfully loaded Peruvian cultural data:');
    console.log('- Meals:', peruvianData.meals.map(m => m.name));
    console.log('- Key ingredients:', peruvianData.key_ingredients);
    console.log('- Cooking styles:', peruvianData.styles);
    console.log('- Health benefits:', peruvianData.health_benefits);
    console.log('- Sample meal:', peruvianData.meals[0]);
  } else {
    console.log('❌ Failed to load Peruvian cultural data');
  }
  
  console.log('\n🔄 Testing batch cultural data fetch:');
  const batchData = await getCachedCulturalCuisine(userId, culturalBackground);
  
  if (batchData) {
    console.log('✅ Successfully loaded batch cultural data:');
    console.log('- Loaded cultures:', Object.keys(batchData));
    console.log('- Total meals available:', Object.values(batchData).reduce((sum, data) => sum + data.meals.length, 0));
  } else {
    console.log('❌ Failed to load batch cultural data');
  }
  
  console.log('\n🧪 Test completed');
}

testCulturalPreferences().catch(console.error);
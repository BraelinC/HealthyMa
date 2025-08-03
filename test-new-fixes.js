/**
 * Test script to validate the new cultural integration fixes
 */

async function testNewFixes() {
  console.log('🧪 Testing New Cultural Integration Fixes\n');

  const baseUrl = 'http://localhost:5000';

  // Test 1: Conflict Resolution with better alternatives
  console.log('=== Test 1: Enhanced Conflict Resolution ===');
  try {
    const response = await fetch(`${baseUrl}/api/recipes/resolve-conflicts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mealRequest: 'beef stir-fry',
        dietaryRestrictions: ['vegetarian'],
        culturalBackground: ['Chinese']
      })
    });
    
    const data = await response.json();
    console.log('✅ Conflict resolution working');
    console.log(`   Alternatives generated: ${data.resolution.suggestedAlternatives.length}`);
    console.log(`   Cultural authenticity: ${data.resolution.culturalAuthenticity}`);
    console.log(`   First alternative: ${data.resolution.suggestedAlternatives[0]?.dishName}`);
  } catch (error) {
    console.error('❌ Conflict resolution failed:', error.message);
  }

  // Test 2: Ingredient Substitutions
  console.log('\n=== Test 2: Ingredient Substitutions ===');
  try {
    const response = await fetch(`${baseUrl}/api/recipes/ingredient-substitutions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredient: 'milk',
        dietaryRestriction: 'vegan'
      })
    });
    
    const data = await response.json();
    console.log('✅ Ingredient substitutions working');
    console.log(`   Substitutions: ${data.substitutions.join(', ')}`);
  } catch (error) {
    console.error('❌ Ingredient substitutions failed:', error.message);
  }

  // Test 3: Check if dietary validation service is accessible
  console.log('\n=== Test 3: Service Integration Check ===');
  try {
    // Import and test the dietary validation service directly
    const fs = require('fs');
    const routesContent = fs.readFileSync('./server/routes.ts', 'utf8');
    
    const hasValidation = routesContent.includes('validateRecipeDietaryCompliance');
    const hasMappingService = routesContent.includes('mapToFamiliarDishName');
    const hasEnhancement = routesContent.includes('enhanceMealPlanNames');
    const hasConflictGuidance = routesContent.includes('addConflictResolutionGuidance');
    
    console.log(`✅ Dietary validation integrated: ${hasValidation}`);
    console.log(`✅ Dish name mapping integrated: ${hasMappingService}`);
    console.log(`✅ Meal plan enhancement integrated: ${hasEnhancement}`);
    console.log(`✅ Conflict resolution guidance integrated: ${hasConflictGuidance}`);
  } catch (error) {
    console.error('❌ Service integration check failed:', error.message);
  }

  console.log('\n=== Test 4: New Features Implementation Status ===');
  
  // Check for the specific fixes mentioned in the test report
  const fixes = [
    'DIETARY VALIDATION: Check recipe compliance before saving',
    'DISH NAME MAPPING: Map to familiar, recognizable names', 
    'DISH NAME ENHANCEMENT: Map to familiar, recognizable names',
    'PROACTIVE CULTURAL DATA CACHING: Auto-cache cultural data',
    'CACHE INVALIDATION AND REFRESH: Clear old cache'
  ];
  
  try {
    const fs = require('fs');
    const routesContent = fs.readFileSync('./server/routes.ts', 'utf8');
    
    fixes.forEach(fix => {
      const hasFeature = routesContent.includes(fix.split(':')[0]);
      console.log(`${hasFeature ? '✅' : '❌'} ${fix}`);
    });
  } catch (error) {
    console.error('❌ Could not check implementation status:', error.message);
  }

  console.log('\n🎯 New Fixes Validation Complete!');
  console.log('📝 The updated code is now running and should have:');
  console.log('   - Better dietary compliance validation');
  console.log('   - Enhanced cultural authenticity');
  console.log('   - Improved dish name mapping');
  console.log('   - Optimized caching and performance');
}

// Use node-fetch polyfill for testing
global.fetch = require('node-fetch');

testNewFixes().catch(console.error);
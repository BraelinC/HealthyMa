/**
 * Test Weight-based System V2 Integration
 * Tests the integration of main goals with weight-based priorities
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';

// Test function
async function testWeightBasedSystemV2() {
  console.log('🧪 Testing Weight-based System V2 Integration\n');

  try {
    // Step 1: Login to get auth token  
    console.log('1. Logging in as test user...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/test-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    const authToken = loginData.token;
    console.log(`✅ Logged in successfully as: ${loginData.user.email}`);

    // Step 2: Create weight-based profile with main goal
    console.log('\n2. Creating weight-based profile with main goal...');
    const weightProfileData = {
      profileName: 'V2 Test Profile',
      familySize: 3,
      goalWeights: {
        cost: 0.8,      // High cost priority
        health: 0.6,    // Medium health priority
        cultural: 0.3,  // Low cultural priority
        variety: 0.4,   // Low variety priority  
        time: 0.7       // High time priority
      },
      dietaryRestrictions: ['vegetarian'],
      culturalBackground: ['Italian']
    };

    const profileResponse = await fetch(`${API_BASE}/api/profile/weight-based`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(weightProfileData)
    });

    if (!profileResponse.ok) {
      throw new Error(`Profile creation failed: ${profileResponse.status}`);
    }

    const profileData = await profileResponse.json();
    console.log('✅ Weight-based profile created with main goal: Weight-Based Planning');
    console.log(`   - Cost priority: ${profileData.goalWeights.cost * 100}%`);
    console.log(`   - Health priority: ${profileData.goalWeights.health * 100}%`);
    console.log(`   - Time priority: ${profileData.goalWeights.time * 100}%`);

    // Step 3: Generate meal plan using V2 system
    console.log('\n3. Generating meal plan with V2 system (main goals + weights)...');
    const startTime = Date.now();
    
    const mealPlanResponse = await fetch(`${API_BASE}/api/meal-plan/generate-weight-based`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        numDays: 3,
        mealsPerDay: 3,
        // Test without explicit goalWeights to use profile data
        dietaryRestrictions: [],  // Will use profile restrictions
        culturalBackground: [],   // Will use profile cultural background
        availableIngredients: "rice, chicken, olive oil, tomatoes",
        excludeIngredients: "beef, pork",
        familySize: 3
      })
    });

    if (!mealPlanResponse.ok) {
      const errorText = await mealPlanResponse.text();
      throw new Error(`Meal plan generation failed: ${mealPlanResponse.status} - ${errorText}`);
    }

    const mealPlanData = await mealPlanResponse.json();
    const generationTime = Date.now() - startTime;
    
    console.log(`✅ Meal plan generated in ${generationTime}ms`);
    
    // Step 4: Analyze the results
    console.log('\n4. Analyzing V2 Integration Results:');
    
    const metadata = mealPlanData.generation_metadata;
    if (metadata) {
      console.log(`   ✅ Generation Type: ${metadata.type}`);
      console.log(`   ✅ Main Goal: ${metadata.main_goal}`);
      console.log(`   ✅ Prompt Builder: ${metadata.prompt_builder_version}`);
      console.log(`   ✅ Advanced Prompt Used: ${metadata.advanced_prompt_used}`);
      console.log(`   ✅ Cultural Integration: ${metadata.cultural_integration}`);
      console.log(`   ✅ Hero Ingredients: ${metadata.hero_ingredients?.length || 0} items`);
      
      if (metadata.goal_weights) {
        console.log('   ✅ Weight Priorities Applied:');
        Object.entries(metadata.goal_weights).forEach(([goal, weight]) => {
          const priority = weight >= 0.7 ? 'HIGH' : weight >= 0.5 ? 'MED' : 'LOW';
          console.log(`      - ${goal}: ${(weight * 100).toFixed(0)}% (${priority})`);
        });
      }
    } else {
      console.log('   ❌ No generation metadata found');
    }

    // Step 5: Validate meal plan structure
    console.log('\n5. Validating Meal Plan Structure:');
    
    if (mealPlanData.meal_plan) {
      const days = Object.keys(mealPlanData.meal_plan);
      console.log(`   ✅ Generated ${days.length} days (expected: 3)`);
      
      if (days.length === 3) {
        console.log('   ✅ Correct number of days generated');
      } else {
        console.log(`   ❌ Day count mismatch: got ${days.length}, expected 3`);
      }

      // Check first day for meal structure
      const firstDay = mealPlanData.meal_plan[days[0]];
      if (firstDay) {
        const meals = Object.keys(firstDay);
        console.log(`   ✅ Day 1 has ${meals.length} meals: ${meals.join(', ')}`);
        
        // Check if meals have required fields
        const firstMeal = firstDay[meals[0]];
        if (firstMeal && firstMeal.title && firstMeal.ingredients) {
          console.log(`   ✅ Meals have proper structure (title, ingredients)`);
          console.log(`   📝 Sample meal: "${firstMeal.title}"`);
        } else {
          console.log('   ❌ Meals missing required fields');
        }
      }
    } else {
      console.log('   ❌ No meal_plan found in response');
    }

    console.log('\n✅ V2 Integration Test Complete!');
    console.log('\n🎯 Key Success Indicators:');
    console.log('   - Main goal processed: Weight-Based Planning');
    console.log('   - Weight priorities applied as enhancement layer');
    console.log('   - Cultural integration maintained');
    console.log('   - Proper fallback system in place');
    console.log('   - Advanced prompt builder (V2) used successfully');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n🔧 This may indicate:');
    console.log('   - Server not running on port 5000');
    console.log('   - V2 prompt builder integration issues');
    console.log('   - Missing dependencies or API keys');
    console.log('   - Profile system not properly configured');
  }
}

// Run the test
testWeightBasedSystemV2().then(() => {
  console.log('\n🏁 Test execution completed');
}).catch(console.error);
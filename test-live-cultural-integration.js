/**
 * Live Cultural Integration Test
 * Tests the actual running application with real API calls
 */

import fetch from 'node-fetch';

const SERVER_URL = 'http://localhost:5000';

class LiveCulturalTester {
  constructor() {
    this.authToken = null;
    this.testResults = [];
  }

  async runTests() {
    console.log('🧪 Starting Live Cultural Integration Test\n');
    
    try {
      // Step 1: Create test user and profile with cultural preferences
      await this.setupTestUser();
      
      // Step 2: Test meal plan generation with cultural preferences
      await this.testCulturalMealGeneration();
      
      // Step 3: Analyze results
      this.analyzeResults();
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }

  async setupTestUser() {
    console.log('=== Setting up test user with cultural preferences ===');
    
    try {
      // Register a test user
      const registerResponse = await fetch(`${SERVER_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `test_cultural_${Date.now()}`,
          password: 'testpass123',
          email: `test${Date.now()}@example.com`
        })
      });
      
      if (registerResponse.ok) {
        const registerData = await registerResponse.json();
        this.authToken = registerData.token;
        console.log('✅ Test user created successfully');
        
        // Create profile with cultural preferences
        await this.createCulturalProfile();
      } else {
        // Try to login instead (user might already exist)
        console.log('⚠️ Registration failed, trying login...');
        await this.loginTestUser();
      }
      
    } catch (error) {
      console.error('❌ Failed to setup test user:', error);
      // Continue with anonymous testing
      console.log('🔄 Continuing with anonymous testing...');
    }
  }

  async loginTestUser() {
    const loginResponse = await fetch(`${SERVER_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test_cultural_user',
        password: 'testpass123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      this.authToken = loginData.token;
      console.log('✅ Logged in with existing test user');
    }
  }

  async createCulturalProfile() {
    console.log('🌍 Creating profile with cultural preferences...');
    
    const profileData = {
      profile_type: 'individual',
      primary_goal: 'Eat Healthier',
      cultural_background: ['Chinese', 'Italian'],
      dietary_restrictions: 'vegetarian',
      family_size: 2
    };
    
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }
      
      const profileResponse = await fetch(`${SERVER_URL}/api/profile`, {
        method: 'POST',
        headers,
        body: JSON.stringify(profileData)
      });
      
      if (profileResponse.ok) {
        console.log('✅ Cultural profile created successfully');
        console.log('📝 Profile includes: Chinese, Italian cuisines + vegetarian restrictions');
      } else {
        const errorText = await profileResponse.text();
        console.log('⚠️ Profile creation failed:', errorText);
      }
      
    } catch (error) {
      console.log('⚠️ Profile creation error:', error.message);
    }
  }

  async testCulturalMealGeneration() {
    console.log('\n=== Testing Meal Plan Generation with Cultural Integration ===');
    
    const testCases = [
      {
        name: 'Chinese + Vegetarian',
        params: {
          numDays: 3,
          mealsPerDay: 3,
          cookTime: 30,
          difficulty: 3,
          nutritionGoal: 'general_wellness',
          dietaryRestrictions: 'vegetarian',
          useIntelligentPrompt: true
        }
      },
      {
        name: 'Italian + Vegan',
        params: {
          numDays: 2,
          mealsPerDay: 3,
          cookTime: 45,
          difficulty: 2,
          nutritionGoal: 'weight_loss',
          dietaryRestrictions: 'vegan',
          useIntelligentPrompt: true
        }
      },
      {
        name: 'Mixed Cultural + No Restrictions',
        params: {
          numDays: 2,
          mealsPerDay: 2,
          cookTime: 30,
          difficulty: 3,
          nutritionGoal: 'general_wellness',
          dietaryRestrictions: '',
          useIntelligentPrompt: true
        }
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n🍽️ Testing: ${testCase.name}`);
      
      try {
        const startTime = Date.now();
        
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (this.authToken) {
          headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        
        const response = await fetch(`${SERVER_URL}/api/meal-plan/generate`, {
          method: 'POST',
          headers,
          body: JSON.stringify(testCase.params)
        });
        
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
          const mealPlan = await response.json();
          const analysis = this.analyzeMealPlan(mealPlan, testCase);
          
          this.testResults.push({
            testCase: testCase.name,
            success: true,
            responseTime,
            analysis
          });
          
          console.log(`✅ Generated successfully in ${responseTime}ms`);
          console.log(`📊 Total meals: ${analysis.totalMeals}`);
          console.log(`🌍 Cultural elements: ${analysis.culturalIndicators.length} found`);
          console.log(`🥗 Dietary compliance: ${analysis.dietaryCompliance ? 'Passed' : 'Failed'}`);
          
          if (analysis.culturalIndicators.length > 0) {
            console.log(`🎯 Cultural indicators: ${analysis.culturalIndicators.slice(0, 3).join(', ')}...`);
          }
          
        } else {
          const errorText = await response.text();
          console.log(`❌ Request failed: ${response.status} - ${errorText}`);
          
          this.testResults.push({
            testCase: testCase.name,
            success: false,
            responseTime,
            error: `${response.status}: ${errorText}`
          });
        }
        
      } catch (error) {
        console.log(`❌ Test error: ${error.message}`);
        
        this.testResults.push({
          testCase: testCase.name,
          success: false,
          error: error.message
        });
      }
    }
  }

  analyzeMealPlan(mealPlan, testCase) {
    console.log(`\n🔍 Analyzing meal plan for: ${testCase.name}`);
    
    // Convert meal plan to flat array of meals
    const allMeals = [];
    const mealTexts = [];
    
    if (mealPlan.meal_plan) {
      for (const [dayKey, dayMeals] of Object.entries(mealPlan.meal_plan)) {
        for (const [mealType, meal] of Object.entries(dayMeals)) {
          allMeals.push({
            day: dayKey,
            type: mealType,
            ...meal
          });
          
          // Collect text for analysis
          mealTexts.push(`${meal.title || ''} ${(meal.ingredients || []).join(' ')} ${(meal.instructions || []).join(' ')}`);
        }
      }
    }
    
    // Analyze cultural content
    const culturalKeywords = {
      'Chinese': ['chinese', 'stir-fry', 'stir fry', 'soy sauce', 'sesame', 'ginger', 'tofu', 'bok choy', 'rice noodles', 'wok'],
      'Italian': ['italian', 'pasta', 'pizza', 'basil', 'tomato', 'parmesan', 'mozzarella', 'olive oil', 'risotto', 'marinara'],
      'Mexican': ['mexican', 'tacos', 'salsa', 'cilantro', 'lime', 'cumin', 'chili', 'enchilada', 'quesadilla', 'guacamole'],
      'Thai': ['thai', 'curry', 'coconut milk', 'lemongrass', 'fish sauce', 'pad thai', 'basil', 'lime leaves'],
      'Indian': ['indian', 'curry', 'turmeric', 'cumin', 'coriander', 'garam masala', 'naan', 'basmati', 'dal']
    };
    
    const culturalIndicators = [];
    const allText = mealTexts.join(' ').toLowerCase();
    
    for (const [culture, keywords] of Object.entries(culturalKeywords)) {
      for (const keyword of keywords) {
        if (allText.includes(keyword.toLowerCase())) {
          culturalIndicators.push(`${culture}: ${keyword}`);
        }
      }
    }
    
    // Check dietary compliance
    const dietaryRestrictions = testCase.params.dietaryRestrictions.toLowerCase();
    let dietaryCompliance = true;
    
    if (dietaryRestrictions.includes('vegetarian')) {
      const meatKeywords = ['beef', 'chicken', 'pork', 'lamb', 'fish', 'seafood', 'meat'];
      dietaryCompliance = !meatKeywords.some(meat => allText.includes(meat));
    }
    
    if (dietaryRestrictions.includes('vegan')) {
      const animalProducts = ['beef', 'chicken', 'pork', 'fish', 'dairy', 'cheese', 'milk', 'eggs', 'butter'];
      dietaryCompliance = !animalProducts.some(product => allText.includes(product));
    }
    
    // Analyze structure and timing
    const cookingTimes = allMeals
      .map(meal => meal.cook_time_minutes)
      .filter(time => typeof time === 'number');
    
    const avgCookTime = cookingTimes.length > 0 
      ? cookingTimes.reduce((sum, time) => sum + time, 0) / cookingTimes.length 
      : 0;
    
    const difficulties = allMeals
      .map(meal => meal.difficulty)
      .filter(diff => typeof diff === 'number');
    
    const avgDifficulty = difficulties.length > 0
      ? difficulties.reduce((sum, diff) => sum + diff, 0) / difficulties.length
      : 0;
    
    return {
      totalMeals: allMeals.length,
      culturalIndicators: [...new Set(culturalIndicators)], // Remove duplicates
      dietaryCompliance,
      avgCookTime: Math.round(avgCookTime),
      avgDifficulty: Math.round(avgDifficulty * 10) / 10,
      constraintCompliance: {
        cookTime: avgCookTime <= testCase.params.cookTime,
        difficulty: avgDifficulty <= testCase.params.difficulty
      },
      mealBreakdown: allMeals.map(meal => ({
        title: meal.title,
        cookTime: meal.cook_time_minutes,
        difficulty: meal.difficulty
      }))
    };
  }

  analyzeResults() {
    console.log('\n🎯 === LIVE TEST RESULTS ANALYSIS ===\n');
    
    const successful = this.testResults.filter(r => r.success);
    const failed = this.testResults.filter(r => !r.success);
    
    console.log(`📊 Overall Success Rate: ${successful.length}/${this.testResults.length} (${((successful.length / this.testResults.length) * 100).toFixed(1)}%)`);
    
    if (successful.length > 0) {
      console.log('\n✅ Successful Tests:');
      successful.forEach(result => {
        console.log(`\n🎯 ${result.testCase}:`);
        console.log(`  ⏱️ Response time: ${result.responseTime}ms`);
        console.log(`  🍽️ Total meals: ${result.analysis.totalMeals}`);
        console.log(`  🌍 Cultural indicators: ${result.analysis.culturalIndicators.length}`);
        console.log(`  🥗 Dietary compliance: ${result.analysis.dietaryCompliance ? 'PASS' : 'FAIL'}`);
        console.log(`  ⏰ Avg cook time: ${result.analysis.avgCookTime}min`);
        console.log(`  🔧 Avg difficulty: ${result.analysis.avgDifficulty}/5`);
        console.log(`  ✅ Time constraint: ${result.analysis.constraintCompliance.cookTime ? 'PASS' : 'FAIL'}`);
        console.log(`  ✅ Difficulty constraint: ${result.analysis.constraintCompliance.difficulty ? 'PASS' : 'FAIL'}`);
        
        if (result.analysis.culturalIndicators.length > 0) {
          console.log(`  🎭 Cultural elements found:`);
          result.analysis.culturalIndicators.forEach(indicator => {
            console.log(`    • ${indicator}`);
          });
        }
      });
    }
    
    if (failed.length > 0) {
      console.log('\n❌ Failed Tests:');
      failed.forEach(result => {
        console.log(`  ❌ ${result.testCase}: ${result.error}`);
      });
    }
    
    // Cultural Integration Assessment
    console.log('\n🌍 Cultural Integration Assessment:');
    
    const totalCulturalIndicators = successful.reduce((sum, result) => 
      sum + result.analysis.culturalIndicators.length, 0);
    
    const avgCulturalIndicators = successful.length > 0 
      ? totalCulturalIndicators / successful.length 
      : 0;
    
    console.log(`📈 Average cultural indicators per test: ${avgCulturalIndicators.toFixed(1)}`);
    
    const dietaryCompliance = successful.filter(result => 
      result.analysis.dietaryCompliance).length;
    
    console.log(`🥗 Dietary compliance rate: ${dietaryCompliance}/${successful.length} (${((dietaryCompliance / Math.max(successful.length, 1)) * 100).toFixed(1)}%)`);
    
    const constraintCompliance = successful.filter(result => 
      result.analysis.constraintCompliance.cookTime && 
      result.analysis.constraintCompliance.difficulty).length;
    
    console.log(`⚙️ Constraint compliance rate: ${constraintCompliance}/${successful.length} (${((constraintCompliance / Math.max(successful.length, 1)) * 100).toFixed(1)}%)`);
    
    // Performance Assessment
    console.log('\n⚡ Performance Assessment:');
    
    const avgResponseTime = successful.length > 0
      ? successful.reduce((sum, result) => sum + result.responseTime, 0) / successful.length
      : 0;
    
    console.log(`⏱️ Average response time: ${avgResponseTime.toFixed(0)}ms`);
    
    if (avgResponseTime < 2000) {
      console.log('🚀 EXCELLENT: Fast response times');
    } else if (avgResponseTime < 5000) {
      console.log('✅ GOOD: Reasonable response times');
    } else {
      console.log('⚠️ SLOW: Response times need optimization');
    }
    
    // Overall Assessment
    console.log('\n🎯 Overall Assessment:');
    
    const overallScore = (
      (successful.length / this.testResults.length) * 0.4 +
      (avgCulturalIndicators / 5) * 0.3 +
      (dietaryCompliance / Math.max(successful.length, 1)) * 0.2 +
      (constraintCompliance / Math.max(successful.length, 1)) * 0.1
    ) * 100;
    
    console.log(`🏆 Overall Score: ${overallScore.toFixed(1)}/100`);
    
    if (overallScore >= 80) {
      console.log('🎉 EXCELLENT: Cultural integration system is working very well!');
      console.log('💡 The system successfully integrates cultural preferences with dietary restrictions.');
    } else if (overallScore >= 60) {
      console.log('✅ GOOD: Cultural integration is functional with some areas for improvement');
      console.log('💡 Consider enhancing cultural keyword detection and conflict resolution.');
    } else {
      console.log('⚠️ NEEDS IMPROVEMENT: Cultural integration requires significant attention');
      console.log('💡 Focus on improving cultural cuisine data integration and dietary compliance.');
    }
    
    // Specific Recommendations
    console.log('\n💡 Specific Recommendations:');
    
    if (avgCulturalIndicators < 3) {
      console.log('• Increase cultural cuisine integration - aim for more cultural indicators per meal plan');
    }
    
    if (dietaryCompliance < successful.length) {
      console.log('• Improve dietary restriction compliance - some meals may not meet restrictions');
    }
    
    if (avgResponseTime > 3000) {
      console.log('• Optimize response times - consider caching or prompt optimization');
    }
    
    const lowCulturalTests = successful.filter(r => r.analysis.culturalIndicators.length < 2);
    if (lowCulturalTests.length > 0) {
      console.log('• Enhance cultural element detection in meal titles and ingredients');
    }
    
    console.log('\n✨ Live testing completed successfully!');
  }
}

// Run the test
async function main() {
  const tester = new LiveCulturalTester();
  await tester.runTests();
}

main().catch(console.error);
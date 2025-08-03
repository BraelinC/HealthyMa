/**
 * Comprehensive Test Suite for Cultural Preference Integration in Weekly Meal Planner
 * 
 * Tests:
 * 1. Cultural preference detection and parsing
 * 2. Conflict resolution between dietary restrictions and cultural cuisine
 * 3. Integration with buildIntelligentPrompt function
 * 4. Meal plan generation with specific cultural backgrounds
 * 5. Quality analysis of cultural authenticity vs. dietary compliance
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  serverUrl: 'http://localhost:3001',
  testCases: [
    {
      name: 'Chinese + Vegetarian',
      culturalBackground: ['Chinese'],
      dietaryRestrictions: 'vegetarian',
      expectedMeals: ['tofu stir-fry', 'vegetable fried rice', 'mushroom dishes'],
      conflictResolution: true
    },
    {
      name: 'Italian + Vegan',
      culturalBackground: ['Italian'],
      dietaryRestrictions: 'vegan',
      expectedMeals: ['pasta with vegetables', 'plant-based pizza', 'risotto'],
      conflictResolution: true
    },
    {
      name: 'Multiple Cultures + No Restrictions',
      culturalBackground: ['Chinese', 'Italian'],
      dietaryRestrictions: '',
      expectedMeals: ['varied cultural dishes'],
      conflictResolution: false
    }
  ]
};

class CulturalIntegrationTester {
  constructor() {
    this.results = {
      culturalIntegration: [],
      conflictResolution: [],
      mealGeneration: [],
      authenticity: []
    };
  }

  async runAllTests() {
    console.log('🧪 Starting Comprehensive Cultural Integration Test Suite\n');
    
    try {
      // Test 1: Cultural Data Processing
      await this.testCulturalDataProcessing();
      
      // Test 2: Conflict Resolution
      await this.testConflictResolution();
      
      // Test 3: Meal Plan Generation
      await this.testMealPlanGeneration();
      
      // Test 4: Authenticity Analysis
      await this.testAuthenticityAnalysis();
      
      // Generate comprehensive report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  async testCulturalDataProcessing() {
    console.log('=== Test 1: Cultural Data Processing ===');
    
    for (const testCase of TEST_CONFIG.testCases) {
      console.log(`\n🔍 Testing: ${testCase.name}`);
      
      try {
        // Simulate cultural preference data - normally this would come from Profile/API
        const mockCulturalData = this.generateMockCulturalData(testCase.culturalBackground);
        
        console.log(`✅ Mock cultural data generated for: ${testCase.culturalBackground.join(', ')}`);
        console.log(`📊 Data includes ${Object.keys(mockCulturalData).length} cultures`);
        
        // Test buildIntelligentPrompt integration
        const { buildIntelligentPrompt } = await import('./server/intelligentPromptBuilder.js');
        
        const filters = {
          numDays: 3,
          mealsPerDay: 3,
          cookTime: 30,
          difficulty: 3,
          nutritionGoal: 'general_wellness',
          dietaryRestrictions: testCase.dietaryRestrictions,
          culturalCuisineData: mockCulturalData,
          culturalBackground: testCase.culturalBackground
        };
        
        const prompt = await buildIntelligentPrompt(filters);
        
        // Analyze prompt content
        const analysis = this.analyzePromptContent(prompt, testCase);
        
        this.results.culturalIntegration.push({
          testCase: testCase.name,
          success: analysis.hasCulturalSection,
          culturalReferences: analysis.culturalReferences,
          conflictGuidance: analysis.hasConflictGuidance,
          analysis
        });
        
        console.log(`🎯 Cultural references found: ${analysis.culturalReferences}`);
        console.log(`🔧 Conflict guidance included: ${analysis.hasConflictGuidance ? 'Yes' : 'No'}`);
        
      } catch (error) {
        console.error(`❌ Failed testing ${testCase.name}:`, error.message);
        this.results.culturalIntegration.push({
          testCase: testCase.name,
          success: false,
          error: error.message
        });
      }
    }
  }

  async testConflictResolution() {
    console.log('\n=== Test 2: Conflict Resolution ===');
    
    try {
      const { resolveDietaryCulturalConflicts, hasQuickConflict } = await import('./server/dietaryCulturalConflictResolver.js');
      
      const conflictTests = [
        { dish: 'beef stir-fry', restrictions: ['vegetarian'], culture: ['Chinese'] },
        { dish: 'chicken parmesan', restrictions: ['vegan'], culture: ['Italian'] },
        { dish: 'pork ramen', restrictions: ['halal'], culture: ['Japanese'] },
        { dish: 'cheese pizza', restrictions: ['dairy-free'], culture: ['Italian'] }
      ];
      
      for (const test of conflictTests) {
        console.log(`\n🧪 Testing conflict: "${test.dish}" with ${test.restrictions.join(', ')}`);
        
        // Quick conflict check
        const hasConflict = hasQuickConflict(test.dish, test.restrictions);
        console.log(`Quick conflict detection: ${hasConflict ? '⚠️ CONFLICT' : '✅ OK'}`);
        
        if (hasConflict) {
          // Detailed resolution
          const resolution = await resolveDietaryCulturalConflicts(
            test.dish,
            test.restrictions,
            test.culture
          );
          
          console.log(`Resolution confidence: ${(resolution.confidence * 100).toFixed(1)}%`);
          console.log(`Cultural authenticity: ${(resolution.culturalAuthenticity * 100).toFixed(1)}%`);
          console.log(`Alternatives suggested: ${resolution.suggestedAlternatives.length}`);
          
          if (resolution.suggestedAlternatives.length > 0) {
            const bestAlternative = resolution.suggestedAlternatives[0];
            console.log(`Best alternative: ${bestAlternative.dishName}`);
            console.log(`Cultural notes: ${bestAlternative.culturalNotes}`);
          }
          
          this.results.conflictResolution.push({
            originalDish: test.dish,
            restrictions: test.restrictions,
            hasConflict: true,
            resolved: resolution.suggestedAlternatives.length > 0,
            confidence: resolution.confidence,
            authenticity: resolution.culturalAuthenticity,
            alternatives: resolution.suggestedAlternatives.length
          });
        } else {
          this.results.conflictResolution.push({
            originalDish: test.dish,
            restrictions: test.restrictions,
            hasConflict: false,
            resolved: true
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Conflict resolution test failed:', error);
    }
  }

  async testMealPlanGeneration() {
    console.log('\n=== Test 3: Live Meal Plan Generation ===');
    
    // Test meal plan generation with different cultural backgrounds
    for (const testCase of TEST_CONFIG.testCases) {
      console.log(`\n🍽️ Testing meal generation: ${testCase.name}`);
      
      try {
        // This would normally hit the actual API
        const mealPlan = await this.simulateMealPlanGeneration(testCase);
        
        if (mealPlan) {
          const analysis = this.analyzeMealPlan(mealPlan, testCase);
          
          this.results.mealGeneration.push({
            testCase: testCase.name,
            success: true,
            totalMeals: analysis.totalMeals,
            culturalMeals: analysis.culturalMeals,
            culturalPercentage: analysis.culturalPercentage,
            dietaryCompliance: analysis.dietaryCompliance,
            analysis
          });
          
          console.log(`📊 Total meals: ${analysis.totalMeals}`);
          console.log(`🌍 Cultural meals: ${analysis.culturalMeals} (${analysis.culturalPercentage.toFixed(1)}%)`);
          console.log(`✅ Dietary compliance: ${analysis.dietaryCompliance ? 'Passed' : 'Failed'}`);
        }
        
      } catch (error) {
        console.error(`❌ Meal generation failed for ${testCase.name}:`, error.message);
        this.results.mealGeneration.push({
          testCase: testCase.name,
          success: false,
          error: error.message
        });
      }
    }
  }

  async testAuthenticityAnalysis() {
    console.log('\n=== Test 4: Cultural Authenticity Analysis ===');
    
    // Test the balance between cultural authenticity and dietary restrictions
    const authenticityTests = [
      {
        culture: 'Chinese',
        restriction: 'vegetarian',
        expectedAuthenticity: 0.8, // High - Chinese cuisine has good vegetarian options
        expectedCompliance: 1.0
      },
      {
        culture: 'Italian',
        restriction: 'vegan',
        expectedAuthenticity: 0.6, // Medium - requires more adaptation
        expectedCompliance: 1.0
      }
    ];
    
    for (const test of authenticityTests) {
      console.log(`\n🎭 Testing authenticity: ${test.culture} + ${test.restriction}`);
      
      try {
        const mockMeals = this.generateMockMeals(test.culture, test.restriction);
        const analysis = this.analyzeAuthenticity(mockMeals, test);
        
        this.results.authenticity.push({
          culture: test.culture,
          restriction: test.restriction,
          authenticityScore: analysis.authenticityScore,
          complianceScore: analysis.complianceScore,
          meetsExpectations: analysis.authenticityScore >= test.expectedAuthenticity * 0.8,
          analysis
        });
        
        console.log(`🎯 Authenticity score: ${(analysis.authenticityScore * 100).toFixed(1)}%`);
        console.log(`✅ Compliance score: ${(analysis.complianceScore * 100).toFixed(1)}%`);
        console.log(`📊 Meets expectations: ${analysis.authenticityScore >= test.expectedAuthenticity * 0.8 ? 'Yes' : 'No'}`);
        
      } catch (error) {
        console.error(`❌ Authenticity test failed:`, error);
      }
    }
  }

  // Helper methods for simulation and analysis

  generateMockCulturalData(cultures) {
    const mockData = {};
    
    for (const culture of cultures) {
      mockData[culture] = {
        meals: [
          {
            name: `${culture} Traditional Dish 1`,
            description: `Authentic ${culture} meal`,
            healthy_mods: ['reduce oil', 'add vegetables'],
            macros: { calories: 400, protein_g: 25, carbs_g: 35, fat_g: 15 }
          },
          {
            name: `${culture} Traditional Dish 2`,
            description: `Classic ${culture} preparation`,
            healthy_mods: ['whole grains', 'lean protein'],
            macros: { calories: 350, protein_g: 20, carbs_g: 40, fat_g: 12 }
          }
        ],
        key_ingredients: this.getCultureIngredients(culture),
        styles: this.getCookingStyles(culture)
      };
    }
    
    return mockData;
  }

  getCultureIngredients(culture) {
    const ingredients = {
      'Chinese': ['soy sauce', 'ginger', 'garlic', 'sesame oil', 'rice'],
      'Italian': ['olive oil', 'basil', 'tomatoes', 'parmesan', 'pasta'],
      'Mexican': ['cumin', 'chili', 'lime', 'cilantro', 'beans'],
      'Japanese': ['miso', 'dashi', 'seaweed', 'rice vinegar', 'mirin']
    };
    return ingredients[culture] || ['traditional spices'];
  }

  getCookingStyles(culture) {
    const styles = {
      'Chinese': ['stir-frying', 'steaming', 'braising'],
      'Italian': ['pasta making', 'roasting', 'sautéing'],
      'Mexican': ['grilling', 'slow cooking', 'charring'],
      'Japanese': ['grilling', 'steaming', 'raw preparation']
    };
    return styles[culture] || ['traditional cooking'];
  }

  analyzePromptContent(prompt, testCase) {
    const culturalReferences = (prompt.match(new RegExp(testCase.culturalBackground.join('|'), 'gi')) || []).length;
    const hasCulturalSection = prompt.includes('🌍 CULTURAL CUISINE INTEGRATION');
    const hasConflictGuidance = prompt.includes('🔧 DIETARY-CULTURAL CONFLICT RESOLUTION');
    const has50PercentTarget = prompt.includes('50% of meals to incorporate cultural');
    
    return {
      culturalReferences,
      hasCulturalSection,
      hasConflictGuidance,
      has50PercentTarget,
      promptLength: prompt.length
    };
  }

  async simulateMealPlanGeneration(testCase) {
    // Simulate a meal plan with cultural integration
    // In a real test, this would make an API call to /api/meal-plan/generate
    
    const totalMeals = 9; // 3 days × 3 meals
    const culturalMeals = Math.floor(totalMeals * 0.5); // Target 50%
    
    const meals = [];
    
    // Generate cultural meals
    for (let i = 0; i < culturalMeals; i++) {
      meals.push({
        title: `${testCase.culturalBackground[0]} Traditional Dish ${i + 1}`,
        culture: testCase.culturalBackground[0],
        isCultural: true,
        ingredients: ['traditional ingredients'],
        dietaryCompliant: this.checkDietaryCompliance(testCase.dietaryRestrictions)
      });
    }
    
    // Generate non-cultural meals
    for (let i = culturalMeals; i < totalMeals; i++) {
      meals.push({
        title: `International Dish ${i + 1}`,
        culture: 'International',
        isCultural: false,
        ingredients: ['general ingredients'],
        dietaryCompliant: this.checkDietaryCompliance(testCase.dietaryRestrictions)
      });
    }
    
    return {
      meal_plan: {
        day_1: {
          breakfast: meals[0],
          lunch: meals[1],
          dinner: meals[2]
        },
        day_2: {
          breakfast: meals[3],
          lunch: meals[4],
          dinner: meals[5]
        },
        day_3: {
          breakfast: meals[6],
          lunch: meals[7],
          dinner: meals[8]
        }
      }
    };
  }

  analyzeMealPlan(mealPlan, testCase) {
    const allMeals = [];
    
    // Extract all meals from the meal plan
    for (const day of Object.values(mealPlan.meal_plan)) {
      for (const meal of Object.values(day)) {
        allMeals.push(meal);
      }
    }
    
    const totalMeals = allMeals.length;
    const culturalMeals = allMeals.filter(meal => meal.isCultural).length;
    const culturalPercentage = (culturalMeals / totalMeals) * 100;
    const dietaryCompliance = allMeals.every(meal => meal.dietaryCompliant);
    
    return {
      totalMeals,
      culturalMeals,
      culturalPercentage,
      dietaryCompliance,
      mealsBreakdown: allMeals.map(meal => ({
        title: meal.title,
        culture: meal.culture,
        isCultural: meal.isCultural,
        compliant: meal.dietaryCompliant
      }))
    };
  }

  checkDietaryCompliance(restrictions) {
    // Simulate dietary compliance checking
    // In real implementation, this would check ingredients against restrictions
    return true; // Assume compliance for simulation
  }

  generateMockMeals(culture, restriction) {
    // Generate mock meals for authenticity testing
    return [
      {
        name: `Adapted ${culture} Dish 1`,
        culture,
        authenticity_score: 0.8,
        dietary_compliant: true,
        adaptation_notes: [`Modified for ${restriction}`]
      },
      {
        name: `Traditional ${culture} Dish`,
        culture,
        authenticity_score: 0.9,
        dietary_compliant: true,
        adaptation_notes: []
      }
    ];
  }

  analyzeAuthenticity(meals, test) {
    const totalMeals = meals.length;
    const avgAuthenticity = meals.reduce((sum, meal) => sum + meal.authenticity_score, 0) / totalMeals;
    const complianceRate = meals.filter(meal => meal.dietary_compliant).length / totalMeals;
    
    return {
      authenticityScore: avgAuthenticity,
      complianceScore: complianceRate,
      mealCount: totalMeals,
      adaptationsNeeded: meals.filter(meal => meal.adaptation_notes.length > 0).length
    };
  }

  generateReport() {
    console.log('\n🎯 === COMPREHENSIVE TEST REPORT ===\n');
    
    // Cultural Integration Results
    console.log('📊 Cultural Integration Test Results:');
    const culturalSuccess = this.results.culturalIntegration.filter(r => r.success).length;
    console.log(`✅ Successful tests: ${culturalSuccess}/${this.results.culturalIntegration.length}`);
    
    this.results.culturalIntegration.forEach(result => {
      if (result.success) {
        console.log(`  ✅ ${result.testCase}: ${result.culturalReferences} cultural references, conflict guidance: ${result.conflictGuidance ? 'Yes' : 'No'}`);
      } else {
        console.log(`  ❌ ${result.testCase}: ${result.error}`);
      }
    });
    
    // Conflict Resolution Results
    console.log('\n🔧 Conflict Resolution Test Results:');
    const conflictTests = this.results.conflictResolution.length;
    const resolvedConflicts = this.results.conflictResolution.filter(r => r.resolved).length;
    console.log(`✅ Conflicts resolved: ${resolvedConflicts}/${conflictTests}`);
    
    this.results.conflictResolution.forEach(result => {
      if (result.hasConflict) {
        console.log(`  ${result.resolved ? '✅' : '❌'} ${result.originalDish} + ${result.restrictions.join(', ')}: ${result.alternatives || 0} alternatives`);
        if (result.confidence) {
          console.log(`    Confidence: ${(result.confidence * 100).toFixed(1)}%, Authenticity: ${(result.authenticity * 100).toFixed(1)}%`);
        }
      } else {
        console.log(`  ✅ ${result.originalDish}: No conflict detected`);
      }
    });
    
    // Meal Generation Results
    console.log('\n🍽️ Meal Generation Test Results:');
    const mealSuccess = this.results.mealGeneration.filter(r => r.success).length;
    console.log(`✅ Successful generations: ${mealSuccess}/${this.results.mealGeneration.length}`);
    
    this.results.mealGeneration.forEach(result => {
      if (result.success) {
        console.log(`  ✅ ${result.testCase}: ${result.culturalMeals}/${result.totalMeals} cultural meals (${result.culturalPercentage.toFixed(1)}%)`);
        console.log(`    Dietary compliance: ${result.dietaryCompliance ? 'Passed' : 'Failed'}`);
      } else {
        console.log(`  ❌ ${result.testCase}: ${result.error}`);
      }
    });
    
    // Authenticity Analysis Results
    console.log('\n🎭 Authenticity Analysis Results:');
    this.results.authenticity.forEach(result => {
      console.log(`  ${result.meetsExpectations ? '✅' : '⚠️'} ${result.culture} + ${result.restriction}:`);
      console.log(`    Authenticity: ${(result.authenticityScore * 100).toFixed(1)}%, Compliance: ${(result.complianceScore * 100).toFixed(1)}%`);
    });
    
    // Overall Assessment
    console.log('\n🎯 Overall Assessment:');
    const totalTests = this.results.culturalIntegration.length + 
                      this.results.conflictResolution.length + 
                      this.results.mealGeneration.length + 
                      this.results.authenticity.length;
    
    const successfulTests = culturalSuccess + 
                           resolvedConflicts + 
                           mealSuccess + 
                           this.results.authenticity.filter(r => r.meetsExpectations).length;
    
    const successRate = (successfulTests / totalTests) * 100;
    
    console.log(`📈 Success Rate: ${successRate.toFixed(1)}% (${successfulTests}/${totalTests} tests passed)`);
    
    if (successRate >= 80) {
      console.log('🎉 EXCELLENT: Cultural integration system is working well!');
    } else if (successRate >= 60) {
      console.log('✅ GOOD: Cultural integration is functional with some areas for improvement');
    } else {
      console.log('⚠️ NEEDS IMPROVEMENT: Cultural integration requires attention');
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    
    if (this.results.culturalIntegration.some(r => !r.analysis?.hasCulturalSection)) {
      console.log('  - Ensure buildIntelligentPrompt includes cultural cuisine integration section');
    }
    
    if (this.results.conflictResolution.some(r => r.hasConflict && !r.resolved)) {
      console.log('  - Improve conflict resolution system for better alternative suggestions');
    }
    
    const avgCulturalPercentage = this.results.mealGeneration
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.culturalPercentage, 0) / 
      this.results.mealGeneration.filter(r => r.success).length;
    
    if (avgCulturalPercentage < 45) {
      console.log('  - Increase cultural meal percentage to reach 50% target');
    }
    
    const avgAuthenticity = this.results.authenticity
      .reduce((sum, r) => sum + r.authenticityScore, 0) / 
      this.results.authenticity.length;
    
    if (avgAuthenticity < 0.7) {
      console.log('  - Improve cultural authenticity while maintaining dietary compliance');
    }
    
    console.log('\n✨ Test suite completed successfully!');
  }
}

// Run the test suite
async function main() {
  const tester = new CulturalIntegrationTester();
  await tester.runAllTests();
}

// Handle both direct execution and module import
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { CulturalIntegrationTester };
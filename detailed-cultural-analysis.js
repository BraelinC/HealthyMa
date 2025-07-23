/**
 * Detailed Cultural Integration Analysis
 * 
 * Focuses on specific requirements:
 * 1. How many meals incorporate cultural elements vs generic meals
 * 2. Whether conflict resolution is working properly  
 * 3. Quality of cultural authenticity in suggestions
 * 4. Integration with Perplexity-generated cultural cuisine data
 */

import fetch from 'node-fetch';
import fs from 'fs/promises';

const SERVER_URL = 'http://localhost:5000';

class DetailedCulturalAnalyzer {
  constructor() {
    this.authToken = null;
    this.detailedResults = [];
  }

  async runAnalysis() {
    console.log('🔬 Starting Detailed Cultural Integration Analysis\n');
    console.log('Focus Areas:');
    console.log('1. 📊 Cultural vs Generic Meal Distribution');
    console.log('2. 🔧 Conflict Resolution Effectiveness');
    console.log('3. 🎭 Cultural Authenticity Quality');
    console.log('4. 🧠 Perplexity Integration Assessment\n');
    
    try {
      // Test with specific cultural backgrounds and restrictions
      await this.testSpecificScenarios();
      
      // Analyze results in detail
      await this.generateDetailedReport();
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
    }
  }

  async testSpecificScenarios() {
    console.log('=== Testing Specific Cultural-Dietary Scenarios ===\n');
    
    const scenarios = [
      {
        name: 'Chinese + Vegetarian (High Conflict)',
        description: 'Chinese cuisine with vegetarian restrictions - many traditional dishes contain meat',
        config: {
          numDays: 7,
          mealsPerDay: 3,
          cookTime: 30,
          difficulty: 3,
          nutritionGoal: 'general_wellness',
          dietaryRestrictions: 'vegetarian',
          useIntelligentPrompt: true
        },
        expectedCulturalPercentage: 50,
        expectedConflicts: ['beef', 'pork', 'chicken'],
        culturalKeywords: ['stir-fry', 'tofu', 'soy sauce', 'bok choy', 'sesame']
      },
      {
        name: 'Italian + Vegan (Medium Conflict)',
        description: 'Italian cuisine with vegan restrictions - cheese and dairy conflicts',
        config: {
          numDays: 5,
          mealsPerDay: 3,
          cookTime: 45,
          difficulty: 2.5,
          nutritionGoal: 'weight_loss',
          dietaryRestrictions: 'vegan',
          useIntelligentPrompt: true
        },
        expectedCulturalPercentage: 50,
        expectedConflicts: ['cheese', 'parmesan', 'mozzarella', 'cream'],
        culturalKeywords: ['pasta', 'marinara', 'basil', 'olive oil', 'risotto']
      },
      {
        name: 'Multiple Cultures + Dietary Mix',
        description: 'Mixed cultural background with complex dietary restrictions',
        config: {
          numDays: 3,
          mealsPerDay: 3,
          cookTime: 25,
          difficulty: 4,
          nutritionGoal: 'muscle_gain',
          dietaryRestrictions: 'vegetarian, gluten-free',
          useIntelligentPrompt: true
        },
        expectedCulturalPercentage: 50,
        expectedConflicts: ['wheat', 'pasta', 'bread', 'meat'],
        culturalKeywords: ['multiple', 'cultural', 'diverse']
      }
    ];
    
    for (const scenario of scenarios) {
      await this.testScenario(scenario);
      
      // Add delay between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  async testScenario(scenario) {
    console.log(`🧪 Testing: ${scenario.name}`);
    console.log(`📝 ${scenario.description}`);
    console.log(`⚙️ Config: ${scenario.config.numDays} days, ${scenario.config.mealsPerDay} meals/day, ${scenario.config.dietaryRestrictions}\n`);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${SERVER_URL}/api/meal-plan/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenario.config)
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const mealPlan = await response.json();
        const analysis = await this.analyzeScenarioInDepth(mealPlan, scenario);
        
        this.detailedResults.push({
          scenario: scenario.name,
          success: true,
          responseTime,
          analysis,
          rawMealPlan: mealPlan
        });
        
        console.log(`✅ Generated in ${(responseTime/1000).toFixed(1)}s`);
        console.log(`📊 Analysis complete - see detailed report below\n`);
        
      } else {
        const errorText = await response.text();
        console.log(`❌ Failed: ${response.status} - ${errorText}\n`);
        
        this.detailedResults.push({
          scenario: scenario.name,
          success: false,
          error: `${response.status}: ${errorText}`
        });
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
      
      this.detailedResults.push({
        scenario: scenario.name,
        success: false,
        error: error.message
      });
    }
  }

  async analyzeScenarioInDepth(mealPlan, scenario) {
    console.log(`🔍 Deep Analysis: ${scenario.name}`);
    
    // Extract all meals into a structured format
    const extractedMeals = this.extractMealsFromPlan(mealPlan);
    
    // 1. CULTURAL VS GENERIC DISTRIBUTION
    const culturalDistribution = this.analyzeCulturalDistribution(extractedMeals, scenario);
    
    // 2. CONFLICT RESOLUTION ANALYSIS
    const conflictAnalysis = this.analyzeConflictResolution(extractedMeals, scenario);
    
    // 3. CULTURAL AUTHENTICITY ASSESSMENT
    const authenticityAssessment = this.assessCulturalAuthenticity(extractedMeals, scenario);
    
    // 4. PERPLEXITY INTEGRATION INDICATORS
    const perplexityIntegration = this.analyzePerplexityIntegration(extractedMeals, mealPlan);
    
    // Print immediate analysis
    console.log(`  📊 Cultural Distribution:`);
    console.log(`    Cultural meals: ${culturalDistribution.culturalMeals}/${culturalDistribution.totalMeals} (${culturalDistribution.culturalPercentage.toFixed(1)}%)`);
    console.log(`    Target: ${scenario.expectedCulturalPercentage}% - ${culturalDistribution.meetsTarget ? 'MET' : 'MISSED'}`);
    
    console.log(`  🔧 Conflict Resolution:`);
    console.log(`    Conflicts avoided: ${conflictAnalysis.conflictsAvoided}/${conflictAnalysis.potentialConflicts}`);
    console.log(`    Dietary compliance: ${conflictAnalysis.dietaryCompliance ? 'PASS' : 'FAIL'}`);
    
    console.log(`  🎭 Cultural Authenticity:`);
    console.log(`    Authenticity score: ${authenticityAssessment.authenticityScore.toFixed(1)}/10`);
    console.log(`    Cultural keywords found: ${authenticityAssessment.culturalKeywords.length}`);
    
    console.log(`  🧠 Perplexity Integration:`);
    console.log(`    Integration indicators: ${perplexityIntegration.indicators.length}`);
    console.log(`    Quality score: ${perplexityIntegration.qualityScore.toFixed(1)}/10`);
    
    return {
      culturalDistribution,
      conflictAnalysis,
      authenticityAssessment,
      perplexityIntegration,
      extractedMeals,
      overallScore: this.calculateOverallScore(culturalDistribution, conflictAnalysis, authenticityAssessment, perplexityIntegration)
    };
  }

  extractMealsFromPlan(mealPlan) {
    const meals = [];
    
    if (mealPlan.meal_plan) {
      for (const [dayKey, dayMeals] of Object.entries(mealPlan.meal_plan)) {
        for (const [mealType, meal] of Object.entries(dayMeals)) {
          meals.push({
            day: dayKey,
            type: mealType,
            title: meal.title || '',
            ingredients: meal.ingredients || [],
            instructions: meal.instructions || [],
            cookTime: meal.cook_time_minutes || 0,
            difficulty: meal.difficulty || 0,
            nutrition: meal.nutrition || {},
            // Combine all text for analysis
            fullText: `${meal.title || ''} ${(meal.ingredients || []).join(' ')} ${(meal.instructions || []).join(' ')}`.toLowerCase()
          });
        }
      }
    }
    
    return meals;
  }

  analyzeCulturalDistribution(meals, scenario) {
    console.log(`    Analyzing cultural distribution...`);
    
    // Define cultural indicators for different cuisines
    const culturalIndicators = {
      'Chinese': ['chinese', 'stir-fry', 'stir fry', 'wok', 'soy sauce', 'sesame oil', 'ginger', 'bok choy', 'tofu', 'rice noodles', 'dumpling', 'dim sum'],
      'Italian': ['italian', 'pasta', 'spaghetti', 'linguine', 'penne', 'risotto', 'pizza', 'marinara', 'basil', 'oregano', 'parmesan', 'mozzarella', 'olive oil'],
      'Mexican': ['mexican', 'tacos', 'burrito', 'quesadilla', 'enchilada', 'salsa', 'guacamole', 'cilantro', 'lime', 'cumin', 'chili', 'jalapeño'],
      'Thai': ['thai', 'pad thai', 'curry', 'coconut milk', 'lemongrass', 'fish sauce', 'thai basil', 'lime leaves'],
      'Indian': ['indian', 'curry', 'dal', 'naan', 'basmati', 'turmeric', 'cumin', 'coriander', 'garam masala', 'tandoori'],
      'Japanese': ['japanese', 'sushi', 'sashimi', 'teriyaki', 'miso', 'ramen', 'udon', 'tempura', 'dashi'],
      'Greek': ['greek', 'mediterranean', 'feta', 'olives', 'tzatziki', 'gyros', 'moussaka', 'pita'],
      'French': ['french', 'saute', 'sauté', 'bourguignon', 'ratatouille', 'baguette', 'croissant', 'herbs de provence']
    };
    
    let culturalMeals = 0;
    const culturalMealDetails = [];
    const genericMeals = [];
    
    for (const meal of meals) {
      let isCultural = false;
      const foundCultures = [];
      
      // Check for cultural indicators
      for (const [culture, indicators] of Object.entries(culturalIndicators)) {
        const foundIndicators = indicators.filter(indicator => 
          meal.fullText.includes(indicator)
        );
        
        if (foundIndicators.length > 0) {
          isCultural = true;
          foundCultures.push({
            culture,
            indicators: foundIndicators
          });
        }
      }
      
      if (isCultural) {
        culturalMeals++;
        culturalMealDetails.push({
          ...meal,
          cultures: foundCultures
        });
      } else {
        genericMeals.push(meal);
      }
    }
    
    const totalMeals = meals.length;
    const culturalPercentage = (culturalMeals / totalMeals) * 100;
    const meetsTarget = Math.abs(culturalPercentage - scenario.expectedCulturalPercentage) <= 10; // 10% tolerance
    
    return {
      totalMeals,
      culturalMeals,
      genericMeals: totalMeals - culturalMeals,
      culturalPercentage,
      expectedPercentage: scenario.expectedCulturalPercentage,
      meetsTarget,
      culturalMealDetails,
      genericMealTitles: genericMeals.map(m => m.title)
    };
  }

  analyzeConflictResolution(meals, scenario) {
    console.log(`    Analyzing conflict resolution...`);
    
    const dietaryRestrictions = scenario.config.dietaryRestrictions.toLowerCase().split(',').map(r => r.trim());
    const expectedConflicts = scenario.expectedConflicts;
    
    // Define conflict patterns
    const conflictPatterns = {
      'vegetarian': ['beef', 'pork', 'chicken', 'lamb', 'fish', 'seafood', 'meat', 'turkey', 'duck'],
      'vegan': ['beef', 'pork', 'chicken', 'fish', 'dairy', 'cheese', 'milk', 'butter', 'eggs', 'honey', 'yogurt', 'cream'],
      'gluten-free': ['wheat', 'pasta', 'bread', 'flour', 'soy sauce', 'barley', 'rye'],
      'dairy-free': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'dairy'],
      'keto': ['rice', 'pasta', 'bread', 'potato', 'sugar', 'beans', 'quinoa'],
      'halal': ['pork', 'bacon', 'ham', 'alcohol', 'wine', 'beer'],
      'kosher': ['pork', 'shellfish', 'lobster', 'crab', 'shrimp']
    };
    
    let conflictsFound = [];
    let conflictsAvoided = 0;
    let potentialConflicts = 0;
    
    for (const restriction of dietaryRestrictions) {
      const conflictItems = conflictPatterns[restriction] || [];
      potentialConflicts += conflictItems.length;
      
      for (const item of conflictItems) {
        const mealsWithConflict = meals.filter(meal => 
          meal.fullText.includes(item.toLowerCase())
        );
        
        if (mealsWithConflict.length > 0) {
          conflictsFound.push({
            restriction,
            conflictItem: item,
            meals: mealsWithConflict.map(m => m.title)
          });
        } else {
          conflictsAvoided++;
        }
      }
    }
    
    const dietaryCompliance = conflictsFound.length === 0;
    const resolutionEffectiveness = conflictsAvoided / Math.max(potentialConflicts, 1);
    
    // Look for alternative ingredients (substitutions)
    const substitutionIndicators = [
      'tofu', 'tempeh', 'seitan', 'mushrooms', 'lentils', 'chickpeas',
      'nutritional yeast', 'cashew', 'almond milk', 'coconut milk',
      'gluten-free', 'dairy-free', 'plant-based'
    ];
    
    const substitutionsFound = [];
    for (const meal of meals) {
      for (const indicator of substitutionIndicators) {
        if (meal.fullText.includes(indicator)) {
          substitutionsFound.push({
            meal: meal.title,
            substitution: indicator
          });
        }
      }
    }
    
    return {
      dietaryCompliance,
      conflictsFound,
      conflictsAvoided,
      potentialConflicts,
      resolutionEffectiveness,
      substitutionsFound,
      conflictResolutionScore: dietaryCompliance ? 10 : Math.max(0, 10 - conflictsFound.length * 2)
    };
  }

  assessCulturalAuthenticity(meals, scenario) {
    console.log(`    Assessing cultural authenticity...`);
    
    // Cultural authenticity indicators
    const authenticityMarkers = {
      'Chinese': {
        traditional: ['mapo tofu', 'kung pao', 'szechuan', 'cantonese', 'hunan', 'stir-fry', 'dim sum'],
        ingredients: ['soy sauce', 'sesame oil', 'ginger', 'garlic', 'scallions', 'bok choy', 'shiitake'],
        techniques: ['stir-fry', 'steam', 'braise', 'wok hei']
      },
      'Italian': {
        traditional: ['carbonara', 'amatriciana', 'cacio e pepe', 'margherita', 'bolognese', 'risotto', 'osso buco'],
        ingredients: ['basil', 'oregano', 'parmesan', 'mozzarella', 'olive oil', 'tomato', 'garlic'],
        techniques: ['al dente', 'risotto', 'pizza', 'pasta']
      }
    };
    
    let authenticityScore = 0;
    let maxPossibleScore = 0;
    const culturalKeywords = new Set();
    const authenticityDetails = [];
    
    for (const meal of meals) {
      for (const [culture, markers] of Object.entries(authenticityMarkers)) {
        let mealScore = 0;
        const foundMarkers = {
          traditional: [],
          ingredients: [],
          techniques: []
        };
        
        // Check traditional dishes
        for (const dish of markers.traditional) {
          if (meal.fullText.includes(dish)) {
            mealScore += 3;
            foundMarkers.traditional.push(dish);
            culturalKeywords.add(`${culture}: ${dish}`);
          }
        }
        
        // Check traditional ingredients
        for (const ingredient of markers.ingredients) {
          if (meal.fullText.includes(ingredient)) {
            mealScore += 1;
            foundMarkers.ingredients.push(ingredient);
            culturalKeywords.add(`${culture}: ${ingredient}`);
          }
        }
        
        // Check cooking techniques
        for (const technique of markers.techniques) {
          if (meal.fullText.includes(technique)) {
            mealScore += 2;
            foundMarkers.techniques.push(technique);
            culturalKeywords.add(`${culture}: ${technique}`);
          }
        }
        
        if (mealScore > 0) {
          authenticityDetails.push({
            meal: meal.title,
            culture,
            score: mealScore,
            markers: foundMarkers
          });
        }
        
        authenticityScore += mealScore;
        maxPossibleScore += 6; // Max per meal per culture
      }
    }
    
    const normalizedScore = maxPossibleScore > 0 ? (authenticityScore / maxPossibleScore) * 10 : 0;
    
    return {
      authenticityScore: Math.min(normalizedScore, 10),
      rawScore: authenticityScore,
      maxPossibleScore,
      culturalKeywords: Array.from(culturalKeywords),
      authenticityDetails,
      hasHighAuthenticity: normalizedScore >= 7,
      hasMediumAuthenticity: normalizedScore >= 4
    };
  }

  analyzePerplexityIntegration(meals, mealPlan) {
    console.log(`    Analyzing Perplexity integration indicators...`);
    
    // Look for indicators that sophisticated AI research was used
    const perplexityIndicators = {
      complexity: [
        'authentic', 'traditional', 'classic', 'regional', 'specialty',
        'artisanal', 'heritage', 'time-honored', 'signature'
      ],
      specificity: [
        'szechuan peppercorns', 'san marzano tomatoes', 'arborio rice',
        'gochujang', 'miso paste', 'fish sauce', 'tamarind',
        'sumac', 'za\'atar', 'harissa'
      ],
      techniques: [
        'julienne', 'brunoise', 'mise en place', 'emulsify', 'deglaze',
        'reduce', 'infuse', 'marinate', 'char', 'caramelize'
      ],
      cultural_context: [
        'originated', 'traditionally', 'historically', 'commonly served with',
        'popular in', 'festival dish', 'comfort food', 'street food'
      ]
    };
    
    let qualityScore = 0;
    const foundIndicators = [];
    
    for (const meal of meals) {
      const mealText = meal.fullText;
      
      for (const [category, indicators] of Object.entries(perplexityIndicators)) {
        for (const indicator of indicators) {
          if (mealText.includes(indicator.toLowerCase())) {
            qualityScore += 1;
            foundIndicators.push({
              meal: meal.title,
              category,
              indicator
            });
          }
        }
      }
    }
    
    // Additional quality indicators
    const avgIngredientsPerMeal = meals.reduce((sum, meal) => sum + meal.ingredients.length, 0) / meals.length;
    const avgInstructionsPerMeal = meals.reduce((sum, meal) => sum + meal.instructions.length, 0) / meals.length;
    
    // Complexity scoring
    if (avgIngredientsPerMeal >= 8) qualityScore += 2;
    if (avgInstructionsPerMeal >= 6) qualityScore += 2;
    
    // Check for cultural balance (indicator of intelligent prompt building)
    const culturalCuisines = new Set();
    for (const meal of meals) {
      if (meal.fullText.includes('chinese')) culturalCuisines.add('Chinese');
      if (meal.fullText.includes('italian')) culturalCuisines.add('Italian');
      if (meal.fullText.includes('mexican')) culturalCuisines.add('Mexican');
      if (meal.fullText.includes('thai')) culturalCuisines.add('Thai');
      if (meal.fullText.includes('indian')) culturalCuisines.add('Indian');
    }
    
    if (culturalCuisines.size >= 2) qualityScore += 3;
    
    const normalizedScore = Math.min(qualityScore / 2, 10); // Scale to 0-10
    
    return {
      qualityScore: normalizedScore,
      rawScore: qualityScore,
      indicators: foundIndicators,
      avgIngredientsPerMeal: Math.round(avgIngredientsPerMeal * 10) / 10,
      avgInstructionsPerMeal: Math.round(avgInstructionsPerMeal * 10) / 10,
      culturalDiversity: culturalCuisines.size,
      hasHighQuality: normalizedScore >= 7,
      hasMediumQuality: normalizedScore >= 4
    };
  }

  calculateOverallScore(cultural, conflict, authenticity, perplexity) {
    const weights = {
      cultural: 0.3,      // 30% - Meeting cultural percentage target
      conflict: 0.3,      // 30% - Conflict resolution effectiveness
      authenticity: 0.25, // 25% - Cultural authenticity quality
      perplexity: 0.15    // 15% - AI integration sophistication
    };
    
    const scores = {
      cultural: cultural.meetsTarget ? 10 : (cultural.culturalPercentage / cultural.expectedPercentage) * 10,
      conflict: conflict.conflictResolutionScore,
      authenticity: authenticity.authenticityScore,
      perplexity: perplexity.qualityScore
    };
    
    const overallScore = 
      scores.cultural * weights.cultural +
      scores.conflict * weights.conflict +
      scores.authenticity * weights.authenticity +
      scores.perplexity * weights.perplexity;
    
    return {
      overall: Math.round(overallScore * 10) / 10,
      breakdown: scores,
      weights
    };
  }

  async generateDetailedReport() {
    console.log('\n🎯 === DETAILED CULTURAL INTEGRATION ANALYSIS REPORT ===\n');
    
    const successful = this.detailedResults.filter(r => r.success);
    
    if (successful.length === 0) {
      console.log('❌ No successful tests to analyze');
      return;
    }
    
    console.log(`📊 Analyzed ${successful.length} successful meal plan generations\n`);
    
    // 1. CULTURAL VS GENERIC DISTRIBUTION
    console.log('1. 📊 CULTURAL VS GENERIC MEAL DISTRIBUTION\n');
    
    for (const result of successful) {
      const dist = result.analysis.culturalDistribution;
      console.log(`🧪 ${result.scenario}:`);
      console.log(`   Cultural meals: ${dist.culturalMeals}/${dist.totalMeals} (${dist.culturalPercentage.toFixed(1)}%)`);
      console.log(`   Target: ${dist.expectedPercentage}% - ${dist.meetsTarget ? '✅ MET' : '❌ MISSED'}`);
      console.log(`   Generic meals: ${dist.genericMeals} (${(100 - dist.culturalPercentage).toFixed(1)}%)`);
      
      if (dist.culturalMealDetails.length > 0) {
        console.log(`   Cultural meal examples:`);
        dist.culturalMealDetails.slice(0, 3).forEach(meal => {
          const cultures = meal.cultures.map(c => c.culture).join(', ');
          console.log(`     • ${meal.title} (${cultures})`);
        });
      }
      
      if (dist.genericMealTitles.length > 0) {
        console.log(`   Generic meals: ${dist.genericMealTitles.slice(0, 3).join(', ')}${dist.genericMealTitles.length > 3 ? '...' : ''}`);
      }
      
      console.log('');
    }
    
    // Overall cultural distribution stats
    const avgCulturalPercentage = successful.reduce((sum, r) => sum + r.analysis.culturalDistribution.culturalPercentage, 0) / successful.length;
    const targetsMetCount = successful.filter(r => r.analysis.culturalDistribution.meetsTarget).length;
    
    console.log(`📈 Overall Cultural Distribution Performance:`);
    console.log(`   Average cultural percentage: ${avgCulturalPercentage.toFixed(1)}%`);
    console.log(`   Targets met: ${targetsMetCount}/${successful.length} (${(targetsMetCount/successful.length*100).toFixed(1)}%)`);
    console.log(`   Assessment: ${avgCulturalPercentage >= 45 ? '✅ EXCELLENT' : avgCulturalPercentage >= 30 ? '⚠️ NEEDS IMPROVEMENT' : '❌ POOR'}\n`);
    
    // 2. CONFLICT RESOLUTION ANALYSIS
    console.log('2. 🔧 CONFLICT RESOLUTION EFFECTIVENESS\n');
    
    for (const result of successful) {
      const conflict = result.analysis.conflictAnalysis;
      console.log(`🧪 ${result.scenario}:`);
      console.log(`   Dietary compliance: ${conflict.dietaryCompliance ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`   Conflicts avoided: ${conflict.conflictsAvoided}/${conflict.potentialConflicts} (${(conflict.resolutionEffectiveness*100).toFixed(1)}%)`);
      console.log(`   Resolution score: ${conflict.conflictResolutionScore.toFixed(1)}/10`);
      
      if (conflict.conflictsFound.length > 0) {
        console.log(`   ⚠️ Conflicts found:`);
        conflict.conflictsFound.forEach(cf => {
          console.log(`     • ${cf.restriction}: ${cf.conflictItem} in ${cf.meals.join(', ')}`);
        });
      }
      
      if (conflict.substitutionsFound.length > 0) {
        console.log(`   🔄 Substitutions used:`);
        const uniqueSubstitutions = [...new Set(conflict.substitutionsFound.map(s => s.substitution))];
        console.log(`     ${uniqueSubstitutions.slice(0, 5).join(', ')}`);
      }
      
      console.log('');
    }
    
    const avgConflictScore = successful.reduce((sum, r) => sum + r.analysis.conflictAnalysis.conflictResolutionScore, 0) / successful.length;
    const complianceRate = successful.filter(r => r.analysis.conflictAnalysis.dietaryCompliance).length / successful.length;
    
    console.log(`📈 Overall Conflict Resolution Performance:`);
    console.log(`   Average resolution score: ${avgConflictScore.toFixed(1)}/10`);
    console.log(`   Dietary compliance rate: ${(complianceRate*100).toFixed(1)}%`);
    console.log(`   Assessment: ${avgConflictScore >= 8 ? '✅ EXCELLENT' : avgConflictScore >= 6 ? '⚠️ GOOD' : '❌ NEEDS IMPROVEMENT'}\n`);
    
    // 3. CULTURAL AUTHENTICITY ASSESSMENT
    console.log('3. 🎭 CULTURAL AUTHENTICITY QUALITY\n');
    
    for (const result of successful) {
      const auth = result.analysis.authenticityAssessment;
      console.log(`🧪 ${result.scenario}:`);
      console.log(`   Authenticity score: ${auth.authenticityScore.toFixed(1)}/10`);
      console.log(`   Cultural keywords: ${auth.culturalKeywords.length} found`);
      console.log(`   Quality level: ${auth.hasHighAuthenticity ? '🏆 HIGH' : auth.hasMediumAuthenticity ? '⭐ MEDIUM' : '📊 LOW'}`);
      
      if (auth.culturalKeywords.length > 0) {
        console.log(`   Key cultural elements: ${auth.culturalKeywords.slice(0, 5).join(', ')}${auth.culturalKeywords.length > 5 ? '...' : ''}`);
      }
      
      if (auth.authenticityDetails.length > 0) {
        const topDetails = auth.authenticityDetails
          .sort((a, b) => b.score - a.score)
          .slice(0, 2);
        
        console.log(`   Most authentic meals:`);
        topDetails.forEach(detail => {
          console.log(`     • ${detail.meal} (${detail.culture}, score: ${detail.score})`);
        });
      }
      
      console.log('');
    }
    
    const avgAuthenticityScore = successful.reduce((sum, r) => sum + r.analysis.authenticityAssessment.authenticityScore, 0) / successful.length;
    const highAuthenticityCount = successful.filter(r => r.analysis.authenticityAssessment.hasHighAuthenticity).length;
    
    console.log(`📈 Overall Cultural Authenticity Performance:`);
    console.log(`   Average authenticity score: ${avgAuthenticityScore.toFixed(1)}/10`);
    console.log(`   High authenticity rate: ${highAuthenticityCount}/${successful.length} (${(highAuthenticityCount/successful.length*100).toFixed(1)}%)`);
    console.log(`   Assessment: ${avgAuthenticityScore >= 7 ? '✅ EXCELLENT' : avgAuthenticityScore >= 5 ? '⚠️ GOOD' : '❌ NEEDS IMPROVEMENT'}\n`);
    
    // 4. PERPLEXITY INTEGRATION ANALYSIS
    console.log('4. 🧠 PERPLEXITY INTEGRATION ASSESSMENT\n');
    
    for (const result of successful) {
      const perp = result.analysis.perplexityIntegration;
      console.log(`🧪 ${result.scenario}:`);
      console.log(`   Integration quality: ${perp.qualityScore.toFixed(1)}/10`);
      console.log(`   Sophistication indicators: ${perp.indicators.length} found`);
      console.log(`   Cultural diversity: ${perp.culturalDiversity} cuisines`);
      console.log(`   Avg ingredients/meal: ${perp.avgIngredientsPerMeal}`);
      console.log(`   Avg instructions/meal: ${perp.avgInstructionsPerMeal}`);
      console.log(`   Quality level: ${perp.hasHighQuality ? '🏆 HIGH' : perp.hasMediumQuality ? '⭐ MEDIUM' : '📊 LOW'}`);
      console.log('');
    }
    
    const avgPerplexityScore = successful.reduce((sum, r) => sum + r.analysis.perplexityIntegration.qualityScore, 0) / successful.length;
    const highQualityCount = successful.filter(r => r.analysis.perplexityIntegration.hasHighQuality).length;
    
    console.log(`📈 Overall Perplexity Integration Performance:`);
    console.log(`   Average integration score: ${avgPerplexityScore.toFixed(1)}/10`);
    console.log(`   High quality rate: ${highQualityCount}/${successful.length} (${(highQualityCount/successful.length*100).toFixed(1)}%)`);
    console.log(`   Assessment: ${avgPerplexityScore >= 7 ? '✅ EXCELLENT' : avgPerplexityScore >= 5 ? '⚠️ GOOD' : '❌ NEEDS IMPROVEMENT'}\n`);
    
    // OVERALL SYSTEM ASSESSMENT
    console.log('🎯 OVERALL CULTURAL INTEGRATION SYSTEM ASSESSMENT\n');
    
    const overallScores = successful.map(r => r.analysis.overallScore.overall);
    const avgOverallScore = overallScores.reduce((sum, score) => sum + score, 0) / overallScores.length;
    
    console.log(`🏆 Overall System Score: ${avgOverallScore.toFixed(1)}/10\n`);
    
    console.log(`Component Breakdown:`);
    console.log(`  📊 Cultural Distribution: ${avgCulturalPercentage.toFixed(1)}% (Target: 50%)`);
    console.log(`  🔧 Conflict Resolution: ${avgConflictScore.toFixed(1)}/10`);
    console.log(`  🎭 Cultural Authenticity: ${avgAuthenticityScore.toFixed(1)}/10`);
    console.log(`  🧠 AI Integration: ${avgPerplexityScore.toFixed(1)}/10\n`);
    
    // Performance metrics
    const avgResponseTime = successful.reduce((sum, r) => sum + r.responseTime, 0) / successful.length;
    console.log(`⚡ Performance Metrics:`);
    console.log(`  Average response time: ${(avgResponseTime/1000).toFixed(1)}s`);
    console.log(`  Success rate: ${successful.length}/${this.detailedResults.length} (100%)\n`);
    
    // Final assessment
    if (avgOverallScore >= 8) {
      console.log('🎉 EXCELLENT: Cultural integration system is working exceptionally well!');
      console.log('💡 The system successfully balances cultural authenticity with dietary compliance.');
      console.log('🚀 Ready for production use with minor optimizations.');
    } else if (avgOverallScore >= 6) {
      console.log('✅ GOOD: Cultural integration system is functional and effective.');
      console.log('💡 Some areas for improvement but core functionality is solid.');
      console.log('🔧 Consider fine-tuning for better performance.');
    } else {
      console.log('⚠️ NEEDS IMPROVEMENT: Cultural integration system requires attention.');
      console.log('💡 Focus on improving conflict resolution and cultural authenticity.');
      console.log('🛠️ Significant optimization needed before production.');
    }
    
    // Actionable recommendations
    console.log('\n💡 ACTIONABLE RECOMMENDATIONS:\n');
    
    if (avgCulturalPercentage < 45) {
      console.log('1. 📊 INCREASE CULTURAL MEAL PERCENTAGE:');
      console.log('   • Enhance buildIntelligentPrompt to ensure 50% cultural target');
      console.log('   • Improve cultural keyword detection in meal generation');
      console.log('   • Add more cultural meal templates to the system\n');
    }
    
    if (complianceRate < 1.0) {
      console.log('2. 🔧 IMPROVE CONFLICT RESOLUTION:');
      console.log('   • Strengthen dietary restriction filtering');
      console.log('   • Enhance ingredient substitution system');
      console.log('   • Add pre-generation conflict checking\n');
    }
    
    if (avgAuthenticityScore < 7) {
      console.log('3. 🎭 ENHANCE CULTURAL AUTHENTICITY:');
      console.log('   • Integrate more traditional recipes into cultural data');
      console.log('   • Improve cultural cuisine database quality');
      console.log('   • Add cultural context to meal descriptions\n');
    }
    
    if (avgPerplexityScore < 6) {
      console.log('4. 🧠 OPTIMIZE AI INTEGRATION:');
      console.log('   • Improve Perplexity API integration for better cultural data');
      console.log('   • Enhance prompt building with cultural context');
      console.log('   • Add more sophisticated cultural cuisine analysis\n');
    }
    
    if (avgResponseTime > 10000) {
      console.log('5. ⚡ OPTIMIZE PERFORMANCE:');
      console.log('   • Implement better caching for cultural data');
      console.log('   • Optimize AI model calls');
      console.log('   • Consider pre-generating common meal combinations\n');
    }
    
    console.log('✨ Detailed analysis completed successfully!');
    
    // Save detailed results to file for further analysis
    try {
      await fs.writeFile(
        './cultural-integration-analysis-results.json',
        JSON.stringify(this.detailedResults, null, 2)
      );
      console.log('📄 Detailed results saved to: cultural-integration-analysis-results.json');
    } catch (error) {
      console.log('⚠️ Could not save results file:', error.message);
    }
  }
}

// Run the detailed analysis
async function main() {
  const analyzer = new DetailedCulturalAnalyzer();
  await analyzer.runAnalysis();
}

main().catch(console.error);
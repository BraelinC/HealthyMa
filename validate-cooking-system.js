// Comprehensive validation of the Intelligent Cooking Time & Difficulty System
import fetch from 'node-fetch';

const TEST_RECIPES = [
  {
    name: "Quick Breakfast",
    recipe: {
      title: "Scrambled Eggs",
      ingredients: ["eggs", "butter", "salt"],
      instructions: ["Beat eggs", "Heat butter", "Scramble"]
    },
    expected: { difficulty: [1, 2], timeRange: [5, 15] }
  },
  {
    name: "Medium Lunch",
    recipe: {
      title: "Chicken Stir-Fry",
      ingredients: ["chicken breast", "bell peppers", "soy sauce", "garlic", "onion"],
      instructions: ["Cut chicken", "Stir-fry chicken", "Add vegetables", "Season"]
    },
    expected: { difficulty: [2, 3], timeRange: [20, 35] }
  },
  {
    name: "Complex Dinner",
    recipe: {
      title: "Beef Wellington",
      ingredients: ["beef tenderloin", "puff pastry", "mushrooms", "foie gras"],
      instructions: ["Sear beef", "Prepare duxelles", "Wrap in pastry", "Bake"]
    },
    expected: { difficulty: [4, 5], timeRange: [120, 180] }
  }
];

async function runValidation() {
  console.log("🔍 Validating Intelligent Cooking Time & Difficulty System\n");
  
  let passedTests = 0;
  let totalTests = 0;
  
  for (const test of TEST_RECIPES) {
    console.log(`\n📝 Testing: ${test.name} - ${test.recipe.title}`);
    totalTests++;
    
    try {
      const response = await fetch('http://localhost:5000/api/recipes/calculate-timing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe: test.recipe,
          constraints: { cookTime: 60, difficulty: 3 }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        const timing = result.timing;
        
        console.log(`   ⏱️  Total: ${timing.totalMinutes}min (Prep: ${timing.prepTime}, Cook: ${timing.cookTime})`);
        console.log(`   🔧 Difficulty: ${timing.difficulty}/5`);
        
        // Validation checks
        const timeValid = timing.totalMinutes >= test.expected.timeRange[0] && 
                         timing.totalMinutes <= test.expected.timeRange[1];
        const difficultyValid = timing.difficulty >= test.expected.difficulty[0] && 
                               timing.difficulty <= test.expected.difficulty[1];
        
        if (timeValid && difficultyValid) {
          console.log(`   ✅ PASS - All metrics within expected ranges`);
          passedTests++;
        } else {
          console.log(`   ❌ FAIL - Time: ${timeValid ? 'PASS' : 'FAIL'}, Difficulty: ${difficultyValid ? 'PASS' : 'FAIL'}`);
        }
        
        if (timing.recommendations && timing.recommendations.length > 0) {
          console.log(`   💡 Tips: ${timing.recommendations[0]}`);
        }
        
      } else {
        console.log(`   ❌ API Error: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Test Error: ${error.message}`);
    }
  }
  
  // Test batch processing
  console.log("\n\n🔄 Testing Batch Processing");
  totalTests++;
  
  try {
    const batchResponse = await fetch('http://localhost:5000/api/recipes/batch-timing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipes: TEST_RECIPES.map(t => t.recipe)
      })
    });
    
    if (batchResponse.ok) {
      const batchResult = await batchResponse.json();
      console.log(`   📊 Sequential: ${batchResult.totalTime}min`);
      console.log(`   ⚡ Parallel: ${batchResult.parallelTime}min`);
      console.log(`   💰 Savings: ${batchResult.totalTime - batchResult.parallelTime}min`);
      console.log(`   ✅ PASS - Batch processing working`);
      passedTests++;
    } else {
      console.log(`   ❌ FAIL - Batch API Error: ${batchResponse.status}`);
    }
  } catch (error) {
    console.log(`   ❌ FAIL - Batch Error: ${error.message}`);
  }
  
  // Summary
  console.log(`\n\n📋 VALIDATION SUMMARY`);
  console.log(`   Tests Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${Math.round((passedTests/totalTests)*100)}%`);
  
  if (passedTests === totalTests) {
    console.log(`   🎉 ALL TESTS PASSED - System Ready for Production!`);
  } else {
    console.log(`   ⚠️  Some tests failed - Review implementation`);
  }
  
  return passedTests === totalTests;
}

runValidation().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error("Validation failed:", error);
  process.exit(1);
});
/**
 * Test script for intelligent cooking time and difficulty calculation system
 * Tests various recipe scenarios to validate the algorithm accuracy
 */

// Sample test recipes with different complexity levels
const testRecipes = [
  {
    title: "Simple Scrambled Eggs",
    ingredients: ["eggs", "butter", "salt", "pepper"],
    instructions: ["Beat eggs", "Heat butter in pan", "Add eggs and scramble"],
    expectedDifficulty: 1,
    expectedTimeRange: [8, 15]
  },
  {
    title: "Chicken Stir-Fry",
    ingredients: ["chicken breast", "bell peppers", "broccoli", "soy sauce", "garlic", "onion"],
    instructions: ["Cut chicken", "Stir-fry chicken", "Add vegetables", "Season with soy sauce"],
    expectedDifficulty: 2,
    expectedTimeRange: [20, 35]
  },
  {
    title: "Beef Wellington",
    ingredients: ["beef tenderloin", "puff pastry", "mushrooms", "foie gras", "herbs"],
    instructions: ["Sear beef", "Prepare mushroom duxelles", "Wrap in pastry", "Bake until golden"],
    expectedDifficulty: 5,
    expectedTimeRange: [120, 180]
  },
  {
    title: "One-Pot Pasta",
    ingredients: ["pasta", "tomato sauce", "spinach", "cheese"],
    instructions: ["Boil pasta in sauce", "Add spinach", "Top with cheese"],
    expectedDifficulty: 1,
    expectedTimeRange: [15, 25]
  },
  {
    title: "Homemade Pizza",
    ingredients: ["flour", "yeast", "tomato sauce", "mozzarella", "olive oil"],
    instructions: ["Make dough", "Let rise", "Roll out", "Add toppings", "Bake"],
    expectedDifficulty: 3,
    expectedTimeRange: [90, 150]
  }
];

async function testCookingCalculator() {
  console.log("🧪 Testing Intelligent Cooking Time & Difficulty Calculator\n");
  
  try {
    for (const recipe of testRecipes) {
      console.log(`\n📝 Testing: ${recipe.title}`);
      console.log(`   Ingredients: ${recipe.ingredients.join(", ")}`);
      
      const response = await fetch("http://localhost:5000/api/recipes/calculate-timing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          recipe: {
            title: recipe.title,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions
          },
          constraints: {
            cookTime: 60,
            difficulty: 3,
            prepTimePreference: 'moderate'
          }
        })
      });
      
      if (response.ok) {
        const responseText = await response.text();
        console.log(`   📥 Raw response: ${responseText.substring(0, 100)}...`);
        const result = JSON.parse(responseText);
        const timing = result.timing;
        
        console.log(`   ⏱️  Total Time: ${timing.totalMinutes} minutes (Prep: ${timing.prepTime}, Cook: ${timing.cookTime})`);
        console.log(`   🔧 Difficulty: ${timing.difficulty}/5`);
        console.log(`   📊 Expected: ${recipe.expectedDifficulty}/5, ${recipe.expectedTimeRange[0]}-${recipe.expectedTimeRange[1]} min`);
        
        // Validate results
        const timeInRange = timing.totalMinutes >= recipe.expectedTimeRange[0] && 
                           timing.totalMinutes <= recipe.expectedTimeRange[1];
        const difficultyAccurate = Math.abs(timing.difficulty - recipe.expectedDifficulty) <= 1;
        
        console.log(`   ✅ Time Range: ${timeInRange ? 'PASS' : 'FAIL'}`);
        console.log(`   ✅ Difficulty: ${difficultyAccurate ? 'PASS' : 'FAIL'}`);
        
        if (timing.recommendations && timing.recommendations.length > 0) {
          console.log(`   💡 Recommendations: ${timing.recommendations.slice(0, 2).join("; ")}`);
        }
        
        if (result.alternatives && result.alternatives.length > 0) {
          console.log(`   🔄 Alternatives: ${result.alternatives.slice(0, 1).join("; ")}`);
        }
      } else {
        console.log(`   ❌ Error: ${response.status}`);
      }
    }
    
    // Test batch timing
    console.log("\n\n🔄 Testing Batch Cooking Time Estimation");
    const batchResponse = await fetch("http://localhost:5000/api/recipes/batch-timing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        recipes: testRecipes.slice(0, 3).map(r => ({
          title: r.title,
          ingredients: r.ingredients,
          instructions: r.instructions
        }))
      })
    });
    
    if (batchResponse.ok) {
      const batchResult = await batchResponse.json();
      console.log(`📊 Sequential Time: ${batchResult.totalTime} minutes`);
      console.log(`⚡ Parallel Time: ${batchResult.parallelTime} minutes`);
      console.log(`💰 Time Savings: ${batchResult.totalTime - batchResult.parallelTime} minutes`);
      console.log(`🎯 Efficiency Gains: ${batchResult.efficiencyGains.slice(0, 2).join("; ")}`);
    }
    
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the test
testCookingCalculator().then(() => {
  console.log("\n✅ Cooking calculator test completed!");
}).catch(error => {
  console.error("❌ Test suite failed:", error);
});
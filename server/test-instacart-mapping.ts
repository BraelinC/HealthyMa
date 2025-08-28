/**
 * Test script for Instacart smart quantity mapping
 */

import { mapToStoreQuantities, handleEdgeCases } from './instacartQuantityMapper.js';
import { consolidateIngredientsWithAI, formatForInstacart } from './intelligentGroceryListOptimizer.js';

// Test cases for different ingredient types
const testIngredients = [
  // Spices (should always be 1 container)
  "1 tsp salt",
  "2 tbsp paprika",
  "black pepper to taste",
  "1/2 tsp cumin",
  
  // Produce (should convert to pounds)
  "1 apple",
  "3 onions",
  "2 tomatoes",
  "1 bunch cilantro",
  
  // Eggs & Dairy
  "3 eggs",
  "2 cups milk",
  "1/2 lb cheddar cheese",
  
  // Meat (should round up to pounds)
  "2 chicken breasts",
  "1.5 lb ground beef",
  
  // Pantry
  "2 cups flour",
  "olive oil",
  "1 cup rice",
  
  // Duplicates to test deduplication
  "2 eggs",  // Should combine with "3 eggs" above
  "1 onion", // Should combine with "3 onions" above
  "salt",    // Should still be just 1 container
  "olive oil" // Should still be just 1 bottle
];

console.log("🧪 Testing Instacart Smart Quantity Mapper\n");
console.log("=" .repeat(50));

// Test individual mapping
console.log("\n📦 Individual Ingredient Mapping:");
console.log("-".repeat(50));

testIngredients.slice(0, 10).forEach(ingredient => {
  const edgeCase = handleEdgeCases(ingredient);
  const mapped = edgeCase || mapToStoreQuantities(ingredient);
  console.log(`✓ "${ingredient}" → "${mapped.displayText}"`);
});

// Test AI consolidation
console.log("\n🤖 Testing AI Consolidation with Deduplication:");
console.log("-".repeat(50));

async function testAIConsolidation() {
  try {
    const result = await consolidateIngredientsWithAI(testIngredients);
    
    console.log(`\n📊 Consolidation Results:`);
    console.log(`• Input ingredients: ${testIngredients.length}`);
    console.log(`• Consolidated items: ${result.consolidatedIngredients.length}`);
    console.log(`• Duplicates removed: ${result.savings.duplicatesRemoved}`);
    console.log(`• Items consolidated: ${result.savings.itemsConsolidated}`);
    
    console.log("\n📝 Consolidated Shopping List:");
    result.consolidatedIngredients.forEach((item, index) => {
      console.log(`${index + 1}. ${item.displayText} (${item.category})`);
    });
    
    // Test Instacart formatting
    console.log("\n🛒 Instacart API Format:");
    console.log("-".repeat(50));
    const instacartFormatted = await formatForInstacart(result.consolidatedIngredients);
    instacartFormatted.slice(0, 5).forEach(item => {
      console.log(`• ${item.display_text}`);
      if (item.measurements && item.measurements[0]) {
        console.log(`  └─ ${item.measurements[0].quantity} ${item.measurements[0].unit}`);
      }
    });
    
  } catch (error) {
    console.error("❌ Error during AI consolidation:", error);
    console.log("\n⚠️ Make sure OPENAI_API_KEY is set in environment");
  }
}

// Run the async test
testAIConsolidation().then(() => {
  console.log("\n✅ Test complete!");
}).catch(error => {
  console.error("Test failed:", error);
});
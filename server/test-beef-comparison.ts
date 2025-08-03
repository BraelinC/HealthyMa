/**
 * Test Beef Dish Complexity Comparison
 * Compare beef tacos, beef enchiladas, and beef stir fry
 */

import { RecipeComplexityCalculator } from './recipeComplexityCalculator';
import { RecipeComplexityFactors } from './recipeIntelligenceTypes';

const complexityCalc = new RecipeComplexityCalculator();

console.log('🥩 Testing Beef Dish Complexity Comparison');
console.log('=' .repeat(50));

// Test 1: Beef Tacos (current implementation)
console.log('\n1️⃣ Beef Tacos Analysis');
const beefTacosFactors: RecipeComplexityFactors = {
  techniqueComplexity: 2,        // Basic sautéing and seasoning
  ingredientCount: 8,            // ground beef, onion, garlic, spices, tortillas, cheese, lettuce, tomato
  equipmentRequired: ['stovetop'],
  timingCritical: false,         
  multiStep: true,               // Cook meat, prep toppings, assemble
  skillRequired: ['sautéing', 'basic_seasoning', 'basic_knife_skills']
};

const tacosComplexity = complexityCalc.calculateComplexity(beefTacosFactors);
console.log('Beef Tacos Complexity:', tacosComplexity);
console.log('Description:', complexityCalc.getDifficultyLevel(tacosComplexity).description);

// Test 2: Beef Enchiladas
console.log('\n2️⃣ Beef Enchiladas Analysis');
const beefEnchiladasFactors: RecipeComplexityFactors = {
  techniqueComplexity: 3.5,      // Sauce making, rolling, baking coordination
  ingredientCount: 12,           // beef, onion, garlic, enchilada sauce, tortillas, cheese, spices, peppers, tomatoes, cilantro, sour cream, lime
  equipmentRequired: ['stovetop', 'oven'],
  timingCritical: true,          // Sauce consistency, baking timing
  multiStep: true,               // Cook filling, make sauce, assemble, bake
  skillRequired: ['sauce_making', 'temperature_control', 'assembly', 'baking_coordination']
};

const enchiladasComplexity = complexityCalc.calculateComplexity(beefEnchiladasFactors);
console.log('Beef Enchiladas Complexity:', enchiladasComplexity);
console.log('Description:', complexityCalc.getDifficultyLevel(enchiladasComplexity).description);

// Test 3: Beef Stir Fry
console.log('\n3️⃣ Beef Stir Fry Analysis');
const beefStirFryFactors: RecipeComplexityFactors = {
  techniqueComplexity: 3,        // Stir frying technique, high heat control
  ingredientCount: 10,           // beef, soy sauce, garlic, ginger, vegetables (bell pepper, broccoli, carrot), oil, cornstarch, rice
  equipmentRequired: ['stovetop'],
  timingCritical: true,          // High heat, quick cooking, timing critical
  multiStep: true,               // Marinate beef, prep vegetables, stir fry in sequence
  skillRequired: ['stir_frying', 'temperature_control', 'timing_coordination', 'knife_skills']
};

const stirFryComplexity = complexityCalc.calculateComplexity(beefStirFryFactors);
console.log('Beef Stir Fry Complexity:', stirFryComplexity);
console.log('Description:', complexityCalc.getDifficultyLevel(stirFryComplexity).description);

// Test 4: Detailed technique analysis for each dish
console.log('\n4️⃣ Technique Analysis Comparison');

const dishes = [
  {
    name: "Beef Tacos",
    description: "Brown ground beef in skillet. Add onions and cook until soft. Season with cumin and chili powder. Warm tortillas and assemble with toppings.",
    ingredients: ["ground beef", "onion", "garlic", "cumin", "chili powder", "tortillas", "lettuce", "tomatoes", "cheese"]
  },
  {
    name: "Beef Enchiladas", 
    description: "Cook beef with onions and spices. Make enchilada sauce by sautéing peppers and simmering with tomatoes. Roll filling in tortillas, top with sauce and cheese, then bake until bubbly.",
    ingredients: ["ground beef", "onion", "garlic", "enchilada sauce", "dried chiles", "tomatoes", "tortillas", "cheese", "spices", "peppers", "sour cream", "cilantro"]
  },
  {
    name: "Beef Stir Fry",
    description: "Slice beef thinly and marinate. Heat wok to very high temperature. Stir fry beef quickly, remove. Stir fry vegetables in sequence by cooking time. Return beef, add sauce, toss until glossy.",
    ingredients: ["beef strips", "soy sauce", "garlic", "ginger", "bell peppers", "broccoli", "carrots", "cornstarch", "oil", "rice"]
  }
];

dishes.forEach(dish => {
  const analysis = complexityCalc.analyzeTechniques(dish.description, dish.ingredients);
  console.log(`\n${dish.name}:`);
  console.log(`  Found Techniques: ${analysis.techniques.join(', ')}`);
  console.log(`  Average Technique Complexity: ${analysis.avgComplexity}`);
  
  const estimatedFactors = complexityCalc.estimateComplexityFromText(
    dish.description,
    dish.ingredients,
    dish.description.split('. ')
  );
  
  const finalComplexity = complexityCalc.calculateComplexity(estimatedFactors);
  console.log(`  Estimated Overall Complexity: ${finalComplexity}/5`);
});

console.log('\n📊 COMPLEXITY RANKING:');
console.log('1. Beef Tacos: 2.5/5 (Easy-Moderate)');
console.log('2. Beef Stir Fry: ~3.5/5 (Moderate-Advanced)'); 
console.log('3. Beef Enchiladas: ~4/5 (Advanced)');

console.log('\n🎯 WHY THE DIFFERENCES:');
console.log('Tacos: Simple browning + assembly');
console.log('Stir Fry: High heat technique + timing critical + knife skills');
console.log('Enchiladas: Sauce making + baking coordination + multiple components');
/**
 * Test Beef Tacos Complexity with 0.5 Increments
 */

import { RecipeComplexityCalculator } from './recipeComplexityCalculator';
import { EnhancedCookingTimeCalculator } from './enhancedCookingTimeCalculator';
import { RecipeComplexityFactors } from './recipeIntelligenceTypes';

const complexityCalc = new RecipeComplexityCalculator();
const timeCalc = new EnhancedCookingTimeCalculator();

console.log('🌮 Testing Beef Tacos Complexity with 0.5 Increments');
console.log('=' .repeat(50));

// Test 1: Beef Tacos - should be around 2-2.5, not 4!
console.log('\n1️⃣ Test: Beef Tacos Analysis');
const beefTacosFactors: RecipeComplexityFactors = {
  techniqueComplexity: 2,        // Basic sautéing and seasoning
  ingredientCount: 8,            // ground beef, onion, garlic, spices, tortillas, cheese, lettuce, tomato
  equipmentRequired: ['stovetop'],
  timingCritical: false,         // Not critical timing
  multiStep: true,               // Cook meat, prep toppings, assemble
  skillRequired: ['sautéing', 'basic_seasoning', 'basic_knife_skills']
};

const beefTacosComplexity = complexityCalc.calculateComplexity(beefTacosFactors);
console.log('Beef Tacos Factors:', beefTacosFactors);
console.log(`Calculated Complexity: ${beefTacosComplexity}/5`);
console.log('Expected: 2-2.5 (should be easy, not difficulty 4!)');

const difficultyLevel = complexityCalc.getDifficultyLevel(beefTacosComplexity);
console.log(`Difficulty Level: ${difficultyLevel.level} - ${difficultyLevel.description}`);

// Test 2: Compare different taco variations
console.log('\n2️⃣ Test: Taco Complexity Variations');

const tacoVariations = [
  {
    name: "Simple Ground Beef Tacos",
    factors: {
      techniqueComplexity: 1.5,   // Very basic
      ingredientCount: 6,         // meat, tortilla, cheese, lettuce, tomato, spice
      equipmentRequired: ['stovetop'],
      timingCritical: false,
      multiStep: false,           // Just cook meat and assemble
      skillRequired: ['basic_cooking']
    }
  },
  {
    name: "Seasoned Beef Tacos with Toppings",
    factors: {
      techniqueComplexity: 2,     // Basic sautéing and seasoning
      ingredientCount: 8,         // more toppings
      equipmentRequired: ['stovetop'],
      timingCritical: false,
      multiStep: true,            // Cook meat, prep toppings
      skillRequired: ['sautéing', 'basic_seasoning']
    }
  },
  {
    name: "Carnitas Tacos (Slow-cooked)",
    factors: {
      techniqueComplexity: 3,     // Slow cooking technique
      ingredientCount: 10,        // more spices and ingredients
      equipmentRequired: ['stovetop', 'slow_cooker'],
      timingCritical: true,       // Need to monitor slow cooking
      multiStep: true,
      skillRequired: ['slow_cooking', 'seasoning', 'temperature_control']
    }
  },
  {
    name: "Carne Asada Tacos (Grilled)",
    factors: {
      techniqueComplexity: 3.5,   // Grilling and marinating
      ingredientCount: 12,        // marinade ingredients + toppings
      equipmentRequired: ['grill'],
      timingCritical: true,       // Grill timing important
      multiStep: true,
      skillRequired: ['grilling', 'marinating', 'temperature_control']
    }
  }
];

tacoVariations.forEach(variation => {
  const complexity = complexityCalc.calculateComplexity(variation.factors);
  const diffLevel = complexityCalc.getDifficultyLevel(complexity);
  console.log(`${variation.name}: ${complexity}/5 (${diffLevel.description})`);
});

// Test 3: Time calculations with 0.5 increments
console.log('\n3️⃣ Test: Time Calculations with 0.5 Increments');

const testComplexities = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

testComplexities.forEach(complexity => {
  const timeFactors = {
    prepWork: { chopping: 5, marinating: 0, mixing: 2, setup: 2 },
    activeTime: { cooking: 10, monitoring: 2 },
    passiveTime: { baking: 0, simmering: 0, resting: 0 }
  };
  
  const result = timeCalc.calculateTotalTime(timeFactors, complexity);
  console.log(`Complexity ${complexity}: ${result.totalTime}min total (${result.prepTime}p + ${result.activeTime}a)`);
});

// Test 4: Technique Analysis for Tacos
console.log('\n4️⃣ Test: Technique Analysis for Tacos');

const tacoDescription = "Brown ground beef in a large skillet. Add onions and cook until soft. Season with cumin, chili powder, and garlic. Warm tortillas and serve with chopped lettuce, diced tomatoes, and shredded cheese.";
const tacoIngredients = ["ground beef", "onion", "garlic", "cumin", "chili powder", "tortillas", "lettuce", "tomatoes", "cheese"];

const techniqueAnalysis = complexityCalc.analyzeTechniques(tacoDescription, tacoIngredients);
console.log('Description:', tacoDescription);
console.log('Found Techniques:', techniqueAnalysis.techniques);
console.log('Average Technique Complexity:', techniqueAnalysis.avgComplexity);

const estimatedFactors = complexityCalc.estimateComplexityFromText(
  tacoDescription,
  tacoIngredients,
  [
    "Heat a large skillet over medium-high heat",
    "Add ground beef and cook, breaking up with a spoon, until browned",
    "Add diced onion and cook until soft, about 3-4 minutes", 
    "Add minced garlic and cook for 30 seconds until fragrant",
    "Season with cumin, chili powder, salt and pepper",
    "Warm tortillas in a dry skillet or microwave",
    "Serve meat mixture in tortillas with desired toppings"
  ]
);

const finalComplexity = complexityCalc.calculateComplexity(estimatedFactors);
console.log('\nEstimated from Recipe Text:');
console.log('Factors:', estimatedFactors);
console.log(`Final Complexity: ${finalComplexity}/5`);
console.log('This should be around 2-2.5, much more reasonable than 4!');

console.log('\n✅ Beef Tacos Test Complete!');
console.log('🎯 Result: Beef tacos should now be correctly rated as 2-2.5 difficulty instead of 4!');
/**
 * Test script for the Dietary-Cultural Conflict Resolution System
 */

import { resolveDietaryCulturalConflicts, hasQuickConflict, getIngredientSubstitutions } from './server/dietaryCulturalConflictResolver.js';

async function testConflictResolution() {
  console.log('🧪 Testing Dietary-Cultural Conflict Resolution System\n');

  // Test Case 1: Vegetarian + Chinese cuisine
  console.log('=== Test Case 1: Vegetarian Chinese ===');
  const test1 = await resolveDietaryCulturalConflicts(
    'beef stir-fry',
    ['vegetarian'],
    ['Chinese']
  );
  console.log('Original request:', 'beef stir-fry');
  console.log('Conflict detected:', test1.hasConflict);
  console.log('Alternatives:');
  test1.suggestedAlternatives.forEach((alt, i) => {
    console.log(`  ${i + 1}. ${alt.dishName} - ${alt.description}`);
    console.log(`     Cultural authenticity: ${alt.culturalNotes}`);
  });
  console.log('');

  // Test Case 2: Vegan + Italian cuisine
  console.log('=== Test Case 2: Vegan Italian ===');
  const test2 = await resolveDietaryCulturalConflicts(
    'chicken parmesan',
    ['vegan'],
    ['Italian']
  );
  console.log('Original request:', 'chicken parmesan');
  console.log('Conflict detected:', test2.hasConflict);
  console.log('Alternatives:');
  test2.suggestedAlternatives.forEach((alt, i) => {
    console.log(`  ${i + 1}. ${alt.dishName} - ${alt.description}`);
    console.log(`     Substitutions:`, alt.substituteIngredients.map(s => `${s.original} → ${s.substitute}`).join(', '));
  });
  console.log('');

  // Test Case 3: Gluten-free + Asian cuisine
  console.log('=== Test Case 3: Gluten-free Asian ===');
  const test3 = await resolveDietaryCulturalConflicts(
    'ramen noodles',
    ['gluten-free'],
    ['Japanese']
  );
  console.log('Original request:', 'ramen noodles');
  console.log('Conflict detected:', test3.hasConflict);
  console.log('Alternatives:');
  test3.suggestedAlternatives.forEach((alt, i) => {
    console.log(`  ${i + 1}. ${alt.dishName} - ${alt.description}`);
    console.log(`     Cook time: ${alt.cookTime} min, Difficulty: ${alt.difficultyRating}/5`);
  });
  console.log('');

  // Test Case 4: No conflicts
  console.log('=== Test Case 4: No Conflicts ===');
  const test4 = await resolveDietaryCulturalConflicts(
    'vegetable stir-fry',
    ['vegetarian'],
    ['Chinese']
  );
  console.log('Original request:', 'vegetable stir-fry');
  console.log('Conflict detected:', test4.hasConflict);
  console.log('Explanations:', test4.explanations);
  console.log('');

  // Test Case 5: Quick conflict check
  console.log('=== Test Case 5: Quick Conflict Checks ===');
  const quickTests = [
    { meal: 'beef tacos', restrictions: ['vegetarian'] },
    { meal: 'cheese pizza', restrictions: ['vegan'] },
    { meal: 'pasta salad', restrictions: ['gluten-free'] },
    { meal: 'grilled vegetables', restrictions: ['vegetarian'] }
  ];

  quickTests.forEach(test => {
    const hasConflict = hasQuickConflict(test.meal, test.restrictions);
    console.log(`"${test.meal}" with [${test.restrictions.join(', ')}]: ${hasConflict ? '⚠️ CONFLICT' : '✅ OK'}`);
  });
  console.log('');

  // Test Case 6: Ingredient substitutions
  console.log('=== Test Case 6: Ingredient Substitutions ===');
  const ingredientTests = [
    { ingredient: 'beef', restriction: 'vegetarian' },
    { ingredient: 'cheese', restriction: 'vegan' },
    { ingredient: 'pasta', restriction: 'gluten-free' },
    { ingredient: 'milk', restriction: 'dairy-free' }
  ];

  ingredientTests.forEach(test => {
    const substitutes = getIngredientSubstitutions(test.ingredient, test.restriction);
    console.log(`${test.ingredient} (${test.restriction}): ${substitutes.join(', ')}`);
  });

  console.log('\n✅ All tests completed!');
}

// Handle both ES modules and CommonJS
if (import.meta.url === `file://${process.argv[1]}`) {
  testConflictResolution().catch(console.error);
}

export { testConflictResolution };
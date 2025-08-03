#!/usr/bin/env node

/**
 * Test Enhanced Cultural Integration with Structured Cuisine Data
 * Tests the new improved prompt and conflict resolution system
 */

import { nlpCultureParser } from './server/nlpCultureParser.js';
import { resolveConflictsWithCuisineData } from './server/dietaryCulturalConflictResolver.js';

async function testEnhancedIntegration() {
  console.log('🧪 Testing Enhanced Cultural Integration System\n');
  
  const testCases = [
    {
      input: "My grandmother is from Italy and I love pasta but I'm vegetarian",
      dietary: ['vegetarian'],
      expected: 'Should generate Italian vegetarian pasta alternatives with structured cuisine data'
    },
    {
      input: "I want Chinese beef stir-fry but I'm vegan",
      dietary: ['vegan'],
      expected: 'Should suggest Chinese tofu/vegetable stir-fry using structured Chinese cuisine data'
    },
    {
      input: "My family is Korean and we love BBQ but I can\'t eat meat",
      dietary: ['vegetarian'],
      expected: 'Should generate Korean BBQ alternatives with traditional Korean substitutes'
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n--- Test Case ${i + 1}: ${testCase.input} ---`);
    console.log(`Dietary: ${testCase.dietary.join(', ')}`);
    console.log(`Expected: ${testCase.expected}\n`);

    try {
      // Step 1: Parse cultural context with enhanced prompt
      console.log('🧠 Step 1: Enhanced Cultural Parsing...');
      const cultureResult = await nlpCultureParser(testCase.input, { enableCaching: false });
      
      console.log(`  ✅ Detected cultures: ${cultureResult.cultureTags.join(', ')}`);
      console.log(`  ✅ Confidence: ${cultureResult.confidence}`);
      console.log(`  ✅ Has structured data: ${cultureResult.cuisineData ? 'Yes' : 'No'}`);
      
      if (cultureResult.cuisineData) {
        for (const [culture, data] of Object.entries(cultureResult.cuisineData)) {
          console.log(`  📊 ${culture} Data Preview:`);
          console.log(`    - Staple dishes: ${data.staple_dishes?.slice(0, 2).map(d => d.name).join(', ') || 'None'}`);
          console.log(`    - Common proteins: ${data.common_proteins?.slice(0, 3).join(', ') || 'None'}`);
          console.log(`    - Cooking methods: ${data.cooking_methods?.slice(0, 3).join(', ') || 'None'}`);
        }
      }

      // Step 2: Enhanced conflict resolution
      console.log('\n🔄 Step 2: Enhanced Conflict Resolution...');
      const conflictResult = await resolveConflictsWithCuisineData(
        testCase.input,
        testCase.dietary,
        cultureResult
      );

      console.log(`  ✅ Has conflict: ${conflictResult.hasConflict}`);
      console.log(`  ✅ Conflict type: ${conflictResult.conflictType}`);
      console.log(`  ✅ Cultural authenticity: ${conflictResult.culturalAuthenticity.toFixed(2)}`);
      console.log(`  ✅ Generated ${conflictResult.suggestedAlternatives.length} alternatives`);

      // Show alternatives
      if (conflictResult.suggestedAlternatives.length > 0) {
        console.log('\n📋 Suggested Alternatives:');
        conflictResult.suggestedAlternatives.forEach((alt, idx) => {
          console.log(`  ${idx + 1}. ${alt.dishName} (${alt.cuisine})`);
          console.log(`     ${alt.description}`);
          console.log(`     Cook time: ${alt.cookTime}min | Difficulty: ${alt.difficultyRating}/5`);
          console.log(`     Cultural notes: ${alt.culturalNotes}`);
        });
      }

      // Show explanations
      if (conflictResult.explanations.length > 0) {
        console.log('\n💡 Explanations:');
        conflictResult.explanations.forEach(exp => console.log(`  - ${exp}`));
      }

      console.log('\n✅ Test completed successfully!');

    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`);
      console.error(error.stack);
    }
  }

  console.log('\n🎉 Enhanced Cultural Integration Testing Complete!');
}

// Run the test
testEnhancedIntegration().catch(console.error);
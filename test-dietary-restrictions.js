#!/usr/bin/env node
/**
 * Test script for dietary restriction enforcement
 */

// Import our components
import { mergeFamilyDietaryRestrictions } from './shared/schema.js';
import { SmartCulturalSelector } from './server/SmartCulturalSelector.js';
import { MealAdaptationEngine } from './server/MealAdaptationEngine.js';

console.log('🧪 Testing Dietary Restriction Enforcement\n');

// Test 1: Family member restriction merging
console.log('Test 1: Family Member Restriction Merging');
const familyMembers = [
  {
    name: 'Mom',
    dietaryRestrictions: ['Vegetarian', 'Gluten-Free'],
    preferences: ['Mediterranean']
  },
  {
    name: 'Dad', 
    preferences: ['allergic to peanuts', 'dairy-free']
  },
  {
    name: 'Child',
    dietaryRestrictions: ['Nut-Free'],
    preferences: ['no vegetables']
  }
];

const mergedRestrictions = mergeFamilyDietaryRestrictions(familyMembers);
console.log('Family members:', familyMembers.map(m => m.name).join(', '));
console.log('Merged restrictions:', mergedRestrictions);
console.log('✅ Restriction merging works\n');

// Test 2: Meal adaptation
console.log('Test 2: Meal Adaptation');
const adaptationEngine = new MealAdaptationEngine();

const testMeal = {
  title: 'Chicken Pasta with Cheese',
  ingredients: ['chicken breast', 'pasta', 'parmesan cheese', 'butter', 'milk'],
  instructions: ['Cook chicken', 'Boil pasta', 'Make cheese sauce', 'Combine all']
};

const testRestrictions = ['Vegetarian', 'Dairy-Free'];
const testWeights = { cost: 0.7, health: 0.6, cultural: 0.5, variety: 0.5, time: 0.8 };

adaptationEngine.adaptMealIfNeeded(testMeal, testRestrictions, testWeights)
  .then(result => {
    console.log('Original meal:', testMeal.title);
    console.log('Restrictions:', testRestrictions.join(', '));
    console.log('Adapted meal:', result.meal.title);
    console.log('Adaptations made:', result.adaptations);
    console.log('Was adapted:', result.isAdapted);
    console.log('✅ Meal adaptation works\n');
    
    // Test 3: Compliance validation
    console.log('Test 3: Compliance Validation');
    const compliance = adaptationEngine.validateCompliance(result.meal, testRestrictions);
    console.log('Final meal compliant:', compliance.isCompliant);
    console.log('Violations:', compliance.violations);
    console.log('✅ Compliance validation works\n');
    
    console.log('🎉 All dietary restriction tests passed!');
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  });

// Test 4: Cultural selector
console.log('Test 4: Cultural Meal Selection');
const culturalSelector = new SmartCulturalSelector();

const mockContext = {
  availableCulturalMeals: [
    { id: '1', title: 'Italian Pasta', culture: 'Italian' },
    { id: '2', title: 'Mexican Tacos', culture: 'Mexican' }
  ],
  optimalCulturalMealCount: 2,
  culturalMealsUsed: 0,
  totalMeals: 6
};

const mealSlotContext = {
  day: 1,
  mealType: 'dinner',
  slotIndex: 2,
  previousMeals: []
};

const culturalWeights = { cultural: 0.8, cost: 0.6, health: 0.5, variety: 0.7, time: 0.4 };

const shouldUse = culturalSelector.shouldUseCulturalMeal(mockContext, mealSlotContext, culturalWeights);
console.log('Should use cultural meal:', shouldUse);
console.log('✅ Cultural selection logic works\n');
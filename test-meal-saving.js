#!/usr/bin/env node

import fetch from 'node-fetch';
import fs from 'fs';

// Test configuration
const BASE_URL = 'http://localhost:5000';

// Debug meal plan saving
async function testMealPlanSaving() {
  console.log('🧪 Testing Meal Plan Saving...\n');

  // First, test user registration/login to get auth token
  const testUser = {
    email: `test${Date.now()}@example.com`, // Use unique email to avoid conflicts
    password: 'test123',
    full_name: 'Test User'
  };

  try {
    // Step 1: Register or login to get auth token
    console.log('🔐 Step 1: Authentication...');
    let authToken;
    
    // Try to register
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      authToken = registerData.token;
      console.log('✅ User registered successfully');
    } else {
      // User might already exist, try login
      console.log('📝 User might exist, trying login...');
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUser.email, password: testUser.password })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        authToken = loginData.token;
        console.log('✅ User logged in successfully');
      } else {
        const error = await loginResponse.text();
        console.error('❌ Authentication failed:', error);
        return;
      }
    }

    console.log('🎟️  Auth token:', authToken.substring(0, 20) + '...\n');

    // Step 2: Test fetching current saved meal plans
    console.log('📋 Step 2: Fetching current saved meal plans...');
    const savedPlansResponse = await fetch(`${BASE_URL}/api/meal-plans/saved`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (savedPlansResponse.ok) {
      const savedPlans = await savedPlansResponse.json();
      console.log('✅ Fetched saved plans:', savedPlans.length, 'plans found');
      console.log('📊 Current plans:', savedPlans.map(p => ({ id: p.id, name: p.name })));
    } else {
      const error = await savedPlansResponse.text();
      console.error('❌ Failed to fetch saved plans:', error);
    }

    // Step 3: Test saving a new meal plan
    console.log('\n💾 Step 3: Testing meal plan saving...');
    const testMealPlan = {
      name: `Test Plan ${Date.now()}`,
      description: 'A test meal plan generated for debugging',
      meal_plan: {
        day_1: {
          breakfast: {
            title: 'Oatmeal with Berries',
            cook_time_minutes: 10,
            difficulty: 2,
            ingredients: ['oats', 'berries', 'milk']
          },
          lunch: {
            title: 'Grilled Chicken Salad',
            cook_time_minutes: 15,
            difficulty: 3,
            ingredients: ['chicken', 'lettuce', 'tomatoes']
          },
          dinner: {
            title: 'Pasta with Marinara',
            cook_time_minutes: 20,
            difficulty: 2,
            ingredients: ['pasta', 'marinara sauce', 'parmesan']
          }
        },
        day_2: {
          breakfast: {
            title: 'Scrambled Eggs',
            cook_time_minutes: 8,
            difficulty: 1,
            ingredients: ['eggs', 'butter', 'cheese']
          },
          lunch: {
            title: 'Turkey Sandwich',
            cook_time_minutes: 5,
            difficulty: 1,
            ingredients: ['bread', 'turkey', 'lettuce']
          },
          dinner: {
            title: 'Baked Salmon',
            cook_time_minutes: 25,
            difficulty: 3,
            ingredients: ['salmon', 'lemon', 'herbs']
          }
        }
      }
    };

    console.log('📦 Saving meal plan:', testMealPlan.name);
    console.log('📊 Meal plan structure:');
    console.log('   - Days:', Object.keys(testMealPlan.meal_plan).length);
    console.log('   - Meals per day:', Object.keys(testMealPlan.meal_plan.day_1).length);

    const saveResponse = await fetch(`${BASE_URL}/api/meal-plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(testMealPlan)
    });

    if (saveResponse.ok) {
      const savedPlan = await saveResponse.json();
      console.log('✅ Meal plan saved successfully!');
      console.log('🆔 Saved plan ID:', savedPlan.id);
      console.log('📝 Saved plan name:', savedPlan.name);
      
      // Save the result to a file for inspection
      fs.writeFileSync('./meal-plan-save-test-result.json', JSON.stringify({
        savedPlan,
        originalPlan: testMealPlan,
        timestamp: new Date().toISOString()
      }, null, 2));
      
      console.log('💾 Test result saved to: meal-plan-save-test-result.json');
    } else {
      const error = await saveResponse.text();
      console.error('❌ Failed to save meal plan:', error);
      
      // Save the error for debugging
      fs.writeFileSync('./meal-plan-save-error.json', JSON.stringify({
        error,
        status: saveResponse.status,
        headers: Object.fromEntries(saveResponse.headers.entries()),
        requestBody: testMealPlan,
        timestamp: new Date().toISOString()
      }, null, 2));
      
      console.log('🚨 Error details saved to: meal-plan-save-error.json');
    }

    // Step 4: Verify the meal plan was saved by fetching again
    console.log('\n🔍 Step 4: Verifying meal plan was saved...');
    const verifyResponse = await fetch(`${BASE_URL}/api/meal-plans/saved`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (verifyResponse.ok) {
      const updatedPlans = await verifyResponse.json();
      console.log('✅ Verification complete:', updatedPlans.length, 'plans found');
      console.log('📊 Updated plans:', updatedPlans.map(p => ({ 
        id: p.id, 
        name: p.name, 
        createdAt: p.createdAt 
      })));
    } else {
      const error = await verifyResponse.text();
      console.error('❌ Failed to verify saved plans:', error);
    }

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    console.error('📊 Stack trace:', error.stack);
  }
}

// Run the test
testMealPlanSaving().then(() => {
  console.log('\n🏁 Test completed!');
}).catch(error => {
  console.error('💥 Test runner failed:', error);
});
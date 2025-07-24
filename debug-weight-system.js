#!/usr/bin/env node

/**
 * Debug Weight-based Meal Planning System
 * This script tests the weight-based endpoint directly to identify the issue
 */

import { registerRoutes } from './dist/routes.js';
import express from 'express';

async function debugWeightBasedSystem() {
  console.log('🔧 Starting Weight-based System Debug...\n');
  
  try {
    // Create test app
    const app = express();
    app.use(express.json());
    
    // Mock authentication middleware for testing
    const mockAuth = (req, res, next) => {
      req.user = { id: 9 }; // Test user ID
      next();
    };
    
    // Register routes with mock auth
    app.use('/api', mockAuth);
    await registerRoutes(app);
    
    const server = app.listen(5001, () => {
      console.log('✅ Test server started on port 5001');
    });
    
    // Test request
    const testRequest = {
      numDays: 3,
      mealsPerDay: 3,
      goalWeights: {
        cost: 0.8,
        health: 0.6,
        cultural: 0.3,
        variety: 0.4,
        time: 0.7
      },
      dietaryRestrictions: ['vegetarian'],
      culturalBackground: ['Italian'],
      availableIngredients: "rice, chicken, olive oil, tomatoes",
      excludeIngredients: "beef, pork",
      familySize: 3
    };
    
    console.log('📝 Testing with request data:');
    console.log('   - Days:', testRequest.numDays);
    console.log('   - Meals per day:', testRequest.mealsPerDay);
    console.log('   - Cost weight:', testRequest.goalWeights.cost);
    console.log('   - Health weight:', testRequest.goalWeights.health);
    
    // Make direct request
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:5001/api/meal-plan/generate-weight-based', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testRequest)
    });
    
    console.log('\n📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      console.log('\n🔍 Possible issues:');
      console.log('   - Missing dependencies');
      console.log('   - API key problems');
      console.log('   - Database connection issues');
      console.log('   - Prompt builder V2 integration problems');
    } else {
      const data = await response.json();
      console.log('\n✅ Success! Meal plan generated');
      
      if (data.meal_plan) {
        const days = Object.keys(data.meal_plan);
        console.log(`   - Generated ${days.length} days`);
        
        if (days.length > 0) {
          const firstDay = data.meal_plan[days[0]];
          const meals = Object.keys(firstDay);
          console.log(`   - Day 1 has ${meals.length} meals`);
          
          if (meals.length > 0) {
            const firstMeal = firstDay[meals[0]];
            console.log(`   - Sample meal: "${firstMeal.title}"`);
          }
        }
        
        if (data.generation_metadata) {
          console.log(`   - Generation type: ${data.generation_metadata.type}`);
          console.log(`   - Main goal: ${data.generation_metadata.main_goal}`);
          console.log(`   - Prompt version: ${data.generation_metadata.prompt_builder_version}`);
        }
      } else {
        console.log('❌ No meal_plan in response');
        console.log('Response keys:', Object.keys(data));
      }
    }
    
    server.close();
    
  } catch (error) {
    console.error('\n❌ Debug failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run debug
debugWeightBasedSystem()
  .then(() => console.log('\n🏁 Debug completed'))
  .catch(console.error);
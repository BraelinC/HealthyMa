// Test script to check nutrition data from API
const fetch = require('node-fetch');

async function testNutritionEndpoint() {
  console.log('🧪 Testing nutrition data retrieval from API...\n');
  
  try {
    // First, we need to login to get a token
    console.log('1. Logging in...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',  // You'll need valid credentials
        password: 'testpassword'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('Login failed, trying without auth...');
      
      // Try to get recipes without auth (if any are public)
      const publicResponse = await fetch('http://localhost:5000/api/recipes/popular');
      
      if (publicResponse.ok) {
        const recipes = await publicResponse.json();
        console.log('\n2. Got public recipes:', recipes.length);
        
        if (recipes.length > 0) {
          const recipe = recipes[0];
          console.log('\nFirst recipe:');
          console.log('- Title:', recipe.title);
          console.log('- Has nutrition_info?', !!recipe.nutrition_info);
          
          if (recipe.nutrition_info) {
            console.log('- Nutrition data type:', typeof recipe.nutrition_info);
            console.log('- Nutrition preview:', JSON.stringify(recipe.nutrition_info).substring(0, 100));
          }
        }
      }
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log('✅ Logged in successfully');
    
    // Get generated recipes
    console.log('\n2. Fetching generated recipes...');
    const recipesResponse = await fetch('http://localhost:5000/api/recipes/generated', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (recipesResponse.ok) {
      const recipes = await recipesResponse.json();
      console.log('✅ Got', recipes.length, 'generated recipes');
      
      // Check nutrition data in recipes
      let withNutrition = 0;
      recipes.forEach(recipe => {
        if (recipe.nutrition_info) {
          withNutrition++;
          console.log('\nRecipe:', recipe.title);
          console.log('Nutrition:', JSON.stringify(recipe.nutrition_info).substring(0, 100) + '...');
        }
      });
      
      console.log('\nRecipes with nutrition:', withNutrition, '/', recipes.length);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testNutritionEndpoint();

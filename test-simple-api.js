// Simple API test for cooking calculator
import fetch from 'node-fetch';

async function testAPI() {
  try {
    const response = await fetch('http://localhost:5000/api/recipes/calculate-timing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipe: {
          title: "Simple Eggs",
          ingredients: ["eggs", "butter"],
          instructions: ["Beat eggs", "Cook in pan"]
        }
      })
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    const text = await response.text();
    console.log('Response:', text.substring(0, 200));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();
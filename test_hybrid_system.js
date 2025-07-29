import fetch from 'node-fetch';

async function testHybridSystem() {
  try {
    console.log('Testing hybrid goal system with Peruvian cultural weight...');
    
    const response = await fetch('http://localhost:5000/api/meal-plan/generate-weight-based', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNCIsImlhdCI6MTc1Mzc0MTU0MywiZXhwIjoxNzU0MzQ2MzQzfQ.8MFFIl6HQBKHgdXF9P8McrdAHiukEj0SIbUD2E6zlwI'
      },
      body: JSON.stringify({
        userId: 1,
        numDays: 1,
        mealsPerDay: 1,
        culturalBackground: ['Peruvian'],
        goalWeights: {
          cultural: 0.7,    // VERY HIGH (above 0.3 threshold)
          cost: 0.533,      // HIGH (above 0.3 threshold)  
          health: 0.25,     // Below 0.3 threshold - should not be applied
          variety: 0.35,    // MODERATE (above 0.3 threshold)
          time: 0.2         // Below 0.3 threshold - should not be applied
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    console.log('Response received (first 500 chars):', data.substring(0, 500));
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testHybridSystem();
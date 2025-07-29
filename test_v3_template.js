import fetch from 'node-fetch';
import { spawn } from 'child_process';

async function testV3Template() {
  console.log('🧪 Testing V3 Template System...\n');
  
  // Get auth token
  const authRes = await fetch('http://localhost:5000/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'test', password: 'test123' })
  });
  
  const { token } = await authRes.json();
  console.log('✅ Got auth token');
  
  // Test weight-based meal plan generation
  console.log('\n📝 Requesting weight-based meal plan...');
  const mealPlanRes = await fetch('http://localhost:5000/api/meal-plan/generate-weight-based', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      numDays: 3,
      mealsPerDay: 3,
      maxCookTime: 30,      // UI value
      maxDifficulty: 2,     // UI value
      familySize: 2,
      goalWeights: {
        cost: 0.8,
        health: 0.7,
        cultural: 0.9,
        variety: 0.5,
        time: 0.6
      },
      culturalBackground: ['Chinese'],
      dietaryRestrictions: []
    })
  });
  
  if (!mealPlanRes.ok) {
    const error = await mealPlanRes.text();
    console.error('❌ Failed:', error);
    return;
  }
  
  const result = await mealPlanRes.json();
  console.log('\n✅ Got response');
  console.log('Debug info:', result.debugInfo?.promptSystem);
  console.log('Prompt length:', result.debugInfo?.promptLength);
  
  // Check if the prompt contains template markers
  const debugPrompt = result.debugPrompt;
  if (debugPrompt) {
    console.log('\n🔍 Checking for V3 template markers:');
    console.log('- Contains "DYNAMIC WEIGHT-BASED PRIORITY SYSTEM":', debugPrompt.includes('DYNAMIC WEIGHT-BASED PRIORITY SYSTEM'));
    console.log('- Contains "Max cook time: 30 minutes":', debugPrompt.includes('Max cook time: 30 minutes'));
    console.log('- Contains "Difficulty level: MAXIMUM 2/5":', debugPrompt.includes('Difficulty level: MAXIMUM 2/5'));
    console.log('- Contains old "45 minutes" hardcode:', debugPrompt.includes('45 minutes'));
    console.log('- Contains old "difficulty 3" hardcode:', debugPrompt.includes('difficulty 3'));
    
    // Print first 500 chars of prompt
    console.log('\n📄 First 500 chars of prompt:');
    console.log(debugPrompt.substring(0, 500));
  }
}

// Start server first
console.log('🚀 Starting server...');
const server = spawn('npm', ['run', 'dev'], {
  detached: true,
  stdio: 'ignore'
});

// Wait for server to start
setTimeout(() => {
  testV3Template()
    .then(() => {
      console.log('\n✅ Test complete');
      process.kill(-server.pid); // Kill server process group
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Test failed:', err);
      process.kill(-server.pid);
      process.exit(1);
    });
}, 3000);
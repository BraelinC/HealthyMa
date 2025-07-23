// Test multiple Perplexity research calls to debug the issue
console.log('=== TESTING PERPLEXITY RESEARCH CALLS ===\n');

async function testResearchCall(cuisine) {
  console.log(`🔍 Testing research for: ${cuisine}`);
  
  const response = await fetch('http://localhost:5000/api/cultural-cuisine-research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cuisine })
  });
  
  console.log(`📡 Response status: ${response.status} ${response.statusText}`);
  
  if (response.ok) {
    const data = await response.json();
    console.log(`✅ Success for ${cuisine} - got ${data.meals?.length || 0} meals`);
    return true;
  } else {
    const error = await response.text();
    console.log(`❌ Failed for ${cuisine}: ${error}`);
    return false;
  }
}

async function runTests() {
  const cuisines = ['Indian', 'Chinese', 'Mexican', 'Indian']; // Note: Indian twice to test cache/repeat
  
  for (let i = 0; i < cuisines.length; i++) {
    const cuisine = cuisines[i];
    console.log(`\n--- Test ${i + 1}: ${cuisine} ---`);
    
    const success = await testResearchCall(cuisine);
    
    // Wait a bit between calls
    if (i < cuisines.length - 1) {
      console.log('⏳ Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n=== TESTS COMPLETED ===');
}

runTests().catch(console.error);
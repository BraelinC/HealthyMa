// Test script for Google Vision API integration
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Test with a sample base64 image (1x1 red pixel)
const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

async function testVisionAPI() {
  console.log('🧪 Testing Google Vision API integration...\n');
  
  try {
    // Test the backend endpoint
    console.log('📡 Calling /api/detect-ingredients endpoint...');
    
    const response = await fetch('http://localhost:5000/api/detect-ingredients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: testImage
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API request failed (${response.status}): ${error}`);
    }
    
    const data = await response.json();
    
    console.log('\n✅ Vision API Response:');
    console.log('---------------------------');
    console.log(`Ingredients detected: ${data.ingredients?.length || 0}`);
    
    if (data.ingredients && data.ingredients.length > 0) {
      console.log('\nDetected items:');
      data.ingredients.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item.name} (${(item.confidence * 100).toFixed(1)}% confidence)`);
        if (item.bbox) {
          console.log(`     Bounding box: [${item.bbox.join(', ')}]`);
        }
        console.log(`     Source: ${item.source}`);
      });
    }
    
    if (data.raw) {
      console.log('\nRaw detection stats:');
      console.log(`  Objects: ${data.raw.objects}`);
      console.log(`  Labels: ${data.raw.labels}`);
      console.log(`  Has text: ${data.raw.hasText}`);
    }
    
    console.log('\n✅ Vision API integration test successful!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nMake sure the server is running: npm run dev');
  }
}

// Run the test
testVisionAPI();
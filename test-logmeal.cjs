// Test script for LogMeal API endpoint
const https = require('https');
const http = require('http');

// Create a simple test image (1x1 white pixel in base64)
const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

async function testLogMealEndpoint() {
  console.log('🧪 Testing LogMeal endpoint...');
  
  const postData = JSON.stringify({
    image: testImageBase64
  });
  
  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/detect-foods-logmeal',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log('📊 Response status:', res.statusCode);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const jsonData = JSON.parse(data);
            console.log('✅ Response data:', JSON.stringify(jsonData, null, 2));
          } else {
            console.log('❌ Error response:', data);
          }
          resolve();
        } catch (error) {
          console.error('❌ Parse error:', error.message);
          resolve();
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      resolve();
    });
    
    req.write(postData);
    req.end();
  });
}

testLogMealEndpoint();
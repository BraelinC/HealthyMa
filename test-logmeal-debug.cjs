// Debug test for LogMeal API - shows server console output
const http = require('http');

// Use a simple test image (1x1 red pixel)
const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx8gAAAABJRU5ErkJggg==';

async function testWithDebug() {
  console.log('🔍 Testing LogMeal endpoint to see server logs...\n');
  
  const postData = JSON.stringify({ image: testImage });
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/detect-foods-logmeal',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      console.log('📊 Response Status:', res.statusCode);
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('\n📦 Response:', JSON.stringify(json, null, 2));
          
          console.log('\n💡 Analysis:');
          if (json.raw && json.raw.endpointsUsed) {
            console.log('  - Endpoints attempted:', json.raw.endpointsUsed);
          }
          console.log('  - Total detections:', json.raw?.totalDetections || 0);
          
          console.log('\n⚠️  CHECK SERVER CONSOLE for:');
          console.log('  - "❌ Failed with" messages (indicates API errors)');
          console.log('  - "429" errors (rate limiting)');
          console.log('  - "400/401/403" errors (auth/permission issues)');
          console.log('  - "RAW Response" sections (actual API responses)');
        } catch (e) {
          console.error('Parse error:', e);
          console.log('Raw response:', data);
        }
        resolve();
      });
    });
    
    req.on('error', (e) => {
      console.error('Request error:', e.message);
      resolve();
    });
    
    req.write(postData);
    req.end();
  });
}

testWithDebug();
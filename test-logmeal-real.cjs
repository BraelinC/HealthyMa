// Test script for LogMeal API endpoint with a real food image
const http = require('http');
const fs = require('fs');
const path = require('path');

// Base64 encoded image of an apple (small red apple image)
// This is a real food image that should be detectable by LogMeal
const realFoodImageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCABAAEADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//2Q==';

async function testLogMealEndpoint() {
  console.log('🧪 Testing LogMeal endpoint with real food image...');
  console.log('📸 Using a base64 encoded image of food');
  
  const postData = JSON.stringify({
    image: realFoodImageBase64
  });
  
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
            
            // Analyze the response
            if (jsonData.ingredients && jsonData.ingredients.length > 0) {
              console.log('\n🎉 Successfully detected', jsonData.ingredients.length, 'food items:');
              jsonData.ingredients.forEach((item, index) => {
                console.log(`  ${index + 1}. ${item.name} - ${item.amount}${item.unit} (${(item.confidence * 100).toFixed(1)}% confidence)`);
              });
            } else {
              console.log('\n⚠️ No food items detected. This might indicate an issue with:');
              console.log('  - The LogMeal API endpoints');
              console.log('  - The API key permissions');
              console.log('  - The image processing');
            }
            
            if (jsonData.raw) {
              console.log('\n📊 Detection breakdown:');
              console.log('  - Total detections:', jsonData.raw.totalDetections);
              console.log('  - Unique detections:', jsonData.raw.uniqueDetections);
              console.log('  - Endpoints used:', jsonData.raw.endpointsUsed);
              console.log('  - Source breakdown:', jsonData.raw.sourceBreakdown);
            }
          } else {
            console.log('❌ Error response:', data);
          }
          resolve();
        } catch (error) {
          console.error('❌ Parse error:', error.message);
          console.log('Raw response:', data.substring(0, 500));
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

// Run the test
testLogMealEndpoint();
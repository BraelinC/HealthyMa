// Direct test of LogMeal API
const axios = require('axios');
const FormData = require('form-data');

async function testDirectLogMealAPI() {
  const LOGMEAL_API_KEY = '79cbe9badc6d24d77ffbcd536692c6fd697de89d';
  const LOGMEAL_API_URL = 'https://api.logmeal.es/v2';
  
  // Create a simple test image buffer (1x1 red pixel)
  const imageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx8gAAAABJRU5ErkJggg==';
  const imageBuffer = Buffer.from(imageBase64, 'base64');
  
  console.log('🔍 Testing LogMeal API directly...\n');
  console.log('API Key:', LOGMEAL_API_KEY.substring(0, 10) + '...');
  console.log('API URL:', LOGMEAL_API_URL);
  
  // Test endpoints
  const endpoints = [
    '/recognition/dish',
    '/image/recognition/type',
    '/image/recognition/type/v1.0'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n📡 Testing endpoint: ${endpoint}`);
    
    const formData = new FormData();
    formData.append('image', imageBuffer, {
      filename: 'test.jpg',
      contentType: 'image/jpeg'
    });
    
    try {
      const response = await axios.post(
        `${LOGMEAL_API_URL}${endpoint}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${LOGMEAL_API_KEY}`,
            ...formData.getHeaders()
          },
          timeout: 10000,
          validateStatus: () => true // Don't throw on any status
        }
      );
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.status === 200) {
        console.log('   ✅ SUCCESS! Response:', JSON.stringify(response.data, null, 2).substring(0, 500));
      } else if (response.status === 429) {
        console.log('   ⚠️ RATE LIMITED - Too many requests');
      } else if (response.status === 401 || response.status === 403) {
        console.log('   ❌ AUTHENTICATION ERROR - API key issue');
        console.log('   Response:', JSON.stringify(response.data, null, 2).substring(0, 200));
      } else if (response.status === 400) {
        console.log('   ❌ BAD REQUEST - Endpoint or format issue');
        console.log('   Response:', JSON.stringify(response.data, null, 2).substring(0, 200));
      } else {
        console.log('   ❌ ERROR:', response.status);
        console.log('   Response:', JSON.stringify(response.data, null, 2).substring(0, 200));
      }
      
    } catch (error) {
      console.log('   ❌ Network/Connection Error:', error.message);
      if (error.response) {
        console.log('   Response Status:', error.response.status);
        console.log('   Response Data:', JSON.stringify(error.response.data, null, 2).substring(0, 200));
      }
    }
  }
  
  console.log('\n\n💡 SUGGESTIONS:');
  console.log('1. If you see 401/403 errors: The API key may be invalid or expired');
  console.log('2. If you see 429 errors: You are being rate limited');
  console.log('3. If you see 400 errors: The endpoint format has changed');
  console.log('4. If you see network errors: Check your internet connection');
  console.log('5. Consider getting a new API key from https://logmeal.com');
}

testDirectLogMealAPI();
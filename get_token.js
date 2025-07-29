import fetch from 'node-fetch';

async function getTestToken() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/test-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Token data:', data);
    return data.token;
    
  } catch (error) {
    console.error('Failed to get token:', error.message);
    return null;
  }
}

getTestToken().then(token => {
  if (token) {
    console.log('Use this token:', token);
  }
});
import fetch from 'node-fetch';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function testSimpleProjects() {
  try {
    console.log('🧪 Testing basic projects endpoint...');
    
    // First, let's try to login to get a token
    console.log('\n🔐 Attempting to authenticate...');
    
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@logicworks.com',
        password: 'password123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.data?.token;
      
      if (token) {
        console.log('✅ Login successful, got token');
        
        // Test the basic projects endpoint first
        console.log('\n📊 Testing basic projects endpoint...');
        
        const basicProjectsResponse = await fetch(`${API_BASE_URL}/api/projects`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        console.log(`📊 Basic projects response: ${basicProjectsResponse.status} ${basicProjectsResponse.statusText}`);
        
        if (basicProjectsResponse.ok) {
          const data = await basicProjectsResponse.json();
          console.log('✅ Basic projects endpoint working');
          console.log(`   Data: ${JSON.stringify(data, null, 2)}`);
        } else {
          console.log('❌ Basic projects endpoint failed');
        }
        
        // Test the test endpoint
        console.log('\n📊 Testing projects test endpoint...');
        
        const testResponse = await fetch(`${API_BASE_URL}/api/projects/test`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        console.log(`📊 Test endpoint response: ${testResponse.status} ${testResponse.statusText}`);
        
        if (testResponse.ok) {
          const data = await testResponse.json();
          console.log('✅ Test endpoint working');
          console.log(`   Data: ${JSON.stringify(data, null, 2)}`);
        } else {
          console.log('❌ Test endpoint failed');
        }
        
        // Now test the all-comprehensive endpoint
        console.log('\n📊 Testing all-comprehensive endpoint...');
        
        const comprehensiveResponse = await fetch(`${API_BASE_URL}/api/projects/all-comprehensive`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        console.log(`📊 All-comprehensive response: ${comprehensiveResponse.status} ${comprehensiveResponse.statusText}`);
        
        if (comprehensiveResponse.ok) {
          const data = await comprehensiveResponse.json();
          console.log('✅ All-comprehensive endpoint working');
          console.log(`   Data count: ${data.data ? data.data.length : 0}`);
        } else {
          console.log('❌ All-comprehensive endpoint failed');
          
          // Try to get error details
          try {
            const errorData = await comprehensiveResponse.text();
            console.log('Error response:', errorData);
          } catch (e) {
            console.log('Could not read error response');
          }
        }
        
      } else {
        console.log('❌ No token received');
      }
      
    } else {
      console.log(`❌ Login failed: ${loginResponse.status}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSimpleProjects();

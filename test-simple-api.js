import fetch from 'node-fetch';

async function testSimpleAPI() {
  console.log('🧪 Simple API Test\n');

  try {
    // Test health endpoint first
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    console.log('Health status:', healthResponse.status);
    const healthData = await healthResponse.json();
    console.log('Health data:', healthData);

    // Test create-user endpoint with minimal data
    console.log('\n2. Testing create-user endpoint...');
    const testData = {
      employee_id: "86f80dea-829a-4632-8560-0770c715c271",
      password: "TestPassword123!"
    };

    console.log('Sending data:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:3001/api/admin/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Response text:', responseText);

    try {
      const responseJson = JSON.parse(responseText);
      console.log('Response JSON:', JSON.stringify(responseJson, null, 2));
    } catch (e) {
      console.log('Response is not JSON');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSimpleAPI(); 
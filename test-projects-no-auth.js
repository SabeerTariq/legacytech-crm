import fetch from 'node-fetch';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function testProjectsNoAuth() {
  try {
    console.log('🧪 Testing projects endpoints without authentication...');
    
    // Test the basic projects endpoint (should return 401)
    console.log('\n📊 Testing basic projects endpoint (no auth)...');
    
    const basicResponse = await fetch(`${API_BASE_URL}/api/projects`);
    console.log(`📊 Basic projects response: ${basicResponse.status} ${basicResponse.statusText}`);
    
    // Test the test endpoint (should return 401)
    console.log('\n📊 Testing projects test endpoint (no auth)...');
    
    const testResponse = await fetch(`${API_BASE_URL}/api/projects/test`);
    console.log(`📊 Test endpoint response: ${testResponse.status} ${testResponse.statusText}`);
    
    // Test the all-comprehensive endpoint (should return 401)
    console.log('\n📊 Testing all-comprehensive endpoint (no auth)...');
    
    const comprehensiveResponse = await fetch(`${API_BASE_URL}/api/projects/all-comprehensive`);
    console.log(`📊 All-comprehensive response: ${comprehensiveResponse.status} ${comprehensiveResponse.statusText}`);
    
    // Test a non-existent endpoint (should return 404)
    console.log('\n📊 Testing non-existent endpoint...');
    
    const nonExistentResponse = await fetch(`${API_BASE_URL}/api/projects/non-existent-route`);
    console.log(`📊 Non-existent response: ${nonExistentResponse.status} ${nonExistentResponse.statusText}`);
    
    // Test the health endpoint (should return 200)
    console.log('\n📊 Testing health endpoint (no auth)...');
    
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
    console.log(`📊 Health response: ${healthResponse.status} ${healthResponse.statusText}`);
    
    console.log('\n📋 Summary:');
    console.log('   - Basic projects (no auth):', basicResponse.status);
    console.log('   - Test endpoint (no auth):', testResponse.status);
    console.log('   - All-comprehensive (no auth):', comprehensiveResponse.status);
    console.log('   - Non-existent route:', nonExistentResponse.status);
    console.log('   - Health endpoint:', healthResponse.status);
    
    // If all-comprehensive returns 404 instead of 401, that means the route is not registered
    if (comprehensiveResponse.status === 404) {
      console.log('\n⚠️  All-comprehensive route is returning 404 instead of 401');
      console.log('💡 This suggests the route is not registered or there is a routing conflict');
    } else if (comprehensiveResponse.status === 401) {
      console.log('\n✅ All-comprehensive route is properly registered (returning 401 for no auth)');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testProjectsNoAuth();

import fetch from 'node-fetch';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function testAllProjectsAPIWithAuth() {
  try {
    console.log('🧪 Testing AllProjects API endpoint with authentication...');
    
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
      console.log('✅ Login successful');
      console.log('📋 Login response data:', JSON.stringify(loginData, null, 2));
      
      // Extract token from the nested data structure
      const token = loginData.data?.token;
      
      if (token) {
        console.log('🎫 Got authentication token');
        
        // Now test the AllProjects endpoint with the token
        console.log('\n📊 Testing AllProjects endpoint with token...');
        
        const projectsResponse = await fetch(`${API_BASE_URL}/api/projects/all-comprehensive`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        console.log(`📊 Response Status: ${projectsResponse.status} ${projectsResponse.statusText}`);
        
        if (projectsResponse.ok) {
          const data = await projectsResponse.json();
          
          console.log('\n✅ API Response:');
          console.log(`   Success: ${data.success}`);
          console.log(`   Data Count: ${data.data ? data.data.length : 0}`);
          
          if (data.data && data.data.length > 0) {
            console.log('\n📋 Sample Project Data:');
            const sampleProject = data.data[0];
            
            console.log(`   Project Name: ${sampleProject.name}`);
            console.log(`   Client: ${sampleProject.client}`);
            console.log(`   Status: ${sampleProject.status}`);
            console.log(`   PM: ${sampleProject.assigned_pm_name || 'Unassigned'}`);
            console.log(`   Department: ${sampleProject.pm_department || 'N/A'}`);
            console.log(`   Total Amount: $${sampleProject.display_total_amount || 0}`);
            console.log(`   Amount Paid: $${sampleProject.display_amount_paid || 0}`);
            console.log(`   Services: ${sampleProject.services ? sampleProject.services.join(', ') : 'None'}`);
            
            // Check if all required fields are present
            const requiredFields = [
              'id', 'name', 'client', 'description', 'due_date', 'status',
              'assigned_pm_name', 'pm_department', 'pm_job_title',
              'display_total_amount', 'display_amount_paid', 'display_remaining', 'display_budget'
            ];
            
            const missingFields = requiredFields.filter(field => !(field in sampleProject));
            
            if (missingFields.length > 0) {
              console.log(`\n⚠️  Missing fields: ${missingFields.join(', ')}`);
            } else {
              console.log('\n✅ All required fields are present');
            }
            
          } else {
            console.log('\n📭 No projects found in the database');
          }
          
          console.log('\n🎉 API test completed successfully!');
          
        } else {
          console.log(`❌ Projects API failed: ${projectsResponse.status} ${projectsResponse.statusText}`);
          
          if (projectsResponse.status === 401) {
            console.log('💡 Authentication token might be invalid or expired');
          }
        }
        
      } else {
        console.log('❌ No token received from login');
        console.log('💡 Available fields in login response:', Object.keys(loginData));
      }
      
    } else {
      console.log(`❌ Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
      
      if (loginResponse.status === 401) {
        console.log('\n💡 Login credentials might be incorrect');
        console.log('💡 Try creating a test user first or check existing users');
      }
      
      // Let's try to see what the error message is
      try {
        const errorData = await loginResponse.json();
        console.log('Error details:', errorData);
      } catch (e) {
        console.log('Could not parse error response');
      }
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the API server is running:');
      console.log('   npm run server');
    }
  }
}

// Run the test
testAllProjectsAPIWithAuth();

import fetch from 'node-fetch';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function testProjectAssignmentAPI() {
  try {
    console.log('🧪 Testing Project Assignment API endpoints...');
    
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
        
        // Test the unassigned projects endpoint
        console.log('\n📊 Testing unassigned projects endpoint...');
        
        const unassignedResponse = await fetch(`${API_BASE_URL}/api/projects/assignment/unassigned?user_id=${loginData.data.user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        console.log(`📊 Unassigned projects response: ${unassignedResponse.status} ${unassignedResponse.statusText}`);
        
        if (unassignedResponse.ok) {
          const data = await unassignedResponse.json();
          console.log('✅ Unassigned projects endpoint working');
          console.log(`   Projects found: ${data.data ? data.data.length : 0}`);
          
          if (data.data && data.data.length > 0) {
            console.log('\n📋 Sample unassigned project:');
            const sampleProject = data.data[0];
            console.log(`   Project Name: ${sampleProject.name}`);
            console.log(`   Client: ${sampleProject.client}`);
            console.log(`   Status: ${sampleProject.status}`);
            console.log(`   Budget: $${sampleProject.budget || 0}`);
            console.log(`   Services: ${sampleProject.services ? sampleProject.services.join(', ') : 'None'}`);
          }
        } else {
          console.log('❌ Unassigned projects endpoint failed');
          try {
            const errorData = await unassignedResponse.text();
            console.log('Error response:', errorData);
          } catch (e) {
            console.log('Could not read error response');
          }
        }
        
        // Test the project managers endpoint
        console.log('\n📊 Testing project managers endpoint...');
        
        const managersResponse = await fetch(`${API_BASE_URL}/api/projects/assignment/project-managers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        console.log(`📊 Project managers response: ${managersResponse.status} ${managersResponse.statusText}`);
        
        if (managersResponse.ok) {
          const data = await managersResponse.json();
          console.log('✅ Project managers endpoint working');
          console.log(`   Project managers found: ${data.data ? data.data.length : 0}`);
          
          if (data.data && data.data.length > 0) {
            console.log('\n📋 Sample project manager:');
            const samplePM = data.data[0];
            console.log(`   Name: ${samplePM.full_name}`);
            console.log(`   Email: ${samplePM.email}`);
            console.log(`   Department: ${samplePM.department}`);
            console.log(`   Job Title: ${samplePM.job_title || 'N/A'}`);
          }
        } else {
          console.log('❌ Project managers endpoint failed');
          try {
            const errorData = await managersResponse.text();
            console.log('Error response:', errorData);
          } catch (e) {
            console.log('Could not read error response');
          }
        }
        
        // Test the assign project endpoint (if we have projects and managers)
        console.log('\n📊 Testing assign project endpoint...');
        
        // Get projects and managers first
        const projectsResponse = await fetch(`${API_BASE_URL}/api/projects/assignment/unassigned?user_id=${loginData.data.user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        const managersResponse2 = await fetch(`${API_BASE_URL}/api/projects/assignment/project-managers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (projectsResponse.ok && managersResponse2.ok) {
          const projectsData = await projectsResponse.json();
          const managersData = await managersResponse2.json();
          
          if (projectsData.data && projectsData.data.length > 0 && managersData.data && managersData.data.length > 0) {
            const testProjectId = projectsData.data[0].id;
            const testPMId = managersData.data[0].id;
            
            console.log(`   Testing assignment: Project ${testProjectId} to PM ${testPMId}`);
            
            const assignResponse = await fetch(`${API_BASE_URL}/api/projects/assignment/assign`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                project_id: testProjectId,
                pm_id: testPMId
              })
            });
            
            console.log(`📊 Assign project response: ${assignResponse.status} ${assignResponse.statusText}`);
            
            if (assignResponse.ok) {
              const data = await assignResponse.json();
              console.log('✅ Assign project endpoint working');
              console.log(`   Assignment successful: ${data.message}`);
            } else {
              console.log('❌ Assign project endpoint failed');
              try {
                const errorData = await assignResponse.text();
                console.log('Error response:', errorData);
              } catch (e) {
                console.log('Could not read error response');
              }
            }
          } else {
            console.log('⚠️  Skipping assign test - no projects or managers available');
          }
        } else {
          console.log('⚠️  Skipping assign test - could not fetch projects or managers');
        }
        
      } else {
        console.log('❌ No token received from login');
      }
      
    } else {
      console.log(`❌ Login failed: ${loginResponse.status}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testProjectAssignmentAPI();

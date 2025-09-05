import fetch from 'node-fetch';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function testAllProjectsAPI() {
  try {
    console.log('🧪 Testing AllProjects API endpoint...');
    console.log(`📍 API URL: ${API_BASE_URL}/api/projects/all-comprehensive`);
    
    const response = await fetch(`${API_BASE_URL}/api/projects/all-comprehensive`);
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
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
      console.log('💡 Try running the sample data insertion script first:');
      console.log('   node insert-sample-projects.js');
    }
    
    // Test search functionality
    console.log('\n🔍 Testing search functionality...');
    const searchResponse = await fetch(`${API_BASE_URL}/api/projects/all-comprehensive?search=test`);
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log(`   Search results: ${searchData.data ? searchData.data.length : 0} projects`);
    } else {
      console.log(`   Search test failed: ${searchResponse.status}`);
    }
    
    console.log('\n🎉 API test completed successfully!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the API server is running:');
      console.log('   npm run server');
    }
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Install node-fetch if not available:');
      console.log('   npm install node-fetch');
    }
  }
}

// Run the test
testAllProjectsAPI();

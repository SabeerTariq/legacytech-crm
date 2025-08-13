// Test script to verify role API
async function testRoleAPI() {
  try {
    console.log('Testing role API...');
    
    const response = await fetch('http://localhost:3001/api/admin/get-user-roles');
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Response:', JSON.stringify(data, null, 2));
      
      // Test with some known user IDs
      const testUserIds = [
        'de514a73-4782-439e-b2ea-3f49fe568e24',
        '705ede64-e466-4359-9b7a-e65c2b8debef',
        'fd5e837a-c05e-44da-beaf-824b5b26a8b8'
      ];
      
      testUserIds.forEach(userId => {
        const role = data.userRoles[userId];
        console.log(`User ${userId}:`, role ? role.display_name : 'No role');
      });
      
    } else {
      console.error('API Error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testRoleAPI(); 
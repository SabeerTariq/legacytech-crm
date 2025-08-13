// Test to simulate browser fetch
const testBrowserFetch = async () => {
  try {
    console.log('Testing browser-like fetch...');
    
    // Simulate the exact same fetch call that the frontend makes
    const response = await fetch('http://localhost:3001/api/admin/get-user-roles', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
      
      // Test the exact user IDs from the database
      const testUserIds = [
        '705ede64-e466-4359-9b7a-e65c2b8debef',
        'fd5e837a-c05e-44da-beaf-824b5b26a8b8', 
        'de514a73-4782-439e-b2ea-3f49fe568e24',
        '7cdc1b5c-bcef-4ee5-b3ca-d7ce50d81cb9'
      ];
      
      testUserIds.forEach(userId => {
        const role = data.userRoles[userId];
        console.log(`User ${userId}:`, role ? `${role.display_name} (${role.description})` : 'No role');
      });
      
    } else {
      console.error('Error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
};

testBrowserFetch(); 
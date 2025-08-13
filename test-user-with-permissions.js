import fetch from 'node-fetch';

async function testUserWithPermissions() {
  console.log('🧪 Testing User Creation with Permissions\n');

  try {
    // Test data with permissions
    const testData = {
      employee_id: "24e3b446-6799-439c-b1ff-4d64828e75b8", // Adam Zain Nasir
      password: "TestPassword123!",
      permissions: [
        {
          module: "dashboard",
          can_create: true,
          can_read: true,
          can_update: true,
          can_delete: true,
          screen_visible: true
        },
        {
          module: "leads",
          can_create: true,
          can_read: true,
          can_update: true,
          can_delete: true,
          screen_visible: true
        },
        {
          module: "customers",
          can_create: true,
          can_read: true,
          can_update: true,
          can_delete: true,
          screen_visible: true
        },
        {
          module: "messages",
          can_create: true,
          can_read: true,
          can_update: true,
          can_delete: true,
          screen_visible: true
        },
        {
          module: "my_dashboard",
          can_create: true,
          can_read: true,
          can_update: true,
          can_delete: true,
          screen_visible: true
        }
      ]
    };

    console.log('Sending data with permissions:', JSON.stringify(testData, null, 2));

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

testUserWithPermissions(); 
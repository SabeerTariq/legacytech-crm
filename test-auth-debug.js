// Simple debug script to test authentication
console.log('=== AUTH DEBUG SCRIPT ===');

// Test user data
const testUsers = [
  {
    email: 'adamzainnasir.fro@logicworks.com',
    id: '78294d98-4280-40c1-bb6d-b85b7203b370',
    role: 'front_sales'
  },
  {
    email: 'adam@americandigitalagency.us',
    id: '705ede64-e466-4359-9b7a-e65c2b8debef',
    role: 'admin'
  }
];

console.log('Test users:', testUsers);

// Simulate login flow
function simulateLogin(email) {
  console.log(`\n=== Simulating login for: ${email} ===`);
  
  const user = testUsers.find(u => u.email === email);
  if (!user) {
    console.log('User not found');
    return;
  }
  
  console.log('User found:', user);
  console.log('Role:', user.role);
  
  // Simulate permission check
  const frontSalesModules = ['front_sales', 'leads', 'customers', 'sales_form', 'messages', 'calendar', 'better_ask_saul', 'my_dashboard'];
  const adminModules = ['dashboard', 'leads', 'customers', 'admin', 'user_management', 'role_management'];
  
  if (user.role === 'front_sales') {
    console.log('Front sales user - can access:', frontSalesModules);
    console.log('Should redirect to: /front-seller-dashboard');
  } else if (user.role === 'admin') {
    console.log('Admin user - can access all modules');
    console.log('Should stay on: /');
  }
}

// Test both users
simulateLogin('adamzainnasir.fro@logicworks.com');
simulateLogin('adam@americandigitalagency.us');

console.log('\n=== DEBUG SCRIPT COMPLETE ===');
console.log('Check browser console for authentication logs'); 
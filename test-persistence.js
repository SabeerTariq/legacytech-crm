// Test script to verify localStorage persistence
console.log('=== TESTING LOCALSTORAGE PERSISTENCE ===');

// Test user data
const testUser = {
  id: '78294d98-4280-40c1-bb6d-b85b7203b370',
  email: 'adamzainnasir.fro@logicworks.com',
  display_name: 'Adam Zain Nasir',
  role: {
    id: 'ae936867-cbed-466c-bdef-778f05da133d',
    name: 'front_sales',
    display_name: 'Front Seller',
    description: 'Front Sales Representative'
  }
};

// Test storing user
console.log('1. Storing user in localStorage...');
localStorage.setItem('crm_user', JSON.stringify(testUser));
console.log('User stored:', testUser.email);

// Test retrieving user
console.log('2. Retrieving user from localStorage...');
const storedUser = localStorage.getItem('crm_user');
if (storedUser) {
  const user = JSON.parse(storedUser);
  console.log('User retrieved:', user.email);
  console.log('User role:', user.role?.name);
} else {
  console.log('No user found in localStorage');
}

// Test clearing user
console.log('3. Clearing user from localStorage...');
localStorage.removeItem('crm_user');
const clearedUser = localStorage.getItem('crm_user');
console.log('User cleared:', !clearedUser);

console.log('=== PERSISTENCE TEST COMPLETE ===');
console.log('Now try logging in and refreshing the page - the user should stay logged in!'); 
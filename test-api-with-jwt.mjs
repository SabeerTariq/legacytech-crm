import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';

// Create a test token for the admin user
const adminUser = {
  id: '722d6008-6cec-43d3-8648-926a14f765c9',
  email: 'admin@logicworks.com',
  display_name: 'CRM Admin',
  is_admin: true
};

const token = jwt.sign(adminUser, JWT_SECRET, { expiresIn: '1h' });

console.log('Generated JWT Token:');
console.log(token);
console.log('\nTest the API with:');
console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3001/api/sales/sales-dispositions`);
console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3001/api/projects`);
console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3001/api/recurring-services`);

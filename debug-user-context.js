// Add this to your EnhancedUpsellForm component temporarily to debug the user context

console.log('🔍 Debugging User Context in Upsell Form...');
console.log('Current user:', user);
console.log('User ID:', user?.id);
console.log('User email:', user?.email);
console.log('Employee data:', user?.employee);
console.log('Employee department:', user?.employee?.department);
console.log('Employee ID:', user?.employee?.id);

// Also add this to CustomerSelector component
console.log('🔍 Debugging CustomerSelector...');
console.log('User in CustomerSelector:', user);
console.log('User department:', user?.employee?.department);
console.log('User employee ID:', user?.employee?.id);

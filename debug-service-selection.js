// Debug script to test service selection logic

// Simulate the service selection logic
const services = [
  { id: '1', name: 'Web Design' },
  { id: '2', name: 'SEO' },
  { id: '3', name: 'Content Writing' }
];

const selectedServices = [
  { serviceId: '', serviceName: '', details: '' }
];

console.log('🔍 Initial state:');
console.log('Services:', services);
console.log('Selected Services:', selectedServices);

// Simulate selecting a service
function updateService(index, field, value) {
  console.log(`🔍 updateService called: index=${index}, field=${field}, value=${value}`);
  
  const updated = [...selectedServices];
  updated[index] = { ...updated[index], [field]: value };
  
  console.log('🔍 Updated services array:', updated);
  return updated;
}

// Test the logic
console.log('\n🔍 Testing service selection...');
const selectedServiceId = '1';
const selectedService = services.find(s => s.id === selectedServiceId);

console.log('Selected service ID:', selectedServiceId);
console.log('Found service:', selectedService);

// Update the service
const updatedServices = updateService(0, "serviceId", selectedServiceId);
const finalServices = updateService(0, "serviceName", selectedService?.name || "");

console.log('\n🔍 Final result:');
console.log('Final selected services:', finalServices);

// Test the form data update logic
const formData = {
  serviceSold: finalServices[0]?.serviceName || "",
  servicesIncluded: finalServices.map(s => s.serviceName),
  serviceDetails: finalServices.map(s => `${s.serviceName}: ${s.details}`).join("\n"),
  serviceTypes: finalServices.map(s => s.serviceName),
};

console.log('\n🔍 Form data updated:');
console.log('Form data:', formData);

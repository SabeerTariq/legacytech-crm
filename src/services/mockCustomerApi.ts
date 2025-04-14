// Mock Customer API Service

// Mock customer data
const MOCK_CUSTOMERS = [
  {
    id: 1,
    name: 'John Smith',
    businessName: 'Smith Enterprises',
    email: 'john@smithenterprises.com',
    phone: '(555) 123-4567',
    address: '123 Business St, City, State 12345',
    joinDate: '2023-06-15',
    salesCount: 3,
    totalSpent: 12500,
    status: 'active',
    source: 'Referral',
    notes: 'Long-term client, prefers email communication',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    businessName: 'Johnson Digital',
    email: 'sarah@johnsondigital.com',
    phone: '(555) 987-6543',
    joinDate: '2023-09-22',
    salesCount: 2,
    totalSpent: 8750,
    status: 'active',
    source: 'Website',
  },
  {
    id: 3,
    name: 'Michael Wong',
    businessName: 'Wong Innovations',
    email: 'michael@wonginnovations.com',
    phone: '(555) 456-7890',
    joinDate: '2024-01-10',
    salesCount: 1,
    totalSpent: 4200,
    status: 'active',
    source: 'Trade Show',
  },
  {
    id: 4,
    name: 'Emily Davis',
    businessName: 'Davis Marketing',
    email: 'emily@davismarketing.com',
    phone: '(555) 789-0123',
    joinDate: '2024-02-05',
    salesCount: 0,
    totalSpent: 0,
    status: 'lead',
    source: 'Social Media',
    notes: 'Interested in website redesign services',
  },
  {
    id: 5,
    name: 'Robert Chen',
    businessName: 'Chen Consulting',
    email: 'robert@chenconsulting.com',
    phone: '(555) 321-0987',
    joinDate: '2023-04-18',
    salesCount: 4,
    totalSpent: 18900,
    status: 'inactive',
    source: 'Previous Client',
    notes: 'Was a regular client but hasn\'t ordered in 6 months',
  },
];

// In-memory storage for customers
let customers = [...MOCK_CUSTOMERS];
let nextId = customers.length + 1;

// Get all customers
export const getCustomers = async () => {
  return {
    status: 'success',
    data: {
      customers: [...customers]
    }
  };
};

// Get customer by ID
export const getCustomer = async (id: number) => {
  const customer = customers.find(customer => customer.id === id);
  if (!customer) {
    throw new Error(`Customer with ID ${id} not found`);
  }
  return {
    status: 'success',
    data: {
      customer
    }
  };
};

// Create a new customer
export const createCustomer = async (customerData: any) => {
  const newCustomer = {
    id: nextId++,
    ...customerData,
    joinDate: customerData.joinDate || new Date().toISOString().split('T')[0],
    salesCount: customerData.salesCount || 0,
    totalSpent: customerData.totalSpent || 0,
  };
  
  customers.push(newCustomer);
  
  return {
    status: 'success',
    data: {
      customer: newCustomer
    }
  };
};

// Update a customer
export const updateCustomer = async (id: number, customerData: any) => {
  const index = customers.findIndex(customer => customer.id === id);
  if (index === -1) {
    throw new Error(`Customer with ID ${id} not found`);
  }
  
  const updatedCustomer = {
    ...customers[index],
    ...customerData
  };
  
  customers[index] = updatedCustomer;
  
  return {
    status: 'success',
    data: {
      customer: updatedCustomer
    }
  };
};

// Delete a customer
export const deleteCustomer = async (id: number) => {
  const index = customers.findIndex(customer => customer.id === id);
  if (index === -1) {
    throw new Error(`Customer with ID ${id} not found`);
  }
  
  customers = customers.filter(customer => customer.id !== id);
  
  return {
    status: 'success',
    data: null
  };
};

// Get customer sales
export const getCustomerSales = async (customerId: number) => {
  // Mock sales data
  const sales = [
    {
      id: 1,
      customerId,
      date: '2023-12-15',
      service: 'Website Development',
      value: 5000,
      paymentMode: 'Credit Card',
      seller: 'John Doe',
      status: 'completed',
    },
    {
      id: 2,
      customerId,
      date: '2024-01-20',
      service: 'SEO Services',
      value: 1200,
      paymentMode: 'Bank Transfer',
      seller: 'Jane Smith',
      status: 'completed',
    },
    {
      id: 3,
      customerId,
      date: '2024-03-05',
      service: 'Mobile App Development',
      value: 8500,
      paymentMode: 'Installments',
      seller: 'John Doe',
      status: 'pending',
    },
  ];
  
  return {
    status: 'success',
    data: {
      sales
    }
  };
};

// Get customer projects
export const getCustomerProjects = async (customerId: number) => {
  // Mock project data
  const projects = [
    {
      id: 1,
      customerId,
      name: 'Website Redesign',
      startDate: '2024-01-10',
      endDate: '2024-03-15',
      status: 'completed',
      manager: 'Alice Johnson',
      team: ['Designer 1', 'Developer 1', 'QA 1'],
    },
    {
      id: 2,
      customerId,
      name: 'Mobile App Development',
      startDate: '2024-03-20',
      endDate: '2024-06-30',
      status: 'in-progress',
      manager: 'Bob Williams',
      team: ['Designer 2', 'Developer 2', 'Developer 3'],
    },
  ];
  
  return {
    status: 'success',
    data: {
      projects
    }
  };
};

// Export all mock API functions
export const mockCustomerApi = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerSales,
  getCustomerProjects
};

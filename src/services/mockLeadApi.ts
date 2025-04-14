// Mock Lead API Service

// Mock lead data
const MOCK_LEADS = [
  {
    id: 1,
    name: 'Sarah Johnson',
    businessName: 'Johnson Digital',
    email: 'sarah@johnsondigital.com',
    phone: '(555) 123-4567',
    createdDate: '2024-03-15',
    source: 'Website',
    status: 'new',
    notes: 'Interested in website redesign services',
    assignedTo: 1,
  },
  {
    id: 2,
    name: 'Robert Chen',
    businessName: 'Chen Technologies',
    email: 'robert@chentech.com',
    phone: '(555) 234-5678',
    createdDate: '2024-03-18',
    source: 'Referral',
    status: 'contacted',
    notes: 'Looking for SEO services',
    assignedTo: 1,
  },
  {
    id: 3,
    name: 'Maria Garcia',
    businessName: 'Garcia Marketing',
    email: 'maria@garciamarketing.com',
    phone: '(555) 345-6789',
    createdDate: '2024-03-20',
    source: 'Social Media',
    status: 'qualified',
    notes: 'Needs help with social media marketing',
    assignedTo: 2,
  },
  {
    id: 4,
    name: 'David Wilson',
    businessName: 'Wilson Consulting',
    email: 'david@wilsonconsulting.com',
    phone: '(555) 456-7890',
    createdDate: '2024-03-22',
    source: 'Trade Show',
    status: 'negotiation',
    notes: 'Discussing a potential project for Q3',
    assignedTo: 2,
  },
  {
    id: 5,
    name: 'Jennifer Lee',
    businessName: 'Lee Enterprises',
    email: 'jennifer@leeenterprises.com',
    phone: '(555) 567-8901',
    createdDate: '2024-03-25',
    source: 'Email Campaign',
    status: 'new',
    notes: 'Responded to our latest email campaign',
    assignedTo: 1,
  },
];

// In-memory storage for leads
let leads = [...MOCK_LEADS];
let nextId = leads.length + 1;

// Get all leads
export const getLeads = async () => {
  return {
    status: 'success',
    data: {
      leads: [...leads]
    }
  };
};

// Get leads assigned to the current user
export const getMyLeads = async (userId: number = 1) => {
  const myLeads = leads.filter(lead => lead.assignedTo === userId);
  return {
    status: 'success',
    data: {
      leads: myLeads
    }
  };
};

// Get lead by ID
export const getLead = async (id: number) => {
  const lead = leads.find(lead => lead.id === id);
  if (!lead) {
    throw new Error(`Lead with ID ${id} not found`);
  }
  return {
    status: 'success',
    data: {
      lead
    }
  };
};

// Create a new lead
export const createLead = async (leadData: any) => {
  const newLead = {
    id: nextId++,
    ...leadData,
    assignedTo: leadData.assignedTo || 1, // Default to user ID 1 if not provided
    createdDate: leadData.createdDate || new Date().toISOString(),
  };
  
  leads.push(newLead);
  
  return {
    status: 'success',
    data: {
      lead: newLead
    }
  };
};

// Update a lead
export const updateLead = async (id: number, leadData: any) => {
  const index = leads.findIndex(lead => lead.id === id);
  if (index === -1) {
    throw new Error(`Lead with ID ${id} not found`);
  }
  
  const updatedLead = {
    ...leads[index],
    ...leadData
  };
  
  leads[index] = updatedLead;
  
  return {
    status: 'success',
    data: {
      lead: updatedLead
    }
  };
};

// Update lead status
export const updateLeadStatus = async (id: number, status: string) => {
  const index = leads.findIndex(lead => lead.id === id);
  if (index === -1) {
    throw new Error(`Lead with ID ${id} not found`);
  }
  
  leads[index].status = status;
  
  return {
    status: 'success',
    data: {
      lead: leads[index]
    }
  };
};

// Convert lead to customer
export const convertToCustomer = async (id: number) => {
  const index = leads.findIndex(lead => lead.id === id);
  if (index === -1) {
    throw new Error(`Lead with ID ${id} not found`);
  }
  
  // Update lead status to 'won'
  leads[index].status = 'won';
  
  // In a real app, this would create a customer record
  const customer = {
    id: id,
    name: leads[index].name,
    businessName: leads[index].businessName,
    email: leads[index].email,
    phone: leads[index].phone,
    joinDate: new Date().toISOString(),
    status: 'active',
    source: leads[index].source,
  };
  
  return {
    status: 'success',
    data: {
      lead: leads[index],
      customer
    }
  };
};

// Delete a lead
export const deleteLead = async (id: number) => {
  const index = leads.findIndex(lead => lead.id === id);
  if (index === -1) {
    throw new Error(`Lead with ID ${id} not found`);
  }
  
  leads = leads.filter(lead => lead.id !== id);
  
  return {
    status: 'success',
    data: null
  };
};

// Export all mock API functions
export const mockLeadApi = {
  getLeads,
  getMyLeads,
  getLead,
  createLead,
  updateLead,
  updateLeadStatus,
  convertToCustomer,
  deleteLead
};

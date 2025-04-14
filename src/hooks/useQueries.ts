import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { toast } from 'sonner';
import { mockLeadApi } from '../services/mockLeadApi';

// Auth queries
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => api.getCurrentUser(),
    retry: false,
  });
};

// User queries
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.getUsers(),
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => api.getUser(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: any) => api.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create user');
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: any }) => api.updateUser(id, userData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });
};

// Customer queries
export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => api.getCustomers(),
    retry: 2,
    onError: (error: any) => {
      console.error('Error fetching customers:', error);
    },
  });
};

export const useCustomer = (id: number) => {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => api.getCustomer(id),
    enabled: !!id,
    retry: 1,
    onError: (error: any) => {
      console.error(`Error fetching customer ${id}:`, error);
    },
  });
};

export const useCustomerSales = (customerId: number) => {
  return useQuery({
    queryKey: ['customerSales', customerId],
    queryFn: () => api.getSalesByCustomer(customerId),
    enabled: !!customerId,
    retry: 1,
    onError: (error: any) => {
      console.error(`Error fetching sales for customer ${customerId}:`, error);
    },
  });
};

export const useCustomerProjects = (customerId: number) => {
  return useQuery({
    queryKey: ['customerProjects', customerId],
    queryFn: () => api.getProjectsByCustomer(customerId),
    enabled: !!customerId,
    retry: 1,
    onError: (error: any) => {
      console.error(`Error fetching projects for customer ${customerId}:`, error);
    },
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerData: any) => api.createCustomer(customerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create customer');
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, customerData }: { id: number; customerData: any }) => api.updateCustomer(id, customerData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', variables.id] });
      toast.success('Customer updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update customer');
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete customer');
    },
  });
};

// Project queries
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  });
};

export const useProject = (id: number) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => api.getProject(id),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectData: any) => api.createProject(projectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create project');
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, projectData }: { id: number; projectData: any }) => api.updateProject(id, projectData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] });
      toast.success('Project updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update project');
    },
  });
};

export const useAssignTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, team }: { id: number; team: string[] }) => api.assignTeam(id, team),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] });
      toast.success('Team assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to assign team');
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete project');
    },
  });
};

// Sale queries
export const useSales = () => {
  return useQuery({
    queryKey: ['sales'],
    queryFn: () => api.getSales(),
  });
};

export const useMySales = () => {
  return useQuery({
    queryKey: ['mySales'],
    queryFn: () => api.getMySales(),
  });
};

export const useSalesByCustomer = (customerId: number) => {
  return useQuery({
    queryKey: ['sales', 'customer', customerId],
    queryFn: () => api.getSalesByCustomer(customerId),
    enabled: !!customerId,
  });
};

export const useSalesBySeller = (sellerId: number) => {
  return useQuery({
    queryKey: ['sales', 'seller', sellerId],
    queryFn: () => api.getSalesBySeller(sellerId),
    enabled: !!sellerId,
  });
};

export const useSale = (id: number) => {
  return useQuery({
    queryKey: ['sales', id],
    queryFn: () => api.getSale(id),
    enabled: !!id,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (saleData: any) => api.createSale(saleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['mySales'] });
      toast.success('Sale recorded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record sale');
    },
  });
};

export const useUpdateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, saleData }: { id: number; saleData: any }) => api.updateSale(id, saleData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['mySales'] });
      queryClient.invalidateQueries({ queryKey: ['sales', variables.id] });
      toast.success('Sale updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update sale');
    },
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['mySales'] });
      toast.success('Sale deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete sale');
    },
  });
};

// Lead queries
export const useLeads = () => {
  return useQuery({
    queryKey: ['leads'],
    queryFn: () => api.getLeads(),
    retry: 1,
    onError: (error: any) => {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    },
  });
};

export const useMyLeads = () => {
  return useQuery({
    queryKey: ['myLeads'],
    queryFn: () => api.getMyLeads(),
    retry: 1,
    onError: (error: any) => {
      console.error('Error fetching my leads:', error);
      toast.error('Failed to fetch your leads');
    },
  });
};

export const useLead = (id: number) => {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: () => api.getLead(id),
    enabled: !!id,
    retry: 1,
    onError: (error: any) => {
      console.error(`Error fetching lead ${id}:`, error);
      toast.error(`Failed to fetch lead details`);
    },
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leadData: any) => api.createLead(leadData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['myLeads'] });
      toast.success('Lead created successfully');
      return data;
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to create lead';
      toast.error(message);
      console.error('Error creating lead:', error);
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, leadData }: { id: number; leadData: any }) => api.updateLead(id, leadData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['myLeads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] });
      toast.success('Lead updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to update lead';
      toast.error(message);
      console.error('Error updating lead:', error);
    },
  });
};

export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.updateLeadStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['myLeads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] });
      toast.success('Lead status updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to update lead status';
      toast.error(message);
      console.error('Error updating lead status:', error);
    },
  });
};

export const useConvertLeadToCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.convertLeadToCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['myLeads'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Lead converted to customer successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to convert lead to customer';
      toast.error(message);
      console.error('Error converting lead to customer:', error);
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['myLeads'] });
      toast.success('Lead deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to delete lead';
      toast.error(message);
      console.error('Error deleting lead:', error);
    },
  });
};

// Message queries
export const useMessages = () => {
  return useQuery({
    queryKey: ['messages'],
    queryFn: () => api.getMessages(),
  });
};

export const useConversation = (userId: number) => {
  return useQuery({
    queryKey: ['messages', 'conversation', userId],
    queryFn: () => api.getConversation(userId),
    enabled: !!userId,
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['messages', 'unread'],
    queryFn: () => api.getUnreadCount(),
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ receiverId, content }: { receiverId: number; content: string }) => api.sendMessage(receiverId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'conversation', variables.receiverId] });
      toast.success('Message sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send message');
    },
  });
};

export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: number) => api.markMessageAsRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'unread'] });
    },
    onError: (error: any) => {
      console.error('Failed to mark message as read:', error);
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: number) => api.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('Message deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete message');
    },
  });
};

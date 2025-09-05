import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from '@/contexts/AuthContextJWT';
import { Lead } from "@/components/leads/LeadsList";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from '@/lib/api/client';

export const useLeads = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: leads = [],
    isLoading,
  } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/leads', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch leads');
        }

        const leadsData = result.data || [];

        const processedLeads = leadsData.map((lead: any) => ({
          id: lead.id,
          client_name: lead.client_name,
          email_address: lead.email_address,
          contact_number: lead.contact_number || '',
          status: (lead.status || 'new') as Lead['status'],
          source: lead.source || '',
          price: lead.price || 0,
          date: lead.date || lead.created_at || '',
          city_state: lead.city_state,
          business_description: lead.business_description,
          services_required: lead.services_required,
          budget: lead.budget,
          additional_info: lead.additional_info,
          user_id: lead.user_id,
          agent: lead.agent,
          // Enhanced fields (will be null for now)
          priority: undefined as Lead['priority'],
          lead_score: undefined,
          last_contact: undefined,
          next_follow_up: undefined,
          converted_at: undefined,
          sales_disposition_id: undefined,
          created_at: lead.created_at,
          updated_at: lead.updated_at,
        }));

        return processedLeads;
      } catch (error) {
        console.error('Error fetching leads:', error);
        toast({
          title: "Error fetching leads",
          description: error instanceof Error ? error.message : 'Failed to fetch leads',
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: true,
    refetchInterval: 30000,
  });

  const addLeadMutation = useMutation({
    mutationFn: async (newLead: Omit<Lead, 'id' | 'date'>) => {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user?.id,
          client_name: newLead.client_name,
          business_description: newLead.business_description,
          email_address: newLead.email_address,
          contact_number: newLead.contact_number,
          source: newLead.source,
          status: newLead.status,
          price: newLead.price || 0,
          city_state: newLead.city_state,
          services_required: newLead.services_required,
          budget: newLead.budget,
          additional_info: newLead.additional_info,
          agent: newLead.agent || user?.user_metadata?.full_name || 'Unknown',
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create lead');
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (error) => {
      toast({
        title: "Error adding lead",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, leadData }: { id: string, leadData: Partial<Lead> }) => {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_name: leadData.client_name,
          business_description: leadData.business_description,
          email_address: leadData.email_address,
          contact_number: leadData.contact_number,
          source: leadData.source,
          status: leadData.status,
          price: leadData.price || 0,
          city_state: leadData.city_state,
          services_required: leadData.services_required,
          budget: leadData.budget,
          additional_info: leadData.additional_info,
          date: leadData.date,
          updated_at: new Date().toISOString(),
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update lead');
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (error) => {
      toast({
        title: "Error updating lead",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete lead');
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (error) => {
      toast({
        title: "Error deleting lead",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  return {
    leads,
    isLoading,
    addLeadMutation,
    updateLeadMutation,
    deleteLeadMutation,
  };
};

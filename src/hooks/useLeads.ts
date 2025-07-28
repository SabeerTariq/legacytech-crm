import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
// Authentication removed - no user context needed
import { Lead } from "@/components/leads/LeadsList";
import { useToast } from "@/hooks/use-toast";

export const useLeads = () => {
  // User context removed - no authentication needed
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: leads = [],
    isLoading,
  } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select(`
          id, 
          client_name, 
          business_description,
          email_address, 
          contact_number, 
          source,
          status,
          price,
          created_at,
          updated_at,
          city_state,
          services_required,
          budget,
          additional_info,
          date,
          user_id,
          agent
        `)
        .neq("status", "converted"); // Filter out converted leads

      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
        toast({
          title: "Error fetching leads",
          description: leadsError.message,
          variant: "destructive",
        });
        return [];
      }

      if (!leadsData) {
        return [];
      }

      const processedLeads = leadsData.map((lead) => ({
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
    },
    enabled: true,
    refetchInterval: 30000,
  });

  const addLeadMutation = useMutation({
    mutationFn: async (newLead: Omit<Lead, 'id' | 'date'>) => {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
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
        }])
        .select();

      if (error) throw error;
      return data[0];
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
      const { data, error } = await supabase
        .from('leads')
        .update({
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
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
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
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Lead } from "@/components/leads/LeadsList";
import { useToast } from "@/hooks/use-toast";

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
      console.log("Fetching leads, current user:", user?.id);
      
      // Fetch without user_id filter to see all available leads
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
          city_state,
          services_required,
          budget,
          additional_info,
          agent,
          date,
          user_id
        `);

      if (leadsError) {
        console.error("Error fetching leads:", leadsError);
        toast({
          title: "Error fetching leads",
          description: leadsError.message,
          variant: "destructive",
        });
        return [];
      }

      console.log("Total leads found in database:", leadsData?.length || 0);
      
      if (leadsData && leadsData.length > 0) {
        // Log the first few leads to debug
        leadsData.slice(0, 5).forEach((lead, index) => {
          console.log(`Lead ${index + 1}:`, 
            JSON.stringify({
              id: lead.id,
              name: lead.client_name,
              email: lead.email_address,
              userId: lead.user_id
            })
          );
        });
      } else {
        console.log("No leads found in the database");
      }

      const processedLeads = (leadsData || []).map((lead) => {
        console.log(`Processing lead: ${lead.client_name}`);
        
        const processedLead = {
          id: lead.id,
          client_name: lead.client_name,
          company: lead.business_description || '',
          email_address: lead.email_address,
          contact_number: lead.contact_number || '',
          status: (lead.status || 'new') as Lead['status'],
          source: lead.source || '',
          price: lead.price || 0,
          date: lead.date ? new Date(lead.date).toLocaleDateString() : 
                 lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '',
          city_state: lead.city_state || '',
          business_description: lead.business_description || '',
          services_required: lead.services_required || '',
          budget: lead.budget || '',
          additional_info: lead.additional_info || '',
          agent: lead.agent || ''
        };
        
        return processedLead;
      });

      return processedLeads;
    },
    enabled: true,
    refetchInterval: 15000, // Refresh every 15 seconds
    refetchOnWindowFocus: true,
  });

  const addLeadMutation = useMutation({
    mutationFn: async (newLead: Omit<Lead, 'id' | 'date'>) => {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          user_id: user?.id,
          client_name: newLead.client_name,
          business_description: newLead.business_description || newLead.company,
          email_address: newLead.email_address,
          contact_number: newLead.contact_number,
          source: newLead.source,
          price: newLead.price || 0,
          city_state: newLead.city_state,
          services_required: newLead.services_required,
          budget: newLead.budget,
          additional_info: newLead.additional_info,
          agent: newLead.agent
        }])
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead added successfully",
        description: "Your new lead has been added to the database.",
      });
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
          business_description: leadData.business_description || leadData.company,
          email_address: leadData.email_address,
          contact_number: leadData.contact_number,
          source: leadData.source,
          status: leadData.status,
          price: leadData.price || 0,
          city_state: leadData.city_state,
          services_required: leadData.services_required,
          budget: leadData.budget,
          additional_info: leadData.additional_info,
          agent: leadData.agent,
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
      toast({
        title: "Lead updated successfully",
        description: "Your lead has been updated in the database.",
      });
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
      toast({
        title: "Lead deleted",
        description: "The lead has been removed from the database.",
      });
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

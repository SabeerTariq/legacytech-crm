
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import LeadsList, { Lead } from "@/components/leads/LeadsList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, UserPlus } from "lucide-react";
import LeadUploadModal from "@/components/leads/LeadUploadModal";
import LeadAddModal from "@/components/leads/LeadAddModal";
import LeadEditModal from "@/components/leads/LeadEditModal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Leads = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch leads from the database
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      // First, fetch leads - now including source and status fields
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
          value,
          created_at,
          assigned_to_id,
          city_state,
          services_required,
          budget,
          additional_info,
          agent,
          date,
          user_id
        `);

      if (leadsError) {
        toast({
          title: "Error fetching leads",
          description: leadsError.message,
          variant: "destructive",
        });
        return [];
      }

      // Process leads and fetch profile data for each assigned user
      const processedLeads = await Promise.all(leadsData.map(async (lead) => {
        // Only fetch profile if there's an assigned user
        let profileData = null;
        
        if (lead.assigned_to_id) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', lead.assigned_to_id)
            .single();
          
          if (!profileError) {
            profileData = profile;
          }
        }

        return {
          id: lead.id,
          client_name: lead.client_name,
          company: lead.business_description || '',
          email_address: lead.email_address,
          contact_number: lead.contact_number || '',
          status: (lead.status || 'new') as Lead['status'],
          source: lead.source || '',
          value: lead.value || 0,
          assignedTo: {
            name: profileData?.full_name || 'Unassigned',
            initials: profileData?.full_name 
              ? profileData.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() 
              : 'UN',
            avatar: profileData?.avatar_url,
          },
          date: lead.date ? new Date(lead.date).toLocaleDateString() : 
                 lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '',
          city_state: lead.city_state,
          business_description: lead.business_description,
          services_required: lead.services_required,
          budget: lead.budget,
          additional_info: lead.additional_info,
          agent: lead.agent
        };
      }));

      return processedLeads;
    },
    enabled: !!user,
  });

  // Add lead mutation
  const addLeadMutation = useMutation({
    mutationFn: async (newLead: Omit<Lead, 'id' | 'assignedTo' | 'date'>) => {
      const { data, error } = await supabase
        .from('leads')
        .insert([
          {
            user_id: user?.id,
            client_name: newLead.client_name,
            business_description: newLead.business_description || newLead.company,
            email_address: newLead.email_address,
            contact_number: newLead.contact_number,
            source: newLead.source,
            value: newLead.value || 0,
            city_state: newLead.city_state,
            services_required: newLead.services_required,
            budget: newLead.budget,
            additional_info: newLead.additional_info,
            agent: newLead.agent
          }
        ])
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

  // Update lead mutation
  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, leadData }: { id: string, leadData: Omit<Lead, 'id' | 'assignedTo' | 'date'> }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({
          client_name: leadData.client_name,
          business_description: leadData.business_description || leadData.company,
          email_address: leadData.email_address,
          contact_number: leadData.contact_number,
          source: leadData.source,
          status: leadData.status,
          value: leadData.value || 0,
          city_state: leadData.city_state,
          services_required: leadData.services_required,
          budget: leadData.budget,
          additional_info: leadData.additional_info,
          agent: leadData.agent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      setEditModalOpen(false);
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

  // Delete lead mutation
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
      setEditModalOpen(false);
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

  const handleAddLead = (newLead: Omit<Lead, 'id' | 'assignedTo' | 'date'>) => {
    addLeadMutation.mutate(newLead);
    setAddModalOpen(false);
  };

  const handleUpdateLead = (updatedLead: Omit<Lead, 'id' | 'assignedTo' | 'date'>) => {
    if (selectedLead) {
      console.log("Handling update for lead:", selectedLead.id, updatedLead);
      updateLeadMutation.mutate({
        id: selectedLead.id,
        leadData: updatedLead
      });
    }
  };

  const handleDeleteLead = (id: string) => {
    deleteLeadMutation.mutate(id);
  };

  // Handle bulk upload
  const handleUploadComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['leads'] });
  };

  // Handle lead click for editing
  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setEditModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold">Leads</h1>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                className="w-full sm:w-[200px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline"
              className="sm:flex-1" 
              onClick={() => setUploadModalOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
            <Button 
              className="sm:flex-1"
              onClick={() => setAddModalOpen(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <LeadsList 
            leads={leads.filter(lead => searchQuery ? 
              lead.client_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
              (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase())) || 
              lead.email_address.toLowerCase().includes(searchQuery.toLowerCase())
              : true
            )}
            onAddLeadClick={null}
            onLeadClick={handleLeadClick}
          />
        )}
        
        <LeadUploadModal 
          open={uploadModalOpen} 
          onOpenChange={setUploadModalOpen} 
          onUploadComplete={handleUploadComplete}
        />

        <LeadAddModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
          onLeadAdded={handleAddLead}
        />

        <LeadEditModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          lead={selectedLead}
          onLeadUpdated={handleUpdateLead}
          onLeadDeleted={handleDeleteLead}
        />
      </div>
    </MainLayout>
  );
};

export default Leads;

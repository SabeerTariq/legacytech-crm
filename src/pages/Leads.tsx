
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import LeadsList, { Lead } from "@/components/leads/LeadsList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, UserPlus } from "lucide-react";
import LeadUploadModal from "@/components/leads/LeadUploadModal";
import LeadAddModal from "@/components/leads/LeadAddModal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Leads = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch leads from the database
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          id, 
          name, 
          company, 
          email, 
          phone, 
          status, 
          source, 
          value,
          created_at,
          assigned_to_id,
          profiles(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error fetching leads",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      // Format data for the LeadsList component
      return data.map(lead => ({
        id: lead.id,
        name: lead.name,
        company: lead.company || '',
        email: lead.email,
        phone: lead.phone || '',
        status: lead.status as Lead['status'] || 'new',
        source: lead.source || '',
        value: lead.value || 0,
        assignedTo: {
          name: lead.profiles ? (lead.profiles.full_name || 'Unassigned') : 'Unassigned',
          initials: lead.profiles && lead.profiles.full_name 
            ? lead.profiles.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() 
            : 'UN',
          avatar: lead.profiles ? lead.profiles.avatar_url : undefined,
        },
        date: new Date(lead.created_at).toLocaleDateString(),
      }));
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
            name: newLead.name,
            company: newLead.company,
            email: newLead.email,
            phone: newLead.phone,
            status: newLead.status,
            source: newLead.source,
            value: newLead.value || 0,
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

  const handleAddLead = (newLead: Omit<Lead, 'id' | 'assignedTo' | 'date'>) => {
    addLeadMutation.mutate(newLead);
  };

  // Handle bulk upload
  const handleUploadComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['leads'] });
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
            leads={leads}
            onAddLeadClick={() => setAddModalOpen(true)}
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
      </div>
    </MainLayout>
  );
};

export default Leads;

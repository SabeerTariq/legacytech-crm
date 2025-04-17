
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Lead } from "@/components/leads/LeadsList";
import LeadUploadModal from "@/components/leads/LeadUploadModal";
import LeadAddModal from "@/components/leads/LeadAddModal";
import LeadEditModal from "@/components/leads/LeadEditModal";
import LeadsHeader from "@/components/leads/LeadsHeader";
import LeadsContent from "@/components/leads/LeadsContent";
import { useLeads } from "@/hooks/useLeads";

const Leads = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    leads,
    isLoading,
    addLeadMutation,
    updateLeadMutation,
    deleteLeadMutation,
  } = useLeads();

  console.log("All leads in Leads page:", leads);

  const handleAddLead = (newLead: Omit<Lead, 'id' | 'assignedTo' | 'date'>) => {
    addLeadMutation.mutate(newLead);
    setAddModalOpen(false);
  };

  const handleUpdateLead = (updatedLead: Omit<Lead, 'id' | 'assignedTo' | 'date'>) => {
    if (selectedLead) {
      updateLeadMutation.mutate({
        id: selectedLead.id,
        leadData: updatedLead
      });
      setEditModalOpen(false);
    }
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setEditModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <LeadsHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onUploadClick={() => setUploadModalOpen(true)}
          onAddClick={() => setAddModalOpen(true)}
        />

        <LeadsContent 
          leads={leads}
          searchQuery={searchQuery}
          isLoading={isLoading}
          onLeadClick={handleLeadClick}
        />
        
        <LeadUploadModal 
          open={uploadModalOpen} 
          onOpenChange={setUploadModalOpen} 
          onUploadComplete={() => null}
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
          onLeadDeleted={deleteLeadMutation.mutate}
        />
      </div>
    </MainLayout>
  );
};

export default Leads;

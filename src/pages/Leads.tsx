
import React, { useState } from "react";
import { Lead } from "@/components/leads/LeadsList";
import LeadAddModal from "@/components/leads/LeadAddModal";
import LeadEditModal from "@/components/leads/LeadEditModal";
import LeadViewModal from "@/components/leads/LeadViewModal"; // Added
import LeadScraper from "@/components/leads/LeadScraper";

import LeadsHeader from "@/components/leads/LeadsHeader";
import LeadsContent from "@/components/leads/LeadsContent";
import { useLeads } from "@/hooks/useLeads";
import { usePermissions } from "@/contexts/PermissionContext";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";
import { useToast } from "@/hooks/use-toast";
// Authentication removed - no user context needed
import type { Database } from "@/integrations/supabase/types";

const Leads = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false); // Added view modal state
  const [scraperModalOpen, setScraperModalOpen] = useState(false);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(0);

  // User profile removed - no authentication needed
  // Role checking removed - no authentication needed
  const isLeadScraper = false; // Default to false since no user context

  const { canCreate, canDelete } = usePermissions();
  const { toast } = useToast();
  const {
    leads,
    isLoading,
    addLeadMutation,
    updateLeadMutation,
    deleteLeadMutation,
  } = useLeads();

  // Filter leads by selected month (show all leads if selectedMonth is 0)
  const filteredLeads = React.useMemo(() => {
    if (selectedMonth === 0) {
      return leads;
    }

    const currentDate = new Date();
    const targetDate = subMonths(currentDate, selectedMonth);
    const startDate = startOfMonth(targetDate);
    const endDate = endOfMonth(targetDate);

    return leads.filter(lead => {
      const leadDate = new Date(lead.date || (lead as Lead & { created_at?: string }).created_at || '');
      return leadDate >= startDate && leadDate <= endDate;
    });
  }, [leads, selectedMonth]);

  const handleAddLead = (newLead: Omit<Lead, 'id' | 'date'>) => {
    addLeadMutation.mutate(newLead, {
      onSuccess: () => {
        setAddModalOpen(false);
        toast({
          title: "Success",
          description: "Lead added successfully",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to add lead",
          variant: "destructive",
        });
      },
    });
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setEditModalOpen(true);
  };

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setViewModalOpen(true);
  };

  const handleUpdateLead = (updatedLead: Omit<Lead, 'id' | 'date'>) => {
    if (!selectedLead) return;
    
    updateLeadMutation.mutate(
      { 
        id: selectedLead.id, 
        leadData: updatedLead 
      },
      {
        onSuccess: () => {
          setEditModalOpen(false);
          setSelectedLead(null);
          toast({
            title: "Success",
            description: "Lead updated successfully",
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: "Failed to update lead",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDeleteLead = (leadId: string) => {
    deleteLeadMutation.mutate(leadId, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Lead deleted successfully",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to delete lead",
          variant: "destructive",
        });
      },
    });
  };

  const handleLeadClick = (lead: Lead) => {
    handleViewLead(lead); // Changed to open view modal instead of edit
  };



  const handleUpdateStatus = (leadId: string, status: Lead['status']) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      updateLeadMutation.mutate({
        id: leadId,
        leadData: { ...lead, status }
      }, {
        onSuccess: () => {
          toast({
            title: "Status updated",
            description: `Lead status changed to ${status}.`,
          });
        }
      });
    }
  };



  const handleMonthChange = (value: string) => {
    setSelectedMonth(Number(value));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <LeadsHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddClick={() => setAddModalOpen(true)}
          onScraperClick={() => setScraperModalOpen(true)}
          isLeadScraper={isLeadScraper}
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
          canCreate={canCreate('leads')}
        />

        <LeadsContent 
          leads={filteredLeads}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onLeadClick={handleLeadClick}
          onLeadEdit={handleEditLead}
          onUpdateStatus={handleUpdateStatus}
          onDeleteLead={handleDeleteLead}
          canDelete={canDelete('leads')}
        />

        {/* Modals */}
        <LeadAddModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
          onLeadAdded={handleAddLead}
        />

        <LeadViewModal
          open={viewModalOpen}
          onOpenChange={setViewModalOpen}
          lead={selectedLead}
        />

        <LeadEditModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          lead={selectedLead}
          onLeadUpdated={handleUpdateLead}
          onLeadDeleted={handleDeleteLead}
        />

        <LeadScraper
          open={scraperModalOpen}
          onOpenChange={setScraperModalOpen}
          onLeadAdded={handleAddLead}
        />

      </div>
  );
};

export default Leads;

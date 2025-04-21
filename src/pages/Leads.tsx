import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Lead } from "@/components/leads/LeadsList";
import LeadAddModal from "@/components/leads/LeadAddModal";
import LeadEditModal from "@/components/leads/LeadEditModal";
import LeadsHeader from "@/components/leads/LeadsHeader";
import LeadsContent from "@/components/leads/LeadsContent";
import { useLeads } from "@/hooks/useLeads";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";

const Leads = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(0);

  const {
    leads,
    isLoading,
    addLeadMutation,
    updateLeadMutation,
    deleteLeadMutation,
  } = useLeads();

  // Filter leads by selected month
  const filteredLeads = React.useMemo(() => {
    const currentDate = new Date();
    const targetDate = subMonths(currentDate, selectedMonth);
    const startDate = startOfMonth(targetDate);
    const endDate = endOfMonth(targetDate);

    return leads.filter(lead => {
      const leadDate = new Date(lead.date || lead.created_at);
      return leadDate >= startDate && leadDate <= endDate;
    });
  }, [leads, selectedMonth]);

  const handleAddLead = (newLead: Omit<Lead, 'id' | 'date'>) => {
    addLeadMutation.mutate(newLead, {
      onSuccess: () => {
        setAddModalOpen(false);
      }
    });
  };

  const handleUpdateLead = (updatedLead: Omit<Lead, 'id' | 'assignedTo'>) => {
    if (selectedLead) {
      updateLeadMutation.mutate({
        id: selectedLead.id,
        leadData: {
          ...updatedLead,
          date: updatedLead.date
        }
      }, {
        onSuccess: () => {
          setEditModalOpen(false);
        }
      });
    }
  };

  const handleDeleteLead = (leadId: string) => {
    deleteLeadMutation.mutate(leadId, {
      onSuccess: () => {
        setEditModalOpen(false);
      }
    });
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setEditModalOpen(true);
  };

  const handleMonthChange = (value: string) => {
    setSelectedMonth(Number(value));
  };

  if (isLoading) {
    return (
      <MainLayout>
        <TasksLoading />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <LeadsHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddClick={() => setAddModalOpen(true)}
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
        />

        <LeadsContent 
          leads={filteredLeads}
          searchQuery={searchQuery}
          isLoading={isLoading}
          onLeadClick={handleLeadClick}
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

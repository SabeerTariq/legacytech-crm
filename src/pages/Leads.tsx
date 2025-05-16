import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Lead } from "@/components/leads/LeadsList";
import LeadAddModal from "@/components/leads/LeadAddModal";
import LeadEditModal from "@/components/leads/LeadEditModal";
import LeadsHeader from "@/components/leads/LeadsHeader";
import LeadsContent from "@/components/leads/LeadsContent";
import { useLeads } from "@/hooks/useLeads";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";
import TasksLoading from "@/components/tasks/TasksLoading";
import { useToast } from "@/hooks/use-toast";

const Leads = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(0);
  const { toast } = useToast();

  const {
    leads,
    isLoading,
    addLeadMutation,
    updateLeadMutation,
    deleteLeadMutation,
  } = useLeads();

  // Filter leads by selected month
  const filteredLeads = React.useMemo(() => {
    console.log(`Filtering ${leads.length} leads for month offset: ${selectedMonth}`);
    
    const currentDate = new Date();
    const targetDate = subMonths(currentDate, selectedMonth);
    const startDate = startOfMonth(targetDate);
    const endDate = endOfMonth(targetDate);

    console.log(`Filter date range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);

    // If no leads, return empty array
    if (!leads || leads.length === 0) {
      console.log("No leads available to filter");
      return [];
    }

    const filtered = leads.filter(lead => {
      // Handle date parsing more safely
      try {
        const leadDate = lead.date 
          ? new Date(lead.date) 
          : (lead as any).created_at 
            ? new Date((lead as any).created_at) 
            : null;
        
        // If we can't determine a date, include the lead anyway for visibility
        if (!leadDate) {
          console.log(`Lead "${lead.client_name}" has no valid date, including it anyway`);
          return true;
        }
        
        const isInRange = leadDate >= startDate && leadDate <= endDate;
        console.log(`Lead "${lead.client_name}" date: ${leadDate.toLocaleDateString()}, in range: ${isInRange}`);
        return isInRange;
      } catch (error) {
        console.warn(`Error parsing date for lead ${lead.client_name}:`, error);
        // Include leads with invalid dates so they're still visible
        return true;
      }
    });
    
    console.log(`Filtered ${filtered.length} leads for selected month`);
    return filtered;
  }, [leads, selectedMonth]);

  useEffect(() => {
    if (leads && leads.length === 0) {
      console.log("No leads found in the leads state");
    }
  }, [leads]);

  const handleAddLead = (newLead: Omit<Lead, 'id' | 'date'>) => {
    addLeadMutation.mutate(newLead, {
      onSuccess: () => {
        setAddModalOpen(false);
        toast({
          title: "Success",
          description: "Lead added successfully",
        });
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

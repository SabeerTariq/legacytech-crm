
import React, { useState, useEffect, useCallback } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

const Leads = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const {
    leads,
    isLoading,
    addLeadMutation,
    updateLeadMutation,
    deleteLeadMutation,
    refetch,
  } = useLeads();

  const handleRefresh = useCallback(async () => {
    console.log("Manually refreshing leads data...");
    setIsRefreshing(true);
    
    try {
      await refetch();
      console.log("Data refreshed successfully, found", leads.length, "leads");
      
      toast({
        title: "Refreshed",
        description: `Lead data has been refreshed. Found ${leads.length} leads.`,
      });

      // Double-check database with direct query
      const { data, error } = await supabase.from('leads').select('*');
      if (error) {
        console.error("Error in direct database check:", error);
      } else {
        console.log(`Direct database check found ${data.length} leads`);
      }
    } catch (error) {
      console.error("Error refreshing leads:", error);
      toast({
        title: "Refresh failed",
        description: "Could not refresh lead data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, leads.length]);

  // Run refresh when component mounts
  useEffect(() => {
    console.log("Leads component mounted, triggering initial data load");
    handleRefresh();
  }, [handleRefresh]);

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

  // Log leads count for debugging
  useEffect(() => {
    console.log("Current leads count:", leads.length);
    if (leads && leads.length > 0) {
      // Check if Levi is in the data
      const leviLead = leads.find(lead => lead.client_name.toLowerCase().includes('levi'));
      if (leviLead) {
        console.log("Found Levi in the leads state:", leviLead);
      } else {
        console.log("Levi not found in leads state, please check data fetching");
      }
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
        // Refresh leads after adding a new one
        handleRefresh();
      },
      onError: (error) => {
        console.error("Error adding lead:", error);
        toast({
          title: "Error",
          description: `Failed to add lead: ${error.message}`,
          variant: "destructive",
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
          handleRefresh();
        },
        onError: (error) => {
          console.error("Error updating lead:", error);
          toast({
            title: "Error",
            description: `Failed to update lead: ${error.message}`,
            variant: "destructive",
          });
        }
      });
    }
  };

  const handleDeleteLead = (leadId: string) => {
    deleteLeadMutation.mutate(leadId, {
      onSuccess: () => {
        setEditModalOpen(false);
        handleRefresh();
      },
      onError: (error) => {
        console.error("Error deleting lead:", error);
        toast({
          title: "Error",
          description: `Failed to delete lead: ${error.message}`,
          variant: "destructive",
        });
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
        <div className="flex flex-col items-center justify-center h-64">
          <Spinner size="lg" className="mb-4" />
          <p>Loading leads data...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {!leads || leads.length === 0 ? (
          <Alert>
            <AlertTitle>No leads found</AlertTitle>
            <AlertDescription>
              We couldn't find any leads in the database. Click refresh to try again or add a new lead.
            </AlertDescription>
          </Alert>
        ) : null}

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
          isLoading={isRefreshing}
          onLeadClick={handleLeadClick}
          onRefresh={handleRefresh}
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

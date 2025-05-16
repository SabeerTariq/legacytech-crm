
import React from "react";
import LeadsList, { Lead } from "@/components/leads/LeadsList";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface LeadsContentProps {
  leads: Lead[];
  searchQuery: string;
  isLoading: boolean;
  onLeadClick: (lead: Lead) => void;
}

const LeadsContent = ({
  leads,
  searchQuery,
  isLoading,
  onLeadClick,
}: LeadsContentProps) => {
  // Simplified filtering logic to ensure all leads are displayed properly
  const filteredLeads = searchQuery
    ? leads.filter(
        (lead) =>
          lead.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
          lead.email_address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : leads;

  console.log("LeadsContent - Leads count:", leads.length);
  console.log("LeadsContent - Filtered leads count:", filteredLeads.length);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="ml-2">Loading leads...</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <p className="text-muted-foreground">No leads found in the database. Add your first lead to get started.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Refresh
        </Button>
      </div>
    );
  }

  if (filteredLeads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <p className="text-muted-foreground">No leads match your search criteria or selected time period.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <LeadsList 
      leads={filteredLeads}
      onAddLeadClick={null}
      onLeadClick={onLeadClick}
    />
  );
};

export default LeadsContent;

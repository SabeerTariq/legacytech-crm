
import React from "react";
import LeadsList, { Lead } from "@/components/leads/LeadsList";
import { Skeleton } from "@/components/ui/skeleton";

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
  const filteredLeads = leads.filter(lead => searchQuery ? 
    lead.client_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase())) || 
    lead.email_address.toLowerCase().includes(searchQuery.toLowerCase())
    : true
  );

  console.log("Leads data:", leads);
  console.log("Filtered leads:", filteredLeads);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <p className="text-muted-foreground">No leads found. Add your first lead to get started.</p>
      </div>
    );
  }

  if (filteredLeads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <p className="text-muted-foreground">No leads match your search criteria.</p>
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

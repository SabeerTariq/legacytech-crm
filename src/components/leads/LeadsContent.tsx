
import React from "react";
import LeadsList, { Lead } from "@/components/leads/LeadsList";

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
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

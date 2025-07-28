
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import LeadsList from "./LeadsList";
import { Lead } from "./LeadsList";

interface LeadsContentProps {
  leads: Lead[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLeadClick?: (lead: Lead) => void;
  onUpdateStatus?: (leadId: string, status: Lead['status']) => void;
}

const LeadsContent: React.FC<LeadsContentProps> = ({
  leads,
  searchQuery,
  onSearchChange,
  onLeadClick,
  onUpdateStatus,
}) => {
  const filteredLeads = leads.filter((lead) =>
          lead.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.business_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.city_state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.source?.toLowerCase().includes(searchQuery.toLowerCase())
  );

    return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search leads by name, email, company, location, or source..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

    <LeadsList 
      leads={filteredLeads}
      onLeadClick={onLeadClick}
      onUpdateStatus={onUpdateStatus}
    />
    </div>
  );
};

export default LeadsContent;

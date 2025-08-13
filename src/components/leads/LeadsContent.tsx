
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
  onLeadEdit?: (lead: Lead) => void;
  onUpdateStatus?: (leadId: string, status: Lead['status']) => void;
  onDeleteLead?: (leadId: string) => void;
  canDelete?: boolean;
}

const LeadsContent: React.FC<LeadsContentProps> = ({
  leads,
  searchQuery,
  onSearchChange,
  onLeadClick,
  onLeadEdit,
  onUpdateStatus,
  onDeleteLead,
  canDelete = true,
}) => {
  const filteredLeads = leads.filter((lead) =>
    lead.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.business_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.city_state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.agent?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <LeadsList 
        leads={filteredLeads}
        onLeadClick={onLeadClick}
        onLeadEdit={onLeadEdit}
        onUpdateStatus={onUpdateStatus}
        onDeleteLead={onDeleteLead}
        canDelete={canDelete}
      />
    </div>
  );
};

export default LeadsContent;

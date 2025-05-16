
import React from "react";
import LeadsList, { Lead } from "@/components/leads/LeadsList";
import { Button } from "@/components/ui/button";
import { UserPlus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";

interface LeadsContentProps {
  leads: Lead[];
  searchQuery: string;
  isLoading: boolean;
  onLeadClick: (lead: Lead) => void;
  onRefresh: () => void;
}

const LeadsContent = ({
  leads,
  searchQuery,
  isLoading,
  onLeadClick,
  onRefresh,
}: LeadsContentProps) => {
  const { toast } = useToast();
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
  
  // Debug: Log the first few leads if they exist
  if (leads.length > 0) {
    console.log("First 3 leads:", leads.slice(0, 3).map(lead => ({
      id: lead.id,
      name: lead.client_name,
      email: lead.email_address
    })));
  } else {
    console.log("No leads found in the leads state. Checking if we need to refresh data.");
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" className="mr-2" />
        <p className="ml-2">Loading leads...</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <p className="text-muted-foreground">No leads found in the database. Click refresh to manually fetch data.</p>
        <div className="flex gap-2">
          <Button 
            onClick={onRefresh} 
            className="mt-4 flex items-center"
            variant="default"
          >
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Refreshing Leads...
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          If leads still don't appear after refreshing, please check the console logs for more information.
        </p>
      </div>
    );
  }

  if (filteredLeads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <p className="text-muted-foreground">No leads match your search criteria or selected time period.</p>
        <Button 
          onClick={onRefresh} 
          className="mt-4 flex items-center"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Leads
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'}
        </p>
        <Button 
          onClick={onRefresh} 
          variant="outline" 
          size="sm"
          className="flex items-center"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      <LeadsList 
        leads={filteredLeads}
        onAddLeadClick={null}
        onLeadClick={onLeadClick}
      />
    </div>
  );
};

export default LeadsContent;

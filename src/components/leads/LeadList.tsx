import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle } from 'lucide-react';
import { useLeads } from '@/hooks/useQueries';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

interface LeadListProps {
  onSelectLead: (lead: any) => void;
  selectedLeadId?: number;
  onAddLead?: () => void;
}



export const LeadList: React.FC<LeadListProps> = ({ onSelectLead, selectedLeadId, onAddLead }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { data, isLoading, isError, error } = useLeads();

  // Extract leads from the API response
  const leads = data?.data?.leads || [];
  console.log('Leads data:', leads);

  // Filter leads based on search term
  const filteredLeads = leads.filter((lead: any) =>
    lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">
          Error loading leads: {(error as any)?.message || 'Unknown error'}
        </p>
        <Button variant="outline" onClick={onAddLead}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Your First Lead
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search leads..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        {filteredLeads.length > 0 ? (
          filteredLeads.map((lead: any) => (
            <div
              key={lead.id}
              className={`cursor-pointer rounded-md p-3 transition-colors ${
                selectedLeadId === lead.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
              onClick={() => onSelectLead(lead)}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{lead.name}</div>
                <div className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedLeadId === lead.id
                    ? lead.status === 'new'
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : lead.status === 'contacted'
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : lead.status === 'qualified'
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-primary-foreground/20 text-primary-foreground'
                    : lead.status === 'new'
                    ? 'bg-blue-100 text-blue-800'
                    : lead.status === 'contacted'
                    ? 'bg-purple-100 text-purple-800'
                    : lead.status === 'qualified'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </div>
              </div>
              <div className={`text-sm ${
                selectedLeadId === lead.id
                  ? 'text-primary-foreground/80'
                  : 'text-muted-foreground'
              }`}>
                {lead.email}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No leads found. Add your first lead to get started.
            </p>
            {onAddLead && (
              <Button variant="outline" onClick={onAddLead}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

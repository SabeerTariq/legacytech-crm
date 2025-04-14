import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Edit, Mail, Phone, Calendar, Tag, Info, UserCheck, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUpdateLeadStatus, useConvertLeadToCustomer } from '@/hooks/useQueries';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LeadDetailsProps {
  lead: any;
}

export const LeadDetails: React.FC<LeadDetailsProps> = ({ lead }) => {
  const [status, setStatus] = useState(lead.status);
  const updateStatusMutation = useUpdateLeadStatus();
  const convertToCustomerMutation = useConvertLeadToCustomer();

  // Update local status when lead prop changes
  useEffect(() => {
    setStatus(lead.status);
  }, [lead.status]);
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold">{lead.name}</h2>
          <p className="text-muted-foreground">{lead.businessName}</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Edit Lead</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">Edit lead form would go here.</p>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-3">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{lead.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{lead.phone}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-3">Lead Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Created on {new Date(lead.createdDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span>Source: {lead.source}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span>Status:
                  <Select
                    value={status}
                    onValueChange={(value) => {
                      setStatus(value);
                      updateStatusMutation.mutate({ id: lead.id, status: value });
                    }}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-[140px] h-7 ml-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                    </SelectContent>
                  </Select>
                  {updateStatusMutation.isPending && (
                    <Loader2 className="ml-2 h-3 w-3 animate-spin inline" />
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-3">Notes</h3>
            <p className="text-sm text-muted-foreground">{lead.notes}</p>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-3">Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild>
                <a href={`mailto:${lead.email}`} target="_blank" rel="noopener noreferrer">
                  <Mail className="mr-1 h-3 w-3" /> Send Email
                </a>
              </Button>
              <Button size="sm" variant="outline">
                <Phone className="mr-1 h-3 w-3" /> Schedule Call
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => convertToCustomerMutation.mutate(lead.id)}
                disabled={convertToCustomerMutation.isPending}
              >
                {convertToCustomerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Converting...
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-1 h-3 w-3" /> Convert to Customer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

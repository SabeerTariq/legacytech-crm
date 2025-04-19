import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export interface Lead {
  id: string;
  client_name: string;
  company?: string;
  email_address: string;
  contact_number?: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  source?: string;
  value?: number;
  date?: string;
  city_state?: string;
  business_description?: string;
  services_required?: string;
  budget?: string;
  additional_info?: string;
  agent?: string;
}

interface LeadsListProps {
  leads: Lead[];
  onAddLeadClick?: (() => void) | null;
  onLeadClick?: (lead: Lead) => void;
}

const LeadsList: React.FC<LeadsListProps> = ({ leads, onAddLeadClick, onLeadClick }) => {
  const statusColors: { [key: string]: string } = {
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-gray-100 text-gray-800",
    qualified: "bg-green-100 text-green-800",
    proposal: "bg-yellow-100 text-yellow-800",
    negotiation: "bg-orange-100 text-orange-800",
    won: "bg-purple-100 text-purple-800",
    lost: "bg-red-100 text-red-800",
  };

  const [filter, setFilter] = React.useState("");

  const filteredLeads = leads.filter((lead) => {
    const searchTerm = filter.toLowerCase();
    return (
      lead.client_name.toLowerCase().includes(searchTerm) ||
      (lead.company && lead.company.toLowerCase().includes(searchTerm)) ||
      lead.email_address.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow 
                key={lead.id} 
                onClick={() => onLeadClick && onLeadClick(lead)} 
                className={onLeadClick ? "cursor-pointer hover:bg-muted/80" : ""}
              >
                <TableCell className="font-medium">{lead.client_name}</TableCell>
                <TableCell>{lead.company || lead.business_description || "-"}</TableCell>
                <TableCell>{lead.email_address}</TableCell>
                <TableCell>{lead.contact_number || "-"}</TableCell>
                <TableCell>
                  <Badge className={statusColors[lead.status] || "bg-gray-100 text-gray-800"}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell>{lead.source || "-"}</TableCell>
                <TableCell className="text-right">
                  ${lead.value ? lead.value.toLocaleString() : "0"}
                </TableCell>
                <TableCell>{lead.agent || "-"}</TableCell>
                <TableCell>{lead.date || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LeadsList;

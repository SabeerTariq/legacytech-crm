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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  source: string;
  value: number;
  assignedTo: {
    name: string;
    initials: string;
    avatar?: string;
  };
  date: string;
}

interface LeadsListProps {
  leads: Lead[];
  onAddLeadClick?: () => void;
}

const LeadsList: React.FC<LeadsListProps> = ({ leads, onAddLeadClick }) => {
  const statusColors: { [key: string]: string } = {
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-gray-100 text-gray-800",
    qualified: "bg-green-100 text-green-800",
    converted: "bg-purple-100 text-purple-800",
    lost: "bg-red-100 text-red-800",
  };

  const [filter, setFilter] = React.useState("");

  const filteredLeads = leads.filter((lead) => {
    const searchTerm = filter.toLowerCase();
    return (
      lead.name.toLowerCase().includes(searchTerm) ||
      lead.company.toLowerCase().includes(searchTerm) ||
      lead.email.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Leads</h2>
        {onAddLeadClick && (
          <Button onClick={onAddLeadClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        )}
      </div>

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
              <TableHead>Assigned To</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>{lead.company}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.phone}</TableCell>
                <TableCell>
                  <Badge className={statusColors[lead.status]}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell>{lead.source}</TableCell>
                <TableCell className="text-right">
                  ${lead.value.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Avatar>
                    {lead.assignedTo.avatar ? (
                      <AvatarImage src={lead.assignedTo.avatar} alt={lead.assignedTo.name} />
                    ) : (
                      <AvatarFallback>{lead.assignedTo.initials}</AvatarFallback>
                    )}
                  </Avatar>
                </TableCell>
                <TableCell>{lead.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LeadsList;

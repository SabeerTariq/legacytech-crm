import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatPhoneNumber } from "@/utils/formatPhone";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface Lead {
  id: string;
  client_name: string;
  company?: string;
  email_address: string;
  contact_number?: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  source?: string;
  price?: number;
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
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 50;

  const statusColors: { [key: string]: string } = {
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-gray-100 text-gray-800",
    qualified: "bg-green-100 text-green-800",
    proposal: "bg-yellow-100 text-yellow-800",
    negotiation: "bg-orange-100 text-orange-800",
    won: "bg-green-100 text-green-800",
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

  // Sort leads by date and handle pagination
  const sortedAndFilteredLeads = filteredLeads
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateA - dateB;
    });

  const totalPages = Math.ceil(sortedAndFilteredLeads.length / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const paginatedLeads = sortedAndFilteredLeads.slice(startIndex, startIndex + leadsPerPage);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead className="w-[220px]">Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>City/State</TableHead>
              <TableHead>Services Required</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Agent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLeads.map((lead) => (
              <TableRow 
                key={lead.id} 
                onClick={() => onLeadClick && onLeadClick(lead)} 
                className={onLeadClick ? "cursor-pointer hover:bg-muted/80" : ""}
              >
                <TableCell>{lead.date || "-"}</TableCell>
                <TableCell className="font-medium">{lead.client_name}</TableCell>
                <TableCell>{lead.company || lead.business_description || "-"}</TableCell>
                <TableCell className="whitespace-nowrap">{formatPhoneNumber(lead.contact_number)}</TableCell>
                <TableCell>{lead.email_address}</TableCell>
                <TableCell>{lead.city_state || "-"}</TableCell>
                <TableCell>{lead.services_required || "-"}</TableCell>
                <TableCell>
                  <Badge className={statusColors[lead.status] || "bg-gray-100 text-gray-800"}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  ${lead.price ? lead.price.toLocaleString() : "0"}
                </TableCell>
                <TableCell>{lead.agent || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index + 1}>
                  <PaginationLink
                    onClick={() => setCurrentPage(index + 1)}
                    isActive={currentPage === index + 1}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default LeadsList;

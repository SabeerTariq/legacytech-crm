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
import { Button } from "@/components/ui/button";
import { formatPhoneNumber } from "@/utils/formatPhone";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Phone,
  Mail,
  UserPlus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Star,
  TrendingUp,
  AlertCircle,
  Clock,
  Calendar,
  DollarSign,
  Building,
  MapPin,
  User,
} from "lucide-react";

export interface Lead {
  id: string;
  client_name: string;
  email_address: string;
  contact_number?: string;
  status: "new" | "converted";
  source?: string;
  price?: number;
  date?: string;
  city_state?: string;
  business_description?: string;
  services_required?: string;
  budget?: string;
  additional_info?: string;
  user_id?: string;
  agent?: string;
  // Enhanced fields
  priority?: "low" | "medium" | "high" | "urgent";
  lead_score?: number;
  last_contact?: string;
  next_follow_up?: string;

  sales_disposition_id?: string;
  converted_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface LeadsListProps {
  leads: Lead[];
  onLeadClick?: (lead: Lead) => void;
  onUpdateStatus?: (leadId: string, status: Lead['status']) => void;
}

const LeadsList: React.FC<LeadsListProps> = ({ 
  leads, 
  onLeadClick, 
  onUpdateStatus,
}) => {
  const statusColors: { [key: string]: string } = {
    new: "bg-blue-100 text-blue-800 border-blue-200",
    converted: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };

  const priorityColors: { [key: string]: string } = {
    low: "bg-gray-100 text-gray-600 border-gray-200",
    medium: "bg-blue-100 text-blue-600 border-blue-200",
    high: "bg-orange-100 text-orange-600 border-orange-200",
    urgent: "bg-red-100 text-red-600 border-red-200",
  };

  const priorityIcons: { [key: string]: React.ReactNode } = {
    low: <Star className="h-3 w-3" />,
    medium: <Star className="h-3 w-3 fill-current" />,
    high: <TrendingUp className="h-3 w-3" />,
    urgent: <AlertCircle className="h-3 w-3" />,
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const isOverdue = (date: string) => {
    return new Date(date) < new Date();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Lead Date</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Last Contact</TableHead>
              <TableHead>Follow Up</TableHead>
              
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {getInitials(lead.client_name)}
                    </div>
                    <div>
                      <div className="font-medium">{lead.client_name}</div>
                      <div className="text-xs text-muted-foreground">ID: {lead.id.slice(0, 8)}...</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{lead.email_address}</span>
                    </div>
                    {lead.contact_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{formatPhoneNumber(lead.contact_number)}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px]">
                    <span className="text-sm text-muted-foreground truncate block">
                      {lead.services_required || '-'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{lead.budget || '-'}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {formatDate(lead.date)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{lead.agent || '-'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{lead.business_description || '-'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{lead.city_state || '-'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[lead.status] || "bg-gray-100 text-gray-800"}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {lead.priority ? (
                    <Badge className={priorityColors[lead.priority]} variant="outline">
                      <span className="mr-1">{priorityIcons[lead.priority]}</span>
                      {lead.priority}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {lead.lead_score ? (
                    <div className={`text-sm font-medium ${getLeadScoreColor(lead.lead_score)}`}>
                      {lead.lead_score}/100
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{lead.source || '-'}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">
                      {lead.price ? `$${lead.price.toLocaleString()}` : '-'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {lead.last_contact ? (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {formatDateTime(lead.last_contact)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {lead.next_follow_up ? (
                    <div className="flex items-center gap-1">
                      <Clock className={`h-3 w-3 ${isOverdue(lead.next_follow_up) ? 'text-red-500' : 'text-muted-foreground'}`} />
                      <span className={`text-sm ${isOverdue(lead.next_follow_up) ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                        {isOverdue(lead.next_follow_up) ? 'Overdue' : formatDate(lead.next_follow_up)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onLeadClick && onLeadClick(lead)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {leads.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No leads found.</p>
        </div>
      )}
    </div>
  );
};

export default LeadsList;

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Target,
  Calendar,
  DollarSign,
  Clock,
  Star,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Lead } from "./LeadsList";
import { formatPhoneNumber } from "@/utils/formatPhone";
import { Label } from "@/components/ui/label";

interface LeadViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
}

const LeadViewModal = ({ open, onOpenChange, lead }: LeadViewModalProps) => {
  if (!lead) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const isOverdue = (date: string) => {
    return new Date(date) < new Date();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Lead Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-medium">
                  {getInitials(lead.client_name)}
                </div>
                <div>
                  <div className="text-xl font-semibold">{lead.client_name}</div>
                  <div className="text-sm text-muted-foreground">ID: {lead.id}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <div className="text-sm">{lead.email_address}</div>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <div className="text-sm">{lead.contact_number ? formatPhoneNumber(lead.contact_number) : '-'}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Company/Business
                </Label>
                <div className="text-sm">{lead.business_description || '-'}</div>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  City/State
                </Label>
                <div className="text-sm">{lead.city_state || '-'}</div>
              </div>
            </CardContent>
          </Card>

          {/* Lead Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Lead Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Badge className={statusColors[lead.status] || "bg-gray-100 text-gray-800"}>
                    {lead.status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <Label>Source</Label>
                  <div className="text-sm">{lead.source || '-'}</div>
                </div>
                
                <div className="space-y-2">
                  <Label>Value</Label>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">
                      {lead.price ? `$${lead.price.toLocaleString()}` : '-'}
                    </span>
                  </div>
                </div>
              </div>
              
              {lead.priority && (
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Badge className={priorityColors[lead.priority]} variant="outline">
                    <span className="mr-1">{priorityIcons[lead.priority]}</span>
                    {lead.priority}
                  </Badge>
                </div>
              )}
              
              {lead.lead_score && (
                <div className="space-y-2">
                  <Label>Lead Score</Label>
                  <div className={`text-sm font-medium ${getLeadScoreColor(lead.lead_score)}`}>
                    {lead.lead_score}/100
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Services Required</Label>
                <div className="text-sm">{lead.services_required || '-'}</div>
              </div>
              
              <div className="space-y-2">
                <Label>Budget</Label>
                <div className="text-sm">{lead.budget || '-'}</div>
              </div>
              
              <div className="space-y-2">
                <Label>Additional Information</Label>
                <div className="text-sm">{lead.additional_info || '-'}</div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Lead Date
                  </Label>
                  <div className="text-sm">{formatDate(lead.date)}</div>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Assigned Agent
                  </Label>
                  <div className="text-sm">{lead.agent || '-'}</div>
                </div>
              </div>
              
              {lead.last_contact && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Last Contact
                  </Label>
                  <div className="text-sm">{formatDateTime(lead.last_contact)}</div>
                </div>
              )}
              
              {lead.next_follow_up && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className={`h-4 w-4 ${isOverdue(lead.next_follow_up) ? 'text-red-500' : 'text-muted-foreground'}`} />
                    Next Follow Up
                  </Label>
                  <div className={`text-sm ${isOverdue(lead.next_follow_up) ? 'text-red-600 font-medium' : ''}`}>
                    {isOverdue(lead.next_follow_up) ? 'Overdue' : formatDate(lead.next_follow_up)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadViewModal; 
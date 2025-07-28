import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  User,
  CheckCircle,
  X,
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
  priority?: "low" | "medium" | "high" | "urgent";
  lead_score?: number;
  last_contact?: string;
  next_follow_up?: string;
  sales_disposition_id?: string;
  converted_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface LeadSelectorProps {
  leads: Lead[];
  selectedLead: Lead | null;
  onLeadSelect: (lead: Lead | null) => void;
  placeholder?: string;
  className?: string;
}

const LeadSelector: React.FC<LeadSelectorProps> = ({
  leads,
  selectedLead,
  onLeadSelect,
  placeholder = "Search and select a lead...",
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Filter leads based on search query
  const filteredLeads = leads.filter((lead) =>
    lead.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.business_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.city_state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.services_required?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLeadSelect = (leadId: string) => {
    if (leadId === "") {
      onLeadSelect(null);
      setSearchQuery("");
      return;
    }
    
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      onLeadSelect(lead);
      setSearchQuery("");
      setIsOpen(false);
    }
  };

  const handleClearSelection = () => {
    onLeadSelect(null);
    setSearchQuery("");
  };

  const getStatusColor = (status: Lead["status"]) => {
    switch (status) {
      case "converted":
        return "bg-green-100 text-green-800 border-green-200";
      case "new":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Lead Selection Dropdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Select from Leads</Label>
          <span className="text-xs text-muted-foreground">
            {leads.length} leads available
          </span>
        </div>
        
        <Select 
          onValueChange={handleLeadSelect} 
          value={selectedLead?.id || ""}
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="w-[500px] max-h-[400px]">
            {/* Search Bar */}
            <div className="sticky top-0 bg-background p-3 border-b z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search leads by name, email, company, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            
            {/* Results */}
            <div className="max-h-[300px] overflow-y-auto">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id} className="py-2">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{lead.client_name}</span>
                      <Badge 
                        variant="outline"
                        className={`text-xs ${getStatusColor(lead.status)}`}
                      >
                        {lead.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {searchQuery ? 'No leads found matching your search.' : 'No leads available.'}
                </div>
              )}
            </div>
          </SelectContent>
        </Select>
      </div>
      
      {/* Selected Lead Display - Simplified */}
      {selectedLead && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-green-900 text-base">Lead Selected ✓</CardTitle>
                  <p className="text-xs text-green-700">Customer details will be auto-populated</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="text-green-600 hover:text-green-700 hover:bg-green-100"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {/* Simple Customer Name Display */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-900 text-lg">{selectedLead.client_name}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeadSelector; 
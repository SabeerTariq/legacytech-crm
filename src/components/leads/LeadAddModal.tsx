
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  Mail, 
  Phone, 
  Building,
  MapPin, 
  Target,
} from "lucide-react";
import { Lead } from "./LeadsList";

interface LeadAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadAdded: (lead: Omit<Lead, 'id' | 'date'>) => void;
}

const LeadAddModal = ({ open, onOpenChange, onLeadAdded }: LeadAddModalProps) => {
  const [formData, setFormData] = useState({
    client_name: "",
    email_address: "",
    contact_number: "",
    business_description: "",
    city_state: "",
    source: "website",
    status: "new" as Lead["status"],
    services_required: "",
    budget: "",
    price: 0,
    additional_info: "",
    agent: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.client_name.trim()) {
      newErrors.client_name = "Client name is required";
    }
    
    if (!formData.email_address.trim()) {
      newErrors.email_address = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email_address)) {
      newErrors.email_address = "Please enter a valid email address";
    }
    
    if (formData.contact_number && !/^[+]?[1-9][\d]{0,15}$/.test(formData.contact_number.replace(/\s/g, ''))) {
      newErrors.contact_number = "Please enter a valid phone number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const newLead = {
      client_name: formData.client_name,
      email_address: formData.email_address,
      contact_number: formData.contact_number,
      business_description: formData.business_description,
      city_state: formData.city_state,
      source: formData.source,
      status: formData.status,
      services_required: formData.services_required,
      budget: formData.budget,
      price: formData.price,
      additional_info: formData.additional_info,
      agent: formData.agent,
    };
    
    onLeadAdded(newLead);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      client_name: "",
      email_address: "",
      contact_number: "",
      business_description: "",
      city_state: "",
      source: "website",
      status: "new",
      services_required: "",
      budget: "",
      price: 0,
      additional_info: "",
      agent: "",
    });
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Lead</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Client Name *
                  </Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => handleInputChange("client_name", e.target.value)}
                    className={errors.client_name ? "border-red-500" : ""}
                    placeholder="Enter client name"
                  />
                  {errors.client_name && (
                    <p className="text-sm text-red-500">{errors.client_name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="business_description" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Company/Business
                  </Label>
                  <Input
                    id="business_description"
                    value={formData.business_description}
                    onChange={(e) => handleInputChange("business_description", e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email_address" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </Label>
                  <Input
                    id="email_address"
                    type="email"
                    value={formData.email_address}
                    onChange={(e) => handleInputChange("email_address", e.target.value)}
                    className={errors.email_address ? "border-red-500" : ""}
                    placeholder="Enter email address"
                  />
                  {errors.email_address && (
                    <p className="text-sm text-red-500">{errors.email_address}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact_number" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="contact_number"
                    value={formData.contact_number}
                    onChange={(e) => handleInputChange("contact_number", e.target.value)}
                    className={errors.contact_number ? "border-red-500" : ""}
                    placeholder="Enter phone number"
                  />
                  {errors.contact_number && (
                    <p className="text-sm text-red-500">{errors.contact_number}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city_state" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  City/State
                </Label>
                <Input
                  id="city_state"
                  value={formData.city_state}
                  onChange={(e) => handleInputChange("city_state", e.target.value)}
                  placeholder="Enter city and state"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="agent" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Agent
                </Label>
                <Input
                  id="agent"
                  value={formData.agent}
                  onChange={(e) => handleInputChange("agent", e.target.value)}
                  placeholder="Enter agent name"
                />
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
                  <Label htmlFor="source">Source</Label>
                  <Select value={formData.source} onValueChange={(value) => handleInputChange("source", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Website Contact Form">Website Contact Form</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Google Search">Google Search</SelectItem>
                      <SelectItem value="Trade Show">Trade Show</SelectItem>
                      <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                      <SelectItem value="Cold Call">Cold Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value as Lead["status"])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="services_required">Services Required</Label>
                <Textarea
                  id="services_required"
                  value={formData.services_required}
                  onChange={(e) => handleInputChange("services_required", e.target.value)}
                  placeholder="Describe the services the client is looking for"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    value={formData.budget}
                    onChange={(e) => handleInputChange("budget", e.target.value)}
                    placeholder="e.g., $5,000 - $10,000"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="additional_info">Additional Information</Label>
                <Textarea
                  id="additional_info"
                  value={formData.additional_info}
                  onChange={(e) => handleInputChange("additional_info", e.target.value)}
                  placeholder="Any additional notes or information"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Lead
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadAddModal;

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
  Bot,
  Upload,
  FileText
} from "lucide-react";
import { Lead } from "./LeadsList";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface LeadScraperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadAdded: (lead: Omit<Lead, 'id' | 'date'>) => void;
}

const LeadScraper = ({ open, onOpenChange, onLeadAdded }: LeadScraperProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    client_name: "",
    email_address: "",
    contact_number: "",
    business_description: "",
    city_state: "",
    source: "SCRAPPED",
    status: "new" as Lead["status"],
    services_required: "",
    budget: "",
    price: 0,
    additional_info: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const [bulkData, setBulkData] = useState("");

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
      agent: user?.full_name || 'Lead Scraper',
    };
    
    onLeadAdded(newLead);
    resetForm();
  };

  const handleBulkUpload = () => {
    if (!bulkData.trim()) {
      toast({
        title: "Error",
        description: "Please enter lead data to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      const lines = bulkData.trim().split('\n');
      let successCount = 0;
      let errorCount = 0;

      lines.forEach((line, index) => {
        const parts = line.split(',').map(part => part.trim());
        if (parts.length >= 2) {
          const [name, email, ...rest] = parts;
          if (name && email && /\S+@\S+\.\S+/.test(email)) {
            const lead = {
              client_name: name,
              email_address: email,
              contact_number: rest[0] || "",
              business_description: rest[1] || "",
              city_state: rest[2] || "",
              source: "SCRAPPED",
              status: "new" as Lead["status"],
              services_required: rest[3] || "",
              budget: rest[4] || "",
              price: 0,
              additional_info: rest[5] || "",
              agent: user?.full_name || 'Lead Scraper',
            };
            onLeadAdded(lead);
            successCount++;
          } else {
            errorCount++;
          }
        } else {
          errorCount++;
        }
      });

      toast({
        title: "Bulk Upload Complete",
        description: `Successfully added ${successCount} leads. ${errorCount} entries had errors.`,
      });

      setBulkData("");
      setIsBulkUpload(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process bulk data",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      client_name: "",
      email_address: "",
      contact_number: "",
      business_description: "",
      city_state: "",
      source: "SCRAPPED",
      status: "new",
      services_required: "",
      budget: "",
      price: 0,
      additional_info: "",
    });
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6" />
            Lead Scraper
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={!isBulkUpload ? "default" : "outline"}
              onClick={() => setIsBulkUpload(false)}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Single Lead
            </Button>
            <Button
              variant={isBulkUpload ? "default" : "outline"}
              onClick={() => setIsBulkUpload(true)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Bulk Upload
            </Button>
          </div>

          {!isBulkUpload ? (
            /* Single Lead Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Lead Information
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="source">Source</Label>
                      <Select value={formData.source} onValueChange={(value) => handleInputChange("source", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SCRAPPED">Scraped</SelectItem>
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
                <Button type="submit" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Add Scraped Lead
                </Button>
              </div>
            </form>
          ) : (
            /* Bulk Upload Form */
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Bulk Lead Upload
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Enter lead data in CSV format: Name, Email, Phone, Company, City, Services, Budget, Notes
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk_data">Lead Data (CSV Format)</Label>
                    <Textarea
                      id="bulk_data"
                      value={bulkData}
                      onChange={(e) => setBulkData(e.target.value)}
                      placeholder="John Doe, john@example.com, +1234567890, ABC Company, New York, Web Design, $5000-10000, Interested in redesign
Jane Smith, jane@example.com, +0987654321, XYZ Corp, Los Angeles, SEO Services, $2000-5000, Looking for local SEO"
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Format Instructions:</h4>
                    <p className="text-sm text-blue-800">
                      Each line should contain: <strong>Name, Email, Phone, Company, City, Services, Budget, Notes</strong>
                    </p>
                    <p className="text-sm text-blue-800 mt-1">
                      Only Name and Email are required. Other fields are optional.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkUpload} className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Leads
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadScraper; 
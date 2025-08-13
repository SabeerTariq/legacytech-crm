import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, 
  X,
  DollarSign, 
  Calendar, 
  User, 
  Building, 
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  CreditCard,
  CalendarDays,
  Users,
  Settings,
  ArrowRight,
  FileCheck,
  Target,
} from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import LeadSelector from "@/components/leads/LeadSelector";
import type { Lead } from "@/components/leads/LeadsList";

type Service = Database["public"]["Tables"]["services"]["Row"];
type SalesDisposition = Database["public"]["Tables"]["sales_dispositions"]["Row"];

interface ServiceSelection {
  serviceId: string;
  serviceName: string;
  details: string;
}



const EnhancedSalesForm: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    customerName: "",
    phoneNumber: "",
    email: "",
    businessName: "",
    frontBrand: "",
    serviceSold: "",
    servicesIncluded: [] as string[],
    turnaroundTime: "",
    serviceTenure: "",
    serviceDetails: "",
    agreementUrl: "",
    paymentMode: "WIRE" as SalesDisposition["payment_mode"],
    paymentSource: "Wire" as string,
    customPaymentSource: "",
    paymentCompany: "American Digital Agency" as string,
    customPaymentCompany: "",
    brand: "Liberty Web Studio" as string,
    customBrand: "",
    agreementSigned: false,
    agreementSent: false,
    agreementFile: null as File | null,
    company: "American Digital Agency" as SalesDisposition["company"],
    salesSource: "BARK" as SalesDisposition["sales_source"],
    leadSource: "PAID_MARKETING" as SalesDisposition["lead_source"],
    saleType: "FRONT" as SalesDisposition["sale_type"],
    grossValue: 0,
    cashIn: 0,
    remaining: 0,
    taxDeduction: 0,
    saleDate: new Date().toISOString().split('T')[0],
  });

  // Load services and leads
  useEffect(() => {
    loadServices();
    loadLeads();
  }, []);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("name");

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error loading services:", error);
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      });
    }
  };

  const loadLeads = async () => {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .neq("status", "converted") // Only show leads that haven't been converted
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads((data || []).map(lead => ({
        ...lead,
        status: (lead.status || 'new') as Lead['status'],
        priority: lead.priority as Lead['priority']
      })));
    } catch (error) {
      console.error("Error loading leads:", error);
      toast({
        title: "Error",
        description: "Failed to load leads",
        variant: "destructive",
      });
    }
  };

  const handleLeadSelect = (leadId: string) => {
    if (leadId === "") {
      // Clear selection
      setSelectedLead(null);
      return;
    }
    
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setSelectedLead(lead);
      // Populate form data with lead information
      setFormData(prev => ({
        ...prev,
        customerName: lead.client_name,
        phoneNumber: lead.contact_number || "",
        email: lead.email_address,
        businessName: lead.business_description || "",
        grossValue: lead.price || 0,
        cashIn: lead.price || 0,
        remaining: 0,
      }));
      
      // If lead has services required, add them to selected services
      if (lead.services_required) {
        const serviceNames = lead.services_required.split(',').map(s => s.trim());
        const newServices = serviceNames.map((serviceName, index) => ({
          serviceId: `lead-service-${index}`,
          serviceName,
          details: lead.additional_info || ""
        }));
        setSelectedServices(newServices);
      }
      
      toast({
        title: "Lead selected",
        description: `Customer details populated from lead: ${lead.client_name}`,
      });
    }
  };

  // Calculate remaining amount when cash in or gross value changes
  useEffect(() => {
    // Ensure cash in doesn't exceed gross value
    const validCashIn = Math.min(formData.cashIn, formData.grossValue);
    const remaining = Math.max(0, formData.grossValue - validCashIn);
    setFormData(prev => ({ 
      ...prev, 
      cashIn: validCashIn,
      remaining 
    }));
  }, [formData.grossValue, formData.cashIn]);

  // Service selection handlers
  const addService = () => {
    setSelectedServices(prev => [...prev, { serviceId: "", serviceName: "", details: "" }]);
  };

  const removeService = (index: number) => {
    setSelectedServices(prev => prev.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof ServiceSelection, value: string) => {
    setSelectedServices(prev => prev.map((service, i) => 
      i === index ? { ...service, [field]: value } : service
    ));
  };

  // Payment handlers removed - simplified to direct cash in input

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAgreementFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, agreementFile: file }));
    }
  };

  const removeAgreementFile = () => {
    setFormData(prev => ({ ...prev, agreementFile: null }));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!formData.customerName || !formData.phoneNumber || !formData.email) {
        throw new Error("Please fill in all required fields");
      }

      if (selectedServices.length === 0) {
        throw new Error("Please select at least one service");
      }

      if (formData.grossValue <= 0) {
        throw new Error("Gross value must be greater than 0");
      }

      if (formData.cashIn > formData.grossValue) {
        throw new Error("Cash in cannot exceed gross value");
      }

      if (formData.paymentSource === "Other" && !formData.customPaymentSource.trim()) {
        throw new Error("Please enter a custom payment source name");
      }

      if (formData.paymentCompany === "Others" && !formData.customPaymentCompany.trim()) {
        throw new Error("Please enter a custom payment company name");
      }

      if (formData.brand === "Others" && !formData.customBrand.trim()) {
        throw new Error("Please enter a custom brand name");
      }

      // Create sales disposition
      const { data: salesData, error: salesError } = await supabase
        .from("sales_dispositions")
        .insert({
          customer_name: formData.customerName,
          phone_number: formData.phoneNumber,
          email: formData.email,
          business_name: formData.businessName,
          front_brand: formData.frontBrand,
          service_sold: selectedServices[0]?.serviceName || "",
          services_included: selectedServices.map(s => s.serviceName),
          service_details: selectedServices.map(s => `${s.serviceName}: ${s.details}`).join("\n"),
          agreement_url: formData.agreementUrl,
          payment_mode: formData.paymentMode,
          payment_source: formData.paymentSource === "Other" ? formData.customPaymentSource : formData.paymentSource,
          payment_company: formData.paymentCompany === "Others" ? formData.customPaymentCompany : formData.paymentCompany,
          brand: formData.brand === "Others" ? formData.customBrand : formData.brand,
          agreement_signed: formData.agreementSigned,
          agreement_sent: formData.agreementSent,
          company: formData.company,
          sales_source: formData.salesSource,
          lead_source: formData.leadSource,
          sale_type: formData.saleType,
          seller: "", // Will be assigned from Project Assignment module
          account_manager: "", // Will be assigned from Project Assignment module
          assigned_by: user?.id || "",
          assigned_to: "", // Will be assigned from Project Assignment module
          project_manager: "", // Will be assigned from Project Assignment module
          gross_value: formData.grossValue,
          cash_in: formData.cashIn,
          remaining: formData.remaining,
          tax_deduction: formData.taxDeduction,
          sale_date: formData.saleDate,
          service_tenure: formData.serviceTenure,
          turnaround_time: formData.turnaroundTime,
          user_id: user?.id || "",
        })
        .select()
        .single();

      if (salesError) throw salesError;

      // Create projects for each service
      const projectPromises = selectedServices.map(async (service) => {
        const { error: projectError } = await supabase
          .from("projects")
          .insert({
            name: `${formData.customerName} - ${service.serviceName}`,
            client: formData.customerName,
            description: service.details,
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
            status: "unassigned",
            user_id: user?.id || "",
            sales_disposition_id: salesData.id,
            lead_id: selectedLead?.id || null,
            project_type: "one-time",
            services: [service.serviceName],
          });

        if (projectError) throw projectError;
      });

      await Promise.all(projectPromises);

      // Hide the selected lead by marking it as converted if one was selected
      if (selectedLead) {
        const { error: leadUpdateError } = await supabase
          .from("leads")
          .update({
            status: "converted",
            converted_at: new Date().toISOString(),
            sales_disposition_id: salesData.id,
            email_address: selectedLead.email_address
          })
          .eq("id", selectedLead.id);

        if (leadUpdateError) {
          console.error("Error updating lead:", leadUpdateError);
          toast({
            title: "Warning",
            description: "Sales disposition and projects created, but failed to update lead status",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success!",
            description: "Sales disposition and projects created successfully. Lead marked as converted. Your dashboard performance has been updated!",
          });
        }
      } else {
        toast({
          title: "Success!",
          description: "Sales disposition and projects created successfully. Your dashboard performance has been updated!",
        });
      }

      // Reset form
      setFormData({
        customerName: "",
        phoneNumber: "",
        email: "",
        businessName: "",
        frontBrand: "",
        serviceSold: "",
        servicesIncluded: [],
        turnaroundTime: "",
        serviceTenure: "",
        serviceDetails: "",
        agreementUrl: "",
        paymentMode: "WIRE",
        paymentSource: "Wire",
        customPaymentSource: "",
        paymentCompany: "American Digital Agency",
        customPaymentCompany: "",
        brand: "Liberty Web Studio",
        customBrand: "",
        agreementSigned: false,
        agreementSent: false,
        agreementFile: null,
        company: "American Digital Agency",
        salesSource: "BARK",
        leadSource: "PAID_MARKETING",
        saleType: "FRONT",
        grossValue: 0,
        cashIn: 0,
        remaining: 0,
        taxDeduction: 0,
        saleDate: new Date().toISOString().split('T')[0],
      });
      setSelectedServices([]);
      setUploadedFiles([]);
      setSelectedLead(null);

    } catch (error) {
      console.error("Error creating sales disposition:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create sales disposition",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Enhanced Sales Form</h1>
        <p className="text-muted-foreground">
          Create sales dispositions and automatically generate projects for the Production team.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Lead Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Lead Selection
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose a lead to auto-populate customer details, or fill manually below
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
                          <LeadSelector
                leads={leads}
                selectedLead={selectedLead}
                onLeadSelect={(lead) => {
                  if (lead) {
                    handleLeadSelect(lead.id);
                  } else {
                    handleLeadSelect("");
                  }
                }}
                placeholder="Search and select a lead..."
              />
          </CardContent>
        </Card>

        {/* Customer Information - Enhanced with visual indicators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
              {selectedLead && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Auto-populated from lead
                </Badge>
              )}
            </CardTitle>
            {selectedLead && (
              <p className="text-sm text-muted-foreground">
                Customer details have been populated from the selected lead. You can modify any field as needed.
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="flex items-center gap-2">
                  Customer Name *
                  {selectedLead && formData.customerName === selectedLead.client_name && (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  )}
                </Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  required
                  className={selectedLead && formData.customerName === selectedLead.client_name ? "border-green-200 bg-green-50" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                  Phone Number *
                  {selectedLead && formData.phoneNumber === selectedLead.contact_number && (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  )}
                </Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  required
                  className={selectedLead && formData.phoneNumber === selectedLead.contact_number ? "border-green-200 bg-green-50" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  Email *
                  {selectedLead && formData.email === selectedLead.email_address && (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  )}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className={selectedLead && formData.email === selectedLead.email_address ? "border-green-200 bg-green-50" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName" className="flex items-center gap-2">
                  Business Name
                  {selectedLead && formData.businessName === selectedLead.business_description && (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  )}
                </Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                  className={selectedLead && formData.businessName === selectedLead.business_description ? "border-green-200 bg-green-50" : ""}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Service Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedServices.map((service, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Service {index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeService(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Service</Label>
                    <Select
                      value={service.serviceId}
                      onValueChange={(value) => {
                        const selectedService = services.find(s => s.id === value);
                        updateService(index, "serviceId", value);
                        updateService(index, "serviceName", selectedService?.name || "");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Service Details</Label>
                    <Textarea
                      value={service.details}
                      onChange={(e) => updateService(index, "details", e.target.value)}
                      placeholder="Describe the specific requirements..."
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addService}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grossValue">Gross Value *</Label>
                <Input
                  id="grossValue"
                  type="number"
                  value={formData.grossValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, grossValue: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cashIn">Cash In *</Label>
                <Input
                  id="cashIn"
                  type="number"
                  value={formData.cashIn}
                  onChange={(e) => {
                    const newCashIn = parseFloat(e.target.value) || 0;
                    const maxCashIn = formData.grossValue;
                    const validCashIn = Math.min(newCashIn, maxCashIn);
                    setFormData(prev => ({ ...prev, cashIn: validCashIn }));
                  }}
                  max={formData.grossValue}
                  required
                />
                {formData.cashIn > formData.grossValue && (
                  <p className="text-sm text-red-600">
                    Cash in cannot exceed gross value
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Remaining (Auto-calculated)</Label>
                <Input
                  value={formData.remaining}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>
            
            {/* Payment Source */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentSource">Payment Source *</Label>
                <Select
                  value={formData.paymentSource}
                  onValueChange={(value) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      paymentSource: value,
                      customPaymentSource: value === "Other" ? prev.customPaymentSource : ""
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wire">Wire</SelectItem>
                    <SelectItem value="Zelle">Zelle</SelectItem>
                    <SelectItem value="Cashapp">Cashapp</SelectItem>
                    <SelectItem value="Paypal">Paypal</SelectItem>
                    <SelectItem value="Authorize.net">Authorize.net</SelectItem>
                    <SelectItem value="Square">Square</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.paymentSource === "Other" && (
                <div className="space-y-2">
                  <Label htmlFor="customPaymentSource">Custom Payment Source *</Label>
                  <Input
                    id="customPaymentSource"
                    value={formData.customPaymentSource}
                    onChange={(e) => setFormData(prev => ({ ...prev, customPaymentSource: e.target.value }))}
                    placeholder="Enter payment source name"
                    required={formData.paymentSource === "Other"}
                  />
                </div>
              )}
            </div>

            {/* Payment Company */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentCompany">Payment Company *</Label>
                <Select
                  value={formData.paymentCompany}
                  onValueChange={(value) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      paymentCompany: value,
                      customPaymentCompany: value === "Others" ? prev.customPaymentCompany : ""
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="American Digital Agency">American Digital Agency</SelectItem>
                    <SelectItem value="Logic Works">Logic Works</SelectItem>
                    <SelectItem value="OSCS">OSCS</SelectItem>
                    <SelectItem value="AZ Tech">AZ Tech</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.paymentCompany === "Others" && (
                <div className="space-y-2">
                  <Label htmlFor="customPaymentCompany">Custom Payment Company *</Label>
                  <Input
                    id="customPaymentCompany"
                    value={formData.customPaymentCompany}
                    onChange={(e) => setFormData(prev => ({ ...prev, customPaymentCompany: e.target.value }))}
                    placeholder="Enter payment company name"
                    required={formData.paymentCompany === "Others"}
                  />
                </div>
              )}
            </div>

            {/* Brands */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Select
                  value={formData.brand}
                  onValueChange={(value) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      brand: value,
                      customBrand: value === "Others" ? prev.customBrand : ""
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Liberty Web Studio">Liberty Web Studio</SelectItem>
                    <SelectItem value="American Digital Agency">American Digital Agency</SelectItem>
                    <SelectItem value="The Tech Designers">The Tech Designers</SelectItem>
                    <SelectItem value="Designs Lord">Designs Lord</SelectItem>
                    <SelectItem value="American Brand Designer">American Brand Designer</SelectItem>
                    <SelectItem value="The Web Sense">The Web Sense</SelectItem>
                    <SelectItem value="American Digital Publishers">American Digital Publishers</SelectItem>
                    <SelectItem value="Elite Pro Website">Elite Pro Website</SelectItem>
                    <SelectItem value="Web Harmony">Web Harmony</SelectItem>
                    <SelectItem value="Web designs lab">Web designs lab</SelectItem>
                    <SelectItem value="Web Designs Library">Web Designs Library</SelectItem>
                    <SelectItem value="Smart Web Designers">Smart Web Designers</SelectItem>
                    <SelectItem value="Pixel and the beast">Pixel and the beast</SelectItem>
                    <SelectItem value="Logic works">Logic works</SelectItem>
                    <SelectItem value="American Book studio">American Book studio</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.brand === "Others" && (
                <div className="space-y-2">
                  <Label htmlFor="customBrand">Custom Brand *</Label>
                  <Input
                    id="customBrand"
                    value={formData.customBrand}
                    onChange={(e) => setFormData(prev => ({ ...prev, customBrand: e.target.value }))}
                    placeholder="Enter brand name"
                    required={formData.brand === "Others"}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Agreement Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Agreement
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Track agreement status and upload signed documents
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreementSigned"
                  checked={formData.agreementSigned}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, agreementSigned: checked as boolean }))
                  }
                />
                <Label htmlFor="agreementSigned" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Agreement Signed
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreementSent"
                  checked={formData.agreementSent}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, agreementSent: checked as boolean }))
                  }
                />
                <Label htmlFor="agreementSent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Agreement Sent
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agreementFile">Upload Agreement</Label>
              <Input
                id="agreementFile"
                type="file"
                onChange={handleAgreementFileUpload}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG
              </p>
            </div>

            {formData.agreementFile && (
              <div className="space-y-2">
                <Label>Uploaded Agreement</Label>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{formData.agreementFile.name}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeAgreementFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              File Attachments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fileUpload">Upload Files</Label>
              <Input
                id="fileUpload"
                type="file"
                multiple
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files</Label>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Selected Services</Label>
                <div className="space-y-1">
                  {selectedServices.map((service, index) => (
                    <Badge key={index} variant="secondary">
                      {service.serviceName || `Service ${index + 1}`}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Payment Summary</Label>
                <div className="space-y-1 text-sm">
                  <div>Gross Value: ${formData.grossValue.toLocaleString()}</div>
                  <div>Cash In: ${formData.cashIn.toLocaleString()}</div>
                  <div>Remaining: ${formData.remaining.toLocaleString()}</div>
                </div>
              </div>
            </div>
            {/* Project assignment summary removed */}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="min-w-[200px]">
            {loading ? "Creating..." : "Create Sales & Projects"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedSalesForm; 
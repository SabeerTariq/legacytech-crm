import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContextJWT';
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
import LeadSelector from "@/components/leads/LeadSelector";
import type { Lead } from "@/components/leads/LeadsList";

interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface SalesDisposition {
  id: string;
  customer_name: string;
  phone_number?: string;
  email: string;
  business_name?: string;
  front_brand?: string;
  service_sold: string;
  services_included: string[];
  service_details?: string;
  agreement_url?: string;
  payment_mode: string;
  payment_source: string;
  payment_company: string;
  brand: string;
  agreement_signed: boolean;
  agreement_sent: boolean;
  company: string;
  sales_source: string;
  lead_source: string;
  sale_type: string;
  seller?: string;
  account_manager?: string;
  assigned_by?: string;
  assigned_to?: string;
  project_manager?: string;
  gross_value: number;
  cash_in: number;
  remaining: number;
  tax_deduction: number;
  sale_date: string;
  service_tenure?: string;
  turnaround_time?: string;
  user_id?: string;
  is_recurring?: boolean;
  recurring_frequency?: string;
  installment_frequency?: string;
  total_installments?: number;
  current_installment?: number;
  next_payment_date?: string;
  created_at?: string;
  updated_at?: string;
}

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
    // Enhanced Payment Plan Fields
    paymentPlanType: "one_time" as "one_time" | "recurring" | "installments",
    recurringFrequency: "monthly" as "monthly" | "quarterly" | "yearly",
    totalInstallments: 1,
    installmentAmount: 0,
    installmentFrequency: "monthly" as "monthly" | "quarterly" | "yearly",
    nextPaymentDate: "",
    nextInstallmentDate: "",
    paymentSchedule: [] as Array<{ date: string; amount: number; status: string }>,
    recurringPackageAmount: 0, // Added for recurring payment
    gross: 0, // Added for recurring payment
  });

  // Load services and leads
  useEffect(() => {
    loadServices();
    loadLeads();
  }, []);

  const loadServices = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/sales/services`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to load services');
      }

      setServices(result.data || []);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/sales-disposition/leads`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to load leads');
      }

      setLeads((result.data || []).map(lead => ({
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
      

      
             toast({
         title: "Lead selected",
         description: `Customer details populated from lead: ${lead.client_name}. Please select services manually.`,
       });
    }
  };

  // Calculate remaining amount and payment plan details when gross value, cash in, or payment plan type changes
  useEffect(() => {
    let remaining = 0;
    let installmentAmount = 0;
    
    if (formData.paymentPlanType === "installments") {
      // For installment plans, calculate based on number of installments
      installmentAmount = formData.grossValue / (formData.totalInstallments || 1);
      remaining = formData.grossValue - formData.cashIn;
    } else if (formData.paymentPlanType === "recurring") {
      // For recurring payments, initial payment is cash in, remaining is recurring
      remaining = formData.grossValue - formData.cashIn;
    } else {
      // For one-time payments, simple calculation
      remaining = formData.grossValue - formData.cashIn;
    }
    
    // Ensure cash in doesn't exceed appropriate limit based on payment plan
    let validCashIn = formData.cashIn;
    if (formData.paymentPlanType === "installments") {
      validCashIn = Math.min(formData.cashIn, installmentAmount);
    } else {
      validCashIn = Math.min(formData.cashIn, formData.grossValue);
    }
    
    setFormData(prev => ({ 
      ...prev, 
      cashIn: validCashIn,
      remaining: Math.max(0, formData.grossValue - validCashIn),
      installmentAmount: installmentAmount
    }));
  }, [formData.grossValue, formData.cashIn, formData.paymentPlanType, formData.totalInstallments]);

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

  // Helper function to check if a service entry is valid
  const isServiceValid = (service: ServiceSelection) => {
    return service.serviceId && service.serviceName;
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

      // Validate that each service has a selected service
      const invalidServices = selectedServices.filter(service => !service.serviceId || !service.serviceName);
      if (invalidServices.length > 0) {
        throw new Error("Please select a service for all service entries before submitting");
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

      // Validate payment plan configuration
      if (formData.paymentPlanType === "installments" && formData.totalInstallments > 1) {
        if (formData.cashIn > formData.installmentAmount) {
          throw new Error("Initial payment cannot exceed the first installment amount");
        }
      }
      
      if (formData.paymentPlanType === "recurring" && !formData.nextPaymentDate) {
        throw new Error("Please select a next payment date for recurring payments");
      }

              // Create recurring payment schedule if needed
        let recurringScheduleId = null;
        if (formData.paymentPlanType === "recurring") {
          // This will be handled by the MySQL API
          recurringScheduleId = "temp-id";
        }

        // Create sales disposition using MySQL API
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/sales-disposition/disposition`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customerName: formData.customerName,
            phoneNumber: formData.phoneNumber,
            email: formData.email,
            businessName: formData.businessName,
            frontBrand: formData.frontBrand,
            selectedServices: selectedServices,
            agreementUrl: formData.agreementUrl,
            paymentMode: formData.paymentMode,
            paymentSource: formData.paymentSource === "Other" ? formData.customPaymentSource : formData.paymentSource,
            paymentCompany: formData.paymentCompany === "Others" ? formData.customPaymentCompany : formData.paymentCompany,
            brand: formData.brand === "Others" ? formData.customBrand : formData.brand,
            agreementSigned: formData.agreementSigned,
            agreementSent: formData.agreementSent,
            company: formData.company,
            salesSource: formData.salesSource,
            leadSource: formData.leadSource,
            saleType: formData.saleType,
            grossValue: formData.grossValue,
            cashIn: formData.cashIn,
            remaining: formData.remaining,
            taxDeduction: formData.taxDeduction,
            saleDate: formData.saleDate,
            serviceTenure: formData.serviceTenure,
            turnaroundTime: formData.turnaroundTime,
            userId: user?.id || "",
            selectedLeadId: selectedLead?.id || null,
            paymentPlanType: formData.paymentPlanType,
            recurringFrequency: formData.recurringFrequency,
            totalInstallments: formData.totalInstallments,
            installmentAmount: formData.installmentAmount,
            installmentFrequency: formData.installmentFrequency,
            nextPaymentDate: formData.nextPaymentDate,
            nextInstallmentDate: formData.nextInstallmentDate,
            recurringPackageAmount: formData.recurringPackageAmount
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create sales disposition');
        }

        const result = await response.json();
        const salesData = { id: result.data.salesDispositionId };

              // Projects and lead updates are now handled by the MySQL API
      toast({
        title: "Success!",
        description: "Sales disposition and projects created successfully. Lead marked as converted. Your dashboard performance has been updated!",
      });

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
        // Enhanced Payment Plan Fields
        paymentPlanType: "one_time",
        recurringFrequency: "monthly",
        totalInstallments: 1,
        installmentAmount: 0,
        installmentFrequency: "monthly",
        nextPaymentDate: "",
        nextInstallmentDate: "",
        paymentSchedule: [],
        recurringPackageAmount: 0, // Reset recurring package amount
        gross: 0, // Reset gross
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
                   Business Name *
                   {selectedLead && formData.businessName === selectedLead.business_description && (
                     <CheckCircle className="h-3 w-3 text-green-600" />
                   )}
                 </Label>
                                 <Input
                   id="businessName"
                   value={formData.businessName}
                   onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                   className={selectedLead && formData.businessName === selectedLead.business_description ? "border-green-200 bg-green-50" : ""}
                   required
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
            {selectedServices.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  {selectedServices.filter(isServiceValid).length} of {selectedServices.length} services are complete
                  {selectedServices.filter(s => !isServiceValid(s)).length > 0 && (
                    <span className="text-red-600 font-medium">
                      . Please complete all services before submitting.
                    </span>
                  )}
                </p>
              </div>
            )}
            {selectedServices.map((service, index) => (
              <div 
                key={index} 
                className={`p-4 border rounded-lg space-y-4 ${
                  !isServiceValid(service) ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              >
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
                    <Label>Service *</Label>
                    <Select
                      value={service.serviceId}
                      onValueChange={(value) => {
                        const selectedService = services.find(s => s.id === value);
                        updateService(index, "serviceId", value);
                        updateService(index, "serviceName", selectedService?.name || "");
                      }}
                      required
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
                                         {!isServiceValid(service) && (
                       <p className="text-xs text-red-600">
                         Please select a service for this entry.
                       </p>
                     )}
                  </div>
                  <div className="space-y-2">
                                         <Label>Service Details *</Label>
                                         <Textarea
                       value={service.details}
                       onChange={(e) => updateService(index, "details", e.target.value)}
                       placeholder="Describe the specific requirements..."
                       required
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
            {/* Enhanced Payment Plan Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Payment Plan Configuration</Label>
              </div>
              
              {/* Payment Plan Information */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>How Payment Plans Work:</strong>
                </p>
                <ul className="text-xs text-blue-700 mt-1 space-y-1">
                  <li>• <strong>One Time:</strong> Pay full amount upfront or partial payment with remaining balance</li>
                  <li>• <strong>Recurring:</strong> Initial payment + ongoing monthly/quarterly/yearly payments</li>
                  <li>• <strong>Installments:</strong> Split total into equal payments (initial + remaining installments)</li>
                </ul>
              </div>

              {/* Payment Plan Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="paymentPlanType">Payment Plan Type *</Label>
                <Select
                  value={formData.paymentPlanType}
                  onValueChange={(value) => {
                    const newType = value as "one_time" | "recurring" | "installments";
                    let newCashIn = formData.cashIn;
                    let newRemaining = formData.remaining;
                    
                    // Adjust cash in based on payment plan type
                    if (newType === "installments") {
                      // For installments, initial payment should be first installment
                      newCashIn = Math.min(formData.cashIn, formData.grossValue / (formData.totalInstallments || 1));
                      
                      // Auto-calculate next installment date based on current date and frequency
                      let nextDate = new Date();
                      if (formData.installmentFrequency === "monthly") {
                        nextDate.setMonth(nextDate.getMonth() + 1);
                      } else if (formData.installmentFrequency === "quarterly") {
                        nextDate.setMonth(nextDate.getMonth() + 3);
                      } else if (formData.installmentFrequency === "yearly") {
                        nextDate.setFullYear(nextDate.getFullYear() + 1);
                      }
                      
                      setFormData(prev => ({ 
                        ...prev, 
                        nextInstallmentDate: nextDate.toISOString().split('T')[0]
                      }));
                    } else if (newType === "recurring") {
                      // For recurring, don't override the recurring package amount logic
                      // The recurring package amount will handle gross and cash in updates
                      newCashIn = formData.cashIn;
                      
                      // Auto-calculate next payment date based on current date and frequency
                      let nextDate = new Date();
                      if (formData.recurringFrequency === "monthly") {
                        nextDate.setMonth(nextDate.getMonth() + 1);
                      } else if (formData.recurringFrequency === "quarterly") {
                        nextDate.setMonth(nextDate.getMonth() + 3);
                      } else if (formData.recurringFrequency === "yearly") {
                        nextDate.setFullYear(nextDate.getFullYear() + 1);
                      }
                      
                      setFormData(prev => ({ 
                        ...prev, 
                        nextPaymentDate: nextDate.toISOString().split('T')[0]
                      }));
                    } else {
                      // For one-time, cash in can be up to gross value
                      newCashIn = Math.min(formData.cashIn, formData.grossValue);
                    }
                    
                    setFormData(prev => ({ 
                      ...prev, 
                      paymentPlanType: newType,
                      cashIn: newCashIn,
                      remaining: formData.grossValue - newCashIn
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment plan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">One Time Payment</SelectItem>
                    <SelectItem value="recurring">Recurring Payments</SelectItem>
                    <SelectItem value="installments">Installment Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Recurring Payment Options */}
              {formData.paymentPlanType === "recurring" && (
                <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="recurringFrequency">Recurring Frequency *</Label>
                      <Select
                        value={formData.recurringFrequency}
                        onValueChange={(value) => {
                          const frequency = value as "monthly" | "quarterly" | "yearly";
                          let nextDate = new Date();
                          
                          if (frequency === "monthly") {
                            nextDate.setMonth(nextDate.getMonth() + 1);
                          } else if (frequency === "quarterly") {
                            nextDate.setMonth(nextDate.getMonth() + 3);
                          } else if (frequency === "yearly") {
                            nextDate.setFullYear(nextDate.getFullYear() + 1);
                          }
                          
                          setFormData(prev => ({
                            ...prev,
                            recurringFrequency: frequency,
                            nextPaymentDate: nextDate.toISOString().split('T')[0]
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="recurringPackageAmount">Package Amount *</Label>
                      <Input
                        id="recurringPackageAmount"
                        type="number"
                        placeholder="Enter package amount"
                        value={formData.recurringPackageAmount || ''}
                        onChange={(e) => {
                          const amount = parseFloat(e.target.value) || 0;
                          setFormData(prev => ({
                            ...prev,
                            recurringPackageAmount: amount,
                            // Package amount becomes this month's gross and cash in
                            grossValue: amount,
                            cashIn: amount,
                            remaining: 0 // No remaining since it's recurring
                          }));
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-sm text-blue-600 bg-blue-100 p-3 rounded">
                    <strong>How it works:</strong> Package amount (${formData.recurringPackageAmount || 0}) becomes this month's gross and cash in. 
                    Next payment of ${formData.recurringPackageAmount || 0} will be due on {formData.nextPaymentDate ? new Date(formData.nextPaymentDate).toLocaleDateString() : 'Not set'}.
                  </div>
                </div>
              )}

              {/* Installment Plan Options */}
              {formData.paymentPlanType === "installments" && (
                <div className="space-y-4 p-4 border rounded-lg bg-green-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalInstallments">Number of Installments *</Label>
                      <Select
                        value={formData.totalInstallments.toString()}
                        onValueChange={(value) => {
                          const installments = parseInt(value) || 1;
                          const installmentAmount = formData.grossValue / installments;
                          
                          // Calculate next installment date based on frequency
                          let nextDate = new Date();
                          if (formData.installmentFrequency === "monthly") {
                            nextDate.setMonth(nextDate.getMonth() + 1);
                          } else if (formData.installmentFrequency === "quarterly") {
                            nextDate.setMonth(nextDate.getMonth() + 3);
                          } else if (formData.installmentFrequency === "yearly") {
                            nextDate.setFullYear(nextDate.getFullYear() + 1);
                          }
                          
                          // Adjust cash in to be the first installment amount
                          const newCashIn = Math.min(formData.cashIn, installmentAmount);
                          const newRemaining = formData.grossValue - newCashIn;
                          
                          setFormData(prev => ({ 
                            ...prev, 
                            totalInstallments: installments,
                            installmentAmount: installmentAmount,
                            cashIn: newCashIn,
                            remaining: newRemaining,
                            nextInstallmentDate: nextDate.toISOString().split('T')[0]
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select installments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 Installments</SelectItem>
                          <SelectItem value="3">3 Installments</SelectItem>
                          <SelectItem value="4">4 Installments</SelectItem>
                          <SelectItem value="6">6 Installments</SelectItem>
                          <SelectItem value="12">12 Installments</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="installmentFrequency">Installment Frequency *</Label>
                      <Select
                        value={formData.installmentFrequency}
                        onValueChange={(value) => {
                          const frequency = value as "monthly" | "quarterly" | "yearly";
                          let nextDate = new Date();
                          
                          // Calculate next installment date based on frequency
                          if (frequency === "monthly") {
                            nextDate.setMonth(nextDate.getMonth() + 1);
                          } else if (frequency === "quarterly") {
                            nextDate.setMonth(nextDate.getMonth() + 3);
                          } else if (frequency === "yearly") {
                            nextDate.setFullYear(nextDate.getFullYear() + 1);
                          }
                          
                          setFormData(prev => ({ 
                            ...prev, 
                            installmentFrequency: frequency,
                            nextInstallmentDate: nextDate.toISOString().split('T')[0]
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Next Installment Date */}
                  <div className="space-y-2">
                    <Label htmlFor="nextInstallmentDate">Next Installment Date *</Label>
                    <Input
                      id="nextInstallmentDate"
                      type="date"
                      value={formData.nextInstallmentDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, nextInstallmentDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="p-3 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Installment Plan:</strong> {formData.totalInstallments} payments of ${(Number(formData.installmentAmount) || 0).toFixed(2)} each
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      <strong>Frequency:</strong> {formData.installmentFrequency} | <strong>Next Due:</strong> {formData.nextInstallmentDate ? new Date(formData.nextInstallmentDate).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Payment Plan Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Initial Payment:</span>
                    <span className="ml-2 font-medium">
                      ${(Number(formData.cashIn) || 0).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Remaining Amount:</span>
                    <span className="ml-2 font-medium">
                      ${(Number(formData.remaining) || 0).toFixed(2)}
                    </span>
                  </div>
                  
                  {formData.paymentPlanType === "installments" && (
                    <>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Installment Structure:</span>
                        <span className="ml-2 font-medium">
                          {formData.totalInstallments} payments of ${(Number(formData.installmentAmount) || 0).toFixed(2)} each
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Frequency:</span>
                        <span className="ml-2 font-medium">
                          {formData.installmentFrequency} installments
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Next Installment Due:</span>
                        <span className="ml-2 font-medium">
                          {formData.nextInstallmentDate ? new Date(formData.nextInstallmentDate).toLocaleDateString() : 'Not set'}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Remaining Installments:</span>
                        <span className="ml-2 font-medium">
                          {formData.totalInstallments - 1} payments of ${(Number(formData.installmentAmount) || 0).toFixed(2)} each
                        </span>
                      </div>
                    </>
                  )}
                  
                  {formData.paymentPlanType === "recurring" && (
                    <>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Recurring Package:</span>
                        <span className="ml-2 font-medium">
                          ${formData.recurringPackageAmount || 0} every {formData.recurringFrequency}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">This Month:</span>
                        <span className="ml-2 font-medium">
                          ${formData.recurringPackageAmount || 0} (Gross & Cash In)
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Next Payment:</span>
                        <span className="ml-2 font-medium">
                          ${formData.recurringPackageAmount || 0} on {formData.nextPaymentDate ? new Date(formData.nextPaymentDate).toLocaleDateString() : 'Not set'}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {formData.paymentPlanType === "one_time" && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Payment Status:</span>
                      <span className="ml-2 font-medium">
                        {formData.remaining === 0 ? 'Fully Paid' : 'Partial Payment'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

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
                    let maxCashIn = formData.grossValue;
                    
                    // Adjust max cash in based on payment plan type
                    if (formData.paymentPlanType === "installments") {
                      maxCashIn = formData.installmentAmount || formData.grossValue;
                    } else if (formData.paymentPlanType === "recurring") {
                      maxCashIn = formData.grossValue; // Can pay full amount upfront for recurring
                    }
                    
                    const validCashIn = Math.min(newCashIn, maxCashIn);
                    const remaining = formData.grossValue - validCashIn;
                    
                    setFormData(prev => ({ 
                      ...prev, 
                      cashIn: validCashIn,
                      remaining: Math.max(0, remaining)
                    }));
                  }}
                  max={formData.paymentPlanType === "installments" ? (formData.installmentAmount || formData.grossValue) : formData.grossValue}
                  required
                />
                {formData.paymentPlanType === "installments" && (
                  <p className="text-sm text-blue-600">
                    Initial payment: ${(Number(formData.installmentAmount) || 0).toFixed(2)} (first installment)
                  </p>
                )}
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
                   required
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
                   required
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
                   required
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
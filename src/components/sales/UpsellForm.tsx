import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  DollarSign, 
  User, 
  FileText,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Plus,
  X
} from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import CustomerSelector from "./CustomerSelector";
import type { Customer, ServiceSelection, UpsellFormData } from "@/types/upsell";

type Service = Database["public"]["Tables"]["services"]["Row"];
type SalesDisposition = Database["public"]["Tables"]["sales_dispositions"]["Row"];

const UpsellForm: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>([]);

  // Form data
  const [formData, setFormData] = useState<UpsellFormData>({
    customerName: "",
    email: "",
    phoneNumber: "",
    businessName: "",
    selectedServices: [],
    grossValue: 0,
    cashIn: 0,
    remaining: 0,
    paymentMode: "WIRE",
    isUpsell: true,
    serviceTypes: [],
    saleDate: new Date().toISOString().split('T')[0],
    agreementUrl: "",
    notes: ""
  });

  // Load services
  useEffect(() => {
    loadServices();
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

  // Update form data when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      setFormData(prev => ({
        ...prev,
        customerName: selectedCustomer.customer_name,
        email: selectedCustomer.email,
        phoneNumber: selectedCustomer.phone_number,
        businessName: selectedCustomer.business_name || ""
      }));
    }
  }, [selectedCustomer]);

  // Update form data when services change
  useEffect(() => {
    const serviceTypes = [...new Set(selectedServices.map(s => s.serviceType))];
    
    setFormData(prev => ({
      ...prev,
      selectedServices,
      serviceTypes
    }));
  }, [selectedServices]);

  // Calculate remaining amount when cash in changes
  useEffect(() => {
    const remaining = Math.max(0, formData.grossValue - formData.cashIn);
    setFormData(prev => ({ ...prev, remaining }));
  }, [formData.grossValue, formData.cashIn]);

  // Service selection handlers
  const addService = () => {
    setSelectedServices(prev => [...prev, { 
      serviceId: "", 
      serviceName: "", 
      details: "", 
      customPrice: 0,
      billingFrequency: "monthly",
      category: "development",
      serviceType: "project"
    }]);
  };

  const removeService = (index: number) => {
    setSelectedServices(prev => prev.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof ServiceSelection, value: string | number) => {
    setSelectedServices(prev => prev.map((service, i) => {
      if (i === index) {
        const updatedService = { ...service, [field]: value };
        
        // If updating serviceId, also update other fields from the selected service
        if (field === 'serviceId' && typeof value === 'string') {
          const selectedService = services.find(s => s.id === value);
          if (selectedService) {
            updatedService.serviceName = selectedService.name;
            updatedService.customPrice = (selectedService as any).price || 0; // Use as starting point
            updatedService.billingFrequency = (selectedService as any).billing_frequency || 'monthly';
            updatedService.category = (selectedService as any).category || 'development';
            updatedService.serviceType = (selectedService as any).service_type || 'project';
          }
        }
        
        return updatedService;
      }
      return service;
    }));
  };

  // Categorize services by type
  const categorizeServices = (services: ServiceSelection[]) => {
    return {
      projects: services.filter(s => s.serviceType === 'project'),
      recurring: services.filter(s => s.serviceType === 'recurring'),
      oneTime: services.filter(s => s.serviceType === 'one-time')
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!selectedCustomer) {
        throw new Error("Please select a customer");
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

      const { projects, recurring, oneTime } = categorizeServices(selectedServices);

      // Create sales disposition for upsell
      const { data: salesData, error: salesError } = await supabase
        .from("sales_dispositions")
        .insert({
          customer_name: formData.customerName,
          phone_number: formData.phoneNumber,
          email: formData.email,
          business_name: formData.businessName,
          service_sold: selectedServices[0]?.serviceName || "",
          services_included: selectedServices.map(s => s.serviceName),
          service_details: selectedServices.map(s => `${s.serviceName}: ${s.details}`).join("\n"),
          agreement_url: formData.agreementUrl,
          payment_mode: formData.paymentMode as SalesDisposition["payment_mode"],
          company: "American Digital Agency" as SalesDisposition["company"],
          sales_source: "BARK" as SalesDisposition["sales_source"],
          lead_source: "PAID_MARKETING" as SalesDisposition["lead_source"],
          sale_type: "UPSELL" as SalesDisposition["sale_type"],
          seller: "",
          account_manager: "",
          assigned_by: (await supabase.auth.getUser()).data.user?.id || "",
          assigned_to: "",
          project_manager: "",
          gross_value: formData.grossValue,
          cash_in: formData.cashIn,
          remaining: formData.remaining,
          tax_deduction: 0,
          sale_date: formData.saleDate,
          service_tenure: "",
          turnaround_time: "",
          user_id: (await supabase.auth.getUser()).data.user?.id,
          is_upsell: true,
          original_sales_disposition_id: selectedCustomer.id,
          service_types: formData.serviceTypes
        })
        .select()
        .single();

      if (salesError) throw salesError;

      // Create projects for project-based services
      if (projects.length > 0) {
        const projectPromises = projects.map(async (service) => {
          const { error: projectError } = await supabase
            .from("projects")
            .insert({
              name: `${formData.customerName} - ${service.serviceName} (Upsell)`,
              client: formData.customerName,
              description: service.details,
              due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              status: "unassigned",
              user_id: (await supabase.auth.getUser()).data.user?.id,
              sales_disposition_id: salesData.id,
              project_type: "upsell",
              services: [service.serviceName],
              is_upsell: true
            });

          if (projectError) throw projectError;
        });

        await Promise.all(projectPromises);
      }

      // Create recurring service records
      if (recurring.length > 0) {
        const recurringPromises = recurring.map(async (service) => {
          const nextBillingDate = new Date();
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1); // Default to monthly

          const { error: recurringError } = await supabase
            .from("recurring_services")
            .insert({
              customer_id: salesData.id,
              service_name: service.serviceName,
              description: service.details,
              billing_cycle: 'monthly' as any,
              amount: formData.grossValue / selectedServices.length, // Split total among services
              start_date: new Date().toISOString().split('T')[0],
              next_billing_date: nextBillingDate.toISOString().split('T')[0],
              status: 'active',
              auto_renewal: true
            });

          if (recurringError) throw recurringError;
        });

        await Promise.all(recurringPromises);
      }

      // Create one-time service records (using recurring_services table for now)
      if (oneTime.length > 0) {
        const oneTimePromises = oneTime.map(async (service) => {
          const { error: oneTimeError } = await supabase
            .from("recurring_services")
            .insert({
              customer_id: salesData.id,
              service_name: service.serviceName,
              description: service.details,
              billing_cycle: 'one-time' as any,
              amount: formData.grossValue / selectedServices.length, // Split total among services
              start_date: new Date().toISOString().split('T')[0],
              next_billing_date: new Date().toISOString().split('T')[0],
              status: 'completed',
              auto_renewal: false
            });

          if (oneTimeError) throw oneTimeError;
        });

        await Promise.all(oneTimePromises);
      }

      toast({
        title: "Upsell Created Successfully!",
        description: `Created upsell for ${formData.customerName} with ${selectedServices.length} additional services. Total value: $${formData.grossValue}`,
      });

      // Reset form
      setSelectedCustomer(null);
      setSelectedServices([]);
      setFormData({
        customerName: "",
        email: "",
        phoneNumber: "",
        businessName: "",
        selectedServices: [],
        grossValue: 0,
        cashIn: 0,
        remaining: 0,
        paymentMode: "WIRE",
        isUpsell: true,
        serviceTypes: [],
        saleDate: new Date().toISOString().split('T')[0],
        agreementUrl: "",
        notes: ""
      });

    } catch (error: any) {
      console.error("Error creating upsell:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create upsell",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const { projects, recurring, oneTime } = categorizeServices(selectedServices);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <ArrowRight className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Create Upsell</h1>
        <Badge variant="outline" className="ml-2">Existing Customer</Badge>
      </div>
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This will create a new sales record for the upsell while linking it to the customer's original sale. 
          This helps track upsell performance and customer lifetime value.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerSelector
              onCustomerSelect={setSelectedCustomer}
              selectedCustomer={selectedCustomer}
            />
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
                      onValueChange={(value) => updateService(index, "serviceId", value)}
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
                {service.serviceId && (
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Type:</span> {service.serviceType}
                      <span className="font-medium ml-4">Category:</span> {service.category}
                    </div>
                  </div>
                )}
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

        {/* Service Summary */}
        {selectedServices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Service Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {projects.length > 0 && (
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Project Services</span>
                      <Badge variant="outline">{projects.length}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {projects.map(p => p.serviceName).join(", ")}
                    </div>
                  </div>
                )}
                
                {recurring.length > 0 && (
                  <div className="p-4 border rounded-lg bg-green-50">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Recurring Services</span>
                      <Badge variant="outline">{recurring.length}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {recurring.map(r => r.serviceName).join(", ")}
                    </div>
                  </div>
                )}
                
                {oneTime.length > 0 && (
                  <div className="p-4 border rounded-lg bg-orange-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <span className="font-medium">One-Time Services</span>
                      <Badge variant="outline">{oneTime.length}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {oneTime.map(o => o.serviceName).join(", ")}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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

            <div className="space-y-2">
              <Label htmlFor="paymentMode">Payment Mode</Label>
              <Select
                value={formData.paymentMode}
                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMode: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WIRE">Wire Transfer</SelectItem>
                  <SelectItem value="CARD">Credit Card</SelectItem>
                  <SelectItem value="CHECK">Check</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agreementUrl">Agreement URL</Label>
              <Input
                id="agreementUrl"
                value={formData.agreementUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, agreementUrl: e.target.value }))}
                placeholder="Link to signed agreement"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this upsell..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="min-w-[200px]">
            {loading ? "Creating Upsell..." : "Create Upsell"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UpsellForm; 
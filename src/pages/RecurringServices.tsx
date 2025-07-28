import React, { useState, useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Bell,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type RecurringService = Database["public"]["Tables"]["recurring_services"]["Row"] & {
  customer: Database["public"]["Tables"]["sales_dispositions"]["Row"];
  tasks: Database["public"]["Tables"]["recurring_service_tasks"]["Row"][];
  billing_history: Database["public"]["Tables"]["billing_history"]["Row"][];
};

const RecurringServices = () => {
  const [services, setServices] = useState<RecurringService[]>([]);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Database["public"]["Tables"]["sales_dispositions"]["Row"][]>([]);
  const [isNewServiceDialogOpen, setIsNewServiceDialogOpen] = useState(false);
  const [newService, setNewService] = useState({
    customer_id: "",
    service_name: "",
    description: "",
    billing_cycle: "monthly" as const,
    amount: "",
    start_date: "",
    payment_method: "",
    assigned_team: "",
    notes: "",
    auto_renewal: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load recurring services with related data
      const { data: servicesData, error: servicesError } = await supabase
        .from("recurring_services")
        .select(`
          *,
          customer:sales_dispositions(*),
          tasks:recurring_service_tasks(*),
          billing_history(*)
        `)
        .order("created_at", { ascending: false });

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Load customers for dropdown
      const { data: customersData, error: customersError } = await supabase
        .from("sales_dispositions")
        .select("*")
        .order("customer_name");

      if (customersError) throw customersError;
      setCustomers(customersData || []);

    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load recurring services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createService = async () => {
    if (!newService.customer_id || !newService.service_name || !newService.amount || !newService.start_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("recurring_services")
        .insert({
          customer_id: newService.customer_id,
          service_name: newService.service_name,
          description: newService.description,
          billing_cycle: newService.billing_cycle,
          amount: parseFloat(newService.amount),
          start_date: newService.start_date,
          next_billing_date: calculateNextBillingDate(newService.start_date, newService.billing_cycle),
          payment_method: newService.payment_method || null,
          assigned_team: newService.assigned_team || null,
          notes: newService.notes || null,
          auto_renewal: newService.auto_renewal,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Recurring service created successfully",
      });

      setIsNewServiceDialogOpen(false);
      setNewService({
        customer_id: "",
        service_name: "",
        description: "",
        billing_cycle: "monthly",
        amount: "",
        start_date: "",
        payment_method: "",
        assigned_team: "",
        notes: "",
        auto_renewal: true,
      });
      loadData();
    } catch (error) {
      console.error("Error creating service:", error);
      toast({
        title: "Error",
        description: "Failed to create recurring service",
        variant: "destructive",
      });
    }
  };

  const calculateNextBillingDate = (startDate: string, cycle: string): string => {
    const date = new Date(startDate);
    switch (cycle) {
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "quarterly":
        date.setMonth(date.getMonth() + 3);
        break;
      case "semi_annual":
        date.setMonth(date.getMonth() + 6);
        break;
      case "annual":
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date.toISOString().split('T')[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBillingCycleColor = (cycle: string) => {
    switch (cycle) {
      case "monthly":
        return "bg-blue-100 text-blue-800";
      case "quarterly":
        return "bg-purple-100 text-purple-800";
      case "semi_annual":
        return "bg-orange-100 text-orange-800";
      case "annual":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilBilling = (nextBillingDate: string) => {
    const today = new Date();
    const billingDate = new Date(nextBillingDate);
    const diffTime = billingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTotalRevenue = () => {
    return services.reduce((total, service) => {
      const billingCount = service.billing_history.length;
      return total + (service.amount * billingCount);
    }, 0);
  };

  const getActiveServices = () => {
    return services.filter(service => service.status === "active");
  };

  const getUpcomingBillings = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return services.filter(service => {
      const billingDate = new Date(service.next_billing_date);
      return billingDate >= today && billingDate <= thirtyDaysFromNow;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading recurring services...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Recurring Services</h1>
            <p className="text-muted-foreground">
              Manage retainer-based services and billing cycles
            </p>
          </div>
          <Dialog open={isNewServiceDialogOpen} onOpenChange={setIsNewServiceDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Service
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Recurring Service</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customer">Customer *</Label>
                  <Select value={newService.customer_id} onValueChange={(value) => setNewService({ ...newService, customer_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.customer_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="service_name">Service Name *</Label>
                    <Input
                      id="service_name"
                      value={newService.service_name}
                      onChange={(e) => setNewService({ ...newService, service_name: e.target.value })}
                      placeholder="e.g., SEO Management"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billing_cycle">Billing Cycle *</Label>
                    <Select value={newService.billing_cycle} onValueChange={(value: any) => setNewService({ ...newService, billing_cycle: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="semi_annual">Semi-Annual</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount ($) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newService.amount}
                      onChange={(e) => setNewService({ ...newService, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={newService.start_date}
                      onChange={(e) => setNewService({ ...newService, start_date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    placeholder="Service description and details"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payment_method">Payment Method</Label>
                    <Input
                      id="payment_method"
                      value={newService.payment_method}
                      onChange={(e) => setNewService({ ...newService, payment_method: e.target.value })}
                      placeholder="e.g., Credit Card, Bank Transfer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="assigned_team">Assigned Team</Label>
                    <Input
                      id="assigned_team"
                      value={newService.assigned_team}
                      onChange={(e) => setNewService({ ...newService, assigned_team: e.target.value })}
                      placeholder="e.g., SEO Team"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewServiceDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createService}>
                    Create Service
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Services</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services.length}</div>
              <p className="text-xs text-muted-foreground">
                {getActiveServices().length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${getTotalRevenue().toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From all billing cycles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Billings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getUpcomingBillings().length}</div>
              <p className="text-xs text-muted-foreground">
                Next 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {services.reduce((total, service) => 
                  total + service.tasks.filter(task => task.status === "pending").length, 0
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all services
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Services List */}
        <Card>
          <CardHeader>
            <CardTitle>All Recurring Services</CardTitle>
            <CardDescription>
              Manage your retainer-based services and billing cycles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{service.service_name}</h3>
                        <Badge className={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                        <Badge className={getBillingCycleColor(service.billing_cycle)}>
                          {service.billing_cycle}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Customer:</span>
                          <p className="font-medium">{service.customer?.customer_name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Amount:</span>
                          <p className="font-medium">${service.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Next Billing:</span>
                          <p className="font-medium">
                            {formatDate(service.next_billing_date)}
                            {getDaysUntilBilling(service.next_billing_date) <= 7 && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                {getDaysUntilBilling(service.next_billing_date)} days
                              </Badge>
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tasks:</span>
                          <p className="font-medium">
                            {service.tasks.filter(t => t.status === "pending").length} pending
                          </p>
                        </div>
                      </div>

                      {service.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {service.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Bell className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {services.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recurring services found.</p>
                  <p className="text-sm">Create your first recurring service to get started.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
              </div>
    );
  };

export default RecurringServices; 
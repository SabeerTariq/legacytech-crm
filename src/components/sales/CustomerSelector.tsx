import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  User, 
  Building, 
  Phone, 
  Mail, 
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Users,
  FileText,
  CreditCard
} from "lucide-react";
import type { Customer } from "@/types/upsell";

interface CustomerSelectorProps {
  onCustomerSelect: (customer: Customer) => void;
  selectedCustomer: Customer | null;
  showOnlyActiveProjects?: boolean;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  onCustomerSelect,
  selectedCustomer,
  showOnlyActiveProjects = true
}) => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Load customers with active projects
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      // Load customers from sales_dispositions table
      const { data, error } = await supabase
        .from('sales_dispositions')
        .select('*')
        .order('sale_date', { ascending: false });

      if (error) throw error;

      // Transform data to match Customer interface
      const transformedCustomers: Customer[] = (data || []).map((sd: any) => ({
        id: sd.id,
        customer_name: sd.customer_name,
        email: sd.email,
        phone_number: sd.phone_number,
        business_name: sd.business_name,
        total_projects: 0, // Will be calculated later
        active_projects: 0,
        completed_projects: 0,
        total_recurring_services: 0,
        active_recurring_services: 0,
        monthly_recurring_revenue: 0,
        total_one_time_services: 0,
        total_sales: 1,
        total_lifetime_value: sd.gross_value || 0,
        last_purchase_date: sd.sale_date
      }));

      setCustomers(transformedCustomers);
      setFilteredCustomers(transformedCustomers);
    } catch (error) {
      console.error("Error loading customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter customers based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(customer =>
      customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone_number.includes(searchTerm)
    );

    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const handleCustomerSelect = (customer: Customer) => {
    onCustomerSelect(customer);
    toast({
      title: "Customer Selected",
      description: `Selected customer: ${customer.customer_name}`,
    });
  };

  const clearSelection = () => {
    onCustomerSelect(null as Customer);
    setSearchTerm("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Select Existing Customer
          {showOnlyActiveProjects && (
            <Badge variant="secondary" className="ml-2">
              Active Projects Only
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Search for existing customers with active projects to create an upsell
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="space-y-2">
          <Label htmlFor="customerSearch">Search Customers</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="customerSearch"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Selected Customer Display */}
        {selectedCustomer && (
          <div className="p-4 border rounded-lg bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Customer Selected</span>
              </div>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Change
              </Button>
            </div>
            <div className="mt-2 space-y-1">
              <div className="font-medium">{selectedCustomer.customer_name}</div>
              <div className="text-sm text-green-700">{selectedCustomer.email}</div>
              <div className="text-sm text-green-700">{selectedCustomer.phone_number}</div>
            </div>
          </div>
        )}

        {/* Customer List */}
        {!selectedCustomer && (
          <div className="space-y-2">
            <Label>Available Customers</Label>
            {loading ? (
              <div className="text-center py-4">Loading customers...</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                {searchTerm ? "No customers found matching your search" : "No customers available"}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredCustomers.map((customer) => (
                                     <div
                     key={customer.id}
                     className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                     onClick={() => handleCustomerSelect(customer)}
                   >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">{customer.customer_name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone_number}
                          </span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {customer.active_projects} Active Projects
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {customer.active_recurring_services} Services
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${customer.total_lifetime_value.toLocaleString()} Total Value
                        </div>
                      </div>
                    </div>
                    
                    {/* Customer Portfolio Summary */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <div className="text-muted-foreground">Projects</div>
                          <div className="font-medium">{customer.total_projects}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Recurring Revenue</div>
                          <div className="font-medium">${customer.monthly_recurring_revenue}/mo</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Last Purchase</div>
                          <div className="font-medium">
                            {customer.last_purchase_date 
                              ? new Date(customer.last_purchase_date).toLocaleDateString()
                              : 'N/A'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Customer Portfolio Details */}
        {selectedCustomer && (
          <div className="space-y-4">
            <Separator />
            <div>
              <h4 className="font-medium mb-3">Customer Portfolio</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedCustomer.active_projects}</div>
                  <div className="text-xs text-muted-foreground">Active Projects</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedCustomer.active_recurring_services}</div>
                  <div className="text-xs text-muted-foreground">Active Services</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">${selectedCustomer.monthly_recurring_revenue}</div>
                  <div className="text-xs text-muted-foreground">Monthly Revenue</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">${selectedCustomer.total_lifetime_value.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total Value</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerSelector; 
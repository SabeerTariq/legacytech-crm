import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  User, 
  Building, 
  Mail, 
  Phone, 
  Calendar,
  DollarSign,
  CheckCircle,
  X,
  FileText
} from "lucide-react";

interface Customer {
  id: string;
  customer_name: string;
  email: string;
  phone_number: string;
  business_name?: string;
  service_sold?: string;
  gross_value?: number;
  sale_date?: string;
  created_at?: string;
}

interface CustomerSelectorProps {
  onCustomerSelect: (customer: Customer | null) => void;
  selectedCustomer: Customer | null;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({ 
  onCustomerSelect, 
  selectedCustomer 
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Load customers from sales_dispositions table
  const loadCustomers = async (search: string = "") => {
    setLoading(true);
    try {
      let query = supabase
        .from("sales_dispositions")
        .select(`
          id,
          customer_name,
          email,
          phone_number,
          business_name,
          service_sold,
          gross_value,
          sale_date,
          created_at
        `)
        .order("created_at", { ascending: false });

      // Filter by user if they are a front_sales user
      if (user?.employee?.department === 'Front Sales') {
        console.log('Filtering customers for front_sales user in CustomerSelector:', user.id);
        query = query.eq('user_id', user.id);
      }
      // Filter by assigned projects if they are an upseller
      else if (user?.employee?.department === 'Upseller') {
        console.log('Filtering customers for upseller in CustomerSelector - only showing assigned customers:', user.employee.id);
        
        // Get projects assigned to this upseller
        const { data: assignedProjects, error: projectsError } = await supabase
          .from('projects')
          .select('sales_disposition_id')
          .eq('assigned_pm_id', user.employee.id)
          .not('sales_disposition_id', 'is', null);

        if (projectsError) throw projectsError;

        if (assignedProjects && assignedProjects.length > 0) {
          const salesDispositionIds = assignedProjects
            .map(p => p.sales_disposition_id)
            .filter(id => id !== null);
          
          query = query.in('id', salesDispositionIds);
        } else {
          // No assigned projects, return empty array
          console.log('No projects assigned to upseller in CustomerSelector, showing no customers');
          setCustomers([]);
          setLoading(false);
          return;
        }
      }

      if (search.trim()) {
        query = query.or(`
          customer_name.ilike.%${search}%,
          email.ilike.%${search}%,
          business_name.ilike.%${search}%
        `);
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Search customers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim().length >= 2) {
      loadCustomers(value);
      setShowResults(true);
    } else {
      setCustomers([]);
      setShowResults(false);
    }
  };

  // Select a customer
  const handleCustomerSelect = (customer: Customer) => {
    onCustomerSelect(customer);
    setShowResults(false);
    setSearchTerm(customer.customer_name);
  };

  // Clear selection
  const handleClearSelection = () => {
    onCustomerSelect(null);
    setSearchTerm("");
    setCustomers([]);
    setShowResults(false);
  };

  // Load initial customers on mount
  useEffect(() => {
    if (selectedCustomer) {
      setSearchTerm(selectedCustomer.customer_name);
    }
  }, [selectedCustomer]);

  return (
    <div className="relative">
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers by name, email, or business..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
              onFocus={() => {
                if (customers.length > 0) setShowResults(true);
              }}
            />
          </div>
          {selectedCustomer && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearSelection}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search Results */}
        {showResults && (
          <Card className="absolute top-full left-0 right-0 z-50 max-h-96 overflow-y-auto">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  Searching customers...
                </div>
              ) : customers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm.trim() ? "No customers found" : "Start typing to search customers"}
                </div>
              ) : (
                <div className="divide-y">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900 truncate">
                              {customer.customer_name}
                            </span>
                            {customer.business_name && (
                              <Badge variant="secondary" className="text-xs">
                                <Building className="h-3 w-3 mr-1" />
                                {customer.business_name}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            {customer.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{customer.email}</span>
                              </div>
                            )}
                            {customer.phone_number && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                <span>{customer.phone_number}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            {customer.service_sold && (
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                <span>{customer.service_sold}</span>
                              </div>
                            )}
                            {customer.gross_value && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                <span>${customer.gross_value.toLocaleString()}</span>
                              </div>
                            )}
                            {customer.sale_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(customer.sale_date).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {selectedCustomer?.id === customer.id && (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected Customer Display */}
      {selectedCustomer && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Selected Customer</span>
          </div>
          <div className="text-sm text-blue-600">
            <p><strong>Name:</strong> {selectedCustomer.customer_name}</p>
            <p><strong>Email:</strong> {selectedCustomer.email}</p>
            <p><strong>Phone:</strong> {selectedCustomer.phone_number}</p>
            {selectedCustomer.business_name && (
              <p><strong>Business:</strong> {selectedCustomer.business_name}</p>
            )}
            {selectedCustomer.service_sold && (
              <p><strong>Previous Service:</strong> {selectedCustomer.service_sold}</p>
            )}
            {selectedCustomer.gross_value && (
              <p><strong>Previous Value:</strong> ${selectedCustomer.gross_value.toLocaleString()}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSelector; 
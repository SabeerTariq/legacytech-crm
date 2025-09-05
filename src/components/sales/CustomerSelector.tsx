import React, { useState, useEffect } from "react";
import { useAuth } from '@/contexts/AuthContextJWT';
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
  total_value?: number;
  total_sales?: number;
  sale_date?: string;
  created_at?: string;
  user_id?: string;
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

  // Load customers using the new efficient customers API with role-based filtering
  const loadCustomers = async (search: string = "") => {
    setLoading(true);
    try {
      if (!user?.id) {
        console.error('No user ID available for customer loading');
        return;
      }

      // Use the new efficient customers API that handles role-based filtering
      const response = await fetch(`/api/customers?user_id=${user.id}`, {
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
        throw new Error(result.message || 'Failed to load customers');
      }

      let customers = result.data || [];

      // Apply search filter if provided
      if (search.trim()) {
        customers = customers.filter(c => 
          c.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
          c.email?.toLowerCase().includes(search.toLowerCase()) ||
          c.business_name?.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Limit results to 20
      customers = customers.slice(0, 20);
      setCustomers(customers);
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
                            {(customer.total_value || customer.gross_value) && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                <span>${(customer.total_value || customer.gross_value || 0).toLocaleString()}</span>
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
            {(selectedCustomer.total_value || selectedCustomer.gross_value) && (
              <p><strong>Total Value:</strong> ${(selectedCustomer.total_value || selectedCustomer.gross_value || 0).toLocaleString()}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSelector; 
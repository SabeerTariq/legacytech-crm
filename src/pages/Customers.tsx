import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserCheck, Building, Mail, Phone, Calendar, DollarSign, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

interface Customer {
  id: string;
  customer_name: string;
  email: string;
  phone_number: string;
  business_name: string;
  service_sold: string;
  gross_value: number;
  sale_date: string;
  created_at: string;
  status?: string;
  cash_in?: number;
  remaining?: number;
  total_sales?: number;
  total_value?: number;
  user_id?: string;
}

const Customers = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('sales_dispositions')
        .select(`
          id,
          customer_name,
          email,
          phone_number,
          business_name,
          service_sold,
          gross_value,
          sale_date,
          created_at,
          cash_in,
          remaining,
          user_id
        `)
        .order('created_at', { ascending: false });

      // Filter by user if they are a front_sales user
      if (user?.employee?.department === 'Front Sales') {
        console.log('Filtering customers for front_sales user:', user.id);
        query = query.eq('user_id', user.id);
      } 
      // Filter by assigned projects if they are an upseller
      else if (user?.employee?.department === 'Upseller') {
        console.log('Filtering customers for upseller - only showing assigned customers:', user.employee.id);
        
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
          console.log('No projects assigned to upseller, showing no customers');
          setCustomers([]);
          setLoading(false);
          return;
        }
      } else {
        console.log('Showing all customers for non-front_sales/upseller user:', user?.employee?.department);
      }

      const { data: allSales, error: salesError } = await query;

      if (salesError) throw salesError;

      // Group by unique customers (email + phone combination)
      const customerMap = new Map();
      
      allSales?.forEach(sale => {
        const customerKey = `${sale.email}-${sale.phone_number}`;
        
        if (!customerMap.has(customerKey)) {
          // This is a new customer, add them
          customerMap.set(customerKey, {
            id: sale.id,
            customer_name: sale.customer_name,
            email: sale.email,
            phone_number: sale.phone_number,
            business_name: sale.business_name,
            service_sold: sale.service_sold,
            gross_value: sale.gross_value || 0,
            sale_date: sale.sale_date,
            created_at: sale.created_at,
            cash_in: sale.cash_in || 0,
            remaining: sale.remaining || 0,
            total_sales: 1,
            total_value: sale.gross_value || 0,
            user_id: sale.user_id
          });
        } else {
          // Customer already exists, update totals
          const existingCustomer = customerMap.get(customerKey);
          existingCustomer.total_sales += 1;
          existingCustomer.total_value += (sale.gross_value || 0);
          
          // Keep the most recent sale date
          if (new Date(sale.sale_date) > new Date(existingCustomer.sale_date)) {
            existingCustomer.sale_date = sale.sale_date;
            existingCustomer.created_at = sale.created_at;
          }
        }
      });

      // Convert map to array and sort by most recent
      const uniqueCustomers = Array.from(customerMap.values())
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log('Unique customers:', uniqueCustomers);
      setCustomers(uniqueCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.business_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalValue = customers.reduce((sum, customer) => sum + (customer.gross_value || 0), 0);
  const thisMonth = customers.filter(customer => {
    const customerDate = new Date(customer.created_at);
    const now = new Date();
    return customerDate.getMonth() === now.getMonth() && customerDate.getFullYear() === now.getFullYear();
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading customers...</span>
        </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">
              {user?.employee?.department === 'Front Sales' 
                ? "View customers you converted from leads"
                : user?.employee?.department === 'Upseller'
                ? "View customers assigned to your projects"
                : "Manage your customers and view their project details"
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
              <p className="text-xs text-muted-foreground">
                Total customers
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
              <p className="text-xs text-muted-foreground">
                With sales dispositions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                Combined gross value
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{thisMonth}</div>
              <p className="text-xs text-muted-foreground">
                New customers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Customers List */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Directory</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {customers.length === 0 ? "No customers yet." : "No customers match your search."}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {customers.length === 0 
                    ? user?.employee?.department === 'Front Sales'
                      ? "Convert leads to customers using the sales form to see them here."
                      : user?.employee?.department === 'Upseller'
                      ? "You'll see customers here once projects are assigned to you."
                      : "Create customers by filling out the sales disposition form to see them here."
                    : "Try adjusting your search terms."
                  }
                </p>
                {customers.length === 0 && (
                  <div className="mt-4">
                    <Button asChild>
                      <a href="/sales-form">Create Customer</a>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Accordion type="single" collapsible>
                {filteredCustomers.map((customer) => (
                  <AccordionItem value={customer.id} key={customer.id}>
                    <AccordionTrigger style={{ textDecoration: "none" }}>
                      <div className="w-full bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-lg transition-shadow border border-gray-200">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow">
                            <span className="text-xl font-bold text-purple-700">
                              {getInitials(customer.customer_name)}
                            </span>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-gray-900 mb-1">{customer.customer_name}</div>
                            <div className="flex items-center gap-3 text-gray-600 text-sm">
                              <Mail className="h-4 w-4 mr-1 text-purple-500" />{customer.email}
                              {customer.phone_number && <><span className="mx-1">|</span><Phone className="h-4 w-4 mr-1 text-pink-500" />{customer.phone_number}</>}
                            </div>
                            <div className="text-gray-500 text-sm mt-1">{customer.business_name}</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 mt-4 md:mt-0">
                          <div className="flex gap-4">
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-gray-500">Total Value</span>
                              <span className="text-lg font-semibold text-green-700">{formatCurrency(customer.total_value || customer.gross_value)}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-gray-500">Total Sales</span>
                              <span className="text-base font-medium text-blue-700">{customer.total_sales || 1}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-gray-500">Latest Sale</span>
                              <span className="text-base font-medium text-purple-600">{formatCurrency(customer.gross_value)}</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 mt-2">
                            {customer.total_sales && customer.total_sales > 1 
                              ? `${customer.total_sales} sales - Latest: ${formatDate(customer.sale_date)}`
                              : `Sale: ${formatDate(customer.sale_date)}`
                            }
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-6 py-4">
                        {/* Customer Information */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-lg border-b pb-2">Customer Details</h4>
                            <div><span className="font-medium text-gray-600">Phone:</span> {customer.phone_number}</div>
                            <div><span className="font-medium text-gray-600">Email:</span> {customer.email}</div>
                            <div><span className="font-medium text-gray-600">Business:</span> {customer.business_name || 'N/A'}</div>
                            <div><span className="font-medium text-gray-600">Created:</span> {formatDate(customer.created_at)}</div>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="font-semibold text-lg border-b pb-2">Sales Summary</h4>
                            <div><span className="font-medium text-gray-600">Total Sales:</span> {customer.total_sales || 1}</div>
                            <div><span className="font-medium text-gray-600">Total Value:</span> {formatCurrency(customer.total_value || customer.gross_value)}</div>
                            <div><span className="font-medium text-gray-600">Latest Sale:</span> {formatDate(customer.sale_date)}</div>
                            <div><span className="font-medium text-gray-600">Service Sold:</span> {customer.service_sold}</div>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="font-semibold text-lg border-b pb-2">Payment Details</h4>
                            <div><span className="font-medium text-gray-600">Gross Value:</span> {formatCurrency(customer.gross_value)}</div>
                            <div><span className="font-medium text-gray-600">Cash In:</span> {formatCurrency(customer.cash_in || 0)}</div>
                            <div><span className="font-medium text-gray-600">Remaining:</span> {formatCurrency(customer.remaining || 0)}</div>
                            <div><span className="font-medium text-gray-600">Payment Status:</span> 
                              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                (customer.remaining || 0) === 0 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {(customer.remaining || 0) === 0 ? 'Paid in Full' : 'Partial Payment'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Sales History */}
                        <div>
                          <h4 className="font-semibold text-lg border-b pb-2 mb-4">Sales History</h4>
                          <SalesHistory customer={customer} formatCurrency={formatCurrency} formatDate={formatDate} />
                        </div>

                        {/* Projects */}
                        <div>
                          <h4 className="font-semibold text-lg border-b pb-2 mb-4">Projects</h4>
                          <ProjectSalesInfo customer={customer} formatCurrency={formatCurrency} formatDate={formatDate} />
                        </div>

                        {/* Recurring Services */}
                        <div>
                          <h4 className="font-semibold text-lg border-b pb-2 mb-4">Recurring Services</h4>
                          <RecurringServicesInfo customer={customer} formatCurrency={formatCurrency} formatDate={formatDate} />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
  );
};

export default Customers; 

function SalesHistory({ customer, formatCurrency, formatDate }) {
  const { user } = useAuth();
  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesHistory = async () => {
      setLoading(true);
      
      let query = supabase
        .from("sales_dispositions")
        .select("*")
        .eq("email", customer.email)
        .eq("phone_number", customer.phone_number)
        .order("sale_date", { ascending: false });

      // Filter by user if they are a front_sales user
      if (user?.employee?.department === 'Front Sales') {
        query = query.eq('user_id', user.id);
      }

      const { data } = await query;
      setSalesHistory(data || []);
      setLoading(false);
    };
    fetchSalesHistory();
  }, [customer.email, customer.phone_number, user]);

  if (loading) return <div className="text-gray-500">Loading sales history...</div>;
  if (salesHistory.length === 0) return <div className="text-gray-500">No sales history found.</div>;

  return (
    <div className="space-y-3">
      {salesHistory.map((sale, index) => (
        <div key={sale.id} className={`p-4 border rounded-lg ${index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
          <div className="flex justify-between items-start mb-2">
            <div className="font-semibold">
              {sale.service_sold} {sale.is_upsell && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Upsell</span>}
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">{formatCurrency(sale.gross_value)}</div>
              <div className="text-sm text-gray-500">{formatDate(sale.sale_date)}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div><span className="font-medium">Cash In:</span> {formatCurrency(sale.cash_in || 0)}</div>
            <div><span className="font-medium">Remaining:</span> {formatCurrency(sale.remaining || 0)}</div>
            <div><span className="font-medium">Payment:</span> {sale.payment_mode}</div>
            <div><span className="font-medium">Status:</span> 
              <span className={`ml-1 px-2 py-1 rounded text-xs ${
                (sale.remaining || 0) === 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {(sale.remaining || 0) === 0 ? 'Paid' : 'Pending'}
              </span>
            </div>
          </div>
          {sale.service_details && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Details:</span> {sale.service_details}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ProjectSalesInfo({ customer, formatCurrency, formatDate }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      
      let query = supabase
        .from("sales_dispositions")
        .select("id")
        .eq("email", customer.email)
        .eq("phone_number", customer.phone_number);

      // Filter by user if they are a front_sales user
      if (user?.employee?.department === 'Front Sales') {
        query = query.eq('user_id', user.id);
      }

      const { data: salesData } = await query;
      
      if (salesData && salesData.length > 0) {
        const salesIds = salesData.map(sale => sale.id);
        const { data } = await supabase
          .from("projects")
          .select("*")
          .in("sales_disposition_id", salesIds)
          .order("created_at", { ascending: false });
        setProjects(data || []);
      } else {
        setProjects([]);
      }
      setLoading(false);
    };
    fetchProjects();
  }, [customer.email, customer.phone_number, user]);

  if (loading) return <div className="text-gray-500">Loading projects...</div>;
  if (projects.length === 0) return <div className="text-gray-500">No projects found.</div>;

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <div key={project.id} className="p-4 border rounded-lg bg-gray-50">
          <div className="flex justify-between items-start mb-2">
            <div className="font-semibold">{project.name}</div>
            <span className={`px-2 py-1 rounded text-xs ${
              project.status === 'completed' ? 'bg-green-100 text-green-800' :
              project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              project.status === 'unassigned' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {project.status?.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <div><span className="font-medium">Type:</span> {project.project_type || 'N/A'}</div>
            <div><span className="font-medium">Due Date:</span> {project.due_date ? formatDate(project.due_date) : 'N/A'}</div>
            <div><span className="font-medium">Budget:</span> {project.budget ? formatCurrency(project.budget) : 'N/A'}</div>
          </div>
          {project.description && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Description:</span> {project.description}
            </div>
          )}
          {project.services && project.services.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Services:</span> {project.services.join(', ')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function RecurringServicesInfo({ customer, formatCurrency, formatDate }) {
  const { user } = useAuth();
  const [recurringServices, setRecurringServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecurringServices = async () => {
      setLoading(true);
      
      let query = supabase
        .from("sales_dispositions")
        .select("id")
        .eq("email", customer.email)
        .eq("phone_number", customer.phone_number);

      // Filter by user if they are a front_sales user
      if (user?.employee?.department === 'Front Sales') {
        query = query.eq('user_id', user.id);
      }

      const { data: salesData } = await query;
      
      if (salesData && salesData.length > 0) {
        const salesIds = salesData.map(sale => sale.id);
        const { data } = await supabase
          .from("recurring_services")
          .select("*")
          .in("customer_id", salesIds)
          .order("created_at", { ascending: false });
        setRecurringServices(data || []);
      } else {
        setRecurringServices([]);
      }
      setLoading(false);
    };
    fetchRecurringServices();
  }, [customer.email, customer.phone_number, user]);

  if (loading) return <div className="text-gray-500">Loading recurring services...</div>;
  if (recurringServices.length === 0) return <div className="text-gray-500">No recurring services found.</div>;

  return (
    <div className="space-y-3">
      {recurringServices.map((service) => (
        <div key={service.id} className="p-4 border rounded-lg bg-green-50">
          <div className="flex justify-between items-start mb-2">
            <div className="font-semibold">{service.service_name}</div>
            <span className={`px-2 py-1 rounded text-xs ${
              service.status === 'active' ? 'bg-green-100 text-green-800' :
              service.status === 'suspended' ? 'bg-red-100 text-red-800' :
              service.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {service.status?.toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div><span className="font-medium">Amount:</span> {formatCurrency(service.amount)}</div>
            <div><span className="font-medium">Billing Cycle:</span> {service.billing_cycle}</div>
            <div><span className="font-medium">Next Billing:</span> {formatDate(service.next_billing_date)}</div>
            <div><span className="font-medium">Auto Renew:</span> {service.auto_renewal ? 'Yes' : 'No'}</div>
          </div>
          {service.description && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Description:</span> {service.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 
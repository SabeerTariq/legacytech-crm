
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CustomerList } from '@/components/customers/CustomerList';
import { CustomerDetails } from '@/components/customers/CustomerDetails';
import { Button } from '@/components/ui/button';
import { PlusIcon, Loader2 } from 'lucide-react';
import { useCustomers, useCustomer, useCustomerSales, useCustomerProjects } from '@/hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { NewCustomerForm } from '@/components/customers/NewCustomerForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Data types
export interface Customer {
  id: number;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  address?: string;
  joinDate: string;
  salesCount: number;
  totalSpent: number;
  status: 'active' | 'inactive' | 'lead';
  source: string;
  notes?: string;
}

export interface Sale {
  id: number;
  customerId: number;
  date: string;
  service: string;
  value: number;
  paymentMode: string;
  seller: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export const CustomersPage = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch customers data
  const { data: customersData, isLoading: isLoadingCustomers } = useCustomers();

  // Fetch selected customer details
  const { data: customerData, isLoading: isLoadingCustomer } = useCustomer(selectedCustomerId || 0);

  // Extract the selected customer from the API response
  const selectedCustomer = customerData?.data?.customer || null;

  // Handle customer selection
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
  };

  // Reset selected customer when customers data changes
  useEffect(() => {
    if (customersData?.data?.customers?.length > 0 && !selectedCustomerId) {
      const firstCustomer = customersData.data.customers[0];
      if (firstCustomer && firstCustomer.id) {
        setSelectedCustomerId(firstCustomer.id);
      }
    }
  }, [customersData, selectedCustomerId]);

  // Log data for debugging
  useEffect(() => {
    if (customersData) {
      console.log('Customers data:', customersData);
    }
    if (customerData) {
      console.log('Selected customer data:', customerData);
    }
  }, [customersData, customerData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Customers</h1>
          <p className="page-description">Manage your customer relationships</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <NewCustomerForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
            <CardDescription>View and manage your customers</CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerList
              onSelectCustomer={handleSelectCustomer}
              selectedCustomerId={selectedCustomerId || undefined}
              onAddCustomer={() => setDialogOpen(true)}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
            <CardDescription>
              {selectedCustomer ? `Viewing ${selectedCustomer.name}` : 'Select a customer to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingCustomer && selectedCustomerId ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground">Loading customer details...</span>
              </div>
            ) : selectedCustomer ? (
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="sales">Sales History</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                  <CustomerDetails customer={selectedCustomer} />
                </TabsContent>
                <TabsContent value="sales">
                  <CustomerSalesHistory customerId={selectedCustomer.id} />
                </TabsContent>
                <TabsContent value="projects">
                  <CustomerProjects customerId={selectedCustomer.id} />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center p-8">
                <p className="text-muted-foreground">Select a customer from the list to view their details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Customer Sales History component
const CustomerSalesHistory = ({ customerId }: { customerId: number }) => {
  // Use the customer sales hook
  const { data, isLoading, isError } = useCustomerSales(customerId);

  // Extract sales from the API response
  const salesData = data?.data?.sales || [];

  // Log data for debugging
  useEffect(() => {
    console.log('Sales data:', data);
  }, [data]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Sales History</h3>
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Loading sales data...</span>
        </div>
      ) : salesData.length > 0 ? (
        <div className="rounded-md border">
          <div className="grid grid-cols-5 border-b px-4 py-3 font-medium">
            <div>Date</div>
            <div>Service</div>
            <div>Amount</div>
            <div>Payment</div>
            <div>Status</div>
          </div>
          {salesData.map((sale) => (
            <div key={sale.id} className="grid grid-cols-5 px-4 py-3 hover:bg-muted/50">
              <div>{new Date(sale.date).toLocaleDateString()}</div>
              <div>{sale.service}</div>
              <div>${sale.value.toLocaleString()}</div>
              <div>{sale.paymentMode}</div>
              <div>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  sale.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : sale.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No sales history available</p>
      )}
    </div>
  );
};

// Customer Projects component
const CustomerProjects = ({ customerId }: { customerId: number }) => {
  // Use the customer projects hook
  const { data, isLoading, isError } = useCustomerProjects(customerId);

  // Extract projects from the API response
  const projects = data?.data?.projects || [];

  // Log data for debugging
  useEffect(() => {
    console.log('Projects data:', data);
  }, [data]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Projects</h3>
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Loading projects data...</span>
        </div>
      ) : projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="rounded-md border p-4 hover:bg-muted/50">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{project.name}</h4>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  project.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : project.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Start Date:</span>{' '}
                  {new Date(project.startDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="text-muted-foreground">End Date:</span>{' '}
                  {new Date(project.endDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="text-muted-foreground">Project Manager:</span>{' '}
                  {project.manager}
                </div>
                <div>
                  <span className="text-muted-foreground">Team:</span>{' '}
                  {project.team.join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No projects available</p>
      )}
    </div>
  );
};

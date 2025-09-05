
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Search,
  ArrowRight,
  User,
  Shield,
  UserCheck
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextJWT';

interface CustomerPaymentSummary {
  customer_name: string;
  total_received: number;
  total_remaining: number;
  total_upcoming: number;
  project_count: number;
  last_payment_date: string;
  payment_status: string;
}

export default function Payments() {
  const [customers, setCustomers] = useState<CustomerPaymentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCustomerPayments();
    }
  }, [user]);

  const fetchCustomerPayments = async () => {
    try {
      setLoading(true);
      console.log('Fetching customer payment data...');
      console.log('Current user:', user?.email);
      console.log('User is_admin:', user?.is_admin);
      console.log('User role name:', user?.role?.name);
      console.log('User employee department:', user?.employee?.department);
      console.log('User attributes department:', user?.attributes?.department);
      
      let customerData;
      
      // Check if user is admin or upseller
      if (user?.is_admin || user?.role?.name === 'super_admin' || user?.role?.name === 'admin') {
        // Admin sees all customers
        console.log('Admin user - fetching all customers');
        const { data, error } = await supabase.rpc('get_customer_payment_summary');
        if (error) throw error;
        customerData = data;
      } else if (user?.employee?.department === 'Upseller' || user?.role?.name === 'upseller') {
        // Upseller sees only assigned customers
        console.log('Upseller user - fetching assigned customers only');
        console.log('Upseller email:', user.email);
        const { data, error } = await supabase.rpc('get_customer_payment_summary_by_upseller', {
          upseller_email: user.email
        });
        if (error) throw error;
        customerData = data;
        console.log('Upseller data received:', data);
      } else {
        // Regular users see only their assigned customers
        console.log('Regular user - fetching assigned customers only');
        console.log('Regular user email:', user?.email);
        const { data, error } = await supabase.rpc('get_customer_payment_summary_by_upseller', {
          upseller_email: user?.email
        });
        if (error) throw error;
        customerData = data;
        console.log('Regular user data received:', data);
      }
      
      console.log('Final customer data:', customerData);
      
      if (customerData) {
        setCustomers(customerData);
        console.log('Customers state updated with', customerData.length, 'customers');
      } else {
        console.log('No customer data received');
        setCustomers([]);
      }

    } catch (error) {
      console.error('Error fetching customer payment data:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'fully_paid':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Fully Paid</Badge>;
      case 'partial_payment':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Partial Payment</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCustomerClick = (customerName: string) => {
    navigate(`/payments/customer/${encodeURIComponent(customerName)}`);
  };

  const getUserAccessInfo = () => {
    if (user?.is_admin || user?.role?.name === 'super_admin' || user?.role?.name === 'admin') {
      return {
        icon: <Shield className="w-4 h-4 text-blue-600" />,
        text: 'Admin Access - Viewing all customers',
        className: 'text-blue-600'
      };
    } else if (user?.employee?.department === 'Upseller' || user?.role?.name === 'upseller') {
      return {
        icon: <UserCheck className="w-4 h-4 text-green-600" />,
        text: `Upseller Access - Viewing customers assigned to ${user.display_name}`,
        className: 'text-green-600'
      };
    } else {
      return {
        icon: <User className="w-4 h-4 text-gray-600" />,
        text: `User Access - Viewing customers assigned to ${user?.display_name || 'you'}`,
        className: 'text-gray-600'
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading customer payment data...</p>
        </div>
      </div>
    );
  }

  const accessInfo = getUserAccessInfo();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Payments</h1>
          <p className="text-muted-foreground">View customers and their payment status</p>
          {/* Access Level Indicator */}
          <div className={`flex items-center gap-2 mt-2 text-sm ${accessInfo.className}`}>
            {accessInfo.icon}
            <span>{accessInfo.text}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCustomerPayments}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Label htmlFor="search">Search Customers</Label>
        <Input
          id="search"
          placeholder="Search by customer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-2"
        />
      </div>

      {/* Customer List */}
      <div className="grid gap-4">
        {filteredCustomers.map((customer) => (
          <Card 
            key={customer.customer_name} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleCustomerClick(customer.customer_name)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{customer.customer_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {customer.project_count} project{customer.project_count !== 1 ? 's' : ''} • 
                      Last payment: {new Date(customer.last_payment_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    {getPaymentStatusBadge(customer.payment_status)}
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Received</p>
                      <p className="font-medium text-green-600">${customer.total_received.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining</p>
                      <p className="font-medium text-orange-600">${customer.total_remaining.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Upcoming</p>
                      <p className="font-medium text-blue-600">${customer.total_upcoming.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-500">
            {searchTerm ? `No customers match "${searchTerm}"` : 'No customer payment data available'}
          </p>
        </div>
      )}
    </div>
  );
}

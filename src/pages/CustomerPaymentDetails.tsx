import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  DollarSign, 
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Shield,
  UserCheck,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextJWT';

interface CustomerPaymentDetail {
  id: string;
  service_name: string;
  gross_value: number;
  cash_in: number;
  remaining: number;
  sale_date: string;
  payment_source: string;
  is_recurring: boolean;
  recurring_frequency: string;
  next_payment_date: string;
  total_installments: number;
  current_installment: number;
  installment_frequency: string;
}

interface CustomerInfo {
  customer_name: string;
  total_received: number;
  total_remaining: number;
  project_count: number;
}

export default function CustomerPaymentDetails() {
  const { customerName } = useParams<{ customerName: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<CustomerPaymentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (customerName && user) {
      fetchCustomerPaymentDetails(decodeURIComponent(customerName));
    }
  }, [customerName, user]);

  const fetchCustomerPaymentDetails = async (customer: string) => {
    try {
      setLoading(true);
      
      // Check if user has access to this customer
      if (!user?.is_admin && user?.role?.name !== 'super_admin' && user?.role?.name !== 'admin') {
        // For non-admin users, check if customer is assigned to them
        const { data: assignmentCheck, error: assignmentError } = await supabase
          .from('sales_dispositions')
          .select('assigned_to')
          .eq('customer_name', customer)
          .eq('assigned_to', user.email)
          .limit(1);
        
        if (assignmentError) throw assignmentError;
        
        if (!assignmentCheck || assignmentCheck.length === 0) {
          console.log('Access denied: Customer not assigned to user');
          setAccessDenied(true);
          setLoading(false);
          return;
        }
      }
      
      // Fetch customer summary
      let summaryData;
      if (user?.is_admin || user?.role?.name === 'super_admin' || user?.role?.name === 'admin') {
        // Admin can access any customer
        const { data, error } = await supabase
          .rpc('get_customer_payment_summary')
          .eq('customer_name', customer);
        if (error) throw error;
        summaryData = data;
      } else {
        // Non-admin users can only access assigned customers
        const { data, error } = await supabase
          .rpc('get_customer_payment_summary_by_upseller', {
            upseller_email: user.email
          });
        if (error) throw error;
        summaryData = data.filter((c: CustomerInfo) => c.customer_name === customer);
      }
      
      if (summaryData && summaryData.length > 0) {
        setCustomerInfo(summaryData[0]);
      }

      // Fetch payment data
      let detailQuery = supabase
        .from('sales_dispositions')
        .select(`
          id,
          service_sold,
          gross_value,
          cash_in,
          remaining,
          sale_date,
          payment_source,
          is_recurring,
          recurring_frequency,
          next_payment_date,
          total_installments,
          current_installment,
          installment_frequency
        `)
        .eq('customer_name', customer)
        .order('sale_date', { ascending: false });

      // For non-admin users, only show their assigned sales
      if (!user?.is_admin && user?.role?.name !== 'super_admin' && user?.role?.name !== 'admin') {
        detailQuery = detailQuery.eq('assigned_to', user.email);
      }

      const { data: detailData, error: detailError } = await detailQuery;
      
      if (detailError) throw detailError;
      
      if (detailData) {
        const mappedData = detailData.map(item => ({
          ...item,
          service_name: item.service_sold || 'N/A'
        }));
        setPaymentDetails(mappedData);
      }

    } catch (error) {
      console.error('Error fetching customer payment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getUserAccessInfo = () => {
    if (user?.is_admin || user?.role?.name === 'super_admin' || user?.role?.name === 'admin') {
      return {
        icon: <Shield className="w-4 h-4 text-blue-600" />,
        text: 'Admin Access - Full customer access',
        className: 'text-blue-600'
      };
    } else if (user?.employee?.department === 'Upseller' || user?.role?.name === 'upseller') {
      return {
        icon: <UserCheck className="w-4 h-4 text-green-600" />,
        text: `Upseller Access - Viewing assigned customer`,
        className: 'text-green-600'
      };
    } else {
      return {
        icon: <User className="w-4 h-4 text-gray-600" />,
        text: `User Access - Viewing assigned customer`,
        className: 'text-gray-600'
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500 mb-4">
            You don't have permission to view this customer's payment details.
          </p>
          <Button onClick={() => navigate('/payments')}>Back to Payments</Button>
        </div>
      </div>
    );
  }

  if (!customerInfo) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Customer not found</h3>
          <Button onClick={() => navigate('/payments')}>Back to Payments</Button>
        </div>
      </div>
    );
  }

  // Separate payments into categories
  const receivedPayments = paymentDetails.filter(p => p.cash_in > 0);
  const remainingPayments = paymentDetails.filter(p => p.remaining > 0);
  const upcomingPayments = paymentDetails.filter(p => 
    (p.is_recurring && p.next_payment_date) || 
    (p.total_installments > 1 && p.current_installment < p.total_installments && p.next_payment_date)
  );

  // Calculate upcoming payment amounts
  const upcomingAmounts = upcomingPayments.map(p => {
    if (p.is_recurring) {
      return p.gross_value; // Recurring amount
    } else if (p.total_installments > 1) {
      return p.gross_value / p.total_installments; // Installment amount
    }
    return 0;
  });

  const totalUpcomingAmount = upcomingAmounts.reduce((sum, amount) => sum + amount, 0);

  const accessInfo = getUserAccessInfo();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate('/payments')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{customerInfo.customer_name}</h1>
          <p className="text-muted-foreground">Payment Overview</p>
          {/* Access Level Indicator */}
          <div className={`flex items-center gap-2 mt-2 text-sm ${accessInfo.className}`}>
            {accessInfo.icon}
            <span>{accessInfo.text}</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Received</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(customerInfo.total_received)}</div>
            <p className="text-xs text-muted-foreground">{receivedPayments.length} payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Remaining</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(customerInfo.total_remaining)}</div>
            <p className="text-xs text-muted-foreground">{remainingPayments.length} payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalUpcomingAmount)}</div>
            <p className="text-xs text-muted-foreground">{upcomingPayments.length} scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Sections */}
      <div className="space-y-8">
        {/* Received Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              Received Payments
            </CardTitle>
            <CardDescription>Payments received with service details</CardDescription>
          </CardHeader>
          <CardContent>
            {receivedPayments.length > 0 ? (
              <div className="space-y-4">
                {receivedPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold">{payment.service_name}</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Received Date</p>
                          <p className="font-medium">{formatDate(payment.sale_date)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Payment Method</p>
                          <p className="font-medium">{payment.payment_source || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Service</p>
                          <p className="font-medium">{payment.service_name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Amount Received</p>
                          <p className="font-medium text-green-600">{formatCurrency(payment.cash_in)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No payments received yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Remaining Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="w-5 h-5" />
              Remaining Payments
            </CardTitle>
            <CardDescription>Outstanding balances to be collected</CardDescription>
          </CardHeader>
          <CardContent>
            {remainingPayments.length > 0 ? (
              <div className="space-y-4">
                {remainingPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold">{payment.service_name}</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Service</p>
                          <p className="font-medium">{payment.service_name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Payment Plan</p>
                          <p className="font-medium">
                            {payment.is_recurring ? 'Recurring' : 
                             payment.total_installments > 1 ? 'Installments' : 'One-time'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Remaining Amount</p>
                          <p className="font-medium text-orange-600">{formatCurrency(payment.remaining)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No remaining payments found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Calendar className="w-5 h-5" />
              Upcoming Payments
            </CardTitle>
            <CardDescription>Next scheduled payment amounts and dates</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingPayments.length > 0 ? (
              <div className="space-y-4">
                {upcomingPayments.map((payment) => {
                  const nextAmount = payment.is_recurring 
                    ? payment.gross_value 
                    : payment.gross_value / payment.total_installments;
                   
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold">{payment.service_name}</h3>
                          <div className="flex gap-2">
                            {payment.is_recurring && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">Recurring</Badge>
                            )}
                            {payment.total_installments > 1 && (
                              <Badge variant="outline" className="bg-purple-100 text-purple-800">Installments</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Next Payment Date</p>
                            <p className="font-medium text-blue-700">{payment.next_payment_date ? formatDate(payment.next_payment_date) : 'Not set'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Next Amount</p>
                            <p className="font-medium text-blue-700">{formatCurrency(nextAmount)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Payment Method</p>
                            <p className="font-medium">{payment.payment_source || 'N/A'}</p>
                          </div>
                        </div>

                        {/* Additional context for installments */}
                        {payment.total_installments > 1 && (
                          <div className="mt-3 p-2 bg-purple-100 rounded text-sm">
                            <span className="text-purple-700 font-medium">
                              {payment.current_installment} of {payment.total_installments} installments 
                              ({payment.installment_frequency || 'Not set'})
                            </span>
                          </div>
                        )}

                        {/* Additional context for recurring */}
                        {payment.is_recurring && (
                          <div className="mt-3 p-2 bg-blue-100 rounded text-sm">
                            <span className="text-blue-700 font-medium">
                              {payment.recurring_frequency} recurring payment
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No upcoming payments found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

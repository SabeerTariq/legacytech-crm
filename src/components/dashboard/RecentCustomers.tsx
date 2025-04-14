import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCustomers } from '@/hooks/useQueries';
import { Spinner } from '@/components/ui/spinner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecentCustomers = () => {
  const { data, isLoading, error } = useCustomers();

  // Get the 5 most recent customers
  const recentCustomers = React.useMemo(() => {
    if (!data?.data?.customers) return [];
    
    return [...data.data.customers]
      .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
      .slice(0, 5);
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Customers</CardTitle>
          <CardDescription>Latest customers added to the system</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Spinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Customers</CardTitle>
          <CardDescription>Latest customers added to the system</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <div className="flex items-center justify-center h-full">
            <p className="text-destructive">Error loading customer data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Customers</CardTitle>
        <CardDescription>Latest customers added to the system</CardDescription>
      </CardHeader>
      <CardContent>
        {recentCustomers.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">No customer data available</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.businessName}</TableCell>
                  <TableCell>{format(new Date(customer.joinDate), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      customer.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : customer.status === 'inactive' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {customer.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/customers/${customer.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

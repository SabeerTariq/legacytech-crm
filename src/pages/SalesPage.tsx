
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SalesDispositionForm } from '@/components/sales/SalesDispositionForm';
import { SalesList } from '@/components/sales/SalesList';
import { PlusIcon } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface Sale {
  id: string;
  date: string;
  customer: {
    id: string;
    name: string;
    businessName: string;
    email: string;
    phone: string;
  };
  service: string[];
  otherServices?: string;
  turnaroundTime: string;
  serviceTenure: string;
  paymentMode: string;
  salesSource: string;
  leadSource: string;
  saleType: string;
  saleValue: {
    gross: number;
    cashIn: number;
    remaining: number;
    tax?: number;
  };
  frontSeller: string;
  agreement?: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export const SalesPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Sales</h1>
          <p className="page-description">Track and manage sales opportunities</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <PlusIcon className="h-4 w-4 mr-2" />
              New Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>New Sale Disposition</DialogTitle>
            </DialogHeader>
            <SalesDispositionForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Sales</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Log</CardTitle>
              <CardDescription>View and manage all sales records</CardDescription>
            </CardHeader>
            <CardContent>
              <SalesList />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>Sales from the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <SalesList filter="recent" />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Sales</CardTitle>
              <CardDescription>Sales that require follow-up</CardDescription>
            </CardHeader>
            <CardContent>
              <SalesList filter="pending" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

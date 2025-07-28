
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Link as LinkIcon, FileText } from 'lucide-react';

const Payments = () => {
  const [amount, setAmount] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const handleVirtualTerminal = () => {
    // TODO: Implement virtual terminal payment logic
    console.log('Virtual Terminal Payment', { amount, customerEmail });
  };

  const handlePaymentLink = () => {
    // TODO: Implement payment link generation logic
    console.log('Generate Payment Link', { amount });
  };

  const handleInvoiceCreation = () => {
    // TODO: Implement invoice creation logic
    console.log('Create Invoice', { amount, customerEmail });
  };

  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold flex items-center">
          <DollarSign className="mr-2" /> Payments
        </h1>
        
        <Tabs defaultValue="virtual-terminal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="virtual-terminal">
              <DollarSign className="mr-2 h-4 w-4" /> Virtual Terminal
            </TabsTrigger>
            <TabsTrigger value="payment-link">
              <LinkIcon className="mr-2 h-4 w-4" /> Payment Link
            </TabsTrigger>
            <TabsTrigger value="create-invoice">
              <FileText className="mr-2 h-4 w-4" /> Create Invoice
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="virtual-terminal">
            <Card>
              <CardHeader>
                <CardTitle>Virtual Terminal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="Enter amount" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="customer-email">Customer Email</Label>
                  <Input 
                    id="customer-email" 
                    type="email" 
                    placeholder="Enter customer email" 
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
                <Button onClick={handleVirtualTerminal}>
                  Process Payment
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payment-link">
            <Card>
              <CardHeader>
                <CardTitle>Generate Payment Link</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="link-amount">Amount</Label>
                  <Input 
                    id="link-amount" 
                    type="number" 
                    placeholder="Enter amount" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <Button onClick={handlePaymentLink}>
                  Generate Link
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="create-invoice">
            <Card>
              <CardHeader>
                <CardTitle>Create Invoice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="invoice-amount">Amount</Label>
                  <Input 
                    id="invoice-amount" 
                    type="number" 
                    placeholder="Enter amount" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="invoice-email">Customer Email</Label>
                  <Input 
                    id="invoice-email" 
                    type="email" 
                    placeholder="Enter customer email" 
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
                <Button onClick={handleInvoiceCreation}>
                  Create Invoice
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default Payments;

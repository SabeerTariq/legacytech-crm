import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerList } from '@/components/examples/CustomerList';
import { SalesList } from '@/components/examples/SalesList';
import { ProjectList } from '@/components/examples/ProjectList';

export const ExamplesPage = () => {
  const [activeTab, setActiveTab] = useState('customers');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Examples</h1>
        <p className="text-muted-foreground">
          Examples of API integration with React Query for customers, sales, and projects.
        </p>
      </div>

      <Tabs defaultValue="customers" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        <TabsContent value="customers" className="mt-6">
          <CustomerList />
        </TabsContent>
        <TabsContent value="sales" className="mt-6">
          <SalesList />
        </TabsContent>
        <TabsContent value="projects" className="mt-6">
          <ProjectList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

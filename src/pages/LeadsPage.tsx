import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadList } from '@/components/leads/LeadList';
import { LeadDetails } from '@/components/leads/LeadDetails';
import { NewLeadForm } from '@/components/leads/NewLeadForm';
import { useQueryClient } from '@tanstack/react-query';

export const LeadsPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const queryClient = useQueryClient();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Leads</h1>
          <p className="page-description">Manage your sales leads and opportunities</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['leads'] })}
            title="Refresh leads"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
              </DialogHeader>
              <NewLeadForm onSuccess={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Lead List</CardTitle>
            <CardDescription>View and manage your leads</CardDescription>
          </CardHeader>
          <CardContent>
            <LeadList
              onSelectLead={setSelectedLead}
              selectedLeadId={selectedLead?.id}
              onAddLead={() => setDialogOpen(true)}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lead Details</CardTitle>
            <CardDescription>
              {selectedLead ? `Viewing ${selectedLead.name}` : 'Select a lead to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedLead ? (
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                  <LeadDetails lead={selectedLead} />
                </TabsContent>
                <TabsContent value="activity">
                  <p className="text-muted-foreground">Lead activity history will be displayed here.</p>
                </TabsContent>
                <TabsContent value="notes">
                  <p className="text-muted-foreground">Lead notes will be displayed here.</p>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <PlusIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">No lead selected</h3>
                <p className="text-muted-foreground max-w-md">
                  Select a lead from the list to view their details, or add a new lead to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Mail, MessageSquare, Calendar, Zap, PlayCircle, PauseCircle, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const automations = [
  {
    id: "1",
    name: "Lead Welcome Series",
    description: "Sends a welcome email sequence to new leads",
    type: "email",
    status: "active",
    triggers: "New Lead Created",
    stats: {
      sent: 142,
      opened: 98,
      clicked: 67,
    },
  },
  {
    id: "2",
    name: "Appointment Reminder",
    description: "Sends SMS reminders before appointments",
    type: "sms",
    status: "active",
    triggers: "Appointment Created",
    stats: {
      sent: 89,
      delivered: 87,
      responded: 32,
    },
  },
  {
    id: "3",
    name: "Re-engagement Campaign",
    description: "Follows up with inactive leads after 30 days",
    type: "email",
    status: "paused",
    triggers: "Lead Inactive > 30 days",
    stats: {
      sent: 210,
      opened: 86,
      clicked: 42,
    },
  },
  {
    id: "4",
    name: "Thank You Campaign",
    description: "Sends thank you message after purchase",
    type: "email",
    status: "active",
    triggers: "Purchase Completed",
    stats: {
      sent: 76,
      opened: 68,
      clicked: 45,
    },
  },
];

const templates = [
  { id: "1", name: "Welcome Email", type: "email" },
  { id: "2", name: "Follow-up SMS", type: "sms" },
  { id: "3", name: "Appointment Confirmation", type: "email" },
  { id: "4", name: "Feedback Request", type: "email" },
  { id: "5", name: "Special Offer", type: "sms" },
];

const MarketingAutomation = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAutomation, setNewAutomation] = useState({
    name: "",
    description: "",
    type: "email",
    trigger: "",
  });
  const { toast } = useToast();

  const handleCreateAutomation = () => {
    if (!newAutomation.name || !newAutomation.description || !newAutomation.trigger) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically save to a database
    // For now we just show a success message
    toast({
      title: "Automation created",
      description: `${newAutomation.name} has been created successfully`,
    });
    
    setIsDialogOpen(false);
    setNewAutomation({
      name: "",
      description: "",
      type: "email",
      trigger: "",
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold">Marketing Automation</h1>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Automation
          </Button>
        </div>
        
        <Tabs defaultValue="automations">
          <TabsList className="grid w-full md:w-auto grid-cols-3 mb-6">
            <TabsTrigger value="automations">Automations</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="automations" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {automations.map((automation) => (
                <Card key={automation.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle>{automation.name}</CardTitle>
                        <CardDescription>{automation.description}</CardDescription>
                      </div>
                      {automation.type === "email" ? (
                        <Mail className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Trigger:</span>
                      <span className="text-sm font-medium">{automation.triggers}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {automation.type === "email" ? (
                        <>
                          <div className="text-center p-2 bg-muted rounded-md">
                            <div className="text-sm font-medium">{automation.stats.sent}</div>
                            <div className="text-xs text-muted-foreground">Sent</div>
                          </div>
                          <div className="text-center p-2 bg-muted rounded-md">
                            <div className="text-sm font-medium">{automation.stats.opened}</div>
                            <div className="text-xs text-muted-foreground">Opened</div>
                          </div>
                          <div className="text-center p-2 bg-muted rounded-md">
                            <div className="text-sm font-medium">{automation.stats.clicked}</div>
                            <div className="text-xs text-muted-foreground">Clicked</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-center p-2 bg-muted rounded-md">
                            <div className="text-sm font-medium">{automation.stats.sent}</div>
                            <div className="text-xs text-muted-foreground">Sent</div>
                          </div>
                          <div className="text-center p-2 bg-muted rounded-md">
                            <div className="text-sm font-medium">{automation.stats.delivered}</div>
                            <div className="text-xs text-muted-foreground">Delivered</div>
                          </div>
                          <div className="text-center p-2 bg-muted rounded-md">
                            <div className="text-sm font-medium">{automation.stats.responded}</div>
                            <div className="text-xs text-muted-foreground">Responded</div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Badge variant={automation.status === "active" ? "default" : "outline"}>
                      {automation.status === "active" ? "Active" : "Paused"}
                    </Badge>
                    <div>
                      {automation.status === "active" ? (
                        <Button variant="ghost" size="icon">
                          <PauseCircle className="h-5 w-5" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon">
                          <PlayCircle className="h-5 w-5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon">
                        <Copy className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
              
              <Card className="border-dashed flex flex-col items-center justify-center p-6">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">Create New Automation</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Set up email or SMS workflows to nurture your leads
                </p>
                <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Automation
                </Button>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {templates.map((template) => (
                <Card key={template.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className={`h-2 ${template.type === "email" ? "bg-blue-500" : "bg-green-500"}`} />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </CardHeader>
                  <CardFooter className="pt-0 flex justify-between">
                    <Badge variant="outline">{template.type === "email" ? "Email" : "SMS"}</Badge>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </CardFooter>
                </Card>
              ))}
              
              <Card className="border-dashed flex flex-col items-center justify-center p-6">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">Create Template</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Design email or SMS templates for your campaigns
                </p>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  New Template
                </Button>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Automation Analytics</CardTitle>
                <CardDescription>
                  Performance metrics for your marketing automations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center border border-dashed rounded-md">
                  <div className="text-muted-foreground">Analytics Dashboard (Coming Soon)</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Automation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Automation</DialogTitle>
            <DialogDescription>
              Set up an automated workflow to engage with your leads and customers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Automation Name</Label>
              <Input 
                id="name" 
                value={newAutomation.name}
                onChange={(e) => setNewAutomation({...newAutomation, name: e.target.value})}
                placeholder="e.g., Welcome Series"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select 
                value={newAutomation.type} 
                onValueChange={(value) => setNewAutomation({...newAutomation, type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="trigger">Trigger</Label>
              <Input 
                id="trigger" 
                value={newAutomation.trigger}
                onChange={(e) => setNewAutomation({...newAutomation, trigger: e.target.value})}
                placeholder="e.g., New Lead Created"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={newAutomation.description}
                onChange={(e) => setNewAutomation({...newAutomation, description: e.target.value})}
                placeholder="Describe what this automation does"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateAutomation}>Create Automation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default MarketingAutomation;

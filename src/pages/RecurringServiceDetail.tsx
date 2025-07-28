import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Edit,
  Trash2,
  Plus,
  Bell,
  FileText,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type RecurringService = Database["public"]["Tables"]["recurring_services"]["Row"] & {
  customer: Database["public"]["Tables"]["sales_dispositions"]["Row"];
  tasks: Database["public"]["Tables"]["recurring_service_tasks"]["Row"][];
  billing_history: Database["public"]["Tables"]["billing_history"]["Row"][];
  renewal_notifications: Database["public"]["Tables"]["renewal_notifications"]["Row"][];
};

const RecurringServiceDetail = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<RecurringService | null>(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Database["public"]["Tables"]["employees"]["Row"][]>([]);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    task_title: "",
    task_description: "",
    due_date: "",
    assigned_to_id: "",
    priority: "medium",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (serviceId) {
      loadServiceDetails();
    }
  }, [serviceId]);

  const loadServiceDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("recurring_services")
        .select(`
          *,
          customer:sales_dispositions(*),
          tasks:recurring_service_tasks(*),
          billing_history(*),
          renewal_notifications(*)
        `)
        .eq("id", serviceId)
        .single();

      if (error) throw error;
      setService(data);

      // Load employees for task assignment
      const { data: employeesData, error: employeesError } = await supabase
        .from("employees")
        .select("*")
        .order("full_name");

      if (employeesError) throw employeesError;
      setEmployees(employeesData || []);

    } catch (error) {
      console.error("Error loading service details:", error);
      toast({
        title: "Error",
        description: "Failed to load service details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTask.task_title || !newTask.due_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("recurring_service_tasks")
        .insert({
          recurring_service_id: serviceId!,
          task_title: newTask.task_title,
          task_description: newTask.task_description,
          due_date: newTask.due_date,
          assigned_to_id: newTask.assigned_to_id || null,
          priority: newTask.priority,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      setIsNewTaskDialogOpen(false);
      setNewTask({
        task_title: "",
        task_description: "",
        due_date: "",
        assigned_to_id: "",
        priority: "medium",
      });
      loadServiceDetails();
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("recurring_service_tasks")
        .update({ 
          status,
          completed_at: status === "completed" ? new Date().toISOString() : null
        })
        .eq("id", taskId);

      if (error) throw error;

      setService(prev => prev ? {
        ...prev,
        tasks: prev.tasks.map(task => 
          task.id === taskId 
            ? { ...task, status, completed_at: status === "completed" ? new Date().toISOString() : null }
            : task
        )
      } : null);

      toast({
        title: "Success",
        description: "Task status updated",
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilBilling = (nextBillingDate: string) => {
    const today = new Date();
    const billingDate = new Date(nextBillingDate);
    const diffTime = billingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Service Not Found</CardTitle>
            <CardDescription>
              The requested recurring service could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/recurring-services")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/recurring-services")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{service.service_name}</h1>
              <p className="text-muted-foreground">
                {service.customer?.customer_name} • {service.billing_cycle} billing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Service Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge className={getStatusColor(service.status)}>
                {service.status}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${service.amount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {service.billing_cycle} cycle
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getDaysUntilBilling(service.next_billing_date)}
              </div>
              <p className="text-xs text-muted-foreground">
                days until billing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {service.tasks.filter(t => t.status === "pending").length}
              </div>
              <p className="text-xs text-muted-foreground">
                tasks remaining
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Service Details Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="billing">Billing History</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Service Name</Label>
                    <p>{service.service_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-muted-foreground">
                      {service.description || "No description provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Billing Cycle</Label>
                    <Badge className={getStatusColor(service.billing_cycle)}>
                      {service.billing_cycle}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Amount</Label>
                    <p className="text-2xl font-bold">${service.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Auto Renewal</Label>
                    <p>{service.auto_renewal ? "Enabled" : "Disabled"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Customer Name</Label>
                    <p>{service.customer?.customer_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p>{service.customer?.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p>{service.customer?.phone_number}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Business</Label>
                    <p>{service.customer?.business_name || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Payment Method</Label>
                    <p>{service.payment_method || "Not specified"}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Service Tasks</CardTitle>
                    <CardDescription>
                      Manage tasks related to this recurring service
                    </CardDescription>
                  </div>
                  <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="task_title">Task Title *</Label>
                          <Input
                            id="task_title"
                            value={newTask.task_title}
                            onChange={(e) => setNewTask({ ...newTask, task_title: e.target.value })}
                            placeholder="Enter task title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="task_description">Description</Label>
                          <Textarea
                            id="task_description"
                            value={newTask.task_description}
                            onChange={(e) => setNewTask({ ...newTask, task_description: e.target.value })}
                            placeholder="Enter task description"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="due_date">Due Date *</Label>
                            <Input
                              id="due_date"
                              type="date"
                              value={newTask.due_date}
                              onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="assigned_to">Assign To</Label>
                          <Select value={newTask.assigned_to_id} onValueChange={(value) => setNewTask({ ...newTask, assigned_to_id: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.map((employee) => (
                                <SelectItem key={employee.id} value={employee.id}>
                                  {employee.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsNewTaskDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={createTask}>
                            Create Task
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {service.tasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{task.task_title}</h4>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                          </div>
                          {task.task_description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {task.task_description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Due: {formatDate(task.due_date)}</span>
                            {task.assigned_to_id && (
                              <span>Assigned to: {employees.find(e => e.id === task.assigned_to_id)?.full_name}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.status === "pending" && (
                            <Button 
                              size="sm" 
                              onClick={() => updateTaskStatus(task.id, "completed")}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Complete
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {service.tasks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No tasks found for this service.</p>
                      <p className="text-sm">Create a new task to get started.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>
                  Track all billing cycles and payments for this service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {service.billing_history.map((billing) => (
                    <div key={billing.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">Billing #{billing.invoice_number || billing.id.slice(0, 8)}</h4>
                            <Badge className={getStatusColor(billing.status)}>
                              {billing.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Date: {formatDate(billing.billing_date)}</span>
                            <span>Amount: ${billing.amount.toLocaleString()}</span>
                            {billing.payment_received_date && (
                              <span>Paid: {formatDate(billing.payment_received_date)}</span>
                            )}
                          </div>
                          {billing.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {billing.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {service.billing_history.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No billing history found.</p>
                      <p className="text-sm">Billing records will appear here once generated.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Renewal Notifications</CardTitle>
                <CardDescription>
                  Track renewal reminders and notifications sent to customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {service.renewal_notifications.map((notification) => (
                    <div key={notification.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{notification.notification_type}</h4>
                            <Badge className={getStatusColor(notification.status)}>
                              {notification.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Date: {formatDate(notification.notification_date)}</span>
                            {notification.sent_to && (
                              <span>Sent to: {notification.sent_to}</span>
                            )}
                            {notification.sent_at && (
                              <span>Sent: {formatDate(notification.sent_at)}</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Bell className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {service.renewal_notifications.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No notifications found.</p>
                      <p className="text-sm">Renewal notifications will appear here when sent.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default RecurringServiceDetail; 
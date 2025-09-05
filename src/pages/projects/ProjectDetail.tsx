import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  PlayCircle, 
  PauseCircle,
  ArrowLeft,
  Edit,
  MessageSquare,
  Download,
  Upload,
  Users,
  Target,
  TrendingUp,
  Briefcase
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  client: string;
  description: string | null;
  due_date: string;
  status: string;
  assigned_pm_id: string | null;
  services: string[] | null;
  created_at: string;
  updated_at: string;
  sales_disposition_id: string | null;
  assigned_pm_name: string;
  pm_department: string;
  pm_job_title: string;
  sales_customer_name: string;
  sales_gross_value: number;
  sales_cash_in: number;
  sales_remaining: number;
  sales_tax_deduction: number;
  sales_seller: string;
  sales_date: string;
  sales_payment_mode: string;
  sales_company: string;
  sales_source: string;
  display_total_amount: number;
  display_amount_paid: number;
  display_remaining: number;
  display_budget: number;
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadProjectDetails();
    }
  }, [id]);

  const loadProjectDetails = async () => {
    try {
      if (!id) {
        throw new Error('Project ID is required');
      }

      console.log('🔍 ProjectDetail: Loading project details for:', id);

      // Fetch project details using MySQL API
      const response = await apiClient.getProjectById(id);

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        setProject(null);
        return;
      }

      console.log('🔍 ProjectDetail: Project data loaded successfully');
      setProject(response.data);
    } catch (error) {
      console.error("Error loading project details:", error);
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProjectStatus = async (newStatus: string) => {
    if (!project) return;
    
    setUpdating(true);
    try {
      console.log('🔍 ProjectDetail: Updating project status to:', newStatus);

      // Update project status using MySQL API
      const response = await apiClient.updateProjectStatusById(project.id, newStatus);

      if (response.error) {
        throw new Error(response.error);
      }

      setProject(prev => prev ? { ...prev, status: newStatus } : null);

      toast({
        title: "Success",
        description: `Project status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating project status:", error);
      toast({
        title: "Error",
        description: "Failed to update project status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "assigned":
        return <AlertCircle className="h-4 w-4" />;
      case "in_progress":
        return <PlayCircle className="h-4 w-4" />;
      case "review":
        return <PauseCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "on_hold":
        return <PauseCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "review":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "on_hold":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "assigned":
        return "in_progress";
      case "in_progress":
        return "review";
      case "review":
        return "completed";
      default:
        return currentStatus;
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) {
      return 'N/A';
    }
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) {
      return 'N/A';
    }
    return new Date(dateString).toLocaleString();
  };

  const getDaysRemaining = (dueDate: string | null | undefined) => {
    if (!dueDate) {
      return 0; // Return 0 for no due date
    }
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Project Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate("/projects/my-projects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Projects
          </Button>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(project.due_date);
  const isOverdue = daysRemaining < 0;
  const isDueSoon = daysRemaining <= 7 && daysRemaining >= 0;

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/projects/my-projects")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Projects
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            <p className="text-muted-foreground mb-4">
              {project.description || "No description provided"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(project.status)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(project.status)}
                {project.status.replace("_", " ")}
              </div>
            </Badge>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Info</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Project Status and Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{project.client}</div>
                  <div className="text-sm text-muted-foreground">Client</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {project.due_date ? (isOverdue ? `${Math.abs(daysRemaining)}` : daysRemaining) : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {project.due_date ? (isOverdue ? "Days Overdue" : "Days Remaining") : "No Due Date"}
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    ${project.display_budget?.toLocaleString() || "N/A"}
                  </div>
                  <div className="text-sm text-muted-foreground">Budget</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(project.status)}
                      <span className="capitalize">{project.status.replace("_", " ")}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(project.due_date)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <div className="mt-1">{formatDate(project.created_at)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <div className="mt-1">{formatDate(project.updated_at)}</div>
                  </div>
                </div>

                {project.services && project.services.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Services</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.services.map((service, index) => (
                        <Badge key={index} variant="outline">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.assigned_pm_id ? (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">{project.assigned_pm_name}</div>
                      <div className="text-sm text-muted-foreground">{project.pm_department} • {project.pm_job_title}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 text-muted-foreground">
                    No project manager assigned
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ${project.display_total_amount?.toLocaleString() || "N/A"}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ${project.display_amount_paid?.toLocaleString() || "N/A"}
                  </div>
                  <div className="text-sm text-muted-foreground">Cash Received</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    ${project.display_remaining?.toLocaleString() || "N/A"}
                  </div>
                  <div className="text-sm text-muted-foreground">Remaining</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {project.status !== "completed" && (
                  <Button
                    onClick={() => updateProjectStatus(getNextStatus(project.status))}
                    disabled={updating}
                  >
                    {updating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <>
                        {project.status === "assigned" && "Start Project"}
                        {project.status === "in_progress" && "Mark for Review"}
                        {project.status === "review" && "Complete Project"}
                      </>
                    )}
                  </Button>
                )}
                
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Comment
                </Button>
                
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
                
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          {project.sales_disposition_id ? (
            <Card>
              <CardHeader>
                <CardTitle>Sales Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Customer Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer Name:</span>
                        <span>{project.sales_customer_name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Payment Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Amount:</span>
                        <span className="font-semibold">${project.sales_gross_value?.toLocaleString() || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cash In:</span>
                        <span>${project.sales_cash_in?.toLocaleString() || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Remaining:</span>
                        <span>${project.sales_remaining?.toLocaleString() || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Mode:</span>
                        <span>{project.sales_payment_mode || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Company Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Company:</span>
                        <span>{project.sales_company || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sales Source:</span>
                        <span>{project.sales_source || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Team Assignment</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Seller:</span>
                        <span>{project.sales_seller || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sale Date:</span>
                        <span>{project.sales_date ? formatDate(project.sales_date) : "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Sales Information</h3>
                <p className="text-muted-foreground">
                  This project is not linked to any sales disposition.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">Project Created</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDateTime(project.created_at)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="font-medium">Project Due</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(project.due_date)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardContent className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tasks Coming Soon</h3>
              <p className="text-muted-foreground">
                Task management will be available in the next phase.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <Card>
            <CardContent className="text-center py-8">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">File Management Coming Soon</h3>
              <p className="text-muted-foreground">
                File upload and management will be available in the next phase.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetail; 
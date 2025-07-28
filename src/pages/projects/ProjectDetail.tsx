import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
interface Project {
  id: string;
  name: string;
  client: string;
  description: string | null;
  due_date: string;
  status: string;
  progress: number | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  lead_id: string | null;
  sales_disposition_id: string | null;
  budget: number | null;
  services: string[] | null;
  project_manager: string | null;
  assigned_pm_id: string | null;
  assignment_date: string | null;
  project_type: string | null;
  is_upsell: boolean | null;
  parent_project_id: string | null;
}

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      loadProjectDetails();
    }
  }, [projectId]);

  const loadProjectDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) throw error;
      setProject(data);
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
      const { error } = await supabase
        .from("projects")
        .update({ status: newStatus })
        .eq("id", project.id);

      if (error) throw error;

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateProgress = (project: Project) => {
    const statusProgress = {
      "unassigned": 0,
      "assigned": 25,
      "in_progress": 50,
      "review": 75,
      "completed": 100,
      "on_hold": 0
    };
    return statusProgress[project.status as keyof typeof statusProgress] || 0;
  };

  const getDaysRemaining = (dueDate: string) => {
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
            {/* Progress and Status */}
            <Card>
              <CardHeader>
                <CardTitle>Project Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span>{calculateProgress(project)}%</span>
                  </div>
                  <Progress value={calculateProgress(project)} className="h-3" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{project.client}</div>
                    <div className="text-sm text-muted-foreground">Client</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {isOverdue ? `${Math.abs(daysRemaining)}` : daysRemaining}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isOverdue ? "Days Overdue" : "Days Remaining"}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {project.budget?.toLocaleString() || "N/A"}
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
                        <div className="font-medium">Project Manager Assigned</div>
                        <div className="text-sm text-muted-foreground">ID: {project.assigned_pm_id}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6 text-muted-foreground">
                      No project manager assigned
                    </div>
                  )}

                  {project.assignment_date && (
                    <div className="text-sm text-muted-foreground">
                      Assigned on: {formatDate(project.assignment_date)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

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
            {project.sales_disposition ? (
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
                          <span>{project.sales_disposition.customer_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span>{project.sales_disposition.phone_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{project.sales_disposition.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Business:</span>
                          <span>{project.sales_disposition.business_name}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Payment Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Amount:</span>
                          <span className="font-semibold">${project.sales_disposition.gross_value?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cash In:</span>
                          <span>${project.sales_disposition.cash_in?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Remaining:</span>
                          <span>${project.sales_disposition.remaining?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment Schedule:</span>
                          <span>{project.sales_disposition.payment_mode}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* New Payment and Brand Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Payment Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment Source:</span>
                          <span>{project.sales_disposition.payment_source || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment Company:</span>
                          <span>{project.sales_disposition.payment_company || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Company:</span>
                          <span>{project.sales_disposition.company}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Brand Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Brand:</span>
                          <span>{project.sales_disposition.brand || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Front Brand:</span>
                          <span>{project.sales_disposition.front_brand || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Agreement Status</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Agreement Signed:</span>
                          <span>
                            {project.sales_disposition.agreement_signed ? (
                              <Badge className="bg-green-100 text-green-800">Yes</Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Agreement Sent:</span>
                          <span>
                            {project.sales_disposition.agreement_sent ? (
                              <Badge className="bg-green-100 text-green-800">Yes</Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
                            )}
                          </span>
                        </div>
                        {project.sales_disposition.agreement_url && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Agreement URL:</span>
                            <a 
                              href={project.sales_disposition.agreement_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View Agreement
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sales Source Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Sales Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sales Source:</span>
                          <span>{project.sales_disposition.sales_source}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lead Source:</span>
                          <span>{project.sales_disposition.lead_source}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sale Type:</span>
                          <span>{project.sales_disposition.sale_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sale Date:</span>
                          <span>{formatDate(project.sales_disposition.sale_date)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Service Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Turnaround Time:</span>
                          <span>{project.sales_disposition.turnaround_time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Service Tenure:</span>
                          <span>{project.sales_disposition.service_tenure}</span>
                        </div>
                        {project.sales_disposition.tax_deduction && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax Deduction:</span>
                            <span>${project.sales_disposition.tax_deduction?.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Team Assignment</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Seller:</span>
                          <span>{project.sales_disposition.seller || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Account Manager:</span>
                          <span>{project.sales_disposition.account_manager || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Project Manager:</span>
                          <span>{project.sales_disposition.project_manager || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Assigned To:</span>
                          <span>{project.sales_disposition.assigned_to || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {project.sales_disposition.services_included && (
                    <div>
                      <h4 className="font-semibold mb-3">Services Sold</h4>
                      <div className="space-y-2">
                        {project.sales_disposition.services_included.map((service, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>{service}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {project.sales_disposition.service_details && (
                    <div>
                      <h4 className="font-semibold mb-3">Service Details</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">
                          {project.sales_disposition.service_details}
                        </pre>
                      </div>
                    </div>
                  )}
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
                  
                  {project.assignment_date && (
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Project Assigned</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDateTime(project.assignment_date)}
                        </div>
                      </div>
                    </div>
                  )}
                  
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
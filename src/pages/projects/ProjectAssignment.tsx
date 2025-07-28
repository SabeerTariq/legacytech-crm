import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Building, 
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus
} from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

type Employee = Database["public"]["Tables"]["employees"]["Row"];

const ProjectAssignment: React.FC = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectManagers, setProjectManagers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    loadUnassignedProjects();
    loadProjectManagers();
  }, []);

  const loadUnassignedProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "unassigned")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast({
        title: "Error",
        description: "Failed to load unassigned projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProjectManagers = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("department", "Upseller")
        .order("full_name");

      if (error) throw error;
      setProjectManagers(data || []);
    } catch (error) {
      console.error("Error loading project managers:", error);
      toast({
        title: "Error",
        description: "Failed to load project managers",
        variant: "destructive",
      });
    }
  };

  const assignProject = async (projectId: string, pmId: string) => {
    setAssigning(projectId);
    try {
      // Update project assignment
      const { error: projectError } = await supabase
        .from("projects")
        .update({
          assigned_pm_id: pmId,
          assignment_date: new Date().toISOString(),
          status: "assigned",
        })
        .eq("id", projectId);

      if (projectError) throw projectError;

      toast({
        title: "Success!",
        description: "Project assigned successfully",
      });

      // Reload projects
      loadUnassignedProjects();
    } catch (error) {
      console.error("Error assigning project:", error);
      toast({
        title: "Error",
        description: "Failed to assign project",
        variant: "destructive",
      });
    } finally {
      setAssigning(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unassigned":
        return "bg-gray-100 text-gray-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "review":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading projects...</p>
          </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Project Assignment</h1>
          <p className="text-muted-foreground">
            Assign unassigned projects to Project Managers from the Upseller department.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{projects.length}</p>
                  <p className="text-sm text-muted-foreground">Unassigned Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{projectManagers.length}</p>
                  <p className="text-sm text-muted-foreground">Available PMs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      projects.reduce((sum, project) => sum + (project.budget || 0), 0)
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {projects.filter(p => new Date(p.due_date) < new Date()).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">All projects are assigned!</h3>
                <p className="text-muted-foreground">
                  There are no unassigned projects at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-6 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        {/* Project Header */}
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="text-lg font-semibold">{project.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Client: {project.client}
                            </p>
                          </div>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status.replace("_", " ")}
                          </Badge>
                        </div>

                        {/* Project Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4" />
                              <span>Due: {formatDate(project.due_date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="h-4 w-4" />
                              <span>Budget: {formatCurrency(project.budget || 0)}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Building className="h-4 w-4" />
                              <span>Services: {project.services?.join(", ") || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4" />
                              <span>Created: {formatDate(project.created_at)}</span>
                            </div>
                          </div>

                          {/* Sales Information */}
                          {project.sales_disposition_id && (
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="font-medium">Sales ID: </span>
                                {project.sales_disposition_id}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Project Description */}
                        {project.description && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {project.description}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Assignment Section */}
                      <div className="ml-6 space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Assign to PM</Label>
                          <Select
                            onValueChange={(value) => assignProject(project.id, value)}
                            disabled={assigning === project.id}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select PM" />
                            </SelectTrigger>
                            <SelectContent>
                              {projectManagers.map((pm) => (
                                <SelectItem key={pm.id} value={pm.id}>
                                  <div className="flex items-center gap-2">
                                    <UserPlus className="h-4 w-4" />
                                    {pm.full_name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {assigning === project.id && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            Assigning...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
};

export default ProjectAssignment; 
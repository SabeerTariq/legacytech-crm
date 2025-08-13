import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, User, DollarSign, Clock, CheckCircle, AlertCircle, PlayCircle, PauseCircle } from "lucide-react";

interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  due_date: string;
  status: string;
  progress: number;
  budget: number;
  assigned_pm_id: string;
  services?: string[];
  sales_disposition?: {
    id: string;
    customer_name: string;
    gross_value: number;
    cash_in: number;
    remaining: number;
  };
  assigned_pm?: {
    id: string;
    full_name: string;
    job_title: string;
  };
}

const MyProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [employeeProfile, setEmployeeProfile] = useState<{
    id: string;
    full_name: string;
    department: string;
    job_title: string;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMyProjects();
  }, []);

  const loadMyProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('🔍 MyProjects: Loading projects for user:', {
        userId: user.id,
        userEmail: user.email
      });

      // Get current user's employee profile through user_profiles table
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("employee_id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (!userProfile || !userProfile.employee_id) {
        console.log('🔍 MyProjects: No active user profile or employee ID found for user:', user.id);
        return;
      }

      console.log('🔍 MyProjects: User profile found:', userProfile);

      // Get employee details using the employee_id from user_profile
      const { data: employeeProfile } = await supabase
        .from("employees")
        .select("id, full_name, department, job_title")
        .eq("id", userProfile.employee_id)
        .single();

      if (!employeeProfile) {
        console.log('🔍 MyProjects: No employee profile found for employee ID:', userProfile.employee_id);
        return;
      }

      console.log('🔍 MyProjects: Employee profile:', employeeProfile);

      // Store employee profile in state for use in UI
      setEmployeeProfile(employeeProfile);

      // Debug: Check if there are any projects at all for this employee ID
      const { count: projectCount, error: countError } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("assigned_pm_id", employeeProfile.id);
      
      console.log('🔍 MyProjects: Total projects count for employee ID', employeeProfile.id, ':', projectCount);
      if (countError) {
        console.error('🔍 MyProjects: Count query error:', countError);
      }

      // Get projects assigned to this user - check all possible assignment fields
      const query = supabase
        .from("projects")
        .select(`
          *,
          sales_disposition:sales_dispositions(*),
          assigned_pm:employees!assigned_pm_id(*)
        `)
        .or(`assigned_pm_id.eq.${employeeProfile.id},assigned_to_id.eq.${employeeProfile.id},user_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      console.log('🔍 MyProjects: Executing query with employee ID:', employeeProfile.id);
      console.log('🔍 MyProjects: Query OR condition:', `assigned_pm_id.eq.${employeeProfile.id},assigned_to_id.eq.${employeeProfile.id},user_id.eq.${user.id}`);

      const { data, error } = await query;

      if (error) {
        console.error('🔍 MyProjects: Error loading projects:', error);
        throw error;
      }

      console.log('🔍 MyProjects: Projects found:', data?.length || 0);
      
      // If no projects found with the main query, try the same logic as the dashboard
      if (!data || data.length === 0) {
        console.log('🔍 MyProjects: No projects found with main query, trying dashboard logic...');
        
        // Use the same logic as the dashboard: projects where assigned_pm_id = employee.id
        const { data: dashboardProjects, error: dashboardError } = await supabase
          .from("projects")
          .select(`
            *,
            sales_disposition:sales_dispositions(*),
            assigned_pm:employees!assigned_pm_id(*)
          `)
          .eq("assigned_pm_id", employeeProfile.id)
          .in("status", ["assigned", "in_progress", "review"])
          .order("created_at", { ascending: false });
        
        if (dashboardError) {
          console.error('🔍 MyProjects: Dashboard query error:', dashboardError);
        } else {
          console.log('🔍 MyProjects: Dashboard query found projects:', dashboardProjects?.length || 0);
          if (dashboardProjects && dashboardProjects.length > 0) {
            console.log('🔍 MyProjects: Dashboard projects:', dashboardProjects);
            // Use the dashboard projects instead
            setProjects(dashboardProjects);
            setLoading(false);
            return;
          }
        }
      }

      if (data && data.length > 0) {
        console.log('🔍 MyProjects: Sample project:', data[0]);
        console.log('🔍 MyProjects: Assignment fields in found projects:');
        data.forEach((project, index) => {
          console.log(`  Project ${index + 1}:`, {
            name: project.name,
            assigned_pm_id: project.assigned_pm_id,
            assigned_to_id: project.assigned_to_id,
            user_id: project.user_id,
            status: project.status
          });
        });
      } else {
        console.log('🔍 MyProjects: No projects found for employee ID:', employeeProfile.id);
        console.log('🔍 MyProjects: User ID:', user.id);
        
        // Debug: Check if there are any projects at all
        const { data: allProjects } = await supabase
          .from("projects")
          .select("id, name, assigned_pm_id, assigned_to_id, user_id, status")
          .limit(5);
        
        console.log('🔍 MyProjects: Sample of all projects in system:', allProjects);
        
        // Debug: Check specifically for projects assigned to this employee
        const { data: assignedProjects } = await supabase
          .from("projects")
          .select("id, name, status, assigned_pm_id")
          .eq("assigned_pm_id", employeeProfile.id);
        
        console.log('🔍 MyProjects: Projects with assigned_pm_id =', employeeProfile.id, ':', assignedProjects);
        
        // Debug: Check for projects created by this user
        const { data: userCreatedProjects } = await supabase
          .from("projects")
          .select("id, name, status, user_id")
          .eq("user_id", user.id);
        
        console.log('🔍 MyProjects: Projects with user_id =', user.id, ':', userCreatedProjects);
        
        // Debug: Check for upsell sales by this user that might have created projects
        const { data: upsellSales } = await supabase
          .from("sales_dispositions")
          .select("id, customer_name, service_sold, gross_value, is_upsell")
          .eq("user_id", user.id)
          .eq("is_upsell", true);
        
        console.log('🔍 MyProjects: Upsell sales by this user:', upsellSales);
      }

      setProjects(data || []);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast({
        title: "Error",
        description: "Failed to load your projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProjectStatus = async (projectId: string, newStatus: string) => {
    setUpdating(projectId);
    try {
      const { error } = await supabase
        .from("projects")
        .update({ status: newStatus })
        .eq("id", projectId);

      if (error) throw error;

      // Update local state
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId 
            ? { ...project, status: newStatus }
            : project
        )
      );

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
      setUpdating(null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your projects...</p>
          </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Projects</h1>
          <p className="text-muted-foreground">
            Manage and track your assigned projects
          </p>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Projects Assigned</h3>
              <p className="text-muted-foreground text-center mb-4">
                You don't have any projects assigned yet. Projects will appear here once they are assigned to you.
              </p>
              
              {/* Show additional options for upseller users */}
              {employeeProfile?.department === 'Upseller' && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    As an upseller, you can also:
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/projects')}
                    >
                      View All Projects
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/projects/assignment')}
                    >
                      View Unassigned Projects
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{project.name}</CardTitle>
                      <p className="text-muted-foreground text-sm mb-2">
                        {project.description || "No description provided"}
                      </p>
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(project.status)}
                        {project.status.replace("_", " ")}
                      </div>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{calculateProgress(project)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${calculateProgress(project)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Client:</span>
                      <span>{project.client}</span>
                    </div>
                    
                    {project.sales_disposition && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Budget:</span>
                        <span>${project.sales_disposition.gross_value?.toLocaleString() || "N/A"}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Due:</span>
                      <span>{formatDate(project.due_date)}</span>
                    </div>

                    {project.services && project.services.length > 0 && (
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="font-medium">Services:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {project.services.map((service, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {project.status !== "completed" && (
                      <Button
                        size="sm"
                        onClick={() => updateProjectStatus(project.id, getNextStatus(project.status))}
                        disabled={updating === project.id}
                        className="flex-1"
                      >
                        {updating === project.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            {project.status === "assigned" && "Start Project"}
                            {project.status === "in_progress" && "Mark for Review"}
                            {project.status === "review" && "Complete Project"}
                          </>
                        )}
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
  );
};

export default MyProjects; 
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContextJWT';
import { apiClient } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Calendar, 
  User as UserIcon, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  PlayCircle, 
  PauseCircle,
  Briefcase,
  TrendingUp,
  Loader2,
  FileText,
  Clock
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  due_date: string;
  status: string;
  assigned_pm_id: string;
  services: string[];
  created_at: string;
  total_amount: number;
  amount_paid: number;
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

export default function MyProjects() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (authUser) {
      fetchProjects();
    }
  }, [authUser]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      if (!authUser) {
        throw new Error('No authenticated user');
      }

      console.log('🔍 MyProjects: Fetching projects for user:', authUser.id);

      // Fetch projects using MySQL API
      const response = await apiClient.getMyProjects(authUser.id);

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        setProjects([]);
        return;
      }

      console.log(`🔍 MyProjects: Found ${response.data.length} projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.assigned_pm_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const updateProjectStatus = async (projectId: string, newStatus: string) => {
    setUpdating(projectId);
    try {
      // Additional safety check - prevent status changes on completed projects
      const currentProject = projects.find(p => p.id === projectId);
      if (currentProject && currentProject.status === "completed") {
        throw new Error("Cannot change status of completed projects");
      }

      // Prevent completing projects with remaining amounts
      if (newStatus === "completed" && currentProject && (currentProject.display_remaining || 0) > 0) {
        throw new Error(`Cannot complete project with $${currentProject.display_remaining.toLocaleString()} remaining amount`);
      }

      // Update project status using MySQL API
      const response = await apiClient.updateProjectStatus(projectId, newStatus);

      if (response.error) {
        throw new Error(response.error);
      }

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
        description: error instanceof Error ? error.message : "Failed to update project status",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'completed': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'in_progress': { color: 'bg-blue-100 text-blue-800', icon: PlayCircle },
      'assigned': { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      'pending': { color: 'bg-gray-100 text-gray-800', icon: PauseCircle },
      'review': { color: 'bg-purple-100 text-purple-800', icon: Clock },
      'on_hold': { color: 'bg-red-100 text-red-800', icon: PauseCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getNextStatus = (currentStatus: string, remainingAmount: number = 0) => {
    switch (currentStatus) {
      case "assigned":
        return "in_progress";
      case "in_progress":
        return "review";
      case "review":
        // Only allow completion when remaining amount is 0
        return remainingAmount > 0 ? null : "completed";
      case "completed":
        return null; // No next status for completed projects
      case "on_hold":
        return "in_progress";
      default:
        return null;
    }
  };

  const canChangeStatus = (status: string, remainingAmount: number = 0) => {
    // Prevent status changes on completed projects
    if (status === "completed") {
      return false;
    }
    
    // Prevent marking as completed when there's remaining amount to be paid
    if (status === "review" && remainingAmount > 0) {
      return false;
    }
    
    return true;
  };

  const getStatusChangeButtonText = (status: string, remainingAmount: number = 0) => {
    switch (status) {
      case "assigned":
        return "Start Project";
      case "in_progress":
        return "Mark for Review";
      case "review":
        return remainingAmount > 0 
          ? `Complete Project ($${remainingAmount.toLocaleString()} Pending)`
          : "Complete Project";
      case "on_hold":
        return "Resume Project";
      default:
        return "Update Status";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your projects...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
        <p className="text-gray-600">Manage and track your assigned projects</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">My Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <PlayCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${projects.reduce((sum, p) => sum + (p.display_total_amount || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search projects, clients, or managers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'You don\'t have any projects assigned yet. Projects will appear here once they are assigned to you.'
              }
            </p>
            
            <Button
              variant="outline"
              onClick={() => navigate('/projects')}
            >
              View All Projects
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {project.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Client: {project.client}</p>
                  </div>
                  {getStatusBadge(project.status)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {project.description && (
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {project.description}
                  </p>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">
                      {project.assigned_pm_name}
                    </span>
                    {project.pm_department && (
                      <Badge variant="outline" className="text-xs">
                        {project.pm_department}
                      </Badge>
                    )}
                  </div>
                  
                  {project.due_date && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">
                        Due: {new Date(project.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {project.display_budget && (
                    <div className="flex items-center space-x-2 text-sm">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">
                        Budget: ${Number(project.display_budget).toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {project.display_total_amount && (
                    <div className="flex items-center space-x-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">
                        Total Value: ${Number(project.display_total_amount).toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {project.display_amount_paid && (
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-700">
                        Cash In: ${Number(project.display_amount_paid).toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {project.display_remaining && (
                    <div className="flex items-center space-x-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <span className="text-orange-700">
                        Remaining: ${Number(project.display_remaining).toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {project.sales_payment_mode && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Briefcase className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-700">
                        Payment: {project.sales_payment_mode} • {project.sales_company}
                      </span>
                    </div>
                  )}
                  
                  {project.sales_source && (
                    <div className="flex items-center space-x-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <span className="text-gray-700">
                        Source: {project.sales_source}
                      </span>
                    </div>
                  )}
                </div>
                
                {project.services && project.services.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {project.services.map((service, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3">
                  {canChangeStatus(project.status, project.display_remaining) && getNextStatus(project.status, project.display_remaining) ? (
                    <Button
                      size="sm"
                      onClick={() => updateProjectStatus(project.id, getNextStatus(project.status, project.display_remaining)!)}
                      disabled={updating === project.id}
                      className="flex-1"
                    >
                      {updating === project.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        getStatusChangeButtonText(project.status, project.display_remaining)
                      )}
                    </Button>
                  ) : project.status === "completed" ? (
                    <div className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Project Completed
                    </div>
                  ) : project.status === "review" && project.display_remaining > 0 ? (
                    <div className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-md">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Pending Payment: ${Number(project.display_remaining).toLocaleString()}
                    </div>
                  ) : null}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/project/${project.id}`)}
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
} 
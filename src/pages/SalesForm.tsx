
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import EnhancedDispositionForm from "@/components/projects/EnhancedDispositionForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, DollarSign, Users, Target } from "lucide-react";

const SalesForm = () => {
  const { toast } = useToast();
  
  const handleFormSubmit = async (data: any) => {
    try {
      // The enhanced form handles all the database operations
      // This function receives the result from the form submission
      console.log('Sales disposition and project created:', data);
      
      toast({
        title: "Success",
        description: "Sales disposition and project have been created successfully!",
      });
    } catch (error) {
      console.error('Error in sales form submission:', error);
      toast({
        title: "Error",
        description: "Failed to process the submission. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Sales Disposition & Project Creation</h1>
          <p className="text-muted-foreground">
            Complete the form below to create a new sales disposition record and automatically generate a project for the Project Management team.
          </p>
        </div>

        {/* Key Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Business Development</p>
                  <p className="text-sm text-muted-foreground">Performance tracking</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Project Assignment</p>
                  <p className="text-sm text-muted-foreground">Auto-assign to PM</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Real-time Metrics</p>
                  <p className="text-sm text-muted-foreground">Performance preview</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">Auto Project Creation</p>
                  <p className="text-sm text-muted-foreground">Seamless workflow</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Process Flow */}
        <Card>
          <CardHeader>
            <CardTitle>Process Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline">1</Badge>
                <div>
                  <p className="font-medium">Sales Disposition Creation</p>
                  <p className="text-sm text-muted-foreground">Fill out customer and service details</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline">2</Badge>
                <div>
                  <p className="font-medium">Performance Impact Preview</p>
                  <p className="text-sm text-muted-foreground">See how this sale affects Business Development team performance</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline">3</Badge>
                <div>
                  <p className="font-medium">Project Manager Assignment</p>
                  <p className="text-sm text-muted-foreground">Assign the project to a Project Management team member</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline">4</Badge>
                <div>
                  <p className="font-medium">Automatic Project Creation</p>
                  <p className="text-sm text-muted-foreground">Project is automatically created and assigned to the selected PM</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline">5</Badge>
                <div>
                  <p className="font-medium">Performance Updates</p>
                  <p className="text-sm text-muted-foreground">Seller and Project Manager performance metrics are updated</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <EnhancedDispositionForm onSubmit={handleFormSubmit} />
      </div>
    </MainLayout>
  );
};

export default SalesForm;

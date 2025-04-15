
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import DispositionForm from "@/components/projects/DispositionForm";
import { useToast } from "@/hooks/use-toast";

const SalesForm = () => {
  const { toast } = useToast();
  
  const handleFormSubmit = (data: any) => {
    console.log("Form data:", data);
    
    // In a real app, you would save the form data and create a project
    toast({
      title: "Project created",
      description: "The project has been created and assigned to the project manager.",
    });
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Sales Disposition</h1>
        <p className="text-muted-foreground">
          Complete the form below to create a new project and assign it to a project manager.
        </p>
        
        <DispositionForm onSubmit={handleFormSubmit} />
      </div>
    </MainLayout>
  );
};

export default SalesForm;

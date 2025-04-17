
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import DispositionForm from "@/components/projects/DispositionForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SalesForm = () => {
  const { toast } = useToast();
  
  const handleFormSubmit = async (data: any) => {
    try {
      const { error } = await supabase
        .from('sales_dispositions')
        .insert([
          {
            ...data,
            user_id: (await supabase.auth.getUser()).data.user?.id
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sales disposition has been created successfully.",
      });
    } catch (error) {
      console.error('Error creating sales disposition:', error);
      toast({
        title: "Error",
        description: "Failed to create sales disposition. Please try again.",
        variant: "destructive",
      });
    }
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

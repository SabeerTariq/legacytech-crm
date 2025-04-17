
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LeadUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: () => void;
}

const LeadUploadModal: React.FC<LeadUploadModalProps> = ({
  open,
  onOpenChange,
  onUploadComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) {
      toast({
        title: "No file selected",
        description: "Please select a CSV or Excel file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // This is a simplified simulation of processing a CSV file
    // In a real app, we would parse the CSV and insert the data into Supabase
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Upload successful",
        description: "Your leads have been uploaded successfully.",
      });
      
      setFile(null);
      onOpenChange(false);
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error: any) {
      toast({
        title: "Error uploading leads",
        description: error.message || "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a simple CSV template for leads
    const headers = "name,company,email,phone,status,source,value\n";
    const exampleRow = "John Doe,Acme Inc,john@example.com,(555) 123-4567,new,Website Contact Form,5000\n";
    
    const csvContent = headers + exampleRow;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leads_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Leads</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file with your leads data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {file ? (
            <div className="flex items-center justify-between p-2 border rounded-md">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="leads-file">File</Label>
              <Input
                id="leads-file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Accepted formats: CSV, Excel (.xlsx, .xls)
              </p>
            </div>
          )}
          <div>
            <Button
              variant="link"
              className="p-0 h-auto text-sm text-primary"
              onClick={downloadTemplate}
            >
              Download template file
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadUploadModal;


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
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV or Excel file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Simulate an upload
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "Upload successful",
        description: "Your leads have been uploaded successfully.",
      });
      setFile(null);
      onOpenChange(false);
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    }, 1500);
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
                  <Upload className="h-4 w-4 text-primary" />
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
            <a
              href="#"
              className="text-sm text-primary hover:underline"
            >
              Download template file
            </a>
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

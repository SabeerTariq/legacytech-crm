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
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";

interface EmployeeUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: () => void;
}

const EmployeeUploadModal: React.FC<EmployeeUploadModalProps> = ({
  open,
  onOpenChange,
  onUploadComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Mapping from CSV column names to database field names
  const csvToDbMap: Record<string, string> = {
    "Full Name": "full_name",
    "Father's Name": "father_name",
    "Date of Birth": "date_of_birth",
    "Gender": "gender",
    "Marital Status": "marital_status",
    "CNIC Number": "cnic_number",
    "Current Residential Address": "current_residential_address",
    "Permanent Address ": "permanent_address",
    "Contact Number": "contact_number",
    "Personal Email Address": "email",
    "Job Title": "job_title",
    "Department": "department",
    "Date of Joining": "date_of_joining",
    "Reporting Manager": "reporting_manager",
    "Work Module": "work_module",
    "Work Hours": "work_hours",
    "Bank Name": "bank_name",
    "Account Holder's Name": "account_holder_name",
    "Account Number": "account_number",
    "IBAN Number": "iban_number",
    // Add more mappings as needed
  };

  type EmployeeInsert = {
    full_name: string;
    email: string;
    department: string;
    date_of_joining?: string;
    father_name?: string;
    date_of_birth?: string;
    gender?: string;
    marital_status?: string;
    cnic_number?: string;
    current_residential_address?: string;
    permanent_address?: string;
    contact_number?: string;
    personal_email_address?: string;
    job_title?: string;
    reporting_manager?: string;
    work_module?: string;
    work_hours?: string;
    bank_name?: string;
    account_holder_name?: string;
    account_number?: string;
    iban_number?: string;
  };

  const mapCsvRowToDb = (row: Record<string, string>): EmployeeInsert => {
    return {
      full_name: row["Full Name"] || row["full_name"] || "",
      email: row["Personal Email Address"] || row["email"] || "",
      department: row["Department"] || row["department"] || "",
      date_of_joining: row["Date of Joining"] || row["date_of_joining"] || "",
      father_name: row["Father's Name"] || row["father_name"] || undefined,
      date_of_birth: row["Date of Birth"] || row["date_of_birth"] || undefined,
      gender: row["Gender"] || row["gender"] || undefined,
      marital_status: row["Marital Status"] || row["marital_status"] || undefined,
      cnic_number: row["CNIC Number"] || row["cnic_number"] || undefined,
      current_residential_address: row["Current Residential Address"] || row["current_residential_address"] || undefined,
      permanent_address: row["Permanent Address "] || row["permanent_address"] || undefined,
      contact_number: row["Contact Number"] || row["contact_number"] || undefined,
      personal_email_address: row["Personal Email Address"] || row["personal_email_address"] || undefined,
      job_title: row["Job Title"] || row["job_title"] || undefined,
      reporting_manager: row["Reporting Manager"] || row["reporting_manager"] || undefined,
      work_module: row["Work Module"] || row["work_module"] || undefined,
      work_hours: row["Work Hours"] || row["work_hours"] || undefined,
      bank_name: row["Bank Name"] || row["bank_name"] || undefined,
      account_holder_name: row["Account Holder's Name"] || row["account_holder_name"] || undefined,
      account_number: row["Account Number"] || row["account_number"] || undefined,
      iban_number: row["IBAN Number"] || row["iban_number"] || undefined,
    };
  };

  const validateRow = (row: Record<string, string>, rowIndex: number): string | null => {
    // Use mapped DB keys for validation
    const dbRow = mapCsvRowToDb(row);
    if (!dbRow.full_name || !dbRow.email || !dbRow.department) {
      return `Row ${rowIndex + 2}: Missing required fields (full_name, email, department)`;
    }
    return null;
  };

  const handleUpload = async () => {
    setErrors([]);
    setSuccessCount(0);
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload.",
        variant: "destructive",
      });
      return;
    }
    setIsUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data as Record<string, string>[];
        const errors: string[] = [];
        let success = 0;
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const dbRow = mapCsvRowToDb(row);
          const error = validateRow(row, i);
          if (error) {
            errors.push(error);
            continue;
          }
          // Upsert employee (insert or update on email or CNIC conflict)
          const { error: upsertError } = await supabase.from("employees").upsert([
            dbRow
          ], { onConflict: "email" });
          if (upsertError) {
            errors.push(`Row ${i + 2}: Error upserting employee (${upsertError.message})`);
            continue;
          }
          // TODO: Parse and insert dependents and emergency contacts if present
          success++;
        }
        setErrors(errors);
        setSuccessCount(success);
        setIsUploading(false);
        if (success > 0) {
          toast({
            title: "Import complete",
            description: `${success} employees imported successfully.`,
          });
          setFile(null);
          if (onUploadComplete) onUploadComplete();
          onOpenChange(false);
        } else {
          toast({
            title: "Import failed",
            description: "No employees were imported. See errors below.",
            variant: "destructive",
          });
        }
      },
      error: (err) => {
        setIsUploading(false);
        toast({
          title: "CSV Parse Error",
          description: err.message,
          variant: "destructive",
        });
      },
    });
  };

  const downloadTemplate = () => {
    // Create a simple CSV template for employees
    const headers = [
      "name,role,email,department,job_title,date_of_birth,gender,marital_status,cnic_number,contact_number,personal_email_address,date_of_joining,reporting_manager,work_module,work_hours,bank_name,account_holder_name,account_number,iban_number"
    ];
    const exampleRow = [
      "Jane Doe,Developer,jane@example.com,Development,Frontend Developer,1990-01-01,Female,Single,12345-6789012-3,03001234567,janedoe@gmail.com,2022-01-01,John Manager,Remote,9-5,ABC Bank,Jane Doe,123456789,PK00ABC0000000000000000"
    ];
    const csvContent = headers.concat(exampleRow).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employees_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Import Employees from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your employee data. Duplicates (by email or CNIC) will be skipped.
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
              <Label htmlFor="employees-file">File</Label>
              <Input
                id="employees-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Accepted format: CSV
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
          {errors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive rounded p-2 text-destructive text-sm max-h-40 overflow-auto">
              <div className="font-semibold mb-1">Errors:</div>
              <ul className="list-disc pl-5">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeUploadModal; 
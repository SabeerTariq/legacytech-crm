import React, { useState } from "react";
import { useEmployees } from "@/hooks/useEmployees";
import type { Employee } from "@/hooks/useEmployees";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmployeeDialog } from "@/components/employees/EmployeeDialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Plus, Edit2, Trash2, Upload } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import EmployeeUploadModal from "@/components/employees/EmployeeUploadModal";

const MAX_CELL_LENGTH = 24;

function TruncatedCell({ value }: { value: string | number | null | undefined }) {
  if (!value) return <span>-</span>;
  const str = String(value);
  if (str.length <= MAX_CELL_LENGTH) return <span>{str}</span>;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-pointer underline decoration-dotted">{str.slice(0, MAX_CELL_LENGTH)}...</span>
        </TooltipTrigger>
        <TooltipContent>{str}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const EMPLOYEE_COLUMNS = [
  { key: "full_name", label: "Full Name" },
  { key: "job_title", label: "Job Title" },
  { key: "email", label: "Email" },
  { key: "department", label: "Department" },
  { key: "date_of_birth", label: "DOB" },
  { key: "gender", label: "Gender" },
  { key: "marital_status", label: "Marital Status" },
  { key: "cnic_number", label: "CNIC" },
  { key: "contact_number", label: "Contact #" },
  { key: "personal_email_address", label: "Personal Email" },
  { key: "date_of_joining", label: "Joining Date" },
  { key: "reporting_manager", label: "Manager" },
  { key: "work_module", label: "Work Module" },
  { key: "work_hours", label: "Work Hours" },
  { key: "bank_name", label: "Bank" },
  { key: "account_holder_name", label: "Account Holder" },
  { key: "account_number", label: "Account #" },
  { key: "iban_number", label: "IBAN" },
  // Add more fields as needed
];

const DEPARTMENTS = [
  "Development", "Front Sales", "HR", "Marketing", "Other", "Production", "Upseller"
];

const Employees = () => {
  const { data: employees = [], isLoading } = useEmployees();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);

  // Filter employees by search and department
  const filteredEmployees = employees.filter(emp => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      emp.full_name?.toLowerCase().includes(searchLower) ||
      emp.email?.toLowerCase().includes(searchLower) ||
      emp.department?.toLowerCase().includes(searchLower) ||
      emp.job_title?.toLowerCase().includes(searchLower);
    const matchesDept = departmentFilter === "all" ? true : emp.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  // Removed permission check - all authenticated users can access
  const canManage = true;

  const handleAdd = () => {
    setSelectedEmployee(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const supabaseClient = (await import("@/integrations/supabase/client")).supabase;
      const { error } = await supabaseClient
        .from("employees")
        .delete()
        .eq("id", deleteId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setDeleteId(null);
    } catch (e) {
      // Optionally show toast
    } finally {
      setDeleteLoading(false);
    }
  };

  // Permission check removed - all authenticated users can access

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search employees..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-64"
            />
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {DEPARTMENTS.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add Employee
          </Button>
          <Button onClick={() => setUploadOpen(true)} size="sm" variant="outline">
            <Upload className="h-4 w-4 mr-2" /> Import CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-[1200px] border rounded-lg">
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead></TableHead>
                {EMPLOYEE_COLUMNS.map(col => (
                  <TableHead key={col.key}>{col.label}</TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={EMPLOYEE_COLUMNS.length + 2}>Loading...</TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={EMPLOYEE_COLUMNS.length + 2}>No employees found.</TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map(emp => [
                  <TableRow key={emp.id} className={expandedRow === emp.id ? "bg-muted/30" : undefined}>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={expandedRow === emp.id ? "Collapse" : "Expand"}
                        onClick={() => setExpandedRow(expandedRow === emp.id ? null : emp.id)}
                      >
                        {expandedRow === emp.id ? <ChevronDown /> : <ChevronRight />}
                      </Button>
                    </TableCell>
                    {EMPLOYEE_COLUMNS.map(col => {
                      const value = emp[col.key as keyof Employee];
                      if (typeof value === "string" || typeof value === "number") {
                        return <TableCell key={col.key}><TruncatedCell value={value} /></TableCell>;
                      }
                      if (value instanceof Date) {
                        return <TableCell key={col.key}>{value.toLocaleDateString()}</TableCell>;
                      }
                      if (Array.isArray(value)) {
                        return <TableCell key={col.key}>View</TableCell>;
                      }
                      if (typeof value === "object" && value !== null) {
                        return <TableCell key={col.key}>View</TableCell>;
                      }
                      return <TableCell key={col.key}>-</TableCell>;
                    })}
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(emp)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={() => setDeleteId(emp.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          {deleteId === emp.id && (
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this employee? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} disabled={deleteLoading} className="bg-destructive text-white">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          )}
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>,
                  expandedRow === emp.id && (
                    <TableRow key={emp.id + "-expand"} className="bg-muted/10">
                      <TableCell colSpan={EMPLOYEE_COLUMNS.length + 2} className="p-0">
                        <div className="flex flex-col md:flex-row gap-8 p-4">
                          {/* Dependents */}
                          <div className="flex-1">
                            <div className="font-semibold mb-2">Dependents</div>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {((emp as any).dependents) && (emp as any).dependents.length > 0 ? (
                              <Table className="border">
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Relationship</TableHead>
                                    <TableHead>Gender</TableHead>
                                    <TableHead>DOB</TableHead>
                                    <TableHead>CNIC/B-Form</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                  {((emp as any).dependents || []).map((dep, i) => (
                                    <TableRow key={i}>
                                      <TableCell>{dep.full_name}</TableCell>
                                      <TableCell>{dep.relationship}</TableCell>
                                      <TableCell>{dep.gender}</TableCell>
                                      <TableCell>{dep.date_of_birth}</TableCell>
                                      <TableCell>{dep.cnic_bform_number}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <div className="text-muted-foreground">No dependents</div>
                            )}
                          </div>
                          {/* Emergency Contacts */}
                          <div className="flex-1">
                            <div className="font-semibold mb-2">Emergency Contacts</div>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {((emp as any).contacts) && (emp as any).contacts.length > 0 ? (
                              <Table className="border">
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Relationship</TableHead>
                                    <TableHead>Contact #</TableHead>
                                    <TableHead>Type</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                  {((emp as any).contacts || []).map((con, i) => (
                                    <TableRow key={i}>
                                      <TableCell>{con.name}</TableCell>
                                      <TableCell>{con.relationship}</TableCell>
                                      <TableCell>{con.contact_number}</TableCell>
                                      <TableCell>{con.type}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <div className="text-muted-foreground">No contacts</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                ])
              )}
            </TableBody>
          </Table>
        </div>
        <EmployeeDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          department={selectedEmployee?.department || ""}
          employee={selectedEmployee}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["employees"] })}
        />
        <EmployeeUploadModal
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          onUploadComplete={() => queryClient.invalidateQueries({ queryKey: ["employees"] })}
        />
      </div>
  );
};

export default Employees; 
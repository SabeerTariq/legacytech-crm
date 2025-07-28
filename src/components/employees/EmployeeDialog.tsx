
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeProfile } from "@/types/employee";
import type { Employee } from "@/hooks/useEmployees";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

const GENDERS = ["Male", "Female", "Other"];
const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed"];
const DEPARTMENTS = [
  "Development", "Front Sales", "HR", "Marketing", "Other", "Production", "Upseller"
];

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: string;
  employee?: Employee | EmployeeProfile;
  onSuccess: () => void;
}

export function EmployeeDialog({ open, onOpenChange, department, employee, onSuccess }: EmployeeDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    full_name: (employee as any)?.full_name || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    father_name: (employee as any)?.father_name || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    date_of_birth: (employee as any)?.date_of_birth || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gender: (employee as any)?.gender || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    marital_status: (employee as any)?.marital_status || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cnic_number: (employee as any)?.cnic_number || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    current_residential_address: (employee as any)?.current_residential_address || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    permanent_address: (employee as any)?.permanent_address || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contact_number: (employee as any)?.contact_number || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    personal_email_address: (employee as any)?.personal_email_address || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    total_dependents_covered: (employee as any)?.total_dependents_covered || 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    job_title: (employee as any)?.job_title || "",
    department: employee?.department || department,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    date_of_joining: (employee as any)?.date_of_joining || new Date().toISOString().split('T')[0],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reporting_manager: (employee as any)?.reporting_manager || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    work_module: (employee as any)?.work_module || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    work_hours: (employee as any)?.work_hours || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bank_name: (employee as any)?.bank_name || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    account_holder_name: (employee as any)?.account_holder_name || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    account_number: (employee as any)?.account_number || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    iban_number: (employee as any)?.iban_number || "",
    email: employee?.email || "",
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dependents, setDependents] = useState((employee as any)?.dependents || []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [contacts, setContacts] = useState((employee as any)?.contacts || []);

  // Add this effect to sync form state with the selected employee
  useEffect(() => {
    setFormData({
      full_name: (employee as any)?.full_name || "",
      father_name: (employee as any)?.father_name || "",
      date_of_birth: (employee as any)?.date_of_birth || "",
      gender: (employee as any)?.gender || "",
      marital_status: (employee as any)?.marital_status || "",
      cnic_number: (employee as any)?.cnic_number || "",
      current_residential_address: (employee as any)?.current_residential_address || "",
      permanent_address: (employee as any)?.permanent_address || "",
      contact_number: (employee as any)?.contact_number || "",
      personal_email_address: (employee as any)?.personal_email_address || "",
      total_dependents_covered: (employee as any)?.total_dependents_covered || 0,
      job_title: (employee as any)?.job_title || "",
      department: employee?.department || department,
      date_of_joining: (employee as any)?.date_of_joining || new Date().toISOString().split('T')[0],
      reporting_manager: (employee as any)?.reporting_manager || "",
      work_module: (employee as any)?.work_module || "",
      work_hours: (employee as any)?.work_hours || "",
      bank_name: (employee as any)?.bank_name || "",
      account_holder_name: (employee as any)?.account_holder_name || "",
      account_number: (employee as any)?.account_number || "",
      iban_number: (employee as any)?.iban_number || "",
      email: employee?.email || "",
    });
    setDependents((employee as any)?.dependents || []);
    setContacts((employee as any)?.contacts || []);
  }, [employee, department]);

  // When job_title changes, set role
  useEffect(() => {
    // setFormData(prev => ({ ...prev, role: getRoleForJobTitle(formData.job_title) })); // Removed role setting
     
  }, [formData.job_title]);

  // Validation function
  function validate() {
    const newErrors: { [key: string]: string } = {};
    if (!formData.full_name) newErrors.full_name = "Full name is required.";
    if (!formData.email) newErrors.email = "Work email is required.";
    if (formData.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) newErrors.email = "Invalid email format.";
    if (!formData.cnic_number) newErrors.cnic_number = "CNIC is required.";
    if (formData.cnic_number && !/^\d{5}-\d{7}-\d{1}$/.test(formData.cnic_number.replace(/\s/g, ''))) newErrors.cnic_number = "CNIC must be in 12345-1234567-1 format.";
    if (!formData.department) newErrors.department = "Department is required.";
    if (!formData.job_title) newErrors.job_title = "Job title is required.";
    // Add more as needed
    return newErrors;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      if (employee?.id) {
        // Update existing employee
        const { error } = await supabase
          .from("employees")
          .update({
            ...formData,
            total_dependents_covered: dependents.length,
          })
          .eq("id", employee.id);
        if (error) throw error;
        // Upsert dependents
        await supabase.from("employee_dependents").delete().eq("employee_id", employee.id);
        for (const dep of dependents) {
          await supabase.from("employee_dependents").insert({ ...dep, employee_id: employee.id });
        }
        // Upsert contacts
        await supabase.from("employee_emergency_contacts").delete().eq("employee_id", employee.id);
        for (const con of contacts) {
          await supabase.from("employee_emergency_contacts").insert({ ...con, employee_id: employee.id });
        }
        toast({ title: "Success", description: "Employee updated successfully" });
      } else {
        // Add new employee
        const { data, error } = await supabase
          .from("employees")
          .insert({
            ...formData,
            total_dependents_covered: dependents.length,
            department,
          })
          .select();
        if (error) throw error;
        const newId = data?.[0]?.id;
        if (newId) {
          for (const dep of dependents) {
            await supabase.from("employee_dependents").insert({ ...dep, employee_id: newId });
          }
          for (const con of contacts) {
            await supabase.from("employee_emergency_contacts").insert({ ...con, employee_id: newId });
          }
        }
        toast({ title: "Success", description: "Employee added successfully" });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Personal Info */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="w-full text-left font-semibold text-lg mb-2">Personal Information</CollapsibleTrigger>
            <CollapsibleContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" value={formData.full_name} onChange={e => setFormData(prev => ({ ...prev, full_name: e.target.value }))} />
                {errors.full_name && <div className="text-red-500 text-xs mt-1">{errors.full_name}</div>}
              </div>
              <div>
                <Label htmlFor="father_name">Father's Name</Label>
                <Input id="father_name" value={formData.father_name} onChange={e => setFormData(prev => ({ ...prev, father_name: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input id="date_of_birth" type="date" value={formData.date_of_birth} onChange={e => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={val => setFormData(prev => ({ ...prev, gender: val }))}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="marital_status">Marital Status</Label>
                <Select value={formData.marital_status} onValueChange={val => setFormData(prev => ({ ...prev, marital_status: val }))}>
                  <SelectTrigger id="marital_status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARITAL_STATUSES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cnic_number">CNIC Number</Label>
                <Input id="cnic_number" value={formData.cnic_number} onChange={e => setFormData(prev => ({ ...prev, cnic_number: e.target.value }))} />
                {errors.cnic_number && <div className="text-red-500 text-xs mt-1">{errors.cnic_number}</div>}
              </div>
              <div>
                <Label htmlFor="contact_number">Contact Number</Label>
                <Input id="contact_number" value={formData.contact_number} onChange={e => setFormData(prev => ({ ...prev, contact_number: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="personal_email_address">Personal Email</Label>
                <Input id="personal_email_address" value={formData.personal_email_address} onChange={e => setFormData(prev => ({ ...prev, personal_email_address: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="current_residential_address">Current Address</Label>
                <Textarea id="current_residential_address" value={formData.current_residential_address} onChange={e => setFormData(prev => ({ ...prev, current_residential_address: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="permanent_address">Permanent Address</Label>
                <Textarea id="permanent_address" value={formData.permanent_address} onChange={e => setFormData(prev => ({ ...prev, permanent_address: e.target.value }))} />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Job Info */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="w-full text-left font-semibold text-lg mb-2">Job Information</CollapsibleTrigger>
            <CollapsibleContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="job_title">Job Title</Label>
                <Input id="job_title" value={formData.job_title} onChange={e => setFormData(prev => ({ ...prev, job_title: e.target.value }))} />
                {errors.job_title && <div className="text-red-500 text-xs mt-1">{errors.job_title}</div>}
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={val => setFormData(prev => ({ ...prev, department: val }))}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.department && <div className="text-red-500 text-xs mt-1">{errors.department}</div>}
              </div>
              <div>
                <Label htmlFor="date_of_joining">Date of Joining</Label>
                <Input id="date_of_joining" type="date" value={formData.date_of_joining} onChange={e => setFormData(prev => ({ ...prev, date_of_joining: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="reporting_manager">Reporting Manager</Label>
                <Input id="reporting_manager" value={formData.reporting_manager} onChange={e => setFormData(prev => ({ ...prev, reporting_manager: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="work_module">Work Module</Label>
                <Input id="work_module" value={formData.work_module} onChange={e => setFormData(prev => ({ ...prev, work_module: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="work_hours">Work Hours</Label>
                <Input id="work_hours" value={formData.work_hours} onChange={e => setFormData(prev => ({ ...prev, work_hours: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="email">Work Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} />
                {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Bank Info */}
          <Collapsible>
            <CollapsibleTrigger className="w-full text-left font-semibold text-lg mb-2">Bank Information</CollapsibleTrigger>
            <CollapsibleContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input id="bank_name" value={formData.bank_name} onChange={e => setFormData(prev => ({ ...prev, bank_name: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="account_holder_name">Account Holder Name</Label>
                <Input id="account_holder_name" value={formData.account_holder_name} onChange={e => setFormData(prev => ({ ...prev, account_holder_name: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="account_number">Account Number</Label>
                <Input id="account_number" value={formData.account_number} onChange={e => setFormData(prev => ({ ...prev, account_number: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="iban_number">IBAN Number</Label>
                <Input id="iban_number" value={formData.iban_number} onChange={e => setFormData(prev => ({ ...prev, iban_number: e.target.value }))} />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Dependents */}
          <Collapsible>
            <CollapsibleTrigger className="w-full text-left font-semibold text-lg mb-2">Dependents</CollapsibleTrigger>
            <CollapsibleContent>
          <div className="space-y-2">
                {dependents.map((dep, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end border p-2 rounded-md">
                    <div>
                      <Label>Full Name</Label>
                      <Input value={dep.full_name} onChange={e => {
                        const newDeps = [...dependents];
                        newDeps[idx].full_name = e.target.value;
                        setDependents(newDeps);
                      }} />
                    </div>
                    <div>
                      <Label>Relationship</Label>
                      <Input value={dep.relationship} onChange={e => {
                        const newDeps = [...dependents];
                        newDeps[idx].relationship = e.target.value;
                        setDependents(newDeps);
                      }} />
                    </div>
                    <div>
                      <Label>Gender</Label>
                      <Input value={dep.gender} onChange={e => {
                        const newDeps = [...dependents];
                        newDeps[idx].gender = e.target.value;
                        setDependents(newDeps);
                      }} />
                    </div>
                    <div>
                      <Label>Date of Birth</Label>
                      <Input type="date" value={dep.date_of_birth} onChange={e => {
                        const newDeps = [...dependents];
                        newDeps[idx].date_of_birth = e.target.value;
                        setDependents(newDeps);
                      }} />
                    </div>
                    <div>
                      <Label>CNIC/B-Form</Label>
                      <Input value={dep.cnic_bform_number} onChange={e => {
                        const newDeps = [...dependents];
                        newDeps[idx].cnic_bform_number = e.target.value;
                        setDependents(newDeps);
                      }} />
                    </div>
                    <Button type="button" variant="destructive" size="sm" onClick={() => setDependents(dependents.filter((_, i) => i !== idx))}>Remove</Button>
                  </div>
                ))}
                <Button type="button" variant="secondary" size="sm" onClick={() => setDependents([...dependents, { full_name: "", relationship: "", gender: "", date_of_birth: "", cnic_bform_number: "" }])}>Add Dependent</Button>
          </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Emergency Contacts */}
          <Collapsible>
            <CollapsibleTrigger className="w-full text-left font-semibold text-lg mb-2">Emergency Contacts</CollapsibleTrigger>
            <CollapsibleContent>
          <div className="space-y-2">
                {contacts.map((con, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end border p-2 rounded-md">
                    <div>
                      <Label>Name</Label>
                      <Input value={con.name} onChange={e => {
                        const newCons = [...contacts];
                        newCons[idx].name = e.target.value;
                        setContacts(newCons);
                      }} />
                    </div>
                    <div>
                      <Label>Relationship</Label>
                      <Input value={con.relationship} onChange={e => {
                        const newCons = [...contacts];
                        newCons[idx].relationship = e.target.value;
                        setContacts(newCons);
                      }} />
                    </div>
                    <div>
                      <Label>Contact Number</Label>
                      <Input value={con.contact_number} onChange={e => {
                        const newCons = [...contacts];
                        newCons[idx].contact_number = e.target.value;
                        setContacts(newCons);
                      }} />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select value={con.type} onValueChange={val => {
                        const newCons = [...contacts];
                        newCons[idx].type = val as 'primary' | 'secondary';
                        setContacts(newCons);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">Primary</SelectItem>
                          <SelectItem value="secondary">Secondary</SelectItem>
                        </SelectContent>
                      </Select>
          </div>
                    <Button type="button" variant="destructive" size="sm" onClick={() => setContacts(contacts.filter((_, i) => i !== idx))}>Remove</Button>
          </div>
                ))}
                <Button type="button" variant="secondary" size="sm" onClick={() => setContacts([...contacts, { name: "", relationship: "", contact_number: "", type: "primary" }])}>Add Contact</Button>
          </div>
            </CollapsibleContent>
          </Collapsible>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Spinner className="mr-2" /> : null}
              {employee ? "Update" : "Add"} Employee
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

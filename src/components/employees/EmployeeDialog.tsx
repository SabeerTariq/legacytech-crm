
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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeProfile } from "@/types/employee";

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: string;
  employee?: EmployeeProfile;
  onSuccess: () => void;
}

export function EmployeeDialog({ open, onOpenChange, department, employee, onSuccess }: EmployeeDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: employee?.name || "",
    role: employee?.role || "",
    email: employee?.email || "",
    joinDate: employee?.joinDate || new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (employee?.id) {
        // Update existing employee
        const { error } = await supabase
          .from("employees")
          .update({
            name: formData.name,
            role: formData.role,
            email: formData.email,
            join_date: formData.joinDate,
          })
          .eq("id", employee.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Employee updated successfully",
        });
      } else {
        // Add new employee
        const { error } = await supabase
          .from("employees")
          .insert({
            name: formData.name,
            role: formData.role,
            email: formData.email,
            join_date: formData.joinDate,
            department,
          });

        if (error) throw error;
        toast({
          title: "Success",
          description: "Employee added successfully",
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="joinDate">Join Date</Label>
            <Input
              id="joinDate"
              type="date"
              value={formData.joinDate}
              onChange={(e) => setFormData(prev => ({ ...prev, joinDate: e.target.value }))}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {employee ? "Update" : "Add"} Employee
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

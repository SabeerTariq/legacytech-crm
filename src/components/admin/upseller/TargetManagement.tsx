import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../../ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../ui/select';
import { useToast } from '../../../hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Target, 
  Calendar,
  DollarSign,
  TrendingUp,
  User
} from 'lucide-react';
import { UpsellerManagementService } from '../../../lib/admin/upsellerManagementService';
import { 
  UpsellerTargetManagement,
  SetTargetRequest
} from '../../../types/upsellerManagement';

interface TargetManagementProps {
  targets: UpsellerTargetManagement[];
  onTargetsChange: (targets: UpsellerTargetManagement[]) => void;
  onRefresh: () => void;
}

const TargetManagement: React.FC<TargetManagementProps> = ({ 
  targets, 
  onTargetsChange, 
  onRefresh 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<UpsellerTargetManagement | null>(null);

  // Form states
  const [employeeId, setEmployeeId] = useState('');
  const [month, setMonth] = useState('');
  const [targetAccounts, setTargetAccounts] = useState('');
  const [targetGross, setTargetGross] = useState('');
  const [targetCashIn, setTargetCashIn] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadAvailableEmployees();
    // Set default month to current month
    const now = new Date();
    const year = now.getFullYear();
    const monthNum = now.getMonth() + 1;
    setMonth(`${year}-${monthNum.toString().padStart(2, '0')}-01`);
  }, []);

  const loadAvailableEmployees = async () => {
    try {
      const employees = await UpsellerManagementService.getAvailableEmployees();
      setAvailableEmployees(employees);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const resetForm = () => {
    setEmployeeId('');
    setMonth('');
    setTargetAccounts('');
    setTargetGross('');
    setTargetCashIn('');
    setNotes('');
  };

  const handleCreateTarget = async () => {
    if (!employeeId || !month || !targetAccounts || !targetGross || !targetCashIn) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const newTarget = await UpsellerManagementService.setTarget({
        employee_id: employeeId,
        month: month,
        target_accounts: parseInt(targetAccounts),
        target_gross: parseFloat(targetGross),
        target_cash_in: parseFloat(targetCashIn),
        notes: notes.trim() || undefined
      }, 'current-user-id'); // TODO: Get actual user ID

      onTargetsChange([...targets, newTarget]);
      setIsCreateDialogOpen(false);
      resetForm();
      onRefresh();

      toast({
        title: "Success",
        description: "Target set successfully",
      });
    } catch (error) {
      console.error('Error setting target:', error);
      toast({
        title: "Error",
        description: "Failed to set target",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTarget = async () => {
    if (!selectedTarget || !employeeId || !month || !targetAccounts || !targetGross || !targetCashIn) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const updatedTarget = await UpsellerManagementService.setTarget({
        employee_id: employeeId,
        month: month,
        target_accounts: parseInt(targetAccounts),
        target_gross: parseFloat(targetGross),
        target_cash_in: parseFloat(targetCashIn),
        notes: notes.trim() || undefined
      }, 'current-user-id'); // TODO: Get actual user ID

      onTargetsChange(targets.map(target => 
        target.id === updatedTarget.id ? updatedTarget : target
      ));
      setIsEditDialogOpen(false);
      resetForm();

      toast({
        title: "Success",
        description: "Target updated successfully",
      });
    } catch (error) {
      console.error('Error updating target:', error);
      toast({
        title: "Error",
        description: "Failed to update target",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (target: UpsellerTargetManagement) => {
    setSelectedTarget(target);
    setEmployeeId(target.employee_id);
    setMonth(target.month);
    setTargetAccounts(target.target_accounts.toString());
    setTargetGross(target.target_gross.toString());
    setTargetCashIn(target.target_cash_in.toString());
    setNotes(target.notes || '');
    setIsEditDialogOpen(true);
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Generate options for current year and next year
    for (let year = currentYear; year <= currentYear + 1; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        const dateStr = `${year}-${monthStr}-01`;
        const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long' });
        options.push({ value: dateStr, label: `${monthName} ${year}` });
      }
    }
    return options;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Target Management</h2>
          <p className="text-muted-foreground">
            Set and manage targets for upsellers
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Set Target
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Set New Target</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="createEmployee">Employee *</Label>
                <Select value={employeeId} onValueChange={setEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEmployees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.full_name} - {employee.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="createMonth">Month *</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {getMonthOptions().map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="createTargetAccounts">Target Accounts *</Label>
                  <Input
                    id="createTargetAccounts"
                    type="number"
                    value={targetAccounts}
                    onChange={(e) => setTargetAccounts(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="createTargetGross">Target Gross *</Label>
                  <Input
                    id="createTargetGross"
                    type="number"
                    step="0.01"
                    value={targetGross}
                    onChange={(e) => setTargetGross(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="createTargetCashIn">Target Cash In *</Label>
                  <Input
                    id="createTargetCashIn"
                    type="number"
                    step="0.01"
                    value={targetCashIn}
                    onChange={(e) => setTargetCashIn(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="createNotes">Notes</Label>
                <Textarea
                  id="createNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes about this target"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTarget} disabled={loading}>
                  {loading ? 'Setting...' : 'Set Target'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Targets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {targets.map(target => (
          <Card key={target.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <span>{target.employee?.full_name}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-muted-foreground">
                      {formatDate(target.month)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(target)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Target Accounts:</span>
                  <span className="text-sm font-bold">{target.target_accounts}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Target Gross:</span>
                  <span className="text-sm font-bold text-green-600">
                    {formatCurrency(target.target_gross)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Target Cash In:</span>
                  <span className="text-sm font-bold text-blue-600">
                    {formatCurrency(target.target_cash_in)}
                  </span>
                </div>
                {target.notes && (
                  <div className="pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      <strong>Notes:</strong> {target.notes}
                    </div>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Set by: {target.set_by_employee?.full_name || 'Unknown'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Target Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Target</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editEmployee">Employee *</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {availableEmployees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.full_name} - {employee.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editMonth">Month *</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {getMonthOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="editTargetAccounts">Target Accounts *</Label>
                <Input
                  id="editTargetAccounts"
                  type="number"
                  value={targetAccounts}
                  onChange={(e) => setTargetAccounts(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="editTargetGross">Target Gross *</Label>
                <Input
                  id="editTargetGross"
                  type="number"
                  step="0.01"
                  value={targetGross}
                  onChange={(e) => setTargetGross(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="editTargetCashIn">Target Cash In *</Label>
                <Input
                  id="editTargetCashIn"
                  type="number"
                  step="0.01"
                  value={targetCashIn}
                  onChange={(e) => setTargetCashIn(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editNotes">Notes</Label>
              <Textarea
                id="editNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this target"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTarget} disabled={loading}>
                {loading ? 'Updating...' : 'Update Target'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TargetManagement;

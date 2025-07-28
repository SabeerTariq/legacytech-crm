
export interface ProductionPerformance {
  total_tasks_assigned: number;
  tasks_completed_ontime: number;
  tasks_completed_late: number;
  strikes: number;
  avg_completion_time: number;
}

export interface SalesPerformance {
  salesTarget: number;
  salesAchieved: number;
  projectsCompleted: number;
  tasksCompleted: number;
  avgTaskCompletionTime: number;
  customerSatisfaction: number;
}

export type EmployeePerformance = SalesPerformance | ProductionPerformance;

export interface Dependent {
  id?: string;
  full_name: string;
  relationship: string;
  gender: string;
  date_of_birth: string;
  cnic_bform_number: string;
}

export interface EmergencyContact {
  id?: string;
  name: string;
  relationship: string;
  contact_number: string;
  type: 'primary' | 'secondary';
}

export interface EmployeeProfile {
  id: string;
  full_name?: string;
  father_name?: string;
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  cnic_number?: string;
  current_residential_address?: string;
  permanent_address?: string;
  contact_number?: string;
  personal_email_address?: string;
  total_dependents_covered?: number;
  job_title?: string;
  department: string;
  date_of_joining?: string;
  reporting_manager?: string;
  work_module?: string;
  work_hours?: string;
  bank_name?: string;
  account_holder_name?: string;
  account_number?: string;
  iban_number?: string;
  email: string;
  avatar?: string;
  performance: EmployeePerformance;
  created_at?: string;
  updated_at?: string;
  dependents?: Dependent[];
  contacts?: EmergencyContact[];
}


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

export interface EmployeeProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  avatar?: string;
  joinDate: string;
  performance: EmployeePerformance;
}

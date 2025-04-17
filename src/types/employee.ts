
export interface EmployeePerformance {
  salesTarget: number;
  salesAchieved: number;
  projectsCompleted: number;
  tasksCompleted: number;
  avgTaskCompletionTime: number;
  customerSatisfaction: number;
}

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

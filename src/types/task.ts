export interface Task {
  id: string;
  title: string;
  description?: string;
  department: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "completed";
  due_date?: string;
  assigned_to_id?: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  employee_id: string;
  assigned_at: string;
  completed_on_time: boolean;
}

export interface TaskPerformance {
  total_tasks_assigned: number;
  tasks_completed_ontime: number;
  tasks_completed_late: number;
  strikes: number;
} 
export interface UpsellerTarget {
  id: string;
  seller_id: string;
  month: string;
  target_accounts: number;
  target_gross: number;
  target_cash_in: number;
  created_at: string;
  updated_at: string;
}

export interface UpsellerPerformance {
  id: string;
  seller_id: string;
  month: string;
  accounts_achieved: number;
  total_gross: number;
  total_cash_in: number;
  total_remaining: number;
  created_at: string;
  updated_at: string;
}

export interface TeamPerformanceSummary {
  seller_id: string;
  seller_name: string;
  total_target: number;
  achieved_target: number;
  remaining_target: number;
  receivable: number;
  accounts_assigned: number;
}

export interface PerformanceMetrics {
  accountsAssigned: number; // Number of projects assigned to the upseller
  receivable: number; // Remaining payment amount from assigned project customers
  totalTarget: number; // Target in dollars
  targetAchieved: number; // How much of the target has been achieved
  targetRemaining: number; // How much target is left
  totalGross: number; // Total gross amount
  totalCashIn: number; // Total cash received
  totalRemaining: number; // Total remaining amount
  targetCompletion: number; // Target completion percentage
  teamRank: number; // Team rank based on performance
  month?: string; // Optional month for previous months data
}

export interface DashboardData {
  currentMonth: PerformanceMetrics;
  previousMonths: PerformanceMetrics[];
  teamPerformance: TeamPerformanceSummary[];
  personalRank: number;
  teamAverage: {
    accountsAchieved: number;
    totalGross: number;
    totalCashIn: number;
  };
}

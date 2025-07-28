export interface FrontSellerTarget {
  id: string;
  seller_id: string;
  month: string;
  target_accounts: number;
  target_gross: number;
  target_cash_in: number;
  created_at: string;
  updated_at: string;
}

export interface FrontSellerPerformance {
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
  accounts_achieved: number;
  total_gross: number;
  total_cash_in: number;
  total_remaining: number;
  target_accounts: number;
  target_gross: number;
  target_cash_in: number;
  performance_rank: number | string; // Can be bigint from database
  completion_rate?: number | string; // Can be numeric from database
}

export interface MonthlyPerformanceData {
  month: string;
  accounts_achieved: number;
  total_gross: number;
  total_cash_in: number;
  total_remaining: number;
  target_accounts: number;
}

export interface PerformanceMetrics {
  targetAccounts: number;
  accountsAchieved: number;
  accountsRemaining: number;
  totalGross: number;
  totalCashIn: number;
  totalRemaining: number;
  targetCompletion: number;
}

export interface DashboardData {
  currentMonth: PerformanceMetrics;
  previousMonths: MonthlyPerformanceData[];
  teamPerformance: TeamPerformanceSummary[];
  personalRank: number;
  teamAverage: {
    accountsAchieved: number;
    totalGross: number;
    totalCashIn: number;
  };
} 
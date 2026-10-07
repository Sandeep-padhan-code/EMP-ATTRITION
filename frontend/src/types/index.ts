export type UserRole = 'hr' | 'employee';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  name: string;
  employee_number?: number | null;
  department?: string | null;
  job_role?: string | null;
  avatar_url?: string | null;
}

export type RiskTier = 'Low' | 'Medium' | 'High';

export interface ContributingFactor {
  factor: string;
  category: string;
  signal_strength: 'High' | 'Moderate' | 'Low' | 'Positive';
  influence_score: number;
  employee_value: string;
  benchmark: string;
  description: string;
}

export interface Recommendation {
  action: string;
  impact: 'High' | 'Medium' | 'Moderate';
  timeframe: string;
  description: string;
}

export interface PredictionResult {
  prediction: number;
  risk_probability: number;
  retention_probability: number;
  risk_tier: RiskTier;
  badge_color: 'emerald' | 'amber' | 'red';
  contributing_factors: ContributingFactor[];
  recommendations: Recommendation[];
  disclaimer: string;
}

export interface Employee {
  id: number;
  employeeNumber: number;
  name: string;
  email: string;
  department: string;
  jobRole: string;
  gender: string;
  age: number;
  maritalStatus?: string;
  education?: number;
  educationField?: string;
  monthlyIncome: number;
  monthlyRate?: number;
  dailyRate?: number;
  hourlyRate?: number;
  percentSalaryHike?: number;
  stockOptionLevel?: number;
  jobLevel?: number;
  jobInvolvement?: number;
  jobSatisfaction: number;
  environmentSatisfaction: number;
  relationshipSatisfaction?: number;
  workLifeBalance: number;
  performanceRating: number;
  overTime: string;
  businessTravel: string;
  distanceFromHome: number;
  numCompaniesWorked?: number;
  totalWorkingYears: number;
  trainingTimesLastYear?: number;
  yearsAtCompany: number;
  yearsInCurrentRole?: number;
  yearsSinceLastPromotion: number;
  yearsWithCurrManager: number;
  historicalAttrition?: string;
  attritionRisk: RiskTier;
  riskProbability: number;
  retentionProbability: number;
  prediction: number;
  badgeColor: 'emerald' | 'amber' | 'red';
}

export interface EmployeeDetail extends Omit<Employee, 'prediction'> {
  prediction: PredictionResult;
}

export interface Pagination {
  total: number;
  dataset_total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface EmployeeListResponse {
  employees: Employee[];
  pagination: Pagination;
}

export interface WorkforceKPIs {
  total_employees: number;
  at_risk_count: number;
  at_risk_rate: number;
  high_risk_count: number;
  high_risk_rate: number;
  medium_risk_count: number;
  low_risk_count: number;
  average_retention_rate: number;
  average_monthly_income: number;
  overtime_workforce_pct: number;
  overtime_risk_multiplier: number;
}

export interface RiskDistributionItem {
  tier: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DepartmentAnalytics {
  department: string;
  headcount: number;
  share: number;
  at_risk_count: number;
  high_risk_count: number;
  medium_risk_count: number;
  risk_rate: number;
  avg_monthly_income: number;
  avg_satisfaction: number;
  overtime_headcount: number;
  overtime_rate: number;
}

export interface RoleAnalytics {
  role: string;
  department: string;
  headcount: number;
  high_risk_count: number;
  risk_rate: number;
  avg_income: number;
}

export interface ModelFactor {
  feature: string;
  importance: number;
}

export interface PriorityQueueEmployee {
  id: number;
  name: string;
  email: string;
  department: string;
  jobRole: string;
  riskProbability: number;
  riskTier: RiskTier;
  overTime: string;
  monthlyIncome: number;
  jobSatisfaction: number;
  topDriver: string;
  actionTimeframe: string;
}

export interface WorkforceAnalyticsResponse {
  workforce_kpis: WorkforceKPIs;
  risk_distribution: RiskDistributionItem[];
  departments: DepartmentAnalytics[];
  roles: RoleAnalytics[];
  tenure_bands: Array<{ band: string; count: number; risk_rate: number }>;
  overtime_comparison: {
    overtime_yes: { headcount: number; attrition_rate: number };
    overtime_no: { headcount: number; attrition_rate: number };
  };
  top_model_factors: ModelFactor[];
  priority_action_queue: PriorityQueueEmployee[];
  model_metadata: {
    algorithm: string;
    accuracy: string;
    feature_count: number;
    dataset_records: number;
  };
}

export interface Conversation {
  id: string;
  employee_id: number;
  employee_name: string;
  hr_user_id: number;
  title: string;
  topic: string;
  status: 'active' | 'resolved' | 'pending';
  last_message_preview: string;
  last_message_at: string;
  created_at: string;
  unread_count?: number;
}

export interface Message {
  id: number;
  conversation_id: string;
  sender_id: number;
  sender_role: UserRole;
  sender_name: string;
  recipient_id: number;
  content: string;
  category: string;
  is_read: number;
  read_at?: string | null;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'message' | 'action_plan' | 'alert' | 'system';
  link?: string | null;
  is_read: number;
  created_at: string;
}

export interface ActionPlan {
  id: number;
  employee_number: number;
  employee_name: string;
  created_by_hr_id: number;
  created_by_name: string;
  action_type: string;
  priority: string;
  status: string;
  notes: string;
  target_date: string;
  created_at: string;
}

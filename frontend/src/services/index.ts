import { request } from './api';
import {
  User,
  Employee,
  EmployeeDetail,
  EmployeeListResponse,
  WorkforceAnalyticsResponse,
  Conversation,
  Message,
  NotificationItem,
  ActionPlan,
} from '../types';

export const authService = {
  login: async (email: string, password: string) => {
    const data = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    return data;
  },

  getMe: async () => {
    return request<{ user: User }>('/api/auth/me');
  },

  logout: async () => {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  },

  getDemoAccounts: async () => {
    return request<{
      hr_default: { email: string; password: string; role: string; name: string };
      employee_default: { email: string; password: string; role: string; name: string };
      other_demos: Array<{ email: string; password: string; role: string; name: string }>;
    }>('/api/auth/demo-accounts');
  },
};

export const employeeService = {
  getEmployees: async (params?: {
    department?: string;
    job_role?: string;
    risk_tier?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
    page?: number;
    page_size?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.department) searchParams.set('department', params.department);
    if (params?.job_role) searchParams.set('job_role', params.job_role);
    if (params?.risk_tier) searchParams.set('risk_tier', params.risk_tier);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sort_by) searchParams.set('sort_by', params.sort_by);
    if (params?.sort_order) searchParams.set('sort_order', params.sort_order);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.page_size) searchParams.set('page_size', params.page_size.toString());

    const qs = searchParams.toString();
    return request<EmployeeListResponse>(`/api/employees${qs ? `?${qs}` : ''}`);
  },

  getEmployee: async (id: number) => {
    return request<{ employee: EmployeeDetail }>(`/api/employees/${id}`);
  },

  getMyProfile: async () => {
    return request<{ profile: Partial<Employee> }>('/api/employees/me');
  },

  getPrediction: async (id: number) => {
    return request<{
      employee_id: number;
      name: string;
      department: string;
      job_role: string;
      prediction: EmployeeDetail['prediction'];
    }>(`/api/employees/${id}/prediction`);
  },
};

export const analyticsService = {
  getOverview: async () => {
    return request<WorkforceAnalyticsResponse>('/api/analytics/overview');
  },

  getDepartments: async () => {
    return request<{ departments: WorkforceAnalyticsResponse['departments'] }>('/api/analytics/departments');
  },

  getModelFactors: async () => {
    return request<{
      factors: WorkforceAnalyticsResponse['top_model_factors'];
      model_accuracy: string;
      algorithm: string;
    }>('/api/analytics/model-factors');
  },
};

export const messageService = {
  getConversations: async () => {
    return request<{ conversations: Conversation[] }>('/api/messages/conversations');
  },

  getConversation: async (id: string) => {
    return request<{
      conversation: Conversation;
      messages: Message[];
    }>(`/api/messages/conversations/${id}`);
  },

  sendMessage: async (payload: {
    conversation_id?: string;
    recipient_employee_number?: number;
    recipient_id?: number;
    content: string;
    category?: string;
    title?: string;
  }) => {
    return request<{ message: Message; conversation_id: string }>('/api/messages', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export const notificationService = {
  getNotifications: async () => {
    return request<{ notifications: NotificationItem[]; unread_count: number }>('/api/notifications');
  },

  markRead: async (id: number) => {
    return request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  markAllRead: async () => {
    return request<{ success: boolean; message: string }>('/api/notifications/read-all', {
      method: 'POST',
    });
  },
};

export const reportService = {
  getSummary: async () => {
    return request<{
      generated_at: string;
      generated_by: string;
      executive_takeaways: string[];
      kpis: WorkforceAnalyticsResponse['workforce_kpis'];
      departments: WorkforceAnalyticsResponse['departments'];
      top_model_factors: WorkforceAnalyticsResponse['top_model_factors'];
      priority_action_roster: WorkforceAnalyticsResponse['priority_action_queue'];
      model_metadata: WorkforceAnalyticsResponse['model_metadata'];
    }>('/api/reports/summary');
  },

  getActionPlans: async (employeeNumber?: number) => {
    const qs = employeeNumber ? `?employee_number=${employeeNumber}` : '';
    return request<{ action_plans: ActionPlan[] }>(`/api/reports/action-plans${qs}`);
  },

  createActionPlan: async (payload: {
    employee_number: number;
    employee_name: string;
    action_type: string;
    priority: string;
    notes: string;
    target_date?: string;
  }) => {
    return request<{ action_plan: ActionPlan }>('/api/reports/action-plans', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  exportCsvUrl: () => {
    const token = localStorage.getItem('auth_token');
    return `/api/reports/export-csv?token=${token || ''}`;
  },
};

export const feedbackService = {
  submitFeedback: async (payload: {
    category: string;
    sentiment: string;
    message: string;
    is_anonymous: boolean;
  }) => {
    return request<{ success: boolean; message: string }>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getFeedbackList: async () => {
    return request<{ feedback: any[] }>('/api/feedback');
  },
};

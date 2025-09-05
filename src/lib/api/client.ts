const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Add default headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    const token = localStorage.getItem('jwt_token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('crm_user');
          window.location.href = '/login';
          return { error: 'Authentication failed' };
        }
        
        return {
          error: data.error || 'Request failed',
          message: data.message || 'An error occurred'
        };
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: 'Network error',
        message: 'Failed to connect to server'
      };
    }
  }

  // Authentication endpoints
  async login(credentials: { email: string; password: string }) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.request('/api/auth/profile');
  }

  // Admin endpoints
  async getUserRoles() {
    return this.request('/api/admin/get-user-roles');
  }

  async checkUserRole(userId: string, roleName: string) {
    return this.request('/api/admin/check-user-role', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, role_name: roleName }),
    });
  }

  async createUser(userData: any) {
    return this.request('/api/admin/create-user', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, updates: any) {
    return this.request('/api/admin/update-user', {
      method: 'PUT',
      body: JSON.stringify({ user_id: userId, updates }),
    });
  }

  async deleteUser(userId: string) {
    return this.request('/api/admin/delete-user', {
      method: 'DELETE',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async getRoles() {
    return this.request('/api/admin/roles');
  }

  async getRoleById(roleId: string) {
    return this.request(`/api/admin/roles/${roleId}`);
  }

  async createRole(roleData: any) {
    return this.request('/api/admin/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  async updateRole(roleData: any) {
    return this.request(`/api/admin/roles/${roleData.id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  }

  async deleteRole(roleId: string) {
    return this.request(`/api/admin/roles/${roleId}`, {
      method: 'DELETE',
    });
  }

  async getModules() {
    return this.request('/api/admin/roles/modules/list');
  }

  async getUpsellerData() {
    return this.request('/api/admin/upseller-data');
  }

  async getConversations(params?: { limit?: number; offset?: number; conversation_type?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.conversation_type) queryParams.append('conversation_type', params.conversation_type);
    if (params?.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/admin/get-conversations${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async createConversation(conversationData: any) {
    return this.request('/api/admin/create-conversation', {
      method: 'POST',
      body: JSON.stringify(conversationData),
    });
  }

  // Projects endpoints
  async getAllProjectsComprehensive() {
    return this.request('/api/projects/all-comprehensive');
  }

  async getProjects(params?: { 
    assigned_pm_id?: string;
    sales_disposition_ids?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.assigned_pm_id) queryParams.append('assigned_pm_id', params.assigned_pm_id);
    if (params?.sales_disposition_ids) queryParams.append('sales_disposition_ids', params.sales_disposition_ids);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/projects${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getProjectById(projectId: string) {
    return this.request(`/api/projects/${projectId}`);
  }

  async updateProjectStatusById(projectId: string, status: string) {
    return this.request(`/api/projects/${projectId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Project Assignment endpoints
  async getUnassignedProjects(userId: string) {
    return this.request(`/api/projects/assignment/unassigned?user_id=${userId}`);
  }

  async getProjectManagers() {
    return this.request('/api/projects/assignment/project-managers');
  }

  async assignProject(projectId: string, pmId: string) {
    return this.request('/api/projects/assignment/assign', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId, pm_id: pmId }),
    });
  }

  // My Projects endpoints
  async getMyProjects(userId: string) {
    return this.request(`/api/projects/my-projects?user_id=${userId}`);
  }

  async updateProjectStatus(projectId: string, status: string) {
    return this.request(`/api/projects/my-projects/${projectId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Customers endpoints (role-based filtering)
  async getCustomers(userId: string) {
    return this.request(`/api/customers?user_id=${userId}`);
  }

  // Sales Dispositions endpoints
  async getSalesDispositions(params?: {
    user_id?: string;
    email?: string;
    phone_number?: string;
    sales_disposition_ids?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.user_id) queryParams.append('user_id', params.user_id);
    if (params?.email) queryParams.append('email', params.email);
    if (params?.phone_number) queryParams.append('phone_number', params.phone_number);
    if (params?.sales_disposition_ids) queryParams.append('sales_disposition_ids', params.sales_disposition_ids);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/sales/sales-dispositions${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getSalesDispositionById(id: string) {
    return this.request(`/api/sales/sales-dispositions/${id}`);
  }

  // Recurring Services endpoints
  async getRecurringServices(params?: {
    customer_ids?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.customer_ids) queryParams.append('customer_ids', params.customer_ids);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/recurring-services${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;

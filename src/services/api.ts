import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API base URL
const API_URL = 'http://localhost:5000/api';

class ApiService {
  private api: AxiosInstance;
  private debug = process.env.NODE_ENV === 'development';

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle errors
        if (error.response) {
          // Server responded with an error status
          const { status, data } = error.response;

          if (status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            window.location.href = '/login';
          }

          return Promise.reject(data || error);
        }

        // Network error or other issues
        return Promise.reject(error);
      }
    );
  }

  // Set auth token for all requests
  public setAuthToken(token: string): void {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (this.debug) {
      console.log('Auth token set in API headers');
    }
  }

  // Remove auth token
  public removeAuthToken(): void {
    delete this.api.defaults.headers.common['Authorization'];
    if (this.debug) {
      console.log('Auth token removed from API headers');
    }
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      if (this.debug) {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          data: config.data,
          params: config.params,
          headers: {
            ...config.headers,
            Authorization: config.headers?.Authorization ? 'Bearer [REDACTED]' : undefined
          }
        });
      }

      const response: AxiosResponse<T> = await this.api(config);

      if (this.debug) {
        console.log(`API Response: ${config.method?.toUpperCase()} ${config.url}`, {
          status: response.status,
          data: response.data
        });
      }

      return response.data;
    } catch (error: any) {
      if (this.debug) {
        console.error(`API Error: ${config.method?.toUpperCase()} ${config.url}`, {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      }

      // Handle authentication errors
      if (error.response?.status === 401) {
        // Clear token from localStorage
        localStorage.removeItem('token');
        // Remove token from API headers
        this.removeAuthToken();
        // Redirect to login page if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      // Enhance error with more details
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const serverError = new Error(
          error.response.data?.message ||
          `Server error: ${error.response.status}`
        );
        // Add response data to the error for more context
        (serverError as any).response = error.response;
        throw serverError;
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response received from server');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw error;
      }
    }
  }

  // Authentication methods
  public async login(email: string, password: string) {
    return this.request({
      method: 'POST',
      url: '/auth/login',
      data: { email, password },
    });
  }

  public async register(userData: any) {
    return this.request({
      method: 'POST',
      url: '/auth/register',
      data: userData,
    });
  }

  public async logout() {
    return this.request({
      method: 'GET',
      url: '/auth/logout',
    });
  }

  public async getCurrentUser() {
    return this.request({
      method: 'GET',
      url: '/auth/me',
    });
  }

  // User methods
  public async getUsers() {
    return this.request({
      method: 'GET',
      url: '/users',
    });
  }

  public async getUser(id: number) {
    return this.request({
      method: 'GET',
      url: `/users/${id}`,
    });
  }

  public async createUser(userData: any) {
    return this.request({
      method: 'POST',
      url: '/users',
      data: userData,
    });
  }

  public async updateUser(id: number, userData: any) {
    return this.request({
      method: 'PUT',
      url: `/users/${id}`,
      data: userData,
    });
  }

  public async deleteUser(id: number) {
    return this.request({
      method: 'DELETE',
      url: `/users/${id}`,
    });
  }

  // Customer methods
  public async getCustomers() {
    return this.request({
      method: 'GET',
      url: '/customers',
    });
  }

  public async getCustomer(id: number) {
    return this.request({
      method: 'GET',
      url: `/customers/${id}`,
    });
  }

  public async createCustomer(customerData: any) {
    return this.request({
      method: 'POST',
      url: '/customers',
      data: customerData,
    });
  }

  public async updateCustomer(id: number, customerData: any) {
    return this.request({
      method: 'PUT',
      url: `/customers/${id}`,
      data: customerData,
    });
  }

  public async deleteCustomer(id: number) {
    return this.request({
      method: 'DELETE',
      url: `/customers/${id}`,
    });
  }

  // Project methods
  public async getProjects() {
    return this.request({
      method: 'GET',
      url: '/projects',
    });
  }

  public async getProject(id: number) {
    return this.request({
      method: 'GET',
      url: `/projects/${id}`,
    });
  }

  public async createProject(projectData: any) {
    return this.request({
      method: 'POST',
      url: '/projects',
      data: projectData,
    });
  }

  public async updateProject(id: number, projectData: any) {
    return this.request({
      method: 'PUT',
      url: `/projects/${id}`,
      data: projectData,
    });
  }

  public async assignTeam(id: number, team: string[]) {
    return this.request({
      method: 'PATCH',
      url: `/projects/${id}/team`,
      data: { team },
    });
  }

  public async getProjectsByCustomer(customerId: number) {
    return this.request({
      method: 'GET',
      url: `/projects/customer/${customerId}`,
    });
  }

  public async deleteProject(id: number) {
    return this.request({
      method: 'DELETE',
      url: `/projects/${id}`,
    });
  }

  // Sale methods
  public async getSales() {
    return this.request({
      method: 'GET',
      url: '/sales',
    });
  }

  public async getMySales() {
    return this.request({
      method: 'GET',
      url: '/sales/my-sales',
    });
  }

  public async getSalesByCustomer(customerId: number) {
    return this.request({
      method: 'GET',
      url: `/sales/customer/${customerId}`,
    });
  }

  public async getSalesBySeller(sellerId: number) {
    return this.request({
      method: 'GET',
      url: `/sales/seller/${sellerId}`,
    });
  }

  public async getSale(id: number) {
    return this.request({
      method: 'GET',
      url: `/sales/${id}`,
    });
  }

  public async createSale(saleData: any) {
    return this.request({
      method: 'POST',
      url: '/sales',
      data: saleData,
    });
  }

  public async updateSale(id: number, saleData: any) {
    return this.request({
      method: 'PUT',
      url: `/sales/${id}`,
      data: saleData,
    });
  }

  public async deleteSale(id: number) {
    return this.request({
      method: 'DELETE',
      url: `/sales/${id}`,
    });
  }

  // Lead methods
  public async getLeads() {
    return this.request({
      method: 'GET',
      url: '/leads',
    });
  }

  public async getMyLeads() {
    return this.request({
      method: 'GET',
      url: '/leads/my',
    });
  }

  public async getLead(id: number) {
    return this.request({
      method: 'GET',
      url: `/leads/${id}`,
    });
  }

  public async createLead(leadData: any) {
    return this.request({
      method: 'POST',
      url: '/leads',
      data: leadData,
    });
  }

  public async updateLead(id: number, leadData: any) {
    return this.request({
      method: 'PUT',
      url: `/leads/${id}`,
      data: leadData,
    });
  }

  public async updateLeadStatus(id: number, status: string) {
    return this.request({
      method: 'PATCH',
      url: `/leads/${id}/status`,
      data: { status },
    });
  }

  public async convertLeadToCustomer(id: number) {
    return this.request({
      method: 'POST',
      url: `/leads/${id}/convert`,
    });
  }

  public async deleteLead(id: number) {
    return this.request({
      method: 'DELETE',
      url: `/leads/${id}`,
    });
  }

  // Message methods
  public async getMessages() {
    return this.request({
      method: 'GET',
      url: '/messages',
    });
  }

  public async getConversation(userId: number) {
    return this.request({
      method: 'GET',
      url: `/messages/conversation/${userId}`,
    });
  }

  public async getUnreadCount() {
    return this.request({
      method: 'GET',
      url: '/messages/unread',
    });
  }

  public async sendMessage(receiverId: number, content: string) {
    return this.request({
      method: 'POST',
      url: '/messages',
      data: { receiverId, content },
    });
  }

  public async markMessageAsRead(messageId: number) {
    return this.request({
      method: 'PATCH',
      url: `/messages/${messageId}/read`,
    });
  }

  public async deleteMessage(messageId: number) {
    return this.request({
      method: 'DELETE',
      url: `/messages/${messageId}`,
    });
  }
}

export const api = new ApiService();

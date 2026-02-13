// API Service for Smart Gold Backend
const API_BASE_URL = 'http://localhost:5000/api/v1';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Set auth token in localStorage
  setToken(token) {
    localStorage.setItem('token', token);
  }

  // Remove auth token
  removeToken() {
    localStorage.removeItem('token');
    sessionStorage.clear();
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(nic, password) {
    console.log('🔐 API login called with NIC:', nic);
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ nic, password }),
    });

    console.log('✅ Login response received:', response);

    if (response.success && response.data.token) {
      // Store token
      this.setToken(response.data.token);
      
      // Store user info in sessionStorage for compatibility
      const user = response.data.user;
      sessionStorage.setItem('userRole', user.primaryRole);
      sessionStorage.setItem('userId', user.userId);
      sessionStorage.setItem('userNIC', user.nic);
      sessionStorage.setItem('userName', user.fullName);
      
      // Store complete user data
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('✅ User data stored. Primary role:', user.primaryRole);
    }

    return response;
  }

  async getMe() {
    return await this.request('/auth/me', {
      method: 'GET',
    });
  }

  async changePassword(currentPassword, newPassword) {
    return await this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Logout
  logout() {
    this.removeToken();
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }

  // Get current user from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

// Export singleton instance
export default new ApiService();

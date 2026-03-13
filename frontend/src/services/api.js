// API Service for Smart Gold Backend
const API_BASE_URL = 'http://localhost:5000/api/v1';
const CUSTOMER_API_URL = 'http://localhost:5000/api/customer';

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

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
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

  async registerLookup(nic) {
    return await this.post('/auth/register/lookup', { nic });
  }

  async register(nic, password) {
    return await this.post('/auth/register', { nic, password });
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

  // ========== STAFF CUSTOMERS ==========

  async searchStaffCustomers(query) {
    const q = encodeURIComponent(query.trim());
    return this.get(`/staff/customers/search?q=${q}`);
  }

  async getStaffCustomerById(customerId) {
    return this.get(`/staff/customers/${customerId}`);
  }

  async getStaffCustomerInquiry(customerId) {
    return this.get(`/staff/customers/${customerId}/inquiry`);
  }

  // ========== CUSTOMER RATING (Staff) ==========

  async getCustomerRating(customerId) {
    return this.get(`/staff/customers/${customerId}/rating`);
  }

  async getCustomerRatingPreview(customerId, requestedAmount) {
    return this.post(`/staff/customers/${customerId}/rating/preview`, {
      requestedAmount: parseFloat(requestedAmount),
    });
  }

  // ========== STAFF APPOINTMENTS ==========

  async getStaffAppointments({ branchId, date, status, page, limit }) {
    const params = new URLSearchParams();
    if (branchId) params.set('branch_id', branchId);
    if (date) params.set('date', date);
    if (status && status !== 'all') params.set('status', status);
    if (page) params.set('page', page);
    if (limit) params.set('limit', limit);
    const qs = params.toString();
    return this.get(`/staff/appointments${qs ? `?${qs}` : ''}`);
  }

  async updateStaffAppointmentStatus(appointmentId, { action, note }) {
    return this.request(`/staff/appointments/${appointmentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ action, note }),
    });
  }

  async getStaffAppointmentBranches() {
    return this.get('/staff/appointments/branches');
  }

  // ========== MANAGER ==========

  async getManagerDashboard(params = {}) {
    const search = new URLSearchParams();
    if (params.from) search.set('from', params.from);
    if (params.to) search.set('to', params.to);
    const qs = search.toString();
    const res = await this.get(`/manager/dashboard${qs ? `?${qs}` : ''}`);
    return res;
  }

  async getManagerReversePawningList() {
    const res = await this.get('/manager/reverse-pawning');
    return res;
  }

  async createManagerReversePawning({ receiptNo, reason }) {
    const res = await this.post('/manager/reverse-pawning', { receiptNo, reason });
    return res;
  }

  async searchStaffPawnTickets(searchTerm, reversibleOnly = false) {
    if (!searchTerm || String(searchTerm).trim().length < 2) {
      return { data: { total: 0, tickets: [] } };
    }
    const q = encodeURIComponent(searchTerm.trim());
    const params = reversibleOnly ? '?reversibleOnly=true' : '';
    const res = await this.get(`/staff/pawn-tickets/search/${q}${params}`);
    return res;
  }

  // ========== PAYMENTS (Staff) ==========

  // Get ticket by receipt number (with payment summary)
  async getTicketByReceipt(receiptNo) {
    const res = await this.get(`/staff/pawn-tickets/by-receipt/${encodeURIComponent(receiptNo)}`);
    return res;
  }

  // Part payment
  async processPartPayment(ticketId, { amount, paymentMethod, note }) {
    const res = await this.post(`/staff/pawn-tickets/${ticketId}/part-payment`, {
      amount: parseFloat(amount),
      paymentMethod: paymentMethod || 'CASH',
      note: note || null
    });
    return res;
  }

  // Renewal (interest payment + extend due date)
  async processRenewal(ticketId, { paymentMethod, renewalMonths, note }) {
    const res = await this.post(`/staff/pawn-tickets/${ticketId}/renewal`, {
      paymentMethod: paymentMethod || 'CASH',
      renewalMonths: parseInt(renewalMonths, 10),
      note: note || null
    });
    return res;
  }

  // Full redemption (close ticket)
  async processRedemption(ticketId, { amount, paymentMethod, note }) {
    const res = await this.post(`/staff/pawn-tickets/${ticketId}/redemption`, {
      amount: parseFloat(amount),
      paymentMethod: paymentMethod || 'CASH',
      note: note || null
    });
    return res;
  }

  // ========== CUSTOMER ENDPOINTS (use /api/customer) ==========

  async customerRequest(endpoint, options = {}) {
    const url = `${CUSTOMER_API_URL}${endpoint}`;
    const token = this.getToken();
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Request failed');
    return data;
  }

  // Customer dashboard
  async getCustomerDashboard() {
    return this.customerRequest('/dashboard');
  }

  // Customer profile
  async getCustomerProfile() {
    return this.customerRequest('/profile');
  }

  async updateCustomerProfile(data) {
    return this.customerRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Customer appointments
  async getCustomerAppointments() {
    return this.customerRequest('/appointments');
  }

  async createCustomerAppointment(payload) {
    return this.customerRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getCustomerSlotAvailability(branchId, date) {
    const params = new URLSearchParams({ branch_id: branchId, date })
    return this.customerRequest(`/appointments/slot-availability?${params}`)
  }

  async getCustomerBranches() {
    return this.customerRequest('/branches');
  }

  // Customer notifications
  async getCustomerNotifications() {
    return this.customerRequest('/notifications');
  }

  // Get customer's active receipts
  async getCustomerReceipts() {
    return this.customerRequest('/receipts');
  }

  // Get receipt detail with payment summary (for part payment)
  async getCustomerReceiptDetail(receiptNo) {
    return this.customerRequest(`/receipts/${encodeURIComponent(receiptNo)}`);
  }

  // Log OTP to backend (for dev - prints in backend console)
  async logOtp(purpose, otp) {
    try {
      await this.customerRequest('/otp/log', {
        method: 'POST',
        body: JSON.stringify({ purpose, otp }),
      });
    } catch (_) {
      // Fire-and-forget; don't block UI on log failure
    }
  }

  // Customer part payment
  async customerPartPayment(ticketId, { amount, paymentMethod, note }) {
    return this.customerRequest(`/tickets/${ticketId}/part-payment`, {
      method: 'POST',
      body: JSON.stringify({
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || 'ONLINE',
        note: note || null,
      }),
    });
  }
}

// Export singleton instance
export default new ApiService();

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://housewise-backend.onrender.com/api';

// Create axios instance for admin API
const adminAPI = axios.create({
  baseURL: `${API_BASE_URL.replace('/api', '')}/api/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
adminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminAPIService = {
  // Authentication - Admin login goes through normal auth endpoint
  login: async (credentials) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    if (response.data.success && response.data.data.isAdmin) {
      localStorage.setItem('adminToken', response.data.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
  },

  // Dashboard
  getOverview: async () => {
    const response = await adminAPI.get('/overview');
    return response.data;
  },

  // Customers
  getCustomers: async (params = {}) => {
    const response = await adminAPI.get('/customers', { params });
    return response.data;
  },

  toggleCustomerStatus: async (customerId) => {
    const response = await adminAPI.put(`/customers/${customerId}/toggle`);
    return response.data;
  },

  // Providers
  getPendingProviders: async (params = {}) => {
    const response = await adminAPI.get('/providers/pending', { params });
    return response.data;
  },

  getApprovedProviders: async (params = {}) => {
    const response = await adminAPI.get('/providers/approved', { params });
    return response.data;
  },

  approveProvider: async (providerId) => {
    const response = await adminAPI.put(`/providers/${providerId}/approve`);
    return response.data;
  },

  rejectProvider: async (providerId) => {
    const response = await adminAPI.put(`/providers/${providerId}/reject`);
    return response.data;
  },

  toggleProviderStatus: async (providerId) => {
    const response = await adminAPI.put(`/providers/${providerId}/toggle`);
    return response.data;
  },

  // Bookings
  getBookings: async (params = {}) => {
    const response = await adminAPI.get('/bookings', { params });
    return response.data;
  },

  updateBookingStatus: async (bookingId, status) => {
    const response = await adminAPI.put(`/bookings/${bookingId}/status`, { status });
    return response.data;
  },

  // Reviews
  getReviews: async (params = {}) => {
    const response = await adminAPI.get('/reviews', { params });
    return response.data;
  },

  flagReview: async (reviewId, flagged) => {
    const response = await adminAPI.put(`/reviews/${reviewId}/flag`, { flagged });
    return response.data;
  },

  deleteReview: async (reviewId) => {
    const response = await adminAPI.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Settings
  changePassword: async (passwordData) => {
    const response = await adminAPI.post('/settings/password', passwordData);
    return response.data;
  },
};

// Admin auth utilities
export const adminAuth = {
  isAuthenticated: () => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    return !!(token && user);
  },

  getUser: () => {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem('adminToken');
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }
};

export default adminAPIService;

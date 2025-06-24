import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://housewise-backend.onrender.com/api',
  timeout: 30000, // Increased to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getHousewives: (params) => api.get('/users/housewives', { params }),
  getHousewifeById: (id) => api.get(`/users/housewives/${id}`),
  getDashboard: () => api.get('/users/dashboard'),
  deactivateAccount: () => api.post('/users/deactivate'),
};

// Services API
export const servicesAPI = {
  getServices: (params) => api.get('/services', { params }),
  getServiceById: (id) => api.get(`/services/${id}`),
  createService: (serviceData) => api.post('/services', serviceData),
  updateService: (id, serviceData) => api.put(`/services/${id}`, serviceData),
  deleteService: (id) => api.delete(`/services/${id}`),
  getMyServices: (params) => api.get('/services/my-services', { params }),
  getServicesByProvider: (providerId, params) => api.get(`/services/by-provider/${providerId}`, { params }),
  getCategories: () => api.get('/services/categories'),
  getFeaturedServices: (params) => api.get('/services/featured', { params }),
};

// Bookings API
export const bookingsAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getBookings: (params) => api.get('/bookings', { params }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  updateBookingStatus: (id, statusData) => api.put(`/bookings/${id}/status`, statusData),
};

// Reviews API
export const reviewsAPI = {
  createReview: (reviewData) => api.post('/reviews', reviewData),
  getServiceReviews: (serviceId, params) => api.get(`/reviews/service/${serviceId}`, { params }),
  getProviderReviews: (providerId, params) => api.get(`/reviews/provider/${providerId}`, { params }),
  markReviewHelpful: (reviewId) => api.post(`/reviews/${reviewId}/helpful`),
  removeHelpfulVote: (reviewId) => api.delete(`/reviews/${reviewId}/helpful`),
  addProviderResponse: (reviewId, responseData) => api.post(`/reviews/${reviewId}/response`, responseData),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (userId, statusData) => api.put(`/admin/users/${userId}/status`, statusData),
  getServices: (params) => api.get('/admin/services', { params }),
  approveService: (serviceId, approvalData) => api.put(`/admin/services/${serviceId}/approve`, approvalData),
  getBookings: (params) => api.get('/admin/bookings', { params }),
};

// Provider API endpoints
export const providerAPI = {
  // Profile management
  getProfile: () => api.get('/provider/profile'),
  updateProfile: (profileData) => {
    const formData = new FormData();

    // Handle file upload
    if (profileData.profileImage && profileData.profileImage instanceof File) {
      formData.append('profileImage', profileData.profileImage);
      delete profileData.profileImage;
    }

    // Append other data
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== null && profileData[key] !== undefined) {
        if (typeof profileData[key] === 'object') {
          formData.append(key, JSON.stringify(profileData[key]));
        } else {
          formData.append(key, profileData[key]);
        }
      }
    });

    return api.put('/provider/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Service management
  createService: (serviceData) => {
    const formData = new FormData();

    // Handle multiple image uploads
    if (serviceData.images && serviceData.images.length > 0) {
      serviceData.images.forEach(image => {
        if (image instanceof File) {
          formData.append('images', image);
        }
      });
      delete serviceData.images;
    }

    // Append other data
    Object.keys(serviceData).forEach(key => {
      if (serviceData[key] !== null && serviceData[key] !== undefined) {
        if (typeof serviceData[key] === 'object') {
          formData.append(key, JSON.stringify(serviceData[key]));
        } else {
          formData.append(key, serviceData[key]);
        }
      }
    });

    return api.post('/provider/services', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  getMyServices: (params = {}) => api.get('/provider/services', { params }),

  updateService: (serviceId, serviceData) => {
    const formData = new FormData();

    // Handle multiple image uploads
    if (serviceData.images && serviceData.images.length > 0) {
      serviceData.images.forEach(image => {
        if (image instanceof File) {
          formData.append('images', image);
        }
      });
      delete serviceData.images;
    }

    // Append other data
    Object.keys(serviceData).forEach(key => {
      if (serviceData[key] !== null && serviceData[key] !== undefined) {
        if (typeof serviceData[key] === 'object') {
          formData.append(key, JSON.stringify(serviceData[key]));
        } else {
          formData.append(key, serviceData[key]);
        }
      }
    });

    return api.put(`/provider/services/${serviceId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteService: (serviceId) => api.delete(`/provider/services/${serviceId}`),

  // Booking management
  getMyBookings: (params = {}) => api.get('/provider/bookings', { params }),
  updateBookingStatus: (bookingId, statusData) =>
    api.put(`/provider/bookings/${bookingId}/status`, statusData),

  // Dashboard
  getDashboard: () => api.get('/provider/dashboard'),

  // Availability
  toggleAvailability: (isAvailable) =>
    api.put('/provider/availability', { isAvailable })
};

// Customer API endpoints
export const customerAPI = {
  // Dashboard
  getDashboard: () => api.get('/customer/dashboard'),

  // Profile management
  getProfile: () => api.get('/customer/profile'),
  updateProfile: (profileData) => {
    const formData = new FormData();

    // Handle file upload
    if (profileData.profileImage && profileData.profileImage instanceof File) {
      formData.append('profileImage', profileData.profileImage);
    }

    // Handle other profile data
    Object.keys(profileData).forEach(key => {
      if (key !== 'profileImage') {
        if (typeof profileData[key] === 'object' && profileData[key] !== null) {
          formData.append(key, JSON.stringify(profileData[key]));
        } else {
          formData.append(key, profileData[key]);
        }
      }
    });

    return api.put('/customer/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Booking management
  getBookings: (params = {}) => api.get('/customer/bookings', { params }),
  getBookingById: (bookingId) => api.get(`/customer/bookings/${bookingId}`),
  createBooking: (bookingData) => api.post('/customer/bookings', bookingData),
  cancelBooking: (bookingId, reason) =>
    api.put(`/customer/bookings/${bookingId}/cancel`, { reason }),

  // Provider details
  getProviderDetails: (providerId) => api.get(`/customer/providers/${providerId}`),

  // Reviews
  createReview: (reviewData) => api.post('/customer/reviews', reviewData),
  getMyReviews: (params = {}) => api.get('/customer/reviews', { params })
};

// Utility functions
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || 'An error occurred';
  } else if (error.request) {
    // Request was made but no response received
    return 'Network error. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Clear all browser cache and storage
export const clearBrowserCache = () => {
  // Clear specific auth-related items first
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');

  // Clear all localStorage
  localStorage.clear();

  // Clear sessionStorage
  sessionStorage.clear();

  // Clear cookies (if any)
  try {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  } catch (error) {
    console.error('Error clearing cookies:', error);
  }

  // Clear browser cache if supported
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach(name => {
        caches.delete(name);
      });
    }).catch(error => {
      console.error('Error clearing cache:', error);
    });
  }
};

export default api;

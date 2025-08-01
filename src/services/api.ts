import axios from 'axios';
import {
  FeedbackForm,
  CreateFeedbackFormData,
  FeedbackResponse,
  FormAnalytics,
  QuestionAnalytics,
  Notification,
  FormSummary,
  SubmitFeedbackData
} from '../types';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      // Only redirect if not already on login page or public routes
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/feedback/')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/api/auth/login/', { username, password });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/api/auth/logout/');
    return response.data;
  },
  
  // Get current user info
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/user/');
    return response.data;
  },
};

// Forms API
export const formsAPI = {
  // Get all forms
  getForms: async (): Promise<FeedbackForm[]> => {
    const response = await api.get('/api/forms/');
    return response.data.results || response.data;
  },
  
  // Get a specific form
  getForm: async (id: string): Promise<FeedbackForm> => {
    const response = await api.get(`/api/forms/${id}/`);
    return response.data;
  },
  
  // Create a new form
  createForm: async (data: CreateFeedbackFormData): Promise<FeedbackForm> => {
    const response = await api.post('/api/forms/', data);
    return response.data;
  },
  
  // Update a form
  updateForm: async (id: string, data: Partial<CreateFeedbackFormData>): Promise<FeedbackForm> => {
    const response = await api.patch(`/api/forms/${id}/`, data);
    return response.data;
  },
  
  // Delete a form
  deleteForm: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/api/forms/${id}/`);
    return response.data;
  },
  
  // Get form analytics
  getFormAnalytics: async (id: string): Promise<FormAnalytics> => {
    const response = await api.get(`/api/forms/${id}/analytics/`);
    return response.data;
  },
  
  // Get question analytics
  getQuestionAnalytics: async (id: string): Promise<QuestionAnalytics[]> => {
    const response = await api.get(`/api/forms/${id}/question_analytics/`);
    return response.data.results || response.data;
  },
};

// Public Feedback API (for users submitting feedback)
export const publicFeedbackAPI = {
  // Get list of all public forms
  getPublicForms: async (): Promise<FeedbackForm[]> => {
    const response = await api.get('/api/public/forms/');
    return response.data;
  },
  
  // Get form for public access
  getPublicForm: async (formId: string): Promise<FeedbackForm> => {
    const response = await api.get(`/api/public/feedback/${formId}/`);
    return response.data;
  },
  
  // Submit feedback response
  submitFeedback: async (formId: string, data: SubmitFeedbackData): Promise<{ message: string; response_id: string }> => {
    const response = await api.post(`/api/public/feedback/${formId}/`, data);
    return response.data;
  },
  
  // Get public response details
  getPublicResponse: async (responseId: string): Promise<FeedbackResponse> => {
    const response = await api.get(`/api/public/response/${responseId}/`);
    return response.data;
  },
};

// Responses API
export const responsesAPI = {
  // Get all responses
  getResponses: async (): Promise<FeedbackResponse[]> => {
    const response = await api.get('/api/responses/');
    return response.data.results || response.data;
  },
  
  // Get a specific response
  getResponse: async (id: string): Promise<FeedbackResponse> => {
    const response = await api.get(`/api/responses/${id}/`);
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  // Get all notifications
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/api/notifications/');
    return response.data.results || response.data;
  },
  
  // Get unread count
  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    const response = await api.get('/api/notifications/unread_count/');
    return response.data;
  },
  
  // Mark notification as read
  markAsRead: async (id: number): Promise<{ status: string }> => {
    const response = await api.post(`/api/notifications/${id}/mark_as_read/`);
    return response.data;
  },
  
  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ status: string }> => {
    const response = await api.post('/api/notifications/mark_all_as_read/');
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  // Get dashboard summary data
  getSummary: async (): Promise<FormSummary> => {
    const response = await api.get('/api/dashboard/summary/');
    return response.data;
  },
};

export default api;
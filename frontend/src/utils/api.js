import axios from 'axios';

// Create a configured axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to inject the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
      // Hard redirect to login page if we get a 401 on an API call
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// User Profile endpoints
export const getProfile = () => api.get('/api/users/profile');
export const updateProfile = (data) => api.put('/api/users/profile', data);

// Bug endpoints
export const deleteBug = (id) => api.delete(`/api/bugs/${id}`);

// Comment endpoints
export const getComments = (bugId) => api.get(`/api/bugs/${bugId}/comments`);
export const addComment = (bugId, text) => api.post(`/api/bugs/${bugId}/comments`, { text });

// Attachment endpoints
export const uploadAttachment = (bugId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/api/bugs/${bugId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Analytics endpoints
export const getAnalyticsSummary = () => api.get('/api/analytics/summary');

// Notification endpoints
export const getNotifications = () => api.get('/api/notifications');
export const markNotificationRead = (id) => api.put(`/api/notifications/${id}/read`);

// Project endpoints
export const getProjects = () => api.get('/api/projects');
export const createProject = (data) => api.post('/api/projects', data);

// Sprint endpoints
export const getSprintsByProject = (projectId) => api.get(`/api/sprints/project/${projectId}`);
export const createSprint = (projectId, data) => api.post(`/api/sprints/project/${projectId}`, data);
export const updateSprintStatus = (sprintId, status) => api.put(`/api/sprints/${sprintId}/status?status=${status}`);
export const assignBugToSprint = (sprintId, bugId) => api.post(`/api/sprints/${sprintId}/bugs/${bugId}`);

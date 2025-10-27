// client/src/lib/api.js

import axios from 'axios';

// --- IMPORTANT: Update this URL for deployment! ---
const API_BASE_URL = 'https://skillshare-backend-g5b7.onrender.com/api'; 
// ---------------------------------------------------

// 1. Create a new Axios instance with CORS credentials
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ✅ This enables CORS with credentials
  headers: {
    'Content-Type': 'application/json',
  }
});

// 2. Add a request interceptor (Attaches JWT Token)
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If the token exists, add it to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Optional: Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 4. API definitions

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

export const userAPI = {
  getMe: () => api.get('/users/me'),
  getUser: (id) => api.get(`/users/${id}`),
  updateMe: (updatedData) => api.put('/users/me', updatedData),
  searchUsers: (params) => api.get('/users/search', { params }),
  // Export the raw API instance for external use (like in PrivateChat to fetch history)
  api: api, 
};

export const projectAPI = {
  getProjects: () => api.get('/projects'), 
  getProjectsForUser: () => api.get('/projects/me'), 
  createProject: (projectData) => api.post('/projects', projectData),
  joinProject: (id) => api.post(`/projects/${id}/join`),
};

export const skillAPI = {
  getAllSkillTags: () => api.get('/skills/tags'),
};

export const sessionAPI = {
  createSession: (sessionData) => api.post('/sessions', sessionData),
  getSessionsForUser: () => api.get('/sessions/me'),
  getAllPublicSessions: () => api.get('/sessions/public'),
  joinSession: (id) => api.post(`/sessions/${id}/join`),
};

export const serviceAPI = {
    getAllServices: () => api.get('/services'),
    createService: (data) => api.post('/services', data),
    purchaseService: (id) => api.post(`/services/${id}/purchase`),
    getServiceById: (id) => api.get(`/services/${id}`),
};

export default api;
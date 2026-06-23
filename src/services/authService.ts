import axios from 'axios';

const API_URL = import.meta.env['VITE_API_URL'] || 'http://localhost:3001/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  title?: string;
  specialty?: string;
  institution?: string;
  licenseNumber?: string;
  role: string;
  emailVerified: boolean;
  profileImageUrl?: string;
  createdAt?: string;
  lastLoginAt?: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  title?: string;
  specialty?: string;
  institution?: string;
  licenseNumber?: string;
}

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { token } = response.data.data;
          localStorage.setItem('auth_token', token);

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('refresh_token');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    return response.data.data;
  },

  /**
   * Login user
   */
  async login(email: string, password: string, rememberMe: boolean = false): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
      rememberMe,
    });
    return response.data.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put('/users/me', data);
    return response.data.data;
  },

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/users/me/password', {
      currentPassword,
      newPassword,
    });
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    await axios.post(`${API_URL}/auth/forgot-password`, { email });
  },

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await axios.post(`${API_URL}/auth/reset-password`, {
      token,
      newPassword,
    });
  },

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    await axios.post(`${API_URL}/auth/verify-email`, { token });
  },

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<any> {
    const response = await api.get('/users/me/preferences');
    return response.data.data;
  },

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: any): Promise<any> {
    const response = await api.put('/users/me/preferences', preferences);
    return response.data.data;
  },

  /**
   * Get active sessions
   */
  async getSessions(): Promise<any[]> {
    const response = await api.get('/users/me/sessions');
    return response.data.data;
  },

  /**
   * Revoke a session
   */
  async revokeSession(sessionId: string): Promise<void> {
    await api.delete(`/users/me/sessions/${sessionId}`);
  },
};

export default authService;

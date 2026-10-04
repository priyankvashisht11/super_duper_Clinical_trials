import axios from 'axios';

const API_URL = import.meta.env['VITE_API_URL'] || 'http://localhost:3001/api';

// Auth tokens live only in httpOnly cookies now (set by the backend on login/register/
// refresh) — never in localStorage or JS-readable state. This closes the XSS-can-steal-
// the-token gap: any script injected into the page simply cannot read an httpOnly cookie.
// `withCredentials` makes the browser send/receive those cookies on every request below.
axios.defaults.withCredentials = true;

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

// Create axios instance — auth is carried by the httpOnly cookies set by the backend,
// so no request interceptor is needed to attach a token.
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// On a 401, try refreshing the access-token cookie once (refresh token cookie carries
// the request automatically) and retry the original call.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear cached user display info and redirect to login.
        localStorage.removeItem('auth_user');
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
    const response = await axios.post(`${API_URL}/auth/register`, data, { withCredentials: true });
    return response.data.data;
  },

  /**
   * Login user
   */
  async login(email: string, password: string, rememberMe: boolean = false): Promise<AuthResponse> {
    const response = await axios.post(
      `${API_URL}/auth/login`,
      { email, password, rememberMe },
      { withCredentials: true }
    );
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

import axios from 'axios';

const API_URL = import.meta.env['VITE_API_URL'] || 'http://localhost:3001/api';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  priority: string;
  createdAt: string;
  readAt?: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  page: number;
  totalPages: number;
}

// Create axios instance with auth token
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const notificationService = {
  /**
   * Get notifications
   */
  async getNotifications(page: number = 1, limit: number = 20, unreadOnly: boolean = false): Promise<NotificationsResponse> {
    const response = await api.get('/notifications', {
      params: { page, limit, unreadOnly },
    });
    return response.data.data;
  },

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/notifications/unread-count');
    return response.data.data.count;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/mark-all-read');
  },

  /**
   * Delete notification
   */
  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },

  /**
   * Create notification (for testing)
   */
  async createNotification(data: {
    type: string;
    title: string;
    message: string;
    link?: string;
    priority?: string;
  }): Promise<Notification> {
    const response = await api.post('/notifications', data);
    return response.data.data;
  },
};

export default notificationService;

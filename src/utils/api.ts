import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { LeaveRequest, LeaveBalance, PublicHoliday, User} from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const createApiClient = () => {
  const { user } = useAuth();

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  api.interceptors.request.use((config) => {
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  });

  return api;
};

export const useApi = () => {
  const api = createApiClient();

  return {
    // Leave Requests
    getLeaveRequests: async () => {
      const response = await api.get<LeaveRequest[]>('/leave-requests');
      return response.data;
    },

    createLeaveRequest: async (data: Omit<LeaveRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
      const response = await api.post<LeaveRequest>('/leaves', data);
      return response.data;
    },

    updateLeaveRequest: async (id: string, data: Partial<LeaveRequest>) => {
      const response = await api.put<LeaveRequest>(`/leave-requests/${id}`, data);
      return response.data;
    },

    // Leave Balance
    getLeaveBalance: async () => {
      const response = await api.get<LeaveBalance[]>('/leave-balance');
      return response.data;
    },

    updateLeaveBalance: async (data: Partial<LeaveBalance>) => {
      const response = await api.put<LeaveBalance>('/leave-balance', data);
      return response.data;
    },

    // Public Holidays
    getPublicHolidays: async () => {
      const response = await api.get<PublicHoliday[]>('/public-holidays');
      return response.data;
    },

    createPublicHoliday: async (data: Omit<PublicHoliday, 'id'>) => {
      const response = await api.post<PublicHoliday>('/public-holidays', data);
      return response.data;
    },

    updatePublicHoliday: async (id: string, data: Partial<PublicHoliday>) => {
      const response = await api.put<PublicHoliday>(`/public-holidays/${id}`, data);
      return response.data;
    },

    deletePublicHoliday: async (id: string) => {
      await api.delete(`/public-holidays/${id}`);
    },

    // Notifications
    getNotifications: async () => {
      const response = await api.get('/notifications');
      return response.data;
    },

    markNotificationAsRead: async (id: string) => {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    },

    // Users
    getUsers: async () => {
      const response = await api.get<User[]>('/users');
      return response.data;
    },

    updateUser: async (id: string, data: Partial<User>) => {
      const response = await api.put<User>(`/users/${id}`, data);
      return response.data;
    },
  };
};

export const fetchLeaveRequests = async () => {
    const response = await axios.get('/api/leaves');
    return response.data;
};

export const updateLeaveRequestStatus = async (id: string, status: string, data: { comments: string }) => {
    const endpoint = status === 'APPROVED' ? `/api/leaves/${id}/approve` : `/api/leaves/${id}/reject`;
    const response = await axios.put(endpoint, data);
    return response.data;
};

// Function to fetch user roles
export const fetchUserRoles = async () => {
    const response = await fetch('/api/users/roles', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user roles');
    }

    return response.json();
};

// Function to update a user's role
export const updateUserRole = async (userId: number, newRole: string) => {
    const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
    });

    if (!response.ok) {
        throw new Error('Failed to update user role');
    }

    return response.json();
};
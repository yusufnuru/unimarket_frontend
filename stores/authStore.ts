import { defineStore } from 'pinia';
import type { LoginSchema, RegisterSchema, Role, VerificationCodeSchema } from '@/types/auth';
import { resetStores } from './resetStores';

interface AuthState {
  isAuthenticated: boolean;
  role: Role | null;
  userId: string | null;
}

export interface AuthResponseMessage {
  message: string;
}

interface RegisteredUser extends AuthResponseMessage {
  user: {
    id: string;
    email: string;
    role: Role;
  };
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: false,
    userId: null,
    role: null,
  }),

  actions: {
    async login(values: LoginSchema): Promise<AuthResponseMessage> {
      const api = useApi();
      const response = await api.post('/auth/login', values, { withCredentials: true });
      await this.fetchUserInfo(); // Fetch user role after
      return response.data as AuthResponseMessage;
    },

    async register(values: RegisterSchema): Promise<RegisteredUser> {
      const api = useApi();
      const response = await api.post('/auth/register', values, { withCredentials: true });
      return response.data as RegisteredUser;
    },

    async refresh(): Promise<void> {
      try {
        const api = useApi();
        await api.get('/auth/refresh', { withCredentials: true });
        await this.fetchUserInfo(); // Fetch user role after login
      } catch (error) {
        console.error('Refresh failed:', error);
        throw error;
      }
    },

    async logout(): Promise<void> {
      try {
        const api = useApi();
        await api.get('/auth/logout', { withCredentials: true });
      } finally {
        resetStores(); // Reset all stores
      }
    },

    async fetchUserInfo(): Promise<void> {
      try {
        const api = useApi();
        const response = await api.get('/auth/me', { withCredentials: true }); // Add this endpoint to the backend
        this.isAuthenticated = true;
        this.userId = response.data.userId;
        this.role = response.data.role;
      } catch (error) {
        this.isAuthenticated = false;
        this.userId = null;
        this.role = null;
        await this.logout();
        throw error;
      }
    },

    async verifyEmail(code: VerificationCodeSchema): Promise<AuthResponseMessage> {
      const api = useApi();
      const response = await api.get(`/auth/email/verify/${code}`);
      await this.fetchUserInfo();
      return response.data as AuthResponseMessage;
    },
  },

  persist: true,
});

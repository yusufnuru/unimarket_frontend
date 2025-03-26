import { defineStore } from 'pinia';
import { loginSchema, registerSchema, verificationCodeSchema } from '@/schemas/auth';
import type { AxiosResponse } from 'axios';

interface AuthState {
  isAuthenticated: boolean;
  role: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: false,
    role: null,
  }),

  actions: {
    async login(values: loginSchema): Promise<AxiosResponse> {
      try {
        const api = useApi();
        const response = await api.post('/auth/login', values, { withCredentials: true });
        await this.fetchUserInfo(); // Fetch user role after
        return response;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },

    async register(values: registerSchema): Promise<AxiosResponse> {
      try {
        const api = useApi();
        const response = await api.post('/auth/register', values, { withCredentials: true });
        return response;
      } catch (error) {
        console.error(error);
        throw error;
      }
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
        // Hit logout endpoint; backend clears HTTP-only cookie
        const api = useApi();
        await api.get('/auth/logout', { withCredentials: true });
        this.isAuthenticated = false;
        this.role = null;
      } catch (error) {
        console.error('Logout failed:', error);
        throw error;
      }
    },

    async fetchUserInfo(): Promise<void> {
      const api = useApi();
      try {
        const response = await api.get('/auth/me', { withCredentials: true }); // Add this endpoint to backend

        this.isAuthenticated = true;
        this.role = response.data.role || null;
      } catch (error) {
        this.isAuthenticated = false;
        this.role = null;
        throw error;
      }
    },

    async verifyEmail(code: verificationCodeSchema): Promise<void> {
      const api = useApi();
      try {
        const response = await api.get(`/auth/email/verify/${code}`, { withCredentials: true }); // Add this endpoint to backend
        console.log(response);
        await this.fetchUserInfo();
      } catch (error) {
        this.isAuthenticated = false;
        this.role = null;
        throw error;
      }
    },
  },

  persist: true,
});

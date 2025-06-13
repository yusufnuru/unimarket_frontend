import { defineStore } from 'pinia';
import type {
  AuthResponseMessage,
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
  Role,
  VerificationCodeSchema,
} from '@/types/auth';
import { resetStores } from './resetStores';

interface RegisteredUser extends AuthResponseMessage {
  user: {
    id: string;
    email: string;
    role: Role;
  };
}

interface AuthState {
  isAuthenticated: boolean;
  role: Role | null;
  userId: string | null;
  profileId?: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: false,
    userId: null,
    role: null,
    profileId: null,
  }),

  actions: {
    async login(values: LoginSchema): Promise<AuthResponseMessage> {
      const api = useApi();
      const chatStore = useChatStore();
      const response = await api.post('/auth/login', values, { withCredentials: true });
      await this.fetchUserInfo(); // Fetch user role after
      chatStore.initializeSocket(); // Initialize chat socket after login
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
      const router = useRouter();
      const chatStore = useChatStore();
      try {
        const api = useApi();
        await api.get('/auth/logout', { withCredentials: true });
      } finally {
        resetStores(); // Reset all stores
        chatStore.socket?.disconnect(); // Disconnect chat socket
        await router.push('/');
      }
    },

    async fetchUserInfo(): Promise<void> {
      try {
        const api = useApi();
        const response = await api.get('/auth/me', { withCredentials: true }); // Add this endpoint to the backend
        this.isAuthenticated = true;
        this.userId = response.data.user.id;
        this.role = response.data.user.role;
        this.profileId = response.data.user.profileId;
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

    async forgotPassword(values: ForgotPasswordSchema): Promise<AuthResponseMessage> {
      const api = useApi();
      const response = await api.post('/auth/password/forgot', values);
      return response.data as AuthResponseMessage;
    },

    async resetPassword(values: ResetPasswordSchema): Promise<AuthResponseMessage> {
      const api = useApi();
      const response = await api.post('/auth/password/reset', values);
      await this.logout();
      return response.data as AuthResponseMessage;
    },
  },

  persist: true,
});

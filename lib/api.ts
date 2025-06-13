import axios, { AxiosError, type AxiosInstance } from 'axios';
import { useAuthStore } from '@/stores/authStore'; // Adjust based on your store setup

export const ERROR_MESSAGES = {
  TOKEN_EXPIRED: 'Token expired',
};

const skipRefreshEndpoints = [
  '/auth/login',
  '/auth/refresh',
  '/auth/logout',
  '/password/reset',
  '/password/forgot',
];

export function createApi(baseURL: string): AxiosInstance {
  const api = axios.create({
    baseURL,
    withCredentials: true,
  });

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      if (!error.response || error.response.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      if (skipRefreshEndpoints.some((endpoint) => originalRequest.url?.includes(endpoint))) {
        return Promise.reject(error);
      }

      const errorMessage = (error.response.data as any)?.message;
      const isTokenExpired =
        error.response.status === 401 && errorMessage === ERROR_MESSAGES.TOKEN_EXPIRED;

      if (!isTokenExpired) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      const auth = useAuthStore();
      try {
        await auth.refresh(); // Refresh token
        return api(originalRequest); // Retry original request
      } catch (refreshError) {
        await auth.logout();
        return Promise.reject(refreshError);
      }
    },
  );

  return api;
}

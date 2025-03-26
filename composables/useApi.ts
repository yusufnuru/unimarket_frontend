import axios, { AxiosError, type AxiosInstance } from 'axios';

const ERROR_MESSAGES = {
  TOKEN_EXPIRED: 'Token expired',
  INVALID_TOKEN: 'Invalid token',
  NOT_AUTHORIZED: 'Not authorized',
};

export function createApi(baseURL: string): AxiosInstance {
  const api: AxiosInstance = axios.create({
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

      const skipRefreshEndpoints = [
        '/auth/login',
        '/auth/refresh',
        '/auth/logout',
        '/password/reset',
        '/password/forgot',
      ];

      if (skipRefreshEndpoints.some((endpoint) => originalRequest.url?.includes(endpoint))) {
        return Promise.reject(error);
      }

      const errorMessage = (error.response.data as any)?.message;
      const isTokenExpired = errorMessage === ERROR_MESSAGES.TOKEN_EXPIRED;

      if (!isTokenExpired) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        await axios.get(`${baseURL}/auth/refresh`, {
          withCredentials: true,
        });
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    },
  );

  return api;
}

export function useApi(): AxiosInstance {
  return createApi('http://localhost:4000');
}

import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError } from './errors';
import { logger } from '@/shared/logger';

export function applyRequestInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Token injection placeholder — will call authService.refreshToken() in Phase 10
      // const token = await authService.refreshToken();
      // if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error: unknown) => {
      logger.error('Request interceptor error', error);
      return Promise.reject(error);
    },
  );
}

export function applyResponseInterceptors(client: AxiosInstance): void {
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: unknown) => {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response: { status: number; data?: { error?: { code?: string; message?: string } } } };
        const status = axiosError.response.status;
        const serverMessage = axiosError.response.data?.error?.message ?? 'Request failed.';
        const serverCode = axiosError.response.data?.error?.code;

        if (status === 400) throw new ApiError('BAD_REQUEST', serverMessage, status, serverCode);
        if (status === 401) throw new ApiError('UNAUTHORIZED', 'Unauthorized.', status);
        if (status === 403) throw new ApiError('FORBIDDEN', 'Access denied.', status);
        if (status === 404) throw new ApiError('NOT_FOUND', 'Resource not found.', status);
        if (status === 422) throw new ApiError('VALIDATION_ERROR', serverMessage, status, serverCode);
        if (status >= 500) throw new ApiError('SERVER_ERROR', 'Server error. Please try again.', status);
      }

      if (typeof error === 'object' && error !== null && 'request' in error) {
        throw new ApiError('NETWORK_ERROR', 'Network error. Please check your connection.');
      }

      throw new ApiError('UNKNOWN', 'An unexpected error occurred.');
    },
  );
}

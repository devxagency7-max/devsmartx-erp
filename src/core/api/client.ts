import axios from 'axios';
import { environment } from '@/core/config/environment';
import { applyRequestInterceptors, applyResponseInterceptors } from './interceptors';

const apiClient = axios.create({
  baseURL: environment.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

applyRequestInterceptors(apiClient);
applyResponseInterceptors(apiClient);

export { apiClient };

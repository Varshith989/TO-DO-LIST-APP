import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Android APK network configuration:
 * - On your local Wi-Fi: http://192.168.29.198:5000/api (routes directly to your PC)
 * - On Android Emulator: http://10.0.2.2:5000/api
 * - Via USB adb reverse: http://127.0.0.1:5000/api
 */
export const DEFAULT_API_URL = Platform.select({
  android: 'http://192.168.29.198:5000/api',
  ios: 'http://localhost:5000/api',
  default: 'http://localhost:5000/api',
});

const api = axios.create({
  baseURL: DEFAULT_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const STORAGE_KEYS = {
  TOKEN: '@taskmaster_token',
  USER: '@taskmaster_user',
  THEME: '@taskmaster_theme',
  API_URL: '@taskmaster_api_url',
};

// Request Interceptor: inject custom server URL and Bearer token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const [token, customUrl] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.API_URL),
      ]);

      if (customUrl) {
        config.baseURL = customUrl;
      }

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('[API Interceptor] Failed to read storage:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle global auth errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
      } catch {}
    }
    return Promise.reject(error);
  }
);

export default api;

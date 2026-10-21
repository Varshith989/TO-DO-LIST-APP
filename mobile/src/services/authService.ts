import api, { STORAGE_KEYS } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IUser, AuthResponse } from '../types/user';

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', { name, email, password });
    if (response.data.token && response.data.user) {
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    if (response.data.token && response.data.user) {
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async getMe(): Promise<IUser> {
    const response = await api.get<{ success: boolean; user: IUser }>('/auth/me');
    return response.data.user;
  },

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
  },
};

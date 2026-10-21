import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signOut } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { IUser } from '../types/user';
import { authService } from '../services/authService';
import { STORAGE_KEYS } from '../services/api';

interface AuthState {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  setSession: (token: string, user: IUser) => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  clearError: () => set({ error: null }),

  setSession: async (token: string, user: IUser) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
      ]);
      set({ token, user, isLoading: false, error: null });
    } catch (e) {
      console.warn('[useAuthStore] Failed to save session:', e);
      set({ token, user, isLoading: false });
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const [token, userStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);

      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ token, user, isInitialized: true, isLoading: false });
        // Silently verify if local backend is being used
        try {
          const freshUser = await authService.getMe();
          set({ user: freshUser });
          await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(freshUser));
        } catch {
          // Token expired or running with Firebase/Demo session
        }
      } else {
        set({ token: null, user: null, isInitialized: true, isLoading: false });
      }
    } catch {
      set({ token: null, user: null, isInitialized: true, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const res = await authService.login(email, password);
      if (res.token && res.user) {
        set({ token: res.token, user: res.user, isLoading: false });
        return true;
      }
      set({ isLoading: false, error: 'Login failed: missing data' });
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      set({ isLoading: false, error: msg });
      return false;
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const res = await authService.register(name, email, password);
      if (res.token && res.user) {
        set({ token: res.token, user: res.user, isLoading: false });
        return true;
      }
      set({ isLoading: false, error: 'Registration failed' });
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      set({ isLoading: false, error: msg });
      return false;
    }
  },

  logout: async () => {
    try {
      try {
        await signOut(getAuth());
      } catch {}
      try {
        await GoogleSignin.signOut();
      } catch {}
      await authService.logout();
    } finally {
      set({ token: null, user: null });
    }
  },
}));

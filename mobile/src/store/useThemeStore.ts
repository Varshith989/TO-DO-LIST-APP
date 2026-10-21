import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../services/api';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  initTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: true, // Default to sleek dark mode

  initTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      if (savedTheme !== null) {
        set({ isDark: savedTheme === 'dark' });
      }
    } catch {}
  },

  toggleTheme: async () => {
    const nextTheme = !get().isDark;
    set({ isDark: nextTheme });
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, nextTheme ? 'dark' : 'light');
    } catch {}
  },
}));

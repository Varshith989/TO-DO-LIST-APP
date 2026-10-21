import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useThemeStore } from './src/store/useThemeStore';

export default function App(): React.JSX.Element {
  const isDark = useThemeStore((s) => s.isDark);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0B0F19' : '#F8FAFC'}
      />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme/theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const theme = getTheme(isDark);

  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const authError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    clearError();
    if (!validate()) return;
    await login(email.trim(), password);
  };

  const handleDemoFill = () => {
    setEmail('demo.engineer@taskmaster.dev');
    setPassword('Password123!');
    setValidationErrors({});
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Top Header & Theme Switch */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <Text style={styles.logoEmoji}>⚡</Text>
            <Text style={[styles.brandTitle, { color: theme.colors.text }]}>TASKMASTER</Text>
          </View>
          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.themeBtn, { backgroundColor: isDark ? '#1F2937' : '#F1F5F9' }]}
          >
            <Text style={styles.themeEmoji}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroSection}>
          <Text style={[styles.title, theme.typography.h1, { color: theme.colors.text }]}>
            Welcome Back
          </Text>
          <Text
            style={[
              styles.subtitle,
              theme.typography.body,
              { color: theme.colors.textSecondary },
            ]}
          >
            Sign in to access your high-priority engineering tasks and smart workflows.
          </Text>
        </View>

        {/* Form Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? theme.colors.card : theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {authError ? (
            <View style={[styles.errorBanner, { backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2' }]}>
              <Text style={[styles.errorBannerText, { color: '#EF4444' }]}>
                ⚠️ {authError}
              </Text>
            </View>
          ) : null}

          <Input
            label="Email Address"
            placeholder="developer@company.com"
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
              if (validationErrors.email) setValidationErrors((e) => ({ ...e, email: undefined }));
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            error={validationErrors.email}
          />

          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              if (validationErrors.password) setValidationErrors((e) => ({ ...e, password: undefined }));
            }}
            isPassword
            error={validationErrors.password}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            variant="primary"
            style={styles.loginBtn}
          />

          {/* Quick Demo Autofill */}
          <Button
            title="Quick Demo Autofill"
            onPress={handleDemoFill}
            variant="secondary"
            style={styles.demoBtn}
          />

          {/* Sign Up Link */}
          <View style={styles.switchAuthRow}>
            <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[theme.typography.bodyBold, { color: theme.colors.primary }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  themeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeEmoji: {
    fontSize: 16,
  },
  heroSection: {
    marginBottom: 28,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 22,
  },
  card: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  errorBanner: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loginBtn: {
    marginTop: 8,
    height: 50,
  },
  demoBtn: {
    marginTop: 12,
    height: 48,
  },
  switchAuthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
});

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

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const isDark = useThemeStore((s) => s.isDark);
  const theme = getTheme(isDark);

  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const authError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    clearError();
    if (!validate()) return;
    await register(name.trim(), email.trim(), password);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Back Link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.backLink}
        >
          <Text style={[styles.backArrow, { color: theme.colors.primary }]}>‹</Text>
          <Text style={[theme.typography.captionBold, { color: theme.colors.primary, marginLeft: 4 }]}>
            BACK TO LOGIN
          </Text>
        </TouchableOpacity>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={[styles.title, theme.typography.h1, { color: theme.colors.text }]}>
            Create Account
          </Text>
          <Text
            style={[
              styles.subtitle,
              theme.typography.body,
              { color: theme.colors.textSecondary },
            ]}
          >
            Start tracking assignments, setting smart deadlines, and organizing your priorities.
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
            label="Full Name"
            placeholder="Ada Lovelace"
            value={name}
            onChangeText={(txt) => {
              setName(txt);
              if (errors.name) setErrors((e) => ({ ...e, name: '' }));
            }}
            error={errors.name}
          />

          <Input
            label="Email Address"
            placeholder="ada@domain.com"
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
              if (errors.email) setErrors((e) => ({ ...e, email: '' }));
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              if (errors.password) setErrors((e) => ({ ...e, password: '' }));
            }}
            isPassword
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={(txt) => {
              setConfirmPassword(txt);
              if (errors.confirmPassword) setErrors((e) => ({ ...e, confirmPassword: '' }));
            }}
            isPassword
            error={errors.confirmPassword}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            variant="primary"
            style={styles.submitBtn}
          />

          <View style={styles.switchAuthRow}>
            <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[theme.typography.bodyBold, { color: theme.colors.primary }]}>
                Sign In
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
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backArrow: {
    fontSize: 26,
    lineHeight: 26,
  },
  heroSection: {
    marginBottom: 24,
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
  submitBtn: {
    marginTop: 8,
    height: 50,
  },
  switchAuthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
});

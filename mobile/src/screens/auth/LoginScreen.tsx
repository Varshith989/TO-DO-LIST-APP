import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  signInAnonymously,
  GoogleAuthProvider,
  updateProfile,
} from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { AuthStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../store/useAuthStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme/theme';
import { Input } from '../../components/common/Input';
import { WEB_CLIENT_ID, PROJECT_ID } from '../../firebase/config';

// Compatibility shim for auth.GoogleAuthProvider.credential(idToken)
const authHelper = {
  GoogleAuthProvider,
};

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = () => {
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const theme = getTheme(isDark);

  const setSession = useAuthStore((s) => s.setSession);
  const authLogin = useAuthStore((s) => s.login);
  const authRegister = useAuthStore((s) => s.register);
  const setDemoTasks = useTaskStore((s) => s.setDemoTasks);

  // Tab mode: 'signin' | 'register'
  const [mode, setMode] = useState<'signin' | 'register'>('signin');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo.engineer@taskmaster.dev');
  const [password, setPassword] = useState('Password123!');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  // Configure Google Sign-In with Web Client ID from config/google-services.json
  useEffect(() => {
    try {
      GoogleSignin.configure({
        webClientId: WEB_CLIENT_ID,
        offlineAccess: false,
      });
    } catch (e) {
      console.warn('[GoogleSignin] configure error:', e);
    }
  }, []);

  const switchMode = (newMode: 'signin' | 'register') => {
    setMode(newMode);
    setErrorMessage(null);
    setValidationErrors({});
    if (newMode === 'register' && email === 'demo.engineer@taskmaster.dev') {
      setEmail('');
      setPassword('');
    }
  };

  const validate = (): boolean => {
    const errors: { name?: string; email?: string; password?: string } = {};

    if (mode === 'register' && !name.trim()) {
      errors.name = 'Full name is required';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Map Firebase errors to friendly messages
  const getFriendlyErrorMessage = (error: any): string => {
    const code = error?.code || '';
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'Incorrect email or password. Please try again.';
      case 'auth/user-not-found':
        return 'No account found with this email address. Try creating an account.';
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'The email address format is not valid.';
      case 'auth/network-request-failed':
        return 'Network connection error. Check your internet connection.';
      case 'auth/operation-not-allowed':
        return 'Email/Password sign-in is not enabled in Firebase Console.';
      default:
        return error?.message || 'Authentication failed. Please try again.';
    }
  };

  // Handle Email/Password Sign-In or Registration
  const handleEmailAuth = async () => {
    setErrorMessage(null);
    if (!validate()) return;

    setIsLoading(true);
    const cleanEmail = email.trim();

    try {
      const fbAuth = getAuth();
      if (mode === 'signin') {
        try {
          const userCred = await signInWithEmailAndPassword(fbAuth, cleanEmail, password);
          const fbUser = userCred.user;
          const token = (await fbUser.getIdToken()) || fbUser.uid;
          await setSession(token, {
            id: fbUser.uid,
            name: fbUser.displayName || cleanEmail.split('@')[0],
            email: fbUser.email || cleanEmail,
          });
          return;
        } catch (fbErr: any) {
          // If Firebase Auth operation-not-allowed or user-not-found, try backend auth fallback
          if (
            fbErr?.code === 'auth/operation-not-allowed' ||
            fbErr?.code === 'auth/configuration-not-found'
          ) {
            const ok = await authLogin(cleanEmail, password);
            if (ok) return;
          }
          throw fbErr;
        }
      } else {
        // Register mode
        try {
          const userCred = await createUserWithEmailAndPassword(fbAuth, cleanEmail, password);
          const fbUser = userCred.user;
          if (name.trim()) {
            await updateProfile(fbUser, { displayName: name.trim() });
          }
          const token = (await fbUser.getIdToken()) || fbUser.uid;
          await setSession(token, {
            id: fbUser.uid,
            name: name.trim() || cleanEmail.split('@')[0],
            email: fbUser.email || cleanEmail,
          });
          return;
        } catch (fbErr: any) {
          if (
            fbErr?.code === 'auth/operation-not-allowed' ||
            fbErr?.code === 'auth/configuration-not-found'
          ) {
            const ok = await authRegister(name.trim(), cleanEmail, password);
            if (ok) return;
          }
          throw fbErr;
        }
      }
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign-In with auth.GoogleAuthProvider.credential(idToken)
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();

      // Support various versions of @react-native-google-signin/google-signin
      const idToken =
        signInResult?.data?.idToken || (signInResult as any)?.idToken;

      if (!idToken) {
        throw new Error('Google Sign-In failed: No ID token returned.');
      }

      // Create Firebase credential using auth.GoogleAuthProvider.credential(idToken)
      const googleCredential = authHelper.GoogleAuthProvider.credential(idToken);
      const fbAuth = getAuth();
      const userCredential = await signInWithCredential(fbAuth, googleCredential);
      const fbUser = userCredential.user;

      const token = (await fbUser.getIdToken()) || fbUser.uid;
      await setSession(token, {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Engineer',
        email: fbUser.email || '',
      });
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the login dialog
        return;
      }
      if (err.code === statusCodes.IN_PROGRESS) {
        return;
      }
      if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setErrorMessage('Google Play Services is not available or outdated on this device.');
        return;
      }
      if (err.code === '10' || err.message?.includes('DEVELOPER_ERROR')) {
        setErrorMessage(
          'Google Sign-In setup error (DEVELOPER_ERROR): Verify SHA-1 fingerprint in Firebase Console.'
        );
        return;
      }
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Handle 1-Click Instant Demo Login (matches web app)
  const handleDemoLogin = async () => {
    setErrorMessage(null);
    setIsDemoLoading(true);

    try {
      // 1. Try Firebase anonymous authentication if enabled
      try {
        const fbAuth = getAuth();
        const anonCred = await signInAnonymously(fbAuth);
        const fbUser = anonCred.user;
        const token = (await fbUser.getIdToken()) || fbUser.uid;
        await setSession(token, {
          id: fbUser.uid,
          name: 'Demo Lead Engineer',
          email: 'demo.engineer@taskmaster.dev',
        });
        setDemoTasks();
        return;
      } catch {
        // Fall back to instant offline/fixed demo user matching the web app
      }

      // 2. Fixed demo account session
      await setSession('demo-token-' + Date.now(), {
        id: 'demo-engineer-uid',
        name: 'Demo Lead Engineer',
        email: 'demo.engineer@taskmaster.dev',
      });
      setDemoTasks();
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[
        styles.container,
        { backgroundColor: isDark ? '#090D16' : '#EEF2FF' },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header with Theme Switcher */}
        <View style={styles.topBar}>
          <View style={styles.brandBadge}>
            <View style={styles.brandBadgeDot} />
            <Text style={[styles.brandBadgeText, { color: isDark ? '#C7D2FE' : '#4338CA' }]}>
              v1.0 Mobile
            </Text>
          </View>

          <TouchableOpacity
            onPress={toggleTheme}
            activeOpacity={0.8}
            style={[
              styles.themeBtn,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
              },
            ]}
          >
            <Text style={styles.themeEmoji}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>

        {/* Centered Login Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0',
            },
          ]}
        >
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            {/* Gradient Shield Icon */}
            <View style={styles.shieldGradient}>
              <View style={styles.shieldInner}>
                <Text style={styles.shieldIconText}>🛡️</Text>
              </View>
            </View>

            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              TaskMaster Pro
            </Text>

            {/* Cloud Sync Status line */}
            <View style={styles.syncRow}>
              <View style={styles.pulseDot} />
              <Text style={styles.syncTitle}>Firebase Cloud Sync</Text>
              <Text style={[styles.syncProject, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                {PROJECT_ID}
              </Text>
            </View>
          </View>

          {/* Segmented Toggle: Sign In | Create Account */}
          <View
            style={[
              styles.segmentedContainer,
              {
                backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                borderColor: isDark ? '#334155' : '#E2E8F0',
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => switchMode('signin')}
              activeOpacity={0.85}
              style={[
                styles.segmentTab,
                mode === 'signin' && styles.segmentTabActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentTabText,
                  mode === 'signin'
                    ? styles.segmentTabTextActive
                    : { color: isDark ? '#94A3B8' : '#64748B' },
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => switchMode('register')}
              activeOpacity={0.85}
              style={[
                styles.segmentTab,
                mode === 'register' && styles.segmentTabActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentTabText,
                  mode === 'register'
                    ? styles.segmentTabTextActive
                    : { color: isDark ? '#94A3B8' : '#64748B' },
                ]}
              >
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Banner */}
          {errorMessage ? (
            <View style={[styles.alertBox, { backgroundColor: isDark ? '#450A0A' : '#FEF2F2' }]}>
              <Text style={styles.alertIcon}>⚠️</Text>
              <Text style={[styles.alertText, { color: isDark ? '#FCA5A5' : '#DC2626' }]}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {/* Form Fields */}
          {mode === 'register' ? (
            <Input
              label="FULL NAME"
              placeholder="Alex Mercer"
              value={name}
              onChangeText={(txt) => {
                setName(txt);
                if (validationErrors.name) setValidationErrors((e) => ({ ...e, name: undefined }));
              }}
              autoCapitalize="words"
              error={validationErrors.name}
            />
          ) : null}

          <Input
            label="EMAIL ADDRESS"
            placeholder="alex@example.com"
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
            label={mode === 'register' ? 'PASSWORD (MIN. 6 CHARACTERS)' : 'PASSWORD'}
            placeholder="••••••••"
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              if (validationErrors.password) {
                setValidationErrors((e) => ({ ...e, password: undefined }));
              }
            }}
            isPassword
            error={validationErrors.password}
          />

          {/* Primary Action Button */}
          <TouchableOpacity
            onPress={handleEmailAuth}
            disabled={isLoading || isGoogleLoading || isDemoLoading}
            activeOpacity={0.85}
            style={[
              styles.primaryBtn,
              (isLoading || isGoogleLoading || isDemoLoading) && styles.btnDisabled,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.btnRow}>
                <Text style={styles.primaryBtnText}>
                  {mode === 'signin' ? 'Sign In with Email' : 'Create Account'}
                </Text>
                <Text style={styles.arrowIcon}>→</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* OR SIGN IN WITH Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]} />
            <Text
              style={[
                styles.dividerText,
                {
                  color: isDark ? '#64748B' : '#94A3B8',
                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                },
              ]}
            >
              OR SIGN IN WITH
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]} />
          </View>

          {/* Continue with Google Button */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading || isDemoLoading}
            activeOpacity={0.85}
            style={[
              styles.googleBtn,
              {
                backgroundColor: '#FFFFFF',
                borderColor: '#CBD5E1',
              },
              isGoogleLoading && styles.btnDisabled,
            ]}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color="#0F172A" size="small" />
            ) : (
              <View style={styles.btnRow}>
                {/* Multi-color Google Logo Badge */}
                <View style={styles.googleIconBadge}>
                  <Text style={styles.googleG}>G</Text>
                </View>
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* 1-Click Instant Demo / Preview Mode Button */}
          <TouchableOpacity
            onPress={handleDemoLogin}
            disabled={isLoading || isGoogleLoading || isDemoLoading}
            activeOpacity={0.85}
            style={[
              styles.demoBtn,
              {
                backgroundColor: isDark ? '#1E293B' : '#FEF3C7',
                borderColor: isDark ? '#334155' : '#FDE68A',
              },
            ]}
          >
            {isDemoLoading ? (
              <ActivityIndicator color={isDark ? '#FCD34D' : '#92400E'} size="small" />
            ) : (
              <View style={styles.btnRow}>
                <Text style={styles.demoBolt}>⚡</Text>
                <Text
                  style={[
                    styles.demoBtnText,
                    { color: isDark ? '#FCD34D' : '#92400E' },
                  ]}
                >
                  1-Click Instant Demo / Preview Mode
                </Text>
              </View>
            )}
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 32,
    flexGrow: 1,
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  brandBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366F1',
    marginRight: 6,
  },
  brandBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  themeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeEmoji: {
    fontSize: 16,
  },
  card: {
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  shieldGradient: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 6,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  shieldInner: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldIconText: {
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginRight: 6,
  },
  syncTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
    marginRight: 6,
  },
  syncProject: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
  },
  segmentedContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentTabActive: {
    backgroundColor: '#4F46E5',
    elevation: 2,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  segmentTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  segmentTabTextActive: {
    color: '#FFFFFF',
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  alertIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  alertText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  primaryBtn: {
    backgroundColor: '#4F46E5',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 4,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  arrowIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 6,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 10,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  googleBtn: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  googleIconBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  googleG: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  googleBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  demoBtn: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBolt: {
    fontSize: 14,
    marginRight: 6,
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

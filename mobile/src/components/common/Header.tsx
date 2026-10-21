import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getTheme } from '../../theme/theme';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  rightAction,
}) => {
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = getTheme(isDark);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? theme.colors.background : theme.colors.surface,
          borderBottomColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.leftRow}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.backBtn}>
            <Text style={[styles.backArrow, { color: theme.colors.primary }]}>‹</Text>
          </TouchableOpacity>
        ) : null}

        <View>
          {title ? (
            <Text style={[theme.typography.h2, { color: theme.colors.text }]}>{title}</Text>
          ) : (
            <>
              <Text style={[theme.typography.captionBold, { color: theme.colors.primary }]}>
                TASKMASTER PRO
              </Text>
              <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
                Hello, {user?.name ? user.name.split(' ')[0] : 'Engineer'} 👋
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.rightRow}>
        {rightAction ? (
          rightAction
        ) : (
          <>
            {/* Theme Toggle */}
            <TouchableOpacity
              onPress={toggleTheme}
              style={[
                styles.iconBtn,
                { backgroundColor: isDark ? '#1F2937' : '#F1F5F9' },
              ]}
              accessibilityLabel="Toggle Theme"
            >
              <Text style={styles.btnEmoji}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>

            {/* Logout button */}
            {!showBack && (
              <TouchableOpacity
                onPress={logout}
                style={[
                  styles.iconBtn,
                  { backgroundColor: isDark ? '#1F2937' : '#F1F5F9', marginLeft: 8 },
                ]}
                accessibilityLabel="Logout"
              >
                <Text style={styles.btnEmoji}>🚪</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 12,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 32,
    lineHeight: 32,
    fontWeight: '300',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnEmoji: {
    fontSize: 16,
  },
});

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  leftIcon,
  isPassword = false,
  secureTextEntry,
  value,
  ...props
}) => {
  const isDark = useThemeStore((s) => s.isDark);
  const theme = getTheme(isDark);
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isSecured = isPassword && !showPassword;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text
          style={[
            theme.typography.captionBold,
            { color: error ? theme.colors.danger : theme.colors.textSecondary, marginBottom: 6 },
          ]}
        >
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? theme.colors.card : theme.colors.surface,
            borderColor: error
              ? theme.colors.danger
              : isFocused
              ? theme.colors.borderFocused
              : theme.colors.border,
            borderRadius: theme.borderRadius.md,
            paddingHorizontal: theme.spacing.md,
          },
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={isSecured}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={value}
          style={[
            styles.input,
            theme.typography.body,
            { color: theme.colors.text },
          ]}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.eyeToggle}
          >
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '600' }}>
              {showPassword ? 'HIDE' : 'SHOW'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text style={[styles.errorText, theme.typography.caption, { color: theme.colors.danger }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    height: 52,
  },
  leftIconContainer: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  eyeToggle: {
    paddingHorizontal: 8,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
  },
});

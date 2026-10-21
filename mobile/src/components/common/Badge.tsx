import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { TaskPriority } from '../../types/task';
import { colors } from '../../theme/colors';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme/theme';
import { getDeadlineStatus } from '../../utils/dateUtils';

interface PriorityBadgeProps {
  priority: TaskPriority;
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'small',
  style,
}) => {
  const isDark = useThemeStore((s) => s.isDark);
  const cfg = colors.priority[priority] || colors.priority.medium;

  const bg = isDark ? cfg.darkBg : cfg.bg;
  const textColor = cfg.color;

  return (
    <View
      style={[
        styles.pill,
        size === 'small' ? styles.smallPill : styles.mediumPill,
        { backgroundColor: bg },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: textColor }]} />
      <Text
        style={[
          size === 'small' ? styles.smallText : styles.mediumText,
          { color: textColor },
        ]}
      >
        {cfg.label.toUpperCase()}
      </Text>
    </View>
  );
};

interface DeadlineBadgeProps {
  deadline: string;
  style?: ViewStyle;
}

export const DeadlineBadge: React.FC<DeadlineBadgeProps> = ({ deadline, style }) => {
  const isDark = useThemeStore((s) => s.isDark);
  const theme = getTheme(isDark);
  const status = getDeadlineStatus(deadline);

  let bg = isDark ? '#1E293B' : '#F1F5F9';
  let text = theme.colors.textSecondary;

  if (status.isOverdue) {
    bg = isDark ? '#7F1D1D' : '#FEE2E2';
    text = '#EF4444';
  } else if (status.urgencyLevel === 'critical') {
    bg = isDark ? '#7C2D12' : '#FFEDD5';
    text = '#F97316';
  } else if (status.urgencyLevel === 'warning') {
    bg = isDark ? '#78350F' : '#FEF3C7';
    text = '#F59E0B';
  }

  return (
    <View style={[styles.pill, styles.smallPill, { backgroundColor: bg }, style]}>
      <Text style={[styles.smallText, { color: text, fontWeight: '600' }]}>
        ⏰ {status.text}
      </Text>
    </View>
  );
};

interface CategoryBadgeProps {
  category: string;
  style?: ViewStyle;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, style }) => {
  const isDark = useThemeStore((s) => s.isDark);
  const theme = getTheme(isDark);

  return (
    <View
      style={[
        styles.pill,
        styles.smallPill,
        {
          backgroundColor: isDark ? '#1F2937' : '#E2E8F0',
        },
        style,
      ]}
    >
      <Text style={[styles.smallText, { color: theme.colors.textSecondary }]}>
        #{category}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  smallPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  mediumPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  smallText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  mediumText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

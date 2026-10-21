import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TaskPriority } from '../../types/task';
import { colors } from '../../theme/colors';
import { useThemeStore } from '../../store/useThemeStore';

interface PrioritySelectorProps {
  value: TaskPriority;
  onChange: (priority: TaskPriority) => void;
}

const PRIORITIES: TaskPriority[] = ['urgent', 'high', 'medium', 'low'];

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({ value, onChange }) => {
  const isDark = useThemeStore((s) => s.isDark);

  return (
    <View style={styles.container}>
      {PRIORITIES.map((p) => {
        const isSelected = value === p;
        const cfg = colors.priority[p];
        const activeBg = isDark ? cfg.darkBg : cfg.bg;

        return (
          <TouchableOpacity
            key={p}
            activeOpacity={0.8}
            onPress={() => onChange(p)}
            style={[
              styles.pill,
              {
                backgroundColor: isSelected
                  ? activeBg
                  : isDark
                  ? '#1F2937'
                  : '#F1F5F9',
                borderColor: isSelected ? cfg.color : 'transparent',
                borderWidth: isSelected ? 2 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: isSelected ? cfg.color : isDark ? '#6B7280' : '#94A3B8' },
              ]}
            />
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? cfg.color : isDark ? '#9CA3AF' : '#64748B',
                  fontWeight: isSelected ? '700' : '500',
                },
              ]}
            >
              {cfg.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 3,
    borderRadius: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  label: {
    fontSize: 13,
  },
});

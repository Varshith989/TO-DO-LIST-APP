import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { ITask } from '../../types/task';
import { colors } from '../../theme/colors';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme/theme';
import { PriorityBadge, DeadlineBadge, CategoryBadge } from '../common/Badge';

interface TaskCardProps {
  task: ITask;
  onPress: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onToggle,
  onDelete,
}) => {
  const isDark = useThemeStore((s) => s.isDark);
  const theme = getTheme(isDark);

  const priorityColor = colors.priority[task.priority]?.color || theme.colors.primary;

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.cardContainer,
        {
          backgroundColor: isDark ? theme.colors.card : theme.colors.surface,
          borderColor: isDark ? theme.colors.border : '#E2E8F0',
          shadowColor: theme.colors.shadow,
          opacity: task.isCompleted ? 0.75 : 1,
        },
      ]}
    >
      {/* Left Priority Accent Bar */}
      <View style={[styles.priorityStripe, { backgroundColor: priorityColor }]} />

      <View style={styles.content}>
        {/* Top Meta Row */}
        <View style={styles.topRow}>
          <View style={styles.badgeRow}>
            <PriorityBadge priority={task.priority} size="small" />
            <DeadlineBadge deadline={task.deadline} style={{ marginLeft: 6 }} />
          </View>

          {/* Composite score pill if present */}
          {task.compositeScore !== undefined && !task.isCompleted && (
            <View style={[styles.scorePill, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
              <Text style={[styles.scoreText, { color: theme.colors.textSecondary }]}>
                ⚡ {Math.round(task.compositeScore)} pts
              </Text>
            </View>
          )}
        </View>

        {/* Task Title & Checkbox */}
        <View style={styles.mainRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onToggle}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[
              styles.checkbox,
              {
                borderColor: task.isCompleted ? theme.colors.success : theme.colors.border,
                backgroundColor: task.isCompleted ? theme.colors.success : 'transparent',
              },
            ]}
          >
            {task.isCompleted && <Text style={styles.checkMark}>✓</Text>}
          </TouchableOpacity>

          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                theme.typography.bodyBold,
                {
                  color: task.isCompleted ? theme.colors.textMuted : theme.colors.text,
                  textDecorationLine: task.isCompleted ? 'line-through' : 'none',
                },
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>

            {task.description ? (
              <Text
                style={[
                  styles.description,
                  theme.typography.caption,
                  { color: theme.colors.textSecondary },
                ]}
                numberOfLines={2}
              >
                {task.description}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Bottom Tags and Delete Action */}
        <View style={styles.bottomRow}>
          <View style={styles.categoryRow}>
            {task.category?.map((cat, idx) => (
              <CategoryBadge key={`${cat}-${idx}`} category={cat} style={{ marginRight: 6 }} />
            ))}
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDeletePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.deleteBtn}
          >
            <Text style={[styles.trashIcon, { color: theme.colors.danger }]}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  priorityStripe: {
    width: 6,
  },
  content: {
    flex: 1,
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scorePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: '700',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
  },
  description: {
    marginTop: 4,
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  deleteBtn: {
    padding: 4,
  },
  trashIcon: {
    fontSize: 14,
  },
});

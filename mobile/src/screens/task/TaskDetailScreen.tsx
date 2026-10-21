import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { useTaskStore } from '../../store/useTaskStore';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme/theme';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { PriorityBadge, DeadlineBadge, CategoryBadge } from '../../components/common/Badge';
import { formatDateTime } from '../../utils/dateUtils';

type Props = NativeStackScreenProps<AppStackParamList, 'TaskDetail'>;

export const TaskDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { taskId } = route.params;
  const isDark = useThemeStore((s) => s.isDark);
  const theme = getTheme(isDark);

  const task = useTaskStore((s) => s.tasks.find((t) => t._id === taskId));
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header showBack onBack={() => navigation.goBack()} title="Task Details" />
        <View style={styles.notFoundContainer}>
          <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Task not found</Text>
          <Button
            title="Return to Home"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 16 }}
          />
        </View>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to permanently delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTask(task._id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Task Overview"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Badges */}
        <View style={styles.badgeRow}>
          <PriorityBadge priority={task.priority} size="medium" />
          <DeadlineBadge deadline={task.deadline} style={{ marginLeft: 8 }} />
        </View>

        {/* Title */}
        <Text
          style={[
            styles.title,
            theme.typography.h1,
            {
              color: task.isCompleted ? theme.colors.textMuted : theme.colors.text,
              textDecorationLine: task.isCompleted ? 'line-through' : 'none',
            },
          ]}
        >
          {task.title}
        </Text>

        {/* Status Pill Card */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: task.isCompleted
                ? isDark
                  ? '#064E3B'
                  : '#D1FAE5'
                : isDark
                ? '#1E293B'
                : '#EEF2FF',
              borderColor: task.isCompleted ? theme.colors.success : theme.colors.primary,
            },
          ]}
        >
          <Text style={styles.statusEmoji}>{task.isCompleted ? '✅' : '⏳'}</Text>
          <View style={styles.statusTextContainer}>
            <Text
              style={[
                styles.statusTitle,
                { color: task.isCompleted ? theme.colors.success : theme.colors.primary },
              ]}
            >
              {task.isCompleted ? 'Completed' : 'Active / In Progress'}
            </Text>
            <Text style={[styles.statusSubtitle, { color: theme.colors.textSecondary }]}>
              {task.isCompleted
                ? 'Great job! This task has been fulfilled.'
                : 'Pending completion before target deadline.'}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View
          style={[
            styles.detailCard,
            {
              backgroundColor: isDark ? theme.colors.card : theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.sectionHeading, theme.typography.captionBold, { color: theme.colors.textSecondary }]}>
            DESCRIPTION & NOTES
          </Text>
          <Text style={[styles.descriptionText, theme.typography.body, { color: theme.colors.text }]}>
            {task.description || 'No additional notes provided for this task.'}
          </Text>
        </View>

        {/* Schedule & Timing Info */}
        <View
          style={[
            styles.detailCard,
            {
              backgroundColor: isDark ? theme.colors.card : theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.sectionHeading, theme.typography.captionBold, { color: theme.colors.textSecondary }]}>
            SCHEDULE & TIMING
          </Text>

          <View style={styles.timeRow}>
            <Text style={styles.timeIcon}>📅</Text>
            <View>
              <Text style={[styles.timeLabel, { color: theme.colors.textSecondary }]}>Due Date</Text>
              <Text style={[styles.timeValue, { color: theme.colors.text }]}>
                {formatDateTime(task.dueDateTime)}
              </Text>
            </View>
          </View>

          <View style={[styles.timeRow, { marginTop: 12 }]}>
            <Text style={styles.timeIcon}>⏳</Text>
            <View>
              <Text style={[styles.timeLabel, { color: theme.colors.textSecondary }]}>Hard Cutoff Deadline</Text>
              <Text style={[styles.timeValue, { color: theme.colors.text }]}>
                {formatDateTime(task.deadline)}
              </Text>
            </View>
          </View>

          {task.compositeScore !== undefined && (
            <View style={[styles.timeRow, { marginTop: 12 }]}>
              <Text style={styles.timeIcon}>⚡</Text>
              <View>
                <Text style={[styles.timeLabel, { color: theme.colors.textSecondary }]}>Composite Urgency Score</Text>
                <Text style={[styles.timeValue, { color: theme.colors.primary }]}>
                  {Math.round(task.compositeScore)} points
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Tags */}
        <View
          style={[
            styles.detailCard,
            {
              backgroundColor: isDark ? theme.colors.card : theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.sectionHeading, theme.typography.captionBold, { color: theme.colors.textSecondary }]}>
            CATEGORIES
          </Text>
          <View style={styles.tagWrap}>
            {task.category?.map((cat, idx) => (
              <CategoryBadge key={`${cat}-${idx}`} category={cat} style={{ marginRight: 8, marginBottom: 4 }} />
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Button
            title={task.isCompleted ? 'Mark as Incomplete' : '✓ Mark as Completed'}
            onPress={() => toggleTask(task._id)}
            variant={task.isCompleted ? 'secondary' : 'primary'}
            style={styles.actionBtn}
          />

          <Button
            title="Edit Task Details"
            onPress={() => navigation.navigate('CreateEditTask', { task })}
            variant="outline"
            style={styles.actionBtn}
          />

          <Button
            title="Delete Task"
            onPress={handleDelete}
            variant="danger"
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notFoundContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    marginBottom: 16,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  statusEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  detailCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  sectionHeading: {
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  descriptionText: {
    lineHeight: 22,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionsContainer: {
    marginTop: 10,
    gap: 10,
  },
  actionBtn: {
    height: 50,
  },
});

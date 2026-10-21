import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { useTaskStore } from '../../store/useTaskStore';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme/theme';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { PrioritySelector } from '../../components/task/PrioritySelector';
import { DateTimePickerModal } from '../../components/task/DateTimePickerModal';
import { TaskPriority } from '../../types/task';

type Props = NativeStackScreenProps<AppStackParamList, 'CreateEditTask'>;

const PRESET_TAGS = ['Work', 'Personal', 'Fitness', 'Engineering', 'Finance', 'Design'];

export const CreateEditTaskScreen: React.FC<Props> = ({ navigation, route }) => {
  const isDark = useThemeStore((s) => s.isDark);
  const theme = getTheme(isDark);

  const existingTask = route.params?.task;
  const isEditMode = Boolean(existingTask);

  const createTask = useTaskStore((s) => s.createTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const isLoading = useTaskStore((s) => s.isLoading);

  // Form State
  const [title, setTitle] = useState(existingTask?.title || '');
  const [description, setDescription] = useState(existingTask?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(existingTask?.priority || 'medium');
  const [dueDateTime, setDueDateTime] = useState<Date>(
    existingTask ? new Date(existingTask.dueDateTime) : new Date(Date.now() + 24 * 3600 * 1000)
  );
  const [deadline, setDeadline] = useState<Date>(
    existingTask ? new Date(existingTask.deadline) : new Date(Date.now() + 48 * 3600 * 1000)
  );
  const [tags, setTags] = useState<string[]>(
    existingTask?.category && existingTask.category.length > 0
      ? existingTask.category
      : ['Work']
  );
  const [customTagInput, setCustomTagInput] = useState('');
  const [titleError, setTitleError] = useState('');

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      if (tags.length > 1) {
        setTags(tags.filter((t) => t !== tag));
      }
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setCustomTagInput('');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setTitleError('Task title is required');
      return;
    }

    if (isEditMode && existingTask) {
      const success = await updateTask(existingTask._id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDateTime: dueDateTime.toISOString(),
        deadline: deadline.toISOString(),
        category: tags,
      });
      if (success) navigation.goBack();
    } else {
      const success = await createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDateTime: dueDateTime.toISOString(),
        deadline: deadline.toISOString(),
        category: tags,
      });
      if (success) navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header
        title={isEditMode ? 'Edit Task' : 'New Task'}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Title Input */}
        <Input
          label="Task Title *"
          placeholder="e.g. Design new architecture spec"
          value={title}
          onChangeText={(txt) => {
            setTitle(txt);
            if (titleError) setTitleError('');
          }}
          error={titleError}
        />

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, theme.typography.captionBold, { color: theme.colors.textSecondary }]}>
            Description (Optional)
          </Text>
          <TextInput
            placeholder="Add context, acceptance criteria, or notes..."
            placeholderTextColor={theme.colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={[
              styles.textArea,
              theme.typography.body,
              {
                backgroundColor: isDark ? theme.colors.card : theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
          />
        </View>

        {/* Priority Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, theme.typography.captionBold, { color: theme.colors.textSecondary }]}>
            Priority Level
          </Text>
          <PrioritySelector value={priority} onChange={setPriority} />
        </View>

        {/* Date Time Pickers */}
        <DateTimePickerModal
          label="Target Due Date & Time"
          value={dueDateTime}
          onChange={setDueDateTime}
        />

        <DateTimePickerModal
          label="Hard Deadline (Cutoff)"
          value={deadline}
          onChange={setDeadline}
        />

        {/* Categories / Tags Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, theme.typography.captionBold, { color: theme.colors.textSecondary }]}>
            Categories & Tags
          </Text>

          {/* Preset Tag Pills */}
          <View style={styles.tagWrap}>
            {PRESET_TAGS.map((t) => {
              const isSelected = tags.includes(t);
              return (
                <TouchableOpacity
                  key={t}
                  activeOpacity={0.8}
                  onPress={() => toggleTag(t)}
                  style={[
                    styles.tagPill,
                    {
                      backgroundColor: isSelected
                        ? theme.colors.primary
                        : isDark
                        ? theme.colors.card
                        : theme.colors.surfaceSecondary,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      { color: isSelected ? '#FFFFFF' : theme.colors.textSecondary },
                    ]}
                  >
                    {isSelected ? '✓ ' : ''}{t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Tag Input */}
          <View style={styles.customTagRow}>
            <TextInput
              placeholder="Add custom tag..."
              placeholderTextColor={theme.colors.textMuted}
              value={customTagInput}
              onChangeText={setCustomTagInput}
              style={[
                styles.customTagField,
                {
                  backgroundColor: isDark ? theme.colors.card : theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              onSubmitEditing={handleAddCustomTag}
            />
            <Button
              title="+ Add"
              onPress={handleAddCustomTag}
              variant="secondary"
              style={styles.addTagBtn}
            />
          </View>
        </View>

        {/* Save Button */}
        <Button
          title={isEditMode ? 'Update Task' : 'Create Task'}
          onPress={handleSubmit}
          loading={isLoading}
          variant="primary"
          style={styles.saveBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  textArea: {
    height: 100,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    textAlignVertical: 'top',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  customTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customTagField: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    marginRight: 8,
    fontSize: 13,
  },
  addTagBtn: {
    height: 44,
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  saveBtn: {
    marginTop: 20,
    height: 52,
  },
});

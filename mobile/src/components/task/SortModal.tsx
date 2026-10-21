import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { TaskSortOption } from '../../types/task';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme/theme';

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  selectedSort: TaskSortOption;
  onSelectSort: (sort: TaskSortOption) => void;
}

interface SortOptionItem {
  id: TaskSortOption;
  title: string;
  subtitle: string;
  icon: string;
}

const SORT_OPTIONS: SortOptionItem[] = [
  {
    id: 'composite',
    title: 'Smart Composite Score',
    subtitle: 'Weighted algorithm factoring deadline urgency & priority',
    icon: '⚡',
  },
  {
    id: 'deadline',
    title: 'Deadline (Soonest First)',
    subtitle: 'Sort by nearest hard cutoff date',
    icon: '⏳',
  },
  {
    id: 'dueDateTime',
    title: 'Due Date (Soonest First)',
    subtitle: 'Sort by scheduled target completion date',
    icon: '📅',
  },
  {
    id: 'priority',
    title: 'Priority (Urgent → Low)',
    subtitle: 'Urgent, High, Medium, Low',
    icon: '🔥',
  },
  {
    id: 'createdAt',
    title: 'Recently Added',
    subtitle: 'Newest created tasks first',
    icon: '✨',
  },
];

export const SortModal: React.FC<SortModalProps> = ({
  visible,
  onClose,
  selectedSort,
  onSelectSort,
}) => {
  const isDark = useThemeStore((s) => s.isDark);
  const theme = getTheme(isDark);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: isDark ? theme.colors.card : theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.headerRow}>
                <Text style={[styles.title, theme.typography.h3, { color: theme.colors.text }]}>
                  Sort Tasks By
                </Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={[styles.closeIcon, { color: theme.colors.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.optionsList}>
                {SORT_OPTIONS.map((opt) => {
                  const isSelected = selectedSort === opt.id;

                  return (
                    <TouchableOpacity
                      key={opt.id}
                      activeOpacity={0.7}
                      onPress={() => {
                        onSelectSort(opt.id);
                        onClose();
                      }}
                      style={[
                        styles.optionRow,
                        {
                          backgroundColor: isSelected
                            ? isDark
                              ? '#1E293B'
                              : '#EEF2FF'
                            : 'transparent',
                          borderColor: isSelected ? theme.colors.primary : 'transparent',
                        },
                      ]}
                    >
                      <Text style={styles.optionIcon}>{opt.icon}</Text>
                      <View style={styles.optionTextContainer}>
                        <Text
                          style={[
                            styles.optionTitle,
                            {
                              color: isSelected ? theme.colors.primary : theme.colors.text,
                              fontWeight: isSelected ? '700' : '600',
                            },
                          ]}
                        >
                          {opt.title}
                        </Text>
                        <Text
                          style={[
                            styles.optionSubtitle,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          {opt.subtitle}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.radioCircle,
                          {
                            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                            backgroundColor: isSelected ? theme.colors.primary : 'transparent',
                          },
                        ]}
                      >
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  modalCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionsList: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  optionIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 11,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});

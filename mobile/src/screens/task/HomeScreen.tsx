import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { useTaskStore } from '../../store/useTaskStore';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme/theme';
import { Header } from '../../components/common/Header';
import { TaskCard } from '../../components/task/TaskCard';
import { CategoryChipGroup } from '../../components/task/CategoryChipGroup';
import { SortModal } from '../../components/task/SortModal';
import { FAB } from '../../components/common/FAB';
import { TaskCardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { TaskFilter, TaskSortOption } from '../../types/task';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const isDark = useThemeStore((s) => s.isDark);
  const theme = getTheme(isDark);

  const tasks = useTaskStore((s) => s.tasks);
  const isLoading = useTaskStore((s) => s.isLoading);
  const isRefreshing = useTaskStore((s) => s.isRefreshing);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const activeFilter = useTaskStore((s) => s.activeFilter);
  const setActiveFilter = useTaskStore((s) => s.setActiveFilter);

  const activeCategory = useTaskStore((s) => s.activeCategory);
  const setActiveCategory = useTaskStore((s) => s.setActiveCategory);

  const searchQuery = useTaskStore((s) => s.searchQuery);
  const setSearchQuery = useTaskStore((s) => s.setSearchQuery);

  const activeSort = useTaskStore((s) => s.activeSort);
  const setActiveSort = useTaskStore((s) => s.setActiveSort);

  const getFilteredTasks = useTaskStore((s) => s.getFilteredTasks);
  const getAllCategories = useTaskStore((s) => s.getAllCategories);

  const [sortModalVisible, setSortModalVisible] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const displayedTasks = getFilteredTasks();
  const allCategories = getAllCategories();

  // Metrics summary
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const urgentCount = tasks.filter((t) => !t.isCompleted && t.priority === 'urgent').length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filterTabs: Array<{ id: TaskFilter; label: string; count: number }> = [
    { id: 'all', label: 'All', count: totalCount },
    { id: 'pending', label: 'Active', count: totalCount - completedCount },
    { id: 'completed', label: 'Done', count: completedCount },
  ];

  const getSortLabel = (sort: TaskSortOption): string => {
    switch (sort) {
      case 'composite':
        return '⚡ Smart Score';
      case 'deadline':
        return '⏳ Deadline';
      case 'dueDateTime':
        return '📅 Due Date';
      case 'priority':
        return '🔥 Priority';
      case 'createdAt':
        return '✨ Newest';
      default:
        return 'Sort';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header />

      <FlatList
        data={displayedTasks}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchTasks(true)}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Quick Metrics Banner */}
            <View
              style={[
                styles.metricsBanner,
                {
                  backgroundColor: isDark ? theme.colors.card : theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.metricItem}>
                <Text style={[styles.metricNumber, { color: theme.colors.primary }]}>
                  {totalCount}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                  Total Tasks
                </Text>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

              <View style={styles.metricItem}>
                <Text style={[styles.metricNumber, { color: theme.colors.success }]}>
                  {completionPercentage}%
                </Text>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                  Completed
                </Text>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

              <View style={styles.metricItem}>
                <Text
                  style={[
                    styles.metricNumber,
                    { color: urgentCount > 0 ? theme.colors.danger : theme.colors.textSecondary },
                  ]}
                >
                  {urgentCount}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                  Urgent Left
                </Text>
              </View>
            </View>

            {/* Search Bar & Sort Pill */}
            <View style={styles.controlsRow}>
              <View
                style={[
                  styles.searchContainer,
                  {
                    backgroundColor: isDark ? theme.colors.card : theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  placeholder="Search tasks, tags..."
                  placeholderTextColor={theme.colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={[styles.searchInput, { color: theme.colors.text }]}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={[styles.clearSearch, { color: theme.colors.textSecondary }]}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSortModalVisible(true)}
                style={[
                  styles.sortBtn,
                  {
                    backgroundColor: isDark ? theme.colors.card : theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text style={[styles.sortBtnText, { color: theme.colors.primary }]}>
                  {getSortLabel(activeSort)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Completion Filter Tabs */}
            <View
              style={[
                styles.filterTabContainer,
                {
                  backgroundColor: isDark ? '#111827' : '#F1F5F9',
                },
              ]}
            >
              {filterTabs.map((tab) => {
                const isSelected = activeFilter === tab.id;

                return (
                  <TouchableOpacity
                    key={tab.id}
                    activeOpacity={0.8}
                    onPress={() => setActiveFilter(tab.id)}
                    style={[
                      styles.filterTab,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? theme.colors.card
                            : '#FFFFFF'
                          : 'transparent',
                        shadowColor: isSelected ? theme.colors.shadow : 'transparent',
                        elevation: isSelected ? 2 : 0,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterTabText,
                        {
                          color: isSelected ? theme.colors.text : theme.colors.textSecondary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {tab.label} ({tab.count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Category Filter Carousel Chips */}
            <CategoryChipGroup
              categories={allCategories}
              selectedCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />
          </>
        }
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item._id })}
            onToggle={() => toggleTask(item._id)}
            onDelete={() => deleteTask(item._id)}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={{ marginTop: 8 }}>
              <TaskCardSkeleton />
              <TaskCardSkeleton />
              <TaskCardSkeleton />
            </View>
          ) : (
            <EmptyState
              title={searchQuery ? 'No matching tasks found' : 'All caught up!'}
              description={
                searchQuery
                  ? `No tasks found matching "${searchQuery}". Try a different keyword.`
                  : 'You have no pending tasks in this category. Tap the button below to add your next task.'
              }
              actionTitle={searchQuery ? 'Clear Search' : '+ Add New Task'}
              onActionPress={() => {
                if (searchQuery) {
                  setSearchQuery('');
                } else {
                  navigation.navigate('CreateEditTask', {});
                }
              }}
            />
          )
        }
      />

      {/* Floating Action Button */}
      <FAB onPress={() => navigation.navigate('CreateEditTask', {})} />

      {/* Sorting Drawer / Modal */}
      <SortModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        selectedSort={activeSort}
        onSelectSort={(sort) => {
          setActiveSort(sort);
          fetchTasks();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  metricsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 28,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    fontSize: 14,
  },
  clearSearch: {
    fontSize: 14,
    paddingHorizontal: 4,
  },
  sortBtn: {
    height: 46,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterTabContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  filterTabText: {
    fontSize: 13,
  },
});

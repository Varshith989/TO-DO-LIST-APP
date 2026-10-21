import { create } from 'zustand';
import { ITask, CreateTaskDTO, UpdateTaskDTO, TaskFilter, TaskSortOption } from '../types/task';
import { taskService } from '../services/taskService';
import { sortClientTasks } from '../utils/sortAlgorithm';

interface TaskState {
  tasks: ITask[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Active view filters
  activeFilter: TaskFilter;
  activeCategory: string;
  searchQuery: string;
  activeSort: TaskSortOption;

  // Actions
  fetchTasks: (isPullToRefresh?: boolean) => Promise<void>;
  createTask: (dto: CreateTaskDTO) => Promise<boolean>;
  updateTask: (id: string, dto: UpdateTaskDTO) => Promise<boolean>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<boolean>;

  setActiveFilter: (filter: TaskFilter) => void;
  setActiveCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setActiveSort: (sort: TaskSortOption) => void;
  clearError: () => void;

  // Computed selector helpers
  getFilteredTasks: () => ITask[];
  getAllCategories: () => string[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  isRefreshing: false,
  error: null,

  activeFilter: 'all',
  activeCategory: 'All',
  searchQuery: '',
  activeSort: 'composite',

  clearError: () => set({ error: null }),

  setActiveFilter: (filter: TaskFilter) => {
    set({ activeFilter: filter });
  },

  setActiveCategory: (category: string) => {
    set({ activeCategory: category });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setActiveSort: (sort: TaskSortOption) => {
    set({ activeSort: sort });
  },

  fetchTasks: async (isPullToRefresh = false) => {
    try {
      if (isPullToRefresh) {
        set({ isRefreshing: true, error: null });
      } else {
        set({ isLoading: true, error: null });
      }

      const tasks = await taskService.getTasks({
        sort: get().activeSort,
      });

      set({ tasks, isLoading: false, isRefreshing: false });
    } catch (err: any) {
      set({
        isLoading: false,
        isRefreshing: false,
        error: err.response?.data?.message || err.message || 'Failed to fetch tasks',
      });
    }
  },

  createTask: async (dto: CreateTaskDTO) => {
    try {
      set({ isLoading: true, error: null });
      const newTask = await taskService.createTask(dto);
      const currentTasks = get().tasks;
      set({
        tasks: [newTask, ...currentTasks],
        isLoading: false,
      });
      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || err.message || 'Failed to create task',
      });
      return false;
    }
  },

  updateTask: async (id: string, dto: UpdateTaskDTO) => {
    try {
      set({ isLoading: true, error: null });
      const updated = await taskService.updateTask(id, dto);
      const tasks = get().tasks.map((t) => (t._id === id ? updated : t));
      set({ tasks, isLoading: false });
      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || err.message || 'Failed to update task',
      });
      return false;
    }
  },

  toggleTask: async (id: string) => {
    // 1. Optimistic UI update for instantaneous responsiveness
    const previousTasks = get().tasks;
    const optimisticTasks = previousTasks.map((t) =>
      t._id === id ? { ...t, isCompleted: !t.isCompleted, updatedAt: new Date().toISOString() } : t
    );
    set({ tasks: sortClientTasks(optimisticTasks, get().activeSort) });

    // 2. Network sync with automatic rollback on error
    try {
      const serverUpdated = await taskService.toggleTask(id);
      set({
        tasks: sortClientTasks(
          get().tasks.map((t) => (t._id === id ? serverUpdated : t)),
          get().activeSort
        ),
      });
    } catch (err: any) {
      // Rollback
      set({
        tasks: previousTasks,
        error: err.response?.data?.message || 'Failed to toggle task. Changes reverted.',
      });
    }
  },

  deleteTask: async (id: string) => {
    const previousTasks = get().tasks;
    // Optimistic deletion
    set({ tasks: previousTasks.filter((t) => t._id !== id) });

    try {
      await taskService.deleteTask(id);
      return true;
    } catch (err: any) {
      // Rollback
      set({
        tasks: previousTasks,
        error: err.response?.data?.message || 'Failed to delete task',
      });
      return false;
    }
  },

  getFilteredTasks: () => {
    const { tasks, activeFilter, activeCategory, searchQuery, activeSort } = get();

    let filtered = tasks.filter((t) => {
      // Completion filter
      if (activeFilter === 'completed' && !t.isCompleted) return false;
      if (activeFilter === 'pending' && t.isCompleted) return false;

      // Category filter
      if (activeCategory !== 'All' && !t.category?.includes(activeCategory)) return false;

      // Search filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = t.title.toLowerCase().includes(query);
        const descMatch = t.description?.toLowerCase().includes(query) ?? false;
        if (!titleMatch && !descMatch) return false;
      }

      return true;
    });

    return sortClientTasks(filtered, activeSort);
  },

  getAllCategories: () => {
    const setCategory = new Set<string>(['All', 'Work', 'Personal', 'Fitness']);
    get().tasks.forEach((t) => {
      t.category?.forEach((c) => setCategory.add(c));
    });
    return Array.from(setCategory);
  },
}));

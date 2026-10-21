import { create } from 'zustand';
import { ITask, CreateTaskDTO, UpdateTaskDTO, TaskFilter, TaskSortOption } from '../types/task';
import { taskService } from '../services/taskService';
import { sortClientTasks } from '../utils/sortAlgorithm';

const getDefaultSeedTasks = (): ITask[] => {
  const now = Date.now();
  return [
    {
      _id: 'seed-1',
      title: 'Deploy TaskMaster Pro Web App to Firebase Hosting',
      description: 'Build production bundle and deploy live HTTPS URL on to-do-list-99a24.web.app',
      priority: 'urgent',
      dueDateTime: new Date(now + 2 * 3600 * 1000).toISOString(),
      deadline: new Date(now + 4 * 3600 * 1000).toISOString(),
      category: ['DevOps', 'Firebase'],
      isCompleted: false,
      userId: 'demo-engineer-uid',
      createdAt: new Date(now - 3600000).toISOString(),
      updatedAt: new Date(now - 3600000).toISOString(),
    },
    {
      _id: 'seed-2',
      title: 'Assemble Android APK with Gradle & GitHub Actions',
      description: 'Package the React Native Android client into a standalone downloadable .apk artifact.',
      priority: 'high',
      dueDateTime: new Date(now + 8 * 3600 * 1000).toISOString(),
      deadline: new Date(now + 16 * 3600 * 1000).toISOString(),
      category: ['Mobile', 'Android'],
      isCompleted: false,
      userId: 'demo-engineer-uid',
      createdAt: new Date(now - 7200000).toISOString(),
      updatedAt: new Date(now - 7200000).toISOString(),
    },
    {
      _id: 'seed-3',
      title: 'Review Composite Priority algorithm rankings',
      description: 'Verify mathematical score curves for overdue tasks vs hard cutoff deadlines.',
      priority: 'medium',
      dueDateTime: new Date(now + 24 * 3600 * 1000).toISOString(),
      deadline: new Date(now + 48 * 3600 * 1000).toISOString(),
      category: ['Engineering'],
      isCompleted: false,
      userId: 'demo-engineer-uid',
      createdAt: new Date(now - 10800000).toISOString(),
      updatedAt: new Date(now - 10800000).toISOString(),
    },
    {
      _id: 'seed-4',
      title: '10km evening endurance run & cardio fitness',
      description: 'Tempo run with heart rate zone 4 targets.',
      priority: 'medium',
      dueDateTime: new Date(now + 48 * 3600 * 1000).toISOString(),
      deadline: new Date(now + 96 * 3600 * 1000).toISOString(),
      category: ['Fitness', 'Personal'],
      isCompleted: false,
      userId: 'demo-engineer-uid',
      createdAt: new Date(now - 14400000).toISOString(),
      updatedAt: new Date(now - 14400000).toISOString(),
    },
    {
      _id: 'seed-5',
      title: 'Initial architecture blueprint and MongoDB schema modeling',
      description: 'Database schema, JWT auth guard, and Zod validator specifications.',
      priority: 'low',
      dueDateTime: new Date(now - 48 * 3600 * 1000).toISOString(),
      deadline: new Date(now - 24 * 3600 * 1000).toISOString(),
      category: ['Engineering'],
      isCompleted: true,
      userId: 'demo-engineer-uid',
      createdAt: new Date(now - 86400000).toISOString(),
      updatedAt: new Date(now - 86400000).toISOString(),
    },
  ];
};

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
  setDemoTasks: () => void;
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

  setDemoTasks: () => {
    set({ tasks: getDefaultSeedTasks(), isLoading: false, isRefreshing: false, error: null });
  },

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

      if (tasks && tasks.length > 0) {
        set({ tasks, isLoading: false, isRefreshing: false });
      } else if (get().tasks.length === 0) {
        set({ tasks: getDefaultSeedTasks(), isLoading: false, isRefreshing: false });
      } else {
        set({ tasks, isLoading: false, isRefreshing: false });
      }
    } catch {
      // Offline / demo fallback
      if (get().tasks.length === 0) {
        set({ tasks: getDefaultSeedTasks(), isLoading: false, isRefreshing: false });
      } else {
        set({ isLoading: false, isRefreshing: false });
      }
    }
  },

  createTask: async (dto: CreateTaskDTO) => {
    try {
      set({ isLoading: true, error: null });
      let newTask: ITask;
      try {
        newTask = await taskService.createTask(dto);
      } catch {
        // Local fallback
        newTask = {
          _id: `task-${Date.now()}`,
          title: dto.title,
          description: dto.description || '',
          priority: dto.priority,
          dueDateTime: dto.dueDateTime,
          deadline: dto.deadline,
          category: dto.category || ['General'],
          isCompleted: false,
          userId: 'demo-engineer-uid',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
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
      let updated: ITask;
      try {
        updated = await taskService.updateTask(id, dto);
      } catch {
        const existing = get().tasks.find((t) => t._id === id);
        if (!existing) throw new Error('Task not found');
        updated = {
          ...existing,
          ...dto,
          updatedAt: new Date().toISOString(),
        };
      }
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
    const previousTasks = get().tasks;
    const optimisticTasks = previousTasks.map((t) =>
      t._id === id ? { ...t, isCompleted: !t.isCompleted, updatedAt: new Date().toISOString() } : t
    );
    set({ tasks: sortClientTasks(optimisticTasks, get().activeSort) });

    try {
      const serverUpdated = await taskService.toggleTask(id);
      set({
        tasks: sortClientTasks(
          get().tasks.map((t) => (t._id === id ? serverUpdated : t)),
          get().activeSort
        ),
      });
    } catch {
      // Keep optimistic state if running in offline/demo mode
    }
  },

  deleteTask: async (id: string) => {
    const previousTasks = get().tasks;
    set({ tasks: previousTasks.filter((t) => t._id !== id) });

    try {
      await taskService.deleteTask(id);
      return true;
    } catch {
      // Kept deleted in demo/offline mode
      return true;
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

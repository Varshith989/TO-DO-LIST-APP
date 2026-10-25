import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

import { useTaskStore } from '../store/useTaskStore';

describe('useTaskStore', () => {
  beforeEach(() => {
    useTaskStore.getState().setDemoTasks();
  });

  it('initializes with seed tasks in demo mode', () => {
    const tasks = useTaskStore.getState().tasks;
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks[0]).toHaveProperty('title');
    expect(tasks[0]).toHaveProperty('priority');
  });

  it('filters tasks by category', () => {
    const store = useTaskStore.getState();
    store.setActiveCategory('DevOps');
    const filtered = store.getFilteredTasks();
    expect(filtered.every((t) => t.category?.includes('DevOps'))).toBe(true);
  });

  it('filters tasks by completion status', () => {
    const store = useTaskStore.getState();
    store.setActiveFilter('completed');
    const completedTasks = store.getFilteredTasks();
    expect(completedTasks.every((t) => t.isCompleted)).toBe(true);

    store.setActiveFilter('pending');
    const pendingTasks = store.getFilteredTasks();
    expect(pendingTasks.every((t) => !t.isCompleted)).toBe(true);
  });

  it('searches tasks by title or description keyword', () => {
    const store = useTaskStore.getState();
    store.setActiveCategory('All');
    store.setActiveFilter('all');
    store.setSearchQuery('Firebase');
    const matched = store.getFilteredTasks();
    expect(matched.length).toBeGreaterThan(0);
    expect(
      matched.some((t) => t.title.includes('Firebase') || t.description?.includes('Firebase'))
    ).toBe(true);
  });

  it('toggles task completion status', async () => {
    const store = useTaskStore.getState();
    const firstTask = store.tasks[0];
    const initialStatus = firstTask.isCompleted;

    await store.toggleTask(firstTask._id);
    const updated = useTaskStore.getState().tasks.find((t) => t._id === firstTask._id);
    expect(updated?.isCompleted).toBe(!initialStatus);
  });

  it('creates and deletes a task locally', async () => {
    const store = useTaskStore.getState();
    const initialLength = store.tasks.length;

    await store.createTask({
      title: 'Newly Created Test Task',
      description: 'Integration test description',
      priority: 'high',
      dueDateTime: new Date().toISOString(),
      deadline: new Date(Date.now() + 86400000).toISOString(),
      category: ['Testing'],
    });

    const tasksAfterCreate = useTaskStore.getState().tasks;
    expect(tasksAfterCreate.length).toBe(initialLength + 1);
    const created = tasksAfterCreate.find((t) => t.title === 'Newly Created Test Task');
    expect(created).toBeDefined();

    if (created) {
      await store.deleteTask(created._id);
      const tasksAfterDelete = useTaskStore.getState().tasks;
      expect(tasksAfterDelete.length).toBe(initialLength);
      expect(tasksAfterDelete.find((t) => t._id === created._id)).toBeUndefined();
    }
  });
});

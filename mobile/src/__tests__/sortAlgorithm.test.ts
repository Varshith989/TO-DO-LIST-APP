import { calculateClientCompositeScore, sortClientTasks } from '../utils/sortAlgorithm';
import { ITask } from '../types/task';

describe('sortAlgorithm', () => {
  const now = new Date('2026-10-25T12:00:00Z');

  const baseTask: ITask = {
    _id: '1',
    title: 'Test Task',
    description: 'Test description',
    priority: 'medium',
    dueDateTime: new Date('2026-10-25T14:00:00Z').toISOString(),
    deadline: new Date('2026-10-25T16:00:00Z').toISOString(),
    category: ['Work'],
    isCompleted: false,
    userId: 'user-1',
    createdAt: '2026-10-25T10:00:00Z',
    updatedAt: '2026-10-25T10:00:00Z',
  };

  it('calculates higher composite score for urgent overdue tasks compared to low priority future tasks', () => {
    const urgentOverdue: ITask = {
      ...baseTask,
      _id: 'urgent-1',
      priority: 'urgent',
      deadline: new Date('2026-10-25T10:00:00Z').toISOString(), // 2h overdue
    };

    const lowFuture: ITask = {
      ...baseTask,
      _id: 'low-1',
      priority: 'low',
      deadline: new Date('2026-10-30T12:00:00Z').toISOString(), // 5 days out
    };

    const urgentScore = calculateClientCompositeScore(urgentOverdue, now);
    const lowScore = calculateClientCompositeScore(lowFuture, now);

    expect(urgentScore).toBeGreaterThan(lowScore);
  });

  it('deprioritizes completed tasks with negative scores', () => {
    const completedTask: ITask = {
      ...baseTask,
      isCompleted: true,
    };

    const score = calculateClientCompositeScore(completedTask, now);
    expect(score).toBeLessThan(0);
  });

  it('correctly sorts tasks by deadline soonest first', () => {
    const taskA: ITask = { ...baseTask, _id: 'a', deadline: '2026-10-26T10:00:00Z' };
    const taskB: ITask = { ...baseTask, _id: 'b', deadline: '2026-10-25T18:00:00Z' };

    const sorted = sortClientTasks([taskA, taskB], 'deadline');
    expect(sorted[0]._id).toBe('b');
    expect(sorted[1]._id).toBe('a');
  });

  it('correctly sorts tasks by priority highest first', () => {
    const taskLow: ITask = { ...baseTask, _id: 'low', priority: 'low' };
    const taskUrgent: ITask = { ...baseTask, _id: 'urgent', priority: 'urgent' };

    const sorted = sortClientTasks([taskLow, taskUrgent], 'priority');
    expect(sorted[0]._id).toBe('urgent');
    expect(sorted[1]._id).toBe('low');
  });
});

import { ITask, TaskPriority } from '../types/task';

const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  urgent: 100,
  high: 70,
  medium: 40,
  low: 10,
};

/**
 * Mobile-side client calculation of composite task score
 * Mirrors backend calculation for zero-latency optimistic updates
 */
export function calculateClientCompositeScore(task: ITask, now: Date = new Date()): number {
  if (task.isCompleted) {
    return -10000 + (new Date(task.updatedAt || task.createdAt || 0).getTime() / 1e12);
  }

  const nowMs = now.getTime();
  const deadlineMs = new Date(task.deadline).getTime();
  const dueMs = new Date(task.dueDateTime).getTime();

  const hoursToDeadline = (deadlineMs - nowMs) / (1000 * 60 * 60);
  const hoursToDue = (dueMs - nowMs) / (1000 * 60 * 60);

  const priorityWeight = PRIORITY_WEIGHTS[task.priority] || 40;

  let deadlineUrgencyScore = 0;
  if (hoursToDeadline < 0) {
    const overdueHours = Math.abs(hoursToDeadline);
    deadlineUrgencyScore = 200 + Math.min(50, overdueHours * 2);
  } else if (hoursToDeadline <= 6) {
    deadlineUrgencyScore = 160 + (6 - hoursToDeadline) * 6;
  } else if (hoursToDeadline <= 24) {
    deadlineUrgencyScore = 120 + (24 - hoursToDeadline) * 2;
  } else if (hoursToDeadline <= 48) {
    deadlineUrgencyScore = 80 + (48 - hoursToDeadline) * 1.5;
  } else if (hoursToDeadline <= 168) {
    deadlineUrgencyScore = 30 + ((168 - hoursToDeadline) / 120) * 40;
  } else {
    deadlineUrgencyScore = Math.max(5, 30 - (hoursToDeadline - 168) * 0.05);
  }

  let dueProximityScore = 0;
  if (hoursToDue <= 0) {
    dueProximityScore = 30;
  } else if (hoursToDue <= 24) {
    dueProximityScore = Math.max(0, 30 - hoursToDue);
  }

  return Math.round(((priorityWeight * 1.5) + deadlineUrgencyScore + dueProximityScore) * 100) / 100;
}

export function sortClientTasks(tasks: ITask[], sortType: string): ITask[] {
  const list = [...tasks];

  switch (sortType) {
    case 'composite':
      return list.sort((a, b) => {
        const scoreA = a.compositeScore ?? calculateClientCompositeScore(a);
        const scoreB = b.compositeScore ?? calculateClientCompositeScore(b);
        return scoreB - scoreA;
      });

    case 'deadline':
      return list.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    case 'dueDateTime':
      return list.sort((a, b) => new Date(a.dueDateTime).getTime() - new Date(b.dueDateTime).getTime());

    case 'priority': {
      return list.sort((a, b) => (PRIORITY_WEIGHTS[b.priority] || 0) - (PRIORITY_WEIGHTS[a.priority] || 0));
    }

    case 'createdAt':
    default:
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

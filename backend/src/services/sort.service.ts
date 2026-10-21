import { ITask, TaskPriority } from '../types/index.js';

const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  urgent: 100,
  high: 70,
  medium: 40,
  low: 10,
};

/**
 * Calculates a composite priority score for a task.
 * Higher score = higher urgency & priority.
 *
 * Scoring breakdown:
 * 1. Base Priority Weight: urgent=100, high=70, medium=40, low=10
 * 2. Deadline Urgency Score:
 *    - Overdue: 200 + up to 50 overdue penalty points
 *    - Due within 6 hours: 160 points
 *    - Due within 24 hours: 120 points
 *    - Due within 48 hours: 80 points
 *    - Due within 7 days: 40 points
 *    - Beyond 7 days: decaying bonus
 * 3. Due Date Imminence:
 *    - Adds extra weight if due date has arrived or is approaching
 * 4. Completion Penalty:
 *    - If task is already completed, score is deducted by 10,000 points
 *      to ensure active pending tasks always take precedence.
 */
export function calculateTaskCompositeScore(task: ITask, now: Date = new Date()): number {
  if (task.isCompleted) {
    // Completed tasks sink to the bottom, sorted chronologically by update/creation
    return -10000 + (new Date(task.updatedAt || task.createdAt || 0).getTime() / 1e12);
  }

  const nowMs = now.getTime();
  const deadlineMs = new Date(task.deadline).getTime();
  const dueMs = new Date(task.dueDateTime).getTime();

  const hoursToDeadline = (deadlineMs - nowMs) / (1000 * 60 * 60);
  const hoursToDue = (dueMs - nowMs) / (1000 * 60 * 60);

  // 1. Priority Weight
  const priorityWeight = PRIORITY_WEIGHTS[task.priority] || 40;

  // 2. Deadline Urgency Score
  let deadlineUrgencyScore = 0;
  if (hoursToDeadline < 0) {
    // Overdue task: top urgency!
    const overdueHours = Math.abs(hoursToDeadline);
    deadlineUrgencyScore = 200 + Math.min(50, overdueHours * 2);
  } else if (hoursToDeadline <= 6) {
    deadlineUrgencyScore = 160 + (6 - hoursToDeadline) * 6; // 160 - 196
  } else if (hoursToDeadline <= 24) {
    deadlineUrgencyScore = 120 + (24 - hoursToDeadline) * 2; // 120 - 156
  } else if (hoursToDeadline <= 48) {
    deadlineUrgencyScore = 80 + (48 - hoursToDeadline) * 1.5; // 80 - 116
  } else if (hoursToDeadline <= 168) {
    // 7 days
    deadlineUrgencyScore = 30 + ((168 - hoursToDeadline) / 120) * 40; // 30 - 70
  } else {
    deadlineUrgencyScore = Math.max(5, 30 - (hoursToDeadline - 168) * 0.05);
  }

  // 3. Due Date Proximity modifier (up to 30 points)
  let dueProximityScore = 0;
  if (hoursToDue <= 0) {
    dueProximityScore = 30;
  } else if (hoursToDue <= 24) {
    dueProximityScore = Math.max(0, 30 - hoursToDue);
  }

  // Composite weighted score
  const totalScore = (priorityWeight * 1.5) + deadlineUrgencyScore + dueProximityScore;
  return Math.round(totalScore * 100) / 100;
}

/**
 * Sorts an array of tasks using the composite score in descending order
 */
export function sortTasksByCompositeScore<T extends ITask>(tasks: T[], now: Date = new Date()): T[] {
  return [...tasks].sort((a, b) => {
    const scoreA = calculateTaskCompositeScore(a, now);
    const scoreB = calculateTaskCompositeScore(b, now);
    return scoreB - scoreA;
  });
}

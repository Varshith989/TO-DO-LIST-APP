/**
 * Human-friendly date and deadline countdown formatting utilities
 */

export function formatDate(dateInput: string | Date): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'Invalid date';

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(dateInput: string | Date): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateTime(dateInput: string | Date): string {
  return `${formatDate(dateInput)} at ${formatTime(dateInput)}`;
}

export interface DeadlineBadgeInfo {
  text: string;
  isOverdue: boolean;
  urgencyLevel: 'critical' | 'warning' | 'normal';
}

/**
 * Calculates a dynamic countdown badge for task cards and detail views
 */
export function getDeadlineStatus(deadlineInput: string | Date): DeadlineBadgeInfo {
  const deadline = new Date(deadlineInput).getTime();
  const now = Date.now();
  const diffMs = deadline - now;
  const isOverdue = diffMs < 0;
  const absDiff = Math.abs(diffMs);

  const diffMinutes = Math.floor(absDiff / (1000 * 60));
  const diffHours = Math.floor(absDiff / (1000 * 60 * 60));
  const diffDays = Math.floor(absDiff / (1000 * 60 * 60 * 24));

  if (isOverdue) {
    let text = 'Overdue';
    if (diffDays >= 1) {
      text = `Overdue by ${diffDays}d`;
    } else if (diffHours >= 1) {
      text = `Overdue by ${diffHours}h`;
    } else {
      text = `Overdue by ${Math.max(1, diffMinutes)}m`;
    }
    return { text, isOverdue: true, urgencyLevel: 'critical' };
  }

  // Not overdue: upcoming deadline
  if (diffHours < 2) {
    const m = Math.max(1, diffMinutes);
    return { text: `Due in ${m}m`, isOverdue: false, urgencyLevel: 'critical' };
  } else if (diffHours < 24) {
    return { text: `Due in ${diffHours}h`, isOverdue: false, urgencyLevel: 'warning' };
  } else if (diffDays === 1) {
    return { text: 'Due tomorrow', isOverdue: false, urgencyLevel: 'warning' };
  } else if (diffDays < 7) {
    return { text: `Due in ${diffDays}d`, isOverdue: false, urgencyLevel: 'normal' };
  } else {
    return { text: formatDate(deadlineInput), isOverdue: false, urgencyLevel: 'normal' };
  }
}

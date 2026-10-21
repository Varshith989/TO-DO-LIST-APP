export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  dueDateTime: string; // ISO string
  deadline: string; // ISO string
  priority: TaskPriority;
  category: string[];
  isCompleted: boolean;
  userId: string;
  compositeScore?: number;
  createdAt: string;
  updatedAt: string;
}

export type TaskFilter = 'all' | 'completed' | 'pending';

export type TaskSortOption = 'composite' | 'deadline' | 'dueDateTime' | 'priority' | 'createdAt';

export interface CreateTaskDTO {
  title: string;
  description?: string;
  dueDateTime: string;
  deadline: string;
  priority: TaskPriority;
  category: string[];
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  dueDateTime?: string;
  deadline?: string;
  priority?: TaskPriority;
  category?: string[];
  isCompleted?: boolean;
}

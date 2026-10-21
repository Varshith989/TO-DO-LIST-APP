import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z.string().trim().optional().default(''),
  dueDateTime: z.string().datetime({ message: 'dueDateTime must be a valid ISO 8601 date string' }).or(z.date()),
  deadline: z.string().datetime({ message: 'deadline must be a valid ISO 8601 date string' }).or(z.date()),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  category: z.array(z.string().trim()).default(['General']),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title cannot be empty').max(200).optional(),
  description: z.string().trim().optional(),
  dueDateTime: z.string().datetime().or(z.date()).optional(),
  deadline: z.string().datetime().or(z.date()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.array(z.string().trim()).optional(),
  isCompleted: z.boolean().optional(),
});

export const taskQuerySchema = z.object({
  filter: z.enum(['all', 'completed', 'pending']).optional().default('all'),
  category: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['composite', 'deadline', 'dueDateTime', 'priority', 'createdAt', 'title']).optional().default('composite'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;

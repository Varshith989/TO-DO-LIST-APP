import { Request } from 'express';
import { Types } from 'mongoose';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPayload {
  userId: string;
  email: string;
  name: string;
}

export interface ITask {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  dueDateTime: Date;
  deadline: Date;
  priority: TaskPriority;
  category: string[];
  isCompleted: boolean;
  userId: Types.ObjectId;
  compositeScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUserPayload;
}

export interface TaskFilterQuery {
  filter?: 'all' | 'completed' | 'pending';
  category?: string;
  search?: string;
  sort?: 'composite' | 'deadline' | 'dueDateTime' | 'priority' | 'createdAt' | 'title';
  order?: 'asc' | 'desc';
}

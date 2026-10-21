import mongoose, { Document, Schema } from 'mongoose';
import { ITask, TaskPriority } from '../types/index.js';

export interface ITaskDocument extends Omit<ITask, '_id'>, Document {}

const taskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    dueDateTime: {
      type: Date,
      required: [true, 'Due date and time is required'],
    },
    deadline: {
      type: Date,
      required: [true, 'Hard deadline is required'],
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: 'Priority must be one of: low, medium, high, urgent',
      },
      default: 'medium',
      index: true,
    },
    category: {
      type: [String],
      default: ['General'],
      index: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for rapid filtered and sorted dashboard queries
taskSchema.index({ userId: 1, isCompleted: 1, deadline: 1 });
taskSchema.index({ userId: 1, category: 1 });
taskSchema.index({ title: 'text', description: 'text' });

taskSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, any>) => {
    delete ret.__v;
    return ret;
  },
});

export const Task = mongoose.model<ITaskDocument>('Task', taskSchema);

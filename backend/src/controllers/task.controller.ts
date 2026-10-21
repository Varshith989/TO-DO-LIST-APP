import { Response, NextFunction } from 'express';
import { Task } from '../models/task.model.js';
import { AuthRequest } from '../types/index.js';
import { AppError } from '../middleware/error.middleware.js';
import { calculateTaskCompositeScore, sortTasksByCompositeScore } from '../services/sort.service.js';

/**
 * @route POST /api/tasks
 * @desc Create a new task for the authenticated user
 */
export async function createTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User authentication required', 401);
    }

    const { title, description, dueDateTime, deadline, priority, category } = req.body;

    const task = await Task.create({
      title,
      description,
      dueDateTime: new Date(dueDateTime),
      deadline: new Date(deadline),
      priority: priority || 'medium',
      category: category && category.length > 0 ? category : ['General'],
      userId,
    });

    const score = calculateTaskCompositeScore(task);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: {
        ...task.toJSON(),
        compositeScore: score,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route GET /api/tasks
 * @desc Fetch tasks with filtering (filter=all|completed|pending), category, search, and sorting
 */
export async function getTasks(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User authentication required', 401);
    }

    const { filter, category, search, sort = 'composite', order = 'desc' } = req.query as any;

    // Base query scoped to the authenticated user
    const query: any = { userId };

    // Status filtering
    if (filter === 'completed') {
      query.isCompleted = true;
    } else if (filter === 'pending') {
      query.isCompleted = false;
    }

    // Category filtering
    if (category && category !== 'All' && category !== 'all') {
      query.category = { $in: [category] };
    }

    // Search query across title and description
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // If sorting by composite, we fetch and score dynamically
    if (sort === 'composite') {
      const tasks = await Task.find(query).lean();
      const scoredTasks = tasks.map((t: any) => ({
        ...t,
        compositeScore: calculateTaskCompositeScore(t),
      }));

      const sortedTasks = sortTasksByCompositeScore(scoredTasks);

      res.status(200).json({
        success: true,
        count: sortedTasks.length,
        tasks: sortedTasks,
      });
      return;
    }

    // Otherwise, perform MongoDB sorting
    const sortFieldMap: Record<string, string> = {
      deadline: 'deadline',
      dueDateTime: 'dueDateTime',
      createdAt: 'createdAt',
      title: 'title',
    };

    const sortField = sortFieldMap[sort] || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const tasks = await Task.find(query)
      .sort({ [sortField]: sortOrder })
      .lean();

    const tasksWithScores = tasks.map((t: any) => ({
      ...t,
      compositeScore: calculateTaskCompositeScore(t),
    }));

    res.status(200).json({
      success: true,
      count: tasksWithScores.length,
      tasks: tasksWithScores,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route GET /api/tasks/:id
 * @desc Get single task details
 */
export async function getTaskById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, userId });
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    res.status(200).json({
      success: true,
      task: {
        ...task.toJSON(),
        compositeScore: calculateTaskCompositeScore(task),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route PUT /api/tasks/:id
 * @desc Update task details
 */
export async function updateTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, userId });
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const { title, description, dueDateTime, deadline, priority, category, isCompleted } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDateTime !== undefined) task.dueDateTime = new Date(dueDateTime);
    if (deadline !== undefined) task.deadline = new Date(deadline);
    if (priority !== undefined) task.priority = priority;
    if (category !== undefined) task.category = category;
    if (isCompleted !== undefined) task.isCompleted = isCompleted;

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: {
        ...task.toJSON(),
        compositeScore: calculateTaskCompositeScore(task),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route PATCH /api/tasks/:id/toggle
 * @desc Toggle task completion state
 */
export async function toggleTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, userId });
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    task.isCompleted = !task.isCompleted;
    await task.save();

    res.status(200).json({
      success: true,
      message: `Task marked as ${task.isCompleted ? 'completed' : 'pending'}`,
      task: {
        ...task.toJSON(),
        compositeScore: calculateTaskCompositeScore(task),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route DELETE /api/tasks/:id
 * @desc Delete task by ID
 */
export async function deleteTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, userId });
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      deletedTaskId: id,
    });
  } catch (error) {
    next(error);
  }
}

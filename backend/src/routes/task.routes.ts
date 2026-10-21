import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  toggleTask,
  deleteTask,
} from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from '../validators/task.validator.js';

const router = Router();

// Protect all task endpoints with JWT authentication middleware
router.use(authenticate);

router.post('/', validate(createTaskSchema), createTask);
router.get('/', validate(taskQuerySchema, 'query'), getTasks);
router.get('/:id', getTaskById);
router.put('/:id', validate(updateTaskSchema), updateTask);
router.patch('/:id/toggle', toggleTask);
router.delete('/:id', deleteTask);

export default router;

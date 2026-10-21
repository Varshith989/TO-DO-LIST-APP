import { Router } from 'express';
import authRoutes from './auth.routes.js';
import taskRoutes from './task.routes.js';

const router = Router();

// API root welcome / index
router.get('/', (_req, res) => {
  res.status(200).json({
    name: 'TaskMaster Pro API',
    version: '1.0.0',
    webApp: '/',
    health: '/api/health',
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
    },
  });
});

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'TaskMaster API',
  });
});

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);

export default router;

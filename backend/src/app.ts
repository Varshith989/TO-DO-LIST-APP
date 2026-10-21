import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';
import { errorHandler, AppError } from './middleware/error.middleware.js';
import { ENV } from './config/env.js';

export function createApp(): Application {
  const app: Application = express();

  // Security HTTP headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: ENV.CORS_ORIGIN === '*' ? true : ENV.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Request logging
  if (ENV.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Parse incoming JSON and URL-encoded payloads
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Root welcome route
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      name: 'TaskMaster Pro API',
      version: '1.0.0',
      docs: '/api/health',
      endpoints: {
        auth: '/api/auth',
        tasks: '/api/tasks',
      },
    });
  });

  // Mount API routes
  app.use('/api', routes);

  // Handle 404 for undefined routes
  app.all('*', (req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404));
  });

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
}

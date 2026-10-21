import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { errorHandler, AppError } from './middleware/error.middleware.js';
import { ENV } from './config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(): Application {
  const app: Application = express();

  // Security HTTP headers (relaxed CSP for simulator assets)
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

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

  // Serve static web application
  const publicPath = path.join(__dirname, '../public');
  app.use(express.static(publicPath));
  app.use('/public', express.static(publicPath));

  app.get(['/', '/app'], (_req: Request, res: Response) => {
    res.sendFile(path.join(publicPath, 'index.html'));
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

import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { ENV } from './config/env.js';
import { autoSeedIfEmpty } from './utils/seed.js';

async function bootstrap() {
  try {
    // Connect to database (with automatic in-memory fallback if needed)
    await connectDB();

    // Auto-seed demo tasks and user if database is clean
    await autoSeedIfEmpty();

    const app = createApp();

    const server = app.listen(ENV.PORT, () => {
      console.log(`
======================================================
  TaskMaster Pro API Server is LIVE!
  Environment : ${ENV.NODE_ENV}
  Port        : ${ENV.PORT}
  Health check: http://localhost:${ENV.PORT}/api/health
  API Base    : http://localhost:${ENV.PORT}/api
======================================================
      `);
    });

    // Graceful shutdown handling
    const shutdown = async (signal: string) => {
      console.log(`\n[Process] Received ${signal}. Initiating graceful shutdown...`);
      server.close(async () => {
        console.log('[Server] HTTP server closed.');
        await disconnectDB();
        console.log('[Process] Graceful shutdown completed. Exiting.');
        process.exit(0);
      });

      // Force exit after 10 seconds if hanging
      setTimeout(() => {
        console.error('[Process] Forcing shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[Fatal] Failed to bootstrap application:', error);
    process.exit(1);
  }
}

bootstrap();

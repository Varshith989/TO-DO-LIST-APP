import mongoose from 'mongoose';
import { ENV } from './env.js';

let mongodInstance: any = null;

/**
 * Connect to MongoDB with automatic fallback to MongoDB Memory Server
 * if a local or remote MongoDB instance is unreachable.
 */
export async function connectDB(): Promise<void> {
  // If already connected, skip
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    console.log(`[Database] Attempting connection to ${ENV.MONGODB_URI}...`);
    await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected successfully to MongoDB at ${ENV.MONGODB_URI}`);
  } catch (error) {
    console.warn(
      `[Database] Could not connect to primary MongoDB instance (${(error as Error).message}). Falling back to in-memory MongoDB for zero-config execution...`
    );

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongodInstance.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[Database] Successfully connected to in-memory MongoDB at ${inMemoryUri}`);
    } catch (memError) {
      console.error('[Database] Failed to initialize in-memory MongoDB fallback:', memError);
      throw memError;
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('[Database] Mongoose runtime connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] Mongoose disconnected.');
  });
}

/**
 * Gracefully disconnect from MongoDB and terminate in-memory server if active
 */
export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[Database] Mongoose disconnected.');
  }
  if (mongodInstance) {
    await mongodInstance.stop();
    console.log('[Database] In-memory MongoDB stopped.');
  }
}

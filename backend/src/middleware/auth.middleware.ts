import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, IUserPayload } from '../types/index.js';
import { ENV } from '../config/env.js';
import { AppError } from './error.middleware.js';

/**
 * Authentication Middleware: Protects endpoints by verifying the incoming Bearer JWT.
 */
export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Missing Bearer token.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as IUserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
}

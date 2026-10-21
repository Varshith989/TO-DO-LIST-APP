import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { AuthRequest, IUserPayload } from '../types/index.js';
import { ENV } from '../config/env.js';
import { AppError } from '../middleware/error.middleware.js';
import { RegisterInput, LoginInput } from '../validators/auth.validator.js';

/**
 * Generate a signed JWT token
 */
function generateToken(payload: IUserPayload): string {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as any,
  });
}

/**
 * @route POST /api/auth/register
 * @desc Register new user account
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password }: RegisterInput = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('An account with this email address already exists', 409);
    }

    const newUser = await User.create({ name, email, password });

    const payload: IUserPayload = {
      userId: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
    };

    const token = generateToken(payload);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and issue JWT token
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password }: LoginInput = req.body;

    // Explicitly select password field which is omitted by default
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const payload: IUserPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    const token = generateToken(payload);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route GET /api/auth/me
 * @desc Get currently authenticated user profile
 */
export async function getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

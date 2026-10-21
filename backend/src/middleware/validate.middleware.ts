import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

type RequestPart = 'body' | 'query' | 'params';

/**
 * Higher-order middleware to validate incoming request data using Zod
 */
export function validate(schema: AnyZodObject, part: RequestPart = 'body') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req[part]);
      req[part] = parsed;
      next();
    } catch (error) {
      next(error);
    }
  };
}

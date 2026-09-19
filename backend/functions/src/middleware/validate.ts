import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/envelope';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        sendError(res, 'VALIDATION_ERROR', 'Validation failed for request body.', 400, details);
        return;
      }
      sendError(res, 'VALIDATION_ERROR', 'Malformed request body.', 400);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        sendError(res, 'VALIDATION_ERROR', 'Validation failed for query parameters.', 400, details);
        return;
      }
      sendError(res, 'VALIDATION_ERROR', 'Malformed query parameters.', 400);
    }
  };
}

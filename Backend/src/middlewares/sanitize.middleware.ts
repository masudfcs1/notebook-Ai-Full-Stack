import { Request, Response, NextFunction } from 'express';

const sanitize = (obj: unknown): unknown => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (typeof key === 'string') {
        const sanitizedKey = key.replace(/\$/g, '');
        sanitized[sanitizedKey] = sanitize(value);
      }
    }
    return sanitized;
  }

  if (typeof obj === 'string') {
    return obj.trim();
  }

  return obj;
};

export const sanitizeInput = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.body) {
    req.body = sanitize(req.body);
  }

  if (req.query) {
    req.query = sanitize(req.query) as typeof req.query;
  }

  if (req.params) {
    req.params = sanitize(req.params) as typeof req.params;
  }

  next();
};

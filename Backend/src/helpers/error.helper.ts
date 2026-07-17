import { MESSAGES } from '@/constants';

export class AppError extends Error {
  statusCode: number;
  errors?: unknown[];
  isOperational: boolean;

  constructor(statusCode: number, message: string, errors?: unknown[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: unknown[]): AppError {
    return new AppError(400, message, errors);
  }

  static unauthorized(message?: string): AppError {
    return new AppError(401, message || MESSAGES.UNAUTHORIZED);
  }

  static forbidden(message?: string): AppError {
    return new AppError(403, message || MESSAGES.FORBIDDEN);
  }

  static notFound(message: string): AppError {
    return new AppError(404, message);
  }

  static conflict(message: string): AppError {
    return new AppError(409, message);
  }

  static invalidCredentials(): AppError {
    return new AppError(401, MESSAGES.INVALID_CREDENTIALS);
  }

  static validationFailed(errors: unknown[]): AppError {
    return new AppError(422, MESSAGES.VALIDATION_FAILED, errors);
  }

  static tooManyRequests(message?: string): AppError {
    return new AppError(429, message || MESSAGES.RATE_LIMIT_EXCEEDED);
  }

  static internal(message?: string): AppError {
    return new AppError(500, message || MESSAGES.SERVER_ERROR);
  }
}

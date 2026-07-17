import { ErrorRequestHandler, Request, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '@/config';
import { HTTP_STATUS, MESSAGES } from '@/constants';
import { AppError } from '@/helpers/error.helper';
import { logger } from '@/logger';
import { Prisma } from '@prisma/client';

const formatZodErrors = (errors: ZodError): unknown[] => {
  return errors.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};

const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): { statusCode: number; message: string } => {
  switch (error.code) {
    case 'P2002':
      return { statusCode: 409, message: `Duplicate entry: ${error.meta?.target as string}` };
    case 'P2025':
      return { statusCode: 404, message: MESSAGES.NOT_FOUND };
    case 'P2003':
      return { statusCode: 400, message: 'Foreign key constraint failed' };
    default:
      return { statusCode: 500, message: MESSAGES.SERVER_ERROR };
  }
};

export const errorHandler: ErrorRequestHandler = (
  error: Error,
  req: Request,
  res: Response
): Response => {
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message: string = MESSAGES.SERVER_ERROR;
  let errors: unknown[] | undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.errors;
  } else if (error instanceof ZodError) {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    message = MESSAGES.VALIDATION_FAILED;
    errors = formatZodErrors(error);
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const result = handlePrismaError(error);
    statusCode = result.statusCode;
    message = result.message;
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Database validation error';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = MESSAGES.TOKEN_INVALID;
  } else if (error.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = MESSAGES.TOKEN_EXPIRED;
  }

  logger.error({
    message: error.message,
    statusCode,
    requestId: req.requestId,
    path: req.path,
    method: req.method,
    ...(env.NODE_ENV === 'development' && { stack: error.stack }),
  });

  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: env.NODE_ENV === 'development' ? error.stack : undefined,
  });
};

export const notFoundHandler = (req: Request, res: Response): Response => {
  return res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `${req.method} ${req.path} not found`,
  });
};

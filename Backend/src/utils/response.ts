import { Response } from 'express';
import { IApiResponse, IMeta } from '@/interfaces';

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  meta?: IMeta
): Response => {
  const response: IApiResponse<T> = {
    success: statusCode < 400,
    message,
    ...(data !== undefined && { data }),
    ...(meta && { meta }),
  };

  return res.status(statusCode).json(response);
};

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  meta?: IMeta,
  statusCode = 200
): Response => {
  return sendResponse(res, statusCode, message, data, meta);
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown[]
): Response => {
  const response: IApiResponse = {
    success: false,
    message,
    ...(errors && { errors }),
  };

  return res.status(statusCode).json(response);
};

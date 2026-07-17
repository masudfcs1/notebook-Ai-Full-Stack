import { Response } from 'express';
import { IApiResponse, IMeta } from '@/interfaces';

export class ResponseHelper {
  static success<T>(
    res: Response,
    message: string,
    data?: T,
    meta?: IMeta,
    statusCode = 200
  ): Response {
    const response: IApiResponse<T> = {
      success: true,
      message,
      ...(data !== undefined && { data }),
      ...(meta && { meta }),
    };

    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, message: string, data?: T): Response {
    return this.success(res, message, data, undefined, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static paginated<T>(
    res: Response,
    message: string,
    data: T[],
    meta: IMeta
  ): Response {
    return this.success(res, message, data, meta);
  }
}

import { Response } from 'express';
import { IMeta } from '../interfaces';
export declare const sendResponse: <T>(res: Response, statusCode: number, message: string, data?: T, meta?: IMeta) => Response;
export declare const sendSuccess: <T>(res: Response, message: string, data?: T, meta?: IMeta, statusCode?: number) => Response;
export declare const sendError: (res: Response, statusCode: number, message: string, errors?: unknown[]) => Response;
//# sourceMappingURL=response.d.ts.map
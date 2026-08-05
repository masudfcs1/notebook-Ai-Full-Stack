import { Response } from 'express';
import { IMeta } from '../interfaces';
export declare class ResponseHelper {
    static success<T>(res: Response, message: string, data?: T, meta?: IMeta, statusCode?: number): Response;
    static created<T>(res: Response, message: string, data?: T): Response;
    static noContent(res: Response): Response;
    static paginated<T>(res: Response, message: string, data: T[], meta: IMeta): Response;
}
//# sourceMappingURL=response.helper.d.ts.map
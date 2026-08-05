import { Request, Response, NextFunction, RequestHandler } from 'express';
export declare const catchAsync: (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => void;
export type AsyncRequestHandler<T = unknown> = (req: Request, res: Response, next: NextFunction) => Promise<T>;
//# sourceMappingURL=async.d.ts.map
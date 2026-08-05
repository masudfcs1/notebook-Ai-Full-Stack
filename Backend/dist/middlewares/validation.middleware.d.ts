import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
export declare const validate: (schema: AnyZodObject) => (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const validateBody: (schema: AnyZodObject) => (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const validateParams: (schema: AnyZodObject) => (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const validateQuery: (schema: AnyZodObject) => (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validation.middleware.d.ts.map
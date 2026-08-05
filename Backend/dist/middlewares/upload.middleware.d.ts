import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
export declare const uploadImage: multer.Multer;
export declare const uploadDocument: multer.Multer;
export declare const uploadVideo: multer.Multer;
export declare const uploadAudio: multer.Multer;
export declare const uploadAny: multer.Multer;
export declare const handleMulterError: (err: Error, _req: Request, res: Response, next: NextFunction) => Response | void;
//# sourceMappingURL=upload.middleware.d.ts.map
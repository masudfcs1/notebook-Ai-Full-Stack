import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
export interface AuthUser {
    id: number;
    uuid: string;
    email: string;
    role: Role;
}
/** Clear a specific user from cache (call on profile update / role change) */
export declare function invalidateUserCache(userId: number): void;
export declare const authenticate: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (...roles: Role[]) => (req: Request, _res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const checkOwnership: (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map
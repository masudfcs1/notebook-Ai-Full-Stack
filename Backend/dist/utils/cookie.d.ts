import { Request, Response } from 'express';
export declare const setAccessTokenCookie: (res: Response, token: string) => void;
export declare const setRefreshTokenCookie: (res: Response, token: string) => void;
export declare const clearAccessTokenCookie: (res: Response) => void;
export declare const clearRefreshTokenCookie: (res: Response) => void;
export declare const getAccessTokenFromCookie: (req: Request) => string | undefined;
export declare const getRefreshTokenFromCookie: (req: Request) => string | undefined;
//# sourceMappingURL=cookie.d.ts.map
import { IJWTPayload, ITokenPayload } from '../interfaces';
export declare const generateAccessToken: (payload: IJWTPayload) => string;
export declare const generateRefreshToken: (payload: IJWTPayload) => string;
export declare const verifyAccessToken: (token: string) => ITokenPayload;
export declare const verifyRefreshToken: (token: string) => ITokenPayload;
export declare const decodeToken: (token: string) => ITokenPayload | null;
export declare const getTokenExpiration: (token: string) => Date | null;
//# sourceMappingURL=jwt.d.ts.map
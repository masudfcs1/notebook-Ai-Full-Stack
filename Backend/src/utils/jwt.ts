import * as jwt from 'jsonwebtoken';
import { jwtConfig } from '@/config/jwt';
import { IJWTPayload, ITokenPayload } from '@/interfaces';

export const generateAccessToken = (payload: IJWTPayload): string => {
  return (jwt as unknown as { sign: (p: object, s: string, o: { expiresIn: string }) => string }).sign(
    payload,
    jwtConfig.access.secret,
    { expiresIn: jwtConfig.access.expiresIn }
  );
};

export const generateRefreshToken = (payload: IJWTPayload): string => {
  return (jwt as unknown as { sign: (p: object, s: string, o: { expiresIn: string }) => string }).sign(
    payload,
    jwtConfig.refresh.secret,
    { expiresIn: jwtConfig.refresh.expiresIn }
  );
};

export const verifyAccessToken = (token: string): ITokenPayload => {
  return jwt.verify(token, jwtConfig.access.secret) as ITokenPayload;
};

export const verifyRefreshToken = (token: string): ITokenPayload => {
  return jwt.verify(token, jwtConfig.refresh.secret) as ITokenPayload;
};

export const decodeToken = (token: string): ITokenPayload | null => {
  try {
    return jwt.decode(token) as ITokenPayload;
  } catch {
    return null;
  }
};

export const getTokenExpiration = (token: string): Date | null => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return null;
  return new Date(decoded.exp * 1000);
};

import { Request, Response } from 'express';
import { accessTokenCookieOptions, refreshTokenCookieOptions } from '@/config/cookie';

export const setAccessTokenCookie = (res: Response, token: string): void => {
  res.cookie('accessToken', token, accessTokenCookieOptions);
};

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie('refreshToken', token, refreshTokenCookieOptions);
};

export const clearAccessTokenCookie = (res: Response): void => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
  });
};

export const getAccessTokenFromCookie = (req: Request): string | undefined => {
  return req.cookies?.accessToken;
};

export const getRefreshTokenFromCookie = (req: Request): string | undefined => {
  return req.cookies?.refreshToken;
};

import { Request, Response, NextFunction } from 'express';
import { authService } from './service';
import { catchAsync } from '@/utils/async';
import { sendSuccess } from '@/utils/response';
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearAccessTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromCookie,
} from '@/utils/cookie';
import { getDeviceInfo } from '@/utils/device';
import { HTTP_STATUS, MESSAGES } from '@/constants';

export class AuthController {
  register = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { name, username, email, password, phone } = req.body;

    const result = await authService.register({
      name,
      username,
      email,
      password,
      phone,
    });

    return sendSuccess(res, result.message, result.user, undefined, HTTP_STATUS.CREATED);
  });

  login = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password, rememberMe } = req.body;
    const deviceInfo = getDeviceInfo(req);

    const result = await authService.login(
      { email, password, rememberMe },
      deviceInfo
    );

    setAccessTokenCookie(res, result.accessToken);
    setRefreshTokenCookie(res, result.refreshToken);

    return sendSuccess(res, MESSAGES.LOGIN_SUCCESS, result.user);
  });

  logout = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const refreshToken = getRefreshTokenFromCookie(req);
    const userId = req.userId;

    if (userId) {
      await authService.logout(userId, refreshToken);
    }

    clearAccessTokenCookie(res);
    clearRefreshTokenCookie(res);

    return sendSuccess(res, MESSAGES.LOGOUT_SUCCESS);
  });

  refreshToken = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const tokenFromCookie = getRefreshTokenFromCookie(req);
    const { refreshToken: tokenFromBody } = req.body;

    const token = tokenFromCookie || tokenFromBody;

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.TOKEN_INVALID,
      });
    }

    const result = await authService.refreshToken(token);

    setAccessTokenCookie(res, result.accessToken);
    setRefreshTokenCookie(res, result.refreshToken);

    return sendSuccess(res, MESSAGES.REFRESH_TOKEN_SUCCESS);
  });

  changePassword = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.userId!;

    await authService.changePassword(userId, req.body);

    clearAccessTokenCookie(res);
    clearRefreshTokenCookie(res);

    return sendSuccess(res, MESSAGES.PASSWORD_CHANGED);
  });

  forgotPassword = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { email } = req.body;

    const result = await authService.forgotPassword(email);

    return sendSuccess(res, result.message);
  });

  resetPassword = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { token, password } = req.body;

    const result = await authService.resetPassword(token, password);

    return sendSuccess(res, result.message);
  });

  verifyEmail = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { token } = req.body;

    const result = await authService.verifyEmail(token);

    return sendSuccess(res, result.message);
  });

  resendVerification = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { email } = req.body;

    const result = await authService.resendVerification(email);

    return sendSuccess(res, result.message);
  });

  sendOTP = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { email } = req.body;

    const result = await authService.sendOTP(email);

    return sendSuccess(res, result.message);
  });

  verifyOTP = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { email, otp } = req.body;

    const result = await authService.verifyOTP(email, otp);

    return sendSuccess(res, result.message);
  });

  getProfile = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.userId!;

    const user = await authService.getProfile(userId);

    return sendSuccess(res, MESSAGES.LOGIN_SUCCESS, user);
  });

  updateProfile = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.userId!;
    const { name, username, phone } = req.body;

    const user = await authService.updateProfile(userId, { name, username, phone });

    return sendSuccess(res, MESSAGES.PROFILE_UPDATED, user);
  });

  updateProfileImage = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.userId!;

    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const avatarUrl = `/uploads/images/${req.file.filename}`;

    const user = await authService.updateProfileImage(userId, avatarUrl);

    return sendSuccess(res, MESSAGES.PROFILE_IMAGE_UPLOADED, user);
  });

  deleteProfileImage = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.userId!;

    await authService.deleteProfileImage(userId);

    return sendSuccess(res, MESSAGES.PROFILE_IMAGE_DELETED);
  });

  deleteAccount = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.userId!;
    const { password } = req.body;

    await authService.deleteAccount(userId, password);

    clearAccessTokenCookie(res);
    clearRefreshTokenCookie(res);

    return sendSuccess(res, MESSAGES.ACCOUNT_DELETED);
  });

  getLoginHistory = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.userId!;

    const result = await authService.getLoginHistory(userId);

    return sendSuccess(res, 'Login history retrieved', result.data);
  });
}

export const authController = new AuthController();

import { authRepository } from './repository';
import { hashPassword, comparePassword } from '@/utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@/utils/jwt';
import { generateOTP, generateUUID, generateVerificationToken } from '@/utils/generators';
import { addDays } from '@/utils/date';
import { MESSAGES, USER_STATUS } from '@/constants';
import { AppError } from '@/helpers/error.helper';
import { IDeviceInfo, IJWTPayload } from '@/interfaces';
import { logger } from '@/logger';
import { toUserResponse } from './dto';

export class AuthService {
  async register(data: {
    name?: string;
    username?: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ user: ReturnType<typeof toUserResponse>; message: string }> {
    const existingUser = await authRepository.findByEmail(data.email);

    if (existingUser) {
      throw AppError.conflict(MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    if (data.username) {
      const existingUsername = await authRepository.findByUsername(data.username);
      if (existingUsername) {
        throw AppError.conflict(MESSAGES.USERNAME_ALREADY_EXISTS);
      }
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await authRepository.create({
      name: data.name,
      username: data.username || generateUUID().split('-')[0],
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
    });

    logger.info({ userId: user.id, email: user.email }, 'User registered');

    return {
      user: toUserResponse(user),
      message: MESSAGES.REGISTER_SUCCESS,
    };
  }

  async login(
    data: { email: string; password: string; rememberMe?: boolean },
    deviceInfo?: IDeviceInfo
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: ReturnType<typeof toUserResponse>;
  }> {
    const user = await authRepository.findByEmail(data.email);

    if (!user) {
      throw AppError.invalidCredentials();
    }

    if (!user.password) {
      throw AppError.badRequest('Please use social login for this account');
    }

    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      await authRepository.createLoginHistory({
        userId: user.id,
        ipAddress: deviceInfo?.ipAddress,
        userAgent: deviceInfo?.userAgent,
        device: deviceInfo?.device,
        browser: deviceInfo?.browser,
        os: deviceInfo?.os,
        successful: false,
        message: 'Invalid password',
      });

      throw AppError.invalidCredentials();
    }

    if (user.status === USER_STATUS.SUSPENDED) {
      throw AppError.forbidden(MESSAGES.ACCOUNT_SUSPENDED);
    }

    if (user.status === USER_STATUS.INACTIVE) {
      throw AppError.forbidden(MESSAGES.ACCOUNT_INACTIVE);
    }

    const payload: IJWTPayload = {
      userId: user.id,
      uuid: user.uuid,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const refreshTokenExpiry = data.rememberMe
      ? addDays(new Date(), 30)
      : addDays(new Date(), 7);

    await authRepository.createRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt: refreshTokenExpiry,
      userAgent: deviceInfo?.userAgent,
      ipAddress: deviceInfo?.ipAddress,
    });

    await authRepository.updateLastLogin(user.id);

    await authRepository.createLoginHistory({
      userId: user.id,
      ipAddress: deviceInfo?.ipAddress,
      userAgent: deviceInfo?.userAgent,
      device: deviceInfo?.device,
      browser: deviceInfo?.browser,
      os: deviceInfo?.os,
      successful: true,
    });

    logger.info({ userId: user.id, email: user.email }, 'User logged in');

    return {
      accessToken,
      refreshToken,
      user: toUserResponse(user),
    };
  }

  async refreshToken(token: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const decoded = verifyRefreshToken(token);

    const storedToken = await authRepository.findRefreshToken(token);

    if (!storedToken || storedToken.revoked) {
      throw AppError.unauthorized(MESSAGES.TOKEN_INVALID);
    }

    if (storedToken.expiresAt < new Date()) {
      throw AppError.unauthorized(MESSAGES.TOKEN_EXPIRED);
    }

    const user = await authRepository.findById(decoded.userId);

    if (!user) {
      throw AppError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    await authRepository.revokeRefreshToken(token);

    const payload: IJWTPayload = {
      userId: user.id,
      uuid: user.uuid,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await authRepository.createRefreshToken({
      token: newRefreshToken,
      userId: user.id,
      expiresAt: addDays(new Date(), 7),
      userAgent: storedToken.userAgent ?? undefined,
      ipAddress: storedToken.ipAddress ?? undefined,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: number, token?: string): Promise<void> {
    if (token) {
      await authRepository.revokeRefreshToken(token);
    } else {
      await authRepository.revokeAllUserTokens(userId);
    }

    logger.info({ userId }, 'User logged out');
  }

  async changePassword(
    userId: number,
    data: { currentPassword: string; newPassword: string }
  ): Promise<void> {
    const user = await authRepository.findById(userId);

    if (!user || !user.password) {
      throw AppError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    const isPasswordValid = await comparePassword(data.currentPassword, user.password);

    if (!isPasswordValid) {
      throw AppError.badRequest('Current password is incorrect');
    }

    const hashedPassword = await hashPassword(data.newPassword);
    await authRepository.updatePassword(userId, hashedPassword);

    await authRepository.revokeAllUserTokens(userId);

    logger.info({ userId }, 'Password changed');
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await authRepository.findByEmail(email);

    if (!user) {
      return { message: MESSAGES.PASSWORD_RESET_SENT };
    }

    const resetToken = generateVerificationToken();

    logger.info({ userId: user.id, token: resetToken }, 'Password reset requested');

    return { message: MESSAGES.PASSWORD_RESET_SENT };
  }

  async resetPassword(
    token: string,
    password: string
  ): Promise<{ message: string }> {
    const user = await authRepository.findByUuid(token);

    if (!user) {
      throw AppError.badRequest(MESSAGES.INVALID_RESET_TOKEN);
    }

    const hashedPassword = await hashPassword(password);
    await authRepository.updatePassword(user.id, hashedPassword);

    await authRepository.revokeAllUserTokens(user.id);

    logger.info({ userId: user.id }, 'Password reset');

    return { message: MESSAGES.PASSWORD_RESET_SUCCESS };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const decoded = verifyRefreshToken(token);
    const user = await authRepository.findById(decoded.userId);

    if (!user) {
      throw AppError.badRequest(MESSAGES.INVALID_VERIFICATION_TOKEN);
    }

    await authRepository.verifyEmail(user.id);

    logger.info({ userId: user.id }, 'Email verified');

    return { message: MESSAGES.EMAIL_VERIFIED };
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const user = await authRepository.findByEmail(email);

    if (!user) {
      return { message: MESSAGES.VERIFICATION_SENT };
    }

    if (user.isVerified) {
      return { message: 'Email is already verified' };
    }

    logger.info({ userId: user.id }, 'Verification email resent');

    return { message: MESSAGES.VERIFICATION_SENT };
  }

  async sendOTP(email: string): Promise<{ message: string; otp?: string }> {
    const user = await authRepository.findByEmail(email);

    if (!user) {
      throw AppError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    const otp = generateOTP(6);

    logger.info({ userId: user.id, otp }, 'OTP sent');

    return { message: MESSAGES.OTP_SENT, otp };
  }

  async verifyOTP(email: string, otp: string): Promise<{ message: string }> {
    const user = await authRepository.findByEmail(email);

    if (!user) {
      throw AppError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    logger.info({ userId: user.id, otp }, 'OTP verified');

    return { message: MESSAGES.OTP_VERIFIED };
  }

  async getProfile(userId: number): Promise<ReturnType<typeof toUserResponse>> {
    const user = await authRepository.findById(userId);

    if (!user) {
      throw AppError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    return toUserResponse(user);
  }

  async updateProfile(
    userId: number,
    data: { name?: string; username?: string; phone?: string }
  ): Promise<ReturnType<typeof toUserResponse>> {
    if (data.username) {
      const existingUser = await authRepository.findByUsername(data.username);
      if (existingUser && existingUser.id !== userId) {
        throw AppError.conflict(MESSAGES.USERNAME_ALREADY_EXISTS);
      }
    }

    const user = await authRepository.updateProfile(userId, data);

    logger.info({ userId }, 'Profile updated');

    return toUserResponse(user);
  }

  async updateProfileImage(
    userId: number,
    avatarUrl: string
  ): Promise<ReturnType<typeof toUserResponse>> {
    const user = await authRepository.updateProfile(userId, { avatar: avatarUrl });

    logger.info({ userId }, 'Profile image updated');

    return toUserResponse(user);
  }

  async deleteProfileImage(userId: number): Promise<void> {
    await authRepository.updateProfile(userId, { avatar: null });

    logger.info({ userId }, 'Profile image deleted');
  }

  async deleteAccount(userId: number, password: string): Promise<void> {
    const user = await authRepository.findById(userId);

    if (!user || !user.password) {
      throw AppError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw AppError.badRequest('Password is incorrect');
    }

    await authRepository.softDelete(userId);
    await authRepository.revokeAllUserTokens(userId);

    logger.info({ userId }, 'Account deleted');
  }

  async getLoginHistory(
    userId: number,
    options?: { take?: number; skip?: number }
  ): Promise<{ data: unknown[] }> {
    const history = await authRepository.getLoginHistory(userId, options);

    return { data: history };
  }
}

export const authService = new AuthService();

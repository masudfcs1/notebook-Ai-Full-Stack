"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const repository_1 = require("./repository");
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
const generators_1 = require("../../utils/generators");
const date_1 = require("../../utils/date");
const constants_1 = require("../../constants");
const error_helper_1 = require("../../helpers/error.helper");
const logger_1 = require("../../logger");
const dto_1 = require("./dto");
class AuthService {
    async register(data) {
        const existingUser = await repository_1.authRepository.findByEmail(data.email);
        if (existingUser) {
            throw error_helper_1.AppError.conflict(constants_1.MESSAGES.EMAIL_ALREADY_EXISTS);
        }
        if (data.username) {
            const existingUsername = await repository_1.authRepository.findByUsername(data.username);
            if (existingUsername) {
                throw error_helper_1.AppError.conflict(constants_1.MESSAGES.USERNAME_ALREADY_EXISTS);
            }
        }
        const hashedPassword = await (0, password_1.hashPassword)(data.password);
        const user = await repository_1.authRepository.create({
            name: data.name || undefined,
            username: data.username || (0, generators_1.generateUUID)().split('-')[0],
            email: data.email,
            password: hashedPassword,
            phone: data.phone || undefined,
            status: constants_1.USER_STATUS.ACTIVE,
            isVerified: true,
        });
        logger_1.logger.info({ userId: user.id, email: user.email }, 'User registered');
        return {
            user: (0, dto_1.toUserResponse)(user),
            message: constants_1.MESSAGES.REGISTER_SUCCESS,
        };
    }
    async login(data, deviceInfo) {
        const user = await repository_1.authRepository.findByEmail(data.email);
        if (!user) {
            throw error_helper_1.AppError.invalidCredentials();
        }
        if (!user.password) {
            throw error_helper_1.AppError.badRequest('Please use social login for this account');
        }
        const isPasswordValid = await (0, password_1.comparePassword)(data.password, user.password);
        if (!isPasswordValid) {
            await repository_1.authRepository.createLoginHistory({
                userId: user.id,
                ipAddress: deviceInfo?.ipAddress,
                userAgent: deviceInfo?.userAgent,
                device: deviceInfo?.device,
                browser: deviceInfo?.browser,
                os: deviceInfo?.os,
                successful: false,
                message: 'Invalid password',
            });
            throw error_helper_1.AppError.invalidCredentials();
        }
        if (user.status === constants_1.USER_STATUS.SUSPENDED) {
            throw error_helper_1.AppError.forbidden(constants_1.MESSAGES.ACCOUNT_SUSPENDED);
        }
        if (user.status === constants_1.USER_STATUS.INACTIVE) {
            throw error_helper_1.AppError.forbidden(constants_1.MESSAGES.ACCOUNT_INACTIVE);
        }
        const payload = {
            userId: user.id,
            uuid: user.uuid,
            email: user.email,
            role: user.role,
        };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
        const refreshTokenExpiry = data.rememberMe
            ? (0, date_1.addDays)(new Date(), 30)
            : (0, date_1.addDays)(new Date(), 7);
        await repository_1.authRepository.createRefreshToken({
            token: refreshToken,
            userId: user.id,
            expiresAt: refreshTokenExpiry,
            userAgent: deviceInfo?.userAgent,
            ipAddress: deviceInfo?.ipAddress,
        });
        await repository_1.authRepository.updateLastLogin(user.id);
        await repository_1.authRepository.createLoginHistory({
            userId: user.id,
            ipAddress: deviceInfo?.ipAddress,
            userAgent: deviceInfo?.userAgent,
            device: deviceInfo?.device,
            browser: deviceInfo?.browser,
            os: deviceInfo?.os,
            successful: true,
        });
        logger_1.logger.info({ userId: user.id, email: user.email }, 'User logged in');
        return {
            accessToken,
            refreshToken,
            user: (0, dto_1.toUserResponse)(user),
        };
    }
    async refreshToken(token) {
        const decoded = (0, jwt_1.verifyRefreshToken)(token);
        const storedToken = await repository_1.authRepository.findRefreshToken(token);
        if (!storedToken || storedToken.revoked) {
            throw error_helper_1.AppError.unauthorized(constants_1.MESSAGES.TOKEN_INVALID);
        }
        if (storedToken.expiresAt < new Date()) {
            throw error_helper_1.AppError.unauthorized(constants_1.MESSAGES.TOKEN_EXPIRED);
        }
        const user = await repository_1.authRepository.findById(decoded.userId);
        if (!user) {
            throw error_helper_1.AppError.notFound(constants_1.MESSAGES.USER_NOT_FOUND);
        }
        await repository_1.authRepository.revokeRefreshToken(token);
        const payload = {
            userId: user.id,
            uuid: user.uuid,
            email: user.email,
            role: user.role,
        };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const newRefreshToken = (0, jwt_1.generateRefreshToken)(payload);
        await repository_1.authRepository.createRefreshToken({
            token: newRefreshToken,
            userId: user.id,
            expiresAt: (0, date_1.addDays)(new Date(), 7),
            userAgent: storedToken.userAgent ?? undefined,
            ipAddress: storedToken.ipAddress ?? undefined,
        });
        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }
    async logout(userId, token) {
        if (token) {
            await repository_1.authRepository.revokeRefreshToken(token);
        }
        else {
            await repository_1.authRepository.revokeAllUserTokens(userId);
        }
        logger_1.logger.info({ userId }, 'User logged out');
    }
    async changePassword(userId, data) {
        const user = await repository_1.authRepository.findById(userId);
        if (!user || !user.password) {
            throw error_helper_1.AppError.notFound(constants_1.MESSAGES.USER_NOT_FOUND);
        }
        const isPasswordValid = await (0, password_1.comparePassword)(data.currentPassword, user.password);
        if (!isPasswordValid) {
            throw error_helper_1.AppError.badRequest('Current password is incorrect');
        }
        const hashedPassword = await (0, password_1.hashPassword)(data.newPassword);
        await repository_1.authRepository.updatePassword(userId, hashedPassword);
        await repository_1.authRepository.revokeAllUserTokens(userId);
        logger_1.logger.info({ userId }, 'Password changed');
    }
    async forgotPassword(email) {
        const user = await repository_1.authRepository.findByEmail(email);
        if (!user) {
            return { message: constants_1.MESSAGES.PASSWORD_RESET_SENT };
        }
        const resetToken = (0, generators_1.generateVerificationToken)();
        logger_1.logger.info({ userId: user.id, token: resetToken }, 'Password reset requested');
        return { message: constants_1.MESSAGES.PASSWORD_RESET_SENT };
    }
    async resetPassword(token, password) {
        const user = await repository_1.authRepository.findByUuid(token);
        if (!user) {
            throw error_helper_1.AppError.badRequest(constants_1.MESSAGES.INVALID_RESET_TOKEN);
        }
        const hashedPassword = await (0, password_1.hashPassword)(password);
        await repository_1.authRepository.updatePassword(user.id, hashedPassword);
        await repository_1.authRepository.revokeAllUserTokens(user.id);
        logger_1.logger.info({ userId: user.id }, 'Password reset');
        return { message: constants_1.MESSAGES.PASSWORD_RESET_SUCCESS };
    }
    async verifyEmail(token) {
        const decoded = (0, jwt_1.verifyRefreshToken)(token);
        const user = await repository_1.authRepository.findById(decoded.userId);
        if (!user) {
            throw error_helper_1.AppError.badRequest(constants_1.MESSAGES.INVALID_VERIFICATION_TOKEN);
        }
        await repository_1.authRepository.verifyEmail(user.id);
        logger_1.logger.info({ userId: user.id }, 'Email verified');
        return { message: constants_1.MESSAGES.EMAIL_VERIFIED };
    }
    async resendVerification(email) {
        const user = await repository_1.authRepository.findByEmail(email);
        if (!user) {
            return { message: constants_1.MESSAGES.VERIFICATION_SENT };
        }
        if (user.isVerified) {
            return { message: 'Email is already verified' };
        }
        logger_1.logger.info({ userId: user.id }, 'Verification email resent');
        return { message: constants_1.MESSAGES.VERIFICATION_SENT };
    }
    async sendOTP(email) {
        const user = await repository_1.authRepository.findByEmail(email);
        if (!user) {
            throw error_helper_1.AppError.notFound(constants_1.MESSAGES.USER_NOT_FOUND);
        }
        const otp = (0, generators_1.generateOTP)(6);
        logger_1.logger.info({ userId: user.id, otp }, 'OTP sent');
        return { message: constants_1.MESSAGES.OTP_SENT, otp };
    }
    async verifyOTP(email, otp) {
        const user = await repository_1.authRepository.findByEmail(email);
        if (!user) {
            throw error_helper_1.AppError.notFound(constants_1.MESSAGES.USER_NOT_FOUND);
        }
        logger_1.logger.info({ userId: user.id, otp }, 'OTP verified');
        return { message: constants_1.MESSAGES.OTP_VERIFIED };
    }
    async getProfile(userId) {
        const user = await repository_1.authRepository.findById(userId);
        if (!user) {
            throw error_helper_1.AppError.notFound(constants_1.MESSAGES.USER_NOT_FOUND);
        }
        return (0, dto_1.toUserResponse)(user);
    }
    async updateProfile(userId, data) {
        if (data.username) {
            const existingUser = await repository_1.authRepository.findByUsername(data.username);
            if (existingUser && existingUser.id !== userId) {
                throw error_helper_1.AppError.conflict(constants_1.MESSAGES.USERNAME_ALREADY_EXISTS);
            }
        }
        const user = await repository_1.authRepository.updateProfile(userId, data);
        logger_1.logger.info({ userId }, 'Profile updated');
        return (0, dto_1.toUserResponse)(user);
    }
    async updateProfileImage(userId, avatarUrl) {
        const user = await repository_1.authRepository.updateProfile(userId, { avatar: avatarUrl });
        logger_1.logger.info({ userId }, 'Profile image updated');
        return (0, dto_1.toUserResponse)(user);
    }
    async deleteProfileImage(userId) {
        await repository_1.authRepository.updateProfile(userId, { avatar: null });
        logger_1.logger.info({ userId }, 'Profile image deleted');
    }
    async deleteAccount(userId, password) {
        const user = await repository_1.authRepository.findById(userId);
        if (!user || !user.password) {
            throw error_helper_1.AppError.notFound(constants_1.MESSAGES.USER_NOT_FOUND);
        }
        const isPasswordValid = await (0, password_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            throw error_helper_1.AppError.badRequest('Password is incorrect');
        }
        await repository_1.authRepository.softDelete(userId);
        await repository_1.authRepository.revokeAllUserTokens(userId);
        logger_1.logger.info({ userId }, 'Account deleted');
    }
    async getLoginHistory(userId, options) {
        const history = await repository_1.authRepository.getLoginHistory(userId, options);
        return { data: history };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=service.js.map
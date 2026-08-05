"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const service_1 = require("./service");
const async_1 = require("../../utils/async");
const response_1 = require("../../utils/response");
const cookie_1 = require("../../utils/cookie");
const device_1 = require("../../utils/device");
const constants_1 = require("../../constants");
class AuthController {
    register = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { name, username, email, password, phone } = req.body;
        const result = await service_1.authService.register({
            name,
            username,
            email,
            password,
            phone,
        });
        return (0, response_1.sendSuccess)(res, result.message, result.user, undefined, constants_1.HTTP_STATUS.CREATED);
    });
    login = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { email, password, rememberMe } = req.body;
        const deviceInfo = (0, device_1.getDeviceInfo)(req);
        const result = await service_1.authService.login({ email, password, rememberMe }, deviceInfo);
        (0, cookie_1.setAccessTokenCookie)(res, result.accessToken);
        (0, cookie_1.setRefreshTokenCookie)(res, result.refreshToken);
        return (0, response_1.sendSuccess)(res, constants_1.MESSAGES.LOGIN_SUCCESS, {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            user: result.user,
        });
    });
    logout = (0, async_1.catchAsync)(async (req, res, _next) => {
        const refreshToken = (0, cookie_1.getRefreshTokenFromCookie)(req);
        const userId = req.userId;
        if (userId) {
            await service_1.authService.logout(userId, refreshToken);
        }
        (0, cookie_1.clearAccessTokenCookie)(res);
        (0, cookie_1.clearRefreshTokenCookie)(res);
        return (0, response_1.sendSuccess)(res, constants_1.MESSAGES.LOGOUT_SUCCESS);
    });
    refreshToken = (0, async_1.catchAsync)(async (req, res, _next) => {
        const tokenFromCookie = (0, cookie_1.getRefreshTokenFromCookie)(req);
        const { refreshToken: tokenFromBody } = req.body;
        const token = tokenFromCookie || tokenFromBody;
        if (!token) {
            return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: constants_1.MESSAGES.TOKEN_INVALID,
            });
        }
        const result = await service_1.authService.refreshToken(token);
        (0, cookie_1.setAccessTokenCookie)(res, result.accessToken);
        (0, cookie_1.setRefreshTokenCookie)(res, result.refreshToken);
        return (0, response_1.sendSuccess)(res, constants_1.MESSAGES.REFRESH_TOKEN_SUCCESS);
    });
    changePassword = (0, async_1.catchAsync)(async (req, res, _next) => {
        const userId = req.userId;
        await service_1.authService.changePassword(userId, req.body);
        (0, cookie_1.clearAccessTokenCookie)(res);
        (0, cookie_1.clearRefreshTokenCookie)(res);
        return (0, response_1.sendSuccess)(res, constants_1.MESSAGES.PASSWORD_CHANGED);
    });
    forgotPassword = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { email } = req.body;
        const result = await service_1.authService.forgotPassword(email);
        return (0, response_1.sendSuccess)(res, result.message);
    });
    resetPassword = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { token, password } = req.body;
        const result = await service_1.authService.resetPassword(token, password);
        return (0, response_1.sendSuccess)(res, result.message);
    });
    verifyEmail = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { token } = req.body;
        const result = await service_1.authService.verifyEmail(token);
        return (0, response_1.sendSuccess)(res, result.message);
    });
    resendVerification = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { email } = req.body;
        const result = await service_1.authService.resendVerification(email);
        return (0, response_1.sendSuccess)(res, result.message);
    });
    sendOTP = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { email } = req.body;
        const result = await service_1.authService.sendOTP(email);
        return (0, response_1.sendSuccess)(res, result.message);
    });
    verifyOTP = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { email, otp } = req.body;
        const result = await service_1.authService.verifyOTP(email, otp);
        return (0, response_1.sendSuccess)(res, result.message);
    });
    getProfile = (0, async_1.catchAsync)(async (req, res, _next) => {
        const userId = req.userId;
        const user = await service_1.authService.getProfile(userId);
        return (0, response_1.sendSuccess)(res, constants_1.MESSAGES.LOGIN_SUCCESS, user);
    });
    updateProfile = (0, async_1.catchAsync)(async (req, res, _next) => {
        const userId = req.userId;
        const { name, username, phone } = req.body;
        const user = await service_1.authService.updateProfile(userId, { name, username, phone });
        return (0, response_1.sendSuccess)(res, constants_1.MESSAGES.PROFILE_UPDATED, user);
    });
    updateProfileImage = (0, async_1.catchAsync)(async (req, res, _next) => {
        const userId = req.userId;
        if (!req.file) {
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'No file uploaded',
            });
        }
        const avatarUrl = `/uploads/images/${req.file.filename}`;
        const user = await service_1.authService.updateProfileImage(userId, avatarUrl);
        return (0, response_1.sendSuccess)(res, constants_1.MESSAGES.PROFILE_IMAGE_UPLOADED, user);
    });
    deleteProfileImage = (0, async_1.catchAsync)(async (req, res, _next) => {
        const userId = req.userId;
        await service_1.authService.deleteProfileImage(userId);
        return (0, response_1.sendSuccess)(res, constants_1.MESSAGES.PROFILE_IMAGE_DELETED);
    });
    deleteAccount = (0, async_1.catchAsync)(async (req, res, _next) => {
        const userId = req.userId;
        const { password } = req.body;
        await service_1.authService.deleteAccount(userId, password);
        (0, cookie_1.clearAccessTokenCookie)(res);
        (0, cookie_1.clearRefreshTokenCookie)(res);
        return (0, response_1.sendSuccess)(res, constants_1.MESSAGES.ACCOUNT_DELETED);
    });
    getLoginHistory = (0, async_1.catchAsync)(async (req, res, _next) => {
        const userId = req.userId;
        const result = await service_1.authService.getLoginHistory(userId);
        return (0, response_1.sendSuccess)(res, 'Login history retrieved', result.data);
    });
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=controller.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const validation_1 = require("./validation");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const upload_middleware_1 = require("../../middlewares/upload.middleware");
const rate_limiter_middleware_1 = require("../../middlewares/rate-limiter.middleware");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', rate_limiter_middleware_1.authRateLimiter, (0, validation_middleware_1.validate)(validation_1.RegisterSchema), controller_1.authController.register);
router.post('/login', rate_limiter_middleware_1.loginRateLimiter, (0, validation_middleware_1.validate)(validation_1.LoginSchema), controller_1.authController.login);
router.post('/refresh-token', (0, validation_middleware_1.validate)(validation_1.RefreshTokenSchema), controller_1.authController.refreshToken);
router.post('/forgot-password', rate_limiter_middleware_1.passwordResetRateLimiter, (0, validation_middleware_1.validate)(validation_1.ForgotPasswordSchema), controller_1.authController.forgotPassword);
router.post('/reset-password', rate_limiter_middleware_1.passwordResetRateLimiter, (0, validation_middleware_1.validate)(validation_1.ResetPasswordSchema), controller_1.authController.resetPassword);
router.post('/verify-email', (0, validation_middleware_1.validate)(validation_1.VerifyEmailSchema), controller_1.authController.verifyEmail);
router.post('/resend-verification', rate_limiter_middleware_1.authRateLimiter, (0, validation_middleware_1.validate)(validation_1.ResendVerificationSchema), controller_1.authController.resendVerification);
router.post('/send-otp', rate_limiter_middleware_1.otpRateLimiter, (0, validation_middleware_1.validate)(validation_1.SendOTPSchema), controller_1.authController.sendOTP);
router.post('/verify-otp', (0, validation_middleware_1.validate)(validation_1.VerifyOTPSchema), controller_1.authController.verifyOTP);
// Protected routes
router.use(auth_middleware_1.authenticate);
router.post('/logout', controller_1.authController.logout);
router.post('/change-password', (0, validation_middleware_1.validate)(validation_1.ChangePasswordSchema), controller_1.authController.changePassword);
router.get('/me', controller_1.authController.getProfile);
router.patch('/profile', (0, validation_middleware_1.validate)(validation_1.UpdateProfileSchema), controller_1.authController.updateProfile);
router.patch('/profile-image', upload_middleware_1.uploadImage.single('avatar'), upload_middleware_1.handleMulterError, controller_1.authController.updateProfileImage);
router.delete('/profile-image', controller_1.authController.deleteProfileImage);
router.delete('/delete-account', (0, validation_middleware_1.validate)(validation_1.DeleteAccountSchema), controller_1.authController.deleteAccount);
router.get('/login-history', controller_1.authController.getLoginHistory);
exports.default = router;
//# sourceMappingURL=route.js.map
import { Router } from 'express';
import { authController } from './controller';
import { validate } from '@/middlewares/validation.middleware';
import {
  RegisterSchema,
  LoginSchema,
  RefreshTokenSchema,
  ChangePasswordSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
  ResendVerificationSchema,
  SendOTPSchema,
  VerifyOTPSchema,
  UpdateProfileSchema,
  DeleteAccountSchema,
} from './validation';
import { authenticate } from '@/middlewares/auth.middleware';
import { uploadImage, handleMulterError } from '@/middlewares/upload.middleware';
import {
  authRateLimiter,
  loginRateLimiter,
  passwordResetRateLimiter,
  otpRateLimiter,
} from '@/middlewares/rate-limiter.middleware';

const router = Router();

// Public routes
router.post(
  '/register',
  // authRateLimiter,
  // validate(RegisterSchema),
  authController.register
);

router.post(
  '/login',
  loginRateLimiter,
  validate(LoginSchema),
  authController.login
);

router.post(
  '/refresh-token',
  validate(RefreshTokenSchema),
  authController.refreshToken
);

router.post(
  '/forgot-password',
  passwordResetRateLimiter,
  validate(ForgotPasswordSchema),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  passwordResetRateLimiter,
  validate(ResetPasswordSchema),
  authController.resetPassword
);

router.post(
  '/verify-email',
  validate(VerifyEmailSchema),
  authController.verifyEmail
);

router.post(
  '/resend-verification',
  authRateLimiter,
  validate(ResendVerificationSchema),
  authController.resendVerification
);

router.post(
  '/send-otp',
  otpRateLimiter,
  validate(SendOTPSchema),
  authController.sendOTP
);

router.post(
  '/verify-otp',
  validate(VerifyOTPSchema),
  authController.verifyOTP
);

// Protected routes
router.use(authenticate);

router.post('/logout', authController.logout);

router.post(
  '/change-password',
  validate(ChangePasswordSchema),
  authController.changePassword
);

router.get('/me', authController.getProfile);

router.patch(
  '/profile',
  validate(UpdateProfileSchema),
  authController.updateProfile
);

router.patch(
  '/profile-image',
  uploadImage.single('avatar'),
  handleMulterError,
  authController.updateProfileImage
);

router.delete('/profile-image', authController.deleteProfileImage);

router.delete(
  '/delete-account',
  validate(DeleteAccountSchema),
  authController.deleteAccount
);

router.get('/login-history', authController.getLoginHistory);

export default router;

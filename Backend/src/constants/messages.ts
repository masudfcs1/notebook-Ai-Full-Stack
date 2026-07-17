export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const MESSAGES = {
  // Auth
  REGISTER_SUCCESS: 'User registered successfully. Please verify your email.',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REFRESH_TOKEN_SUCCESS: 'Token refreshed successfully',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_NOT_VERIFIED: 'Please verify your email to continue',
  ACCOUNT_SUSPENDED: 'Your account has been suspended',
  ACCOUNT_INACTIVE: 'Your account is inactive',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',

  // Password
  PASSWORD_CHANGED: 'Password changed successfully',
  PASSWORD_RESET_SENT: 'Password reset email sent',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully',
  INVALID_RESET_TOKEN: 'Invalid or expired reset token',

  // Email
  VERIFICATION_SENT: 'Verification email sent',
  EMAIL_VERIFIED: 'Email verified successfully',
  INVALID_VERIFICATION_TOKEN: 'Invalid or expired verification token',

  // OTP
  OTP_SENT: 'OTP sent successfully',
  OTP_VERIFIED: 'OTP verified successfully',
  INVALID_OTP: 'Invalid or expired OTP',

  // User
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  USERNAME_ALREADY_EXISTS: 'Username already exists',

  // Profile
  PROFILE_UPDATED: 'Profile updated successfully',
  PROFILE_IMAGE_UPLOADED: 'Profile image uploaded successfully',
  PROFILE_IMAGE_DELETED: 'Profile image deleted successfully',
  ACCOUNT_DELETED: 'Account deleted successfully',

  // Role
  ROLE_UPDATED: 'Role updated successfully',
  STATUS_UPDATED: 'Status updated successfully',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',

  // General
  VALIDATION_FAILED: 'Validation failed',
  NOT_FOUND: 'Resource not found',
  SERVER_ERROR: 'Internal server error',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
  FILE_UPLOAD_SUCCESS: 'File uploaded successfully',
  FILE_DELETE_SUCCESS: 'File deleted successfully',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File size exceeds the limit',
} as const;

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
  USER: 'USER',
} as const;

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING',
  DELETED: 'DELETED',
} as const;

export const PROVIDERS = {
  LOCAL: 'LOCAL',
  GOOGLE: 'GOOGLE',
  FACEBOOK: 'FACEBOOK',
  APPLE: 'APPLE',
  GITHUB: 'GITHUB',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

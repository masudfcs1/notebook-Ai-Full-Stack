import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export const generateOTP = (length = 6): string => {
  const digits = '0123456789';
  let otp = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }

  return otp;
};

export const generateRandomString = (length = 32): string => {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

export const generateUUID = (): string => {
  return uuidv4();
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateUniqueCode = (prefix = ''): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = generateRandomString(6);
  return `${prefix}${timestamp}${randomPart}`.toUpperCase();
};

export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const generatePasswordResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

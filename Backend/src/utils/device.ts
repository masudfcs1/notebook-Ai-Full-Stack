import { Request } from 'express';
import { IDeviceInfo } from '@/interfaces';

export const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
    : req.socket?.remoteAddress || 'unknown';

  return ip.trim();
};

export const getUserAgent = (req: Request): string | undefined => {
  return req.headers['user-agent'];
};

export const parseUserAgent = (userAgent: string): Partial<IDeviceInfo> => {
  const device: Partial<IDeviceInfo> = {
    userAgent,
  };

  // Simple device detection
  if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
    device.device = 'mobile';
  } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
    device.device = 'tablet';
  } else {
    device.device = 'desktop';
  }

  // Browser detection
  if (userAgent.includes(' Chrome/')) {
    device.browser = 'Chrome';
  } else if (userAgent.includes(' Firefox/')) {
    device.browser = 'Firefox';
  } else if (userAgent.includes(' Safari/') && !userAgent.includes('Chrome')) {
    device.browser = 'Safari';
  } else if (userAgent.includes(' Edge/')) {
    device.browser = 'Edge';
  } else {
    device.browser = 'Other';
  }

  // OS detection
  if (userAgent.includes('Windows')) {
    device.os = 'Windows';
  } else if (userAgent.includes('Mac')) {
    device.os = 'MacOS';
  } else if (userAgent.includes('Linux')) {
    device.os = 'Linux';
  } else if (userAgent.includes('Android')) {
    device.os = 'Android';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    device.os = 'iOS';
  } else {
    device.os = 'Other';
  }

  return device;
};

export const getDeviceInfo = (req: Request): IDeviceInfo => {
  const userAgent = getUserAgent(req) || '';
  const parsed = parseUserAgent(userAgent);

  return {
    ...parsed,
    ipAddress: getClientIp(req),
    userAgent,
  };
};

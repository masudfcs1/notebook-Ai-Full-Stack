"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeviceInfo = exports.parseUserAgent = exports.getUserAgent = exports.getClientIp = void 0;
const getClientIp = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded
        ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
        : req.socket?.remoteAddress || 'unknown';
    return ip.trim();
};
exports.getClientIp = getClientIp;
const getUserAgent = (req) => {
    return req.headers['user-agent'];
};
exports.getUserAgent = getUserAgent;
const parseUserAgent = (userAgent) => {
    const device = {
        userAgent,
    };
    // Simple device detection
    if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
        device.device = 'mobile';
    }
    else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
        device.device = 'tablet';
    }
    else {
        device.device = 'desktop';
    }
    // Browser detection
    if (userAgent.includes(' Chrome/')) {
        device.browser = 'Chrome';
    }
    else if (userAgent.includes(' Firefox/')) {
        device.browser = 'Firefox';
    }
    else if (userAgent.includes(' Safari/') && !userAgent.includes('Chrome')) {
        device.browser = 'Safari';
    }
    else if (userAgent.includes(' Edge/')) {
        device.browser = 'Edge';
    }
    else {
        device.browser = 'Other';
    }
    // OS detection
    if (userAgent.includes('Windows')) {
        device.os = 'Windows';
    }
    else if (userAgent.includes('Mac')) {
        device.os = 'MacOS';
    }
    else if (userAgent.includes('Linux')) {
        device.os = 'Linux';
    }
    else if (userAgent.includes('Android')) {
        device.os = 'Android';
    }
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        device.os = 'iOS';
    }
    else {
        device.os = 'Other';
    }
    return device;
};
exports.parseUserAgent = parseUserAgent;
const getDeviceInfo = (req) => {
    const userAgent = (0, exports.getUserAgent)(req) || '';
    const parsed = (0, exports.parseUserAgent)(userAgent);
    return {
        ...parsed,
        ipAddress: (0, exports.getClientIp)(req),
        userAgent,
    };
};
exports.getDeviceInfo = getDeviceInfo;
//# sourceMappingURL=device.js.map
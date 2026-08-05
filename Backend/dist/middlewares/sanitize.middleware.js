"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInput = void 0;
const sanitize = (obj) => {
    if (obj === null || obj === undefined) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(sanitize);
    }
    if (typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof key === 'string') {
                const sanitizedKey = key.replace(/\$/g, '');
                sanitized[sanitizedKey] = sanitize(value);
            }
        }
        return sanitized;
    }
    if (typeof obj === 'string') {
        return obj.trim();
    }
    return obj;
};
const sanitizeInput = (req, _res, next) => {
    if (req.body) {
        req.body = sanitize(req.body);
    }
    if (req.query) {
        req.query = sanitize(req.query);
    }
    if (req.params) {
        req.params = sanitize(req.params);
    }
    next();
};
exports.sanitizeInput = sanitizeInput;
//# sourceMappingURL=sanitize.middleware.js.map
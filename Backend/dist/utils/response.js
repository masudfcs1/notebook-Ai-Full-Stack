"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = exports.sendResponse = void 0;
const sendResponse = (res, statusCode, message, data, meta) => {
    const response = {
        success: statusCode < 400,
        message,
        ...(data !== undefined && { data }),
        ...(meta && { meta }),
    };
    return res.status(statusCode).json(response);
};
exports.sendResponse = sendResponse;
const sendSuccess = (res, message, data, meta, statusCode = 200) => {
    return (0, exports.sendResponse)(res, statusCode, message, data, meta);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, statusCode, message, errors) => {
    const response = {
        success: false,
        message,
        ...(errors && { errors }),
    };
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
//# sourceMappingURL=response.js.map
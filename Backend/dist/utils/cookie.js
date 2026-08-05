"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRefreshTokenFromCookie = exports.getAccessTokenFromCookie = exports.clearRefreshTokenCookie = exports.clearAccessTokenCookie = exports.setRefreshTokenCookie = exports.setAccessTokenCookie = void 0;
const cookie_1 = require("../config/cookie");
const setAccessTokenCookie = (res, token) => {
    res.cookie('accessToken', token, cookie_1.accessTokenCookieOptions);
};
exports.setAccessTokenCookie = setAccessTokenCookie;
const setRefreshTokenCookie = (res, token) => {
    res.cookie('refreshToken', token, cookie_1.refreshTokenCookieOptions);
};
exports.setRefreshTokenCookie = setRefreshTokenCookie;
const clearAccessTokenCookie = (res) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/',
    });
};
exports.clearAccessTokenCookie = clearAccessTokenCookie;
const clearRefreshTokenCookie = (res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/',
    });
};
exports.clearRefreshTokenCookie = clearRefreshTokenCookie;
const getAccessTokenFromCookie = (req) => {
    return req.cookies?.accessToken;
};
exports.getAccessTokenFromCookie = getAccessTokenFromCookie;
const getRefreshTokenFromCookie = (req) => {
    return req.cookies?.refreshToken;
};
exports.getRefreshTokenFromCookie = getRefreshTokenFromCookie;
//# sourceMappingURL=cookie.js.map
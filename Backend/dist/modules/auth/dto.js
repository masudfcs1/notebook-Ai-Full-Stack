"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toLoginResponse = exports.toUserResponseWithoutSensitive = exports.toUserResponse = void 0;
const toUserResponse = (user) => {
    return {
        id: user.id,
        uuid: user.uuid,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        provider: user.provider,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};
exports.toUserResponse = toUserResponse;
const toUserResponseWithoutSensitive = (user) => {
    return (0, exports.toUserResponse)(user);
};
exports.toUserResponseWithoutSensitive = toUserResponseWithoutSensitive;
const toLoginResponse = (accessToken, refreshToken, user) => {
    return {
        accessToken,
        refreshToken,
        user: (0, exports.toUserResponse)(user),
    };
};
exports.toLoginResponse = toLoginResponse;
//# sourceMappingURL=dto.js.map
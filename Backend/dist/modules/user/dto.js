"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUserListResponse = exports.toUserResponse = void 0;
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
        ...(user.workspaceCount !== undefined && { workspaceCount: user.workspaceCount }),
        ...(user.teamCount !== undefined && { teamCount: user.teamCount }),
        ...(user.workspaces && { workspaces: user.workspaces }),
        ...(user.memberships && { memberships: user.memberships }),
    };
};
exports.toUserResponse = toUserResponse;
const toUserListResponse = (users) => {
    return users.map(exports.toUserResponse);
};
exports.toUserListResponse = toUserListResponse;
//# sourceMappingURL=dto.js.map
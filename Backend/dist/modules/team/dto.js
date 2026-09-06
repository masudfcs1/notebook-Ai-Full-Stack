"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toTeamListResponse = exports.toTeamResponse = exports.toTeamMemberListResponse = exports.toTeamMemberResponse = void 0;
const toTeamMemberResponse = (member) => {
    return {
        id: member.id,
        teamId: member.teamId,
        userId: member.userId || null,
        name: member.user?.name || member.name,
        email: member.user?.email || member.email,
        avatar: member.user?.avatar || member.avatar || null,
        role: member.role || 'MEMBER',
        createdAt: member.createdAt,
        user: member.user
            ? {
                id: member.user.id,
                uuid: member.user.uuid,
                name: member.user.name,
                username: member.user.username,
                email: member.user.email,
                avatar: member.user.avatar,
                role: member.user.role,
                status: member.user.status,
            }
            : null,
    };
};
exports.toTeamMemberResponse = toTeamMemberResponse;
const toTeamMemberListResponse = (members) => {
    return (members || []).map(exports.toTeamMemberResponse);
};
exports.toTeamMemberListResponse = toTeamMemberListResponse;
const toTeamResponse = (team) => {
    const slug = team.slug ||
        team.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    return {
        id: team.id,
        workspaceId: team.workspaceId,
        name: team.name,
        key: team.key,
        slug,
        icon: team.icon || '💬',
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
        members: (0, exports.toTeamMemberListResponse)(team.members),
    };
};
exports.toTeamResponse = toTeamResponse;
const toTeamListResponse = (teams) => {
    return teams.map(exports.toTeamResponse);
};
exports.toTeamListResponse = toTeamListResponse;
//# sourceMappingURL=dto.js.map
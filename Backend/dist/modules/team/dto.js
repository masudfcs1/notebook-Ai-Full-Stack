"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toTeamListResponse = exports.toTeamResponse = void 0;
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
        members: team.members || [],
    };
};
exports.toTeamResponse = toTeamResponse;
const toTeamListResponse = (teams) => {
    return teams.map(exports.toTeamResponse);
};
exports.toTeamListResponse = toTeamListResponse;
//# sourceMappingURL=dto.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toWorkspaceListResponse = exports.toWorkspaceResponse = void 0;
const toWorkspaceResponse = (workspace) => {
    return {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        icon: workspace.icon,
        description: workspace.description,
        userId: workspace.userId ?? null,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
        teams: workspace.teams || [],
        notes: workspace.notes || [],
    };
};
exports.toWorkspaceResponse = toWorkspaceResponse;
const toWorkspaceListResponse = (workspaces) => {
    return workspaces.map(exports.toWorkspaceResponse);
};
exports.toWorkspaceListResponse = toWorkspaceListResponse;
//# sourceMappingURL=dto.js.map
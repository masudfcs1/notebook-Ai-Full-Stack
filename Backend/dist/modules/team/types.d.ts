export interface CreateTeamData {
    workspaceId: string;
    name: string;
    key: string;
    icon?: string;
    slug?: string;
    userId?: number;
}
export interface UpdateTeamData {
    name?: string;
    key?: string;
    icon?: string;
    slug?: string;
}
export interface TeamQuery {
    workspaceId?: string;
}
//# sourceMappingURL=types.d.ts.map
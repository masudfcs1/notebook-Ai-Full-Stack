export interface WorkspaceResponseDTO {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    description: string | null;
    userId: number | null;
    createdAt: Date;
    updatedAt: Date;
    teams?: any[];
    notes?: any[];
}
export declare const toWorkspaceResponse: (workspace: any) => WorkspaceResponseDTO;
export declare const toWorkspaceListResponse: (workspaces: any[]) => WorkspaceResponseDTO[];
//# sourceMappingURL=dto.d.ts.map
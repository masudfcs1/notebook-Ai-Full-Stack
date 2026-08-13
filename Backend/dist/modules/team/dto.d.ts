export interface TeamResponseDTO {
    id: string;
    workspaceId: string;
    name: string;
    key: string;
    slug: string;
    icon: string | null;
    createdAt: Date;
    updatedAt: Date;
    members: any[];
}
export declare const toTeamResponse: (team: any) => TeamResponseDTO;
export declare const toTeamListResponse: (teams: any[]) => TeamResponseDTO[];
//# sourceMappingURL=dto.d.ts.map
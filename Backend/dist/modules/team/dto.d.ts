export interface TeamMemberResponseDTO {
    id: string;
    teamId: string;
    userId: number | null;
    name: string;
    email: string;
    avatar: string | null;
    role: 'OWNER' | 'LEAD' | 'MEMBER';
    createdAt: Date;
    user?: {
        id: number;
        uuid: string;
        name: string | null;
        username: string | null;
        email: string;
        avatar: string | null;
        role: string;
        status: string;
    } | null;
}
export interface TeamResponseDTO {
    id: string;
    workspaceId: string;
    name: string;
    key: string;
    slug: string;
    icon: string | null;
    createdAt: Date;
    updatedAt: Date;
    members: TeamMemberResponseDTO[];
}
export declare const toTeamMemberResponse: (member: any) => TeamMemberResponseDTO;
export declare const toTeamMemberListResponse: (members: any[]) => TeamMemberResponseDTO[];
export declare const toTeamResponse: (team: any) => TeamResponseDTO;
export declare const toTeamListResponse: (teams: any[]) => TeamResponseDTO[];
//# sourceMappingURL=dto.d.ts.map
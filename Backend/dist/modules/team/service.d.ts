import { CreateTeamData, UpdateTeamData, AddTeamMemberData, UpdateTeamMemberData } from './types';
export declare class TeamService {
    create(data: CreateTeamData): Promise<import("./dto").TeamResponseDTO>;
    findByWorkspaceId(workspaceId: string): Promise<import("./dto").TeamResponseDTO[]>;
    findAll(userId?: number, isAdmin?: boolean): Promise<import("./dto").TeamResponseDTO[]>;
    findById(id: string): Promise<import("./dto").TeamResponseDTO>;
    update(id: string, data: UpdateTeamData): Promise<import("./dto").TeamResponseDTO>;
    delete(id: string): Promise<{
        message: string;
    }>;
    getMembers(teamId: string): Promise<import("./dto").TeamMemberResponseDTO[]>;
    addMember(teamId: string, data: AddTeamMemberData, requestedByUserId?: number): Promise<import("./dto").TeamMemberResponseDTO>;
    addMembersBulk(teamId: string, membersData: AddTeamMemberData[], requestedByUserId?: number): Promise<{
        addedCount: number;
        members: import("./dto").TeamMemberResponseDTO[];
    }>;
    updateMember(teamId: string, memberId: string, data: UpdateTeamMemberData): Promise<import("./dto").TeamMemberResponseDTO>;
    deleteMember(teamId: string, memberId: string): Promise<{
        message: string;
    }>;
    searchAvailableUsers(teamId: string, search?: string): Promise<{
        status: import(".prisma/client").$Enums.UserStatus;
        id: number;
        uuid: string;
        name: string | null;
        username: string | null;
        email: string;
        avatar: string | null;
        role: import(".prisma/client").$Enums.Role;
    }[]>;
}
export declare const teamService: TeamService;
//# sourceMappingURL=service.d.ts.map
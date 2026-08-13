import { CreateTeamData, UpdateTeamData } from './types';
export declare class TeamService {
    create(data: CreateTeamData): Promise<import("./dto").TeamResponseDTO>;
    findByWorkspaceId(workspaceId: string): Promise<import("./dto").TeamResponseDTO[]>;
    findAll(userId?: number, isAdmin?: boolean): Promise<import("./dto").TeamResponseDTO[]>;
    findById(id: string): Promise<import("./dto").TeamResponseDTO>;
    update(id: string, data: UpdateTeamData): Promise<import("./dto").TeamResponseDTO>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
export declare const teamService: TeamService;
//# sourceMappingURL=service.d.ts.map
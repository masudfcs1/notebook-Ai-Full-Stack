import { CreateTeamData, UpdateTeamData } from './types';
export declare class TeamRepository {
    create(data: CreateTeamData): Promise<{
        members: {
            id: string;
            name: string;
            email: string;
            avatar: string | null;
            role: string;
            createdAt: Date;
            userId: number | null;
            teamId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        icon: string | null;
        workspaceId: string;
    }>;
    findById(id: string): Promise<({
        members: {
            id: string;
            name: string;
            email: string;
            avatar: string | null;
            role: string;
            createdAt: Date;
            userId: number | null;
            teamId: string;
        }[];
        workspace: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            userId: number | null;
            slug: string;
            icon: string | null;
            description: string | null;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        icon: string | null;
        workspaceId: string;
    }) | null>;
    findByWorkspaceId(workspaceId: string): Promise<({
        members: {
            id: string;
            name: string;
            email: string;
            avatar: string | null;
            role: string;
            createdAt: Date;
            userId: number | null;
            teamId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        icon: string | null;
        workspaceId: string;
    })[]>;
    findAll(userId?: number, isAdmin?: boolean): Promise<({
        members: {
            id: string;
            name: string;
            email: string;
            avatar: string | null;
            role: string;
            createdAt: Date;
            userId: number | null;
            teamId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        icon: string | null;
        workspaceId: string;
    })[]>;
    update(id: string, data: UpdateTeamData): Promise<{
        members: {
            id: string;
            name: string;
            email: string;
            avatar: string | null;
            role: string;
            createdAt: Date;
            userId: number | null;
            teamId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        icon: string | null;
        workspaceId: string;
    }>;
    delete(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        icon: string | null;
        workspaceId: string;
    }>;
}
export declare const teamRepository: TeamRepository;
//# sourceMappingURL=repository.d.ts.map
import { IPaginatedResult } from '../../interfaces';
import { CreateWorkspaceData, UpdateWorkspaceData, WorkspaceListQuery } from './types';
export interface FindWorkspacesOptions extends WorkspaceListQuery {
    userId?: number;
    isAdmin?: boolean;
}
export declare class WorkspaceRepository {
    create(data: CreateWorkspaceData): Promise<{
        teams: ({
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
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: number | null;
        slug: string;
        icon: string | null;
        description: string | null;
    }>;
    findById(id: string): Promise<any>;
    findBySlug(slug: string): Promise<any>;
    findAll(options: FindWorkspacesOptions): Promise<IPaginatedResult<any>>;
    findAllUserWorkspaces(userId?: number, isAdmin?: boolean): Promise<any>;
    update(id: string, data: UpdateWorkspaceData): Promise<any>;
    delete(id: string): Promise<any>;
}
export declare const workspaceRepository: WorkspaceRepository;
//# sourceMappingURL=repository.d.ts.map
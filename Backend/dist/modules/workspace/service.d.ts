import { FindWorkspacesOptions } from './repository';
import { CreateWorkspaceData, UpdateWorkspaceData } from './types';
export declare class WorkspaceService {
    private generateSlug;
    create(data: CreateWorkspaceData): Promise<import("./dto").WorkspaceResponseDTO>;
    findAll(options: FindWorkspacesOptions): Promise<{
        data: import("./dto").WorkspaceResponseDTO[];
        meta: import("../../interfaces").IMeta;
    }>;
    findAllUserWorkspaces(userId?: number, isAdmin?: boolean): Promise<import("./dto").WorkspaceResponseDTO[]>;
    findByIdOrSlug(idOrSlug: string, userId?: number, isAdmin?: boolean): Promise<import("./dto").WorkspaceResponseDTO>;
    update(id: string, data: UpdateWorkspaceData, userId?: number, isAdmin?: boolean): Promise<import("./dto").WorkspaceResponseDTO>;
    delete(id: string, userId?: number, isAdmin?: boolean): Promise<{
        message: string;
    }>;
}
export declare const workspaceService: WorkspaceService;
//# sourceMappingURL=service.d.ts.map
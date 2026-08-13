import { Request, Response, NextFunction } from 'express';
export declare class WorkspaceController {
    create: (req: Request, res: Response, next: NextFunction) => void;
    getAll: (req: Request, res: Response, next: NextFunction) => void;
    getAllUserWorkspaces: (req: Request, res: Response, next: NextFunction) => void;
    getByIdOrSlug: (req: Request, res: Response, next: NextFunction) => void;
    update: (req: Request, res: Response, next: NextFunction) => void;
    delete: (req: Request, res: Response, next: NextFunction) => void;
}
export declare const workspaceController: WorkspaceController;
//# sourceMappingURL=controller.d.ts.map
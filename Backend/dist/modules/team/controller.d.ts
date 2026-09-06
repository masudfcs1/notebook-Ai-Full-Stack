import { Request, Response, NextFunction } from 'express';
export declare class TeamController {
    create: (req: Request, res: Response, next: NextFunction) => void;
    getByWorkspace: (req: Request, res: Response, next: NextFunction) => void;
    getById: (req: Request, res: Response, next: NextFunction) => void;
    update: (req: Request, res: Response, next: NextFunction) => void;
    delete: (req: Request, res: Response, next: NextFunction) => void;
    getMembers: (req: Request, res: Response, next: NextFunction) => void;
    addMember: (req: Request, res: Response, next: NextFunction) => void;
    addMembersBulk: (req: Request, res: Response, next: NextFunction) => void;
    updateMember: (req: Request, res: Response, next: NextFunction) => void;
    deleteMember: (req: Request, res: Response, next: NextFunction) => void;
    getAvailableUsers: (req: Request, res: Response, next: NextFunction) => void;
}
export declare const teamController: TeamController;
//# sourceMappingURL=controller.d.ts.map
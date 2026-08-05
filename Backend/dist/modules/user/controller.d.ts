import { Request, Response, NextFunction } from 'express';
export declare class UserController {
    getAll: (req: Request, res: Response, next: NextFunction) => void;
    getById: (req: Request, res: Response, next: NextFunction) => void;
    create: (req: Request, res: Response, next: NextFunction) => void;
    update: (req: Request, res: Response, next: NextFunction) => void;
    delete: (req: Request, res: Response, next: NextFunction) => void;
    updateStatus: (req: Request, res: Response, next: NextFunction) => void;
    updateRole: (req: Request, res: Response, next: NextFunction) => void;
    getStats: (req: Request, res: Response, next: NextFunction) => void;
}
export declare const userController: UserController;
//# sourceMappingURL=controller.d.ts.map
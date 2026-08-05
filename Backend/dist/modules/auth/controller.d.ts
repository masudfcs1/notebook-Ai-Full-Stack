import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    register: (req: Request, res: Response, next: NextFunction) => void;
    login: (req: Request, res: Response, next: NextFunction) => void;
    logout: (req: Request, res: Response, next: NextFunction) => void;
    refreshToken: (req: Request, res: Response, next: NextFunction) => void;
    changePassword: (req: Request, res: Response, next: NextFunction) => void;
    forgotPassword: (req: Request, res: Response, next: NextFunction) => void;
    resetPassword: (req: Request, res: Response, next: NextFunction) => void;
    verifyEmail: (req: Request, res: Response, next: NextFunction) => void;
    resendVerification: (req: Request, res: Response, next: NextFunction) => void;
    sendOTP: (req: Request, res: Response, next: NextFunction) => void;
    verifyOTP: (req: Request, res: Response, next: NextFunction) => void;
    getProfile: (req: Request, res: Response, next: NextFunction) => void;
    updateProfile: (req: Request, res: Response, next: NextFunction) => void;
    updateProfileImage: (req: Request, res: Response, next: NextFunction) => void;
    deleteProfileImage: (req: Request, res: Response, next: NextFunction) => void;
    deleteAccount: (req: Request, res: Response, next: NextFunction) => void;
    getLoginHistory: (req: Request, res: Response, next: NextFunction) => void;
}
export declare const authController: AuthController;
//# sourceMappingURL=controller.d.ts.map
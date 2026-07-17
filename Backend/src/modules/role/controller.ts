import { Request, Response, NextFunction } from 'express';
import { roleService } from './service';
import { catchAsync } from '@/utils/async';
import { sendSuccess } from '@/utils/response';

export class RoleController {
  getAll = catchAsync(async (_req: Request, res: Response, _next: NextFunction) => {
    const roles = roleService.getAllRoles();

    return sendSuccess(res, 'Roles retrieved successfully', roles);
  });
}

export const roleController = new RoleController();

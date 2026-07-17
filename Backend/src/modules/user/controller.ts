import { Request, Response, NextFunction } from 'express';
import { userService } from './service';
import { catchAsync } from '@/utils/async';
import { sendSuccess } from '@/utils/response';
import { HTTP_STATUS, MESSAGES } from '@/constants';
import { Role, UserStatus } from '@prisma/client';

export class UserController {
  getAll = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { page, limit, search, role, status, sortBy, sortOrder } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
      role?: Role;
      status?: UserStatus;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    };

    const result = await userService.findAll({
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '10', 10),
      search,
      role,
      status,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
    });

    return sendSuccess(res, MESSAGES.LOGIN_SUCCESS, result.data, result.meta);
  });

  getById = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const user = await userService.findById(parseInt(id, 10));

    return sendSuccess(res, MESSAGES.LOGIN_SUCCESS, user);
  });

  create = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { name, username, email, password, phone, role, status } = req.body;

    const user = await userService.create({
      name,
      username,
      email,
      password,
      phone,
      role,
      status,
    });

    return sendSuccess(res, MESSAGES.USER_CREATED, user, undefined, HTTP_STATUS.CREATED);
  });

  update = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { name, username, email, phone } = req.body;

    const user = await userService.update(parseInt(id, 10), {
      name,
      username,
      email,
      phone,
    });

    return sendSuccess(res, MESSAGES.USER_UPDATED, user);
  });

  delete = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const result = await userService.delete(parseInt(id, 10));

    return sendSuccess(res, result.message);
  });

  updateStatus = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { userId, status } = req.body;

    const user = await userService.updateStatus(userId, status as UserStatus);

    return sendSuccess(res, MESSAGES.STATUS_UPDATED, user);
  });

  updateRole = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { userId, role } = req.body;

    const user = await userService.updateRole(userId, role as Role);

    return sendSuccess(res, MESSAGES.ROLE_UPDATED, user);
  });
}

export const userController = new UserController();

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
      limit: parseInt(limit || '20', 10),
      search,
      role,
      status,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
    });

    return sendSuccess(res, MESSAGES.USERS_FETCHED, result.data, result.meta);
  });

  getById = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const user = await userService.findById(parseInt(id, 10));

    return sendSuccess(res, MESSAGES.USER_FETCHED, user);
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

  getStats = catchAsync(async (_req: Request, res: Response, _next: NextFunction) => {
    const stats = await userService.getStats();

    return sendSuccess(res, 'Admin stats fetched successfully', stats);
  });

  getLoginHistory = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { page, limit, search, userId, successful, sortBy, sortOrder } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
      userId?: string;
      successful?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    };

    const isSuccessful =
      successful === 'true' ? true : successful === 'false' ? false : undefined;

    const result = await userService.getLoginHistory({
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
      search,
      userId: userId ? parseInt(userId, 10) : undefined,
      successful: isSuccessful,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Login history retrieved successfully',
      data: result.data,
      stats: result.stats,
      meta: result.meta,
    });
  });

  getUserLoginHistory = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { page, limit, search, successful, sortBy, sortOrder } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
      successful?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    };

    const isSuccessful =
      successful === 'true' ? true : successful === 'false' ? false : undefined;

    const result = await userService.getUserLoginHistory(parseInt(id, 10), {
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
      search,
      successful: isSuccessful,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User login history retrieved successfully',
      data: result.data,
      stats: result.stats,
      meta: result.meta,
    });
  });
}

export const userController = new UserController();


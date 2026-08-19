import { Request, Response, NextFunction } from 'express';
import { workspaceService } from './service';
import { catchAsync } from '@/utils/async';
import { sendSuccess } from '@/utils/response';
import { HTTP_STATUS } from '@/constants';

export class WorkspaceController {
  create = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { name, slug, icon, description } = req.body;
    const userId = req.user!.id;

    const workspace = await workspaceService.create({
      name,
      slug,
      icon,
      description,
      userId,
    });

    return sendSuccess(
      res,
      'Workspace created successfully',
      workspace,
      undefined,
      HTTP_STATUS.CREATED
    );
  });

  getAll = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { page, limit, search, sortBy, sortOrder } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    };

    const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN';

    const result = await workspaceService.findAll({
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '10', 10),
      search,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
      userId: req.user?.id,
      isAdmin,
    });

    return sendSuccess(res, 'Workspaces fetched successfully', result.data, result.meta);
  });

  getAllUserWorkspaces = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN';

    const workspaces = await workspaceService.findAllUserWorkspaces(req.user?.id, isAdmin);

    return sendSuccess(res, 'User workspaces fetched successfully', workspaces);
  });

  getByIdOrSlug = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { idOrSlug } = req.params;
    const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN';

    const workspace = await workspaceService.findByIdOrSlug(idOrSlug, req.user?.id, isAdmin);

    return sendSuccess(res, 'Workspace fetched successfully', workspace);
  });

  update = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { name, slug, icon, description } = req.body;
    const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN';

    const workspace = await workspaceService.update(
      id,
      { name, slug, icon, description },
      req.user?.id,
      isAdmin
    );

    return sendSuccess(res, 'Workspace updated successfully', workspace);
  });

  delete = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN';

    const result = await workspaceService.delete(id, req.user?.id, isAdmin);

    return sendSuccess(res, result.message);
  });
}

export const workspaceController = new WorkspaceController();

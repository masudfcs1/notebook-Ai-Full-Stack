import { Request, Response, NextFunction } from 'express';
import { teamService } from './service';
import { catchAsync } from '@/utils/async';
import { sendSuccess } from '@/utils/response';
import { HTTP_STATUS } from '@/constants';

export class TeamController {
  create = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { workspaceId, name, key, icon, slug } = req.body;

    const team = await teamService.create({
      workspaceId,
      name,
      key,
      icon,
      slug,
      userId: req.user?.id,
    });

    return sendSuccess(res, 'Team created successfully', team, undefined, HTTP_STATUS.CREATED);
  });

  getByWorkspace = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { workspaceId } = req.query as { workspaceId?: string };
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';

    if (workspaceId) {
      const teams = await teamService.findByWorkspaceId(workspaceId);
      return sendSuccess(res, 'Teams fetched successfully', teams);
    }

    const teams = await teamService.findAll(req.user?.id, isAdmin);
    return sendSuccess(res, 'All teams fetched successfully', teams);
  });

  getById = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const team = await teamService.findById(id);
    return sendSuccess(res, 'Team fetched successfully', team);
  });

  update = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { name, key, icon, slug } = req.body;

    const team = await teamService.update(id, { name, key, icon, slug });
    return sendSuccess(res, 'Team updated successfully', team);
  });

  delete = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const result = await teamService.delete(id);
    return sendSuccess(res, result.message);
  });
}

export const teamController = new TeamController();

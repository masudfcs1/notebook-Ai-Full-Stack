import { Request, Response, NextFunction } from 'express';
import { taskService } from './service';
import { catchAsync } from '@/utils/async';
import { sendSuccess } from '@/utils/response';
import { HTTP_STATUS } from '@/constants';

export class TaskController {
  create = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const {
      teamId,
      title,
      description,
      assignee,
      assigneeAvatar,
      dueDate,
      priority,
      status,
      noteId,
    } = req.body;
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';

    const task = await taskService.create(
      {
        teamId,
        title,
        description,
        assignee,
        assigneeAvatar,
        dueDate,
        priority,
        status,
        noteId,
        userId: req.user?.id,
      },
      req.user?.id,
      isAdmin,
      req.user?.email
    );

    return sendSuccess(res, 'Task created successfully', task, undefined, HTTP_STATUS.CREATED);
  });

  update = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const {
      title,
      description,
      assignee,
      assigneeAvatar,
      dueDate,
      priority,
      status,
      teamId,
      noteId,
    } = req.body;
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';

    const task = await taskService.update(
      id,
      {
        title,
        description,
        assignee,
        assigneeAvatar,
        dueDate,
        priority,
        status,
        teamId,
        noteId,
      },
      req.user?.id,
      isAdmin,
      req.user?.email
    );

    return sendSuccess(res, 'Task updated successfully', task);
  });

  updateStatus = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';

    const task = await taskService.updateStatus(id, status, req.user?.id, isAdmin, req.user?.email);
    return sendSuccess(res, 'Task status updated successfully', task);
  });

  delete = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';

    const result = await taskService.delete(id, req.user?.id, isAdmin, req.user?.email);
    return sendSuccess(res, result.message);
  });

  getById = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';

    const task = await taskService.findById(id, req.user?.id, isAdmin, req.user?.email);
    return sendSuccess(res, 'Task fetched successfully', task);
  });

  getByTeam = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { teamId } = req.params;
    const { status, priority, assignee, search, sortBy, sortOrder } = req.query as any;
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';

    const tasks = await taskService.findByTeamId(
      teamId,
      { status, priority, assignee, search, sortBy, sortOrder },
      req.user?.id,
      isAdmin,
      req.user?.email
    );

    return sendSuccess(res, 'Team tasks fetched successfully', tasks);
  });

  getByWorkspace = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { workspaceId, teamId, status, priority, assignee, search, sortBy, sortOrder } =
      req.query as any;
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';

    if (teamId) {
      const tasks = await taskService.findByTeamId(
        teamId,
        { status, priority, assignee, search, sortBy, sortOrder },
        req.user?.id,
        isAdmin,
        req.user?.email
      );
      return sendSuccess(res, 'Tasks fetched successfully', tasks);
    }

    if (workspaceId) {
      const tasks = await taskService.findByWorkspaceId(
        workspaceId,
        { teamId, status, priority, assignee, search, sortBy, sortOrder },
        req.user?.id,
        isAdmin,
        req.user?.email
      );
      return sendSuccess(res, 'Workspace tasks fetched successfully', tasks);
    }

    return sendSuccess(res, 'Tasks fetched successfully', []);
  });

  getStats = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { teamId, workspaceId } = req.query as { teamId?: string; workspaceId?: string };
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';

    const stats = await taskService.getStats(
      teamId,
      workspaceId,
      req.user?.id,
      isAdmin,
      req.user?.email
    );
    return sendSuccess(res, 'Task statistics fetched successfully', stats);
  });
}

export const taskController = new TaskController();

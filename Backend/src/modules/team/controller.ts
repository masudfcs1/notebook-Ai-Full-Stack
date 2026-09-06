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
      ownerName: req.user?.name,
      ownerEmail: req.user?.email,
      ownerAvatar: req.user?.avatar,
    });

    return sendSuccess(res, 'Team created successfully', team, undefined, HTTP_STATUS.CREATED);
  });

  getByWorkspace = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { workspaceId } = req.query as { workspaceId?: string };
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';

    if (workspaceId) {
      const teams = await teamService.findByWorkspaceId(
        workspaceId,
        req.user?.id,
        isAdmin,
        req.user?.email
      );
      return sendSuccess(res, 'Teams fetched successfully', teams);
    }

    const teams = await teamService.findAll(req.user?.id, isAdmin, req.user?.email);
    return sendSuccess(res, 'All teams fetched successfully', teams);
  });

  getById = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';
    const team = await teamService.findById(id, req.user?.id, isAdmin, req.user?.email);
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

  /* ---------- Team Member Handlers ---------- */

  getMembers = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';
    const members = await teamService.getMembers(id, req.user?.id, isAdmin, req.user?.email);
    return sendSuccess(res, 'Team members fetched successfully', members);
  });

  addMember = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { userId, name, email, role, avatar } = req.body;

    const member = await teamService.addMember(
      id,
      { userId, name, email, role, avatar },
      req.user?.id
    );

    return sendSuccess(
      res,
      'Team member added successfully',
      member,
      undefined,
      HTTP_STATUS.CREATED
    );
  });

  addMembersBulk = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { members } = req.body;

    const result = await teamService.addMembersBulk(id, members, req.user?.id);

    return sendSuccess(
      res,
      `Successfully added ${result.addedCount} team members`,
      result,
      undefined,
      HTTP_STATUS.CREATED
    );
  });

  updateMember = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id, memberId } = req.params;
    const { name, email, role, avatar } = req.body;

    const member = await teamService.updateMember(id, memberId, { name, email, role, avatar });
    return sendSuccess(res, 'Team member updated successfully', member);
  });

  deleteMember = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id, memberId } = req.params;
    const result = await teamService.deleteMember(id, memberId);
    return sendSuccess(res, result.message);
  });

  getAvailableUsers = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { search } = req.query as { search?: string };

    const users = await teamService.searchAvailableUsers(id, search);
    return sendSuccess(res, 'Available users fetched successfully', users);
  });
}

export const teamController = new TeamController();

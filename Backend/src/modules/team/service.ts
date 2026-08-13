import { teamRepository } from './repository';
import { workspaceRepository } from '../workspace/repository';
import { AppError } from '@/helpers/error.helper';
import { toTeamResponse, toTeamListResponse } from './dto';
import { CreateTeamData, UpdateTeamData } from './types';
import { logger } from '@/logger';

export class TeamService {
  async create(data: CreateTeamData) {
    const workspace = await workspaceRepository.findById(data.workspaceId);
    if (!workspace) {
      throw AppError.notFound('Workspace not found');
    }

    const key = data.key.toUpperCase();

    const team = await teamRepository.create({
      ...data,
      key,
    });

    logger.info(`Team created: ${team.name} (${team.id}) in workspace ${data.workspaceId}`);
    return toTeamResponse(team);
  }

  async findByWorkspaceId(workspaceId: string) {
    const teams = await teamRepository.findByWorkspaceId(workspaceId);
    return toTeamListResponse(teams);
  }

  async findAll(userId?: number, isAdmin?: boolean) {
    const teams = await teamRepository.findAll(userId, isAdmin);
    return toTeamListResponse(teams);
  }

  async findById(id: string) {
    const team = await teamRepository.findById(id);
    if (!team) {
      throw AppError.notFound('Team not found');
    }
    return toTeamResponse(team);
  }

  async update(id: string, data: UpdateTeamData) {
    const existing = await teamRepository.findById(id);
    if (!existing) {
      throw AppError.notFound('Team not found');
    }

    const updated = await teamRepository.update(id, {
      ...data,
      ...(data.key && { key: data.key.toUpperCase() }),
    });

    logger.info(`Team updated: ${updated.id}`);
    return toTeamResponse(updated);
  }

  async delete(id: string) {
    const existing = await teamRepository.findById(id);
    if (!existing) {
      throw AppError.notFound('Team not found');
    }

    await teamRepository.delete(id);
    logger.info(`Team deleted: ${id}`);

    return { message: 'Team deleted successfully' };
  }
}

export const teamService = new TeamService();

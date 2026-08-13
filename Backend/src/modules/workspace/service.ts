import { workspaceRepository, FindWorkspacesOptions } from './repository';
import { AppError } from '@/helpers/error.helper';
import { toWorkspaceResponse, toWorkspaceListResponse } from './dto';
import { CreateWorkspaceData, UpdateWorkspaceData } from './types';
import { logger } from '@/logger';

export class WorkspaceService {
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async create(data: CreateWorkspaceData) {
    let slug = data.slug ? this.generateSlug(data.slug) : this.generateSlug(data.name);

    // Check if slug exists
    const existing = await workspaceRepository.findBySlug(slug);
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const workspace = await workspaceRepository.create({
      ...data,
      slug,
    });

    logger.info(`Workspace created: ${workspace.name} (${workspace.id}) by user ${data.userId}`);
    return toWorkspaceResponse(workspace);
  }

  async findAll(options: FindWorkspacesOptions) {
    const result = await workspaceRepository.findAll(options);

    return {
      data: toWorkspaceListResponse(result.data),
      meta: result.meta,
    };
  }

  async findAllUserWorkspaces(userId?: number, isAdmin?: boolean) {
    let workspaces = await workspaceRepository.findAllUserWorkspaces(userId, isAdmin);

    if (workspaces.length === 0 && userId) {
      try {
        const defaultWs = await workspaceRepository.create({
          name: 'My Workspace',
          slug: `workspace-${userId}-${Date.now().toString().slice(-4)}`,
          icon: '⚡',
          description: 'Default personal workspace',
          userId,
        });
        workspaces = [defaultWs];
        logger.info({ userId }, 'Auto-provisioned default workspace with team for user');
      } catch (err: any) {
        logger.error({ userId, err }, 'Failed to auto-provision default workspace');
      }
    }

    return toWorkspaceListResponse(workspaces);
  }

  async findByIdOrSlug(idOrSlug: string, userId?: number, isAdmin?: boolean) {
    let workspace = await workspaceRepository.findById(idOrSlug);

    if (!workspace) {
      workspace = await workspaceRepository.findBySlug(idOrSlug);
    }

    if (!workspace) {
      throw AppError.notFound('Workspace not found');
    }

    // Check permission if not admin and workspace has owner
    if (!isAdmin && userId && workspace.userId && workspace.userId !== userId) {
      throw AppError.forbidden('You do not have access to this workspace');
    }

    return toWorkspaceResponse(workspace);
  }

  async update(id: string, data: UpdateWorkspaceData, userId?: number, isAdmin?: boolean) {
    const existing = await workspaceRepository.findById(id);

    if (!existing) {
      throw AppError.notFound('Workspace not found');
    }

    if (!isAdmin && userId && existing.userId && existing.userId !== userId) {
      throw AppError.forbidden('You do not have permission to update this workspace');
    }

    let slug = data.slug;
    if (slug) {
      slug = this.generateSlug(slug);
      const slugWorkspace = await workspaceRepository.findBySlug(slug);
      if (slugWorkspace && slugWorkspace.id !== id) {
        throw AppError.conflict('Workspace slug already in use');
      }
    }

    const updated = await workspaceRepository.update(id, {
      ...data,
      ...(slug && { slug }),
    });

    logger.info(`Workspace updated: ${updated.id}`);
    return toWorkspaceResponse(updated);
  }

  async delete(id: string, userId?: number, isAdmin?: boolean) {
    const existing = await workspaceRepository.findById(id);

    if (!existing) {
      throw AppError.notFound('Workspace not found');
    }

    if (!isAdmin && userId && existing.userId && existing.userId !== userId) {
      throw AppError.forbidden('You do not have permission to delete this workspace');
    }

    await workspaceRepository.delete(id);
    logger.info(`Workspace deleted: ${id}`);

    return { message: 'Workspace deleted successfully' };
  }
}

export const workspaceService = new WorkspaceService();

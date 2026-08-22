"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceService = exports.WorkspaceService = void 0;
const repository_1 = require("./repository");
const service_1 = require("../notification/service");
const client_1 = require("@prisma/client");
const error_helper_1 = require("../../helpers/error.helper");
const dto_1 = require("./dto");
const logger_1 = require("../../logger");
class WorkspaceService {
    generateSlug(name) {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
    async create(data) {
        let slug = data.slug ? this.generateSlug(data.slug) : this.generateSlug(data.name);
        // Check if slug exists
        const existing = await repository_1.workspaceRepository.findBySlug(slug);
        if (existing) {
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }
        const workspace = await repository_1.workspaceRepository.create({
            ...data,
            slug,
        });
        logger_1.logger.info(`Workspace created: ${workspace.name} (${workspace.id}) by user ${data.userId}`);
        try {
            await service_1.notificationService.create({
                type: client_1.NotificationType.WORKSPACE_CREATED,
                title: 'New Workspace Created',
                message: `Workspace "${workspace.name}" was created.`,
                data: {
                    workspaceId: workspace.id,
                    name: workspace.name,
                    slug: workspace.slug,
                    userId: data.userId,
                },
            });
        }
        catch (notifErr) {
            logger_1.logger.error({ notifErr }, 'Failed to emit WORKSPACE_CREATED notification');
        }
        return (0, dto_1.toWorkspaceResponse)(workspace);
    }
    async findAll(options) {
        const result = await repository_1.workspaceRepository.findAll(options);
        return {
            data: (0, dto_1.toWorkspaceListResponse)(result.data),
            meta: result.meta,
        };
    }
    async findAllUserWorkspaces(userId, isAdmin) {
        let workspaces = await repository_1.workspaceRepository.findAllUserWorkspaces(userId, isAdmin);
        if (workspaces.length === 0 && userId) {
            try {
                const defaultWs = await repository_1.workspaceRepository.create({
                    name: 'My Workspace',
                    slug: `workspace-${userId}-${Date.now().toString().slice(-4)}`,
                    icon: '⚡',
                    description: 'Default personal workspace',
                    userId,
                });
                workspaces = [defaultWs];
                logger_1.logger.info({ userId }, 'Auto-provisioned default workspace with team for user');
            }
            catch (err) {
                logger_1.logger.error({ userId, err }, 'Failed to auto-provision default workspace');
            }
        }
        return (0, dto_1.toWorkspaceListResponse)(workspaces);
    }
    async findByIdOrSlug(idOrSlug, userId, isAdmin) {
        let workspace = await repository_1.workspaceRepository.findById(idOrSlug);
        if (!workspace) {
            workspace = await repository_1.workspaceRepository.findBySlug(idOrSlug);
        }
        if (!workspace) {
            throw error_helper_1.AppError.notFound('Workspace not found');
        }
        // Check permission if not admin and workspace has owner
        if (!isAdmin && userId && workspace.userId && workspace.userId !== userId) {
            throw error_helper_1.AppError.forbidden('You do not have access to this workspace');
        }
        return (0, dto_1.toWorkspaceResponse)(workspace);
    }
    async update(id, data, userId, isAdmin) {
        const existing = await repository_1.workspaceRepository.findById(id);
        if (!existing) {
            throw error_helper_1.AppError.notFound('Workspace not found');
        }
        if (!isAdmin && userId && existing.userId && existing.userId !== userId) {
            throw error_helper_1.AppError.forbidden('You do not have permission to update this workspace');
        }
        let slug = data.slug;
        if (slug) {
            slug = this.generateSlug(slug);
            const slugWorkspace = await repository_1.workspaceRepository.findBySlug(slug);
            if (slugWorkspace && slugWorkspace.id !== id) {
                throw error_helper_1.AppError.conflict('Workspace slug already in use');
            }
        }
        const updated = await repository_1.workspaceRepository.update(id, {
            ...data,
            ...(slug && { slug }),
        });
        logger_1.logger.info(`Workspace updated: ${updated.id}`);
        return (0, dto_1.toWorkspaceResponse)(updated);
    }
    async delete(id, userId, isAdmin) {
        const existing = await repository_1.workspaceRepository.findById(id);
        if (!existing) {
            throw error_helper_1.AppError.notFound('Workspace not found');
        }
        if (!isAdmin && userId && existing.userId && existing.userId !== userId) {
            throw error_helper_1.AppError.forbidden('You do not have permission to delete this workspace');
        }
        await repository_1.workspaceRepository.delete(id);
        logger_1.logger.info(`Workspace deleted: ${id}`);
        return { message: 'Workspace deleted successfully' };
    }
}
exports.WorkspaceService = WorkspaceService;
exports.workspaceService = new WorkspaceService();
//# sourceMappingURL=service.js.map
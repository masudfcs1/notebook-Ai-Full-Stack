"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceController = exports.WorkspaceController = void 0;
const service_1 = require("./service");
const async_1 = require("../../utils/async");
const response_1 = require("../../utils/response");
const constants_1 = require("../../constants");
class WorkspaceController {
    create = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { name, slug, icon, description } = req.body;
        const userId = req.user.id;
        const workspace = await service_1.workspaceService.create({
            name,
            slug,
            icon,
            description,
            userId,
        });
        return (0, response_1.sendSuccess)(res, 'Workspace created successfully', workspace, undefined, constants_1.HTTP_STATUS.CREATED);
    });
    getAll = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { page, limit, search, sortBy, sortOrder } = req.query;
        const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN';
        const result = await service_1.workspaceService.findAll({
            page: parseInt(page || '1', 10),
            limit: parseInt(limit || '10', 10),
            search,
            sortBy: sortBy || 'createdAt',
            sortOrder: sortOrder || 'desc',
            userId: req.user?.id,
            isAdmin,
        });
        return (0, response_1.sendSuccess)(res, 'Workspaces fetched successfully', result.data, result.meta);
    });
    getAllUserWorkspaces = (0, async_1.catchAsync)(async (req, res, _next) => {
        const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN';
        const workspaces = await service_1.workspaceService.findAllUserWorkspaces(req.user?.id, isAdmin);
        return (0, response_1.sendSuccess)(res, 'User workspaces fetched successfully', workspaces);
    });
    getByIdOrSlug = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { idOrSlug } = req.params;
        const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN';
        const workspace = await service_1.workspaceService.findByIdOrSlug(idOrSlug, req.user?.id, isAdmin);
        return (0, response_1.sendSuccess)(res, 'Workspace fetched successfully', workspace);
    });
    update = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { id } = req.params;
        const { name, slug, icon, description } = req.body;
        const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN';
        const workspace = await service_1.workspaceService.update(id, { name, slug, icon, description }, req.user?.id, isAdmin);
        return (0, response_1.sendSuccess)(res, 'Workspace updated successfully', workspace);
    });
    delete = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { id } = req.params;
        const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN';
        const result = await service_1.workspaceService.delete(id, req.user?.id, isAdmin);
        return (0, response_1.sendSuccess)(res, result.message);
    });
}
exports.WorkspaceController = WorkspaceController;
exports.workspaceController = new WorkspaceController();
//# sourceMappingURL=controller.js.map
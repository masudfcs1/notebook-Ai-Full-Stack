"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamController = exports.TeamController = void 0;
const service_1 = require("./service");
const async_1 = require("../../utils/async");
const response_1 = require("../../utils/response");
const constants_1 = require("../../constants");
class TeamController {
    create = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { workspaceId, name, key, icon, slug } = req.body;
        const team = await service_1.teamService.create({
            workspaceId,
            name,
            key,
            icon,
            slug,
            userId: req.user?.id,
        });
        return (0, response_1.sendSuccess)(res, 'Team created successfully', team, undefined, constants_1.HTTP_STATUS.CREATED);
    });
    getByWorkspace = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { workspaceId } = req.query;
        const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';
        if (workspaceId) {
            const teams = await service_1.teamService.findByWorkspaceId(workspaceId);
            return (0, response_1.sendSuccess)(res, 'Teams fetched successfully', teams);
        }
        const teams = await service_1.teamService.findAll(req.user?.id, isAdmin);
        return (0, response_1.sendSuccess)(res, 'All teams fetched successfully', teams);
    });
    getById = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { id } = req.params;
        const team = await service_1.teamService.findById(id);
        return (0, response_1.sendSuccess)(res, 'Team fetched successfully', team);
    });
    update = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { id } = req.params;
        const { name, key, icon, slug } = req.body;
        const team = await service_1.teamService.update(id, { name, key, icon, slug });
        return (0, response_1.sendSuccess)(res, 'Team updated successfully', team);
    });
    delete = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { id } = req.params;
        const result = await service_1.teamService.delete(id);
        return (0, response_1.sendSuccess)(res, result.message);
    });
}
exports.TeamController = TeamController;
exports.teamController = new TeamController();
//# sourceMappingURL=controller.js.map
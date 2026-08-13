"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamService = exports.TeamService = void 0;
const repository_1 = require("./repository");
const repository_2 = require("../workspace/repository");
const error_helper_1 = require("../../helpers/error.helper");
const dto_1 = require("./dto");
const logger_1 = require("../../logger");
class TeamService {
    async create(data) {
        const workspace = await repository_2.workspaceRepository.findById(data.workspaceId);
        if (!workspace) {
            throw error_helper_1.AppError.notFound('Workspace not found');
        }
        const key = data.key.toUpperCase();
        const team = await repository_1.teamRepository.create({
            ...data,
            key,
        });
        logger_1.logger.info(`Team created: ${team.name} (${team.id}) in workspace ${data.workspaceId}`);
        return (0, dto_1.toTeamResponse)(team);
    }
    async findByWorkspaceId(workspaceId) {
        const teams = await repository_1.teamRepository.findByWorkspaceId(workspaceId);
        return (0, dto_1.toTeamListResponse)(teams);
    }
    async findAll(userId, isAdmin) {
        const teams = await repository_1.teamRepository.findAll(userId, isAdmin);
        return (0, dto_1.toTeamListResponse)(teams);
    }
    async findById(id) {
        const team = await repository_1.teamRepository.findById(id);
        if (!team) {
            throw error_helper_1.AppError.notFound('Team not found');
        }
        return (0, dto_1.toTeamResponse)(team);
    }
    async update(id, data) {
        const existing = await repository_1.teamRepository.findById(id);
        if (!existing) {
            throw error_helper_1.AppError.notFound('Team not found');
        }
        const updated = await repository_1.teamRepository.update(id, {
            ...data,
            ...(data.key && { key: data.key.toUpperCase() }),
        });
        logger_1.logger.info(`Team updated: ${updated.id}`);
        return (0, dto_1.toTeamResponse)(updated);
    }
    async delete(id) {
        const existing = await repository_1.teamRepository.findById(id);
        if (!existing) {
            throw error_helper_1.AppError.notFound('Team not found');
        }
        await repository_1.teamRepository.delete(id);
        logger_1.logger.info(`Team deleted: ${id}`);
        return { message: 'Team deleted successfully' };
    }
}
exports.TeamService = TeamService;
exports.teamService = new TeamService();
//# sourceMappingURL=service.js.map
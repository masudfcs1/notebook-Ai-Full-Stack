"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const service_1 = require("./service");
const async_1 = require("../../utils/async");
const response_1 = require("../../utils/response");
const constants_1 = require("../../constants");
class UserController {
    getAll = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { page, limit, search, role, status, sortBy, sortOrder } = req.query;
        const result = await service_1.userService.findAll({
            page: parseInt(page || '1', 10),
            limit: parseInt(limit || '10', 10),
            search,
            role,
            status,
            sortBy: sortBy || 'createdAt',
            sortOrder: sortOrder || 'desc',
        });
        return (0, response_1.sendSuccess)(res, constants_1.MESSAGES.LOGIN_SUCCESS, result.data, result.meta);
    });
    getById = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { id } = req.params;
        const user = await service_1.userService.findById(parseInt(id, 10));
        return (0, response_1.sendSuccess)(res, constants_1.MESSAGES.LOGIN_SUCCESS, user);
    });
    create = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { name, username, email, password, phone, role, status } = req.body;
        const user = await service_1.userService.create({
            name,
            username,
            email,
            password,
            phone,
            role,
            status,
        });
        return (0, response_1.sendSuccess)(res, constants_1.MESSAGES.USER_CREATED, user, undefined, constants_1.HTTP_STATUS.CREATED);
    });
    update = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { id } = req.params;
        const { name, username, email, phone } = req.body;
        const user = await service_1.userService.update(parseInt(id, 10), {
            name,
            username,
            email,
            phone,
        });
        return (0, response_1.sendSuccess)(res, constants_1.MESSAGES.USER_UPDATED, user);
    });
    delete = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { id } = req.params;
        const result = await service_1.userService.delete(parseInt(id, 10));
        return (0, response_1.sendSuccess)(res, result.message);
    });
    updateStatus = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { userId, status } = req.body;
        const user = await service_1.userService.updateStatus(userId, status);
        return (0, response_1.sendSuccess)(res, constants_1.MESSAGES.STATUS_UPDATED, user);
    });
    updateRole = (0, async_1.catchAsync)(async (req, res, _next) => {
        const { userId, role } = req.body;
        const user = await service_1.userService.updateRole(userId, role);
        return (0, response_1.sendSuccess)(res, constants_1.MESSAGES.ROLE_UPDATED, user);
    });
    getStats = (0, async_1.catchAsync)(async (_req, res, _next) => {
        const stats = await service_1.userService.getStats();
        return (0, response_1.sendSuccess)(res, 'Admin stats fetched successfully', stats);
    });
}
exports.UserController = UserController;
exports.userController = new UserController();
//# sourceMappingURL=controller.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseHelper = void 0;
class ResponseHelper {
    static success(res, message, data, meta, statusCode = 200) {
        const response = {
            success: true,
            message,
            ...(data !== undefined && { data }),
            ...(meta && { meta }),
        };
        return res.status(statusCode).json(response);
    }
    static created(res, message, data) {
        return this.success(res, message, data, undefined, 201);
    }
    static noContent(res) {
        return res.status(204).send();
    }
    static paginated(res, message, data, meta) {
        return this.success(res, message, data, meta);
    }
}
exports.ResponseHelper = ResponseHelper;
//# sourceMappingURL=response.helper.js.map
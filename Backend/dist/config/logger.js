"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerConfig = void 0;
const env_1 = require("./env");
exports.loggerConfig = {
    level: env_1.env.NODE_ENV === 'production' ? 'info' : 'debug',
    prettyPrint: env_1.env.NODE_ENV !== 'production',
    redact: ['req.headers.authorization', 'req.headers.cookie', 'req.body.password'],
    serializers: {
        req: (req) => ({
            method: req.method,
            url: req.url,
            headers: {
                'content-type': req.headers?.['content-type'],
                'user-agent': req.headers?.['user-agent'],
                'x-request-id': req.headers?.['x-request-id'],
            },
        }),
        res: (res) => ({
            statusCode: res.statusCode,
        }),
    },
};
//# sourceMappingURL=logger.js.map
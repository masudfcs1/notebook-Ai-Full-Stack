"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConfig = void 0;
const env_1 = require("./env");
exports.jwtConfig = {
    access: {
        secret: env_1.env.JWT_ACCESS_SECRET,
        expiresIn: env_1.env.JWT_ACCESS_EXPIRES,
    },
    refresh: {
        secret: env_1.env.JWT_REFRESH_SECRET,
        expiresIn: env_1.env.JWT_REFRESH_EXPIRES,
    },
};
//# sourceMappingURL=jwt.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const logger_1 = require("../config/logger");
const transport = logger_1.loggerConfig.prettyPrint
    ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
        },
    }
    : undefined;
exports.logger = (0, pino_1.default)({
    level: logger_1.loggerConfig.level,
    redact: [...logger_1.loggerConfig.redact],
    transport,
    serializers: logger_1.loggerConfig.serializers,
});
//# sourceMappingURL=index.js.map
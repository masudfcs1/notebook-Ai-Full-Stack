"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_2 = require("./config/cors");
const middlewares_1 = require("./middlewares");
const routes_1 = __importDefault(require("./routes"));
const config_1 = require("./config");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
// CORS configuration
app.use((0, cors_1.default)(cors_2.corsConfig));
// Compress responses
app.use((0, compression_1.default)());
// Parse JSON bodies
app.use(express_1.default.json({ limit: '10mb' }));
// Parse URL-encoded bodies
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Parse cookies
app.use((0, cookie_parser_1.default)(config_1.env.COOKIE_SECRET));
// Request ID and logging
app.use(middlewares_1.requestIdMiddleware);
app.use(middlewares_1.requestLoggerMiddleware);
// Sanitize input
app.use(middlewares_1.sanitizeInput);
// Rate limiting
app.use('/api', middlewares_1.rateLimiter);
// Static files for uploads
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), config_1.env.UPLOAD_PATH)));
// Health check
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        environment: config_1.env.NODE_ENV,
    });
});
// API Routes
app.use('/api/v1', routes_1.default);
// 404 handler
app.use(middlewares_1.notFoundHandler);
app.use(middlewares_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map
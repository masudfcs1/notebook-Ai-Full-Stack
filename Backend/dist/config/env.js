"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
(0, dotenv_1.config)({ path: path_1.default.resolve(process.cwd(), '.env'), override: true });
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().transform(Number).default('3000'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL is required'),
    JWT_ACCESS_SECRET: zod_1.z.string().min(1, 'JWT_ACCESS_SECRET is required'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(1, 'JWT_REFRESH_SECRET is required'),
    JWT_ACCESS_EXPIRES: zod_1.z.string().default('7d'),
    JWT_REFRESH_EXPIRES: zod_1.z.string().default('30d'),
    COOKIE_SECRET: zod_1.z.string().min(1, 'COOKIE_SECRET is required'),
    UPLOAD_PATH: zod_1.z.string().default('uploads'),
    SUPER_ADMIN_NAME: zod_1.z.string().default('Super Admin'),
    SUPER_ADMIN_EMAIL: zod_1.z.string().email('Invalid super admin email'),
    SUPER_ADMIN_PASSWORD: zod_1.z.string().min(6, 'Super admin password must be at least 6 characters'),
    FRONTEND_URL: zod_1.z.string().url().default('http://localhost:5173'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('Environment validation failed:');
    console.error(parsed.error.flatten());
    process.exit(1);
}
exports.env = parsed.data;
//# sourceMappingURL=env.js.map
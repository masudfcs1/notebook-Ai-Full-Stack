"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerConfig = void 0;
const env_1 = require("./env");
const path_1 = __importDefault(require("path"));
exports.multerConfig = {
    uploadPath: env_1.env.UPLOAD_PATH,
    maxFileSize: {
        image: 5 * 1024 * 1024, // 5MB
        document: 10 * 1024 * 1024, // 10MB
        video: 100 * 1024 * 1024, // 100MB
        audio: 20 * 1024 * 1024, // 20MB
        default: 10 * 1024 * 1024, // 10MB
    },
    allowedMimeTypes: {
        images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        documents: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ],
        videos: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'],
        audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
    },
    getUploadPath: (type) => path_1.default.join(env_1.env.UPLOAD_PATH, type),
};
//# sourceMappingURL=multer.js.map
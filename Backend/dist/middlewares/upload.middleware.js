"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMulterError = exports.uploadAny = exports.uploadAudio = exports.uploadVideo = exports.uploadDocument = exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const multer_2 = require("../config/multer");
const constants_1 = require("../constants");
const createStorage = (type) => {
    return multer_1.default.diskStorage({
        destination: (req, _file, cb) => {
            const uploadPath = multer_2.multerConfig.getUploadPath(type);
            if (!fs_1.default.existsSync(uploadPath)) {
                fs_1.default.mkdirSync(uploadPath, { recursive: true });
            }
            req.uploadedPath = uploadPath;
            cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
            const uniqueName = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
            cb(null, uniqueName);
        },
    });
};
const fileFilter = (allowedTypes) => {
    return (_req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error(`Invalid file type: ${file.mimetype}`));
        }
    };
};
exports.uploadImage = (0, multer_1.default)({
    storage: createStorage('image'),
    fileFilter: fileFilter([...multer_2.multerConfig.allowedMimeTypes.images]),
    limits: {
        fileSize: multer_2.multerConfig.maxFileSize.image,
    },
});
exports.uploadDocument = (0, multer_1.default)({
    storage: createStorage('document'),
    fileFilter: fileFilter([...multer_2.multerConfig.allowedMimeTypes.documents]),
    limits: {
        fileSize: multer_2.multerConfig.maxFileSize.document,
    },
});
exports.uploadVideo = (0, multer_1.default)({
    storage: createStorage('video'),
    fileFilter: fileFilter([...multer_2.multerConfig.allowedMimeTypes.videos]),
    limits: {
        fileSize: multer_2.multerConfig.maxFileSize.video,
    },
});
exports.uploadAudio = (0, multer_1.default)({
    storage: createStorage('audio'),
    fileFilter: fileFilter([...multer_2.multerConfig.allowedMimeTypes.audio]),
    limits: {
        fileSize: multer_2.multerConfig.maxFileSize.audio,
    },
});
exports.uploadAny = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, _file, cb) => {
            const type = req.body.type || 'documents';
            const uploadPath = multer_2.multerConfig.getUploadPath(type);
            if (!fs_1.default.existsSync(uploadPath)) {
                fs_1.default.mkdirSync(uploadPath, { recursive: true });
            }
            req.uploadedPath = uploadPath;
            cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
            const uniqueName = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
            cb(null, uniqueName);
        },
    }),
    limits: {
        fileSize: multer_2.multerConfig.maxFileSize.default,
    },
});
const handleMulterError = (err, _req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: constants_1.MESSAGES.FILE_TOO_LARGE,
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected file field',
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    if (err.message.includes('Invalid file type')) {
        return res.status(400).json({
            success: false,
            message: constants_1.MESSAGES.INVALID_FILE_TYPE,
        });
    }
    next(err);
};
exports.handleMulterError = handleMulterError;
//# sourceMappingURL=upload.middleware.js.map
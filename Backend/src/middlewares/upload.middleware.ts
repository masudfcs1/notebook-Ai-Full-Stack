import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { multerConfig } from '@/config/multer';
import { MESSAGES } from '@/constants';

type FileType = 'image' | 'document' | 'video' | 'audio';

const createStorage = (type: FileType) => {
  return multer.diskStorage({
    destination: (req, _file, cb) => {
      const uploadPath = multerConfig.getUploadPath(type);

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      (req as Request & { uploadedPath?: string }).uploadedPath = uploadPath;

      cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
};

const fileFilter = (allowedTypes: string[]) => {
  return (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`));
    }
  };
};

export const uploadImage = multer({
  storage: createStorage('image'),
  fileFilter: fileFilter([...multerConfig.allowedMimeTypes.images]),
  limits: {
    fileSize: multerConfig.maxFileSize.image,
  },
});

export const uploadDocument = multer({
  storage: createStorage('document'),
  fileFilter: fileFilter([...multerConfig.allowedMimeTypes.documents]),
  limits: {
    fileSize: multerConfig.maxFileSize.document,
  },
});

export const uploadVideo = multer({
  storage: createStorage('video'),
  fileFilter: fileFilter([...multerConfig.allowedMimeTypes.videos]),
  limits: {
    fileSize: multerConfig.maxFileSize.video,
  },
});

export const uploadAudio = multer({
  storage: createStorage('audio'),
  fileFilter: fileFilter([...multerConfig.allowedMimeTypes.audio]),
  limits: {
    fileSize: multerConfig.maxFileSize.audio,
  },
});

export const uploadAny = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      const type = req.body.type || 'documents';
      const uploadPath = multerConfig.getUploadPath(type);

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      (req as Request & { uploadedPath?: string }).uploadedPath = uploadPath;

      cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: multerConfig.maxFileSize.default,
  },
});

export const handleMulterError = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: MESSAGES.FILE_TOO_LARGE,
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
      message: MESSAGES.INVALID_FILE_TYPE,
    });
  }

  next(err);
};

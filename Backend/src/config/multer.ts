import { env } from './env';
import path from 'path';

export const multerConfig = {
  uploadPath: env.UPLOAD_PATH,
  maxFileSize: {
    image: 5 * 1024 * 1024, // 5MB
    document: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
    audio: 20 * 1024 * 1024, // 20MB
    default: 10 * 1024 * 1024, // 10MB
  },
  allowedMimeTypes: {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    videos: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
  },
  getUploadPath: (type: string) => path.join(env.UPLOAD_PATH, type),
} as const;

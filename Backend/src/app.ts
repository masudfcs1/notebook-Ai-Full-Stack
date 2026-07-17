import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { corsConfig } from '@/config/cors';
import {
  errorHandler,
  notFoundHandler,
  requestIdMiddleware,
  requestLoggerMiddleware,
  sanitizeInput,
  rateLimiter,
} from '@/middlewares';
import routes from '@/routes';
import { env } from '@/config';
import path from 'path';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(corsConfig));

// Compress responses
app.use(compression());

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Parse cookies
app.use(cookieParser(env.COOKIE_SECRET));

// Request ID and logging
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

// Sanitize input
app.use(sanitizeInput);

// Rate limiting
app.use('/api', rateLimiter);

// Static files for uploads
app.use('/uploads', express.static(path.join(process.cwd(), env.UPLOAD_PATH)));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API Routes
app.use('/api/v1', routes);

// 404 handler
app.use(notFoundHandler);

app.use(errorHandler);

export default app;

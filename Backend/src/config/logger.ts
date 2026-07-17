import { env } from './env';

export const loggerConfig = {
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  prettyPrint: env.NODE_ENV !== 'production',
  redact: ['req.headers.authorization', 'req.headers.cookie', 'req.body.password'],
  serializers: {
    req: (req: { method?: string; url?: string; headers?: Record<string, string>; body?: unknown }) => ({
      method: req.method,
      url: req.url,
      headers: {
        'content-type': req.headers?.['content-type'],
        'user-agent': req.headers?.['user-agent'],
        'x-request-id': req.headers?.['x-request-id'],
      },
    }),
    res: (res: { statusCode: number }) => ({
      statusCode: res.statusCode,
    }),
  },
};

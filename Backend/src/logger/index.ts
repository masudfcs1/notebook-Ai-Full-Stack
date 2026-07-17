import pino from 'pino';
import { loggerConfig } from '@/config/logger';

const transport = loggerConfig.prettyPrint
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    }
  : undefined;

export const logger = pino({
  level: loggerConfig.level,
  redact: [...loggerConfig.redact],
  transport,
  serializers: loggerConfig.serializers,
});

export type Logger = typeof logger;

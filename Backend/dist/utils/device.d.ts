import { Request } from 'express';
import { IDeviceInfo } from '../interfaces';
export declare const getClientIp: (req: Request) => string;
export declare const getUserAgent: (req: Request) => string | undefined;
export declare const parseUserAgent: (userAgent: string) => Partial<IDeviceInfo>;
export declare const getDeviceInfo: (req: Request) => IDeviceInfo;
//# sourceMappingURL=device.d.ts.map
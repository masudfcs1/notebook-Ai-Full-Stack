import { Request, Response, NextFunction } from 'express';
import { preferencesService } from './service';
import { catchAsync } from '@/utils/async';
import { sendSuccess } from '@/utils/response';

export class PreferencesController {
  get = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user!.id;
    const preferences = await preferencesService.get(userId);
    return sendSuccess(res, 'Preferences retrieved successfully', preferences);
  });

  update = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user!.id;
    const preferences = await preferencesService.update(userId, req.body);
    return sendSuccess(res, 'Preferences updated successfully', preferences);
  });
}

export const preferencesController = new PreferencesController();

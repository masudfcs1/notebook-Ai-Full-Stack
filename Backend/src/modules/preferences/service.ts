import { preferencesRepository } from './repository';
import { toPreferencesResponse } from './dto';
import { UpdatePreferencesData } from './types';
import { logger } from '@/logger';

export class PreferencesService {
  async get(userId: number) {
    const preferences = await preferencesRepository.getByUserId(userId);
    return toPreferencesResponse(preferences);
  }

  async update(userId: number, data: UpdatePreferencesData) {
    const updated = await preferencesRepository.updateByUserId(userId, data);
    logger.info(`Preferences updated for user ID: ${userId}`);
    return toPreferencesResponse(updated);
  }
}

export const preferencesService = new PreferencesService();

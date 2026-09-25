import { prisma } from '@/database';
import { UpdatePreferencesData } from './types';

export class PreferencesRepository {
  async getByUserId(userId: number) {
    return prisma.userPreferences.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  async updateByUserId(userId: number, data: UpdatePreferencesData) {
    return prisma.userPreferences.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });
  }
}

export const preferencesRepository = new PreferencesRepository();

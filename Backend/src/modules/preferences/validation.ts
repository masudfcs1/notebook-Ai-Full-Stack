import { z } from 'zod';

export const UpdatePreferencesSchema = z.object({
  body: z.object({
    bio: z.string().max(1000).optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
    accentColor: z.string().min(1).max(50).optional(),
    compactMode: z.boolean().optional(),
    ambientGlow: z.boolean().optional(),
    smoothMotion: z.boolean().optional(),
    highContrast: z.boolean().optional(),
    soundEffects: z.boolean().optional(),

    notifAiSummaryEmail: z.boolean().optional(),
    notifAiSummaryPush: z.boolean().optional(),
    notifTaskReminderEmail: z.boolean().optional(),
    notifTaskReminderPush: z.boolean().optional(),
    notifWeeklyDigestEmail: z.boolean().optional(),
    notifWeeklyDigestPush: z.boolean().optional(),
    notifWorkspaceEmail: z.boolean().optional(),
    notifWorkspacePush: z.boolean().optional(),
    notifSecurityEmail: z.boolean().optional(),
    notifSecurityPush: z.boolean().optional(),

    aiSummaryStyle: z.string().optional(),
    aiTemperature: z.number().min(0).max(1).optional(),
    aiLanguage: z.string().optional(),
    aiAutoSummarize: z.boolean().optional(),
    aiExtractActions: z.boolean().optional(),
    aiSentiment: z.boolean().optional(),
    aiSmartTags: z.boolean().optional(),
    aiSpeakerAttribution: z.boolean().optional(),

    timezone: z.string().optional(),
  }),
});

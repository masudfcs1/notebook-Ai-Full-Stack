export interface UserPreferencesData {
  bio?: string;
  theme?: string;
  accentColor?: string;
  compactMode?: boolean;
  ambientGlow?: boolean;
  smoothMotion?: boolean;
  highContrast?: boolean;
  soundEffects?: boolean;
  notifAiSummaryEmail?: boolean;
  notifAiSummaryPush?: boolean;
  notifTaskReminderEmail?: boolean;
  notifTaskReminderPush?: boolean;
  notifWeeklyDigestEmail?: boolean;
  notifWeeklyDigestPush?: boolean;
  notifWorkspaceEmail?: boolean;
  notifWorkspacePush?: boolean;
  notifSecurityEmail?: boolean;
  notifSecurityPush?: boolean;
  aiSummaryStyle?: string;
  aiTemperature?: number;
  aiLanguage?: string;
  aiAutoSummarize?: boolean;
  aiExtractActions?: boolean;
  aiSentiment?: boolean;
  aiSmartTags?: boolean;
  aiSpeakerAttribution?: boolean;
  timezone?: string;
}

export type UpdatePreferencesData = Partial<UserPreferencesData>;

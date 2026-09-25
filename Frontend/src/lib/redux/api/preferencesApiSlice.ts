import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuthHandling } from "./baseQuery";

export interface UserPreferences {
  id: string;
  userId: number;
  bio?: string;
  theme: string;
  accentColor: string;
  compactMode: boolean;
  ambientGlow: boolean;
  smoothMotion: boolean;
  highContrast: boolean;
  soundEffects: boolean;
  notifAiSummaryEmail: boolean;
  notifAiSummaryPush: boolean;
  notifTaskReminderEmail: boolean;
  notifTaskReminderPush: boolean;
  notifWeeklyDigestEmail: boolean;
  notifWeeklyDigestPush: boolean;
  notifWorkspaceEmail: boolean;
  notifWorkspacePush: boolean;
  notifSecurityEmail: boolean;
  notifSecurityPush: boolean;
  aiSummaryStyle: "action" | "executive" | "comprehensive";
  aiTemperature: number;
  aiLanguage: string;
  aiAutoSummarize: boolean;
  aiExtractActions: boolean;
  aiSentiment: boolean;
  aiSmartTags: boolean;
  aiSpeakerAttribution: boolean;
  timezone: string;
}

export interface UsageStats {
  period: { start: string; end: string; daysRemaining: number };
  summaries: { used: number; limit: number };
  transcriptionMinutes: { used: number; limit: number };
  tasks: { used: number; limit: number };
  storageBytes: { used: number; limitBytes: number };
  notes?: { total: number; thisMonth: number };
}

export interface ActiveSession {
  id: number;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  expiresAt: string;
}

export interface LoginHistoryItem {
  id: number;
  userId: number;
  ipAddress?: string | null;
  userAgent?: string | null;
  device?: string | null;
  browser?: string | null;
  os?: string | null;
  successful: boolean;
  message?: string | null;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const preferencesApi = createApi({
  reducerPath: "preferencesApi",
  baseQuery: baseQueryWithAuthHandling,
  tagTypes: ["Preferences", "UsageStats", "Sessions", "LoginHistory"],
  endpoints: (builder) => ({
    getPreferences: builder.query<ApiResponse<UserPreferences>, void>({
      query: () => "/preferences",
      providesTags: ["Preferences"],
    }),

    updatePreferences: builder.mutation<
      ApiResponse<UserPreferences>,
      Partial<UserPreferences>
    >({
      query: (body) => ({
        url: "/preferences",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Preferences"],
    }),

    getUsageStats: builder.query<ApiResponse<UsageStats>, void>({
      query: () => "/auth/usage-stats",
      providesTags: ["UsageStats"],
    }),

    getSessions: builder.query<ApiResponse<ActiveSession[]>, void>({
      query: () => "/auth/sessions",
      providesTags: ["Sessions"],
    }),

    revokeOtherSessions: builder.mutation<ApiResponse<any>, void>({
      query: () => ({
        url: "/auth/sessions",
        method: "DELETE",
      }),
      invalidatesTags: ["Sessions"],
    }),

    getLoginHistory: builder.query<
      ApiResponse<LoginHistoryItem[]>,
      { take?: number } | void
    >({
      query: (params) => ({
        url: "/auth/login-history",
        params: params || {},
      }),
      providesTags: ["LoginHistory"],
    }),
  }),
});

export const {
  useGetPreferencesQuery,
  useUpdatePreferencesMutation,
  useGetUsageStatsQuery,
  useGetSessionsQuery,
  useRevokeOtherSessionsMutation,
  useGetLoginHistoryQuery,
} = preferencesApi;

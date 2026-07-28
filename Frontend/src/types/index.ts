/**
 * NoteFlow AI - Core Domain Types & Contracts
 * @file index.ts
 */

export type ViewKey =
  | "landing"
  | "login"
  | "signup"
  | "dashboard"
  | "ongoing"
  | "upload"
  | "summary"
  | "action-items"
  | "history"
  | "settings"

export type NotificationType = "info" | "success" | "warning" | "error"

export interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type: NotificationType
}

export interface UserSession {
  id: string
  name: string
  email: string
  avatar?: string
  role: "admin" | "member" | "viewer"
}

export interface ViewMetadata {
  title: string
  subtitle: string
  sysCode: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

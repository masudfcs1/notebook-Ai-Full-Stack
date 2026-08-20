/**
 * NoteFlow AI - Core Domain Types & Contracts
 * @file index.ts
 */

export type ViewKey =
  | "landing"
  | "login"
  | "signup"
  | "dashboard"
  | "team"
  | "ongoing"
  | "upload"
  | "summary"
  | "action-items"
  | "history"
  | "settings"
  | "admin-dashboard"
  | "admin-users"
  | "admin-user-detail"
  | "admin-roles"
  | "admin-activity"
  | "admin-notifications"
  | "admin-settings"


export type PriorityLevel = "urgent" | "high" | "medium" | "low"
export type TaskStatus = "backlog" | "todo" | "in_progress" | "done" | "pending" | "completed"

export interface TeamMember {
  id: string
  teamId: string
  name: string
  email: string
  avatar?: string | null
  role: "OWNER" | "LEAD" | "MEMBER"
}

export interface Team {
  id: string
  workspaceId: string
  name: string
  slug?: string
  key: string
  icon?: string | null
  members: TeamMember[]
}

export interface Workspace {
  id: string
  name: string
  slug: string
  icon?: string | null
  description?: string | null
  teams: Team[]
}

export interface ActionItem {
  id: string
  identifier?: string // e.g. ENG-104
  noteId?: string
  workspaceId?: string
  teamId?: string
  teamName?: string
  title: string
  description?: string
  assignee?: string
  assigneeAvatar?: string
  dueDate?: string
  priority: PriorityLevel
  status: TaskStatus
  createdAt: string
  updatedAt?: string
}

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

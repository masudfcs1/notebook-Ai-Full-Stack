/**
 * NoteFlow AI - Centralized Application Constants & Configuration
 * @file index.ts
 */

import type { ViewKey, ViewMetadata } from "@/types"
import {
  LayoutDashboard,
  Radio,
  Upload,
  Sparkles,
  CheckSquare,
  History,
  Settings,
} from "lucide-react"

export const APP_CONFIG = {
  name: "NoteFlow AI",
  version: "3.5.0",
  apiPrefix: "/api",
  defaultView: "landing" as ViewKey,
  encryptionStandard: "AES-256 (TLS 1.3)",
}

export const VIEW_METADATA: Record<ViewKey, ViewMetadata> = {
  landing: { title: "Landing", subtitle: "Meeting intelligence platform", sysCode: "SYS.PORTAL" },
  login: { title: "Authentication", subtitle: "Access your intelligence hub", sysCode: "SYS.AUTH_LOGIN" },
  signup: { title: "Registration", subtitle: "Provision your team workspace", sysCode: "SYS.AUTH_REGISTER" },
  dashboard: { title: "Dashboard", subtitle: "Real-time meeting intelligence HUD", sysCode: "SYS.DASHBOARD" },
  ongoing: { title: "Ongoing Meeting", subtitle: "Live digital notes & speech matrix", sysCode: "SYS.MEETING.LIVE" },
  upload: { title: "Meeting Notes", subtitle: "Ingest files & process insights", sysCode: "SYS.NOTE_INGEST" },
  summary: { title: "AI Summaries", subtitle: "Neural executive synthesis & metrics", sysCode: "SYS.AI_SUMMARY" },
  "action-items": { title: "Action Items", subtitle: "Automated task tracking matrix", sysCode: "SYS.ACTION_BOARD" },
  history: { title: "History", subtitle: "Archive search & telemetry query", sysCode: "SYS.HISTORY_DB" },
  settings: { title: "Settings", subtitle: "Profile parameters & digital preferences", sysCode: "SYS.CONFIG" },
  team: { title: "Teams", subtitle: "Manage workspace team members & permissions", sysCode: "SYS.TEAM_MGMT" },
}

export const NAVIGATION_GROUPS = [
  {
    section: "Workspace",
    items: [
      { key: "dashboard" as ViewKey, label: "Dashboard", icon: LayoutDashboard, gradient: "from-indigo-500 to-violet-500" },
      { key: "ongoing" as ViewKey, label: "Ongoing Meeting", icon: Radio, badge: "Live", gradient: "from-rose-500 to-orange-500" },
      { key: "upload" as ViewKey, label: "Meeting Notes", icon: Upload, gradient: "from-sky-500 to-indigo-500" },
      { key: "summary" as ViewKey, label: "AI Summaries", icon: Sparkles, gradient: "from-violet-500 to-fuchsia-500" },
      { key: "action-items" as ViewKey, label: "Action Items", icon: CheckSquare, gradient: "from-emerald-500 to-teal-500" },
      { key: "history" as ViewKey, label: "History", icon: History, gradient: "from-amber-500 to-orange-500" },
    ],
  },
  {
    section: "Account",
    items: [{ key: "settings" as ViewKey, label: "Settings", icon: Settings, gradient: "from-slate-500 to-slate-700" }],
  },
]

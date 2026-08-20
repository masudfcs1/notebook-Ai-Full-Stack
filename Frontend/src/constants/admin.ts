/**
 * NoteFlow AI — Admin Panel Constants & Configuration
 * @file admin.ts
 */

import type { ViewKey } from "@/types"
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Activity,
  Settings,
  Bell,
} from "lucide-react"


export const ADMIN_ROLES = [
  {
    name: "SUPER_ADMIN" as const,
    label: "Super Admin",
    description: "Full system access with all permissions. Can manage all users, roles, and system settings.",
    level: 100,
    color: "from-rose-500 to-red-600",
    badge: "bg-rose-500/15 text-rose-500 border-rose-500/30",
    dot: "bg-rose-500",
  },
  {
    name: "ADMIN" as const,
    label: "Administrator",
    description: "Administrative access with most permissions. Can manage users and assign roles below Admin.",
    level: 80,
    color: "from-amber-500 to-orange-500",
    badge: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    dot: "bg-amber-500",
  },
  {
    name: "MANAGER" as const,
    label: "Manager",
    description: "Team management and reporting access. Can view team members and generate reports.",
    level: 60,
    color: "from-violet-500 to-purple-500",
    badge: "bg-violet-500/15 text-violet-500 border-violet-500/30",
    dot: "bg-violet-500",
  },
  {
    name: "EMPLOYEE" as const,
    label: "Employee",
    description: "Standard employee access. Can create notes, view summaries, and manage own tasks.",
    level: 40,
    color: "from-sky-500 to-blue-500",
    badge: "bg-sky-500/15 text-sky-500 border-sky-500/30",
    dot: "bg-sky-500",
  },
  {
    name: "USER" as const,
    label: "User",
    description: "Basic user access. Can create and view own notes and summaries.",
    level: 20,
    color: "from-slate-400 to-slate-500",
    badge: "bg-slate-500/15 text-slate-500 border-slate-500/30",
    dot: "bg-slate-400",
  },
] as const

export type AdminRoleName = (typeof ADMIN_ROLES)[number]["name"]

export const ADMIN_STATUS_CONFIG = {
  ACTIVE: { label: "Active", color: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30", dot: "bg-emerald-500" },
  INACTIVE: { label: "Inactive", color: "bg-slate-500/15 text-slate-400 border-slate-500/30", dot: "bg-slate-400" },
  SUSPENDED: { label: "Suspended", color: "bg-rose-500/15 text-rose-500 border-rose-500/30", dot: "bg-rose-500" },
  PENDING: { label: "Pending", color: "bg-amber-500/15 text-amber-500 border-amber-500/30", dot: "bg-amber-500" },
  DELETED: { label: "Deleted", color: "bg-red-500/15 text-red-400 border-red-500/30", dot: "bg-red-400" },
} as const

export const ADMIN_NAVIGATION_GROUPS = [
  {
    section: "Overview",
    items: [
      { key: "admin-dashboard" as ViewKey, label: "Dashboard", icon: LayoutDashboard, gradient: "from-rose-500 to-amber-500" },
      { key: "admin-users" as ViewKey, label: "User Management", icon: Users, gradient: "from-violet-500 to-indigo-500" },
      { key: "admin-notifications" as ViewKey, label: "Notifications", icon: Bell, gradient: "from-amber-500 to-rose-500" },
    ],
  },

  {
    section: "Access Control",
    items: [
      { key: "admin-roles" as ViewKey, label: "Roles & Permissions", icon: ShieldCheck, gradient: "from-emerald-500 to-teal-500" },
      { key: "admin-activity" as ViewKey, label: "Activity Log", icon: Activity, gradient: "from-sky-500 to-cyan-500" },
    ],
  },
  {
    section: "System",
    items: [
      { key: "admin-settings" as ViewKey, label: "Settings", icon: Settings, gradient: "from-slate-500 to-slate-600" },
    ],
  },
]

export const getRoleConfig = (roleName: string) => {
  return ADMIN_ROLES.find((r) => r.name === roleName) || ADMIN_ROLES[ADMIN_ROLES.length - 1]
}

export const getStatusConfig = (status: string) => {
  return ADMIN_STATUS_CONFIG[status as keyof typeof ADMIN_STATUS_CONFIG] || ADMIN_STATUS_CONFIG.PENDING
}

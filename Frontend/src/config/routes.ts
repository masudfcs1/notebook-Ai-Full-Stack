import type { ViewKey } from '@/types'

export const VIEW_PATHS: Partial<Record<ViewKey, string>> = {
  landing: '/',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  ongoing: '/dashboard/ongoing',
  upload: '/dashboard/upload',
  summary: '/dashboard/summary',
  'action-items': '/dashboard/action-items',
  history: '/dashboard/history',
  settings: '/dashboard/settings',
  'admin-dashboard': '/admin',
  'admin-users': '/admin/users',
  'admin-roles': '/admin/roles',
  'admin-activity': '/admin/activity',
  'admin-notifications': '/admin/notifications',
  'admin-settings': '/admin/settings',
}

export interface ViewRouteContext {
  adminUserId?: number | null
  workspaceSlug?: string | null
  teamSlug?: string | null
}

export function resolveViewPath(view: ViewKey, context: ViewRouteContext = {}) {
  if (view === 'admin-user-detail' && context.adminUserId) {
    return `/admin/users/${context.adminUserId}`
  }

  if (view === 'team' && context.workspaceSlug) {
    return context.teamSlug
      ? `/${context.workspaceSlug}/${context.teamSlug}`
      : `/${context.workspaceSlug}`
  }

  return VIEW_PATHS[view] ?? '/dashboard'
}


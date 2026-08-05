'use client'

import { useAppSelector } from "@/lib/redux/hooks"
import { AdminSidebar } from "./AdminSidebar"
import { AdminTopbar } from "./AdminTopbar"
import { AdminDashboardView } from "@/components/views/admin/admin-dashboard-view"
import { AdminUsersView } from "@/components/views/admin/admin-users-view"
import { AdminRolesView } from "@/components/views/admin/admin-roles-view"
import { AdminActivityView } from "@/components/views/admin/admin-activity-view"
import { AdminSettingsView } from "@/components/views/admin/admin-settings-view"
import { AnimatePresence, motion } from "framer-motion"
import type { ViewKey } from "@/types"

const ADMIN_VIEW_REGISTRY: Record<string, React.ComponentType> = {
  "admin-dashboard": AdminDashboardView,
  "admin-users": AdminUsersView,
  "admin-roles": AdminRolesView,
  "admin-activity": AdminActivityView,
  "admin-settings": AdminSettingsView,
}

export function AdminShell() {
  const view = useAppSelector((s) => s.app.view)

  const ActiveView = ADMIN_VIEW_REGISTRY[view] ?? AdminDashboardView

  return (
    <div className="relative flex min-h-screen bg-background text-foreground transition-colors">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="flex-1 px-4 pb-10 pt-6 md:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <ActiveView />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Admin Footer */}
        <footer className="mt-auto border-t border-border/60 bg-background/80 px-4 py-4 backdrop-blur-xl md:px-6">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} NoteFlow AI — Administration Panel</p>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              All systems operational
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}

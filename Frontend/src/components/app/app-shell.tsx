'use client'

import { useAppSelector } from "@/lib/redux/hooks"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { MobileNav } from "./mobile-nav"
import { MobileSidebar } from "./mobile-sidebar"
import { AiAssistantWidget } from "./ai-assistant-widget"
import { AnimatePresence, motion } from "framer-motion"
import { LandingView } from "@/components/views/landing-view"
import { DashboardView } from "@/components/views/dashboard-view"
import { OngoingView } from "@/components/views/ongoing-view"
import { UploadView } from "@/components/views/upload-view"
import { SummaryView } from "@/components/views/summary-view"
import { ActionItemsView } from "@/components/views/action-items-view"
import { HistoryView } from "@/components/views/history-view"
import { SettingsView } from "@/components/views/settings-view"

const VIEWS = {
  dashboard: DashboardView,
  ongoing: OngoingView,
  upload: UploadView,
  summary: SummaryView,
  "action-items": ActionItemsView,
  history: HistoryView,
  settings: SettingsView,
} as const

export function AppShell() {
  const view = useAppSelector((s) => s.app.view)

  if (view === "landing") {
    return (
      <>
        <LandingView />
        <AiAssistantWidget />
      </>
    )
  }

  const Current = VIEWS[view] ?? DashboardView

  return (
    <div className="relative flex min-h-screen bg-mesh">
      <Sidebar />
      <MobileSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 pb-28 pt-6 md:px-6 lg:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <Current />
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
      </div>

      <MobileNav />
      <AiAssistantWidget />
    </div>
  )
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-background/60 px-4 py-5 backdrop-blur-xl md:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} NoteFlow AI — Meeting Intelligence Platform</p>
        <div className="flex items-center gap-4">
          <a href="#" className="transition-colors hover:text-foreground">Privacy</a>
          <a href="#" className="transition-colors hover:text-foreground">Terms</a>
          <a href="#" className="transition-colors hover:text-foreground">Docs</a>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  )
}

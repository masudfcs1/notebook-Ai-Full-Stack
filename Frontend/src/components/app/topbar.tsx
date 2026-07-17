'use client'

import { Search, Menu, Sun, Moon, Command, Plus, Sparkles } from "lucide-react"
import { useTheme } from "next-themes"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { setMobileNav, setView, toggleAiWidget, setSearchQuery } from "@/lib/redux/appSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

const TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Your meeting intelligence at a glance" },
  ongoing: { title: "Ongoing Meeting", subtitle: "Capture live notes as your meeting unfolds" },
  upload: { title: "Meeting Notes", subtitle: "Upload files or write notes to summarize" },
  summary: { title: "AI Summaries", subtitle: "AI-generated executive summaries & insights" },
  "action-items": { title: "Action Items", subtitle: "Track extracted tasks across your team" },
  history: { title: "History", subtitle: "Browse and search past meetings" },
  settings: { title: "Settings", subtitle: "Manage your profile and preferences" },
}

export function Topbar() {
  const dispatch = useAppDispatch()
  const view = useAppSelector((s) => s.app.view)
  const searchQuery = useAppSelector((s) => s.app.searchQuery)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  const meta = TITLES[view] ?? TITLES.dashboard

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-2xl md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => dispatch(setMobileNav(true))}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="min-w-0 flex-1">
        <motion.h1
          key={view}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="truncate text-base font-semibold leading-tight md:text-lg"
        >
          {meta.title}
        </motion.h1>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">{meta.subtitle}</p>
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          placeholder="Search meetings, tasks…"
          className="h-9 w-56 rounded-xl border-border/60 bg-muted/40 pl-9 pr-12 text-sm lg:w-72"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:flex">
          <Command className="h-3 w-3" />K
        </kbd>
      </div>

      {/* AI Assistant toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => dispatch(toggleAiWidget())}
        className="hidden h-9 gap-2 rounded-xl border-indigo-500/30 bg-indigo-500/5 text-indigo-600 hover:bg-indigo-500/10 hover:text-indigo-700 dark:text-indigo-300 sm:flex"
      >
        <Sparkles className="h-4 w-4" />
        <span className="text-xs font-medium">Ask AI</span>
        <Badge variant="secondary" className="h-4 bg-indigo-500/15 px-1 text-[9px] text-indigo-600 dark:text-indigo-300">
          BETA
        </Badge>
      </Button>

      <Button
        variant="default"
        size="sm"
        onClick={() => dispatch(setView("upload"))}
        className="h-9 gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25 hover:opacity-95"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden text-xs font-medium sm:inline">New Note</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-xl"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
      >
        {mounted && theme === "dark" ? (
          <Sun className="h-4.5 w-4.5" />
        ) : (
          <Moon className="h-4.5 w-4.5" />
        )}
      </Button>
    </header>
  )
}

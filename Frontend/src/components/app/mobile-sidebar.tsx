'use client'

import {
  LayoutDashboard, Radio, Upload, Sparkles, CheckSquare, History, Settings,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { setMobileNav, setView, type ViewKey } from "@/lib/redux/appSlice"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Logo, Wordmark } from "./logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const ITEMS: { key: ViewKey; label: string; icon: typeof LayoutDashboard; gradient: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, gradient: "from-indigo-500 to-violet-500" },
  { key: "ongoing", label: "Ongoing Meeting", icon: Radio, gradient: "from-rose-500 to-orange-500" },
  { key: "upload", label: "Meeting Notes", icon: Upload, gradient: "from-sky-500 to-indigo-500" },
  { key: "summary", label: "AI Summaries", icon: Sparkles, gradient: "from-violet-500 to-fuchsia-500" },
  { key: "action-items", label: "Action Items", icon: CheckSquare, gradient: "from-emerald-500 to-teal-500" },
  { key: "history", label: "History", icon: History, gradient: "from-amber-500 to-orange-500" },
  { key: "settings", label: "Settings", icon: Settings, gradient: "from-slate-500 to-slate-700" },
]

export function MobileSidebar() {
  const dispatch = useAppDispatch()
  const open = useAppSelector((s) => s.app.mobileNavOpen)
  const view = useAppSelector((s) => s.app.view)

  return (
    <Sheet open={open} onOpenChange={(o) => dispatch(setMobileNav(o))}>
      <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar/95 p-0 backdrop-blur-2xl">
        <SheetHeader className="px-5 pt-5">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <div>
              <SheetTitle asChild>
                <div><Wordmark className="text-[15px]" /></div>
              </SheetTitle>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Meeting Intelligence
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex items-center gap-3 px-5 py-4">
          <Avatar className="h-10 w-10 border border-sidebar-border">
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-semibold text-white">
              AK
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Arjun Kapoor</p>
            <p className="truncate text-xs text-muted-foreground">arjun@noteflow.ai</p>
          </div>
        </div>

        <nav className="space-y-1 px-3 pb-6">
          {ITEMS.map((item) => {
            const active = view === item.key
            const Icon = item.icon
            return (
              <button
                key={item.key}
                onClick={() => dispatch(setView(item.key))}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-sidebar-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    active
                      ? `bg-gradient-to-br ${item.gradient} text-white shadow-md shadow-indigo-500/30`
                      : "bg-sidebar-accent/50 text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.2} />
                </span>
                {item.label}
              </button>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

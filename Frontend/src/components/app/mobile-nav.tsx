'use client'

import { LayoutDashboard, Radio, Upload, Sparkles, CheckSquare } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { setView, type ViewKey } from "@/lib/redux/appSlice"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const ITEMS: { key: ViewKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "Home", icon: LayoutDashboard },
  { key: "ongoing", label: "Live", icon: Radio },
  { key: "upload", label: "Notes", icon: Upload },
  { key: "summary", label: "Summary", icon: Sparkles },
  { key: "action-items", label: "Tasks", icon: CheckSquare },
]

export function MobileNav() {
  const dispatch = useAppDispatch()
  const view = useAppSelector((s) => s.app.view)

  return (
    <nav
      className="digital-hud-glass fixed inset-x-0 bottom-0 z-40 border-t border-indigo-500/30 bg-background/85 backdrop-blur-2xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid max-w-md grid-cols-5 py-1">
        {ITEMS.map((item) => {
          const active = view === item.key
          const Icon = item.icon
          return (
            <button
              key={item.key}
              onClick={() => dispatch(setView(item.key))}
              className="relative flex flex-col items-center gap-1 py-2"
              aria-label={item.label}
            >
              {active && (
                <motion.span
                  layoutId="mobile-active"
                  className="absolute -top-1 h-1 w-7 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300",
                  active
                    ? "bg-indigo-500/15 text-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] border border-indigo-500/30"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  className="h-4.5 w-4.5"
                  strokeWidth={active ? 2.4 : 2}
                />
              </div>
              <span
                className={cn(
                  "text-[9px] font-semibold uppercase tracking-wider transition-colors",
                  active ? "text-indigo-500" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}


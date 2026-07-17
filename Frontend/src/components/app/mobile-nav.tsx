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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/85 backdrop-blur-2xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {ITEMS.map((item) => {
          const active = view === item.key
          const Icon = item.icon
          return (
            <button
              key={item.key}
              onClick={() => dispatch(setView(item.key))}
              className="relative flex flex-col items-center gap-1 py-2.5"
              aria-label={item.label}
            >
              {active && (
                <motion.span
                  layoutId="mobile-active"
                  className="absolute -top-px h-0.5 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  active ? "text-indigo-500" : "text-muted-foreground"
                )}
                strokeWidth={active ? 2.4 : 2}
              />
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
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

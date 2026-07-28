'use client'

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { setMobileNav, setView } from "@/lib/redux/appSlice"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Logo, Wordmark } from "./Logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { NAVIGATION_GROUPS } from "@/constants"

export function MobileSidebar() {
  const dispatch = useAppDispatch()
  const open = useAppSelector((s) => s.app.mobileNavOpen)
  const view = useAppSelector((s) => s.app.view)

  return (
    <Sheet open={open} onOpenChange={(v) => dispatch(setMobileNav(v))}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border/60 p-4 text-left">
          <SheetTitle className="flex items-center gap-3">
            <Logo size={32} />
            <div>
              <Wordmark className="text-sm" />
              <p className="text-[10px] font-normal uppercase tracking-widest text-muted-foreground">
                Meeting Intelligence
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <nav className="space-y-6 p-4">
          {NAVIGATION_GROUPS.map((group) => (
            <div key={group.section} className="space-y-1">
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                {group.section}
              </p>
              {group.items.map((item) => {
                const active = view === item.key
                const Icon = item.icon
                return (
                  <button
                    key={item.key}
                    onClick={() => dispatch(setView(item.key))}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? "bg-indigo-500/15 text-foreground"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        active
                          ? `bg-gradient-to-br ${item.gradient} text-white shadow-md shadow-indigo-500/30`
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="h-5 bg-rose-500/15 text-[10px] text-rose-500">
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 inset-x-0 border-t border-border/60 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-semibold text-white">
                AK
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-xs font-semibold">Arjun Kapoor</p>
              <p className="truncate text-[10px] text-muted-foreground">arjun@noteflow.ai</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => dispatch(setView("login"))}
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

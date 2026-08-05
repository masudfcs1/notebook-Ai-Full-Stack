'use client'

import { motion } from "framer-motion"
import {
  PanelLeftClose,
  PanelLeft,
  LogOut,
  ArrowLeftRight,
  Shield,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { setView, toggleSidebar } from "@/lib/redux/appSlice"
import { logout } from "@/lib/redux/authSlice"
import { Logo, Wordmark } from "@/features/navigation"
import { cn, getUserDisplayName, getUserInitials, getAvatarUrl } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ADMIN_NAVIGATION_GROUPS } from "@/constants/admin"

export function AdminSidebar() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const view = useAppSelector((s) => s.app.view)
  const collapsed = useAppSelector((s) => s.app.sidebarCollapsed)

  const avatarSrc = getAvatarUrl(user?.avatar)
  const displayName = getUserDisplayName(user, "Admin")
  const displayEmail = user?.email || "admin@noteflow.ai"
  const initials = getUserInitials(user?.name, user?.email)

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 272 }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-rose-500/10 bg-slate-950/95 backdrop-blur-2xl lg:flex z-30"
      )}
    >
      {/* Header / Logo */}
      <div className="flex h-16 items-center gap-3 px-4">
        <button
          onClick={() => dispatch(setView("admin-dashboard"))}
          className="flex items-center gap-3 overflow-hidden text-left"
          aria-label="Go to admin dashboard"
        >
          <Logo size={36} className="transition-transform hover:scale-105 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Wordmark className="text-base text-white" />
              <Badge className="h-5 rounded-md border border-rose-500/30 bg-rose-500/15 px-1.5 text-[9px] font-bold text-rose-400">
                <Shield className="mr-0.5 h-2.5 w-2.5" />
                ADMIN
              </Badge>
            </motion.div>
          )}
        </button>

        <div className="ml-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
                onClick={() => dispatch(toggleSidebar())}
              >
                {collapsed ? (
                  <PanelLeft className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {ADMIN_NAVIGATION_GROUPS.map((group) => (
          <div key={group.section} className="mb-5">
            {!collapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500"
              >
                {group.section}
              </motion.p>
            )}
            {group.items.map((item) => {
              const isActive = view === item.key
              const Icon = item.icon

              const btn = (
                <button
                  key={item.key}
                  onClick={() => dispatch(setView(item.key))}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-gradient-to-r from-rose-500/15 to-amber-500/10 text-white shadow-sm shadow-rose-500/10"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div
                      layoutId="admin-sidebar-active"
                      className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-rose-500 to-amber-500"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all",
                      isActive
                        ? `bg-gradient-to-br ${item.gradient} text-white shadow-lg shadow-rose-500/20`
                        : "bg-white/5 text-slate-400 group-hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </button>
              )

              if (collapsed) {
                return (
                  <Tooltip key={item.key}>
                    <TooltipTrigger asChild>{btn}</TooltipTrigger>
                    <TooltipContent side="right" className="text-xs font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return btn
            })}
          </div>
        ))}
      </nav>

      {/* Footer — User profile + actions */}
      <div className="border-t border-white/5 p-3">
        {/* Switch to User Panel */}
        {!collapsed ? (
          <button
            onClick={() => dispatch(setView("dashboard"))}
            className="mb-3 flex w-full items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-white/5 hover:text-white cursor-pointer"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Switch to User Panel
          </button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mb-2 h-8 w-full text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
                onClick={() => dispatch(setView("dashboard"))}
              >
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              Switch to User Panel
            </TooltipContent>
          </Tooltip>
        )}

        {/* User info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-rose-500/20">
            {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
            <AvatarFallback className="bg-gradient-to-br from-rose-500 to-amber-500 text-xs font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-w-0 flex-1 text-left"
            >
              <p className="truncate text-xs font-semibold text-white">{displayName}</p>
              <p className="truncate text-[10px] text-slate-500">{displayEmail}</p>
            </motion.div>
          )}
          {!collapsed ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Sign out"
              onClick={() => {
                dispatch(logout())
                dispatch(setView("login"))
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  onClick={() => {
                    dispatch(logout())
                    dispatch(setView("login"))
                  }}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                Sign out
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </motion.aside>
  )
}

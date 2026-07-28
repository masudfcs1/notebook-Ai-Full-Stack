'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import {
  PanelLeftClose,
  PanelLeft,
  Bell,
  LogOut,
  ChevronRight,
  ChevronDown,
  Building2,
  Users,
  Plus,
  Check,
  Briefcase,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { setView, toggleSidebar, markAllNotificationsRead } from "@/lib/redux/appSlice"
import { setActiveWorkspace, setActiveTeam } from "@/lib/redux/dataSlice"
import { Logo, Wordmark } from "./Logo"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { NAVIGATION_GROUPS } from "@/constants"
import { WorkspaceModal } from "@/components/modals/workspace-modal"
import { TeamModal } from "@/components/modals/team-modal"

export function Sidebar() {
  const dispatch = useAppDispatch()
  const view = useAppSelector((s) => s.app.view)
  const collapsed = useAppSelector((s) => s.app.sidebarCollapsed)
  const notifications = useAppSelector((s) => s.app.notifications)
  const unread = notifications.filter((n) => !n.read).length

  // Workspaces & Teams state
  const workspaces = useAppSelector((s) => s.data.workspaces)
  const activeWorkspaceId = useAppSelector((s) => s.data.activeWorkspaceId)
  const activeTeamId = useAppSelector((s) => s.data.activeTeamId)
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0]
  const teams = activeWorkspace?.teams || []

  // Modal triggers
  const [wsModalOpen, setWsModalOpen] = useState(false)
  const [teamModalOpen, setTeamModalOpen] = useState(false)

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 272 }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border/60 bg-sidebar/70 backdrop-blur-2xl lg:flex z-30"
        )}
      >
        {/* Header / Logo */}
        <div className="flex h-16 items-center gap-3 px-4">
          <button
            onClick={() => dispatch(setView("landing"))}
            className="flex items-center gap-3 overflow-hidden text-left"
            aria-label="Go to landing"
          >
            <Logo size={36} />
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
              >
                <Wordmark className="text-[15px] text-sidebar-foreground" />
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Meeting Intelligence
                </p>
              </motion.div>
            )}
          </button>
        </div>

        {/* Workspace Switcher Component */}
        <div className="px-3 pb-2 pt-1 border-b border-sidebar-border/40">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl border border-white/10 bg-background/50 p-2 text-left shadow-sm transition-all hover:bg-background hover:border-white/20",
                  collapsed && "justify-center p-2"
                )}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-sm font-semibold">
                  {activeWorkspace?.icon || "⚡"}
                </div>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-sidebar-foreground">
                      {activeWorkspace?.name || "Select Workspace"}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {teams.length} {teams.length === 1 ? "team" : "teams"} active
                    </p>
                  </div>
                )}
                {!collapsed && <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Workspaces
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => dispatch(setActiveWorkspace(ws.id))}
                  className="flex items-center justify-between py-2 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base">{ws.icon || "🏢"}</span>
                    <div className="truncate">
                      <p className="text-xs font-semibold">{ws.name}</p>
                      <p className="text-[10px] text-muted-foreground">{ws.teams.length} teams</p>
                    </div>
                  </div>
                  {ws.id === activeWorkspaceId && <Check className="h-4 w-4 text-indigo-500" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setWsModalOpen(true)}
                className="gap-2 text-xs font-medium text-indigo-500 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Create Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Teams Selector Pill list in Sidebar */}
          {!collapsed && (
            <div className="mt-2.5 space-y-1">
              <div className="flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
                <span>Teams</span>
                <button
                  onClick={() => setTeamModalOpen(true)}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  title="Create Team"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <button
                onClick={() => dispatch(setActiveTeam(null))}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors",
                  activeTeamId === null
                    ? "bg-indigo-500/15 font-semibold text-indigo-400"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                )}
              >
                <span className="text-xs">🌐</span>
                <span className="truncate">All Teams</span>
              </button>

              {teams.map((t) => (
                <button
                  key={t.id}
                  onClick={() => dispatch(setActiveTeam(t.id))}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors",
                    activeTeamId === t.id
                      ? "bg-indigo-500/15 font-semibold text-indigo-400"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs">{t.icon || "💬"}</span>
                    <span className="truncate">{t.name}</span>
                  </div>
                  <span className="font-mono text-[9px] rounded bg-white/5 px-1 py-0.5 text-muted-foreground">
                    {t.key}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-6 overflow-y-auto scrollbar-thin px-3 py-4">
          {NAVIGATION_GROUPS.map((group) => (
            <div key={group.section} className="space-y-1">
              {!collapsed && (
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                  {group.section}
                </p>
              )}
              {group.items.map((item) => {
                const active = view === item.key
                const Icon = item.icon
                return (
                  <Tooltip key={item.key} delayDuration={collapsed ? 100 : 400}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => dispatch(setView(item.key))}
                        className={cn(
                          "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                          active
                            ? "bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-sidebar-foreground"
                            : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                          collapsed && "justify-center"
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="sidebar-active"
                            className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-500 to-violet-500"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}
                        <span
                          className={cn(
                            "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all",
                            active
                              ? `bg-gradient-to-br ${item.gradient} text-white shadow-md shadow-indigo-500/30`
                              : "bg-sidebar-accent/50 text-muted-foreground group-hover:text-sidebar-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2.2} />
                        </span>
                        {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                        {!collapsed && item.badge && (
                          <Badge
                            variant="secondary"
                            className="h-5 bg-rose-500/15 px-1.5 text-[10px] font-semibold text-rose-500"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </button>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right" className="font-medium">
                        {item.label}
                      </TooltipContent>
                    )}
                  </Tooltip>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border/60 p-3">
          <div className={cn("flex items-center gap-2", collapsed && "flex-col")}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 rounded-lg bg-sidebar-accent/50"
                >
                  <Bell className="h-4 w-4" />
                  {unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  <button
                    className="text-xs text-indigo-500 hover:underline"
                    onClick={() => dispatch(markAllNotificationsRead())}
                  >
                    Mark all read
                  </button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {notifications.map((n) => (
                    <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2.5">
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="text-sm font-medium">{n.title}</span>
                        {!n.read && <span className="h-2 w-2 rounded-full bg-indigo-500" />}
                      </div>
                      <span className="text-xs text-muted-foreground">{n.description}</span>
                      <span className="text-[10px] text-muted-foreground/70">{n.time}</span>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={() => dispatch(setView("settings"))}
              className={cn(
                "flex flex-1 items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-sidebar-accent/60",
                collapsed && "w-full justify-center"
              )}
            >
              <Avatar className="h-8 w-8 border border-sidebar-border">
                <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces" />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-[11px] font-semibold text-white">
                  AK
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-xs font-semibold text-sidebar-foreground">Arjun Kapoor</p>
                  <p className="truncate text-[10px] text-muted-foreground">arjun@noteflow.ai</p>
                </div>
              )}
              {!collapsed && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
          </div>

          <div className={cn("mt-2 flex", collapsed ? "justify-center" : "justify-between")}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(toggleSidebar())}
              className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-sidebar-foreground"
            >
              {collapsed ? <PanelLeft className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /> Collapse</>}
            </Button>
            {!collapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(setView("login"))}
                className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-sidebar-foreground"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </Button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Modals */}
      <WorkspaceModal open={wsModalOpen} onClose={() => setWsModalOpen(false)} />
      <TeamModal open={teamModalOpen} onClose={() => setTeamModalOpen(false)} />
    </>
  )
}

'use client'

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { setView, toggleSidebar, markAllNotificationsRead } from "@/lib/redux/appSlice"
import { logout } from "@/lib/redux/authSlice"
import { cn, getUserDisplayName, getUserInitials, getAvatarUrl } from "@/lib/utils"
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
import {
  Bell,
  Shield,
  LogOut,
  Settings,
  LayoutDashboard,
  ChevronDown,
  Search,
  Menu,
} from "lucide-react"
import { VIEW_METADATA } from "@/constants"
import type { ViewKey } from "@/types"

export function AdminTopbar() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const view = useAppSelector((s) => s.app.view)
  const notifications = useAppSelector((s) => s.app.notifications)
  const unread = notifications.filter((n) => !n.read).length

  const avatarSrc = getAvatarUrl(user?.avatar)
  const displayName = getUserDisplayName(user, "Admin")
  const displayEmail = user?.email || ""
  const initials = getUserInitials(user?.name, user?.email)

  const meta = VIEW_METADATA[view as ViewKey] || VIEW_METADATA["admin-dashboard"]

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-rose-500/10 bg-slate-950/80 px-4 backdrop-blur-2xl md:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 lg:hidden text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
        onClick={() => dispatch(toggleSidebar())}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* View title */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5">
          <Shield className="h-3.5 w-3.5 text-rose-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
            Administration
          </span>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-sm font-semibold text-white">{meta.title}</h1>
          <p className="text-[10px] text-slate-500">{meta.subtitle}</p>
        </div>
      </div>

      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Search */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-lg shadow-rose-500/40">
                  {unread}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 bg-slate-900 border-slate-700 p-2">
            <DropdownMenuLabel className="flex items-center justify-between text-xs text-slate-300">
              <span>Notifications</span>
              {unread > 0 && (
                <button
                  onClick={() => dispatch(markAllNotificationsRead())}
                  className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-700" />
            {notifications.slice(0, 4).map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={cn(
                  "flex-col items-start gap-0.5 rounded-lg p-2.5 text-xs cursor-pointer",
                  !n.read && "bg-rose-500/5"
                )}
              >
                <span className="font-medium text-slate-200">{n.title}</span>
                <span className="text-[10px] text-slate-500">{n.description}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Separator */}
        <div className="mx-1 h-6 w-px bg-white/5" />

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-white/[0.03] p-1.5 shadow-sm transition-all hover:bg-white/5 hover:border-rose-500/40 cursor-pointer">
              <Avatar className="h-7 w-7 border border-rose-500/20">
                {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
                <AvatarFallback className="bg-gradient-to-br from-rose-500 to-amber-500 text-[10px] font-bold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-xs font-semibold text-white md:block">
                {displayName}
              </span>
              <ChevronDown className="hidden h-3 w-3 text-slate-500 md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-700 p-1">
            <DropdownMenuLabel className="font-normal px-2 py-1.5">
              <div className="flex flex-col space-y-0.5">
                <p className="text-xs font-semibold text-white leading-tight">{displayName}</p>
                <p className="text-[10px] text-slate-400 truncate">{displayEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem
              onClick={() => dispatch(setView("admin-dashboard"))}
              className="gap-2 text-xs font-medium cursor-pointer rounded-lg text-slate-300 hover:text-white"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-rose-400" /> Admin Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => dispatch(setView("admin-settings"))}
              className="gap-2 text-xs font-medium cursor-pointer rounded-lg text-slate-300 hover:text-white"
            >
              <Settings className="h-3.5 w-3.5 text-rose-400" /> Admin Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem
              onClick={() => dispatch(setView("dashboard"))}
              className="gap-2 text-xs font-medium cursor-pointer rounded-lg text-slate-300 hover:text-white"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-indigo-400" /> User Dashboard
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem
              onClick={() => {
                dispatch(logout())
                dispatch(setView("login"))
              }}
              className="gap-2 text-xs font-medium text-rose-400 focus:text-rose-400 focus:bg-rose-500/10 cursor-pointer rounded-lg"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

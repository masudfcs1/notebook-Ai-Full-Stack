'use client'

import {
  Search, Menu, Sun, Moon, Command, Plus, Sparkles, X, ChevronDown,
  LayoutDashboard, Settings, LogOut, User as UserIcon, Shield,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { setMobileNav, setView, toggleAiWidget, setSearchQuery } from "@/lib/redux/appSlice"
import { logout } from "@/lib/redux/authSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { VIEW_METADATA } from "@/constants"
import { getUserDisplayName, getUserInitials, getAvatarUrl } from "@/lib/utils"

export function Topbar() {
  const dispatch = useAppDispatch()
  const view = useAppSelector((s) => s.app.view)
  const searchQuery = useAppSelector((s) => s.app.searchQuery)
  const user = useAppSelector((s) => s.auth.user)
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [digitalTime, setDigitalTime] = useState("")

  const avatarSrc = getAvatarUrl(user?.avatar)
  const displayName = getUserDisplayName(user, "Account")
  const displayEmail = user?.email || ""
  const initials = getUserInitials(user?.name, user?.email)
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN"

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    const updateClock = () => {
      const now = new Date()
      const hrs = String(now.getHours()).padStart(2, "0")
      const mins = String(now.getMinutes()).padStart(2, "0")
      const secs = String(now.getSeconds()).padStart(2, "0")
      setDigitalTime(`${hrs}:${mins}:${secs}`)
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  const meta = VIEW_METADATA[view] ?? VIEW_METADATA.dashboard

  return (
    <header className="digital-hud-glass digital-scanline sticky top-0 z-20 flex h-16 items-center justify-between gap-3 px-4 backdrop-blur-2xl md:px-6">
      {/* Left: Mobile trigger & Digital Breadcrumbs / Titles */}
      <div className="flex items-center gap-3.5 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-500 hover:bg-indigo-500/10"
          onClick={() => dispatch(setMobileNav(true))}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="hidden rounded bg-indigo-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 sm:inline-block border border-indigo-500/20">
              {meta.sysCode}
            </span>
            <motion.h1
              key={view}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="truncate text-base font-semibold leading-tight md:text-lg tracking-tight"
            >
              {meta.title}
            </motion.h1>
          </div>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">{meta.subtitle}</p>
        </div>
      </div>

      {/* Center/Right controls */}
      <div className="flex items-center gap-2.5">
        {/* Live HUD status indicator */}
        <div className="hidden items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-2.5 py-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 xl:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="font-semibold tracking-wider text-[10px]">SYS: OPTIMAL</span>
          {digitalTime && (
            <>
              <span className="text-emerald-500/40">|</span>
              <span className="font-mono text-[10px] text-muted-foreground">{digitalTime}</span>
            </>
          )}
        </div>

        {/* Futuristic Search Input HUD */}
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500/70" />
          <Input
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            placeholder="Search telemetry, notes…"
            className="h-9 w-52 rounded-xl border border-indigo-500/20 bg-background/50 pl-9 pr-14 text-xs tracking-tight transition-all duration-300 focus:border-indigo-500/60 focus:bg-background focus:shadow-[0_0_20px_rgba(99,102,241,0.2)] lg:w-64"
          />
          {searchQuery ? (
            <button
              onClick={() => dispatch(setSearchQuery(""))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded border border-indigo-500/20 bg-indigo-500/10 px-1.5 py-0.5 font-mono text-[9px] font-medium text-indigo-600 dark:text-indigo-300 lg:flex">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          )}
        </div>

        {/* Ask AI Cyber Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch(toggleAiWidget())}
          className="relative hidden h-9 items-center gap-2 rounded-xl border border-indigo-500/40 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-indigo-500/5 px-3 text-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:border-indigo-500/70 hover:bg-indigo-500/15 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] dark:text-indigo-300 sm:flex"
        >
          <Sparkles className="h-4 w-4 animate-pulse text-indigo-500" />
          <span className="text-xs font-semibold tracking-tight">Ask AI</span>
          <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-indigo-600 dark:text-indigo-300">
            v2.4
          </span>
        </Button>

        {/* New Note Action Button */}
        <Button
          variant="default"
          size="sm"
          onClick={() => dispatch(setView("upload"))}
          className="h-9 gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white font-medium shadow-md shadow-indigo-500/25 transition-all duration-300 hover:shadow-[0_0_25px_rgba(99,102,241,0.45)] hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden text-xs font-semibold sm:inline">New Note</span>
        </Button>

        {/* Theme Toggle HUD Icon */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl border border-border/60 bg-background/40 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-500"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {mounted && theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-500" />
          )}
        </Button>

        {/* User profile dropdown if logged in, else Log In / Sign Up buttons */}
        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-background/60 p-1.5 shadow-sm transition-all hover:bg-indigo-500/10 hover:border-indigo-500/50 cursor-pointer">
                <Avatar className="h-7 w-7 border border-indigo-500/30">
                  {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-[10px] font-bold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-xs font-semibold text-foreground md:inline-block max-w-[110px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1">
              <DropdownMenuLabel className="font-normal px-2 py-1.5">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-xs font-semibold leading-tight">{displayName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{displayEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isAdmin && (
                <>
                  <DropdownMenuItem
                    onClick={() => dispatch(setView("admin-dashboard"))}
                    className="gap-2 text-xs font-medium cursor-pointer rounded-lg text-rose-500 focus:text-rose-600 focus:bg-rose-500/10"
                  >
                    <Shield className="h-3.5 w-3.5" /> Admin Panel
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={() => dispatch(setView("dashboard"))}
                className="gap-2 text-xs font-medium cursor-pointer rounded-lg"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-indigo-500" /> Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => dispatch(setView("settings"))}
                className="gap-2 text-xs font-medium cursor-pointer rounded-lg"
              >
                <Settings className="h-3.5 w-3.5 text-indigo-500" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  dispatch(logout())
                  dispatch(setView("login"))
                }}
                className="gap-2 text-xs font-medium text-rose-500 focus:text-rose-500 focus:bg-rose-500/10 cursor-pointer rounded-lg"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(setView("login"))}
              className="h-9 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-indigo-500/10 rounded-xl"
            >
              Log In
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(setView("signup"))}
              className="h-9 px-3 text-xs font-semibold border-indigo-500/30 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 dark:text-indigo-300 rounded-xl"
            >
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}

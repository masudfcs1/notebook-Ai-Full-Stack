"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/router";
import {
  PanelLeftClose,
  PanelLeft,
  LogOut,
  ArrowLeftRight,
} from "lucide-react";

import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setView, toggleSidebar } from "@/lib/redux/appSlice";
import { logout } from "@/lib/redux/authSlice";
import { Logo, Wordmark } from "@/features/navigation";
import {
  cn,
  getUserDisplayName,
  getUserInitials,
  getAvatarUrl,
} from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ADMIN_NAVIGATION_GROUPS } from "@/constants/admin";

export function AdminSidebar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const view = useAppSelector((s) => s.app.view);
  const collapsed = useAppSelector((s) => s.app.sidebarCollapsed);
  const workspaces = useAppSelector((s) => s.data.workspaces);
  const activeWorkspaceId = useAppSelector((s) => s.data.activeWorkspaceId);
  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const handleSwitchToUserPanel = () => {
    dispatch(setView("dashboard"));
    if (activeWorkspace?.slug) {
      void router.push(`/${activeWorkspace.slug}`);
    } else {
      void router.push("/");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(setView("login"));
    toast.success("Logged out successfully", {
      position: "bottom-right",
    });
  };

  const avatarSrc = getAvatarUrl(user?.avatar);
  const displayName = getUserDisplayName(user, "Admin");
  const displayEmail = user?.email || "admin@noteflow.ai";
  const initials = getUserInitials(user?.name, user?.email);
  const adminAvatar = (
    <Avatar className="h-9 w-9 border border-rose-500/20 shadow-sm">
      {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
      <AvatarFallback className="bg-linear-to-br from-rose-500 to-amber-500 text-xs font-semibold text-white">
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 272 }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      className={cn(
        "dashboard-sidebar admin-dashboard-sidebar sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r text-sidebar-foreground lg:flex",
      )}
    >
      {/* Persistent edge control keeps the rail uncluttered at both widths. */}
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="absolute -right-3.5 top-5 z-40 h-7 w-7 rounded-full border-rose-500/20 bg-background/95 text-muted-foreground shadow-md backdrop-blur-md hover:border-rose-500/40 hover:bg-background hover:text-rose-600 dark:hover:text-rose-300 cursor-pointer"
            onClick={() => dispatch(toggleSidebar())}
            aria-label={
              collapsed ? "Expand admin sidebar" : "Collapse admin sidebar"
            }
            aria-expanded={!collapsed}
          >
            {collapsed ? (
              <PanelLeft className="h-3.5 w-3.5" />
            ) : (
              <PanelLeftClose className="h-3.5 w-3.5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs font-medium">
          {collapsed ? "Expand sidebar" : "Collapse sidebar"}
        </TooltipContent>
      </Tooltip>

      {/* Header / Logo */}
      <div
        className={cn(
          "flex h-18 shrink-0 items-center",
          collapsed ? "justify-center px-2" : "px-4",
        )}
      >
        <button
          onClick={() => dispatch(setView("admin-dashboard"))}
          className={cn(
            "flex min-w-0 items-center overflow-hidden rounded-xl text-left transition-colors hover:bg-rose-500/5 cursor-pointer",
            collapsed ? "h-11 w-11 justify-center" : "gap-3 px-1 py-1.5",
          )}
          aria-label="Go to admin dashboard"
        >
          <Logo size={36} className="shrink-0" />
          {!collapsed && (
            <div className="min-w-0 flex-1 flex items-center gap-2">
              <Wordmark className="text-base text-foreground" />
            </div>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          "flex-1 overflow-y-auto py-4 scrollbar-thin",
          collapsed ? "px-2.5" : "px-3",
        )}
        aria-label="Admin navigation"
      >
        {ADMIN_NAVIGATION_GROUPS.map((group) => (
          <div
            key={group.section}
            className={cn(
              "mb-5 space-y-1",
              collapsed &&
                "mb-3 border-b border-sidebar-border/50 pb-3 last:mb-0 last:border-b-0 last:pb-0",
            )}
          >
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-zinc-500 dark:text-zinc-400">
                {group.section}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = view === item.key;
              const Icon = item.icon;

              const handleNavClick = () => {
                dispatch(setView(item.key));
                // Sync Next.js route if desired
                const routeMap: Record<string, string> = {
                  "admin-dashboard": "/admin",
                  "admin-users": "/admin/users",
                  "admin-roles": "/admin/roles",
                  "admin-activity": "/admin/activity",
                  "admin-notifications": "/admin/notifications",
                  "admin-settings": "/admin/settings",
                };
                const targetPath = routeMap[item.key];
                if (targetPath && router.pathname !== targetPath) {
                  void router.push(targetPath);
                }
              };

              const btn = (
                <button
                  key={item.key}
                  onClick={handleNavClick}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={collapsed ? item.label : undefined}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-rose-500/12 text-zinc-950 dark:text-white font-semibold shadow-xs ring-1 ring-rose-500/20"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white",
                    collapsed && "h-11 justify-center px-0 py-0",
                  )}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div
                      layoutId="admin-sidebar-active"
                      className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-linear-to-b from-rose-500 to-amber-500"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all",
                      collapsed && "h-8 w-8",
                      isActive
                        ? `bg-linear-to-br ${item.gradient} text-white shadow-lg shadow-rose-500/20`
                        : "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200/80 group-hover:bg-rose-500/10 group-hover:text-rose-600 dark:bg-white/5 dark:text-zinc-400 dark:ring-white/10 dark:group-hover:text-rose-300",
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                  </div>
                  {!collapsed && <span className="truncate font-medium">{item.label}</span>}
                </button>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.key} delayDuration={100}>
                    <TooltipTrigger asChild>{btn}</TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="ml-1 text-xs font-medium"
                    >
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return btn;
            })}
          </div>
        ))}
      </nav>

      {/* Footer — User profile + actions */}
      <div
        className={cn(
          "shrink-0 border-t border-border/50 bg-white/20 dark:bg-white/[0.012]",
          collapsed ? "flex flex-col items-center gap-2 p-2.5" : "p-3",
        )}
      >
        {/* Switch to User Panel */}
        {!collapsed ? (
          <button
            onClick={handleSwitchToUserPanel}
            className="mb-3 flex w-full items-center gap-2 rounded-xl border border-border/50 bg-white/40 px-3 py-2.5 text-xs font-medium text-zinc-700 shadow-sm transition-all hover:border-rose-500/20 hover:bg-white/70 hover:text-zinc-950 dark:text-zinc-400 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:text-white cursor-pointer"
          >
            <ArrowLeftRight className="h-3 w-3" />
            Switch to User Panel
          </button>
        ) : (
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300 cursor-pointer"
                onClick={handleSwitchToUserPanel}
                aria-label="Switch to user panel"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-1 text-xs font-medium">
              Switch to User Panel
            </TooltipContent>
          </Tooltip>
        )}

        {collapsed && <div className="h-px w-8 bg-border/70" />}

        {/* User info */}
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed && "w-full flex-col gap-2",
          )}
        >
          {collapsed ? (
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <div
                  tabIndex={0}
                  role="img"
                  className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-rose-500/40 focus-visible:ring-offset-2"
                  aria-label={`${displayName}, ${displayEmail}`}
                >
                  {adminAvatar}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-1 max-w-56">
                <p className="text-xs font-semibold">{displayName}</p>
                <p className="text-[10px] text-muted-foreground">
                  {displayEmail}
                </p>
              </TooltipContent>
            </Tooltip>
          ) : (
            adminAvatar
          )}
          {!collapsed && (
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-xs font-semibold text-foreground">
                {displayName}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {displayEmail}
              </p>
            </div>
          )}
          {!collapsed ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300 cursor-pointer"
              title="Sign out"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300 cursor-pointer"
                  onClick={handleLogout}
                  aria-label="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="ml-1 text-xs font-medium text-rose-500"
              >
                Sign out
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

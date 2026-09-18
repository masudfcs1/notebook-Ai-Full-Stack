"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { ArrowLeftRight, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setView, toggleSidebar } from "@/lib/redux/appSlice";
import { logout } from "@/lib/redux/authSlice";
import { SidebarHeader, SidebarProfile } from "@/features/navigation/SidebarChrome";
import { cn, getUserDisplayName, getUserInitials, getAvatarUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ADMIN_NAVIGATION_GROUPS } from "@/constants/admin";
import type { ViewKey } from "@/lib/redux/appSlice";

const ADMIN_ROUTE_MAP: Partial<Record<ViewKey, string>> = {
  "admin-dashboard": "/admin",
  "admin-users": "/admin/users",
  "admin-roles": "/admin/roles",
  "admin-activity": "/admin/activity",
  "admin-notifications": "/admin/notifications",
  "admin-settings": "/admin/settings",
};

export function AdminSidebar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const view = useAppSelector((s) => s.app.view);
  const collapsed = useAppSelector((s) => s.app.sidebarCollapsed);

  const displayName = getUserDisplayName(user, "Admin");
  const displayEmail = user?.email || "admin@noteflow.ai";
  const initials = getUserInitials(user?.name, user?.email);

  function handleNavigate(nextView: ViewKey) {
    dispatch(setView(nextView));
    const path = ADMIN_ROUTE_MAP[nextView];
    if (path && router.asPath !== path) void router.push(path);
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      data-variant="admin"
      className="dashboard-sidebar app-sidebar sticky top-0 z-30 hidden h-dvh shrink-0 flex-col border-r lg:flex"
    >
      <SidebarHeader
        collapsed={collapsed}
        admin
        onHome={() => handleNavigate("admin-dashboard")}
        onToggle={() => dispatch(toggleSidebar())}
      />

      <div className="shrink-0 border-b border-sidebar-border/60 px-3 pb-4">
        <div
          className={cn("sidebar-context", collapsed && "is-collapsed")}
          title={collapsed ? "Admin console" : undefined}
        >
          <span className="sidebar-accent-surface flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <ShieldCheck className="h-4 w-4" />
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground">Admin console</p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {user?.role === "SUPER_ADMIN" ? "Super administrator" : "Administrator"}
              </p>
            </div>
          )}
          {collapsed && <span className="sr-only">Admin console</span>}
        </div>
      </div>

      <nav aria-label="Admin navigation" className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-4 scrollbar-thin">
        {ADMIN_NAVIGATION_GROUPS.map((group) => (
          <div key={group.section} className="sidebar-nav-section space-y-1">
            {!collapsed && <p className="sidebar-section-label">{group.section}</p>}
            {group.items.map((item) => {
              const active = view === item.key || (item.key === "admin-users" && view === "admin-user-detail");
              const Icon = item.icon;
              return (
                <Tooltip key={item.key} delayDuration={150}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => handleNavigate(item.key)}
                      aria-label={item.label}
                      aria-current={active ? "page" : undefined}
                      className={cn("app-sidebar-link", collapsed && "is-collapsed")}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                      {!collapsed && <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>}
                    </button>
                  </TooltipTrigger>
                  {collapsed && <TooltipContent side="right" className="text-xs">{item.label}</TooltipContent>}
                </Tooltip>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer shrink-0 p-3">
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size={collapsed ? "icon" : "sm"}
              className="mb-3 h-10 w-full cursor-pointer gap-2 rounded-lg border-primary/20 bg-primary/5 px-2 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary dark:border-primary/20 dark:bg-primary/5 dark:hover:bg-primary/10"
              aria-label="Switch to user panel"
              onClick={() => {
                dispatch(setView("dashboard"));
                void router.push("/dashboard");
              }}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              {!collapsed && <span>User Panel</span>}
            </Button>
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right" className="text-xs">User Panel</TooltipContent>}
        </Tooltip>
        <SidebarProfile
          collapsed={collapsed}
          name={displayName}
          email={displayEmail}
          avatarSrc={getAvatarUrl(user?.avatar)}
          initials={initials}
          onClick={() => handleNavigate("admin-settings")}
        />
        <div className={cn("mt-2 flex items-center justify-end", collapsed && "justify-center")}>
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={collapsed ? "icon" : "sm"}
                className={cn("sidebar-utility h-9 gap-2 rounded-lg px-2 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400", collapsed && "w-9 px-0")}
                aria-label="Sign out"
                onClick={() => {
                  dispatch(logout());
                  dispatch(setView("login"));
                  toast.success("Logged out successfully", { position: "bottom-right" });
                }}
              >
                <LogOut className="h-3.5 w-3.5" />
                {!collapsed && <span>Sign out</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right" className="text-xs">Sign out</TooltipContent>}
          </Tooltip>
        </div>
      </div>
    </motion.aside>
  );
}

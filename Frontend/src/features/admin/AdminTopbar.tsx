import { toast } from "sonner";
import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";

import { setView, toggleSidebar } from "@/lib/redux/appSlice";
import { logout } from "@/lib/redux/authSlice";
import { useNotifications } from "@/hooks/useNotifications";
import {
  cn,
  getUserDisplayName,
  getUserInitials,
  getAvatarUrl,
} from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Shield,
  LogOut,
  Settings,
  LayoutDashboard,
  ChevronDown,
  Search,
  Menu,
} from "lucide-react";
import { VIEW_METADATA } from "@/constants";
import type { ViewKey } from "@/types";

export function AdminTopbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const view = useAppSelector((s) => s.app.view);
  const workspaces = useAppSelector((s) => s.data.workspaces);
  const activeWorkspaceId = useAppSelector((s) => s.data.activeWorkspaceId);
  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const { notifications, unreadCount, markAllAsRead, markAsRead } =
    useNotifications();

  const handleGoToUserDashboard = () => {
    dispatch(setView("dashboard"));
    if (activeWorkspace?.slug) {
      void router.push(`/${activeWorkspace.slug}`);
    } else {
      void router.push("/");
    }
  };

  const avatarSrc = getAvatarUrl(user?.avatar);
  const displayName = getUserDisplayName(user, "Admin");
  const displayEmail = user?.email || "";
  const initials = getUserInitials(user?.name, user?.email);

  const meta =
    VIEW_METADATA[view as ViewKey] || VIEW_METADATA["admin-dashboard"];

  return (
    <header className="dashboard-topbar admin-dashboard-topbar sticky top-0 z-20 flex h-18 items-center gap-4 border-b px-4 md:px-7">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-xl border border-border/60 bg-white/40 text-muted-foreground shadow-sm hover:bg-white/70 hover:text-foreground dark:bg-white/[0.035] lg:hidden cursor-pointer"
        onClick={() => dispatch(toggleSidebar())}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* View title */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 items-center gap-2 rounded-full border border-rose-500/15 bg-rose-500/8 px-3">
          <Shield className="h-3.5 w-3.5 text-rose-400" />
          <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-rose-500 dark:text-rose-300">
            Administration
          </span>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-sm font-semibold tracking-[-0.02em] text-foreground">
            {meta.title}
          </h1>
          <p className="text-[10px] text-muted-foreground">{meta.subtitle}</p>
        </div>
      </div>

      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Search */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl border border-border/60 bg-white/40 text-muted-foreground shadow-sm hover:border-rose-500/20 hover:bg-rose-500/5 hover:text-foreground dark:bg-white/[0.035] cursor-pointer"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-xl border border-border/60 bg-white/40 text-muted-foreground shadow-sm hover:border-rose-500/20 hover:bg-rose-500/5 hover:text-foreground dark:bg-white/[0.035] cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-lg shadow-rose-500/40">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 border-border bg-popover p-2"
          >
            <DropdownMenuLabel className="flex items-center justify-between text-xs text-foreground">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => void markAllAsRead()}
                  className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {notifications.slice(0, 8).map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    onClick={() => void markAsRead(n.id)}
                    className={cn(
                      "flex-col items-start gap-0.5 rounded-lg p-2.5 text-xs cursor-pointer",
                      !n.read && "bg-rose-500/5 font-medium",
                    )}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="font-semibold text-foreground">
                        {n.title}
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        {n.time}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground leading-relaxed">
                      {n.description}
                    </span>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => dispatch(setView("admin-notifications"))}
              className="justify-center text-xs font-semibold text-rose-500 hover:text-rose-600 cursor-pointer"
            >
              Open Notification Manager →
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme */}
        <ThemeToggle />

        {/* Separator */}
        <div className="mx-1 h-6 w-px bg-border" />

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-10 items-center gap-2 rounded-xl border border-border/60 bg-white/45 p-1.5 pr-2.5 shadow-sm transition-all hover:border-rose-500/25 hover:bg-white/70 dark:bg-white/[0.035] dark:hover:bg-white/6 cursor-pointer">
              <Avatar className="h-7 w-7 border border-rose-500/20">
                {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
                <AvatarFallback className="bg-linear-to-br from-rose-500 to-amber-500 text-[10px] font-bold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-xs font-semibold text-foreground md:block">
                {displayName}
              </span>
              <ChevronDown className="hidden h-3 w-3 text-muted-foreground md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 border-border bg-popover p-1"
          >
            <DropdownMenuLabel className="font-normal px-2 py-1.5">
              <div className="flex flex-col space-y-0.5">
                <p className="text-xs font-semibold text-foreground leading-tight">
                  {displayName}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {displayEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => dispatch(setView("admin-dashboard"))}
              className="gap-2 text-xs font-medium cursor-pointer rounded-lg text-foreground"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-rose-400" /> Admin
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => dispatch(setView("admin-settings"))}
              className="gap-2 text-xs font-medium cursor-pointer rounded-lg text-foreground"
            >
              <Settings className="h-3.5 w-3.5 text-rose-400" /> Admin Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleGoToUserDashboard}
              className="gap-2 text-xs font-medium cursor-pointer rounded-lg text-foreground"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-indigo-400" /> User
              Dashboard
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                dispatch(logout());
                dispatch(setView("login"));
                toast.success("Logged out successfully", {
                  position: "bottom-right",
                });
              }}
              className="gap-2 text-xs font-medium text-rose-400 focus:text-rose-400 focus:bg-rose-500/10 cursor-pointer rounded-lg"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

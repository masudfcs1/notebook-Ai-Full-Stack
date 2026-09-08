"use client";

import { useRouter } from "next/router";
import { ArrowLeftRight, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ADMIN_NAVIGATION_GROUPS } from "@/constants/admin";
import { Logo, Wordmark } from "@/features/navigation";
import { setMobileNav, setView } from "@/lib/redux/appSlice";
import { logout } from "@/lib/redux/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  cn,
  getAvatarUrl,
  getUserDisplayName,
  getUserInitials,
} from "@/lib/utils";

const ADMIN_ROUTE_MAP: Record<string, string> = {
  "admin-dashboard": "/admin",
  "admin-users": "/admin/users",
  "admin-roles": "/admin/roles",
  "admin-activity": "/admin/activity",
  "admin-notifications": "/admin/notifications",
  "admin-settings": "/admin/settings",
};

export function AdminMobileSidebar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.app.mobileNavOpen);
  const view = useAppSelector((state) => state.app.view);
  const user = useAppSelector((state) => state.auth.user);
  const workspaces = useAppSelector((state) => state.data.workspaces);
  const activeWorkspaceId = useAppSelector(
    (state) => state.data.activeWorkspaceId,
  );

  const activeWorkspace =
    workspaces.find((workspace) => workspace.id === activeWorkspaceId) ||
    workspaces[0];
  const avatarSrc = getAvatarUrl(user?.avatar);
  const displayName = getUserDisplayName(user, "Admin");
  const displayEmail = user?.email || "admin@noteflow.ai";
  const initials = getUserInitials(user?.name, user?.email);

  function closeSidebar() {
    dispatch(setMobileNav(false));
  }

  function handleNavigate(itemKey: string) {
    dispatch(setView(itemKey as Parameters<typeof setView>[0]));
    closeSidebar();

    const targetPath = ADMIN_ROUTE_MAP[itemKey];
    if (targetPath && router.asPath !== targetPath) {
      void router.push(targetPath);
    }
  }

  function handleSwitchToUserPanel() {
    dispatch(setView("dashboard"));
    closeSidebar();
    void router.push(activeWorkspace?.slug ? `/${activeWorkspace.slug}` : "/");
  }

  function handleLogout() {
    closeSidebar();
    dispatch(logout());
    dispatch(setView("login"));
    toast.success("Logged out successfully", { position: "bottom-right" });
    void router.push("/login");
  }

  return (
    <Sheet open={open} onOpenChange={(value) => dispatch(setMobileNav(value))}>
      <SheetContent
        side="left"
        className="dashboard-sidebar admin-dashboard-sidebar w-[min(19rem,88vw)] border-r border-rose-500/15 !bg-background/95 p-0 shadow-2xl shadow-black/25 backdrop-blur-2xl"
      >
        <SheetHeader className="border-b border-border/60 bg-background/75 p-4 text-left backdrop-blur-xl">
          <SheetTitle className="flex items-center gap-3">
            <Logo size={34} className="shrink-0 bg-indigo-500" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Wordmark className="block text-sm leading-tight" />
                <Badge className="h-5 gap-1 border border-rose-500/20 bg-rose-500/10 px-1.5 text-[9px] font-bold uppercase tracking-wide text-rose-600 hover:bg-rose-500/10 dark:text-rose-300">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  Admin
                </Badge>
              </div>
              <p className="truncate text-[10px] font-normal uppercase tracking-[0.16em] text-muted-foreground">
                Administration panel
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <nav
          className="flex-1 space-y-5 overflow-y-auto px-3 py-4 pb-40"
          aria-label="Admin mobile navigation"
        >
          {ADMIN_NAVIGATION_GROUPS.map((group) => (
            <div key={group.section} className="space-y-1">
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/80">
                {group.section}
              </p>

              {group.items.map((item) => {
                const active = view === item.key;
                const Icon = item.icon;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNavigate(item.key)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-linear-to-r from-rose-500/18 to-amber-500/10 text-foreground shadow-sm ring-1 ring-rose-500/20"
                        : "text-muted-foreground hover:bg-muted/75 hover:text-foreground",
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-linear-to-b from-rose-500 to-amber-500" />
                    )}
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all",
                        active
                          ? `bg-linear-to-br ${item.gradient} text-white shadow-md shadow-rose-500/25`
                          : "bg-muted/75 text-muted-foreground ring-1 ring-border/60 group-hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                    </span>
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="absolute inset-x-0 bottom-0 border-t border-border/70 bg-background/92 p-3.5 shadow-[0_-12px_30px_-24px_rgba(15,23,42,0.55)] backdrop-blur-xl">
          <button
            type="button"
            onClick={handleSwitchToUserPanel}
            className="mb-3 flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/45 text-xs font-medium text-muted-foreground transition hover:border-rose-500/25 hover:bg-rose-500/5 hover:text-foreground"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Switch to user panel
          </button>

          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-rose-500/20 shadow-sm">
              {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
              <AvatarFallback className="bg-linear-to-br from-rose-500 to-amber-500 text-xs font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-xs font-semibold text-foreground">
                {displayName}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {displayEmail}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer rounded-lg text-muted-foreground transition hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

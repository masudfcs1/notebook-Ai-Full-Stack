"use client";

import { useRouter } from "next/router";
import { ArrowLeftRight, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ADMIN_NAVIGATION_GROUPS } from "@/constants/admin";
import { Logo, Wordmark } from "@/features/navigation";
import { SidebarProfile } from "@/features/navigation/SidebarChrome";
import { setMobileNav, setView } from "@/lib/redux/appSlice";
import { logout } from "@/lib/redux/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
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
    void router.push("/dashboard");
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
        data-variant="admin"
        className="dashboard-sidebar app-sidebar w-[min(19rem,88vw)] gap-0 border-r p-0"
      >
        <SheetHeader className="shrink-0 px-5 py-6 text-left">
          <SheetTitle className="flex items-center gap-2.5">
            <Logo size={32} className="shrink-0" />
            <div className="min-w-0 flex-1">
              <Wordmark className="block text-[15px] leading-5" />
              <p className="mt-0.5 truncate text-[10px] font-medium tracking-wide text-muted-foreground">
                Administration
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="shrink-0 border-b border-sidebar-border/60 px-3 pb-4">
          <div className="sidebar-context">
            <span className="sidebar-accent-surface flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-foreground">Admin console</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {user?.role === "SUPER_ADMIN" ? "Super administrator" : "Administrator"}
              </p>
            </div>
          </div>
        </div>

        <nav
          className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-4"
          aria-label="Admin mobile navigation"
        >
          {ADMIN_NAVIGATION_GROUPS.map((group) => (
            <div key={group.section} className="sidebar-nav-section space-y-1">
              <p className="sidebar-section-label">
                {group.section}
              </p>

              {group.items.map((item) => {
                const active = view === item.key || (item.key === "admin-users" && view === "admin-user-detail");
                const Icon = item.icon;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNavigate(item.key)}
                    aria-current={active ? "page" : undefined}
                    className="app-sidebar-link"
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer shrink-0 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwitchToUserPanel}
            aria-label="Switch to user panel"
            className="mb-3 h-10 w-full cursor-pointer gap-2 rounded-lg border-primary/20 bg-primary/5 px-2 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary dark:border-primary/20 dark:bg-primary/5 dark:hover:bg-primary/10"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" /> User Panel
          </Button>
          <SidebarProfile
            name={displayName}
            email={displayEmail}
            avatarSrc={avatarSrc}
            initials={initials}
            onClick={() => handleNavigate("admin-settings")}
          />
          <div className="mt-2 flex items-center justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="sidebar-utility h-9 gap-2 rounded-lg px-2 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

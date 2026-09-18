"use client";

import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setMobileNav, setView } from "@/lib/redux/appSlice";
import { logout } from "@/lib/redux/authSlice";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Logo, Wordmark } from "./Logo";
import { SidebarProfile } from "./SidebarChrome";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { NAVIGATION_GROUPS } from "@/constants";
import { getUserDisplayName, getUserInitials, getAvatarUrl } from "@/lib/utils";

export function MobileSidebar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const open = useAppSelector((s) => s.app.mobileNavOpen);
  const view = useAppSelector((s) => s.app.view);

  const avatarSrc = getAvatarUrl(user?.avatar);
  const displayName = getUserDisplayName(user, "User Account");
  const displayEmail = user?.email || "user@noteflow.ai";
  const initials = getUserInitials(user?.name, user?.email);

  return (
    <Sheet open={open} onOpenChange={(v) => dispatch(setMobileNav(v))}>
      <SheetContent
        side="left"
        className="dashboard-sidebar app-sidebar w-[min(19rem,88vw)] gap-0 border-r p-0"
      >
        <SheetHeader className="shrink-0 border-b border-sidebar-border/60 px-5 py-6 text-left">
          <SheetTitle className="flex items-center gap-2.5">
            <Logo size={32} className="shrink-0 bg-indigo-500" />
            <div className="min-w-0 flex-1">
              <Wordmark className="block text-[15px] leading-5" />
              <p className="mt-0.5 truncate text-[10px] font-medium tracking-wide text-muted-foreground">
                Meeting Intelligence
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <nav aria-label="Main navigation" className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {NAVIGATION_GROUPS.map((group) => (
            <div key={group.section} className="sidebar-nav-section space-y-1">
              <p className="sidebar-section-label">
                {group.section}
              </p>
              {group.items.map((item) => {
                const active = view === item.key;
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      dispatch(setView(item.key));
                      dispatch(setMobileNav(false));
                    }}
                    aria-current={active ? "page" : undefined}
                    className="app-sidebar-link"
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="h-4 rounded-md border-0 bg-rose-500/10 px-1.5 text-[9px] font-medium text-rose-600 dark:text-rose-400"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer shrink-0 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <SidebarProfile
            name={displayName}
            email={displayEmail}
            avatarSrc={avatarSrc}
            initials={initials}
            onClick={() => {
              dispatch(setMobileNav(false));
              dispatch(setView("settings"));
            }}
          />
          <div className="mt-2 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="sidebar-utility h-9 gap-2 rounded-lg px-2 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
              title="Sign out"
              aria-label="Sign out"
              onClick={() => {
                dispatch(setMobileNav(false));
                dispatch(logout());
                dispatch(setView("login"));
                toast.success("Logged out successfully", {
                  position: "bottom-right",
                });
              }}
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

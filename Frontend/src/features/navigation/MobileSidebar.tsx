"use client";

import { toast } from "react-hot-toast";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
      <SheetContent side="left" className="dashboard-sidebar w-72 border-r p-0">
        <SheetHeader className="border-b border-border/60 p-4 text-left">
          <SheetTitle className="flex items-center gap-3">
            <Logo size={32} />
            <div>
              <Wordmark className="text-sm" />
              <p className="text-[10px] font-normal uppercase tracking-widest text-muted-foreground">
                Meeting Intelligence
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <nav className="space-y-6 p-4">
          {NAVIGATION_GROUPS.map((group) => (
            <div key={group.section} className="space-y-1">
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                {group.section}
              </p>
              {group.items.map((item) => {
                const active = view === item.key;
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => dispatch(setView(item.key))}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? "bg-gradient-r from-indigo-500/14 to-violet-500/8 text-foreground ring-1 ring-indigo-500/10"
                        : "text-muted-foreground hover:bg-white/50 hover:text-foreground dark:hover:bg-white/[0.045]"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                        active
                          ? `bg-gradient-lr ${item.gradient} text-white shadow-md shadow-indigo-500/30`
                          : "bg-indigo-500/[0.06] text-muted-foreground ring-1 ring-indigo-500/10 dark:bg-white/[0.03] dark:ring-white/[0.05]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="h-5 bg-rose-500/15 text-[10px] text-rose-500"
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

        <div className="absolute bottom-0 inset-x-0 border-t border-border/60 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-border">
              {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
              <AvatarFallback className="bg-gradient-lr from-indigo-500 to-violet-500 text-xs font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-xs font-semibold">{displayName}</p>
              <p className="truncate text-[10px] text-muted-foreground">
                {displayEmail}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Sign out"
              aria-label="Sign out"
              onClick={() => {
                dispatch(logout());
                dispatch(setView("login"));
                toast.success("Logged out successfully", {
                  position: "bottom-right",
                });
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

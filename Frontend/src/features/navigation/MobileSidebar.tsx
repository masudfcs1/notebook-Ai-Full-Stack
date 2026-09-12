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
      <SheetContent
        side="left"
        className="dashboard-sidebar w-[min(19rem,88vw)] border-r border-border/70 !bg-background/90 p-0 shadow-2xl shadow-black/20 backdrop-blur-2xl"
      >
        <SheetHeader className="border-b border-border/60 bg-background/70 p-4 text-left backdrop-blur-xl">
          <SheetTitle className="flex items-center gap-3">
            <Logo size={32} className="shrink-0 bg-indigo-500" />
            <div className="min-w-0 flex-1">
              <Wordmark className="text-sm block leading-tight" />
              <p className="text-[10px] font-normal uppercase tracking-widest text-muted-foreground truncate">
                Meeting Intelligence
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 pb-28">
          {NAVIGATION_GROUPS.map((group) => (
            <div key={group.section} className="space-y-1">
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
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
                    className={`group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-indigo-500/12 text-zinc-950 dark:text-white font-semibold shadow-xs ring-1 ring-indigo-500/20"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                        active
                          ? `bg-linear-to-br ${item.gradient} text-white shadow-md shadow-indigo-500/30`
                          : "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200/80 group-hover:bg-indigo-500/10 group-hover:text-indigo-600 group-hover:ring-indigo-500/20 dark:bg-white/5 dark:text-zinc-400 dark:ring-white/10 dark:group-hover:text-indigo-300"
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                    </span>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
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

        <div className="absolute inset-x-0 bottom-0 border-t border-border/70 bg-background/90 p-4 shadow-[0_-12px_30px_-24px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-border">
              {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
              <AvatarFallback className="bg-linear-to-br from-indigo-500 to-violet-500 text-xs font-semibold text-white">
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
                dispatch(setMobileNav(false));
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

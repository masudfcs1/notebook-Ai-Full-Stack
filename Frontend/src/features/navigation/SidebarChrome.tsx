"use client";

import { ChevronRight, PanelLeft, PanelLeftClose } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Logo, Wordmark } from "./Logo";

export function SidebarHeader({
  collapsed,
  admin = false,
  onHome,
  onToggle,
}: {
  collapsed: boolean;
  admin?: boolean;
  onHome: () => void;
  onToggle: () => void;
}) {
  return (
    <div className={cn("flex h-20 shrink-0 items-center px-5", collapsed && "justify-center px-0")}>
      <button
        type="button"
        onClick={onHome}
        aria-label={admin ? "Go to admin dashboard" : "Go to landing"}
        className="flex min-w-0 cursor-pointer items-center gap-2.5 rounded-lg text-left"
      >
        <Logo size={32} className="shrink-0" />
        {!collapsed && (
          <div className="min-w-0">
            <Wordmark className="block text-[15px] leading-5 text-foreground" />
            <p className="mt-0.5 truncate text-[10px] font-medium tracking-wide text-muted-foreground">
              {admin ? "Administration" : "Meeting Intelligence"}
            </p>
          </div>
        )}
      </button>
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="sidebar-collapse-control absolute -right-3.5 top-6 z-40 h-7 w-7 rounded-lg"
          >
            {collapsed ? <PanelLeft className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          {collapsed ? "Expand sidebar" : "Collapse sidebar"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export function SidebarProfile({
  collapsed = false,
  name,
  email,
  avatarSrc,
  initials,
  onClick,
}: {
  collapsed?: boolean;
  name: string;
  email: string;
  avatarSrc?: string;
  initials: string;
  onClick: () => void;
}) {
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          aria-label={`Account settings for ${name}`}
          className={cn("sidebar-profile", collapsed && "is-collapsed")}
        >
          <Avatar className="h-8 w-8 shrink-0 ring-1 ring-inset ring-border/60">
            {avatarSrc && <AvatarImage src={avatarSrc} alt={name} />}
            <AvatarFallback className="sidebar-accent-surface text-[11px] font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate text-xs font-semibold text-foreground">{name}</span>
                <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{email}</span>
              </span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            </>
          )}
        </button>
      </TooltipTrigger>
      {collapsed && (
        <TooltipContent side="right" className="max-w-56">
          <p className="text-xs font-semibold">{name}</p>
          <p className="truncate text-[10px] opacity-75">{email}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}

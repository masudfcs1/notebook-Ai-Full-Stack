"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setView } from "@/lib/redux/appSlice";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NAVIGATION_GROUPS } from "@/constants";

export function SidebarNav() {
  const dispatch = useAppDispatch();
  const view = useAppSelector((s) => s.app.view);
  const collapsed = useAppSelector((s) => s.app.sidebarCollapsed);
  const user = useAppSelector((s) => s.auth.user);

  // Filter navigation items based on user role
  const filteredGroups = useMemo(() => {
    const userRole = user?.role || "USER";

    return NAVIGATION_GROUPS.map((group) => {
      // Check if the entire group is restricted
      if ((group as any).roles && !(group as any).roles.includes(userRole)) {
        return { ...group, items: [] };
      }

      return {
        ...group,
        items: group.items.filter((item) => {
          // Check if individual item is restricted
          if ((item as any).roles) {
            return (item as any).roles.includes(userRole);
          }
          return true; // Unrestricted item
        }),
      };
    }).filter((group) => group.items.length > 0);
  }, [user?.role]);

  return (
    <nav className="flex-1 space-y-6 overflow-y-auto scrollbar-thin px-3 py-4">
      {filteredGroups.map((group) => (
        <div key={group.section} className="space-y-1">
          {!collapsed && (
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
              {group.section}
            </p>
          )}
          {group.items.map((item) => {
            const active = view === item.key;
            return (
              <Tooltip key={item.key} delayDuration={collapsed ? 100 : 400}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => dispatch(setView(item.key as any))}
                    className={cn(
                      "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent/80 text-sidebar-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-foreground",
                      collapsed && "justify-center",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-md bg-indigo-500"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                    {collapsed ? (
                      <span className="font-semibold uppercase text-xs">
                        {item.label.charAt(0)}
                      </span>
                    ) : (
                      <span className="flex-1 text-left tracking-wide">
                        {item.label}
                      </span>
                    )}
                    {!collapsed && item.badge && (
                      <Badge
                        variant="secondary"
                        className="h-5 bg-indigo-500/10 px-1.5 text-[10px] font-semibold text-indigo-500"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

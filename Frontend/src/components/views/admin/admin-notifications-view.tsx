"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Sparkles,
  Shield,
  Building2,
  Users,
  ChevronRight,
  ArrowDown,
  Info,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiService } from "@/services/apiService";
import { getSocket } from "@/services/socketService";
import { cn } from "@/lib/utils";

interface NotificationRecord {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data?: any;
  userId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export function AdminNotificationsView() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL"); // ALL | READ | UNREAD

  // Fetch initial notifications with cursor pagination
  const fetchNotifications = useCallback(
    async (cursorToken?: string, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const params: any = {
          limit: 15,
          cursor: cursorToken,
          search: searchQuery.trim() || undefined,
          type: selectedType !== "ALL" ? selectedType : undefined,
          read:
            selectedStatus === "READ"
              ? true
              : selectedStatus === "UNREAD"
                ? false
                : undefined,
        };

        const res = await apiService.getNotifications(params);
        if (res.success && res.data) {
          const items: NotificationRecord[] = res.data.data || res.data;
          const meta = res.data.meta || {};

          if (append) {
            setNotifications((prev) => {
              const existingIds = new Set(prev.map((n) => n.id));
              const newUnique = items.filter((n) => !existingIds.has(n.id));
              return [...prev, ...newUnique];
            });
          } else {
            setNotifications(items);
          }

          setNextCursor(meta.nextCursor || null);
          setHasMore(Boolean(meta.hasMore));
          if (meta.total !== undefined) {
            setTotalCount(meta.total);
          }
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchQuery, selectedType, selectedStatus]
  );

  // Trigger fetch on filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchNotifications();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchNotifications]);

  // Real-time live websocket sync
  useEffect(() => {
    const socket = getSocket();

    const handleRealtimeNotification = (notif: NotificationRecord) => {
      setNotifications((prev) => {
        // Prevent duplicate
        if (prev.some((n) => n.id === notif.id)) return prev;
        return [notif, ...prev];
      });
      setTotalCount((prev) => prev + 1);
    };

    socket.on("notification", handleRealtimeNotification);
    socket.on("new_notification", handleRealtimeNotification);

    return () => {
      socket.off("notification", handleRealtimeNotification);
      socket.off("new_notification", handleRealtimeNotification);
    };
  }, []);

  // Mark single as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await apiService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      toast.success("Marked as read");
    } catch {
      toast.error("Failed to update notification");
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  // Delete notification
  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  return (
    <div className="mx-auto max-w-[1320px] space-y-6">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-dashboard-hero relative flex flex-col gap-5 overflow-hidden rounded-[1.75rem] p-6 text-white sm:flex-row sm:items-center sm:justify-between md:p-8"
      >
        <div className="dashboard-subtle-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-rose-400/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-6 items-center gap-1.5 rounded-full bg-white/10 px-2.5 text-[10px] font-bold uppercase tracking-wider text-rose-200">
              <Sparkles className="h-3 w-3 text-amber-300" />
              Live Telemetry
            </span>
            {unreadCount > 0 && (
              <Badge className="h-5 rounded-full bg-rose-500 px-2 text-[10px] font-bold text-white shadow-md">
                {unreadCount} Unread
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.035em] text-white md:text-3xl">
            Notification Manager
          </h1>
          <p className="mt-2 text-sm text-rose-100/80">
            Real-time feed of user registrations, role updates, workspace & team events.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => void fetchNotifications()}
            disabled={loading}
            className="h-10 gap-2 rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white cursor-pointer"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              className="h-10 gap-2 rounded-xl bg-white px-4 font-semibold text-slate-900 shadow-xl hover:bg-rose-50 cursor-pointer"
            >
              <CheckCheck className="h-4 w-4 text-rose-600" />
              Mark All Read
            </Button>
          )}
        </div>
      </motion.div>

      {/* Control Bar: Search & Filters */}
      <Card className="dashboard-glass-card rounded-2xl p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications by title or description..."
              className="h-10 pl-9 rounded-xl border-border bg-white/40 dark:bg-white/[0.02]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Event Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 gap-2 rounded-xl border-border bg-white/40 dark:bg-white/[0.02] text-xs font-medium cursor-pointer"
                >
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  Type: {selectedType === "ALL" ? "All Events" : selectedType}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setSelectedType("ALL")}>
                  All Events
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType("USER_CREATED")}>
                  User Created
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType("WORKSPACE_CREATED")}>
                  Workspace Created
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType("TEAM_CREATED")}>
                  Team Created
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType("ROLE_UPDATED")}>
                  Role Updated
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType("SYSTEM")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Read Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 gap-2 rounded-xl border-border bg-white/40 dark:bg-white/[0.02] text-xs font-medium cursor-pointer"
                >
                  Status: {selectedStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => setSelectedStatus("ALL")}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("UNREAD")}>
                  Unread Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("READ")}>
                  Read Only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      {/* Notifications Table / List */}
      <Card className="dashboard-glass-card rounded-[1.5rem] p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-rose-500" />
            <h2 className="text-sm font-bold text-foreground">
              Event Stream
            </h2>
            <Badge variant="secondary" className="text-[10px] font-bold">
              {totalCount} Total
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live WebSocket Connected
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl bg-muted" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-3">
              <Bell className="h-7 w-7" />
            </div>
            <p className="text-sm font-semibold text-foreground">No notifications found</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Events like user registrations, workspace provisioning, and role updates will appear here live.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence initial={false}>
              {notifications.map((n) => {
                const config = getTypeConfig(n.type);
                const IconComponent = config.icon;

                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      "group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 rounded-2xl border p-4 transition-all duration-200",
                      n.read
                        ? "border-border/60 bg-white/30 dark:bg-white/[0.015] hover:border-border hover:bg-white/50 dark:hover:bg-white/[0.03]"
                        : "border-rose-500/30 bg-rose-500/5 shadow-sm shadow-rose-500/5 hover:border-rose-500/40"
                    )}
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Icon */}
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md",
                          config.gradient
                        )}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-bold text-foreground">
                            {n.title}
                          </span>
                          <Badge
                            className={cn(
                              "h-4.5 rounded-md px-1.5 text-[9px] font-bold uppercase",
                              config.badge
                            )}
                          >
                            {config.label}
                          </Badge>
                          {!n.read && (
                            <Badge className="h-4.5 rounded-md bg-rose-500 px-1.5 text-[9px] font-bold text-white">
                              New
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed break-words">
                          {n.message}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground/80 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDateTime(n.createdAt)}
                          </span>
                          {n.data && n.data.email && (
                            <span>• {n.data.email}</span>
                          )}
                          {n.data && n.data.slug && (
                            <span>• slug: {n.data.slug}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {!n.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleMarkAsRead(n.id)}
                          className="h-8 gap-1 rounded-lg px-2 text-xs text-indigo-500 hover:bg-indigo-500/10 cursor-pointer"
                          title="Mark as read"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span className="hidden md:inline">Mark Read</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => void handleDelete(n.id)}
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Token / Cursor Next Page Loader */}
            {hasMore && (
              <div className="pt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => void fetchNotifications(nextCursor || undefined, true)}
                  disabled={loadingMore}
                  className="h-10 gap-2 rounded-xl border-rose-500/20 px-6 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                >
                  {loadingMore ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Loading Next Page...
                    </>
                  ) : (
                    <>
                      <ArrowDown className="h-3.5 w-3.5" />
                      Load More (Cursor Token Pagination)
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function getTypeConfig(type: string) {
  switch (type) {
    case "USER_CREATED":
      return {
        label: "User Created",
        icon: Users,
        gradient: "bg-linear-to-br from-violet-500 to-indigo-600",
        badge: "bg-violet-500/15 text-violet-500 border-violet-500/30",
      };
    case "WORKSPACE_CREATED":
      return {
        label: "Workspace Created",
        icon: Building2,
        gradient: "bg-linear-to-br from-sky-500 to-blue-600",
        badge: "bg-sky-500/15 text-sky-500 border-sky-500/30",
      };
    case "TEAM_CREATED":
      return {
        label: "Team Created",
        icon: Users,
        gradient: "bg-linear-to-br from-emerald-500 to-teal-600",
        badge: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
      };
    case "ROLE_UPDATED":
      return {
        label: "Role Updated",
        icon: Shield,
        gradient: "bg-linear-to-br from-amber-500 to-orange-600",
        badge: "bg-amber-500/15 text-amber-500 border-amber-500/30",
      };
    default:
      return {
        label: "System",
        icon: Info,
        gradient: "bg-linear-to-br from-rose-500 to-pink-600",
        badge: "bg-rose-500/15 text-rose-500 border-rose-500/30",
      };
  }
}

function formatDateTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
  } catch {
    return dateString;
  }
}

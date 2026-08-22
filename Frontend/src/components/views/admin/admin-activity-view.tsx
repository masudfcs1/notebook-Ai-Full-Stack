"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  RotateCcw,
  Clock,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Activity,
  User,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import {
  useGetGlobalLoginHistoryQuery,
  type LoginHistoryItem,
} from "@/lib/redux/api/adminApiSlice";
import { useAppDispatch } from "@/lib/redux/hooks";
import {
  setView,
  setSelectedAdminUserId,
  setAdminUserDetailTab,
} from "@/lib/redux/appSlice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getRoleConfig } from "@/constants/admin";
import { getAvatarUrl } from "@/lib/utils";

export function AdminActivityView() {
  const dispatch = useAppDispatch();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failed">("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [inspectItem, setInspectItem] = useState<LoginHistoryItem | null>(null);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useGetGlobalLoginHistoryQuery({
    page,
    limit,
    search: search.trim() || undefined,
    successful:
      statusFilter === "all"
        ? undefined
        : statusFilter === "success"
          ? true
          : false,
    sortOrder,
  });

  const loginEvents = response?.data || [];
  const stats = response?.stats;
  const meta = response?.meta;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIp(text);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const handleNavigateToUser = (userId: number) => {
    dispatch(setSelectedAdminUserId(userId));
    dispatch(setAdminUserDetailTab("login-history"));
    dispatch(setView("admin-user-detail"));
  };

  const getDeviceIcon = (device?: string | null) => {
    switch (device?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-4 w-4 text-emerald-400" />;
      case "tablet":
        return <Tablet className="h-4 w-4 text-amber-400" />;
      case "desktop":
      default:
        return <Monitor className="h-4 w-4 text-sky-400" />;
    }
  };

  const getBrowserBadgeClass = (browser?: string | null) => {
    switch (browser?.toLowerCase()) {
      case "chrome":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "safari":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "firefox":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "edge":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Security & Login Activity Audit
            </h1>
            <Badge className="gap-1.5 rounded-full bg-emerald-500/15 text-[10px] font-semibold text-emerald-400 border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Monitoring
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time audit log of all system authentications, client environments, IP footprints, and security attempts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 gap-1.5 rounded-xl border-border bg-card text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Global KPI Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Card className="border-border/60 bg-gradient-to-br from-card/90 via-card/70 to-emerald-500/5 p-4 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">
                Authentication Health
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stats?.successRate ?? 100}%
              </p>
              <p className="text-[10px] text-muted-foreground">
                {stats?.successfulLogins ?? 0} authorized / {stats?.totalLogins ?? 0} total
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-card/90 via-card/70 to-rose-500/5 p-4 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">
                Failed Attempts
              </p>
              <p className={`text-2xl font-bold ${
                (stats?.failedLogins ?? 0) > 0 ? "text-rose-400" : "text-foreground"
              }`}>
                {stats?.failedLogins ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {(stats?.failedLogins ?? 0) > 0 ? "Flagged authentication anomalies" : "0 security incidents reported"}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-card/90 via-card/70 to-sky-500/5 p-4 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">
                Client Platforms & IPs
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stats?.uniqueDevices ?? 0} Dev / {stats?.uniqueIps ?? 0} IPs
              </p>
              <p className="text-[10px] text-muted-foreground">
                Distinct user hardware & network origins
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Monitor className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-card/90 via-card/70 to-violet-500/5 p-4 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">
                Most Recent Event
              </p>
              <p className="text-sm font-bold text-foreground truncate max-w-[140px]">
                {stats?.lastLogin
                  ? new Date(stats.lastLogin).toLocaleDateString()
                  : "No events"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {stats?.lastLogin
                  ? new Date(stats.lastLogin).toLocaleTimeString()
                  : "System idle"}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Activity className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Filter and Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/60 bg-card/70 p-4 backdrop-blur-sm shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search user, email, IP, browser, device..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="border-border/60 bg-muted/40 pl-8 text-xs text-foreground placeholder:text-muted-foreground h-9 rounded-xl"
                />
              </div>

              {/* Status filter tabs */}
              <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-muted/30 p-1">
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setPage(1);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === "all"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All ({stats?.totalLogins ?? 0})
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("success");
                    setPage(1);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === "success"
                      ? "bg-emerald-500/20 text-emerald-400 shadow-sm"
                      : "text-muted-foreground hover:text-emerald-400"
                  }`}
                >
                  Successful ({stats?.successfulLogins ?? 0})
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("failed");
                    setPage(1);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === "failed"
                      ? "bg-rose-500/20 text-rose-400 shadow-sm"
                      : "text-muted-foreground hover:text-rose-400"
                  }`}
                >
                  Failed ({stats?.failedLogins ?? 0})
                </button>
              </div>
            </div>

            {/* Right: Sort order & page size */}
            <div className="flex items-center gap-2 self-end lg:self-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSortOrder((s) => (s === "desc" ? "asc" : "desc"));
                  setPage(1);
                }}
                className="h-8 gap-1.5 rounded-lg border-border text-xs text-foreground hover:bg-muted cursor-pointer"
              >
                <Clock className="h-3 w-3 text-muted-foreground" />
                {sortOrder === "desc" ? "Newest First" : "Oldest First"}
              </Button>

              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="h-8 rounded-lg border border-border bg-card px-2.5 text-xs text-foreground font-semibold cursor-pointer outline-none"
              >
                <option value={10}>10 / page</option>
                <option value={15}>15 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Events List / Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {isLoading ? (
          <Card className="border-border/60 bg-card/70 p-6 space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-16 w-full bg-muted/60 rounded-xl" />
            ))}
          </Card>
        ) : loginEvents.length === 0 ? (
          <Card className="border-border/60 bg-card/50 p-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground mb-4">
              <ShieldCheck className="h-8 w-8 text-sky-400" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              No Login Activity Records Found
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
              {search || statusFilter !== "all"
                ? "No authentication events match your active search query or filter."
                : "No login records have been logged in the system yet."}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {loginEvents.map((item) => {
              const userObj = item.user;
              const roleConfig = getRoleConfig(userObj?.role || "USER");
              const avatarSrc = getAvatarUrl(userObj?.avatar);
              const userInitials = (userObj?.name || userObj?.email || "U")
                .split(" ")
                .map((w: string) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              const dateObj = new Date(item.createdAt);
              const isRecent = Date.now() - dateObj.getTime() < 1000 * 60 * 60 * 24;

              return (
                <Card
                  key={item.id}
                  className={`overflow-hidden border transition-all hover:border-border/80 p-4 ${
                    item.successful
                      ? "border-border/60 bg-card/70"
                      : "border-rose-500/30 bg-rose-500/5 shadow-sm"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: User Profile & Status */}
                    <div className="flex items-start sm:items-center gap-3.5">
                      {/* Status Icon Indicator */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                          item.successful
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {item.successful ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <AlertTriangle className="h-5 w-5" />
                        )}
                      </div>

                      {/* User Info & Avatar */}
                      <div className="flex items-center gap-3">
                        {userObj ? (
                          <Avatar className="h-9 w-9 border border-border shadow-inner">
                            {avatarSrc && (
                              <AvatarImage src={avatarSrc} alt={userObj.name || ""} />
                            )}
                            <AvatarFallback className="bg-muted text-[10px] font-bold text-foreground">
                              {userInitials}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground border border-border">
                            <User className="h-4 w-4" />
                          </div>
                        )}

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {userObj ? (
                              <button
                                onClick={() => handleNavigateToUser(userObj.id)}
                                className="text-xs font-bold text-foreground hover:text-rose-400 transition-colors flex items-center gap-1 text-left cursor-pointer"
                              >
                                {userObj.name || userObj.username || "Unnamed User"}
                                <ArrowRight className="h-3 w-3 opacity-40" />
                              </button>
                            ) : (
                              <span className="text-xs font-bold text-foreground">
                                Unknown User #{item.userId}
                              </span>
                            )}

                            {userObj && (
                              <Badge
                                variant="outline"
                                className={`text-[8px] font-bold uppercase rounded h-4 ${roleConfig.badge}`}
                              >
                                {roleConfig.label}
                              </Badge>
                            )}

                            <Badge
                              variant="outline"
                              className={`text-[9px] font-bold rounded h-4.5 ${
                                item.successful
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              }`}
                            >
                              {item.successful ? "Authorized" : item.message || "Failed"}
                            </Badge>

                            {isRecent && (
                              <span
                                className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"
                                title="Recent activity in the last 24h"
                              />
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            {userObj?.email && (
                              <span className="text-muted-foreground/80 font-mono text-[11px]">
                                {userObj.email}
                              </span>
                            )}

                            {/* Device Type */}
                            <span className="flex items-center gap-1">
                              {getDeviceIcon(item.device)}
                              <span className="capitalize font-medium text-[11px]">
                                {item.device || "Desktop"}
                              </span>
                            </span>

                            {/* Browser */}
                            {item.browser && (
                              <Badge
                                variant="outline"
                                className={`text-[9px] font-semibold border ${getBrowserBadgeClass(
                                  item.browser
                                )}`}
                              >
                                {item.browser}
                              </Badge>
                            )}

                            {/* OS */}
                            {item.os && (
                              <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                                {item.os}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: IP Address & Timestamps & Action */}
                    <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4 border-t border-border/40 pt-3 lg:border-t-0 lg:pt-0">
                      {/* IP Address */}
                      <div className="text-left lg:text-right">
                        <div className="flex items-center lg:justify-end gap-1.5">
                          <span className="font-mono text-xs font-semibold text-foreground">
                            {item.ipAddress || "Unknown IP"}
                          </span>
                          {item.ipAddress && (
                            <button
                              onClick={() => handleCopy(item.ipAddress!, "IP address")}
                              className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 transition-colors"
                              title="Copy IP Address"
                            >
                              {copiedIp === item.ipAddress ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground flex items-center lg:justify-end gap-1">
                          <Globe className="h-2.5 w-2.5" />
                          {item.ipAddress === "::1" || item.ipAddress?.includes("127.0.0.1")
                            ? "Localhost / Loopback"
                            : "Public Network"}
                        </p>
                      </div>

                      {/* Timestamp */}
                      <div className="text-left lg:text-right">
                        <p className="text-xs font-semibold text-foreground flex items-center lg:justify-end gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {dateObj.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {dateObj.toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        {userObj && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleNavigateToUser(userObj.id)}
                            className="h-8 gap-1 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                            title="View User Profile & History"
                          >
                            <User className="h-3.5 w-3.5" />
                            Profile
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setInspectItem(item)}
                          className="h-8 gap-1 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                        >
                          <Terminal className="h-3.5 w-3.5" />
                          Inspect
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            {/* Pagination footer */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{loginEvents.length}</span> of{" "}
                  <span className="font-semibold text-foreground">{meta.total}</span> audit records
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!meta.hasPrev}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="h-8 gap-1 rounded-lg border-border text-xs cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Previous
                  </Button>
                  <span className="text-xs font-semibold text-muted-foreground px-2">
                    Page {meta.page} of {meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!meta.hasNext}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-8 gap-1 rounded-lg border-border text-xs cursor-pointer"
                  >
                    Next <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Raw Diagnostic Inspect Modal */}
      <Dialog open={!!inspectItem} onOpenChange={(open) => !open && setInspectItem(null)}>
        <DialogContent className="sm:max-w-xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Terminal className="h-5 w-5 text-rose-500" />
              Technical Audit Event #{inspectItem?.id}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Diagnostic authentication telemetry and client device signatures
            </DialogDescription>
          </DialogHeader>

          {inspectItem && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">User</p>
                  <p className="font-semibold text-foreground truncate">
                    {inspectItem.user?.name || inspectItem.user?.email || `User #${inspectItem.userId}`}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Status</p>
                  <p className={`font-semibold ${inspectItem.successful ? "text-emerald-400" : "text-rose-400"}`}>
                    {inspectItem.successful ? "Authorized (200 OK)" : `Rejected: ${inspectItem.message || "Invalid credentials"}`}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">IP Address</p>
                  <p className="font-mono font-semibold text-foreground">
                    {inspectItem.ipAddress || "N/A"}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Platform</p>
                  <p className="font-semibold text-foreground">
                    {inspectItem.device || "Desktop"} • {inspectItem.os || "Unknown OS"} • {inspectItem.browser || "Unknown"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center justify-between">
                  <span>Raw Client User-Agent</span>
                  <button
                    onClick={() => inspectItem.userAgent && handleCopy(inspectItem.userAgent, "User-Agent")}
                    className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                  >
                    Copy User-Agent
                  </button>
                </p>
                <div className="rounded-lg bg-black/40 p-2.5 font-mono text-[11px] text-muted-foreground break-all border border-border/40">
                  {inspectItem.userAgent || "No user-agent string recorded"}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


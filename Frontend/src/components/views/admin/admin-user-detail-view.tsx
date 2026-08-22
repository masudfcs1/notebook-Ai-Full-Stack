"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Users,
  Shield,
  UserCog,
  Calendar,
  Clock,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  FolderTree,
  Crown,
  Layers,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Tablet,
  Monitor,
  Globe,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  Terminal,
  Activity,
} from "lucide-react";
import {
  useGetUserByIdQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useGetUserLoginHistoryQuery,
  type LoginHistoryItem,
} from "@/lib/redux/api/adminApiSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setView, setSelectedAdminUserId, setAdminUserDetailTab } from "@/lib/redux/appSlice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getRoleConfig, getStatusConfig } from "@/constants/admin";
import { getAvatarUrl } from "@/lib/utils";

const ROLE_OPTIONS = ["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE", "USER"];
const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"];

interface AdminUserDetailViewProps {
  userId?: number;
}

export function AdminUserDetailView({
  userId: propUserId,
}: AdminUserDetailViewProps) {
  const dispatch = useAppDispatch();
  const stateUserId = useAppSelector((s) => s.app.selectedAdminUserId);
  const reduxTab = useAppSelector((s) => s.app.adminUserDetailTab) || "hierarchy";
  const targetUserId = propUserId || stateUserId;

  const [activeTab, setActiveTab] = useState<"hierarchy" | "login-history">(reduxTab);
  const [searchFilter, setSearchFilter] = useState("");
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<
    Record<string, boolean>
  >({});

  // Login history state
  const [loginPage, setLoginPage] = useState(1);
  const [loginSearch, setLoginSearch] = useState("");
  const [loginFilterStatus, setLoginFilterStatus] = useState<"all" | "success" | "failed">("all");
  const [loginSortOrder, setLoginSortOrder] = useState<"desc" | "asc">("desc");
  const [inspectItem, setInspectItem] = useState<LoginHistoryItem | null>(null);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  // Sync Redux tab change
  useEffect(() => {
    if (reduxTab) {
      setActiveTab(reduxTab);
    }
  }, [reduxTab]);

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useGetUserByIdQuery(targetUserId!, { skip: !targetUserId });

  const {
    data: loginHistoryResponse,
    isLoading: isLoginHistoryLoading,
    isFetching: isLoginHistoryFetching,
    refetch: refetchLoginHistory,
  } = useGetUserLoginHistoryQuery(
    {
      userId: targetUserId!,
      page: loginPage,
      limit: 10,
      search: loginSearch.trim() || undefined,
      successful:
        loginFilterStatus === "all"
          ? undefined
          : loginFilterStatus === "success"
            ? true
            : false,
      sortOrder: loginSortOrder,
    },
    { skip: !targetUserId || activeTab !== "login-history" }
  );

  const [updateRole] = useUpdateUserRoleMutation();
  const [updateStatus] = useUpdateUserStatusMutation();

  const user = response?.data;
  const workspaces = user?.workspaces || [];
  const loginItems = loginHistoryResponse?.data || [];
  const loginStats = loginHistoryResponse?.stats;
  const loginMeta = loginHistoryResponse?.meta;

  const toggleWorkspaceExpand = (wsId: string) => {
    setExpandedWorkspaces((prev) => ({
      ...prev,
      [wsId]: prev[wsId] === undefined ? false : !prev[wsId],
    }));
  };

  const handleBack = () => {
    dispatch(setSelectedAdminUserId(null));
    dispatch(setView("admin-users"));
  };

  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    toast.success(`IP address ${ip} copied to clipboard`);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  if (!targetUserId) {
    return (
      <div className="mx-auto max-w-5xl py-12 text-center">
        <p className="text-muted-foreground">No user selected.</p>
        <Button onClick={handleBack} className="mt-4 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Users
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-28 bg-muted" />
          <Skeleton className="h-8 w-48 bg-muted" />
        </div>
        <Card className="p-6 border-border/60 bg-card/70">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Skeleton className="h-20 w-20 rounded-full bg-muted" />
            <div className="space-y-3 flex-1">
              <Skeleton className="h-6 w-48 bg-muted" />
              <Skeleton className="h-4 w-64 bg-muted" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 bg-muted" />
                <Skeleton className="h-6 w-20 bg-muted" />
              </div>
            </div>
          </div>
        </Card>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24 bg-muted" />
          <Skeleton className="h-24 bg-muted" />
          <Skeleton className="h-24 bg-muted" />
        </div>
        <Skeleton className="h-64 bg-muted" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="mx-auto max-w-5xl py-12 text-center space-y-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
          <XCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          Failed to load user details
        </h2>
        <p className="text-sm text-muted-foreground">
          The user might not exist or an error occurred.
        </p>
        <div className="flex justify-center gap-3">
          <Button
            onClick={handleBack}
            variant="outline"
            className="gap-2 border-border"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Users
          </Button>
          <Button
            onClick={() => refetch()}
            className="bg-rose-500 text-white hover:bg-rose-600"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const roleConfig = getRoleConfig(user.role);
  const statusConfig = getStatusConfig(user.status);
  const avatarSrc = getAvatarUrl(user.avatar);
  const userInitials = (user.name || user.email)
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Compute total teams across all workspaces
  const totalTeams = workspaces.reduce(
    (acc, ws) => acc + (ws.teams?.length || 0),
    0,
  );
  const totalMemberships = workspaces.reduce((acc, ws) => {
    return (
      acc +
      (ws.teams?.reduce((tAcc, t) => tAcc + (t.members?.length || 0), 0) || 0)
    );
  }, 0);

  // Filter workspaces based on search query
  const filteredWorkspaces = workspaces.filter((ws) => {
    if (!searchFilter.trim()) return true;
    const query = searchFilter.toLowerCase();
    const matchesWs =
      ws.name.toLowerCase().includes(query) ||
      ws.slug.toLowerCase().includes(query);
    const matchesTeams = ws.teams?.some(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.key.toLowerCase().includes(query),
    );
    return matchesWs || matchesTeams;
  });

  // Helper for Device Icon
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

  // Helper for Browser styling
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
      {/* Top Header Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="sm"
            className="gap-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Users
          </Button>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-sm font-semibold text-foreground">
            User Overview
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Role Change */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl border-border bg-card text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
              >
                <Shield className="h-3.5 w-3.5 text-violet-400" />
                Role: {roleConfig.label}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-popover border-border p-1"
            >
              <DropdownMenuLabel className="text-[10px] text-muted-foreground px-2">
                Change Role
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              {ROLE_OPTIONS.map((r) => {
                const rc = getRoleConfig(r);
                return (
                  <DropdownMenuItem
                    key={r}
                    disabled={user.role === r}
                    className="gap-2 text-xs text-foreground/80 cursor-pointer rounded-lg"
                    onClick={() => updateRole({ userId: user.id, role: r })}
                  >
                    <span className={`h-2 w-2 rounded-full ${rc.dot}`} />
                    {rc.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Status Change */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl border-border bg-card text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
              >
                <UserCog className="h-3.5 w-3.5 text-amber-400" />
                Status: {statusConfig.label}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-popover border-border p-1"
            >
              <DropdownMenuLabel className="text-[10px] text-muted-foreground px-2">
                Change Status
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              {STATUS_OPTIONS.map((s) => {
                const sc = getStatusConfig(s);
                return (
                  <DropdownMenuItem
                    key={s}
                    disabled={user.status === s}
                    className="gap-2 text-xs text-foreground/80 cursor-pointer rounded-lg"
                    onClick={() => updateStatus({ userId: user.id, status: s })}
                  >
                    <span className={`h-2 w-2 rounded-full ${sc.dot}`} />
                    {sc.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* User Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="relative overflow-hidden border-border/60 bg-gradient-r from-card via-card/80 to-muted/30 p-6 backdrop-blur-xl shadow-lg">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
                <Avatar className="h-20 w-20 border-2 border-border shadow-md">
                  {avatarSrc && (
                    <AvatarImage src={avatarSrc} alt={user.name || ""} />
                  )}
                  <AvatarFallback
                    className={`bg-gradient-lr ${roleConfig.color} text-lg font-bold text-white`}
                  >
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-card ${statusConfig.dot}`}
                  title={`Status: ${statusConfig.label}`}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">
                    {user.name || user.username || "Unnamed User"}
                  </h1>
                  <Badge
                    className={`h-5 rounded-md border text-[10px] font-bold ${roleConfig.badge}`}
                  >
                    {roleConfig.label}
                  </Badge>
                  <Badge
                    className={`h-5 rounded-md border text-[10px] font-bold ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-rose-400" />
                    {user.email}
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-amber-400" />
                      {user.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-blue-400" />
                    Provider:{" "}
                    <span className="font-semibold uppercase tracking-wide">
                      {user.provider}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    {user.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                        <XCircle className="h-3.5 w-3.5" /> Unverified
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metadata Info */}
            <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-4 sm:flex sm:border-t-0 sm:pt-0 text-right">
              <div className="space-y-1 sm:px-4 sm:border-r sm:border-border/60">
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Joined
                </p>
                <p className="text-xs font-semibold text-foreground flex items-center justify-end gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-1 sm:px-4">
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Last Login
                </p>
                <p className="text-xs font-semibold text-foreground flex items-center justify-end gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString()
                    : "Never"}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Main Tabs Header */}
      <div className="flex items-center border-b border-border/60 gap-3 pb-2">
        <button
          onClick={() => {
            setActiveTab("hierarchy");
            dispatch(setAdminUserDetailTab("hierarchy"));
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "hierarchy"
              ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Workspaces & Teams</span>
          <Badge
            variant="secondary"
            className="h-4 px-1.5 text-[9px] font-bold rounded-md bg-muted text-foreground"
          >
            {workspaces.length}
          </Badge>
        </button>

        <button
          onClick={() => {
            setActiveTab("login-history");
            dispatch(setAdminUserDetailTab("login-history"));
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "login-history"
              ? "bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Login History & Security Audit</span>
          {loginStats && (
            <Badge
              variant="secondary"
              className="h-4 px-1.5 text-[9px] font-bold rounded-md bg-muted text-foreground"
            >
              {loginStats.totalLogins}
            </Badge>
          )}
        </button>
      </div>

      {/* TAB 1: WORKSPACES & TEAMS HIERARCHY */}
      {activeTab === "hierarchy" && (
        <motion.div
          key="hierarchy-tab"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-6"
        >
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border-border/60 bg-card/70 p-4 backdrop-blur-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Workspaces
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {workspaces.length}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                <Building2 className="h-6 w-6" />
              </div>
            </Card>

            <Card className="border-border/60 bg-card/70 p-4 backdrop-blur-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Teams Joined
                </p>
                <p className="text-2xl font-bold text-foreground">{totalTeams}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <Users className="h-6 w-6" />
              </div>
            </Card>

            <Card className="border-border/60 bg-card/70 p-4 backdrop-blur-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Total Team Members
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalMemberships}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                <FolderTree className="h-6 w-6" />
              </div>
            </Card>
          </div>

          {/* Workspaces & Teams Hierarchy */}
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Layers className="h-5 w-5 text-rose-500" /> Workspaces & Teams
                  Hierarchy
                </h2>
                <p className="text-xs text-muted-foreground">
                  Workspaces owned or joined by this user, including nested team
                  details & members
                </p>
              </div>

              {workspaces.length > 0 && (
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Filter workspace or team..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="border-border/60 bg-muted/40 pl-8 text-xs text-foreground placeholder:text-muted-foreground h-9"
                  />
                </div>
              )}
            </div>

            {workspaces.length === 0 ? (
              <Card className="border-border/60 bg-card/50 p-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground mb-4">
                  <Building2 className="h-8 w-8" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  No Workspaces Found
                </h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                  This user is not associated with any workspace or team yet.
                </p>
              </Card>
            ) : filteredWorkspaces.length === 0 ? (
              <Card className="border-border/60 bg-card/50 p-8 text-center">
                <p className="text-xs text-muted-foreground">
                  No workspace matches &quot;{searchFilter}&quot;.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredWorkspaces.map((ws) => {
                  const isCollapsed = expandedWorkspaces[ws.id] === true;
                  const teamsList = ws.teams || [];

                  return (
                    <Card
                      key={ws.id}
                      className="overflow-hidden border-border/60 bg-card/70 backdrop-blur-sm shadow-sm transition-all hover:border-border"
                    >
                      {/* Workspace Header Bar */}
                      <div
                        onClick={() => toggleWorkspaceExpand(ws.id)}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 bg-muted/30 px-5 py-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-lr from-rose-500/20 to-amber-500/20 text-xl font-bold border border-rose-500/20 shadow-inner">
                            {ws.icon || "⚡"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-foreground tracking-tight">
                                {ws.name}
                              </h3>
                              <Badge
                                variant="outline"
                                className="text-[10px] font-mono border-border bg-muted/40 text-muted-foreground"
                              >
                                /{ws.slug}
                              </Badge>
                              {ws.isOwner ? (
                                <Badge className="h-5 gap-1 rounded-md bg-amber-500/15 text-amber-400 border-amber-500/30 text-[9px] font-bold">
                                  <Crown className="h-3 w-3" /> Owner
                                </Badge>
                              ) : (
                                <Badge className="h-5 rounded-md bg-blue-500/15 text-blue-400 border-blue-500/30 text-[9px] font-bold">
                                  Member
                                </Badge>
                              )}
                            </div>
                            {ws.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {ws.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                            <Users className="h-3.5 w-3.5 text-amber-400" />
                            {teamsList.length}{" "}
                            {teamsList.length === 1 ? "Team" : "Teams"}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            {isCollapsed ? (
                              <ChevronRight className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Teams List Under Workspace */}
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="divide-y divide-border/40 p-5 space-y-4"
                          >
                            {teamsList.length === 0 ? (
                              <div className="py-4 text-center text-xs text-muted-foreground italic">
                                No teams created under this workspace yet.
                              </div>
                            ) : (
                              teamsList.map((team) => {
                                const members = team.members || [];
                                const isCurrentUserInTeam = members.some(
                                  (m) => m.userId === user.id,
                                );
                                const currentUserRoleInTeam =
                                  members.find((m) => m.userId === user.id)?.role ||
                                  "MEMBER";

                                return (
                                  <div
                                    key={team.id}
                                    className="rounded-xl border border-border/40 bg-muted/20 p-4 transition-all hover:bg-muted/30 space-y-3"
                                  >
                                    {/* Team Info Row */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <div className="flex items-center gap-3">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-card border border-border text-base">
                                          {team.icon || "👥"}
                                        </span>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <Badge
                                              variant="secondary"
                                              className="font-mono text-[9px] uppercase font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                            >
                                              {team.key}
                                            </Badge>
                                            <span className="text-xs font-bold text-foreground">
                                              {team.name}
                                            </span>
                                            {isCurrentUserInTeam && (
                                              <Badge className="h-4 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-semibold">
                                                Role: {currentUserRoleInTeam}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                                        <Users className="h-3 w-3 text-muted-foreground" />
                                        <span>{members.length} Members</span>
                                      </div>
                                    </div>

                                    {/* Team Members Grid */}
                                    {members.length > 0 && (
                                      <div className="pt-2 border-t border-border/30">
                                        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70 mb-2">
                                          Team Members ({members.length})
                                        </p>
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                                          {members.map((mem) => {
                                            const isThisUser =
                                              mem.userId === user.id;
                                            const memAvatar = getAvatarUrl(
                                              mem.avatar,
                                            );
                                            const memInitials = (
                                              mem.name || mem.email
                                            )
                                              .split(" ")
                                              .map((w) => w[0])
                                              .join("")
                                              .toUpperCase()
                                              .slice(0, 2);

                                            return (
                                              <div
                                                key={mem.id}
                                                className={`flex items-center gap-2.5 rounded-lg border p-2 text-xs transition-colors ${
                                                  isThisUser
                                                    ? "border-rose-500/40 bg-rose-500/10 text-foreground"
                                                    : "border-border/40 bg-card/60 text-foreground/80"
                                                }`}
                                              >
                                                <Avatar className="h-7 w-7 border border-border">
                                                  {memAvatar && (
                                                    <AvatarImage
                                                      src={memAvatar}
                                                      alt={mem.name}
                                                    />
                                                  )}
                                                  <AvatarFallback className="bg-muted text-[9px] font-bold text-foreground">
                                                    {memInitials}
                                                  </AvatarFallback>
                                                </Avatar>

                                                <div className="min-w-0 flex-1">
                                                  <p className="truncate text-xs font-semibold text-foreground flex items-center gap-1">
                                                    {mem.name || mem.email}
                                                    {isThisUser && (
                                                      <span className="text-[8px] bg-rose-500 text-white font-bold px-1 rounded">
                                                        You
                                                      </span>
                                                    )}
                                                  </p>
                                                  <p className="truncate text-[10px] text-muted-foreground">
                                                    {mem.email}
                                                  </p>
                                                </div>

                                                <Badge
                                                  variant="outline"
                                                  className={`text-[8px] font-bold uppercase shrink-0 ${
                                                    mem.role === "OWNER"
                                                      ? "border-amber-500/30 text-amber-400 bg-amber-500/10"
                                                      : mem.role === "LEAD"
                                                        ? "border-violet-500/30 text-violet-400 bg-violet-500/10"
                                                        : "border-border text-muted-foreground"
                                                  }`}
                                                >
                                                  {mem.role}
                                                </Badge>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* TAB 2: LOGIN HISTORY & SECURITY AUDIT */}
      {activeTab === "login-history" && (
        <motion.div
          key="login-history-tab"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-6"
        >
          {/* Security KPI Metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/60 bg-gradient-to-br from-card/80 via-card/60 to-emerald-500/5 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {loginStats?.successRate ?? 100}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {loginStats?.successfulLogins ?? 0} successful / {loginStats?.totalLogins ?? 0} total
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>
            </Card>

            <Card className="border-border/60 bg-gradient-to-br from-card/80 via-card/60 to-rose-500/5 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Failed Attempts
                  </p>
                  <p className={`text-2xl font-bold ${
                    (loginStats?.failedLogins ?? 0) > 0 ? "text-rose-400" : "text-foreground"
                  }`}>
                    {loginStats?.failedLogins ?? 0}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {(loginStats?.failedLogins ?? 0) > 0 ? "Potential unauthorized attempts" : "No security flags"}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <ShieldAlert className="h-6 w-6" />
                </div>
              </div>
            </Card>

            <Card className="border-border/60 bg-gradient-to-br from-card/80 via-card/60 to-sky-500/5 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Unique Devices & IPs
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {loginStats?.uniqueDevices ?? 0} Dev / {loginStats?.uniqueIps ?? 0} IPs
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Known footprint across logins
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Monitor className="h-6 w-6" />
                </div>
              </div>
            </Card>

            <Card className="border-border/60 bg-gradient-to-br from-card/80 via-card/60 to-amber-500/5 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Last Known Login
                  </p>
                  <p className="text-sm font-bold text-foreground truncate max-w-[140px]">
                    {loginStats?.lastLogin
                      ? new Date(loginStats.lastLogin).toLocaleDateString()
                      : "Never"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {loginStats?.lastLogin
                      ? new Date(loginStats.lastLogin).toLocaleTimeString()
                      : "No recorded activity"}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </div>

          {/* Filter & Controls Bar */}
          <Card className="border-border/60 bg-card/70 p-4 backdrop-blur-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search IP, OS, browser, device..."
                    value={loginSearch}
                    onChange={(e) => {
                      setLoginSearch(e.target.value);
                      setLoginPage(1);
                    }}
                    className="border-border/60 bg-muted/40 pl-8 text-xs text-foreground placeholder:text-muted-foreground h-9"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 p-1">
                  <button
                    onClick={() => {
                      setLoginFilterStatus("all");
                      setLoginPage(1);
                    }}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                      loginFilterStatus === "all"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All ({loginStats?.totalLogins ?? 0})
                  </button>
                  <button
                    onClick={() => {
                      setLoginFilterStatus("success");
                      setLoginPage(1);
                    }}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                      loginFilterStatus === "success"
                        ? "bg-emerald-500/20 text-emerald-400 shadow-sm"
                        : "text-muted-foreground hover:text-emerald-400"
                    }`}
                  >
                    Successful ({loginStats?.successfulLogins ?? 0})
                  </button>
                  <button
                    onClick={() => {
                      setLoginFilterStatus("failed");
                      setLoginPage(1);
                    }}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                      loginFilterStatus === "failed"
                        ? "bg-rose-500/20 text-rose-400 shadow-sm"
                        : "text-muted-foreground hover:text-rose-400"
                    }`}
                  >
                    Failed ({loginStats?.failedLogins ?? 0})
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLoginSortOrder((o) => (o === "desc" ? "asc" : "desc"));
                    setLoginPage(1);
                  }}
                  className="h-8 gap-1.5 rounded-lg border-border text-xs text-foreground hover:bg-muted cursor-pointer"
                >
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  {loginSortOrder === "desc" ? "Newest First" : "Oldest First"}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => refetchLoginHistory()}
                  disabled={isLoginHistoryFetching}
                  className="h-8 w-8 rounded-lg border-border text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Refresh Login History"
                >
                  <RotateCcw className={`h-3.5 w-3.5 ${isLoginHistoryFetching ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </Card>

          {/* Login History Table / List */}
          {isLoginHistoryLoading ? (
            <Card className="p-6 border-border/60 bg-card/70 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full bg-muted/60 rounded-xl" />
              ))}
            </Card>
          ) : loginItems.length === 0 ? (
            <Card className="border-border/60 bg-card/50 p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground mb-4">
                <ShieldCheck className="h-8 w-8 text-sky-400" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                No Login History Records Found
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                {loginSearch || loginFilterStatus !== "all"
                  ? "No login attempts match your active search or filter criteria."
                  : "This user has not registered any login activity yet."}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {loginItems.map((item) => {
                const dateObj = new Date(item.createdAt);
                const isRecent = Date.now() - dateObj.getTime() < 1000 * 60 * 60 * 24;

                return (
                  <Card
                    key={item.id}
                    className={`overflow-hidden border transition-all hover:border-border p-4 ${
                      item.successful
                        ? "border-border/60 bg-card/70"
                        : "border-rose-500/30 bg-rose-500/5"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Status & Primary Info */}
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                          item.successful
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}>
                          {item.successful ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <AlertTriangle className="h-5 w-5" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-foreground">
                              {item.successful ? "Successful Login" : "Failed Login Attempt"}
                            </span>
                            <Badge
                              variant="outline"
                              className={`h-4.5 text-[9px] font-bold rounded ${
                                item.successful
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              }`}
                            >
                              {item.successful ? "Authorized" : item.message || "Failed"}
                            </Badge>

                            {isRecent && (
                              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" title="Recent activity within 24h" />
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            {/* Device Type */}
                            <span className="flex items-center gap-1">
                              {getDeviceIcon(item.device)}
                              <span className="capitalize font-medium">{item.device || "Desktop"}</span>
                            </span>

                            {/* Browser */}
                            {item.browser && (
                              <Badge
                                variant="outline"
                                className={`text-[9px] font-semibold border ${getBrowserBadgeClass(item.browser)}`}
                              >
                                {item.browser}
                              </Badge>
                            )}

                            {/* OS */}
                            {item.os && (
                              <span className="text-[11px] font-mono text-muted-foreground/90 bg-muted/50 px-1.5 py-0.5 rounded">
                                {item.os}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: IP Address & Timestamps & Action */}
                      <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 border-t border-border/40 pt-3 md:border-t-0 md:pt-0">
                        {/* IP Address */}
                        <div className="text-left md:text-right">
                          <div className="flex items-center md:justify-end gap-1.5">
                            <span className="font-mono text-xs font-semibold text-foreground">
                              {item.ipAddress || "Unknown IP"}
                            </span>
                            {item.ipAddress && (
                              <button
                                onClick={() => handleCopyIp(item.ipAddress!)}
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
                          <p className="text-[10px] text-muted-foreground flex items-center md:justify-end gap-1">
                            <Globe className="h-2.5 w-2.5" />
                            {item.ipAddress === "::1" || item.ipAddress?.includes("127.0.0.1")
                              ? "Localhost / Internal"
                              : "IPv4 / Public Network"}
                          </p>
                        </div>

                        {/* Timestamp */}
                        <div className="text-left md:text-right">
                          <p className="text-xs font-semibold text-foreground flex items-center md:justify-end gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {dateObj.toLocaleDateString()}
                          </p>
                        </div>

                        {/* Inspect Raw Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setInspectItem(item)}
                          className="h-8 gap-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                        >
                          <Terminal className="h-3.5 w-3.5" />
                          Inspect
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {/* Pagination Controls */}
              {loginMeta && loginMeta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{loginItems.length}</span> of{" "}
                    <span className="font-semibold text-foreground">{loginMeta.total}</span> login events
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!loginMeta.hasPrev}
                      onClick={() => setLoginPage((p) => Math.max(1, p - 1))}
                      className="h-8 gap-1 rounded-lg border-border text-xs cursor-pointer"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" /> Previous
                    </Button>
                    <span className="text-xs font-semibold text-muted-foreground px-2">
                      Page {loginMeta.page} of {loginMeta.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!loginMeta.hasNext}
                      onClick={() => setLoginPage((p) => p + 1)}
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
      )}

      {/* Raw Inspect Dialog Modal */}
      <Dialog open={!!inspectItem} onOpenChange={(open) => !open && setInspectItem(null)}>
        <DialogContent className="sm:max-w-xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Terminal className="h-5 w-5 text-rose-500" />
              Security Audit Event Details
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Detailed technical diagnostic data for login event #{inspectItem?.id}
            </DialogDescription>
          </DialogHeader>

          {inspectItem && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Status</p>
                  <p className={`font-semibold ${inspectItem.successful ? "text-emerald-400" : "text-rose-400"}`}>
                    {inspectItem.successful ? "Success (Authorized)" : `Failed: ${inspectItem.message || "Unknown error"}`}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Timestamp</p>
                  <p className="font-semibold text-foreground">
                    {new Date(inspectItem.createdAt).toISOString()}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">IP Address</p>
                  <p className="font-mono font-semibold text-foreground">
                    {inspectItem.ipAddress || "N/A"}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Device / OS</p>
                  <p className="font-semibold text-foreground">
                    {inspectItem.device || "Desktop"} • {inspectItem.os || "Unknown"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center justify-between">
                  <span>Raw User-Agent String</span>
                  <button
                    onClick={() => inspectItem.userAgent && handleCopyIp(inspectItem.userAgent)}
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


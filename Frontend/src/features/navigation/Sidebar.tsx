"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PanelLeftClose,
  PanelLeft,
  Bell,
  LogOut,
  ChevronRight,
  ChevronDown,
  Building2,
  Plus,
  Check,
  Edit3,
  Trash2,
  Globe2,
  UsersRound,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  setView,
  toggleSidebar,
  markAllNotificationsRead,
} from "@/lib/redux/appSlice";
import { logout } from "@/lib/redux/authSlice";
import {
  setActiveWorkspace,
  setActiveTeam,
  setWorkspaces,
} from "@/lib/redux/dataSlice";
import { useGetAllWorkspacesQuery } from "@/lib/redux/api/workspaceApiSlice";
import { Logo, Wordmark } from "./Logo";
import {
  cn,
  getUserDisplayName,
  getUserInitials,
  getAvatarUrl,
} from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NAVIGATION_GROUPS } from "@/constants";
import { WorkspaceModal } from "@/components/modals/workspace-modal";
import { DeleteWorkspaceModal } from "@/components/modals/delete-workspace-modal";
import { TeamModal } from "@/components/modals/team-modal";
import { DeleteTeamModal } from "@/components/modals/delete-team-modal";

export function Sidebar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const view = useAppSelector((s) => s.app.view);
  const collapsed = useAppSelector((s) => s.app.sidebarCollapsed);
  const notifications = useAppSelector((s) => s.app.notifications);
  const unread = notifications.filter((n) => !n.read).length;

  // Sync user workspaces from API
  const { data: wsRes } = useGetAllWorkspacesQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (wsRes?.success && wsRes.data) {
      dispatch(setWorkspaces(wsRes.data));
    }
  }, [wsRes, dispatch]);

  const avatarSrc = getAvatarUrl(user?.avatar);
  const displayName = getUserDisplayName(user, "User Account");
  const displayEmail = user?.email || "user@noteflow.ai";
  const initials = getUserInitials(user?.name, user?.email);

  // Workspaces & Teams state
  const workspaces = useAppSelector((s) => s.data.workspaces);
  const activeWorkspaceId = useAppSelector((s) => s.data.activeWorkspaceId);
  const activeTeamId = useAppSelector((s) => s.data.activeTeamId);
  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const teams = activeWorkspace?.teams || [];

  // Modal & section collapse triggers
  const [wsModalOpen, setWsModalOpen] = useState(false);
  const [wsModalMode, setWsModalMode] = useState<"create" | "edit">("create");
  const [wsToEdit, setWsToEdit] = useState<any>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [wsToDelete, setWsToDelete] = useState<any>(null);

  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [teamModalMode, setTeamModalMode] = useState<"create" | "edit">("create");
  const [teamToEdit, setTeamToEdit] = useState<any>(null);

  const [deleteTeamModalOpen, setDeleteTeamModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<any>(null);

  const [teamsCollapsed, setTeamsCollapsed] = useState(true);

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 272 }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className={cn(
          "dashboard-sidebar sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r lg:flex",
        )}
      >
        {/* Header / Logo */}
        <div className="flex h-[72px] items-center gap-3 px-4">
          <button
            onClick={() => dispatch(setView("landing"))}
            className="flex items-center gap-3 overflow-hidden text-left"
            aria-label="Go to landing"
          >
            <Logo size={36} />
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
              >
                <Wordmark className="text-[15px] text-sidebar-foreground" />
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Meeting Intelligence
                </p>
              </motion.div>
            )}
          </button>
        </div>

        {/* Workspace Switcher Component */}
        <div className="border-b border-sidebar-border/40 px-3 pb-3 pt-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "dashboard-glass-card flex w-full items-center gap-2.5 rounded-2xl p-2.5 text-left transition-all hover:-translate-y-0.5",
                  collapsed && "justify-center p-2",
                )}
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500 ring-1 ring-indigo-500/10">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-sidebar-foreground">
                      {activeWorkspace?.name || "Select Workspace"}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {teams.length} {teams.length === 1 ? "team" : "teams"}{" "}
                      active
                    </p>
                  </div>
                )}
                {!collapsed && (
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Workspaces
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => {
                    dispatch(setActiveWorkspace(ws.id));
                    if (typeof window !== "undefined") {
                      window.history.pushState(null, "", `/${ws.slug}`);
                    }
                  }}
                  className="flex items-center justify-between py-2 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/8 text-indigo-500">
                      <Building2 className="h-3.5 w-3.5" />
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-semibold">{ws.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {ws.teams?.length || 0} teams
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {ws.id === activeWorkspaceId && (
                      <Check className="mr-0.5 h-3.5 w-3.5 text-indigo-500" />
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setWsToEdit(ws);
                        setWsModalMode("edit");
                        setWsModalOpen(true);
                      }}
                      title="Edit workspace"
                      className="p-1 text-muted-foreground hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-muted"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                    {workspaces.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setWsToDelete(ws);
                          setDeleteModalOpen(true);
                        }}
                        title="Delete workspace"
                        className="p-1 text-muted-foreground hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-muted"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setWsToEdit(null);
                  setWsModalMode("create");
                  setWsModalOpen(true);
                }}
                className="gap-2 text-xs font-medium text-indigo-500 cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Create Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Teams Selector Pill list in Sidebar (Collapsible) */}
          {!collapsed && (
            <div className="mt-2.5 space-y-1">
              <div className="flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
                <button
                  onClick={() => setTeamsCollapsed(!teamsCollapsed)}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  title={teamsCollapsed ? "Expand Teams" : "Collapse Teams"}
                >
                  {teamsCollapsed ? (
                    <ChevronRight className="h-3 w-3 text-indigo-400" />
                  ) : (
                    <ChevronDown className="h-3 w-3 text-indigo-400" />
                  )}
                  <span>Teams</span>
                  <span className="font-mono text-[9px] rounded bg-white/5 px-1 py-0.2 text-muted-foreground ml-0.5">
                    {teams.length}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setTeamToEdit(null);
                    setTeamModalMode("create");
                    setTeamModalOpen(true);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  title="Create Team"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <AnimatePresence initial={false}>
                {!teamsCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="space-y-1 overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        dispatch(setActiveTeam(null));
                        if (typeof window !== "undefined" && activeWorkspace) {
                          window.history.pushState(
                            null,
                            "",
                            `/${activeWorkspace.slug}`,
                          );
                        }
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors cursor-pointer",
                        activeTeamId === null
                          ? "bg-indigo-500/15 font-semibold text-indigo-400"
                          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
                      )}
                    >
                      <Globe2 className="h-3 w-3 text-indigo-500" />
                      <span className="truncate">All Teams</span>
                    </button>

                    {teams.map((t) => (
                      <div
                        key={t.id}
                        className={cn(
                          "group/team flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors",
                          activeTeamId === t.id
                            ? "bg-indigo-500/15 font-semibold text-indigo-400"
                            : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
                        )}
                      >
                        <button
                          onClick={() => {
                            dispatch(setActiveTeam(t.id));
                            dispatch(setView("team"));
                            if (
                              typeof window !== "undefined" &&
                              activeWorkspace
                            ) {
                              window.history.pushState(
                                null,
                                "",
                                `/${activeWorkspace.slug}/${t.slug || t.key.toLowerCase()}`,
                              );
                            }
                          }}
                          className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
                        >
                          <UsersRound className="h-3 w-3 text-indigo-500/80" />
                          <span className="truncate">{t.name}</span>
                        </button>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-[9px] rounded bg-white/5 px-1 py-0.5 text-muted-foreground">
                            {t.key}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTeamToEdit(t);
                              setTeamModalMode("edit");
                              setTeamModalOpen(true);
                            }}
                            title="Edit team"
                            className="p-0.5 text-muted-foreground hover:text-indigo-400 opacity-0 group-hover/team:opacity-100 transition-opacity rounded cursor-pointer"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTeamToDelete(t);
                              setDeleteTeamModalOpen(true);
                            }}
                            title="Delete team"
                            className="p-0.5 text-muted-foreground hover:text-rose-500 opacity-0 group-hover/team:opacity-100 transition-opacity rounded cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-6 overflow-y-auto scrollbar-thin px-3 py-4">
          {NAVIGATION_GROUPS.map((group) => (
            <div key={group.section} className="space-y-1">
              {!collapsed && (
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                  {group.section}
                </p>
              )}
              {group.items.map((item) => {
                const active = view === item.key;
                const Icon = item.icon;
                return (
                  <Tooltip key={item.key} delayDuration={collapsed ? 100 : 400}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => dispatch(setView(item.key))}
                        className={cn(
                          "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                          active
                            ? "bg-gradient-to-r from-indigo-500/14 to-violet-500/8 text-sidebar-foreground shadow-sm ring-1 ring-indigo-500/10"
                            : "text-muted-foreground hover:bg-white/50 hover:text-sidebar-foreground dark:hover:bg-white/[0.045]",
                          collapsed && "justify-center",
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="sidebar-active"
                            className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-500 to-violet-500"
                            transition={{
                              type: "spring",
                              stiffness: 350,
                              damping: 30,
                            }}
                          />
                        )}
                        <span
                          className={cn(
                            "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all",
                            active
                              ? `bg-gradient-to-br ${item.gradient} text-white shadow-md shadow-indigo-500/30`
                              : "bg-indigo-500/[0.06] text-muted-foreground ring-1 ring-indigo-500/10 group-hover:text-indigo-600 dark:bg-white/[0.03] dark:ring-white/[0.05] dark:group-hover:text-indigo-300",
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                        </span>
                        {!collapsed && (
                          <span className="flex-1 text-left">{item.label}</span>
                        )}
                        {!collapsed && item.badge && (
                          <Badge
                            variant="secondary"
                            className="h-5 bg-rose-500/15 px-1.5 text-[10px] font-semibold text-rose-500"
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

        {/* Footer */}
        <div className="border-t border-sidebar-border/50 bg-white/20 p-3 dark:bg-white/[0.012]">
          <div
            className={cn("flex items-center gap-2", collapsed && "flex-col")}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-8 w-8 rounded-lg bg-sidebar-accent/50"
                >
                  <Bell className="h-3.5 w-3.5" />
                  {unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  <button
                    className="text-xs text-indigo-500 hover:underline"
                    onClick={() => dispatch(markAllNotificationsRead())}
                  >
                    Mark all read
                  </button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {notifications.map((n) => (
                    <DropdownMenuItem
                      key={n.id}
                      className="flex flex-col items-start gap-0.5 py-2.5"
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="text-sm font-medium">{n.title}</span>
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-indigo-500" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {n.description}
                      </span>
                      <span className="text-[10px] text-muted-foreground/70">
                        {n.time}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={() => dispatch(setView("settings"))}
              className={cn(
                "flex flex-1 items-center gap-2.5 rounded-xl p-1.5 transition-all hover:bg-sidebar-accent/80 cursor-pointer",
                collapsed && "w-full justify-center",
              )}
            >
              <Avatar className="h-8 w-8 border border-sidebar-border shadow-sm">
                {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-[11px] font-semibold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-xs font-semibold text-sidebar-foreground">
                    {displayName}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {displayEmail}
                  </p>
                </div>
              )}
              {!collapsed && (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
          </div>

          <div
            className={cn(
              "mt-2 flex items-center",
              collapsed ? "flex-col gap-2" : "justify-between",
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(toggleSidebar())}
              className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-sidebar-foreground cursor-pointer"
            >
              {collapsed ? (
                <PanelLeft className="h-3.5 w-3.5" />
              ) : (
                <>
                  <PanelLeftClose className="h-3.5 w-3.5" /> Collapse
                </>
              )}
            </Button>

            <Tooltip delayDuration={collapsed ? 100 : 400}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    dispatch(logout());
                    dispatch(setView("login"));
                    toast.success("Logged out successfully", {
                      position: "bottom-right",
                    });
                  }}
                  className={cn(
                    "h-8 gap-1.5 px-2 text-xs text-rose-500/80 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer",
                    collapsed && "w-8 p-0",
                  )}
                >
                  <LogOut className="h-3 w-3" />
                  {!collapsed && <span>Sign out</span>}
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent
                  side="right"
                  className="font-medium text-xs text-rose-500"
                >
                  Sign out
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>
      </motion.aside>

      {/* Modals */}
      <WorkspaceModal
        open={wsModalOpen}
        onClose={() => {
          setWsModalOpen(false);
          setWsToEdit(null);
        }}
        mode={wsModalMode}
        workspaceToEdit={wsToEdit}
      />
      <DeleteWorkspaceModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setWsToDelete(null);
        }}
        workspace={wsToDelete}
      />
      <TeamModal
        open={teamModalOpen}
        onClose={() => {
          setTeamModalOpen(false);
          setTeamToEdit(null);
        }}
        mode={teamModalMode}
        teamToEdit={teamToEdit}
        targetWorkspaceId={activeWorkspaceId}
      />
      <DeleteTeamModal
        open={deleteTeamModalOpen}
        onClose={() => {
          setDeleteTeamModalOpen(false);
          setTeamToDelete(null);
        }}
        team={teamToDelete}
      />
    </>
  );
}

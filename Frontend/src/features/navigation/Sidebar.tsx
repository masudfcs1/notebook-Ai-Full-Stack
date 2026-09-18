"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  LogOut,
  ChevronRight,
  ChevronDown,
  ChevronsUpDown,
  Building2,
  Plus,
  Check,
  Edit3,
  Trash2,
  Globe2,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setView, toggleSidebar } from "@/lib/redux/appSlice";
import { logout } from "@/lib/redux/authSlice";
import { useNotifications } from "@/hooks/useNotifications";
import {
  setActiveWorkspace,
  setActiveTeam,
} from "@/lib/redux/dataSlice";
import { SidebarHeader, SidebarProfile } from "./SidebarChrome";
import {
  cn,
  getUserDisplayName,
  getUserInitials,
  getAvatarUrl,
} from "@/lib/utils";
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
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const view = useAppSelector((s) => s.app.view);
  const collapsed = useAppSelector((s) => s.app.sidebarCollapsed);
  const { notifications, unreadCount, markAllAsRead, markAsRead } =
    useNotifications();

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
  const isWorkspaceOwner =
    activeWorkspace?.userId === user?.id ||
    user?.role === "SUPER_ADMIN" ||
    user?.role === "ADMIN";

  // Modal & section collapse triggers
  const [wsModalOpen, setWsModalOpen] = useState(false);
  const [wsModalMode, setWsModalMode] = useState<"create" | "edit">("create");
  const [wsToEdit, setWsToEdit] = useState<any>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [wsToDelete, setWsToDelete] = useState<any>(null);

  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [teamModalMode, setTeamModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [teamToEdit, setTeamToEdit] = useState<any>(null);

  const [deleteTeamModalOpen, setDeleteTeamModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<any>(null);

  const [teamsCollapsed, setTeamsCollapsed] = useState(true);

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className={cn(
          "dashboard-sidebar app-sidebar sticky top-0 z-30 hidden h-dvh shrink-0 flex-col border-r lg:flex",
        )}
      >
        <SidebarHeader
          collapsed={collapsed}
          onHome={() => dispatch(setView("landing"))}
          onToggle={() => dispatch(toggleSidebar())}
        />

        {/* Workspace Switcher Component */}
        <div className="shrink-0 border-b border-sidebar-border/60 px-3 pb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Switch workspace: ${activeWorkspace?.name || "Select workspace"}`}
                title={collapsed ? activeWorkspace?.name || "Switch workspace" : undefined}
                className={cn(
                  "sidebar-context cursor-pointer text-left",
                  collapsed && "is-collapsed",
                )}
              >
                <div className="sidebar-accent-surface flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {activeWorkspace?.name || "Select Workspace"}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {teams.length} {teams.length === 1 ? "team" : "teams"}
                    </p>
                  </div>
                )}
                {!collapsed && (
                  <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Workspaces
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {workspaces.map((ws) => {
                const isOwner =
                  ws.userId === user?.id ||
                  user?.role === "SUPER_ADMIN" ||
                  user?.role === "ADMIN";
                const userMembership = ws.teams
                  ?.flatMap((t) => t.members || [])
                  .find(
                    (m) =>
                      (m.userId && m.userId === user?.id) ||
                      (user?.email &&
                        m.email?.toLowerCase() === user.email.toLowerCase()),
                  );

                return (
                  <DropdownMenuItem
                    key={ws.id}
                    onClick={() => {
                      dispatch(setActiveWorkspace(ws.id));
                      const wsSlug = ws.slug || ws.id;
                      if (view === "team") {
                        if (ws.teams && ws.teams.length > 0) {
                          const firstTeam = ws.teams[0];
                          dispatch(setActiveTeam(firstTeam.id));
                          const teamSlug =
                            firstTeam.slug ||
                            (firstTeam.key ? firstTeam.key.toLowerCase() : firstTeam.id);
                          void router.push(`/${wsSlug}/${teamSlug}`);
                        } else {
                          dispatch(setActiveTeam(null));
                          void router.push(`/${wsSlug}`);
                        }
                      } else {
                        void router.push(`/${wsSlug}`);
                      }
                    }}
                    className="flex items-center justify-between py-2 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/8 text-indigo-500">
                        <Building2 className="h-3.5 w-3.5" />
                      </span>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold">{ws.name}</p>
                          {!isOwner && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 font-medium">
                              {userMembership?.role ? `${userMembership.role.charAt(0) + userMembership.role.slice(1).toLowerCase()}` : "Assigned"}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {ws.teams?.length || 0} teams
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {ws.id === activeWorkspaceId && (
                        <Check className="mr-0.5 h-3.5 w-3.5 text-indigo-500" />
                      )}
                      {isOwner && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setWsToEdit(ws);
                              setWsModalMode("edit");
                              setWsModalOpen(true);
                            }}
                            title="Edit workspace"
                            className="p-1 text-muted-foreground hover:text-indigo-400 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity rounded hover:bg-muted"
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
                            className="p-1 text-muted-foreground hover:text-rose-500 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity rounded hover:bg-muted"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                          )}
                        </>
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })}
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
            <div className="mt-3 space-y-1.5">
              <div className="flex h-7 items-center justify-between px-1 text-[11px] font-medium text-muted-foreground">
                <button
                  type="button"
                  aria-expanded={!teamsCollapsed}
                  aria-controls="sidebar-teams"
                  onClick={() => setTeamsCollapsed(!teamsCollapsed)}
                  className="flex h-7 items-center gap-1.5 rounded-md px-1 transition-colors hover:text-foreground"
                  title={teamsCollapsed ? "Expand Teams" : "Collapse Teams"}
                >
                  {teamsCollapsed ? (
                    <ChevronRight className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <ChevronDown className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                  )}
                  <span>Teams</span>
                  <span className="ml-0.5 rounded-md bg-sidebar-accent px-1.5 text-[10px] tabular-nums text-muted-foreground">
                    {teams.length}
                  </span>
                </button>
                {isWorkspaceOwner && (
                  <button
                    onClick={() => {
                      setTeamToEdit(null);
                      setTeamModalMode("create");
                      setTeamModalOpen(true);
                    }}
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
                    title="Create Team"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                )}
              </div>

              <AnimatePresence initial={false}>
                {!teamsCollapsed && (
                  <motion.div
                    id="sidebar-teams"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="ml-2 max-h-52 space-y-0.5 overflow-y-auto border-l border-sidebar-border/70 pl-2"
                  >
                    <button
                      onClick={() => {
                        dispatch(setActiveTeam(null));
                        dispatch(setView("team"));
                        if (activeWorkspace) {
                          const wsSlug = activeWorkspace.slug || activeWorkspace.id;
                          void router.push(`/${wsSlug}`);
                        }
                      }}
                      className={cn(
                        "flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-xs transition-colors",
                        view === "team" && activeTeamId === null
                          ? "bg-indigo-500/12 font-semibold text-indigo-700 dark:text-indigo-300"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white",
                      )}
                    >
                      <Globe2 className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                      <span className="truncate">All Teams</span>
                    </button>

                    {teams.map((t) => {
                      const userMembership = t.members?.find(
                        (m) =>
                          (m.userId && m.userId === user?.id) ||
                          (user?.email &&
                            m.email?.toLowerCase() ===
                              user.email.toLowerCase())
                      );
                      const isTeamOwnerOrLead =
                        activeWorkspace?.userId === user?.id ||
                        user?.role === "SUPER_ADMIN" ||
                        user?.role === "ADMIN" ||
                        userMembership?.role === "OWNER" ||
                        userMembership?.role === "LEAD";

                      const roleBadge = userMembership?.role
                        ? userMembership.role.charAt(0) +
                          userMembership.role.slice(1).toLowerCase()
                        : null;

                      return (
                        <div
                          key={t.id}
                          className={cn(
                            "group/team flex min-h-8 w-full items-center justify-between rounded-md px-2 text-xs transition-colors",
                            view === "team" && activeTeamId === t.id
                              ? "bg-indigo-500/12 font-semibold text-indigo-700 dark:text-indigo-300"
                              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white",
                          )}
                        >
                          <button
                            onClick={() => {
                              dispatch(setActiveTeam(t.id));
                              dispatch(setView("team"));
                              if (activeWorkspace) {
                                const wsSlug = activeWorkspace.slug || activeWorkspace.id;
                                const teamSlug =
                                  t.slug || (t.key ? t.key.toLowerCase() : t.id);
                                void router.push(`/${wsSlug}/${teamSlug}`);
                              }
                            }}
                            aria-current={view === "team" && activeTeamId === t.id ? "page" : undefined}
                            title={roleBadge ? `${t.name} · ${roleBadge}` : t.name}
                            className="flex min-h-8 min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
                          >
                            <UsersRound className="h-3 w-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span className="truncate">{t.name}</span>
                          </button>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="font-mono text-[9px] rounded bg-zinc-200/70 dark:bg-white/5 px-1 py-0.5 text-zinc-600 dark:text-zinc-400">
                              {t.key}
                            </span>
                            {isTeamOwnerOrLead && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTeamToEdit(t);
                                    setTeamModalMode("edit");
                                    setTeamModalOpen(true);
                                  }}
                                  title="Edit team"
                                  className="p-0.5 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 opacity-0 group-hover/team:opacity-100 group-focus-within/team:opacity-100 transition-opacity rounded cursor-pointer"
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
                                  className="p-0.5 text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 opacity-0 group-hover/team:opacity-100 group-focus-within/team:opacity-100 transition-opacity rounded cursor-pointer"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <nav aria-label="Main navigation" className="min-h-0 flex-1 space-y-5 overflow-y-auto scrollbar-thin px-3 py-4">
          {NAVIGATION_GROUPS.map((group) => (
            <div key={group.section} className="sidebar-nav-section space-y-1">
              {!collapsed && (
                <p className="sidebar-section-label">
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
                        type="button"
                        aria-label={item.label}
                        aria-current={active ? "page" : undefined}
                        className={cn("app-sidebar-link", collapsed && "is-collapsed")}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                        {!collapsed && (
                          <span className="flex-1 text-left">{item.label}</span>
                        )}
                        {!collapsed && item.badge && (
                          <Badge
                            variant="secondary"
                            className="h-4 rounded-md border-0 bg-rose-500/10 px-1.5 text-[9px] font-medium text-rose-600 dark:text-rose-400"
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
        <div className="sidebar-footer shrink-0 p-3">
          <SidebarProfile
            collapsed={collapsed}
            name={displayName}
            email={displayEmail}
            avatarSrc={avatarSrc}
            initials={initials}
            onClick={() => dispatch(setView("settings"))}
          />

          <div
            className={cn(
              "mt-2 flex items-center",
              collapsed ? "flex-col gap-1" : "justify-between gap-1",
            )}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size={collapsed ? "icon" : "sm"}
                  aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
                  title="Notifications"
                  className={cn("sidebar-utility relative h-9 gap-2 rounded-lg px-2", collapsed && "w-9 px-0")}
                >
                  <Bell className="h-3.5 w-3.5" />
                  {!collapsed && <span>Notifications</span>}
                  {unreadCount > 0 && (
                    <span className={cn("flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-semibold text-white", collapsed && "absolute -right-0.5 -top-0.5")}>
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      className="text-xs text-indigo-500 hover:underline cursor-pointer"
                      onClick={() => void markAllAsRead()}
                    >
                      Mark all read
                    </button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="py-4 text-center text-xs text-muted-foreground">
                    No notifications yet
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto scrollbar-thin">
                    {notifications.map((n) => (
                      <DropdownMenuItem
                        key={n.id}
                        onClick={() => void markAsRead(n.id)}
                        className={cn(
                          "flex flex-col items-start gap-0.5 py-2.5 cursor-pointer",
                          !n.read && "bg-indigo-500/5 font-medium",
                        )}
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <span className="text-sm font-medium">{n.title}</span>
                          {!n.read && (
                            <span className="h-2 w-2 rounded-full bg-indigo-500" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground leading-relaxed">
                          {n.description}
                        </span>
                        <span className="text-[10px] text-muted-foreground/70">
                          {n.time}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip delayDuration={collapsed ? 100 : 400}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Sign out"
                  onClick={() => {
                    dispatch(logout());
                    dispatch(setView("login"));
                    toast.success("Logged out successfully", {
                      position: "bottom-right",
                    });
                  }}
                  className={cn(
                    "sidebar-utility h-9 gap-2 rounded-lg px-2 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400",
                    collapsed && "w-9 px-0",
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

"use client";

import { DeleteTaskModal } from "@/components/modals/delete-task-modal";
import { TaskDetailModal } from "@/components/modals/task-detail-modal";
import { TaskModal } from "@/components/modals/task-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useGetTasksByWorkspaceQuery,
  useGetTaskStatsQuery,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  type TaskItem,
} from "@/lib/redux/api/taskApiSlice";
import { updateTask } from "@/lib/redux/dataSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { getTeamTheme } from "@/lib/team-theme";
import { cn, getAvatarUrl, getUserInitials } from "@/lib/utils";
import type { ActionItem, PriorityLevel, TaskStatus } from "@/types";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  ArrowUp,
  Calendar,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Circle,
  Edit3,
  Flame,
  Layers,
  LayoutGrid,
  List,
  Minus,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// Kanban Columns Definition
const KANBAN_COLUMNS: {
  id: TaskStatus;
  label: string;
  dotColor: string;
  border: string;
  bg: string;
  badge: string;
}[] = [
  {
    id: "backlog",
    label: "Backlog",
    dotColor: "bg-slate-400",
    border: "border-slate-500/30",
    bg: "bg-slate-500/5",
    badge: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  },
  {
    id: "todo",
    label: "To Do",
    dotColor: "bg-sky-400",
    border: "border-sky-500/30",
    bg: "bg-sky-500/5",
    badge: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  },
  {
    id: "in_progress",
    label: "In Progress",
    dotColor: "bg-amber-400",
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  {
    id: "done",
    label: "Done",
    dotColor: "bg-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
];

const PRIORITY_META: Record<
  PriorityLevel,
  { label: string; icon: typeof Flame; color: string; badge: string }
> = {
  urgent: {
    label: "Urgent",
    icon: Flame,
    color: "text-rose-400",
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  },
  high: {
    label: "High",
    icon: ArrowUp,
    color: "text-amber-400",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  medium: {
    label: "Medium",
    icon: Minus,
    color: "text-indigo-400",
    badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  },
  low: {
    label: "Low",
    icon: Circle,
    color: "text-slate-400",
    badge: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  },
};

export function ActionItemsView() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const workspaces = useAppSelector((s) => s.data.workspaces);
  const activeWorkspaceId = useAppSelector((s) => s.data.activeWorkspaceId);
  const activeTeamId = useAppSelector((s) => s.data.activeTeamId);
  const reduxTasks = useAppSelector((s) => s.data.tasks);

  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const teams = activeWorkspace?.teams || [];

  // Team Selection Filter State
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(
    activeTeamId,
  );

  useEffect(() => {
    if (activeTeamId) {
      setSelectedTeamId(activeTeamId);
    }
  }, [activeTeamId]);

  // Selected team object
  const currentTeam = useMemo(() => {
    if (!selectedTeamId) return null;
    return teams.find((t) => t.id === selectedTeamId) || null;
  }, [teams, selectedTeamId]);

  const teamTheme = useMemo(
    () => getTeamTheme(currentTeam?.key || currentTeam?.id || "TASKS"),
    [currentTeam],
  );

  // Queries
  const { data: tasksRes, isLoading: isLoadingTasks } =
    useGetTasksByWorkspaceQuery(
      {
        workspaceId: activeWorkspace?.id || "",
        params: { teamId: selectedTeamId || undefined },
      },
      { skip: !activeWorkspace?.id },
    );

  const { data: statsRes } = useGetTaskStatsQuery(
    {
      teamId: selectedTeamId || undefined,
      workspaceId: !selectedTeamId ? activeWorkspace?.id : undefined,
    },
    { skip: !activeWorkspace?.id },
  );

  // Combine tasks from API with local fallback
  const tasks: (TaskItem | ActionItem)[] = useMemo(() => {
    if (tasksRes?.success && tasksRes.data) {
      return tasksRes.data;
    }
    return reduxTasks.filter((t) => {
      const matchWs = !t.workspaceId || t.workspaceId === activeWorkspace?.id;
      const matchTeam = !selectedTeamId || t.teamId === selectedTeamId;
      return matchWs && matchTeam;
    });
  }, [tasksRes, reduxTasks, activeWorkspace?.id, selectedTeamId]);

  // Mutations
  const [updateStatusMutation] = useUpdateTaskStatusMutation();
  const [updateTaskMutation] = useUpdateTaskMutation();

  // Available members across the current scope / workspace
  const availableMembers = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        email: string;
        avatar?: string | null;
        role: string;
      }
    >();

    // Add current authenticated user
    if (user) {
      map.set((user.email || user.name || "me").toLowerCase(), {
        id: `user-${user.id}`,
        name: user.name || "You",
        email: user.email || "",
        avatar: user.avatar,
        role: user.role || "MEMBER",
      });
    }

    // Add members from active team or all workspace teams
    const relevantTeams = selectedTeamId
      ? teams.filter((t) => t.id === selectedTeamId)
      : teams;
    relevantTeams.forEach((t) => {
      t.members?.forEach((m) => {
        const key = (m.email || m.name || m.id).toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            id: m.id,
            name: m.user?.name || m.name,
            email: m.user?.email || m.email,
            avatar: m.user?.avatar || m.avatar,
            role: m.role || "MEMBER",
          });
        }
      });
    });

    return Array.from(map.values());
  }, [user, teams, selectedTeamId]);

  // View & Filter State
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<
    "all" | "my_tasks" | "urgent_high" | "overdue" | "done"
  >("all");
  const [selectedUserFilter, setSelectedUserFilter] = useState<string | null>(
    null,
  );

  // Drag & Drop State
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  // Modals State
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | ActionItem | null>(
    null,
  );
  const [defaultModalStatus, setDefaultModalStatus] =
    useState<TaskStatus>("todo");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<
    TaskItem | ActionItem | null
  >(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [taskToView, setTaskToView] = useState<TaskItem | ActionItem | null>(
    null,
  );

  // Today string for overdue checking
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search
      const s = search.toLowerCase().trim();
      const matchSearch =
        !s ||
        t.title.toLowerCase().includes(s) ||
        (t.identifier && t.identifier.toLowerCase().includes(s)) ||
        (t.assignee && t.assignee.toLowerCase().includes(s)) ||
        (t.description && t.description.toLowerCase().includes(s));

      if (!matchSearch) return false;

      // User Token Filter
      if (selectedUserFilter !== null) {
        if (selectedUserFilter === "__unassigned__") {
          if (t.assignee) return false;
        } else {
          const target = selectedUserFilter.toLowerCase();
          const taskAssignee = (t.assignee || "").toLowerCase();
          if (!taskAssignee || !taskAssignee.includes(target)) {
            return false;
          }
        }
      }

      // Quick Filter
      if (quickFilter === "my_tasks") {
        const userName = user?.name?.toLowerCase() || "";
        const userEmail = user?.email?.toLowerCase() || "";
        const assignee = (t.assignee || "").toLowerCase();
        return (
          assignee &&
          (assignee.includes(userName) || assignee.includes(userEmail))
        );
      }
      if (quickFilter === "urgent_high") {
        return t.priority === "urgent" || t.priority === "high";
      }
      if (quickFilter === "overdue") {
        return (
          t.dueDate &&
          t.dueDate < todayStr &&
          t.status !== "done" &&
          t.status !== "completed"
        );
      }
      if (quickFilter === "done") {
        return t.status === "done" || t.status === "completed";
      }

      return true;
    });
  }, [tasks, search, selectedUserFilter, quickFilter, user, todayStr]);

  // Statistics
  const stats = useMemo(() => {
    if (statsRes?.success && statsRes.data) {
      return statsRes.data;
    }
    let total = tasks.length;
    let backlog = 0;
    let todo = 0;
    let inProgress = 0;
    let done = 0;
    let overdue = 0;

    for (const t of tasks) {
      const s = t.status || "todo";
      if (s === "backlog") backlog++;
      else if (s === "todo") todo++;
      else if (s === "in_progress") inProgress++;
      else if (s === "done" || s === "completed") done++;

      if (
        t.dueDate &&
        t.dueDate < todayStr &&
        s !== "done" &&
        s !== "completed"
      ) {
        overdue++;
      }
    }

    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
    return {
      total,
      backlog,
      todo,
      inProgress,
      done,
      overdue,
      completionRate,
      byPriority: { urgent: 0, high: 0, medium: 0, low: 0 },
    };
  }, [statsRes, tasks, todayStr]);

  // Handlers
  async function handleAssignUser(
    task: TaskItem | ActionItem,
    memberName: string | null,
    memberAvatar?: string | null,
  ) {
    try {
      dispatch(
        updateTask({
          id: task.id,
          assignee: memberName || undefined,
          assigneeAvatar: memberAvatar || undefined,
        }),
      );

      await updateTaskMutation({
        id: task.id,
        teamId: task.teamId || teams[0]?.id || "",
        data: {
          assignee: memberName || null,
          assigneeAvatar: memberAvatar || null,
        },
      }).unwrap();

      toast.success(
        memberName ? `Assigned to ${memberName}` : "Task unassigned",
      );
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to update task assignee",
      );
    }
  }

  function handleOpenCreate(columnStatus: TaskStatus = "todo") {
    setDefaultModalStatus(columnStatus);
    setTaskModalMode("create");
    setTaskToEdit(null);
    setTaskModalOpen(true);
  }

  function handleOpenEdit(task: TaskItem | ActionItem) {
    setTaskToEdit(task);
    setTaskModalMode("edit");
    setTaskModalOpen(true);
  }

  function handleOpenDelete(task: TaskItem | ActionItem) {
    setTaskToDelete(task);
    setDeleteModalOpen(true);
  }

  function handleOpenDetail(task: TaskItem | ActionItem) {
    setTaskToView(task);
    setDetailModalOpen(true);
  }

  async function handleQuickStatusChange(id: string, targetStatus: TaskStatus) {
    try {
      const task = tasks.find((t) => t.id === id);
      await updateStatusMutation({
        id,
        status: targetStatus,
        teamId: task?.teamId || undefined,
      }).unwrap();

      toast.success(`Moved to ${targetStatus.replace("_", " ").toUpperCase()}`);
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to update status",
      );
    }
  }

  // Advance Status (e.g. todo -> in_progress -> done)
  function handleAdvanceStatus(task: TaskItem | ActionItem) {
    const current = task.status || "todo";
    let next: TaskStatus = "todo";
    if (current === "backlog") next = "todo";
    else if (current === "todo") next = "in_progress";
    else if (current === "in_progress") next = "done";
    else if (current === "done" || current === "completed") next = "todo";

    void handleQuickStatusChange(task.id, next);
  }

  // Drag & Drop Handlers
  function handleDragStart(e: DragStartEvent) {
    setActiveDragId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveDragId(null);
    const over = e.over;
    if (!over) return;
    const targetStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t.id === e.active.id);
    if (task && task.status !== targetStatus) {
      void handleQuickStatusChange(task.id, targetStatus);
    }
  }

  const activeDragTask = useMemo(() => {
    if (!activeDragId) return null;
    return tasks.find((t) => t.id === activeDragId) || null;
  }, [activeDragId, tasks]);

  return (
    <div className="space-y-6">
      {/* Header & Stats Bar */}
      <Card className="dashboard-glass-card border-white/10 bg-card/60 p-5 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
                <CheckSquare className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Action Items Matrix
              </h2>
              {currentTeam && (
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1 text-xs",
                    teamTheme.badgeText,
                    teamTheme.badgeBorder,
                    teamTheme.subtleBg,
                  )}
                >
                  <Layers className="h-3 w-3" />
                  {currentTeam.name}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Track tasks, assign member tokens, and monitor workspace action
              items across pipeline stages.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <div className="rounded-xl border border-white/10 bg-card/40 p-2.5 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Tasks
              </span>
              <p className="text-lg font-bold text-foreground">{stats.total}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-card/40 p-2.5 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                In Progress
              </span>
              <p className="text-lg font-bold text-amber-400">
                {stats.inProgress}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-card/40 p-2.5 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Done Rate
              </span>
              <p className="text-lg font-bold text-emerald-400">
                {stats.completionRate}%
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-card/40 p-2.5 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Overdue
              </span>
              <p
                className={cn(
                  "text-lg font-bold",
                  stats.overdue > 0 ? "text-rose-400" : "text-muted-foreground",
                )}
              >
                {stats.overdue}
              </p>
            </div>
          </div>
        </div>

        {/* Team Filter Pills (Linear Style) */}
        {teams.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-3">
            <span className="text-xs text-muted-foreground font-semibold mr-1 flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" /> Scope:
            </span>
            <button
              onClick={() => setSelectedTeamId(null)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-medium transition-all cursor-pointer",
                selectedTeamId === null
                  ? "border-indigo-500/50 bg-indigo-500 text-white shadow-sm font-bold"
                  : "border-border/60 bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span>🌐</span>
              <span>All Teams</span>
              <span className="text-[10px] opacity-80">
                ({reduxTasks.length})
              </span>
            </button>

            {teams.map((t) => {
              const isSelected = selectedTeamId === t.id;
              const count = tasks.filter((x) => x.teamId === t.id).length;
              const theme = getTeamTheme(t.key || t.id || t.name);

              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTeamId(t.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-medium transition-all cursor-pointer",
                    isSelected
                      ? cn(
                          "border-transparent font-bold text-white shadow-sm bg-gradient-to-r",
                          theme.gradient,
                        )
                      : "border-border/60 bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span>{t.icon || "👥"}</span>
                  <span>{t.name}</span>
                  <span className="text-[10px] font-mono opacity-80">
                    ({t.key})
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* User / Member Token Filter Row */}
        {availableMembers.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-3">
            <span className="text-xs text-muted-foreground font-semibold mr-1 flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-emerald-400" /> Member Tokens:
            </span>
            <button
              onClick={() => setSelectedUserFilter(null)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border px-2.5 py-0.5 text-xs font-medium transition-all cursor-pointer",
                selectedUserFilter === null
                  ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300 font-bold shadow-sm"
                  : "border-border/60 bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span>All Assignees</span>
            </button>

            {availableMembers.map((m) => {
              const isSelected =
                selectedUserFilter?.toLowerCase() === m.name.toLowerCase() ||
                selectedUserFilter?.toLowerCase() === m.email.toLowerCase();
              const count = tasks.filter(
                (x) =>
                  (x.assignee || "")
                    .toLowerCase()
                    .includes(m.name.toLowerCase()) ||
                  (x.assignee || "")
                    .toLowerCase()
                    .includes(m.email.toLowerCase()),
              ).length;

              return (
                <button
                  key={m.id}
                  onClick={() =>
                    setSelectedUserFilter(isSelected ? null : m.name)
                  }
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl border px-2.5 py-0.5 text-xs font-medium transition-all cursor-pointer",
                    isSelected
                      ? "border-emerald-500 bg-emerald-500 text-white font-bold shadow-sm"
                      : "border-border/60 bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Avatar className="h-3.5 w-3.5">
                    <AvatarImage src={getAvatarUrl(m.avatar)} />
                    <AvatarFallback className="text-[7px]">
                      {getUserInitials(m.name, m.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{m.name}</span>
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}

            {/* Unassigned Filter Token */}
            {(() => {
              const unassignedCount = tasks.filter((x) => !x.assignee).length;
              const isSelected = selectedUserFilter === "__unassigned__";
              return (
                <button
                  onClick={() =>
                    setSelectedUserFilter(isSelected ? null : "__unassigned__")
                  }
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl border px-2.5 py-0.5 text-xs font-medium transition-all cursor-pointer",
                    isSelected
                      ? "border-amber-500 bg-amber-500 text-white font-bold shadow-sm"
                      : "border-border/60 bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span>Unassigned</span>
                  <span className="text-[10px] opacity-70">
                    ({unassignedCount})
                  </span>
                </button>
              );
            })()}
          </div>
        )}
      </Card>

      {/* Filter Toolbar & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Quick Filters & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks, identifier, assignee..."
              className="h-9 w-44 sm:w-60 rounded-xl border border-border/60 bg-card/60 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center rounded-xl border border-border/60 bg-card/40 p-0.5">
            {[
              { id: "all", label: "All" },
              { id: "my_tasks", label: "My Tasks" },
              { id: "urgent_high", label: "High Priority" },
              { id: "overdue", label: "Overdue" },
              { id: "done", label: "Done" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setQuickFilter(f.id as any)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                  quickFilter === f.id
                    ? "bg-indigo-600 text-white font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: View Toggle & Create Action Item */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center rounded-xl border border-border/60 bg-card/40 p-0.5">
            <button
              onClick={() => setViewMode("board")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                viewMode === "board"
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                viewMode === "list"
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
          </div>

          {/* Create CTA */}
          <Button
            onClick={() => handleOpenCreate("todo")}
            className="h-9 gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> New Action Item
          </Button>
        </div>
      </div>

      {/* Main Kanban Board View or List View */}
      {viewMode === "board" ? (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {KANBAN_COLUMNS.map((col) => {
              const colTasks = filteredTasks.filter(
                (t) => (t.status || "todo") === col.id,
              );

              return (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  tasks={colTasks}
                  availableMembers={availableMembers}
                  onAssignUser={handleAssignUser}
                  onAdd={() => handleOpenCreate(col.id)}
                  onEdit={handleOpenEdit}
                  onDelete={handleOpenDelete}
                  onView={handleOpenDetail}
                  onAdvance={handleAdvanceStatus}
                  todayStr={todayStr}
                />
              );
            })}
          </div>

          {/* Drag Overlay Preview */}
          <DragOverlay>
            {activeDragTask && (
              <div className="rotate-2 scale-105 opacity-90 shadow-2xl">
                <TaskCardItem
                  task={activeDragTask}
                  availableMembers={availableMembers}
                  onAssignUser={handleAssignUser}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onView={() => {}}
                  onAdvance={() => {}}
                  todayStr={todayStr}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        <ListView
          tasks={filteredTasks}
          availableMembers={availableMembers}
          onAssignUser={handleAssignUser}
          onAdd={() => handleOpenCreate("todo")}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onView={handleOpenDetail}
          onStatusChange={handleQuickStatusChange}
          todayStr={todayStr}
        />
      )}

      {/* Modals */}
      <TaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        mode={taskModalMode}
        taskToEdit={taskToEdit}
        defaultTeamId={selectedTeamId || undefined}
        defaultStatus={defaultModalStatus}
      />

      <DeleteTaskModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        task={taskToDelete}
      />

      <TaskDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setTaskToView(null);
        }}
        task={taskToView}
        availableMembers={availableMembers}
        onAssignUser={handleAssignUser}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onStatusChange={handleQuickStatusChange}
      />
    </div>
  );
}

/* ========================================================================= */
/* ASSIGNEE USER TOKEN MENU COMPONENT                                        */
/* ========================================================================= */

interface AssigneeUserTokenMenuProps {
  task: TaskItem | ActionItem;
  availableMembers: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
  }[];
  onAssign: (
    task: TaskItem | ActionItem,
    memberName: string | null,
    memberAvatar?: string | null,
  ) => void;
  size?: "sm" | "md";
}

function AssigneeUserTokenMenu({
  task,
  availableMembers,
  onAssign,
  size = "sm",
}: AssigneeUserTokenMenuProps) {
  const [search, setSearch] = useState("");
  const isAssigned = !!task.assignee;

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return availableMembers;
    const s = search.toLowerCase();
    return availableMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(s) || m.email.toLowerCase().includes(s),
    );
  }, [availableMembers, search]);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "group/assignee flex items-center gap-1.5 rounded-lg border transition-all cursor-pointer",
              isAssigned
                ? "border-border/60 bg-card/60 px-2 py-0.5 text-foreground hover:border-indigo-500/50 hover:bg-indigo-500/10"
                : "border-dashed border-border/70 bg-transparent px-2 py-0.5 text-muted-foreground hover:border-indigo-500/60 hover:text-indigo-400 hover:bg-indigo-500/5",
              size === "sm" ? "text-[11px]" : "text-xs px-2.5 py-1",
            )}
            title={
              isAssigned
                ? `Assigned to ${task.assignee} (Click to change)`
                : "Click to assign user token"
            }
          >
            {isAssigned ? (
              <>
                <Avatar
                  className={cn(
                    size === "sm" ? "h-4 w-4" : "h-5 w-5",
                    "shrink-0 ring-1 ring-border/50",
                  )}
                >
                  <AvatarImage src={getAvatarUrl(task.assigneeAvatar)} />
                  <AvatarFallback className="text-[8px] bg-linear-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                    {getUserInitials(task.assignee)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[90px] font-medium">
                  {task.assignee}
                </span>
                <ChevronDown className="h-2.5 w-2.5 opacity-40 group-hover/assignee:opacity-100 transition-opacity" />
              </>
            ) : (
              <>
                <UserPlus className="h-3 w-3 text-indigo-400/80" />
                <span className="font-medium text-muted-foreground/80">
                  + Assign
                </span>
              </>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-56 bg-popover/95 border-border shadow-xl backdrop-blur-md p-1.5 z-50"
        >
          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 flex items-center justify-between">
            <span>Assign User Token</span>
            <Users className="h-3 w-3 text-indigo-400" />
          </DropdownMenuLabel>

          {/* Member Search input */}
          <div className="px-1 py-1 mb-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search member..."
              className="w-full rounded-md border border-border/60 bg-muted/40 px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <DropdownMenuSeparator />

          {/* Members List */}
          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {filteredMembers.map((m) => {
              const isSelected =
                task.assignee?.toLowerCase() === m.name.toLowerCase() ||
                task.assignee?.toLowerCase() === m.email.toLowerCase();
              return (
                <DropdownMenuItem
                  key={m.id}
                  onClick={() => onAssign(task, m.name, m.avatar)}
                  className={cn(
                    "flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-xs cursor-pointer",
                    isSelected
                      ? "bg-indigo-500/15 font-semibold text-indigo-400"
                      : "hover:bg-muted",
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-5 w-5 shrink-0 ring-1 ring-border/50">
                      <AvatarImage src={getAvatarUrl(m.avatar)} />
                      <AvatarFallback className="text-[8px] bg-linear-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                        {getUserInitials(m.name, m.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="truncate">
                      <p className="truncate text-xs leading-tight">{m.name}</p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {m.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {m.role && (
                      <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-muted text-muted-foreground">
                        {m.role}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="h-3 w-3 text-indigo-400" />
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })}

            {filteredMembers.length === 0 && (
              <p className="py-2 text-center text-[11px] text-muted-foreground italic">
                No matching members
              </p>
            )}
          </div>

          {isAssigned && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onAssign(task, null, null)}
                className="gap-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer px-2 py-1.5"
              >
                <X className="h-3.5 w-3.5" /> Unassign User
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/* ========================================================================= */
/* KANBAN COLUMN COMPONENT                                                    */
/* ========================================================================= */

interface KanbanColumnProps {
  column: {
    id: TaskStatus;
    label: string;
    dotColor: string;
    border: string;
    bg: string;
    badge: string;
  };
  tasks: (TaskItem | ActionItem)[];
  availableMembers: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
  }[];
  onAssignUser: (
    task: TaskItem | ActionItem,
    memberName: string | null,
    memberAvatar?: string | null,
  ) => void;
  onAdd: () => void;
  onEdit: (task: TaskItem | ActionItem) => void;
  onDelete: (task: TaskItem | ActionItem) => void;
  onView: (task: TaskItem | ActionItem) => void;
  onAdvance: (task: TaskItem | ActionItem) => void;
  todayStr: string;
}

function KanbanColumn({
  column,
  tasks,
  availableMembers,
  onAssignUser,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onAdvance,
  todayStr,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-2xl border bg-card/40 p-3.5 backdrop-blur-md transition-colors min-h-[480px]",
        column.border,
        isOver && "ring-2 ring-indigo-500/40 bg-indigo-500/5",
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-full", column.dotColor)} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            {column.label}
          </h3>
          <Badge
            variant="outline"
            className={cn("px-1.5 py-0 text-[10px] font-mono", column.badge)}
          >
            {tasks.length}
          </Badge>
        </div>

        <button
          onClick={onAdd}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
          title={`Add task to ${column.label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Tasks List */}
      <div className="flex-1 space-y-2.5 pt-3 overflow-y-auto max-h-[calc(100vh-320px)] pr-0.5">
        {tasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            availableMembers={availableMembers}
            onAssignUser={onAssignUser}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            onAdvance={onAdvance}
            todayStr={todayStr}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-10 text-center text-xs text-muted-foreground/60">
            <span className="text-xl opacity-40">📭</span>
            <p className="mt-1 text-[11px]">No tasks in {column.label}</p>
            <button
              onClick={onAdd}
              className="mt-2 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              + Add Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ========================================================================= */
/* DRAGGABLE TASK CARD                                                       */
/* ========================================================================= */

interface DraggableCardProps {
  task: TaskItem | ActionItem;
  availableMembers: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
  }[];
  onAssignUser: (
    task: TaskItem | ActionItem,
    memberName: string | null,
    memberAvatar?: string | null,
  ) => void;
  onEdit: (task: TaskItem | ActionItem) => void;
  onDelete: (task: TaskItem | ActionItem) => void;
  onView: (task: TaskItem | ActionItem) => void;
  onAdvance: (task: TaskItem | ActionItem) => void;
  todayStr: string;
}

function DraggableTaskCard(props: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: props.task.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn("touch-none", isDragging && "opacity-40")}
    >
      <TaskCardItem {...props} />
    </div>
  );
}

function TaskCardItem({
  task,
  availableMembers,
  onAssignUser,
  onEdit,
  onDelete,
  onView,
  onAdvance,
  todayStr,
}: DraggableCardProps) {
  const teamTheme = getTeamTheme(task.teamKey || task.teamId || "TASK");
  const pMeta =
    PRIORITY_META[task.priority || "medium"] || PRIORITY_META.medium;
  const PriorityIcon = pMeta.icon;

  const isDone = task.status === "done" || task.status === "completed";
  const isOverdue = task.dueDate && task.dueDate < todayStr && !isDone;
  const isDueToday = task.dueDate === todayStr && !isDone;

  return (
    <div
      onClick={() => onView(task)}
      className={cn(
        "group relative rounded-xl border bg-card/85 p-3.5 shadow-sm transition-all hover:border-indigo-500/40 hover:shadow-md cursor-pointer border-white/10",
        isDone && "opacity-75 bg-card/40",
      )}
    >
      {/* Top Meta Line: Identifier + Priority + Menu */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-mono text-[11px] font-bold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/40 shrink-0">
            {task.identifier || `TASK-${task.id.slice(-4).toUpperCase()}`}
          </span>

          {task.teamName && (
            <span
              className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded border truncate max-w-[110px]",
                teamTheme.badgeText,
                teamTheme.badgeBorder,
                teamTheme.subtleBg,
              )}
            >
              {task.teamName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Priority Pill */}
          <span
            className={cn(
              "flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold",
              pMeta.badge,
            )}
          >
            <PriorityIcon
              className={cn(
                "h-3 w-3",
                pMeta.color,
                task.priority === "urgent" && "animate-pulse",
              )}
            />
            {pMeta.label}
          </span>

          {/* Quick Actions Dropdown */}
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer opacity-60 group-hover:opacity-100">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-36 bg-popover/95 border-border"
              >
                <DropdownMenuItem
                  onClick={() => onView(task)}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onEdit(task)}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onAdvance(task)}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5" /> Advance Stage
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(task)}
                  className="gap-2 text-xs text-rose-500 hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Task Title */}
      <h4
        className={cn(
          "text-xs font-semibold leading-snug text-foreground line-clamp-2",
          isDone && "line-through text-muted-foreground",
        )}
      >
        {task.title}
      </h4>

      {/* Description Snippet */}
      {task.description && (
        <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Bottom Row: Assignee User Token + Due Date + 1-Click Advance Button */}
      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[11px]">
        {/* Interactive Assignee User Token */}
        <AssigneeUserTokenMenu
          task={task}
          availableMembers={availableMembers}
          onAssign={onAssignUser}
          size="sm"
        />

        {/* Due Date & Quick Advance */}
        <div className="flex items-center gap-1.5 shrink-0">
          {task.dueDate && (
            <span
              className={cn(
                "flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono",
                isOverdue
                  ? "bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40"
                  : isDueToday
                    ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40"
                    : "bg-muted/40 text-muted-foreground",
              )}
            >
              <Calendar className="h-2.5 w-2.5" />
              {task.dueDate}
            </span>
          )}

          {/* Advance status 1-click button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdvance(task);
            }}
            title={isDone ? "Reopen task" : "Advance to next stage"}
            className={cn(
              "rounded-md p-1 transition-colors cursor-pointer",
              isDone
                ? "text-emerald-400 hover:bg-emerald-500/20"
                : "text-muted-foreground hover:bg-indigo-500/20 hover:text-indigo-300",
            )}
          >
            {isDone ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* LIST / DATA TABLE VIEW                                                    */
/* ========================================================================= */

interface ListViewProps {
  tasks: (TaskItem | ActionItem)[];
  availableMembers: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
  }[];
  onAssignUser: (
    task: TaskItem | ActionItem,
    memberName: string | null,
    memberAvatar?: string | null,
  ) => void;
  onAdd: () => void;
  onEdit: (task: TaskItem | ActionItem) => void;
  onDelete: (task: TaskItem | ActionItem) => void;
  onView: (task: TaskItem | ActionItem) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  todayStr: string;
}

function ListView({
  tasks,
  availableMembers,
  onAssignUser,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
  todayStr,
}: ListViewProps) {
  return (
    <Card className="overflow-hidden border-white/10 bg-card/50 backdrop-blur-xl shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="py-3 pl-4 pr-2 w-10">Done</th>
              <th className="py-3 px-3 w-28">Identifier</th>
              <th className="py-3 px-3 min-w-[220px]">Task Title</th>
              <th className="py-3 px-3 w-28">Team</th>
              <th className="py-3 px-3 w-32">Priority</th>
              <th className="py-3 px-3 w-36">Status</th>
              <th className="py-3 px-3 w-44">Assignee Token</th>
              <th className="py-3 px-3 w-32">Due Date</th>
              <th className="py-3 pl-3 pr-4 text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tasks.map((task) => {
              const isDone =
                task.status === "done" || task.status === "completed";
              const isOverdue =
                task.dueDate && task.dueDate < todayStr && !isDone;
              const teamTheme = getTeamTheme(
                task.teamKey || task.teamId || "TASK",
              );
              const pMeta =
                PRIORITY_META[task.priority || "medium"] ||
                PRIORITY_META.medium;
              const PriorityIcon = pMeta.icon;

              return (
                <tr
                  key={task.id}
                  onClick={() => onView(task)}
                  className={cn(
                    "group transition-colors hover:bg-muted/30 cursor-pointer",
                    isDone && "opacity-60 bg-muted/10",
                  )}
                >
                  {/* Done Checkbox */}
                  <td
                    className="py-3 pl-4 pr-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() =>
                        onStatusChange(task.id, isDone ? "todo" : "done")
                      }
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border transition-colors cursor-pointer",
                        isDone
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-border hover:border-indigo-500",
                      )}
                    >
                      {isDone && <Check className="h-3 w-3 stroke-[3]" />}
                    </button>
                  </td>

                  {/* Identifier */}
                  <td className="py-3 px-3 font-mono font-bold text-muted-foreground">
                    {task.identifier ||
                      `TASK-${task.id.slice(-4).toUpperCase()}`}
                  </td>

                  {/* Title & Description */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-foreground truncate max-w-md">
                      <span
                        className={cn(
                          isDone && "line-through text-muted-foreground",
                        )}
                      >
                        {task.title}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-[11px] text-muted-foreground truncate max-w-md mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </td>

                  {/* Team */}
                  <td className="py-3 px-3">
                    {task.teamName ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] truncate max-w-[100px]",
                          teamTheme.badgeText,
                          teamTheme.badgeBorder,
                          teamTheme.subtleBg,
                        )}
                      >
                        {task.teamName}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground/60">—</span>
                    )}
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold",
                        pMeta.badge,
                      )}
                    >
                      <PriorityIcon className={cn("h-3 w-3", pMeta.color)} />
                      {pMeta.label}
                    </span>
                  </td>

                  {/* Status Dropdown */}
                  <td
                    className="py-3 px-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-card/60 px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted cursor-pointer capitalize">
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              task.status === "backlog"
                                ? "bg-slate-400"
                                : task.status === "todo"
                                  ? "bg-sky-400"
                                  : task.status === "in_progress"
                                    ? "bg-amber-400"
                                    : "bg-emerald-400",
                            )}
                          />
                          {task.status?.replace("_", " ")}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-popover border-border">
                        {KANBAN_COLUMNS.map((col) => (
                          <DropdownMenuItem
                            key={col.id}
                            onClick={() => onStatusChange(task.id, col.id)}
                            className="gap-2 text-xs cursor-pointer capitalize"
                          >
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                col.dotColor,
                              )}
                            />
                            {col.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>

                  {/* Interactive Assignee User Token */}
                  <td className="py-3 px-3">
                    <AssigneeUserTokenMenu
                      task={task}
                      availableMembers={availableMembers}
                      onAssign={onAssignUser}
                      size="sm"
                    />
                  </td>

                  {/* Due Date */}
                  <td className="py-3 px-3">
                    {task.dueDate ? (
                      <span
                        className={cn(
                          "font-mono text-[11px]",
                          isOverdue
                            ? "text-rose-400 font-bold"
                            : "text-muted-foreground",
                        )}
                      >
                        {task.dueDate}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td
                    className="py-3 pl-3 pr-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(task)}
                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(task)}
                        className="rounded p-1 text-muted-foreground hover:bg-rose-500/20 hover:text-rose-400 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {tasks.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="py-12 text-center text-xs text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CheckSquare className="h-8 w-8 text-muted-foreground/40" />
                    <p className="font-semibold text-foreground">
                      No tasks found
                    </p>
                    <p className="text-[11px]">
                      Create your first team action item to get started
                    </p>
                    <Button
                      onClick={onAdd}
                      size="sm"
                      className="mt-2 gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Action Item
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

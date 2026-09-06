"use client";

import { useState, useMemo, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Clock,
  Loader2,
  Plus,
  User,
  Calendar,
  Flame,
  ArrowUp,
  Minus,
  Circle,
  LayoutGrid,
  List,
  Search,
  Filter,
  Building2,
  Users,
  MoreHorizontal,
  CheckCircle2,
  ChevronRight,
  X,
  AlertTriangle,
  TrendingUp,
  Edit3,
  Trash2,
  Sparkles,
  Layers,
  Check,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  useGetTasksByWorkspaceQuery,
  useGetTaskStatsQuery,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
  type TaskItem,
} from "@/lib/redux/api/taskApiSlice";
import {
  addTask,
  updateTaskStatus,
  deleteTask,
  updateTask,
} from "@/lib/redux/dataSlice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn, getAvatarUrl, getUserInitials } from "@/lib/utils";
import { getTeamTheme } from "@/lib/team-theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskModal } from "@/components/modals/task-modal";
import { DeleteTaskModal } from "@/components/modals/delete-task-modal";
import { TaskDetailModal } from "@/components/modals/task-detail-modal";
import type { ActionItem, PriorityLevel, TaskStatus } from "@/types";

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
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(activeTeamId);

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
    [currentTeam]
  );

  // Queries
  const { data: tasksRes, isLoading: isLoadingTasks } = useGetTasksByWorkspaceQuery(
    {
      workspaceId: activeWorkspace?.id || "",
      params: { teamId: selectedTeamId || undefined },
    },
    { skip: !activeWorkspace?.id }
  );

  const { data: statsRes } = useGetTaskStatsQuery(
    {
      teamId: selectedTeamId || undefined,
      workspaceId: !selectedTeamId ? activeWorkspace?.id : undefined,
    },
    { skip: !activeWorkspace?.id }
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

  // View & Filter State
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<
    "all" | "my_tasks" | "urgent_high" | "overdue" | "done"
  >("all");

  // Drag & Drop State
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  // Modals State
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState<"create" | "edit">("create");
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | ActionItem | null>(null);
  const [defaultModalStatus, setDefaultModalStatus] = useState<TaskStatus>("todo");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | ActionItem | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [taskToView, setTaskToView] = useState<TaskItem | ActionItem | null>(null);

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

      // Quick Filter
      if (quickFilter === "my_tasks") {
        const userName = user?.name?.toLowerCase() || "";
        const userEmail = user?.email?.toLowerCase() || "";
        const assignee = (t.assignee || "").toLowerCase();
        return assignee && (assignee.includes(userName) || assignee.includes(userEmail));
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
  }, [tasks, search, quickFilter, user, todayStr]);

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

      if (t.dueDate && t.dueDate < todayStr && s !== "done" && s !== "completed") {
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

      toast.success(
        `Moved to ${targetStatus.replace("_", " ").toUpperCase()}`
      );
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to update status");
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

  const activeDragTask = tasks.find((t) => t.id === activeDragId) || null;

  return (
    <div className="space-y-4">
      {/* Dynamic Team Header & Health Metric Cards */}
      <Card className="relative overflow-hidden border-white/10 bg-gradient-to-r from-card/95 via-card/75 to-background/60 p-5 backdrop-blur-xl shadow-lg">
        {/* Dynamic ambient glow matching team theme */}
        <div
          className={cn(
            "pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-3xl opacity-35",
            teamTheme.glow
          )}
        />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left Title & Team Switcher */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl shadow-inner ring-1 ring-white/10",
                teamTheme.subtleBg,
                teamTheme.badgeBorder,
                teamTheme.badgeText
              )}
            >
              {currentTeam?.icon || "⚡"}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  {currentTeam ? currentTeam.name : "Workspace Action Items"}
                </h1>
                {currentTeam ? (
                  <Badge
                    variant="outline"
                    className={cn("font-mono text-xs font-semibold uppercase tracking-wider", teamTheme.badgeText, teamTheme.badgeBorder, teamTheme.subtleBg)}
                  >
                    {currentTeam.key}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-400 border-indigo-500/30">
                    All Workspace Teams
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {activeWorkspace?.name} · Enterprise Linear-Style Issue & Action Item Tracking
              </p>
            </div>
          </div>

          {/* Right Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            {/* Total */}
            <div className="rounded-xl border border-white/10 bg-card/60 px-3 py-2 text-left">
              <span className="text-[10px] text-muted-foreground block font-medium">Total Tasks</span>
              <span className="text-base font-bold text-foreground">{stats.total}</span>
            </div>

            {/* In Progress */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-left">
              <span className="text-[10px] text-amber-300 block font-medium">In Progress</span>
              <span className="text-base font-bold text-amber-400">{stats.inProgress}</span>
            </div>

            {/* Done Rate */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-300 block font-medium">Done</span>
                <span className="text-[10px] text-emerald-400 font-bold">{stats.completionRate}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-emerald-950/40">
                <div
                  className="h-full bg-emerald-400 transition-all duration-500 rounded-full"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>

            {/* Overdue */}
            <div
              className={cn(
                "rounded-xl border px-3 py-2 text-left transition-colors",
                stats.overdue > 0
                  ? "border-rose-500/30 bg-rose-500/15"
                  : "border-white/10 bg-card/60"
              )}
            >
              <span className="text-[10px] text-rose-300 block font-medium flex items-center gap-1">
                {stats.overdue > 0 && <AlertTriangle className="h-3 w-3 text-rose-400 animate-pulse" />}
                Overdue
              </span>
              <span className={cn("text-base font-bold", stats.overdue > 0 ? "text-rose-400" : "text-muted-foreground")}>
                {stats.overdue}
              </span>
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
                  : "border-border/60 bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span>🌐</span>
              <span>All Teams</span>
              <span className="text-[10px] opacity-80">({reduxTasks.length})</span>
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
                      ? cn("border-transparent font-bold text-white shadow-sm bg-gradient-to-r", theme.gradient)
                      : "border-border/60 bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span>{t.icon || "👥"}</span>
                  <span>{t.name}</span>
                  <span className="text-[10px] font-mono opacity-80">({t.key})</span>
                </button>
              );
            })}
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
                    : "text-muted-foreground hover:text-foreground"
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
                  : "text-muted-foreground hover:text-foreground"
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
                  : "text-muted-foreground hover:text-foreground"
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
                (t) => (t.status || "todo") === col.id
              );

              return (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  tasks={colTasks}
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
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onStatusChange={handleQuickStatusChange}
      />
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
        isOver && "ring-2 ring-indigo-500/40 bg-indigo-500/5"
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
  onEdit,
  onDelete,
  onView,
  onAdvance,
  todayStr,
}: DraggableCardProps) {
  const teamTheme = getTeamTheme(task.teamKey || task.teamId || "TASK");
  const pMeta = PRIORITY_META[task.priority || "medium"] || PRIORITY_META.medium;
  const PriorityIcon = pMeta.icon;

  const isDone = task.status === "done" || task.status === "completed";
  const isOverdue =
    task.dueDate && task.dueDate < todayStr && !isDone;
  const isDueToday = task.dueDate === todayStr && !isDone;

  return (
    <div
      onClick={() => onView(task)}
      className={cn(
        "group relative rounded-xl border bg-card/85 p-3.5 shadow-sm transition-all hover:border-indigo-500/40 hover:shadow-md cursor-pointer border-white/10",
        isDone && "opacity-75 bg-card/40"
      )}
    >
      {/* Top Meta Line: Identifier + Priority + Menu */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-mono text-[11px] font-bold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/40 shrink-0">
            {task.identifier || `TASK-${task.id.slice(-4).toUpperCase()}`}
          </span>

          {task.teamName && (
            <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded border truncate max-w-[110px]", teamTheme.badgeText, teamTheme.badgeBorder, teamTheme.subtleBg)}>
              {task.teamName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Priority Pill */}
          <span
            className={cn(
              "flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold",
              pMeta.badge
            )}
          >
            <PriorityIcon className={cn("h-3 w-3", pMeta.color, task.priority === "urgent" && "animate-pulse")} />
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
              <DropdownMenuContent align="end" className="w-36 bg-popover/95 border-border">
                <DropdownMenuItem onClick={() => onView(task)} className="gap-2 text-xs cursor-pointer">
                  <Sparkles className="h-3.5 w-3.5" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(task)} className="gap-2 text-xs cursor-pointer">
                  <Edit3 className="h-3.5 w-3.5" /> Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAdvance(task)} className="gap-2 text-xs cursor-pointer">
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
          isDone && "line-through text-muted-foreground"
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

      {/* Bottom Row: Assignee + Due Date + 1-Click Advance Button */}
      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[11px]">
        {/* Assignee */}
        <div className="flex items-center gap-1.5 min-w-0">
          {task.assignee ? (
            <>
              <Avatar className="h-4 w-4 shrink-0">
                <AvatarImage src={getAvatarUrl(task.assigneeAvatar)} />
                <AvatarFallback className="text-[8px]">
                  {getUserInitials(task.assignee)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-muted-foreground max-w-[90px]">
                {task.assignee}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground/60 italic text-[10px]">
              Unassigned
            </span>
          )}
        </div>

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
                  : "bg-muted/40 text-muted-foreground"
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
                : "text-muted-foreground hover:bg-indigo-500/20 hover:text-indigo-300"
            )}
          >
            {isDone ? <Check className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
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
  onAdd: () => void;
  onEdit: (task: TaskItem | ActionItem) => void;
  onDelete: (task: TaskItem | ActionItem) => void;
  onView: (task: TaskItem | ActionItem) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  todayStr: string;
}

function ListView({
  tasks,
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
              <th className="py-3 px-3 w-36">Assignee</th>
              <th className="py-3 px-3 w-32">Due Date</th>
              <th className="py-3 pl-3 pr-4 text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tasks.map((task) => {
              const isDone = task.status === "done" || task.status === "completed";
              const isOverdue =
                task.dueDate && task.dueDate < todayStr && !isDone;
              const teamTheme = getTeamTheme(task.teamKey || task.teamId || "TASK");
              const pMeta =
                PRIORITY_META[task.priority || "medium"] || PRIORITY_META.medium;
              const PriorityIcon = pMeta.icon;

              return (
                <tr
                  key={task.id}
                  onClick={() => onView(task)}
                  className={cn(
                    "group transition-colors hover:bg-muted/30 cursor-pointer",
                    isDone && "opacity-60 bg-muted/10"
                  )}
                >
                  {/* Done Checkbox */}
                  <td className="py-3 pl-4 pr-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onStatusChange(task.id, isDone ? "todo" : "done")}
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border transition-colors cursor-pointer",
                        isDone
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-border hover:border-indigo-500"
                      )}
                    >
                      {isDone && <Check className="h-3 w-3 stroke-[3]" />}
                    </button>
                  </td>

                  {/* Identifier */}
                  <td className="py-3 px-3 font-mono font-bold text-muted-foreground">
                    {task.identifier || `TASK-${task.id.slice(-4).toUpperCase()}`}
                  </td>

                  {/* Title & Description */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-foreground truncate max-w-md">
                      <span className={cn(isDone && "line-through text-muted-foreground")}>
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
                        className={cn("text-[10px] truncate max-w-[100px]", teamTheme.badgeText, teamTheme.badgeBorder, teamTheme.subtleBg)}
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
                        pMeta.badge
                      )}
                    >
                      <PriorityIcon className={cn("h-3 w-3", pMeta.color)} />
                      {pMeta.label}
                    </span>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
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
                                : "bg-emerald-400"
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
                            <span className={cn("h-2 w-2 rounded-full", col.dotColor)} />
                            {col.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>

                  {/* Assignee */}
                  <td className="py-3 px-3">
                    {task.assignee ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={getAvatarUrl(task.assigneeAvatar)} />
                          <AvatarFallback className="text-[8px]">
                            {getUserInitials(task.assignee)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate max-w-[100px] text-foreground font-medium">
                          {task.assignee}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/60 italic text-[11px]">Unassigned</span>
                    )}
                  </td>

                  {/* Due Date */}
                  <td className="py-3 px-3">
                    {task.dueDate ? (
                      <span
                        className={cn(
                          "font-mono text-[11px]",
                          isOverdue ? "text-rose-400 font-bold" : "text-muted-foreground"
                        )}
                      >
                        {task.dueDate}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 pl-3 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
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
                <td colSpan={9} className="py-12 text-center text-xs text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CheckSquare className="h-8 w-8 text-muted-foreground/40" />
                    <p className="font-semibold text-foreground">No tasks found</p>
                    <p className="text-[11px]">Create your first team action item to get started</p>
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

"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  addTask,
  updateTaskStatus,
  deleteTask,
  updateTask,
} from "@/lib/redux/dataSlice";
import { setView, pushNotification } from "@/lib/redux/appSlice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/app/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActionItemContextMenu } from "@/components/shared/action-context-menu";
import type { ActionItem, PriorityLevel, TaskStatus } from "@/types";

// Linear-style Columns
const LINEAR_COLUMNS: {
  id: TaskStatus;
  label: string;
  color: string;
  border: string;
  bg: string;
}[] = [
  {
    id: "backlog",
    label: "Backlog",
    color: "text-slate-400",
    border: "border-slate-500/30",
    bg: "bg-slate-500/10",
  },
  {
    id: "todo",
    label: "To Do",
    color: "text-sky-400",
    border: "border-sky-500/30",
    bg: "bg-sky-500/10",
  },
  {
    id: "in_progress",
    label: "In Progress",
    color: "text-amber-400",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
  },
  {
    id: "done",
    label: "Done",
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
  },
];

const PRIORITY_META: Record<
  PriorityLevel,
  { label: string; icon: typeof Flame; style: string }
> = {
  urgent: {
    label: "Urgent",
    icon: Flame,
    style: "bg-rose-500/20 text-rose-400 border-rose-500/40",
  },
  high: {
    label: "High",
    icon: ArrowUp,
    style: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  },
  medium: {
    label: "Medium",
    icon: Minus,
    style: "bg-indigo-500/20 text-indigo-400 border-indigo-500/40",
  },
  low: {
    label: "Low",
    icon: Circle,
    style: "bg-slate-500/20 text-slate-400 border-slate-500/40",
  },
};

export function ActionItemsView() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((s) => s.data.tasks);
  const workspaces = useAppSelector((s) => s.data.workspaces);
  const activeWorkspaceId = useAppSelector((s) => s.data.activeWorkspaceId);
  const activeTeamId = useAppSelector((s) => s.data.activeTeamId);

  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const teams = activeWorkspace?.teams || [];

  // UI state
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(
    activeTeamId,
  );
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  // Filter tasks by active workspace and team
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchWs = !t.workspaceId || t.workspaceId === activeWorkspaceId;
      const matchTeam = !selectedTeamId || t.teamId === selectedTeamId;
      const matchSearch =
        !search.trim() ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.identifier?.toLowerCase().includes(search.toLowerCase()) ||
        t.assignee?.toLowerCase().includes(search.toLowerCase());
      return matchWs && matchTeam && matchSearch;
    });
  }, [tasks, activeWorkspaceId, selectedTeamId, search]);

  const activeTask = tasks.find((t) => t.id === activeId) ?? null;

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const over = e.over;
    if (!over) return;
    const targetStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t.id === e.active.id);
    if (task && task.status !== targetStatus) {
      dispatch(updateTaskStatus({ id: task.id, status: targetStatus }));
      toast.success(
        `Task status updated to ${targetStatus.replace("_", " ").toUpperCase()}`,
      );
    }
  }

  return (
    <div className="space-y-5">
      {/* Top Header Controls (Linear Style) */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-background/60 p-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        {/* Left: Title & Team Filter Pills */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <CheckSquare className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Team Action Items
              </h2>
              <p className="text-xs text-muted-foreground">
                Workspace:{" "}
                <span className="font-semibold text-foreground">
                  {activeWorkspace?.name}
                </span>
              </p>
            </div>
          </div>

          {/* Team Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              onClick={() => setSelectedTeamId(null)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                selectedTeamId === null
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span>🌐</span> All Teams ({tasks.length})
            </button>
            {teams.map((t) => {
              const teamCount = tasks.filter((x) => x.teamId === t.id).length;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTeamId(t.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                    selectedTeamId === t.id
                      ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span>{t.icon || "💻"}</span>
                  <span>{t.name}</span>
                  <span className="font-mono text-[10px] opacity-70">
                    ({teamCount})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Controls: Search, View Switcher & Create Task */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter issue title, assignee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-44 rounded-xl border border-border/60 bg-background/50 pl-8 pr-3 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 md:w-56"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center rounded-xl border border-border/60 bg-background/40 p-0.5">
            <button
              onClick={() => setViewMode("board")}
              className={cn(
                "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
                viewMode === "board"
                  ? "bg-muted text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
                viewMode === "list"
                  ? "bg-muted text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
          </div>

          <Button
            onClick={() => setCreateModalOpen(true)}
            className="h-9 gap-1.5 rounded-xl  from-indigo-500 to-violet-600 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20"
          >
            <Plus className="h-4 w-4" /> New Action Item
          </Button>
        </div>
      </div>

      {/* Board vs List View */}
      {viewMode === "board" ? (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid gap-4 md:grid-cols-4">
            {LINEAR_COLUMNS.map((col) => {
              const colTasks = filteredTasks.filter(
                (t) =>
                  t.status === col.id ||
                  (col.id === "todo" && t.status === "pending") ||
                  (col.id === "done" && t.status === "completed"),
              );
              return (
                <LinearColumn
                  key={col.id}
                  col={col}
                  tasks={colTasks}
                  onDelete={(id) => {
                    dispatch(deleteTask(id));
                    toast.success("Action item deleted");
                  }}
                  onStatusChange={(id, status) => {
                    dispatch(updateTaskStatus({ id, status }));
                  }}
                />
              );
            })}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-2 opacity-90">
                <LinearTaskCard task={activeTask} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <LinearListView
          tasks={filteredTasks}
          onDelete={(id) => dispatch(deleteTask(id))}
          onStatusChange={(id, status) =>
            dispatch(updateTaskStatus({ id, status }))
          }
        />
      )}

      {/* Create Action Item Modal */}
      <CreateTaskModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        teams={teams}
        activeWorkspaceId={activeWorkspaceId}
      />
    </div>
  );
}

function LinearColumn({
  col,
  tasks,
  onDelete,
  onStatusChange,
}: {
  col: (typeof LINEAR_COLUMNS)[number];
  tasks: ActionItem[];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span
            className={cn("h-2.5 w-2.5 rounded-full", col.bg, col.border)}
          />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {col.label}
          </h3>
          <span className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
            {tasks.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[460px] space-y-2.5 rounded-2xl border p-2.5 transition-colors",
          isOver
            ? "border-indigo-500 bg-indigo-500/5"
            : "border-white/5 bg-background/30 backdrop-blur-md",
        )}
      >
        {tasks.length === 0 ? (
          <div className="flex h-36 flex-col items-center justify-center text-center text-xs text-muted-foreground/50 border border-dashed border-white/10 rounded-xl">
            No items in {col.label}
          </div>
        ) : (
          tasks.map((task) => (
            <DraggableLinearTaskCard
              key={task.id}
              task={task}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
}

function DraggableLinearTaskCard({
  task,
  onDelete,
  onStatusChange,
}: {
  task: ActionItem;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-30",
      )}
    >
      <LinearTaskCard
        task={task}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
      />
    </div>
  );
}

function LinearTaskCard({
  task,
  onDelete,
  onStatusChange,
}: {
  task: ActionItem;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: TaskStatus) => void;
}) {
  const PriorityMeta = PRIORITY_META[task.priority] || PRIORITY_META.medium;
  const PriorityIcon = PriorityMeta.icon;
  const iconColor =
    PriorityMeta.style.match(/text-\w+-\d+/)?.[0] || "text-foreground";

  return (
    <ActionItemContextMenu>
      <Card className="group relative flex flex-col gap-3 rounded-[14px] border bg-[#eeeefa] p-4 shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-[#e8e8ef] hover:shadow-md hover:shadow-black/20">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <PriorityIcon className={cn("h-4 w-4", iconColor)} />
            <span className="font-mono text-[11px] font-medium tracking-wide text-muted-foreground/60 transition-colors group-hover:text-muted-foreground/90">
              {task.identifier || "ACT-100"}
            </span>
          </div>

          {onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-md p-1.5 text-muted-foreground/40 opacity-0 transition-all hover:bg-white/10 hover:text-foreground group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-44 border-white/10 bg-[#1C1C1E]/95 backdrop-blur-xl"
              >
                <DropdownMenuItem
                  className="cursor-pointer py-2 text-[13px] font-medium focus:bg-indigo-500/20 focus:text-indigo-400"
                  onClick={() => onStatusChange?.(task.id, "todo")}
                >
                  Mark To Do
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer py-2 text-[13px] font-medium focus:bg-indigo-500/20 focus:text-indigo-400"
                  onClick={() => onStatusChange?.(task.id, "in_progress")}
                >
                  Mark In Progress
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer py-2 text-[13px] font-medium focus:bg-indigo-500/20 focus:text-indigo-400"
                  onClick={() => onStatusChange?.(task.id, "done")}
                >
                  Mark Done
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer py-2 text-[13px] font-medium text-rose-400 focus:bg-rose-500/20 focus:text-rose-400"
                  onClick={() => onDelete(task.id)}
                >
                  Delete Issue
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex-1 space-y-1.5">
          <p className="text-[14px] font-medium leading-snug text-slate-200">
            {task.title}
          </p>
          {task.description && (
            <p className="line-clamp-2 text-[12px] leading-relaxed text-muted-foreground/70">
              {task.description}
            </p>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "px-2 py-0.5 text-[10.5px] font-medium tracking-wide transition-colors border-white/5 bg-white/[0.02]",
                PriorityMeta.style,
              )}
            >
              {PriorityMeta.label}
            </Badge>
            {task.teamName && (
              <Badge
                variant="outline"
                className="px-2 py-0.5 text-[10.5px] font-medium tracking-wide text-muted-foreground transition-colors border-white/5 bg-white/[0.02]"
              >
                {task.teamName}
              </Badge>
            )}
          </div>

          {task.assignee && (
            <div
              className="flex shrink-0 items-center transition-transform hover:scale-105"
              title={`Assigned to ${task.assignee}`}
            >
              <Avatar className="h-6 w-6 border border-white/10 ring-2 ring-transparent transition-all hover:ring-white/20">
                <AvatarImage src={task.assigneeAvatar} />
                <AvatarFallback className="bg-gradient-lr from-indigo-500/20 to-purple-500/20 text-[10px] font-medium text-indigo-300">
                  {task.assignee.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </Card>
    </ActionItemContextMenu>
  );
}

function LinearListView({
  tasks,
  onDelete,
  onStatusChange,
}: {
  tasks: ActionItem[];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 p-8 text-center text-xs text-muted-foreground">
        No action items match the active team filter.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-background/40 backdrop-blur-xl">
      <div className="grid grid-cols-12 items-center border-b border-white/10 px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <div className="col-span-2">Identifier</div>
        <div className="col-span-5">Title</div>
        <div className="col-span-2">Priority</div>
        <div className="col-span-2">Assignee</div>
        <div className="col-span-1 text-right">Status</div>
      </div>

      <div className="divide-y divide-white/5">
        {tasks.map((task) => {
          const PriorityMeta =
            PRIORITY_META[task.priority] || PRIORITY_META.medium;
          const PriorityIcon = PriorityMeta.icon;

          return (
            <div
              key={task.id}
              className="grid grid-cols-12 items-center px-4 py-3 text-xs hover:bg-white/5"
            >
              <div className="col-span-2 font-mono font-bold text-indigo-400">
                {task.identifier || "ENG-100"}
              </div>
              <div className="col-span-5 truncate font-medium text-foreground">
                {task.title}
              </div>
              <div className="col-span-2">
                <Badge
                  variant="outline"
                  className={cn("gap-1 text-[9px]", PriorityMeta.style)}
                >
                  <PriorityIcon className="h-2.5 w-2.5" /> {PriorityMeta.label}
                </Badge>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                {task.assignee ? (
                  <>
                    <Avatar className="h-5 w-5 border border-white/20">
                      <AvatarImage src={task.assigneeAvatar} />
                      <AvatarFallback className="bg-indigo-500/20 text-[9px] font-bold text-indigo-300">
                        {task.assignee.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-muted-foreground">
                      {task.assignee}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground/50">Unassigned</span>
                )}
              </div>
              <div className="col-span-1 text-right">
                <Badge variant="secondary" className="capitalize text-[10px]">
                  {task.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CreateTaskModal({
  open,
  onClose,
  teams,
  activeWorkspaceId,
}: {
  open: boolean;
  onClose: () => void;
  teams: any[];
  activeWorkspaceId: string;
}) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teamId, setTeamId] = useState(teams[0]?.id || "");
  const [priority, setPriority] = useState<PriorityLevel>("high");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [assignee, setAssignee] = useState("");

  if (!open) return null;

  const activeTeam = teams.find((t) => t.id === teamId) || teams[0];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }

    const key = activeTeam?.key || "ACT";
    const randomNum = Math.floor(100 + Math.random() * 900);
    const identifier = `${key}-${randomNum}`;

    dispatch(
      addTask({
        id: `task-${Date.now()}`,
        identifier,
        workspaceId: activeWorkspaceId,
        teamId: activeTeam?.id,
        teamName: activeTeam?.name,
        title: title.trim(),
        description: description.trim() || undefined,
        assignee: assignee.trim() || undefined,
        priority,
        status,
        createdAt: new Date().toISOString(),
      }),
    );

    dispatch(
      pushNotification({
        title: "Action Item Created",
        description: `Created issue ${identifier} "${title.trim()}".`,
        type: "success",
      }),
    );

    toast.success(`Issue ${identifier} created!`);
    setTitle("");
    setDescription("");
    onClose();
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-background/95 p-6 shadow-2xl backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold">New Linear Action Item</h2>
                <p className="text-xs text-muted-foreground">
                  Assign to team & priority level
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Issue Title *
              </label>
              <input
                type="text"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2 text-sm outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </label>
              <textarea
                placeholder="Add context or acceptance criteria..."
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Team Assignment
                </label>
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-xs outline-none focus:border-indigo-500"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.icon || "💻"} {t.name} ({t.key})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Assignee
                </label>
                <input
                  type="text"
                  placeholder="e.g. David Chen"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-xs outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-xs outline-none focus:border-indigo-500"
                >
                  <option value="urgent">🔥 Urgent</option>
                  <option value="high">⬆️ High</option>
                  <option value="medium">➖ Medium</option>
                  <option value="low">🔵 Low</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status Column
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-xs outline-none focus:border-indigo-500"
                >
                  <option value="backlog">Backlog</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gap-2 rounded-xl  from-indigo-500 to-violet-600 text-white shadow-lg"
              >
                <Plus className="h-4 w-4" /> Create Issue
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  X,
  Edit3,
  Trash2,
  Calendar,
  User,
  Clock,
  Layers,
  Flame,
  ArrowUp,
  Minus,
  Circle,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTeamTheme } from "@/lib/team-theme";
import { cn, getAvatarUrl, getUserInitials } from "@/lib/utils";
import type { TaskItem } from "@/lib/redux/api/taskApiSlice";
import type { ActionItem, PriorityLevel, TaskStatus } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  task: TaskItem | ActionItem | null;
  availableMembers?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
  }[];
  onAssignUser?: (
    task: TaskItem | ActionItem,
    memberName: string | null,
    memberAvatar?: string | null,
  ) => void;
  onEdit: (task: TaskItem | ActionItem) => void;
  onDelete: (task: TaskItem | ActionItem) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

const PRIORITY_META: Record<
  PriorityLevel,
  { label: string; icon: typeof Flame; color: string; badge: string }
> = {
  urgent: {
    label: "Urgent (P0)",
    icon: Flame,
    color: "text-rose-400",
    badge: "border-rose-500/40 bg-rose-500/15 text-rose-300",
  },
  high: {
    label: "High (P1)",
    icon: ArrowUp,
    color: "text-amber-400",
    badge: "border-amber-500/40 bg-amber-500/15 text-amber-300",
  },
  medium: {
    label: "Medium (P2)",
    icon: Minus,
    color: "text-indigo-400",
    badge: "border-indigo-500/40 bg-indigo-500/15 text-indigo-300",
  },
  low: {
    label: "Low (P3)",
    icon: Circle,
    color: "text-slate-400",
    badge: "border-slate-500/40 bg-slate-500/15 text-slate-300",
  },
};

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check, UserPlus } from "lucide-react";

export function TaskDetailModal({
  open,
  onClose,
  task,
  availableMembers = [],
  onAssignUser,
  onEdit,
  onDelete,
  onStatusChange,
}: Props) {
  if (!open || !task) return null;

  const teamTheme = getTeamTheme(task.teamKey || task.teamId || "TASK");
  const pMeta =
    PRIORITY_META[task.priority || "medium"] || PRIORITY_META.medium;
  const PriorityIcon = pMeta.icon;

  const now = new Date().toISOString().split("T")[0];
  const isOverdue =
    task.dueDate &&
    task.dueDate < now &&
    task.status !== "done" &&
    task.status !== "completed";

  const isDone = task.status === "done" || task.status === "completed";

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
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-background/95 p-6 shadow-2xl backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-border/40 pb-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-lg border border-border/40">
                {task.identifier || `TASK-${task.id.slice(-4).toUpperCase()}`}
              </span>
              {task.teamName && (
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
                  {task.teamName}
                </Badge>
              )}
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="py-4 space-y-4">
            <div>
              <h3
                className={cn(
                  "text-lg font-bold text-foreground",
                  isDone && "line-through text-muted-foreground",
                )}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap bg-card/60 p-3.5 rounded-xl border border-border/40">
                  {task.description}
                </p>
              )}
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-border/40 bg-card/40 p-3 space-y-1">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <PriorityIcon className={cn("h-3 w-3", pMeta.color)} />{" "}
                  Priority
                </span>
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <span
                    className={cn(
                      "inline-block h-2 w-2 rounded-full",
                      pMeta.badge,
                    )}
                  />
                  {pMeta.label}
                </p>
              </div>

              <div className="rounded-xl border border-border/40 bg-card/40 p-3 space-y-1">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3 text-sky-400" /> Status
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 font-semibold text-foreground capitalize hover:text-indigo-400 cursor-pointer">
                      <span>{task.status?.replace("_", " ")}</span>
                      <ChevronDown className="h-3 w-3 opacity-60" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-popover border-border">
                    {[
                      { id: "backlog", label: "Backlog", dot: "bg-slate-400" },
                      { id: "todo", label: "To Do", dot: "bg-sky-400" },
                      {
                        id: "in_progress",
                        label: "In Progress",
                        dot: "bg-amber-400",
                      },
                      { id: "done", label: "Done", dot: "bg-emerald-400" },
                    ].map((s) => (
                      <DropdownMenuItem
                        key={s.id}
                        onClick={() =>
                          onStatusChange(task.id, s.id as TaskStatus)
                        }
                        className="gap-2 text-xs cursor-pointer"
                      >
                        <span className={cn("h-2 w-2 rounded-full", s.dot)} />
                        {s.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Assignee User Token Box */}
              <div className="rounded-xl border border-border/40 bg-card/40 p-3 space-y-1">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3 text-emerald-400" /> Assignee Token
                </span>
                {onAssignUser && availableMembers.length > 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1.5 font-semibold text-foreground hover:text-indigo-400 cursor-pointer w-full text-left">
                        {task.assignee ? (
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Avatar className="h-4 w-4 shrink-0">
                              <AvatarImage
                                src={getAvatarUrl(task.assigneeAvatar)}
                              />
                              <AvatarFallback className="text-[8px] bg-indigo-600 text-white">
                                {getUserInitials(task.assignee)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate">{task.assignee}</span>
                            <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground italic">
                            <UserPlus className="h-3.5 w-3.5 text-indigo-400" />
                            <span>Assign member...</span>
                          </div>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-56 bg-popover border-border shadow-xl"
                    >
                      <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Assign User Token
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="max-h-48 overflow-y-auto space-y-0.5">
                        {availableMembers.map((m) => {
                          const isSelected =
                            task.assignee?.toLowerCase() ===
                              m.name.toLowerCase() ||
                            task.assignee?.toLowerCase() ===
                              m.email.toLowerCase();
                          return (
                            <DropdownMenuItem
                              key={m.id}
                              onClick={() =>
                                onAssignUser(task, m.name, m.avatar)
                              }
                              className={cn(
                                "flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-xs cursor-pointer",
                                isSelected &&
                                  "bg-indigo-500/15 font-semibold text-indigo-400",
                              )}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Avatar className="h-5 w-5 shrink-0">
                                  <AvatarImage src={getAvatarUrl(m.avatar)} />
                                  <AvatarFallback className="text-[8px]">
                                    {getUserInitials(m.name, m.email)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="truncate">
                                  <p className="truncate text-xs">{m.name}</p>
                                  <p className="truncate text-[10px] text-muted-foreground">
                                    {m.email}
                                  </p>
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="h-3 w-3 text-indigo-400" />
                              )}
                            </DropdownMenuItem>
                          );
                        })}
                      </div>
                      {task.assignee && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onAssignUser(task, null, null)}
                            className="gap-2 text-xs text-rose-400 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" /> Unassign User
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : task.assignee ? (
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={getAvatarUrl(task.assigneeAvatar)} />
                      <AvatarFallback className="text-[8px]">
                        {getUserInitials(task.assignee)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{task.assignee}</span>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Unassigned</p>
                )}
              </div>

              <div className="rounded-xl border border-border/40 bg-card/40 p-3 space-y-1">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-amber-400" /> Target Due
                  Date
                </span>
                {task.dueDate ? (
                  <p
                    className={cn(
                      "font-semibold",
                      isOverdue ? "text-rose-400 font-bold" : "text-foreground",
                    )}
                  >
                    {task.dueDate} {isOverdue && "(Overdue)"}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">No deadline</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-border/40 pt-4">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                onClose();
                onDelete(task);
              }}
              className="gap-1.5 rounded-xl cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(task);
                }}
                className="gap-1.5 rounded-xl cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onStatusChange(task.id, isDone ? "todo" : "done");
                  onClose();
                }}
                className={cn(
                  "gap-1.5 rounded-xl text-white font-semibold cursor-pointer shadow-md",
                  isDone
                    ? "bg-slate-700 hover:bg-slate-600"
                    : "bg-emerald-600 hover:bg-emerald-700",
                )}
              >
                <CheckCircle2 className="h-4 w-4" />
                {isDone ? "Reopen Task" : "Mark as Done"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

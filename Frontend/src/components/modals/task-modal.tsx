"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  X,
  Plus,
  Edit3,
  Calendar,
  User,
  Users,
  Flame,
  ArrowUp,
  Minus,
  Circle,
  Clock,
  Sparkles,
  Loader2,
  Tag,
  Layers,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { pushNotification } from "@/lib/redux/appSlice";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  type TaskItem,
} from "@/lib/redux/api/taskApiSlice";
import { useGetTeamMembersQuery } from "@/lib/redux/api/workspaceApiSlice";
import { getTeamTheme } from "@/lib/team-theme";
import { cn, getAvatarUrl, getUserInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import type { ActionItem, PriorityLevel, TaskStatus } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  taskToEdit?: TaskItem | ActionItem | null;
  defaultTeamId?: string;
  defaultStatus?: TaskStatus;
}

const PRIORITIES: {
  id: PriorityLevel;
  label: string;
  icon: typeof Flame;
  color: string;
  badge: string;
}[] = [
  {
    id: "urgent",
    label: "Urgent",
    icon: Flame,
    color: "text-rose-400",
    badge: "border-rose-500/40 bg-rose-500/15 text-rose-300 ring-rose-500/20",
  },
  {
    id: "high",
    label: "High",
    icon: ArrowUp,
    color: "text-amber-400",
    badge:
      "border-amber-500/40 bg-amber-500/15 text-amber-300 ring-amber-500/20",
  },
  {
    id: "medium",
    label: "Medium",
    icon: Minus,
    color: "text-indigo-400",
    badge:
      "border-indigo-500/40 bg-indigo-500/15 text-indigo-300 ring-indigo-500/20",
  },
  {
    id: "low",
    label: "Low",
    icon: Circle,
    color: "text-slate-400",
    badge:
      "border-slate-500/40 bg-slate-500/15 text-slate-300 ring-slate-500/20",
  },
];

const STATUSES: { id: TaskStatus; label: string; dotColor: string }[] = [
  { id: "backlog", label: "Backlog", dotColor: "bg-slate-400" },
  { id: "todo", label: "To Do", dotColor: "bg-sky-400" },
  { id: "in_progress", label: "In Progress", dotColor: "bg-amber-400" },
  { id: "done", label: "Done", dotColor: "bg-emerald-400" },
];

const TASK_TEMPLATES = [
  "Implement JWT authentication flow",
  "Design responsive mobile navigation drawer",
  "Optimize Postgres SQL queries and indices",
  "Integrate Stripe webhook event processing",
  "Build team member role switcher UI",
  "Add dark mode theme toggler with persistent state",
];

export function TaskModal({
  open,
  onClose,
  mode = "create",
  taskToEdit = null,
  defaultTeamId,
  defaultStatus = "todo",
}: Props) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.auth.user);
  const workspaces = useAppSelector((s) => s.data.workspaces);
  const activeWorkspaceId = useAppSelector((s) => s.data.activeWorkspaceId);
  const activeTeamId = useAppSelector((s) => s.data.activeTeamId);

  const activeWs =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const teams = activeWs?.teams || [];

  // Form State
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<PriorityLevel>("medium");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [assignee, setAssignee] = useState("");
  const [assigneeAvatar, setAssigneeAvatar] = useState("");
  const [dueDate, setDueDate] = useState("");

  const isEdit = mode === "edit" && !!taskToEdit;

  // Selected Team Info
  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const teamTheme = useMemo(
    () =>
      getTeamTheme(selectedTeam?.key || selectedTeam?.id || selectedTeam?.name),
    [selectedTeam],
  );

  // Fetch Team Members for Assignee Dropdown
  const { data: teamMembersRes } = useGetTeamMembersQuery(
    selectedTeamId || "",
    {
      skip: !selectedTeamId,
    },
  );
  const teamMembers = useMemo(() => {
    if (teamMembersRes?.success && teamMembersRes.data) {
      return teamMembersRes.data;
    }
    return selectedTeam?.members || [];
  }, [teamMembersRes, selectedTeam]);

  // Mutations
  const [createTaskMutation, { isLoading: isCreating }] =
    useCreateTaskMutation();
  const [updateTaskMutation, { isLoading: isUpdating }] =
    useUpdateTaskMutation();
  const isLoading = isCreating || isUpdating;

  // Initialize or Reset Form
  useEffect(() => {
    if (open) {
      if (isEdit && taskToEdit) {
        setSelectedTeamId(taskToEdit.teamId || teams[0]?.id || "");
        setTitle(taskToEdit.title || "");
        setDescription(taskToEdit.description || "");
        setPriority(taskToEdit.priority || "medium");
        setStatus(taskToEdit.status || "todo");
        setAssignee(taskToEdit.assignee || "");
        setAssigneeAvatar(taskToEdit.assigneeAvatar || "");
        setDueDate(taskToEdit.dueDate || "");
      } else {
        const initialTeamId =
          defaultTeamId || activeTeamId || teams[0]?.id || "";
        setSelectedTeamId(initialTeamId);
        setTitle("");
        setDescription("");
        setPriority("medium");
        setStatus(defaultStatus);
        setAssignee("");
        setAssigneeAvatar("");
        setDueDate("");
      }
    }
  }, [
    open,
    isEdit,
    taskToEdit,
    defaultTeamId,
    activeTeamId,
    defaultStatus,
    teams,
  ]);

  if (!open) return null;

  function setQuickDueDate(daysFromNow: number) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setDueDate(d.toISOString().split("T")[0]);
  }

  function handleSelectAssignee(memName: string, memAvatar?: string | null) {
    setAssignee(memName);
    setAssigneeAvatar(memAvatar || "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }

    const teamIdToUse = selectedTeamId || teams[0]?.id;
    if (!teamIdToUse) {
      toast.error("Please select a team for this task");
      return;
    }

    try {
      if (isEdit && taskToEdit) {
        const res = await updateTaskMutation({
          id: taskToEdit.id,
          teamId: teamIdToUse,
          data: {
            title: title.trim(),
            description: description.trim() || null,
            priority,
            status,
            assignee: assignee.trim() || null,
            assigneeAvatar: assigneeAvatar || null,
            dueDate: dueDate || null,
            teamId: teamIdToUse,
          },
        }).unwrap();

        if (res.success) {
          toast.success(`Task "${res.data.title}" updated!`);
          dispatch(
            pushNotification({
              title: "Task updated",
              description: `Updated task "${res.data.title}".`,
              type: "success",
            }),
          );
          onClose();
        }
      } else {
        const res = await createTaskMutation({
          teamId: teamIdToUse,
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          status,
          assignee: assignee.trim() || undefined,
          assigneeAvatar: assigneeAvatar || undefined,
          dueDate: dueDate || undefined,
        }).unwrap();

        if (res.success) {
          toast.success(
            `Task "${res.data.title}" created in ${selectedTeam?.name}!`,
          );
          dispatch(
            pushNotification({
              title: "Task created",
              description: `Created new task "${res.data.title}".`,
              type: "success",
            }),
          );
          onClose();
        }
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to save task");
    }
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
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-background/95 p-6 shadow-2xl backdrop-blur-2xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/40 pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl border text-xl shadow-inner",
                  teamTheme.subtleBg,
                  teamTheme.badgeBorder,
                  teamTheme.badgeText,
                )}
              >
                {selectedTeam?.icon || "⚡"}
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {isEdit ? "Edit Action Item" : "New Action Item"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {selectedTeam
                    ? `Assigned to ${selectedTeam.name} (${selectedTeam.key})`
                    : "Configure task properties"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form Content */}
          <form
            onSubmit={handleSubmit}
            className="overflow-y-auto py-4 space-y-4 pr-1"
          >
            {/* Team Selector */}
            {teams.length > 1 && (
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-indigo-400" />
                  Target Team
                </label>
                <div className="flex flex-wrap gap-2">
                  {teams.map((t) => {
                    const isSelected = t.id === selectedTeamId;
                    const theme = getTeamTheme(t.key || t.id || t.name);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTeamId(t.id)}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                          isSelected
                            ? cn(
                                "border-indigo-500/60 bg-indigo-500/15 text-foreground shadow-sm ring-1 ring-indigo-500/30",
                                theme.badgeText,
                              )
                            : "border-border/60 bg-card/60 text-muted-foreground hover:border-border hover:bg-muted/50",
                        )}
                      >
                        <span>{t.icon || "👥"}</span>
                        <span>{t.name}</span>
                        <span className="text-[10px] font-mono opacity-60">
                          ({t.key})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Task Title */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Task Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Implement real-time WebSocket notifications"
                className="w-full rounded-xl border border-border/60 bg-card/60 px-3.5 py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                autoFocus
              />

              {/* Suggestions */}
              {!isEdit && !title && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-400" /> Ideas:
                  </span>
                  {TASK_TEMPLATES.slice(0, 3).map((template) => (
                    <button
                      key={template}
                      type="button"
                      onClick={() => setTitle(template)}
                      className="rounded-lg border border-border/40 bg-card/40 px-2 py-0.5 text-[10px] text-muted-foreground hover:border-indigo-500/40 hover:text-foreground cursor-pointer transition-colors"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Description & Acceptance Criteria
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe details, checklist, or links for this action item..."
                className="w-full rounded-xl border border-border/60 bg-card/60 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
              />
            </div>

            {/* Priority & Status Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-rose-400" /> Priority Level
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRIORITIES.map((p) => {
                    const Icon = p.icon;
                    const isSelected = priority === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPriority(p.id)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer",
                          isSelected
                            ? cn(
                                "border-transparent font-semibold shadow-sm ring-1",
                                p.badge,
                              )
                            : "border-border/60 bg-card/40 text-muted-foreground hover:bg-muted/40",
                        )}
                      >
                        <Icon className={cn("h-3.5 w-3.5", p.color)} />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-sky-400" /> Stage / Status
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {STATUSES.map((s) => {
                    const isSelected = status === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setStatus(s.id)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer",
                          isSelected
                            ? "border-sky-500/50 bg-sky-500/15 text-sky-200 font-semibold shadow-sm ring-1 ring-sky-500/30"
                            : "border-border/60 bg-card/40 text-muted-foreground hover:bg-muted/40",
                        )}
                      >
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full shrink-0",
                            s.dotColor,
                          )}
                        />
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Assignee & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Assignee */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-emerald-400" /> Assignee
                    User Token
                  </label>
                  {currentUser && (
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectAssignee(
                          currentUser.name || currentUser.email,
                          currentUser.avatar,
                        )
                      }
                      className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      Assign to Me
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={assignee}
                      onChange={(e) => {
                        setAssignee(e.target.value);
                        setAssigneeAvatar("");
                      }}
                      placeholder="Enter assignee name or pick member below"
                      className="w-full rounded-xl border border-border/60 bg-card/60 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                    {assignee && (
                      <button
                        type="button"
                        onClick={() => {
                          setAssignee("");
                          setAssigneeAvatar("");
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Selected Assignee Token Preview */}
                  {assignee && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={getAvatarUrl(assigneeAvatar)} />
                        <AvatarFallback className="text-[8px] bg-emerald-600 text-white">
                          {getUserInitials(assignee)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold truncate">{assignee}</span>
                      <span className="text-[10px] text-emerald-400/80 font-mono ml-auto">
                        Selected
                      </span>
                    </div>
                  )}

                  {/* Team Members Quick Picker */}
                  {teamMembers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {teamMembers.map((m) => {
                        const mName = m.user?.name || m.name || m.email;
                        const isChosen =
                          assignee.toLowerCase() === mName.toLowerCase();
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() =>
                              handleSelectAssignee(
                                mName,
                                m.avatar || m.user?.avatar,
                              )
                            }
                            className={cn(
                              "flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] transition-all cursor-pointer",
                              isChosen
                                ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300 font-semibold shadow-sm"
                                : "border-border/40 bg-card/40 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                            )}
                          >
                            <Avatar className="h-3.5 w-3.5">
                              <AvatarImage
                                src={getAvatarUrl(m.avatar || m.user?.avatar)}
                              />
                              <AvatarFallback className="text-[8px] bg-indigo-600 text-white">
                                {getUserInitials(mName, m.email)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate max-w-[110px]">
                              {mName}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-amber-400" /> Target Due
                  Date
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-border/60 bg-card/60 px-3 py-1.5 text-xs text-foreground outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  {/* Presets */}
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setQuickDueDate(0)}
                      className="rounded-md border border-border/40 bg-card/40 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDueDate(1)}
                      className="rounded-md border border-border/40 bg-card/40 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDueDate(3)}
                      className="rounded-md border border-border/40 bg-card/40 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      In 3 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDueDate(7)}
                      className="rounded-md border border-border/40 bg-card/40 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Next Week
                    </button>
                    {dueDate && (
                      <button
                        type="button"
                        onClick={() => setDueDate("")}
                        className="rounded-md border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 text-[10px] text-rose-300 hover:bg-rose-500/20 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border/40 pt-4 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:opacity-95 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {isEdit ? (
                      <Edit3 className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    {isEdit ? "Update Action Item" : "Create Action Item"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

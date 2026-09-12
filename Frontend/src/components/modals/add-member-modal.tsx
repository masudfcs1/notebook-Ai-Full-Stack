"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Users,
  Search,
  Check,
  X,
  Plus,
  Trash2,
  Loader2,
  Mail,
  UserCheck,
  Crown,
  Shield,
  Sparkles,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn, getAvatarUrl, getUserInitials } from "@/lib/utils";
import { getTeamTheme, ROLE_CONFIG } from "@/lib/team-theme";
import {
  useGetAvailableUsersForTeamQuery,
  useAddTeamMemberMutation,
  useAddTeamMembersBulkMutation,
} from "@/lib/redux/api/workspaceApiSlice";
import { useAppDispatch } from "@/lib/redux/hooks";
import { pushNotification } from "@/lib/redux/appSlice";

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  team: {
    id: string;
    name: string;
    key: string;
    icon?: string | null;
  };
}

interface ManualMemberRow {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "LEAD" | "MEMBER";
}

export function AddMemberModal({ open, onClose, team }: AddMemberModalProps) {
  const dispatch = useAppDispatch();
  const theme = useMemo(() => getTeamTheme(team.key || team.id || team.name), [team]);
  const [activeTab, setActiveTab] = useState<"directory" | "manual">("directory");

  // Directory Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [selectedRole, setSelectedRole] = useState<"OWNER" | "LEAD" | "MEMBER">("MEMBER");

  // Manual Invite Rows
  const [manualRows, setManualRows] = useState<ManualMemberRow[]>([
    { id: "row-1", name: "", email: "", role: "MEMBER" },
  ]);

  // API Hooks
  const {
    data: availableUsersRes,
    isLoading: isLoadingUsers,
    refetch: refetchUsers,
  } = useGetAvailableUsersForTeamQuery(
    { teamId: team.id, search: searchQuery },
    { skip: !open || !team.id }
  );

  const [addMemberMutation, { isLoading: isAddingSingle }] = useAddTeamMemberMutation();
  const [addBulkMutation, { isLoading: isAddingBulk }] = useAddTeamMembersBulkMutation();

  const isSubmitting = isAddingSingle || isAddingBulk;
  const availableUsers = useMemo(() => availableUsersRes?.data || [], [availableUsersRes]);

  // Reset selection on open/close
  useEffect(() => {
    if (open) {
      setSelectedUserIds(new Set());
      setSearchQuery("");
      setManualRows([{ id: "row-1", name: "", email: "", role: "MEMBER" }]);
      if (team.id) {
        void refetchUsers();
      }
    }
  }, [open, team.id, refetchUsers]);

  // Toggle selection for a user
  function toggleUserSelection(userId: number) {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }

  // Select all or deselect all
  function handleSelectAll() {
    if (selectedUserIds.size === availableUsers.length && availableUsers.length > 0) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(availableUsers.map((u) => u.id)));
    }
  }

  // Handle adding selected directory users
  async function handleAddSelectedUsers() {
    if (selectedUserIds.size === 0) {
      toast.error("Please select at least one user to assign");
      return;
    }

    const selectedUsers = availableUsers.filter((u) => selectedUserIds.has(u.id));

    try {
      if (selectedUsers.length === 1) {
        const u = selectedUsers[0];
        const res = await addMemberMutation({
          teamId: team.id,
          data: {
            userId: u.id,
            name: u.name || u.email.split("@")[0],
            email: u.email,
            avatar: u.avatar || undefined,
            role: selectedRole,
          },
        }).unwrap();

        if (res.success) {
          toast.success(`Assigned ${res.data.name} to ${team.name} as ${selectedRole}!`);
          dispatch(
            pushNotification({
              title: "Team member assigned",
              description: `Assigned ${res.data.name} to ${team.name} (${team.key}).`,
              type: "success",
            })
          );
          onClose();
        }
      } else {
        const payload = selectedUsers.map((u) => ({
          userId: u.id,
          name: u.name || u.email.split("@")[0],
          email: u.email,
          avatar: u.avatar || undefined,
          role: selectedRole,
        }));

        const res = await addBulkMutation({
          teamId: team.id,
          data: { members: payload },
        }).unwrap();

        if (res.success) {
          toast.success(`Assigned ${res.data.addedCount} members to ${team.name}!`);
          dispatch(
            pushNotification({
              title: "Team members assigned",
              description: `Assigned ${res.data.addedCount} members to ${team.name} (${team.key}).`,
              type: "success",
            })
          );
          onClose();
        }
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to assign team members");
    }
  }

  // Manual Rows Management
  function addManualRow() {
    setManualRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: "",
        email: "",
        role: "MEMBER",
      },
    ]);
  }

  function removeManualRow(id: string) {
    if (manualRows.length <= 1) return;
    setManualRows((prev) => prev.filter((r) => r.id !== id));
  }

  function updateManualRow(id: string, field: keyof ManualMemberRow, val: string) {
    setManualRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  }

  // Handle manual invite submission
  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validRows = manualRows.filter(
      (r) => r.email.trim().length > 0 && r.email.includes("@")
    );

    if (validRows.length === 0) {
      toast.error("Please provide at least one valid email address");
      return;
    }

    try {
      if (validRows.length === 1) {
        const row = validRows[0];
        const res = await addMemberMutation({
          teamId: team.id,
          data: {
            name: row.name.trim() || row.email.split("@")[0],
            email: row.email.trim(),
            role: row.role,
          },
        }).unwrap();

        if (res.success) {
          toast.success(`Invited & assigned ${res.data.name} to ${team.name}!`);
          dispatch(
            pushNotification({
              title: "Member assigned",
              description: `Added ${res.data.name} to ${team.name} (${team.key}).`,
              type: "success",
            })
          );
          onClose();
        }
      } else {
        const payload = validRows.map((r) => ({
          name: r.name.trim() || r.email.split("@")[0],
          email: r.email.trim(),
          role: r.role,
        }));

        const res = await addBulkMutation({
          teamId: team.id,
          data: { members: payload },
        }).unwrap();

        if (res.success) {
          toast.success(`Added ${res.data.addedCount} members to ${team.name}!`);
          dispatch(
            pushNotification({
              title: "Team members added",
              description: `Added ${res.data.addedCount} members to ${team.name} (${team.key}).`,
              type: "success",
            })
          );
          onClose();
        }
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to invite members");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-card/98 via-background/95 to-background p-0 shadow-2xl backdrop-blur-2xl"
      >
        {/* Glowing top ambient gradient dynamically matching team palette */}
        <div
          className={cn(
            "pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-36 w-80 rounded-full blur-3xl opacity-40",
            theme.glow
          )}
        />

        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-border/40 px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xl shadow-inner",
                theme.subtleBg,
                theme.badgeBorder,
                theme.badgeText
              )}
            >
              {team.icon || "👥"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-foreground">
                  Assign Members to {team.name}
                </h2>
                <span
                  className={cn(
                    "rounded px-2 py-0.5 font-mono text-[10px] font-bold border shadow-xs",
                    theme.badgeBg,
                    theme.badgeText,
                    theme.badgeBorder
                  )}
                >
                  {team.key}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Assign workspace users with distinct roles or send email invitations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-border/40 bg-muted/20 px-5 pt-2">
          <button
            onClick={() => setActiveTab("directory")}
            className={cn(
              "flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer",
              activeTab === "directory"
                ? cn("border-indigo-500 font-bold", theme.badgeText)
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="h-3.5 w-3.5" />
            <span>
              Workspace Directory{" "}
              {isLoadingUsers ? (
                <span className="inline-block h-3.5 w-6 rounded bg-muted/60 animate-pulse align-middle ml-0.5" />
              ) : (
                `(${availableUsers.length})`
              )}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("manual")}
            className={cn(
              "flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer",
              activeTab === "manual"
                ? cn("border-indigo-500 font-bold", theme.badgeText)
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Invite by Email ({manualRows.length})</span>
          </button>
        </div>

        {/* Tab 1: Directory Search & Multi-Select */}
        {activeTab === "directory" && (
          <div className="flex flex-1 flex-col overflow-hidden p-5">
            {/* Controls Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, email, or other teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-xl border border-border/60 bg-muted/40 pl-9 pr-9 text-xs outline-none focus:border-indigo-500 focus:bg-background transition-colors"
                  autoFocus
                />
                {isLoadingUsers && (
                  <Loader2 className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-indigo-400" />
                )}
              </div>

              {/* Default Role & Select All */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="text-[11px] font-medium">Assign As:</span>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="h-9 rounded-lg border border-border/60 bg-background px-2.5 text-xs font-medium outline-none focus:border-indigo-500"
                  >
                    <option value="MEMBER">Member (Contributor)</option>
                    <option value="LEAD">Lead (Sprint Lead)</option>
                    <option value="OWNER">Owner (Full Admin)</option>
                  </select>
                </div>

                {availableUsers.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-9 text-xs rounded-lg cursor-pointer"
                  >
                    {selectedUserIds.size === availableUsers.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                )}
              </div>
            </div>

            {/* Users List Container */}
            <div className="flex-1 overflow-y-auto max-h-[340px] rounded-xl border border-white/5 bg-muted/10 p-2 scrollbar-thin space-y-2">
              {isLoadingUsers ? (
                <div
                  className="grid gap-2 sm:grid-cols-2"
                  role="status"
                  aria-label="Loading available members"
                >
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div
                      key={`skeleton-member-${idx}`}
                      className="flex flex-col justify-between rounded-xl border border-white/5 bg-card/50 p-3 space-y-3 animate-pulse"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <Skeleton className="h-8.5 w-8.5 rounded-full shrink-0 bg-muted/60" />
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <Skeleton
                              className="h-3.5 rounded bg-muted/70"
                              style={{ width: `${60 + (idx % 3) * 15}%` }}
                            />
                            <Skeleton
                              className="h-2.5 rounded bg-muted/40"
                              style={{ width: `${45 + (idx % 2) * 25}%` }}
                            />
                          </div>
                        </div>
                        <Skeleton className="h-5 w-5 rounded-md shrink-0 bg-muted/50 mt-0.5" />
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center gap-1.5">
                        <Skeleton className="h-3.5 w-5 rounded bg-muted/30" />
                        <Skeleton
                          className="h-4.5 rounded-md bg-muted/40"
                          style={{ width: `${55 + (idx % 3) * 20}px` }}
                        />
                        {idx % 2 === 0 && (
                          <Skeleton className="h-4.5 w-14 rounded-md bg-muted/30" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground gap-2">
                  <UserCheck className="h-8 w-8 text-indigo-400/60" />
                  <p className="font-semibold text-foreground">
                    {searchQuery
                      ? "No workspace users match your search"
                      : `All platform users are already assigned to ${team.name}`}
                  </p>
                  <p className="text-[11px]">
                    Switch to the &quot;Invite by Email&quot; tab to invite new team members.
                  </p>
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {availableUsers.map((user) => {
                    const isSelected = selectedUserIds.has(user.id);
                    const avatar = getAvatarUrl(user.avatar);
                    const initials = getUserInitials(user.name, user.email);
                    const otherMemberships = user.memberships || [];

                    return (
                      <div
                        key={user.id}
                        onClick={() => toggleUserSelection(user.id)}
                        className={cn(
                          "group relative flex flex-col justify-between rounded-xl border p-3 transition-all cursor-pointer select-none",
                          isSelected
                            ? cn("border-indigo-500/80 bg-indigo-500/10 shadow-sm", theme.activeBorder, theme.subtleBg)
                            : "border-white/5 bg-card/60 hover:border-white/20 hover:bg-card/90"
                        )}
                      >
                        {/* Top info row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar className="h-8.5 w-8.5 border border-white/10 shrink-0">
                              {avatar && (
                                <AvatarImage
                                  src={avatar}
                                  alt={user.name || user.email}
                                />
                              )}
                              <AvatarFallback className="bg-indigo-500/20 text-[10px] font-bold text-indigo-300">
                                {initials}
                              </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-foreground">
                                {user.name || user.email.split("@")[0]}
                              </p>
                              <p className="truncate font-mono text-[10px] text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          {/* Custom Checkbox */}
                          <div
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all mt-0.5",
                              isSelected
                                ? "border-indigo-500 bg-indigo-500 text-white"
                                : "border-border/80 bg-background/60 group-hover:border-indigo-400"
                            )}
                          >
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 stroke-[3]" />
                            )}
                          </div>
                        </div>

                        {/* Existing Workspace Teams Context */}
                        <div className="mt-2.5 pt-2 border-t border-white/5">
                          {otherMemberships.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[9px] text-muted-foreground/80 font-medium">
                                In:
                              </span>
                              {otherMemberships.map((m) => (
                                <span
                                  key={m.teamId}
                                  className="inline-flex items-center gap-1 rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground border border-white/10"
                                >
                                  <span>{m.teamIcon || "👥"}</span>
                                  <span className="font-semibold text-foreground/90">{m.teamName}</span>
                                  <span className="text-[8px] opacity-75">({m.role.toLowerCase()})</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[10px] text-emerald-400/90 font-medium">
                              <Sparkles className="h-2.5 w-2.5" />
                              <span>New to workspace teams</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-4">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <strong className="text-foreground">
                  {selectedUserIds.size}
                </strong>{" "}
                of{" "}
                {isLoadingUsers ? (
                  <Skeleton className="inline-block h-3.5 w-6 rounded bg-muted/60" />
                ) : (
                  availableUsers.length
                )}{" "}
                users selected
              </span>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="rounded-xl h-9 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={selectedUserIds.size === 0 || isSubmitting}
                  onClick={handleAddSelectedUsers}
                  className={cn(
                    "gap-1.5 rounded-xl h-9 bg-gradient-to-r text-xs font-semibold text-white shadow-md disabled:opacity-50 cursor-pointer",
                    theme.gradient,
                    theme.gradientHover
                  )}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="h-3.5 w-3.5" />
                  )}
                  {selectedUserIds.size > 1
                    ? `Assign ${selectedUserIds.size} Members`
                    : `Assign to ${team.name}`}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Manual Multi-Row Email Invite */}
        {activeTab === "manual" && (
          <form
            onSubmit={handleManualSubmit}
            className="flex flex-1 flex-col p-5"
          >
            <div className="flex items-center justify-between pb-2">
              <p className="text-xs text-muted-foreground">
                Add multiple people directly to <strong className="text-foreground">{team.name}</strong> by email:
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addManualRow}
                className={cn(
                  "h-7 gap-1 rounded-lg text-xs border hover:bg-muted cursor-pointer",
                  theme.badgeText,
                  theme.badgeBorder
                )}
              >
                <Plus className="h-3 w-3" /> Add Another
              </Button>
            </div>

            {/* Rows List */}
            <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2.5 pr-1 scrollbar-thin">
              {manualRows.map((row, idx) => (
                <div
                  key={row.id}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-muted/20 p-2.5 transition-all"
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-[10px] font-bold",
                      theme.subtleBg,
                      theme.badgeText
                    )}
                  >
                    {idx + 1}
                  </span>

                  <input
                    type="text"
                    placeholder="Full Name (optional)"
                    value={row.name}
                    onChange={(e) =>
                      updateManualRow(row.id, "name", e.target.value)
                    }
                    className="flex-1 rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
                  />

                  <input
                    type="email"
                    placeholder="user@example.com *"
                    value={row.email}
                    required
                    onChange={(e) =>
                      updateManualRow(row.id, "email", e.target.value)
                    }
                    className="flex-[1.4] rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
                  />

                  <select
                    value={row.role}
                    onChange={(e) =>
                      updateManualRow(row.id, "role", e.target.value as any)
                    }
                    className="w-24 rounded-lg border border-border/60 bg-background px-2 py-1.5 text-xs outline-none focus:border-indigo-500"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="LEAD">Lead</option>
                    <option value="OWNER">Owner</option>
                  </select>

                  {manualRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeManualRow(row.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-rose-500/15 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove Row"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-4">
              <span className="text-xs text-muted-foreground">
                Total to invite:{" "}
                <strong className="text-foreground">{manualRows.length}</strong>
              </span>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="rounded-xl h-9 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className={cn(
                    "gap-1.5 rounded-xl h-9 bg-gradient-to-r text-xs font-semibold text-white shadow-md disabled:opacity-50 cursor-pointer",
                    theme.gradient,
                    theme.gradientHover
                  )}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="h-3.5 w-3.5" />
                  )}
                  {manualRows.length > 1
                    ? `Invite ${manualRows.length} Members`
                    : `Assign Member to ${team.name}`}
                </Button>
              </div>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

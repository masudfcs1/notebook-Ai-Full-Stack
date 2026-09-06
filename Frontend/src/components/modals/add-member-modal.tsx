"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn, getAvatarUrl, getUserInitials } from "@/lib/utils";
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
  const availableUsers = availableUsersRes?.data || [];

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
      toast.error("Please select at least one user to add");
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
          toast.success(`Added ${res.data.name} to ${team.name}!`);
          dispatch(
            pushNotification({
              title: "Member added",
              description: `Added ${res.data.name} to ${team.name}.`,
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
          toast.success(`Added ${res.data.addedCount} members to ${team.name}!`);
          dispatch(
            pushNotification({
              title: "Team members added",
              description: `Added ${res.data.addedCount} members to ${team.name}.`,
              type: "success",
            })
          );
          onClose();
        }
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to add team members");
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
          toast.success(`Added ${res.data.name} to ${team.name}!`);
          dispatch(
            pushNotification({
              title: "Member added",
              description: `Added ${res.data.name} to ${team.name}.`,
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
              description: `Added ${res.data.addedCount} members to ${team.name}.`,
              type: "success",
            })
          );
          onClose();
        }
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to add members");
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
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-card/95 via-background/95 to-background p-0 shadow-2xl backdrop-blur-2xl"
      >
        {/* Glowing top ambient gradient */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-36 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/15 text-xl shadow-inner">
              {team.icon || "👥"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-foreground">
                  Add Members to {team.name}
                </h2>
                <span className="rounded bg-indigo-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-indigo-400 border border-indigo-500/30">
                  {team.key}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Assign workspace users or invite multiple team members
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
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
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Platform Directory ({availableUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("manual")}
            className={cn(
              "flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer",
              activeTab === "manual"
                ? "border-indigo-500 text-indigo-400"
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
                  placeholder="Search registered users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8.5 w-full rounded-xl border border-border/60 bg-muted/40 pl-9 pr-3 text-xs outline-none focus:border-indigo-500 focus:bg-background transition-colors"
                  autoFocus
                />
              </div>

              {/* Default Role & Select All */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="text-[11px] font-medium">Assign:</span>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="h-8.5 rounded-lg border border-border/60 bg-background px-2.5 text-xs font-medium outline-none focus:border-indigo-500"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="LEAD">Lead</option>
                    <option value="OWNER">Owner</option>
                  </select>
                </div>

                {availableUsers.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-8.5 text-xs rounded-lg"
                  >
                    {selectedUserIds.size === availableUsers.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                )}
              </div>
            </div>

            {/* Users List Container */}
            <div className="flex-1 overflow-y-auto max-h-[320px] rounded-xl border border-white/5 bg-muted/10 p-2 scrollbar-thin">
              {isLoadingUsers ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                  <span>Searching users directory...</span>
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-xs text-muted-foreground gap-2">
                  <UserCheck className="h-8 w-8 text-indigo-400/60" />
                  <p className="font-semibold text-foreground">
                    {searchQuery
                      ? "No registered users match your search"
                      : "All platform users are already members of this team"}
                  </p>
                  <p className="text-[11px]">
                    Switch to the &quot;Invite by Email&quot; tab to invite new members.
                  </p>
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {availableUsers.map((user) => {
                    const isSelected = selectedUserIds.has(user.id);
                    const avatar = getAvatarUrl(user.avatar);
                    const initials = getUserInitials(user.name, user.email);

                    return (
                      <div
                        key={user.id}
                        onClick={() => toggleUserSelection(user.id)}
                        className={cn(
                          "group relative flex items-center justify-between gap-3 rounded-xl border p-2.5 transition-all cursor-pointer select-none",
                          isSelected
                            ? "border-indigo-500/80 bg-indigo-500/10 shadow-sm shadow-indigo-500/10"
                            : "border-white/5 bg-card/60 hover:border-indigo-500/40 hover:bg-card/90"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar className="h-8 w-8 border border-white/10 shrink-0">
                            {avatar && <AvatarImage src={avatar} alt={user.name || user.email} />}
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
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all",
                            isSelected
                              ? "border-indigo-500 bg-indigo-500 text-white"
                              : "border-border/80 bg-background/60 group-hover:border-indigo-400"
                          )}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-4">
              <span className="text-xs text-muted-foreground">
                <strong className="text-foreground">{selectedUserIds.size}</strong> of{" "}
                {availableUsers.length} users selected
              </span>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="rounded-xl h-8.5 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={selectedUserIds.size === 0 || isSubmitting}
                  onClick={handleAddSelectedUsers}
                  className="gap-1.5 rounded-xl h-8.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="h-3.5 w-3.5" />
                  )}
                  {selectedUserIds.size > 1
                    ? `Add ${selectedUserIds.size} Members`
                    : "Add Selected Member"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Manual Multi-Row Email Invite */}
        {activeTab === "manual" && (
          <form onSubmit={handleManualSubmit} className="flex flex-1 flex-col p-5">
            <div className="flex items-center justify-between pb-2">
              <p className="text-xs text-muted-foreground">
                Add multiple people at once by entering their email addresses:
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addManualRow}
                className="h-7 gap-1 rounded-lg text-xs text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10 cursor-pointer"
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
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 font-mono text-[10px] font-bold text-indigo-400">
                    {idx + 1}
                  </span>

                  <input
                    type="text"
                    placeholder="Full Name (optional)"
                    value={row.name}
                    onChange={(e) => updateManualRow(row.id, "name", e.target.value)}
                    className="flex-1 rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
                  />

                  <input
                    type="email"
                    placeholder="user@example.com *"
                    value={row.email}
                    required
                    onChange={(e) => updateManualRow(row.id, "email", e.target.value)}
                    className="flex-[1.4] rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
                  />

                  <select
                    value={row.role}
                    onChange={(e) => updateManualRow(row.id, "role", e.target.value as any)}
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
                Total to invite: <strong className="text-foreground">{manualRows.length}</strong>
              </span>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="rounded-xl h-8.5 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="gap-1.5 rounded-xl h-8.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="h-3.5 w-3.5" />
                  )}
                  {manualRows.length > 1
                    ? `Invite ${manualRows.length} Members`
                    : "Add Member"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

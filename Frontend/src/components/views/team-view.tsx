"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  Edit3,
  Check,
  X,
  Crown,
  Search,
  Filter,
  Mail,
  Key,
  UserCheck,
  Sparkles,
  MoreHorizontal,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  updateTeam,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
} from "@/lib/redux/dataSlice";
import { pushNotification } from "@/lib/redux/appSlice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/types";

const ROLE_BADGES: Record<
  string,
  { label: string; style: string; bar: string; icon: typeof Shield }
> = {
  OWNER: {
    label: "Owner",
    style: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    bar: "bg-amber-500",
    icon: Crown,
  },
  LEAD: {
    label: "Lead",
    style: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    bar: "bg-indigo-500",
    icon: Shield,
  },
  MEMBER: {
    label: "Member",
    style: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    bar: "bg-slate-400",
    icon: Users,
  },
};

export function TeamView() {
  const dispatch = useAppDispatch();
  const activeWorkspaceId = useAppSelector((s) => s.data.activeWorkspaceId);
  const activeTeamId = useAppSelector((s) => s.data.activeTeamId);
  const workspaces = useAppSelector((s) => s.data.workspaces);

  const activeWs =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const currentTeam =
    activeWs?.teams.find((t) => t.id === activeTeamId) || activeWs?.teams[0];

  // Editing team name/key state
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [editTeamName, setEditTeamName] = useState(currentTeam?.name || "");
  const [editTeamKey, setEditTeamKey] = useState(currentTeam?.key || "");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "ALL" | "OWNER" | "LEAD" | "MEMBER"
  >("ALL");

  // Add member modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"OWNER" | "LEAD" | "MEMBER">("MEMBER");

  // Edit member modal state
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editMemName, setEditMemName] = useState("");
  const [editMemEmail, setEditMemEmail] = useState("");
  const [editMemRole, setEditMemRole] = useState<"OWNER" | "LEAD" | "MEMBER">(
    "MEMBER",
  );

  // Filtered members list
  const filteredMembers = useMemo(() => {
    if (!currentTeam) return [];
    return currentTeam.members.filter((m) => {
      const matchSearch =
        !searchQuery.trim() ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = roleFilter === "ALL" || m.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [currentTeam, searchQuery, roleFilter]);

  // Counts for quick metrics
  const totalCount = currentTeam?.members.length || 0;
  const leadCount =
    currentTeam?.members.filter((m) => m.role === "LEAD" || m.role === "OWNER")
      .length || 0;

  if (!currentTeam) {
    return (
      <div className="rounded-2xl border border-white/10 p-6 text-center text-xs text-muted-foreground">
        No active team selected. Select a team from the sidebar.
      </div>
    );
  }

  function handleSaveTeamDetails() {
    if (!editTeamName.trim()) {
      toast.error("Team name cannot be empty");
      return;
    }

    dispatch(
      updateTeam({
        teamId: currentTeam.id,
        name: editTeamName.trim(),
        key: editTeamKey.trim().toUpperCase(),
      }),
    );

    dispatch(
      pushNotification({
        title: "Team details updated",
        description: `Renamed team to "${editTeamName.trim()}" (${editTeamKey.trim().toUpperCase()}).`,
        type: "success",
      }),
    );

    toast.success("Team settings saved!");
    setIsEditingTeam(false);
  }

  function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      toast.error("Name and email are required");
      return;
    }

    const member: TeamMember = {
      id: `mem-${Date.now()}`,
      teamId: currentTeam.id,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces`,
    };

    dispatch(addTeamMember({ teamId: currentTeam.id, member }));
    dispatch(
      pushNotification({
        title: "Team member added",
        description: `Added ${newName.trim()} to ${currentTeam.name}.`,
        type: "success",
      }),
    );

    toast.success(`Added ${newName.trim()} to team!`);
    setNewName("");
    setNewEmail("");
    setAddModalOpen(false);
  }

  function handleStartEditMember(mem: TeamMember) {
    setEditingMember(mem);
    setEditMemName(mem.name);
    setEditMemEmail(mem.email);
    setEditMemRole(mem.role);
  }

  function handleSaveMemberEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingMember || !editMemName.trim() || !editMemEmail.trim()) {
      toast.error("Name and email are required");
      return;
    }

    dispatch(
      updateTeamMember({
        teamId: currentTeam.id,
        memberId: editingMember.id,
        name: editMemName.trim(),
        email: editMemEmail.trim(),
        role: editMemRole,
      }),
    );

    toast.success(`Updated ${editMemName.trim()}'s details!`);
    setEditingMember(null);
  }

  function handleRemoveMember(memberId: string, memberName: string) {
    dispatch(removeTeamMember({ teamId: currentTeam.id, memberId }));
    toast.success(`Removed ${memberName} from team`);
  }

  return (
    <div className="space-y-4">
      {/* Sleek Header & Metrics Panel */}
      <Card className="border-white/10 bg-background/50 p-4 backdrop-blur-xl shadow-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/15 text-xl shadow-inner">
              {currentTeam.icon || "💻"}
            </div>

            {isEditingTeam ? (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  className="rounded-lg border border-indigo-500 bg-background px-2.5 py-1 text-xs font-bold text-foreground outline-none"
                  placeholder="Team Name"
                />
                <input
                  type="text"
                  value={editTeamKey}
                  onChange={(e) => setEditTeamKey(e.target.value.toUpperCase())}
                  maxLength={4}
                  className="w-16 rounded-lg border border-indigo-500 bg-background px-2.5 py-1 font-mono text-xs font-bold uppercase text-indigo-400 outline-none"
                  placeholder="KEY"
                />
                <Button
                  size="sm"
                  onClick={handleSaveTeamDetails}
                  className="h-7 gap-1 rounded-lg bg-indigo-500 px-2.5 text-xs text-white"
                >
                  <Check className="h-3.5 w-3.5" /> Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingTeam(false)}
                  className="h-7 rounded-lg px-2"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-base font-bold tracking-tight text-foreground">
                    {currentTeam.name}
                  </h1>
                  <span className="rounded bg-indigo-500/15 px-1.5 py-0.2 font-mono text-[10px] font-bold text-indigo-400 border border-indigo-500/30">
                    {currentTeam.key}
                  </span>
                  <button
                    onClick={() => {
                      setEditTeamName(currentTeam.name);
                      setEditTeamKey(currentTeam.key);
                      setIsEditingTeam(true);
                    }}
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Edit Team Name & Key"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                </div>
                <p className="truncate text-[11px] text-muted-foreground">
                  Workspace:{" "}
                  <span className="font-semibold text-foreground">
                    {activeWs.name}
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Stat Pills */}
            <div className="hidden sm:flex items-center gap-2 border-r border-white/10 pr-3 text-[11px]">
              <span className="rounded-lg bg-muted/40 px-2 py-1 font-semibold text-muted-foreground">
                👥 <strong className="text-foreground">{totalCount}</strong>{" "}
                Members
              </span>
              <span className="rounded-lg bg-muted/40 px-2 py-1 font-semibold text-muted-foreground">
                👑 <strong className="text-foreground">{leadCount}</strong>{" "}
                Leads
              </span>
            </div>

            <Button
              onClick={() => setAddModalOpen(true)}
              size="sm"
              className="h-8 gap-1.5 rounded-lg  from-indigo-500 to-violet-600 px-3 text-xs font-semibold text-white shadow-md shadow-indigo-500/20"
            >
              <UserPlus className="h-3.5 w-3.5" /> Add Member
            </Button>
          </div>
        </div>
      </Card>

      {/* Roster Controls: Search & Role Filters */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between px-1">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
            <Users className="h-3.5 w-3.5 text-indigo-400" />
            Team Roster ({filteredMembers.length})
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search roster..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 w-36 rounded-lg border border-border/60 bg-muted/30 pl-8 pr-2.5 text-xs outline-none focus:border-indigo-500 focus:w-44 transition-all"
            />
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center rounded-lg border border-border/60 bg-background/50 p-0.5 text-[10px] font-semibold">
            {(["ALL", "OWNER", "LEAD", "MEMBER"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={cn(
                  "rounded-md px-2 py-0.5 transition-all",
                  roleFilter === r
                    ? "bg-indigo-500 text-white font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r === "ALL" ? "All" : r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Micro Sleek & Beautiful Member Cards Grid */}
      {filteredMembers.length === 0 ? (
        <Card className="border-white/10 bg-background/40 p-6 text-center text-xs text-muted-foreground backdrop-blur-md">
          No team members match your search or filter.
        </Card>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredMembers.map((member, idx) => {
            const RoleMeta = ROLE_BADGES[member.role] || ROLE_BADGES.MEMBER;
            const RoleIcon = RoleMeta.icon;

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
              >
                <div className="group relative flex items-center justify-between overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-card/90 via-card/60 to-background/50 p-2.5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/40 hover:bg-card/95 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5">
                  {/* Subtle top role accent bar */}
                  <div
                    className={cn(
                      "absolute top-0 left-0 right-0 h-[2px] opacity-75 transition-opacity group-hover:opacity-100",
                      RoleMeta.bar,
                    )}
                  />

                  <div className="flex items-center gap-2.5 min-w-0 pr-1">
                    <div className="relative shrink-0">
                      <Avatar className="h-8 w-8 border border-white/20 ring-1 ring-white/10 transition-all group-hover:ring-indigo-500/40">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-indigo-500/20 text-[10px] font-bold text-indigo-300">
                          {member.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {/* Active Status Indicator */}
                      <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background shadow-sm shadow-emerald-500/50" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="truncate text-xs font-bold text-foreground leading-snug group-hover:text-indigo-300 transition-colors">
                          {member.name}
                        </h4>
                      </div>
                      <p className="truncate font-mono text-[10px] text-muted-foreground/80 mt-0.5 leading-none">
                        {member.email}
                      </p>
                      <div className="mt-1 flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            "gap-0.5 px-1.5 py-0 text-[8px] font-bold leading-none shrink-0 shadow-inner",
                            RoleMeta.style,
                          )}
                        >
                          <RoleIcon className="h-2 w-2" /> {RoleMeta.label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Floating Action Pill Bar on Hover */}
                  <div className="flex items-center gap-0.5 opacity-0 transition-all duration-200 group-hover:opacity-100 shrink-0 ml-1 rounded-lg border border-white/10 bg-background/80 p-0.5 backdrop-blur-md shadow-sm">
                    <button
                      onClick={() => handleStartEditMember(member)}
                      className="rounded p-1 text-muted-foreground hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors"
                      title="Edit Member Details"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleRemoveMember(member.id, member.name)}
                      className="rounded p-1 text-muted-foreground/60 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Edit Member Modal */}
      <AnimatePresence>
        {editingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setEditingMember(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-background/95 p-5 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
                    <Edit3 className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold">Edit Team Member</h2>
                    <p className="text-[11px] text-muted-foreground">
                      Update member details and role
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingMember(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={handleSaveMemberEdit}
                className="mt-3.5 space-y-3"
              >
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editMemName}
                    onChange={(e) => setEditMemName(e.target.value)}
                    className="w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={editMemEmail}
                    onChange={(e) => setEditMemEmail(e.target.value)}
                    className="w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Team Role
                  </label>
                  <select
                    value={editMemRole}
                    onChange={(e) => setEditMemRole(e.target.value as any)}
                    className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs outline-none focus:border-indigo-500"
                  >
                    <option value="MEMBER">
                      Member (Standard contributor)
                    </option>
                    <option value="LEAD">
                      Team Lead (Sprint lead & reviewer)
                    </option>
                    <option value="OWNER">
                      Owner (Full administrative rights)
                    </option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingMember(null)}
                    className="rounded-lg h-8 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="gap-1.5 rounded-lg h-8 bg-indigo-500 text-xs text-white shadow-md"
                  >
                    <Check className="h-3.5 w-3.5" /> Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Member Modal */}
      <AnimatePresence>
        {addModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setAddModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-background/95 p-5 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold">
                      Assign Member to {currentTeam.name}
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      Add user to team roster with assigned role
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="mt-3.5 space-y-3">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Chen"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs outline-none focus:border-indigo-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="sarah@acme.io"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Team Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs outline-none focus:border-indigo-500"
                  >
                    <option value="MEMBER">
                      Member (Standard contributor)
                    </option>
                    <option value="LEAD">
                      Team Lead (Sprint lead & reviewer)
                    </option>
                    <option value="OWNER">
                      Owner (Full administrative rights)
                    </option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAddModalOpen(false)}
                    className="rounded-lg h-8 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="gap-1.5 rounded-lg h-8  from-indigo-500 to-violet-600 text-xs text-white shadow-md"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Add Member
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

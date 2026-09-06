"use client";

import { AddMemberModal } from "@/components/modals/add-member-modal";
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
  useGetTeamMembersQuery,
  useRemoveTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useUpdateTeamMutation,
  type TeamMember,
} from "@/lib/redux/api/workspaceApiSlice";
import { pushNotification } from "@/lib/redux/appSlice";
import { updateTeam } from "@/lib/redux/dataSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { cn, getAvatarUrl, getUserInitials } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Crown,
  Edit3,
  LayoutGrid,
  List,
  Loader2,
  Search,
  Shield,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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

  // API Hooks
  const [updateTeamMutation] = useUpdateTeamMutation();
  const { data: teamMembersRes, isLoading: isLoadingMembers } =
    useGetTeamMembersQuery(currentTeam?.id || "", {
      skip: !currentTeam?.id,
    });

  const [updateMemberMutation] = useUpdateTeamMemberMutation();
  const [removeMemberMutation] = useRemoveTeamMemberMutation();

  // Active members combined from API with fallback to redux
  const allMembers: TeamMember[] = useMemo(() => {
    if (teamMembersRes?.success && teamMembersRes.data) {
      return teamMembersRes.data;
    }
    return (currentTeam?.members as TeamMember[]) || [];
  }, [teamMembersRes, currentTeam?.members]);

  // View style: Cards Grid vs Table View
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

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

  // Edit member modal state
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editMemName, setEditMemName] = useState("");
  const [editMemEmail, setEditMemEmail] = useState("");
  const [editMemRole, setEditMemRole] = useState<"OWNER" | "LEAD" | "MEMBER">(
    "MEMBER",
  );

  // Remove confirmation modal state
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return allMembers.filter((m) => {
      const name = m.user?.name || m.name || "";
      const email = m.user?.email || m.email || "";
      const matchSearch =
        !searchQuery.trim() ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = roleFilter === "ALL" || m.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [allMembers, searchQuery, roleFilter]);

  // Counts for quick metrics
  const totalCount = allMembers.length;
  const leadCount = allMembers.filter((m) => m.role === "LEAD").length;
  const ownerCount = allMembers.filter((m) => m.role === "OWNER").length;
  const memberCount = allMembers.filter((m) => m.role === "MEMBER").length;

  if (!currentTeam) {
    return (
      <div className="rounded-2xl border border-white/10 p-6 text-center text-xs text-muted-foreground">
        No active team selected. Select a team from the sidebar.
      </div>
    );
  }

  async function handleSaveTeamDetails() {
    if (!currentTeam) return;
    if (!editTeamName.trim()) {
      toast.error("Team name cannot be empty");
      return;
    }

    const keyRaw = (editTeamKey.trim().toUpperCase() || "TEAM").slice(0, 10);
    const finalKey = keyRaw.length < 2 ? (keyRaw + "XX").slice(0, 2) : keyRaw;

    try {
      const res = await updateTeamMutation({
        id: currentTeam.id,
        data: {
          name: editTeamName.trim(),
          key: finalKey,
        },
      }).unwrap();

      if (res.success && res.data) {
        dispatch(
          updateTeam({
            teamId: currentTeam.id,
            name: res.data.name,
            key: res.data.key,
          }),
        );

        dispatch(
          pushNotification({
            title: "Team details updated",
            description: `Renamed team to "${res.data.name}" (${res.data.key}).`,
            type: "success",
          }),
        );

        toast.success("Team settings saved!");
        setIsEditingTeam(false);
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to update team",
      );
    }
  }

  function handleStartEditMember(mem: TeamMember) {
    setEditingMember(mem);
    setEditMemName(mem.user?.name || mem.name);
    setEditMemEmail(mem.user?.email || mem.email);
    setEditMemRole(mem.role);
  }

  async function handleSaveMemberEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingMember || !editMemName.trim() || !editMemEmail.trim()) {
      toast.error("Name and email are required");
      return;
    }

    try {
      const res = await updateMemberMutation({
        teamId: currentTeam.id,
        memberId: editingMember.id,
        data: {
          name: editMemName.trim(),
          email: editMemEmail.trim(),
          role: editMemRole,
        },
      }).unwrap();

      if (res.success) {
        toast.success(`Updated ${editMemName.trim()}'s details!`);
        dispatch(
          pushNotification({
            title: "Member updated",
            description: `Updated ${editMemName.trim()}'s role to ${editMemRole}.`,
            type: "success",
          }),
        );
        setEditingMember(null);
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to update member",
      );
    }
  }

  async function handleQuickRoleChange(
    member: TeamMember,
    newRole: "OWNER" | "LEAD" | "MEMBER",
  ) {
    if (member.role === newRole) return;
    try {
      const res = await updateMemberMutation({
        teamId: currentTeam.id,
        memberId: member.id,
        data: { role: newRole },
      }).unwrap();

      if (res.success) {
        const memName = member.user?.name || member.name;
        toast.success(`Changed ${memName}'s role to ${newRole}`);
        dispatch(
          pushNotification({
            title: "Role changed",
            description: `Changed ${memName}'s role to ${newRole} in ${currentTeam.name}.`,
            type: "success",
          }),
        );
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to change role",
      );
    }
  }

  async function handleConfirmRemoveMember() {
    if (!memberToDelete) return;
    setIsDeletingMember(true);
    const memName = memberToDelete.user?.name || memberToDelete.name;

    try {
      const res = await removeMemberMutation({
        teamId: currentTeam.id,
        memberId: memberToDelete.id,
      }).unwrap();

      if (res.success) {
        toast.success(`Removed ${memName} from team`);
        dispatch(
          pushNotification({
            title: "Member removed",
            description: `Removed ${memName} from ${currentTeam.name}.`,
            type: "info",
          }),
        );
        setMemberToDelete(null);
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to remove member",
      );
    } finally {
      setIsDeletingMember(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Sleek Header & Metrics Hero Card */}
      <Card className="relative overflow-hidden border-white/10 bg-gradient-to-r from-card/90 via-card/70 to-background/50 p-4.5 backdrop-blur-xl shadow-lg">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-indigo-500/15 blur-2xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/20 to-violet-600/20 text-2xl shadow-inner ring-1 ring-white/10">
              {currentTeam.icon || "👥"}
            </div>

            {isEditingTeam ? (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  className="rounded-lg border border-indigo-500 bg-background px-3 py-1.5 text-xs font-bold text-foreground outline-none shadow-sm"
                  placeholder="Team Name"
                />
                <input
                  type="text"
                  value={editTeamKey}
                  onChange={(e) => setEditTeamKey(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-18 rounded-lg border border-indigo-500 bg-background px-2.5 py-1.5 font-mono text-xs font-bold uppercase text-indigo-400 outline-none shadow-sm"
                  placeholder="KEY"
                />
                <Button
                  size="sm"
                  onClick={handleSaveTeamDetails}
                  className="h-8 gap-1 rounded-lg bg-indigo-500 px-3 text-xs font-semibold text-white shadow-md hover:bg-indigo-600 cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" /> Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingTeam(false)}
                  className="h-8 rounded-lg px-2 text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-lg font-bold tracking-tight text-foreground">
                    {currentTeam.name}
                  </h1>
                  <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-400 border border-indigo-500/30 shadow-inner">
                    {currentTeam.key}
                  </span>
                  <button
                    onClick={() => {
                      setEditTeamName(currentTeam.name);
                      setEditTeamKey(currentTeam.key);
                      setIsEditingTeam(true);
                    }}
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                    title="Edit Team Name & Key"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="truncate text-xs text-muted-foreground mt-0.5">
                  Workspace:{" "}
                  <span className="font-semibold text-foreground">
                    {activeWs.name}
                  </span>
                  <span className="mx-2 text-muted-foreground/50">•</span>
                  <span>{totalCount} Total Members</span>
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Stat Badges */}
            <div className="hidden md:flex items-center gap-1.5 border-r border-white/10 pr-3.5 text-xs">
              <span className="rounded-lg border border-white/5 bg-background/50 px-2.5 py-1 font-semibold text-muted-foreground shadow-sm">
                👑 <strong className="text-amber-400">{ownerCount}</strong>{" "}
                Owners
              </span>
              <span className="rounded-lg border border-white/5 bg-background/50 px-2.5 py-1 font-semibold text-muted-foreground shadow-sm">
                🛡️ <strong className="text-indigo-400">{leadCount}</strong>{" "}
                Leads
              </span>
              <span className="rounded-lg border border-white/5 bg-background/50 px-2.5 py-1 font-semibold text-muted-foreground shadow-sm">
                👥 <strong className="text-foreground">{memberCount}</strong>{" "}
                Members
              </span>
            </div>

            <Button
              onClick={() => setAddModalOpen(true)}
              size="sm"
              className="h-8.5 gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 px-3.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 hover:opacity-95 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" /> Add Member
            </Button>
          </div>
        </div>
      </Card>

      {/* Roster Controls: Search, Filter Tabs, & Layout Switcher */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Users className="h-3.5 w-3.5 text-indigo-400" />
            Team Members ({filteredMembers.length})
          </div>
          {isLoadingMembers && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter roster..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-40 rounded-lg border border-border/60 bg-muted/30 pl-8 pr-2.5 text-xs outline-none focus:border-indigo-500 focus:w-48 transition-all"
            />
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center rounded-lg border border-border/60 bg-background/60 p-0.5 text-[11px] font-semibold">
            {(
              [
                { key: "ALL", label: "All", count: totalCount },
                { key: "OWNER", label: "Owners", count: ownerCount },
                { key: "LEAD", label: "Leads", count: leadCount },
                { key: "MEMBER", label: "Members", count: memberCount },
              ] as const
            ).map((r) => (
              <button
                key={r.key}
                onClick={() => setRoleFilter(r.key)}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2.5 py-1 transition-all cursor-pointer",
                  roleFilter === r.key
                    ? "bg-indigo-500 text-white font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span>{r.label}</span>
                <span className="text-[9px] opacity-75 font-mono">
                  ({r.count})
                </span>
              </button>
            ))}
          </div>

          {/* View Mode Toggle: Grid vs Table */}
          <div className="flex items-center rounded-lg border border-border/60 bg-background/60 p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-md p-1.5 transition-colors cursor-pointer",
                viewMode === "grid"
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="Card Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "rounded-md p-1.5 transition-colors cursor-pointer",
                viewMode === "table"
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="Table / List View"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Member Cards Grid or Table View */}
      {filteredMembers.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-white/10 bg-background/40 py-12 px-6 text-center backdrop-blur-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 mb-3">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground">
            {searchQuery || roleFilter !== "ALL"
              ? "No members match your filter"
              : "No members in this team yet"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
            {searchQuery || roleFilter !== "ALL"
              ? "Try adjusting your search terms or clearing role filters."
              : "Add team members from your organization or invite them via email."}
          </p>
          <Button
            onClick={() => setAddModalOpen(true)}
            size="sm"
            className="gap-1.5 rounded-xl bg-indigo-500 text-xs text-white font-semibold shadow-md cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" /> Add First Member
          </Button>
        </Card>
      ) : viewMode === "grid" ? (
        /* Card Grid View */
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredMembers.map((member, idx) => {
            const RoleMeta = ROLE_BADGES[member.role] || ROLE_BADGES.MEMBER;
            const RoleIcon = RoleMeta.icon;
            const displayName = member.user?.name || member.name;
            const displayEmail = member.user?.email || member.email;
            const avatarSrc = getAvatarUrl(
              member.user?.avatar || member.avatar,
            );
            const initials = getUserInitials(displayName, displayEmail);

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
              >
                <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-card/90 via-card/60 to-background/50 p-3.5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/40 hover:bg-card/95 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5">
                  {/* Subtle top role accent line */}
                  <div
                    className={cn(
                      "absolute top-0 left-0 right-0 h-[2.5px] opacity-80 transition-opacity group-hover:opacity-100",
                      RoleMeta.bar,
                    )}
                  />

                  {/* Top Header info */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <Avatar className="h-9 w-9 border border-white/20 ring-1 ring-white/10 transition-all group-hover:ring-indigo-500/40">
                          {avatarSrc && (
                            <AvatarImage src={avatarSrc} alt={displayName} />
                          )}
                          <AvatarFallback className="bg-indigo-500/20 text-[11px] font-bold text-indigo-300">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        {/* Active online dot */}
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background shadow-sm shadow-emerald-500/50" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-xs font-bold text-foreground leading-snug group-hover:text-indigo-300 transition-colors">
                          {displayName}
                        </h4>
                        <p className="truncate font-mono text-[10px] text-muted-foreground/90 mt-0.5">
                          {displayEmail}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons on hover */}
                    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handleStartEditMember(member)}
                        className="rounded p-1 text-muted-foreground hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors cursor-pointer"
                        title="Edit Member"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => setMemberToDelete(member)}
                        className="rounded p-1 text-muted-foreground hover:bg-rose-500/20 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove Member"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Role Dropdown / Inline Changer */}
                  <div className="mt-3.5 flex items-center justify-between border-t border-border/40 pt-2.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-1 cursor-pointer">
                          <Badge
                            variant="outline"
                            className={cn(
                              "gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-all hover:scale-105",
                              RoleMeta.style,
                            )}
                          >
                            <RoleIcon className="h-2.5 w-2.5" />
                            <span>{RoleMeta.label}</span>
                          </Badge>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-40">
                        <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground">
                          Change Role
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleQuickRoleChange(member, "OWNER")}
                          className="gap-2 text-xs font-medium cursor-pointer"
                        >
                          <Crown className="h-3.5 w-3.5 text-amber-400" />
                          <span>Owner</span>
                          {member.role === "OWNER" && (
                            <Check className="ml-auto h-3.5 w-3.5 text-indigo-400" />
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleQuickRoleChange(member, "LEAD")}
                          className="gap-2 text-xs font-medium cursor-pointer"
                        >
                          <Shield className="h-3.5 w-3.5 text-indigo-400" />
                          <span>Lead</span>
                          {member.role === "LEAD" && (
                            <Check className="ml-auto h-3.5 w-3.5 text-indigo-400" />
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleQuickRoleChange(member, "MEMBER")
                          }
                          className="gap-2 text-xs font-medium cursor-pointer"
                        >
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span>Member</span>
                          {member.role === "MEMBER" && (
                            <Check className="ml-auto h-3.5 w-3.5 text-indigo-400" />
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <span className="text-[10px] text-muted-foreground/70 font-mono">
                      {member.createdAt
                        ? new Date(member.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )
                        : "Active"}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* High-Density Table / List View */
        <Card className="overflow-hidden border-white/10 bg-card/80 backdrop-blur-xl shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/50 bg-muted/40 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredMembers.map((member) => {
                  const RoleMeta =
                    ROLE_BADGES[member.role] || ROLE_BADGES.MEMBER;
                  const RoleIcon = RoleMeta.icon;
                  const displayName = member.user?.name || member.name;
                  const displayEmail = member.user?.email || member.email;
                  const avatarSrc = getAvatarUrl(
                    member.user?.avatar || member.avatar,
                  );
                  const initials = getUserInitials(displayName, displayEmail);

                  return (
                    <tr
                      key={member.id}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7 border border-white/10 shrink-0">
                            {avatarSrc && (
                              <AvatarImage src={avatarSrc} alt={displayName} />
                            )}
                            <AvatarFallback className="bg-indigo-500/20 text-[10px] font-bold text-indigo-300">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-foreground">
                            {displayName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {displayEmail}
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="cursor-pointer">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "gap-1 px-2 py-0.5 text-[9px] font-bold uppercase",
                                  RoleMeta.style,
                                )}
                              >
                                <RoleIcon className="h-2.5 w-2.5" />{" "}
                                {RoleMeta.label}
                              </Badge>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-36">
                            <DropdownMenuItem
                              onClick={() =>
                                handleQuickRoleChange(member, "OWNER")
                              }
                              className="gap-2 text-xs cursor-pointer"
                            >
                              <Crown className="h-3 w-3 text-amber-400" /> Owner
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleQuickRoleChange(member, "LEAD")
                              }
                              className="gap-2 text-xs cursor-pointer"
                            >
                              <Shield className="h-3 w-3 text-indigo-400" />{" "}
                              Lead
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleQuickRoleChange(member, "MEMBER")
                              }
                              className="gap-2 text-xs cursor-pointer"
                            >
                              <Users className="h-3 w-3 text-slate-400" />{" "}
                              Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">
                        {member.createdAt
                          ? new Date(member.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStartEditMember(member)}
                            className="rounded p-1 text-muted-foreground hover:text-indigo-400 hover:bg-muted transition-colors cursor-pointer"
                            title="Edit Details"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setMemberToDelete(member)}
                            className="rounded p-1 text-muted-foreground hover:text-rose-400 hover:bg-muted transition-colors cursor-pointer"
                            title="Remove Member"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Member Multi-User Modal */}
      <AddMemberModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        team={{
          id: currentTeam.id,
          name: currentTeam.name,
          key: currentTeam.key,
          icon: currentTeam.icon,
        }}
      />

      {/* Edit Member Modal */}
      <AnimatePresence>
        {editingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
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
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted cursor-pointer"
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
                    className="rounded-lg h-8 text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="gap-1.5 rounded-lg h-8 bg-indigo-500 text-xs text-white shadow-md cursor-pointer hover:bg-indigo-600"
                  >
                    <Check className="h-3.5 w-3.5" /> Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Member Confirmation Modal */}
      <AnimatePresence>
        {memberToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setMemberToDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-background/95 p-5 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Remove Team Member
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Are you sure you want to remove{" "}
                    <strong className="text-foreground">
                      {memberToDelete.user?.name || memberToDelete.name}
                    </strong>{" "}
                    from{" "}
                    <span className="text-indigo-400">{currentTeam.name}</span>?
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 mt-2 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMemberToDelete(null)}
                  className="rounded-xl h-8.5 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={isDeletingMember}
                  onClick={handleConfirmRemoveMember}
                  className="gap-1.5 rounded-xl h-8.5 bg-rose-600 text-xs font-semibold text-white shadow-md hover:bg-rose-700 cursor-pointer disabled:opacity-50"
                >
                  {isDeletingMember ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Remove Member
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

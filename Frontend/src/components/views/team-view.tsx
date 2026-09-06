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
import { getTeamTheme, ROLE_CONFIG } from "@/lib/team-theme";
import { cn, getAvatarUrl, getUserInitials } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Crown,
  Edit3,
  LayoutGrid,
  List,
  Loader2,
  Lock,
  Search,
  Shield,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function TeamView() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const activeWorkspaceId = useAppSelector((s) => s.data.activeWorkspaceId);
  const activeTeamId = useAppSelector((s) => s.data.activeTeamId);
  const workspaces = useAppSelector((s) => s.data.workspaces);

  const activeWs =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const currentTeam =
    activeWs?.teams.find((t) => t.id === activeTeamId) || activeWs?.teams[0];

  const theme = useMemo(
    () =>
      getTeamTheme(currentTeam?.key || currentTeam?.id || currentTeam?.name),
    [currentTeam],
  );

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

  // Check if current user is owner or lead of this team / workspace
  const isTeamOwnerOrLead = useMemo(() => {
    if (!user) return false;
    if (activeWs?.userId === user.id) return true;
    if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") return true;
    return allMembers.some(
      (m) =>
        ((m.userId && m.userId === user.id) ||
          (user.email &&
            m.email?.toLowerCase() === user.email.toLowerCase())) &&
        (m.role === "OWNER" || m.role === "LEAD"),
    );
  }, [user, activeWs, allMembers]);

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
      <div className="rounded-2xl border border-white/10 p-8 text-center text-xs text-muted-foreground bg-card/60 backdrop-blur-md">
        <Users className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
        <p className="font-semibold text-foreground">No active team selected</p>
        <p className="mt-1">
          Select an assigned team from the sidebar to view its roster.
        </p>
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
      {/* Sleek Header & Metrics Hero Card with Dynamic Team Theme */}
      <Card className="relative overflow-hidden border-white/10 bg-gradient-to-r from-card/95 via-card/75 to-background/60 p-5 backdrop-blur-xl shadow-lg">
        {/* Dynamic ambient glow matching team palette */}
        <div
          className={cn(
            "pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl opacity-40",
            theme.glow,
          )}
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={cn(
                "flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border text-2xl shadow-inner ring-1 ring-white/10",
                theme.subtleBg,
                theme.badgeBorder,
                theme.badgeText,
              )}
            >
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
                  className={cn(
                    "w-20 rounded-lg border bg-background px-2.5 py-1.5 font-mono text-xs font-bold uppercase outline-none shadow-sm",
                    theme.badgeBorder,
                    theme.badgeText,
                  )}
                  placeholder="KEY"
                />
                <Button
                  size="sm"
                  onClick={handleSaveTeamDetails}
                  className={cn(
                    "h-8 gap-1 rounded-lg px-3 text-xs font-semibold text-white shadow-md cursor-pointer",
                    theme.gradient,
                    theme.gradientHover,
                  )}
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
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 font-mono text-[11px] font-bold border shadow-xs",
                      theme.badgeBg,
                      theme.badgeText,
                      theme.badgeBorder,
                    )}
                  >
                    {currentTeam.key}
                  </span>
                  {isTeamOwnerOrLead && (
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
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground mt-0.5">
                  Workspace:{" "}
                  <span className="font-semibold text-foreground">
                    {activeWs.name}
                  </span>
                  <span className="mx-2 text-muted-foreground/50">•</span>
                  <span>{totalCount} Active Members</span>
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

            {isTeamOwnerOrLead ? (
              <Button
                onClick={() => setAddModalOpen(true)}
                size="sm"
                className={cn(
                  "h-9 gap-1.5 rounded-xl bg-gradient-to-r px-4 text-xs font-semibold text-white shadow-md transition-all hover:scale-[1.02] cursor-pointer",
                  theme.gradient,
                  theme.gradientHover,
                )}
              >
                <UserPlus className="h-3.5 w-3.5" /> Assign Members
              </Button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-background/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <Lock className="h-3 w-3 text-muted-foreground/70" /> Assigned
                Member
              </span>
            )}
          </div>
        </div>

        {/* Real-time Role Distribution Visual Bar */}
        {totalCount > 0 && (
          <div className="mt-4 pt-3.5 border-t border-white/5">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono mb-1.5">
              <span>Roster Composition</span>
              <span className="text-foreground font-semibold">
                {ownerCount} Owner · {leadCount} Lead · {memberCount} Member
              </span>
            </div>
            <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              {ownerCount > 0 && (
                <div
                  style={{ width: `${(ownerCount / totalCount) * 100}%` }}
                  className="bg-amber-500 transition-all duration-500"
                  title={`Owners: ${ownerCount}`}
                />
              )}
              {leadCount > 0 && (
                <div
                  style={{ width: `${(leadCount / totalCount) * 100}%` }}
                  className="bg-indigo-500 transition-all duration-500"
                  title={`Leads: ${leadCount}`}
                />
              )}
              {memberCount > 0 && (
                <div
                  style={{ width: `${(memberCount / totalCount) * 100}%` }}
                  className="bg-slate-400 transition-all duration-500"
                  title={`Members: ${memberCount}`}
                />
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Roster Controls: Search, Filter Tabs, & Layout Switcher */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Users className={cn("h-3.5 w-3.5", theme.badgeText)} />
            Team Roster ({filteredMembers.length})
          </div>
          {isLoadingMembers && (
            <Loader2
              className={cn("h-3.5 w-3.5 animate-spin", theme.badgeText)}
            />
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
              className="h-8.5 w-40 rounded-lg border border-border/60 bg-muted/30 pl-8 pr-2.5 text-xs outline-none focus:border-indigo-500 focus:w-48 transition-all"
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
                    ? cn(
                        "text-white font-bold shadow-sm bg-indigo-500",
                        theme.badgeBg ? "bg-indigo-600" : "",
                      )
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
                  ? cn(theme.subtleBg, theme.badgeText)
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
                  ? cn(theme.subtleBg, theme.badgeText)
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
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full mb-3",
              theme.subtleBg,
              theme.badgeText,
            )}
          >
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground">
            {searchQuery || roleFilter !== "ALL"
              ? "No team members match your filter"
              : "No members assigned to this team yet"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
            {searchQuery || roleFilter !== "ALL"
              ? "Try adjusting your search terms or clearing role filters."
              : "Assign registered workspace members or invite new team members via email."}
          </p>
          {isTeamOwnerOrLead && (
            <Button
              onClick={() => setAddModalOpen(true)}
              size="sm"
              className={cn(
                "gap-1.5 rounded-xl text-xs text-white font-semibold shadow-md cursor-pointer",
                theme.gradient,
                theme.gradientHover,
              )}
            >
              <UserPlus className="h-3.5 w-3.5" /> Assign First Member
            </Button>
          )}
        </Card>
      ) : viewMode === "grid" ? (
        /* Card Grid View */
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredMembers.map((member, idx) => {
            const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.MEMBER;
            const RoleIcon = roleConfig.icon;
            const displayName = member.user?.name || member.name;
            const displayEmail = member.user?.email || member.email;
            const avatarSrc = getAvatarUrl(
              member.user?.avatar || member.avatar,
            );
            const initials = getUserInitials(displayName, displayEmail);
            const otherMemberships = (member.user?.memberships || []).filter(
              (m) => m.teamId !== currentTeam.id,
            );

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
              >
                <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-card/90 via-card/60 to-background/50 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-white/25 hover:bg-card/95 hover:shadow-lg hover:-translate-y-0.5">
                  {/* Top role accent bar */}
                  <div
                    className={cn(
                      "absolute top-0 left-0 right-0 h-[2.5px] opacity-80 transition-opacity group-hover:opacity-100",
                      roleConfig.bar,
                    )}
                  />

                  {/* Top Header info */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <Avatar className="h-9.5 w-9.5 border border-white/20 ring-1 ring-white/10 transition-all">
                          {avatarSrc && (
                            <AvatarImage src={avatarSrc} alt={displayName} />
                          )}
                          <AvatarFallback className="bg-indigo-500/20 text-[11px] font-bold text-indigo-300">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        {/* Active online dot */}
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background shadow-xs shadow-emerald-500/50" />
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

                    {/* Action buttons on hover (for team owners / leads) */}
                    {isTeamOwnerOrLead && (
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
                    )}
                  </div>

                  {/* Other workspace teams tag if present */}
                  {otherMemberships.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-1 overflow-hidden">
                      <span className="text-[9px] text-muted-foreground/70 shrink-0">
                        Also in:
                      </span>
                      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
                        {otherMemberships.slice(0, 2).map((m) => (
                          <span
                            key={m.teamId}
                            className="inline-flex items-center gap-0.5 rounded bg-white/5 px-1.5 py-0.2 font-mono text-[8px] text-muted-foreground border border-white/5 truncate max-w-[80px]"
                            title={`${m.teamName} (${m.role})`}
                          >
                            {m.teamKey || m.teamName}
                          </span>
                        ))}
                        {otherMemberships.length > 2 && (
                          <span className="text-[8px] text-muted-foreground/70 font-mono">
                            +{otherMemberships.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Role Dropdown / Inline Changer */}
                  <div className="mt-3.5 flex items-center justify-between border-t border-border/40 pt-2.5">
                    {isTeamOwnerOrLead ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center gap-1 cursor-pointer">
                            <Badge
                              variant="outline"
                              className={cn(
                                "gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-all hover:scale-105",
                                roleConfig.style,
                              )}
                            >
                              <RoleIcon className="h-2.5 w-2.5" />
                              <span>{roleConfig.label}</span>
                            </Badge>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-44">
                          <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground">
                            Change Team Role
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleQuickRoleChange(member, "OWNER")
                            }
                            className="gap-2 text-xs font-medium cursor-pointer"
                          >
                            <Crown className="h-3.5 w-3.5 text-amber-400" />
                            <span>Owner</span>
                            {member.role === "OWNER" && (
                              <Check className="ml-auto h-3.5 w-3.5 text-indigo-400" />
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleQuickRoleChange(member, "LEAD")
                            }
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
                    ) : (
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                          roleConfig.style,
                        )}
                      >
                        <RoleIcon className="h-2.5 w-2.5" />
                        <span>{roleConfig.label}</span>
                      </Badge>
                    )}

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
                  <th className="py-3 px-4">Other Teams</th>
                  <th className="py-3 px-4">Joined Date</th>
                  {isTeamOwnerOrLead && (
                    <th className="py-3 px-4 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredMembers.map((member) => {
                  const roleConfig =
                    ROLE_CONFIG[member.role] || ROLE_CONFIG.MEMBER;
                  const RoleIcon = roleConfig.icon;
                  const displayName = member.user?.name || member.name;
                  const displayEmail = member.user?.email || member.email;
                  const avatarSrc = getAvatarUrl(
                    member.user?.avatar || member.avatar,
                  );
                  const initials = getUserInitials(displayName, displayEmail);
                  const otherMemberships = (
                    member.user?.memberships || []
                  ).filter((m) => m.teamId !== currentTeam.id);

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
                        {isTeamOwnerOrLead ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="cursor-pointer">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "gap-1 px-2 py-0.5 text-[9px] font-bold uppercase",
                                    roleConfig.style,
                                  )}
                                >
                                  <RoleIcon className="h-2.5 w-2.5" />{" "}
                                  {roleConfig.label}
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
                                <Crown className="h-3 w-3 text-amber-400" />{" "}
                                Owner
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
                        ) : (
                          <Badge
                            variant="outline"
                            className={cn(
                              "gap-1 px-2 py-0.5 text-[9px] font-bold uppercase",
                              roleConfig.style,
                            )}
                          >
                            <RoleIcon className="h-2.5 w-2.5" />{" "}
                            {roleConfig.label}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {otherMemberships.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {otherMemberships.map((m) => (
                              <span
                                key={m.teamId}
                                className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground border border-white/5"
                              >
                                {m.teamKey || m.teamName}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/60">
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">
                        {member.createdAt
                          ? new Date(member.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      {isTeamOwnerOrLead && (
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
                      )}
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
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      theme.subtleBg,
                      theme.badgeText,
                    )}
                  >
                    <Edit3 className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold">Edit Team Member</h2>
                    <p className="text-[11px] text-muted-foreground">
                      Update member details and role in {currentTeam.name}
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
                    className={cn(
                      "gap-1.5 rounded-lg h-8 text-xs font-semibold text-white shadow-md cursor-pointer",
                      theme.gradient,
                      theme.gradientHover,
                    )}
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
                    <span className={theme.badgeText}>{currentTeam.name}</span>?
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

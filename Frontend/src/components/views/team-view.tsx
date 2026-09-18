import { AddMemberModal } from "@/components/modals/add-member-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { updateTeam, setActiveTeam } from "@/lib/redux/dataSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { cn } from "@/lib/utils";
import {
  TEAM_MEMBER_ROLES,
  MemberActions,
  MemberIdentity,
  MemberOtherTeams,
  MemberRoleControl,
  formatMemberJoined,
} from "./team-member-presentation";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Building2,
  AlertCircle,
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
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export function TeamView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const activeWorkspaceId = useAppSelector((s) => s.data.activeWorkspaceId);
  const activeTeamId = useAppSelector((s) => s.data.activeTeamId);
  const workspaces = useAppSelector((s) => s.data.workspaces);

  const activeWs = useMemo(() => {
    return workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  }, [workspaces, activeWorkspaceId]);

  const currentTeam = useMemo(() => {
    if (!activeWs?.teams || activeWs.teams.length === 0) return null;
    if (activeTeamId) {
      const found = activeWs.teams.find((t) => t.id === activeTeamId);
      if (found) return found;
    }
    return activeWs.teams[0] || null;
  }, [activeWs, activeTeamId]);

  // API Hooks
  const [updateTeamMutation, { isLoading: isUpdatingTeam }] = useUpdateTeamMutation();
  const {
    currentData: teamMembersRes,
    isFetching: isFetchingMembers,
    isError: isMembersError,
    refetch: refetchMembers,
  } = useGetTeamMembersQuery(currentTeam?.id || "", {
    skip: !currentTeam?.id,
  });

  const [updateMemberMutation, { isLoading: isUpdatingMember }] = useUpdateTeamMemberMutation();
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
    const query = searchQuery.trim().toLowerCase();
    return allMembers.filter((m) => {
      const name = m.user?.name || m.name || "";
      const email = m.user?.email || m.email || "";
      const matchSearch =
        !query ||
        name.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query);
      const matchRole = roleFilter === "ALL" || m.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [allMembers, searchQuery, roleFilter]);

  // Counts for quick metrics
  const totalCount = allMembers.length;
  const leadCount = allMembers.filter((m) => m.role === "LEAD").length;
  const ownerCount = allMembers.filter((m) => m.role === "OWNER").length;
  const memberCount = allMembers.filter((m) => m.role === "MEMBER").length;
  const isLoadingMembers = isFetchingMembers && !teamMembersRes && totalCount === 0;
  const hasFilters = Boolean(searchQuery.trim()) || roleFilter !== "ALL";

  useEffect(() => {
    setSearchQuery("");
    setRoleFilter("ALL");
    setAddModalOpen(false);
    setIsEditingTeam(false);
    setEditingMember(null);
    setMemberToDelete(null);
  }, [currentTeam?.id]);

  if (!currentTeam) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-border/80 bg-card p-8 text-center">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/8 text-primary"><Users className="h-6 w-6" /></span>
        <h1 className="text-base font-semibold text-foreground">Your team directory</h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          Choose a team from the workspace sidebar to see its people and roles.
        </p>
      </div>
    );
  }

  async function handleSaveTeamDetails() {
    if (!currentTeam || isUpdatingTeam) return;
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
    if (!currentTeam || isUpdatingMember) return;
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
    if (!currentTeam || isUpdatingMember || member.role === newRole) return;
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
    if (!currentTeam || !memberToDelete) return;
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

  function isCurrentUser(member: TeamMember) {
    return Boolean(user && (
      member.userId === user.id ||
      (user.email && member.email.toLowerCase() === user.email.toLowerCase())
    ));
  }

  function clearFilters() {
    setSearchQuery("");
    setRoleFilter("ALL");
  }

  const roleFilters = [
    { key: "ALL", label: "All members", count: totalCount },
    { key: "OWNER", label: "Owners", count: ownerCount },
    { key: "LEAD", label: "Leads", count: leadCount },
    { key: "MEMBER", label: "Members", count: memberCount },
  ] as const;

  return (
    <div className="space-y-5">
      <header className="space-y-4">
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate" title={activeWs?.name}>{activeWs?.name || "Workspace"}</span>
          <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
          <span className="shrink-0 font-medium text-foreground">Team members</span>
        </div>

        <div className="flex flex-col gap-5 rounded-2xl border border-border/80 bg-card p-5 shadow-xs sm:p-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/5 text-2xl" aria-hidden="true">
              {currentTeam.icon || "👥"}
            </span>
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
                <h1 className="max-w-full truncate text-xl font-semibold tracking-tight text-foreground" title={currentTeam.name}>{currentTeam.name}</h1>
                <span className="max-w-28 truncate rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground" title={currentTeam.key}>{currentTeam.key}</span>
                {activeWs && activeWs.teams.length > 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" aria-label="Switch team" title="Switch team" className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary">
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64 rounded-xl p-1.5">
                      <DropdownMenuLabel className="text-[11px] font-medium text-muted-foreground">Teams in {activeWs.name}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="max-h-64 overflow-y-auto">
                        {activeWs.teams.map((team) => (
                          <DropdownMenuItem
                            key={team.id}
                            onSelect={() => {
                              dispatch(setActiveTeam(team.id));
                              const wsSlug = activeWs.slug || activeWs.id;
                              const teamSlug = team.slug || (team.key ? team.key.toLowerCase() : team.id);
                              void router.push(`/${wsSlug}/${teamSlug}`);
                            }}
                            className="cursor-pointer gap-2.5 rounded-lg py-2 text-xs"
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted" aria-hidden="true">{team.icon || "👥"}</span>
                            <span className="min-w-0 flex-1 truncate">{team.name}</span>
                            {team.id === currentTeam.id && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">The people, roles, and shared work behind your team.</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {isTeamOwnerOrLead ? (
              <>
                <Button type="button" variant="outline" onClick={() => {
                  setEditTeamName(currentTeam.name);
                  setEditTeamKey(currentTeam.key);
                  setIsEditingTeam(true);
                }} className="h-10 cursor-pointer gap-2 rounded-lg bg-background text-xs shadow-none">
                  <Edit3 className="h-3.5 w-3.5" /> Edit team
                </Button>
                <Button type="button" onClick={() => setAddModalOpen(true)} className="h-10 cursor-pointer gap-2 rounded-lg px-4 text-xs shadow-sm">
                  <UserPlus className="h-3.5 w-3.5" /> Assign members
                </Button>
              </>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" /> View-only access
              </span>
            )}
          </div>
        </div>
      </header>

      <Card className="gap-0 overflow-hidden rounded-2xl border-border/80 bg-card py-0 shadow-xs">
        <div className="flex flex-col gap-4 px-4 py-5 sm:px-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">Members</h2>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-muted px-1.5 text-[10px] font-medium tabular-nums text-muted-foreground">{isLoadingMembers ? "—" : totalCount}</span>
              {isFetchingMembers && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" aria-label="Refreshing members" />}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Find a teammate or manage their role.</p>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:min-w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} aria-label="Search team members" placeholder="Search name or email…" className="h-10 rounded-lg bg-background pl-9 pr-9 text-sm shadow-none [&::-webkit-search-cancel-button]:appearance-none" />
              {searchQuery && <button type="button" onClick={() => setSearchQuery("")} aria-label="Clear member search" className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"><X className="h-3.5 w-3.5" /></button>}
            </div>
            <div role="group" aria-label="Member layout" className="flex h-10 shrink-0 items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-1">
              {([
                { mode: "grid", label: "Card view", icon: LayoutGrid },
                { mode: "table", label: "Table view", icon: List },
              ] as const).map(({ mode, label, icon: Icon }) => (
                <button key={mode} type="button" onClick={() => setViewMode(mode)} aria-label={label} aria-pressed={viewMode === mode} title={label} className={cn("flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-primary", viewMode === mode ? "bg-background text-foreground shadow-xs ring-1 ring-border/60" : "text-muted-foreground hover:text-foreground")}>
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 pb-4 sm:px-5">
          <div role="group" aria-label="Filter members by role" className="flex flex-wrap items-center gap-1">
            {roleFilters.map((role) => (
              <button key={role.key} type="button" onClick={() => setRoleFilter(role.key)} aria-pressed={roleFilter === role.key} className={cn("flex h-8 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary", roleFilter === role.key ? "bg-primary/8 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                {role.label}
                <span className={cn("rounded px-1 text-[10px] tabular-nums", roleFilter === role.key ? "bg-primary/10" : "bg-muted")}>{isLoadingMembers ? "—" : role.count}</span>
              </button>
            ))}
          </div>
          {hasFilters && <button type="button" onClick={clearFilters} className="flex cursor-pointer items-center gap-1 rounded px-1 py-1 text-[11px] text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"><X className="h-3 w-3" /> Clear filters</button>}
        </div>

        {isMembersError && (
          <div role="alert" className="flex flex-wrap items-center gap-2 border-b border-border bg-destructive/5 px-5 py-3 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            <span className="min-w-0 flex-1 text-muted-foreground">Couldn’t refresh team members. Try again to load the latest list.</span>
            <Button type="button" variant="outline" size="sm" disabled={isFetchingMembers} onClick={() => void refetchMembers()} className="h-8 cursor-pointer rounded-lg text-xs">Try again</Button>
          </div>
        )}

        {isLoadingMembers ? (
          <div role="status" aria-label="Loading team members" className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,250px),1fr))] gap-4 bg-muted/15 p-4 sm:p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-border/80 bg-card p-4">
                <div className="flex items-center gap-3"><Skeleton className="h-10 w-10 shrink-0 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-3/5" /><Skeleton className="h-2.5 w-4/5" /></div></div>
                <Skeleton className="mt-5 h-3 w-1/2" />
                <div className="mt-4 flex justify-between border-t border-border/60 pt-3"><Skeleton className="h-6 w-20 rounded-md" /><Skeleton className="h-3 w-16 self-center" /></div>
              </div>
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-muted/60 text-muted-foreground">
              {isMembersError ? <AlertCircle className="h-5 w-5" /> : hasFilters ? <Search className="h-5 w-5" /> : <Users className="h-5 w-5" />}
            </span>
            <h3 className="text-sm font-semibold">{isMembersError ? "Member directory unavailable" : hasFilters ? "No matching members" : "Build your team"}</h3>
            <p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">
              {isMembersError ? "Refresh the directory to see this team's members." : hasFilters ? "Try another name, email address, or role." : "Add people from the directory or by email to start working together."}
            </p>
            {!isMembersError && (hasFilters ? (
              <Button type="button" variant="outline" onClick={clearFilters} className="mt-5 h-9 cursor-pointer rounded-lg text-xs">Clear filters</Button>
            ) : isTeamOwnerOrLead && (
              <Button type="button" onClick={() => setAddModalOpen(true)} className="mt-5 h-9 cursor-pointer gap-2 rounded-lg text-xs"><UserPlus className="h-3.5 w-3.5" /> Assign members</Button>
            ))}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,250px),1fr))] gap-4 bg-muted/15 p-4 sm:p-5">
            {filteredMembers.map((member) => (
              <article key={member.id} className="flex min-w-0 flex-col rounded-xl border border-border/80 bg-card p-4 transition-colors hover:border-primary/25">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1"><MemberIdentity member={member} isCurrentUser={isCurrentUser(member)} /></div>
                  {isTeamOwnerOrLead && <MemberActions member={member} disabled={isUpdatingMember || isDeletingMember} onEdit={handleStartEditMember} onRemove={setMemberToDelete} />}
                </div>
                <div className="mt-5 flex min-h-6 min-w-0 items-center gap-2">
                  <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                  <MemberOtherTeams member={member} teamId={currentTeam.id} />
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
                  <MemberRoleControl member={member} canManage={isTeamOwnerOrLead} disabled={isUpdatingMember} onChange={handleQuickRoleChange} />
                  <span className="text-[10px] text-muted-foreground" title={`Joined ${formatMemberJoined(member.createdAt)}`}>{member.createdAt ? `Joined ${formatMemberJoined(member.createdAt, true)}` : "Joined —"}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div role="region" aria-label="Team members table" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary">
            <table className="w-full min-w-[620px] text-left text-xs">
              <caption className="sr-only">Members of {currentTeam.name}, with their team roles and join dates</caption>
              <thead className="border-b border-border/70 bg-muted/35 text-[11px] font-medium text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">Member</th>
                  <th scope="col" className="px-4 py-3 font-medium">Team role</th>
                  <th scope="col" className="px-4 py-3 font-medium">Other teams</th>
                  <th scope="col" className="px-4 py-3 font-medium">Joined</th>
                  {isTeamOwnerOrLead && <th scope="col" className="w-14 px-4 py-3"><span className="sr-only">Actions</span></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="transition-colors hover:bg-muted/25">
                    <td className="max-w-72 px-5 py-4"><MemberIdentity member={member} isCurrentUser={isCurrentUser(member)} /></td>
                    <td className="px-4 py-4"><MemberRoleControl member={member} canManage={isTeamOwnerOrLead} disabled={isUpdatingMember} onChange={handleQuickRoleChange} /></td>
                    <td className="px-4 py-4"><MemberOtherTeams member={member} teamId={currentTeam.id} /></td>
                    <td className="whitespace-nowrap px-4 py-4 text-[11px] text-muted-foreground">{formatMemberJoined(member.createdAt)}</td>
                    {isTeamOwnerOrLead && <td className="px-4 py-4 text-right"><MemberActions member={member} disabled={isUpdatingMember || isDeletingMember} onEdit={handleStartEditMember} onRemove={setMemberToDelete} /></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 px-5 py-3 text-[11px] text-muted-foreground">
          <p aria-live="polite">{isLoadingMembers ? "Loading members…" : isMembersError && !totalCount ? "Member count unavailable" : `Showing ${filteredMembers.length} of ${totalCount} ${totalCount === 1 ? "member" : "members"}`}</p>
          <span className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> Roles apply to this team</span>
        </div>
      </Card>

      <AddMemberModal open={addModalOpen} onClose={() => setAddModalOpen(false)} team={{ id: currentTeam.id, name: currentTeam.name, key: currentTeam.key, icon: currentTeam.icon }} />

      <Dialog open={isEditingTeam} onOpenChange={(open) => !isUpdatingTeam && setIsEditingTeam(open)}>
        <DialogContent className="max-h-[90dvh] gap-5 overflow-y-auto rounded-2xl border-border/80 p-6 sm:max-w-md" showCloseButton={!isUpdatingTeam}>
          <div>
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8 text-primary"><Edit3 className="h-4 w-4" /></span>
            <DialogTitle className="text-base">Edit team</DialogTitle>
            <DialogDescription className="mt-2 text-xs leading-5">Keep your team name and key easy to recognize.</DialogDescription>
          </div>
          <form onSubmit={(event) => { event.preventDefault(); void handleSaveTeamDetails(); }} className="space-y-4">
            <fieldset disabled={isUpdatingTeam} className="space-y-4">
              <label className="block space-y-1.5"><span className="text-xs font-medium">Team name</span><Input value={editTeamName} onChange={(event) => setEditTeamName(event.target.value)} required className="h-10 rounded-lg" /></label>
              <label className="block space-y-1.5"><span className="text-xs font-medium">Team key</span><Input value={editTeamKey} onChange={(event) => setEditTeamKey(event.target.value.toUpperCase())} maxLength={10} placeholder="TEAM" className="h-10 rounded-lg uppercase" /><span className="block text-[11px] text-muted-foreground">A short identifier, up to 10 characters.</span></label>
            </fieldset>
            <div className="flex justify-end gap-2 border-t border-border/70 pt-4">
              <Button type="button" variant="outline" disabled={isUpdatingTeam} onClick={() => setIsEditingTeam(false)} className="h-9 cursor-pointer rounded-lg text-xs">Cancel</Button>
              <Button type="submit" disabled={isUpdatingTeam} className="h-9 cursor-pointer gap-2 rounded-lg text-xs">{isUpdatingTeam && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{isUpdatingTeam ? "Saving…" : "Save changes"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingMember)} onOpenChange={(open) => !open && !isUpdatingMember && setEditingMember(null)}>
        <DialogContent className="max-h-[90dvh] gap-5 overflow-y-auto rounded-2xl border-border/80 p-6 sm:max-w-md" showCloseButton={!isUpdatingMember}>
          <div>
            <DialogTitle className="text-base">Edit member</DialogTitle>
            <DialogDescription className="mt-2 text-xs leading-5">Update their details and role in {currentTeam.name}.</DialogDescription>
          </div>
          {editingMember && <div className="rounded-xl border border-border/70 bg-muted/30 p-3"><MemberIdentity member={editingMember} isCurrentUser={isCurrentUser(editingMember)} /></div>}
          <form onSubmit={handleSaveMemberEdit} className="space-y-4">
            <fieldset disabled={isUpdatingMember} className="space-y-4">
              <label className="block space-y-1.5"><span className="text-xs font-medium">Full name</span><Input value={editMemName} onChange={(event) => setEditMemName(event.target.value)} required className="h-10 rounded-lg" /></label>
              <label className="block space-y-1.5"><span className="text-xs font-medium">Email address</span><Input type="email" value={editMemEmail} onChange={(event) => setEditMemEmail(event.target.value)} required className="h-10 rounded-lg" /></label>
              <label className="block space-y-1.5">
                <span className="text-xs font-medium">Team role</span>
                <select value={editMemRole} onChange={(event) => setEditMemRole(event.target.value as TeamMember["role"])} className="h-10 w-full cursor-pointer rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50">
                  {TEAM_MEMBER_ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                </select>
              </label>
            </fieldset>
            <div className="flex justify-end gap-2 border-t border-border/70 pt-4">
              <Button type="button" variant="outline" disabled={isUpdatingMember} onClick={() => setEditingMember(null)} className="h-9 cursor-pointer rounded-lg text-xs">Cancel</Button>
              <Button type="submit" disabled={isUpdatingMember} className="h-9 cursor-pointer gap-2 rounded-lg text-xs">{isUpdatingMember && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{isUpdatingMember ? "Saving…" : "Save changes"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(memberToDelete)} onOpenChange={(open) => !open && !isDeletingMember && setMemberToDelete(null)}>
        <AlertDialogContent className="rounded-2xl border-border/80 sm:max-w-md">
          <AlertDialogHeader className="text-left">
            <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></span>
            <AlertDialogTitle className="text-base">Remove from team?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-5">
              <strong className="font-medium text-foreground">{memberToDelete?.user?.name || memberToDelete?.name}</strong> will be removed from {currentTeam.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-1 border-t border-border/70 pt-4">
            <AlertDialogCancel disabled={isDeletingMember} className="h-9 cursor-pointer rounded-lg text-xs">Cancel</AlertDialogCancel>
            <Button type="button" variant="destructive" disabled={isDeletingMember} onClick={handleConfirmRemoveMember} className="h-9 cursor-pointer gap-2 rounded-lg text-xs">
              {isDeletingMember && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{isDeletingMember ? "Removing…" : "Remove member"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

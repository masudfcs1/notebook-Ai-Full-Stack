"use client";

import { useState, useEffect, useMemo, useId } from "react";
import {
  UserPlus,
  Users,
  Search,
  X,
  Plus,
  Trash2,
  Loader2,
  Mail,
  UserCheck,
  Crown,
  Shield,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn, getAvatarUrl, getUserInitials } from "@/lib/utils";
import {
  useGetAvailableUsersForTeamQuery,
  useAddTeamMemberMutation,
  useAddTeamMembersBulkMutation,
  type TeamMemberUser,
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

const MEMBER_ROLES = [
  {
    value: "MEMBER",
    label: "Member",
    description: "Contribute to the team's work.",
    icon: Users,
  },
  {
    value: "LEAD",
    label: "Lead",
    description: "Coordinate the team and its tasks.",
    icon: Shield,
  },
  {
    value: "OWNER",
    label: "Owner",
    description: "Manage the team and its members.",
    icon: Crown,
  },
] as const;

export function AddMemberModal({ open, onClose, team }: AddMemberModalProps) {
  const dispatch = useAppDispatch();
  const formId = useId();
  const [activeTab, setActiveTab] = useState<"directory" | "manual">("directory");

  // Directory Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsersById, setSelectedUsersById] = useState<
    Map<number, TeamMemberUser>
  >(new Map());
  const [selectedRole, setSelectedRole] = useState<ManualMemberRow["role"]>("MEMBER");

  // Members added by email
  const [manualRows, setManualRows] = useState<ManualMemberRow[]>([
    { id: "row-1", name: "", email: "", role: "MEMBER" },
  ]);

  // API Hooks
  const {
    currentData: availableUsersRes,
    isFetching: isFetchingUsers,
    isError: isUsersError,
    refetch: refetchUsers,
  } = useGetAvailableUsersForTeamQuery(
    { teamId: team.id, search: searchQuery },
    { skip: !open || !team.id, refetchOnMountOrArgChange: true }
  );

  const [addMemberMutation, { isLoading: isAddingSingle }] = useAddTeamMemberMutation();
  const [addBulkMutation, { isLoading: isAddingBulk }] = useAddTeamMembersBulkMutation();

  const isSubmitting = isAddingSingle || isAddingBulk;
  const availableUsers = useMemo(() => availableUsersRes?.data || [], [availableUsersRes]);
  const selectedUsers = Array.from(selectedUsersById.values());
  const selectedCount = selectedUsers.length;
  const allVisibleSelected =
    availableUsers.length > 0 &&
    availableUsers.every((user) => selectedUsersById.has(user.id));
  const isLoadingUsers = isFetchingUsers && !availableUsersRes;
  const selectedRoleLabel = MEMBER_ROLES.find((role) => role.value === selectedRole)!.label;

  // Start a fresh assignment whenever the dialog opens or the team changes.
  useEffect(() => {
    if (open) {
      setSelectedUsersById(new Map());
      setSearchQuery("");
      setActiveTab("directory");
      setSelectedRole("MEMBER");
      setManualRows([{ id: "row-1", name: "", email: "", role: "MEMBER" }]);
    }
  }, [open, team.id]);

  // Toggle selection for a user
  function toggleUserSelection(user: TeamMemberUser) {
    setSelectedUsersById((prev) => {
      const next = new Map(prev);
      if (next.has(user.id)) {
        next.delete(user.id);
      } else {
        next.set(user.id, user);
      }
      return next;
    });
  }

  // Keep selections from other searches when toggling the visible results.
  function handleSelectAll() {
    setSelectedUsersById((prev) => {
      const next = new Map(prev);
      for (const user of availableUsers) {
        if (allVisibleSelected) next.delete(user.id);
        else next.set(user.id, user);
      }
      return next;
    });
  }

  // Handle adding selected directory users
  async function handleAddSelectedUsers() {
    if (isSubmitting) return;
    if (selectedCount === 0) {
      toast.error("Please select at least one user to assign");
      return;
    }

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

  // Handle members added by email
  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

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
      toast.error(err?.data?.message || err?.message || "Failed to add members");
    }
  }

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90dvh] w-[calc(100%_-_2rem)] flex-col gap-0 overflow-hidden rounded-2xl border-border/80 bg-background p-0 shadow-2xl sm:max-w-3xl"
      >
        <div className="flex shrink-0 items-start gap-3 border-b border-border/70 px-5 py-5 sm:px-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/8 text-primary">
            <UserPlus className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-lg leading-6 tracking-tight">Assign members</DialogTitle>
            <DialogDescription className="mt-1 text-xs leading-5">
              Bring people into your team and give them the right role.
            </DialogDescription>
            <div className="mt-2 flex min-w-0 items-center gap-1.5 text-xs">
              <span className="shrink-0" aria-hidden="true">{team.icon || "👥"}</span>
              <span className="truncate font-medium text-foreground" title={team.name}>{team.name}</span>
              <span className="max-w-24 truncate rounded border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground" title={team.key}>
                {team.key}
              </span>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={handleClose} disabled={isSubmitting} aria-label="Close assign members" className="-mr-1 -mt-1 h-8 w-8 shrink-0 cursor-pointer rounded-lg text-muted-foreground">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form
          id={formId}
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            if (activeTab === "manual") {
              void handleManualSubmit(event);
            } else {
              event.preventDefault();
              void handleAddSelectedUsers();
            }
          }}
        >
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "directory" | "manual")} className="min-h-0 flex-1 gap-0">
            <div className="shrink-0 px-5 py-4 sm:px-6">
              <TabsList aria-label="Choose how to add members" className="grid h-10 w-full grid-cols-2 rounded-xl bg-muted/70 p-1 sm:w-fit sm:min-w-80">
                <TabsTrigger value="directory" disabled={isSubmitting} className="cursor-pointer gap-2 rounded-lg px-4 text-xs">
                  <Users className="h-3.5 w-3.5" /> Directory
                </TabsTrigger>
                <TabsTrigger value="manual" disabled={isSubmitting} className="cursor-pointer gap-2 rounded-lg px-4 text-xs">
                  <Mail className="h-3.5 w-3.5" /> Add by email
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="directory" className="min-h-0 overflow-y-auto px-5 pb-5 sm:px-6">
              <div className="grid gap-5 md:h-[min(27rem,50dvh)] md:grid-cols-[minmax(0,1fr)_220px]">
                <section aria-label="Available people" className="flex min-h-0 min-w-0 flex-col">
                  <div className="relative shrink-0">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      aria-label="Search members by name or email"
                      placeholder="Search by name or email…"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      disabled={isSubmitting}
                      className="h-10 rounded-lg bg-background pl-9 pr-9 text-sm shadow-none [&::-webkit-search-cancel-button]:appearance-none"
                    />
                    {isFetchingUsers ? (
                      <Loader2 aria-label="Searching members" className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
                    ) : searchQuery && (
                      <button type="button" onClick={() => setSearchQuery("")} disabled={isSubmitting} aria-label="Clear search" className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex h-11 shrink-0 items-center justify-between gap-2 text-[11px]">
                    <p className="text-muted-foreground" aria-live="polite">
                      {isLoadingUsers ? "Finding people…" : isUsersError ? "Directory unavailable" : `${availableUsers.length} ${availableUsers.length === 1 ? "person" : "people"} shown`}
                    </p>
                    {availableUsers.length > 0 && !isUsersError && (
                      <button type="button" onClick={handleSelectAll} disabled={isSubmitting || isLoadingUsers} className="cursor-pointer rounded px-1 py-1 font-medium text-primary transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50">
                        {allVisibleSelected ? "Deselect shown" : "Select all shown"}
                      </button>
                    )}
                  </div>

                  <div className="min-h-52 max-h-80 flex-1 overflow-y-auto rounded-xl border border-border/80 bg-card scrollbar-thin md:min-h-0 md:max-h-none" aria-busy={isFetchingUsers}>
                    {isLoadingUsers ? (
                      <div className="divide-y divide-border/60" role="status" aria-label="Loading available members">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <div key={index} className="flex items-center gap-3 px-3 py-4">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-3 w-2/3" />
                              <Skeleton className="h-2.5 w-5/6" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : isUsersError ? (
                      <div className="flex h-full min-h-52 flex-col items-center justify-center px-6 py-8 text-center" role="alert">
                        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground"><AlertCircle className="h-5 w-5" /></span>
                        <p className="text-sm font-medium">Couldn’t load the directory</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">Try again to see available people.</p>
                        <Button type="button" variant="outline" size="sm" onClick={() => void refetchUsers()} className="mt-4 cursor-pointer rounded-lg text-xs">Try again</Button>
                      </div>
                    ) : availableUsers.length === 0 ? (
                      <div className="flex h-full min-h-52 flex-col items-center justify-center px-6 py-8 text-center">
                        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                          {searchQuery ? <Search className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
                        </span>
                        <p className="text-sm font-medium">{searchQuery ? "No matching people" : "No people available"}</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {searchQuery ? "Try another name or email address." : "You can also add someone by their email address."}
                        </p>
                        <Button type="button" variant="outline" size="sm" disabled={isSubmitting} onClick={() => searchQuery ? setSearchQuery("") : setActiveTab("manual")} className="mt-4 cursor-pointer rounded-lg text-xs">
                          {searchQuery ? "Clear search" : "Add by email"}
                        </Button>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/60">
                        {availableUsers.map((user) => {
                          const isSelected = selectedUsersById.has(user.id);
                          const memberships = user.memberships || [];
                          const name = user.name || user.email.split("@")[0];
                          const avatar = getAvatarUrl(user.avatar);
                          return (
                            <label key={user.id} className={cn("flex cursor-pointer items-start gap-3 px-3 py-3.5 transition-colors focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary/50", isSelected ? "bg-primary/5 hover:bg-primary/8" : "hover:bg-muted/50", isSubmitting && "pointer-events-none opacity-60")}>
                              <input type="checkbox" checked={isSelected} onChange={() => toggleUserSelection(user)} disabled={isSubmitting} aria-label={`Select ${name}, ${user.email}`} className="mt-2.5 h-4 w-4 shrink-0 cursor-pointer accent-primary" />
                              <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border/60">
                                {avatar && <AvatarImage src={avatar} alt="" />}
                                <AvatarFallback className="bg-primary/8 text-[11px] font-semibold text-primary">{getUserInitials(user.name, user.email)}</AvatarFallback>
                              </Avatar>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[13px] font-medium text-foreground" title={name}>{name}</span>
                                <span className="mt-0.5 block truncate text-[11px] text-muted-foreground" title={user.email}>{user.email}</span>
                                {memberships.length > 0 && (
                                  <span className="mt-2 flex min-w-0 items-center gap-1.5" title={memberships.map((membership) => `${membership.teamName} · ${membership.role.toLowerCase()}`).join(", ")}>
                                    <span className="max-w-40 truncate rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{memberships[0].teamName}</span>
                                    {memberships.length > 1 && <span className="text-[10px] text-muted-foreground">+{memberships.length - 1}</span>}
                                  </span>
                                )}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>

                <aside className="min-h-0 min-w-0 space-y-4 rounded-xl bg-muted/35 p-4 md:overflow-y-auto">
                  <fieldset disabled={isSubmitting}>
                    <legend className="text-xs font-semibold text-foreground">Team role</legend>
                    <p className="mb-3 mt-1 text-[11px] leading-4 text-muted-foreground">Applies to everyone selected.</p>
                    <div className="space-y-2">
                      {MEMBER_ROLES.map((role) => {
                        const Icon = role.icon;
                        return (
                          <label key={role.value} className={cn("flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 transition-colors focus-within:ring-2 focus-within:ring-primary/40", selectedRole === role.value ? "border-primary/30 bg-background shadow-xs" : "border-transparent hover:bg-background/70", isSubmitting && "opacity-60")}>
                            <input type="radio" name={`${formId}-role`} value={role.value} checked={selectedRole === role.value} onChange={() => setSelectedRole(role.value)} className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer accent-primary" />
                            <span className="min-w-0">
                              <span className="flex items-center gap-1.5 text-xs font-medium"><Icon className="h-3 w-3 text-muted-foreground" />{role.label}</span>
                              <span className="mt-1 block text-[11px] leading-4 text-muted-foreground">{role.description}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                  <div className="border-t border-border/70 pt-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold" aria-live="polite">Selected <span className="ml-1 text-muted-foreground">{selectedCount}</span></p>
                      {selectedCount > 0 && <button type="button" disabled={isSubmitting} onClick={() => setSelectedUsersById(new Map())} className="cursor-pointer rounded text-[10px] font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary">Clear all</button>}
                    </div>
                    {selectedCount === 0 ? (
                      <p className="text-[11px] leading-5 text-muted-foreground">Choose people from the directory to get started.</p>
                    ) : (
                      <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto scrollbar-thin">
                        {selectedUsers.map((user) => (
                          <button key={user.id} type="button" disabled={isSubmitting} onClick={() => toggleUserSelection(user)} aria-label={`Remove ${user.name || user.email} from selection`} title={user.email} className="flex max-w-full cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[10px] text-foreground hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50">
                            <span className="truncate">{user.name || user.email}</span><X className="h-3 w-3 shrink-0 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </aside>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="min-h-0 overflow-y-auto px-5 pb-5 sm:px-6">
              <div className="md:min-h-[min(27rem,50dvh)]">
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-border/70 bg-muted/30 p-3.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs font-medium">Add people by their email address</p>
                    <p className="mt-1 text-[11px] leading-5 text-muted-foreground">Choose a role for each person. Existing accounts are linked automatically.</p>
                  </div>
                </div>
                <fieldset disabled={isSubmitting} className="space-y-3">
                  <legend className="sr-only">Member details</legend>
                  {manualRows.map((row, index) => (
                    <div key={row.id} className="rounded-xl border border-border/80 bg-card p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/8 text-[10px] font-semibold tabular-nums text-primary">{index + 1}</span>
                          <p className="text-xs font-semibold">Member details</p>
                        </div>
                        {manualRows.length > 1 && (
                          <button type="button" onClick={() => removeManualRow(row.id)} aria-label={`Remove member ${index + 1}`} className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:outline-2 focus-visible:outline-primary">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_110px]">
                        <label className="min-w-0 space-y-1.5">
                          <span className="block text-[11px] font-medium">Full name <span className="font-normal text-muted-foreground">(optional)</span></span>
                          <Input type="text" autoComplete="off" placeholder="e.g. Alex Morgan" value={row.name} onChange={(event) => updateManualRow(row.id, "name", event.target.value)} className="h-10 rounded-lg bg-background text-sm shadow-none" />
                        </label>
                        <label className="min-w-0 space-y-1.5">
                          <span className="block text-[11px] font-medium">Email address <span className="text-muted-foreground">*</span></span>
                          <Input type="email" autoComplete="off" placeholder="name@company.com" value={row.email} required onChange={(event) => updateManualRow(row.id, "email", event.target.value)} className="h-10 rounded-lg bg-background text-sm shadow-none" />
                        </label>
                        <label className="min-w-0 space-y-1.5">
                          <span className="block text-[11px] font-medium">Team role</span>
                          <select value={row.role} onChange={(event) => updateManualRow(row.id, "role", event.target.value)} className="h-10 w-full min-w-0 cursor-pointer rounded-lg border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50">
                            {MEMBER_ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                          </select>
                        </label>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addManualRow} className="h-10 w-full cursor-pointer gap-2 rounded-lg border-dashed bg-transparent text-xs text-muted-foreground hover:text-foreground">
                    <Plus className="h-3.5 w-3.5" /> Add another person
                  </Button>
                </fieldset>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border/70 bg-muted/20 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
              <Users className="h-4 w-4 shrink-0" />
              {activeTab === "directory" ? (
                <span><strong className="font-semibold text-foreground">{selectedCount} selected</strong>{selectedCount > 0 && <span> · {selectedRoleLabel}</span>}</span>
              ) : (
                <span><strong className="font-semibold text-foreground">{manualRows.length} {manualRows.length === 1 ? "person" : "people"}</strong> to add</span>
              )}
            </div>
            <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting} className="h-10 flex-1 cursor-pointer rounded-lg bg-background px-4 text-xs sm:flex-none">Cancel</Button>
              <Button type="submit" disabled={isSubmitting || (activeTab === "directory" && selectedCount === 0)} className="h-10 flex-1 cursor-pointer gap-2 rounded-lg px-4 text-xs shadow-sm sm:flex-none">
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isSubmitting ? "Adding members…" : activeTab === "directory" ? `Assign ${selectedCount > 0 ? `${selectedCount} ` : ""}${selectedCount === 1 ? "member" : "members"}` : `Add ${manualRows.length === 1 ? "member" : `${manualRows.length} members`}`}
                {!isSubmitting && <ArrowRight className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

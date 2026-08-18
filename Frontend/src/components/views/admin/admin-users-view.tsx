"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Trash2,
  Shield,
  UserCog,
  Filter,
  Building2,
  Eye,
  RotateCcw,
  AlertCircle,
  X,
  LoaderCircle,
} from "lucide-react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setView, setSelectedAdminUserId } from "@/lib/redux/appSlice";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
} from "@/lib/redux/api/adminApiSlice";
import type { GetUsersParams } from "@/lib/redux/api/adminApiSlice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { getRoleConfig, getStatusConfig, ADMIN_ROLES } from "@/constants/admin";
import { getAvatarUrl } from "@/lib/utils";

const ROLE_OPTIONS = ["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE", "USER"];
const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"];

export function AdminUsersView() {
  const dispatch = useAppDispatch();
  const [params, setParams] = useState<GetUsersParams>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [searchInput, setSearchInput] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Form state for create user
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("USER");
  const [formStatus, setFormStatus] = useState("ACTIVE");

  const {
    data: usersResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetUsersQuery(params);
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateRole] = useUpdateUserRoleMutation();
  const [updateStatus] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  const users = usersResponse?.data || [];
  const meta = usersResponse?.meta;
  const currentPage = params.page || 1;
  const isLoadingFirstPage = isLoading && users.length === 0;
  const isLoadingMore = isFetching && currentPage > 1;
  const errorStatus =
    error && typeof error === "object" && "status" in error
      ? error.status
      : undefined;
  const errorMessage =
    errorStatus === "FETCH_ERROR"
      ? "The backend API is unavailable. Start the full application and try again."
      : errorStatus === 401
        ? "Your session has expired. Please sign in again."
        : errorStatus === 403
          ? "Your account does not have permission to view the user directory."
          : "The server could not return the user directory. Please try again.";

  // Auto-sync searchInput with params.search (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((p) => {
        const nextSearch = searchInput.trim() || undefined;
        if (p.search === nextSearch) return p;
        return { ...p, page: 1, search: nextSearch };
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !meta?.hasNext || isFetching || isError) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setParams((previous) => ({
          ...previous,
          page: (previous.page || 1) + 1,
        }));
      },
      { rootMargin: "280px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [isError, isFetching, meta?.hasNext, meta?.page]);

  const handleSearch = () => {
    setParams((p) => ({
      ...p,
      page: 1,
      search: searchInput.trim() || undefined,
    }));
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setParams({
      page: 1,
      limit: 20,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  const handleRoleFilter = (role: string) => {
    setParams((p) => ({
      ...p,
      page: 1,
      role: role === "ALL" ? undefined : role,
    }));
  };

  const handleStatusFilter = (status: string) => {
    setParams((p) => ({
      ...p,
      page: 1,
      status: status === "ALL" ? undefined : status,
    }));
  };

  const handleCreateUser = async () => {
    try {
      await createUser({
        name: formName || undefined,
        email: formEmail,
        password: formPassword,
        role: formRole,
        status: formStatus,
      }).unwrap();
      setCreateOpen(false);
      setFormName("");
      setFormEmail("");
      setFormPassword("");
      setFormRole("USER");
      setFormStatus("ACTIVE");
      setParams((previous) => ({ ...previous, page: 1 }));
      toast.success("User created successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create user");
    }
  };

  const handleUserClick = (userId: number) => {
    dispatch(setSelectedAdminUserId(userId));
    dispatch(setView("admin-user-detail"));
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id).unwrap();
      toast.success("User deleted successfully");
      setDeleteTarget(null);
      setParams((previous) => ({ ...previous, page: 1 }));
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete user");
    }
  };

  const handleUpdateRole = async (userId: number, role: string) => {
    try {
      await updateRole({ userId, role }).unwrap();
      toast.success("User role updated successfully");
      setParams((previous) => ({ ...previous, page: 1 }));
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update role");
    }
  };

  const handleUpdateStatus = async (userId: number, status: string) => {
    try {
      await updateStatus({ userId, status }).unwrap();
      toast.success("User status updated successfully");
      setParams((previous) => ({ ...previous, page: 1 }));
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage all platform users, assign roles, and control access
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl  from-rose-500 to-amber-500 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 hover:opacity-90 transition-opacity cursor-pointer">
              <Plus className="h-4 w-4" /> Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-popover border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Create New User
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Add a new user to the platform with role and status.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-xs text-foreground/80">Full Name</Label>
                <Input
                  className="mt-1 border-border bg-muted text-foreground placeholder:text-muted-foreground"
                  placeholder="John Doe"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-foreground/80">Email *</Label>
                <Input
                  className="mt-1 border-border bg-muted text-foreground placeholder:text-muted-foreground"
                  placeholder="john@example.com"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-foreground/80">Password *</Label>
                <Input
                  className="mt-1 border-border bg-muted text-foreground placeholder:text-muted-foreground"
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-foreground/80">Role</Label>
                  <Select value={formRole} onValueChange={setFormRole}>
                    <SelectTrigger className="mt-1 border-border bg-muted text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-muted border-border">
                      {ROLE_OPTIONS.map((r) => (
                        <SelectItem
                          key={r}
                          value={r}
                          className="text-foreground"
                        >
                          {getRoleConfig(r).label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-foreground/80">Status</Label>
                  <Select value={formStatus} onValueChange={setFormStatus}>
                    <SelectTrigger className="mt-1 border-border bg-muted text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-muted border-border">
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem
                          key={s}
                          value={s}
                          className="text-foreground"
                        >
                          {getStatusConfig(s).label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={handleCreateUser}
                disabled={!formEmail || !formPassword || isCreating}
                className="w-full rounded-xl  from-rose-500 to-amber-500 font-semibold text-white hover:opacity-90 cursor-pointer"
              >
                {isCreating ? "Creating…" : "Create User"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/60 bg-card/70 p-4 backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="border-border/60 bg-muted/40 pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground"
                placeholder="Search by name, email, or username…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer rounded-full hover:bg-muted"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={params.role || "ALL"}
                onValueChange={handleRoleFilter}
              >
                <SelectTrigger className="h-9 w-35 border-border/60 bg-muted/40 text-xs text-foreground">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent className="bg-muted border-border">
                  <SelectItem value="ALL" className="text-foreground">
                    All Roles
                  </SelectItem>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r} className="text-foreground">
                      {getRoleConfig(r).label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={params.status || "ALL"}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="h-9 w-35 border-border/60 bg-muted/40 text-xs text-foreground">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-muted border-border">
                  <SelectItem value="ALL" className="text-foreground">
                    All Status
                  </SelectItem>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s} className="text-foreground">
                      {getStatusConfig(s).label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(params.search || params.role || params.status) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer gap-1"
                  onClick={handleResetFilters}
                  title="Reset all filters"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* User Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="overflow-hidden border-border/60 bg-card/70 backdrop-blur-sm">
          {/* Table header */}
          <div className="hidden border-b border-border/60 px-6 py-3 md:grid md:grid-cols-12 md:gap-4">
            <div className="col-span-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              User
            </div>
            <div className="col-span-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Role
            </div>
            <div className="col-span-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Status
            </div>
            <div className="col-span-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Workspaces
            </div>
            <div className="col-span-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Teams
            </div>
            <div className="col-span-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">
              Actions
            </div>
          </div>

          {/* Rows */}
          <div
            className={
              isFetching && currentPage === 1
                ? "opacity-60 transition-opacity"
                : "transition-opacity"
            }
          >
            {isLoadingFirstPage ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border-b border-border/60 p-4">
                  <Skeleton className="h-12 w-full bg-muted" />
                </div>
              ))
            ) : isError && users.length === 0 ? (
              <div className="flex h-52 flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="mb-2 h-8 w-8 text-rose-500" />
                <p className="text-sm font-semibold text-foreground">
                  Failed to load users
                </p>
                <p className="mb-4 max-w-md text-xs text-muted-foreground">
                  {errorMessage}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="gap-2 text-xs cursor-pointer rounded-lg border-border bg-muted hover:bg-muted/80"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Try Again
                </Button>
              </div>
            ) : users.length === 0 ? (
              <div className="flex h-52 flex-col items-center justify-center p-6 text-center">
                <Users className="mb-2 h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm font-semibold text-foreground">
                  No users found
                </p>
                <p className="mb-4 text-xs text-muted-foreground">
                  {params.search || params.role || params.status
                    ? "No users match your current filter criteria."
                    : "There are no users registered on the platform."}
                </p>
                {(params.search || params.role || params.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilters}
                    className="gap-2 text-xs cursor-pointer rounded-lg border-border bg-muted hover:bg-muted/80"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-rose-400" /> Clear
                    Filters
                  </Button>
                )}
              </div>
            ) : (
              <AnimatePresence>
                {users.map((u, i) => {
                  const roleConfig = getRoleConfig(u.role);
                  const statusConfig = getStatusConfig(u.status);
                  const avatarSrc = getAvatarUrl(u.avatar);
                  const userInitials = (u.name || u.email)
                    .split(" ")
                    .map((w: string) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="grid grid-cols-1 gap-3 border-b border-border/60 p-4 transition-colors hover:bg-card/70 md:grid-cols-12 md:items-center md:gap-4 md:px-6"
                    >
                      {/* User info */}
                      <div
                        onClick={() => handleUserClick(u.id)}
                        className="col-span-3 flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-opacity"
                        title="Click to view workspace and team details"
                      >
                        <Avatar className="h-9 w-9 border border-border group-hover:border-rose-500/50 transition-colors">
                          {avatarSrc && (
                            <AvatarImage src={avatarSrc} alt={u.name || ""} />
                          )}
                          <AvatarFallback
                            className={`bg-linear-to-br ${roleConfig.color} text-[10px] font-bold text-white`}
                          >
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-foreground group-hover:text-rose-400 transition-colors flex items-center gap-1.5">
                            {u.name || u.username || "Unnamed"}
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {u.email}
                          </p>
                        </div>
                      </div>

                      {/* Role */}
                      <div className="col-span-2">
                        <Badge
                          className={`h-5 rounded-md border text-[9px] font-bold ${roleConfig.badge}`}
                        >
                          {roleConfig.label}
                        </Badge>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <Badge
                          className={`h-5 rounded-md border text-[9px] font-bold ${statusConfig.color}`}
                        >
                          <span
                            className={`mr-1 h-1.5 w-1.5 rounded-full ${statusConfig.dot} inline-block`}
                          />
                          {statusConfig.label}
                        </Badge>
                      </div>

                      {/* Workspaces count */}
                      <div className="col-span-2 flex items-center">
                        <Badge
                          variant="outline"
                          className="h-6 gap-1.5 border-rose-500/20 bg-rose-500/10 px-2.5 text-xs font-medium text-rose-400 dark:text-rose-300"
                        >
                          <Building2 className="h-3.5 w-3.5 text-rose-500" />
                          <span>{u.workspaceCount ?? 0}</span>
                          <span className="text-[10px] text-muted-foreground font-normal hidden lg:inline">
                            {u.workspaceCount === 1
                              ? "workspace"
                              : "workspaces"}
                          </span>
                        </Badge>
                      </div>

                      {/* Teams count */}
                      <div className="col-span-2 flex items-center">
                        <Badge
                          variant="outline"
                          className="h-6 gap-1.5 border-violet-500/20 bg-violet-500/10 px-2.5 text-xs font-medium text-violet-400 dark:text-violet-300"
                        >
                          <Users className="h-3.5 w-3.5 text-violet-500" />
                          <span>{u.teamCount ?? 0}</span>
                          <span className="text-[10px] text-muted-foreground font-normal hidden lg:inline">
                            {u.teamCount === 1 ? "team" : "teams"}
                          </span>
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-56 bg-popover border-border p-1"
                          >
                            <DropdownMenuLabel className="text-[10px] text-muted-foreground px-2">
                              Manage User
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-border" />

                            {/* View Workspaces & Teams */}
                            <DropdownMenuItem
                              onClick={() => handleUserClick(u.id)}
                              className="gap-2 text-xs text-foreground/80 cursor-pointer rounded-lg font-medium"
                            >
                              <Building2 className="h-3.5 w-3.5 text-rose-400" />
                              Workspaces & Teams
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-border" />

                            {/* Change Role submenu */}
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="gap-2 text-xs text-foreground/80 cursor-pointer rounded-lg">
                                <Shield className="h-3.5 w-3.5 text-violet-400" />{" "}
                                Change Role
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="bg-popover border-border p-1">
                                {ROLE_OPTIONS.map((role) => {
                                  const rc = getRoleConfig(role);
                                  return (
                                    <DropdownMenuItem
                                      key={role}
                                      disabled={u.role === role}
                                      className="gap-2 text-xs text-foreground/80 cursor-pointer rounded-lg"
                                      onClick={() =>
                                        handleUpdateRole(u.id, role)
                                      }
                                    >
                                      <span
                                        className={`h-2 w-2 rounded-full ${rc.dot}`}
                                      />
                                      {rc.label}
                                      {u.role === role && (
                                        <span className="ml-auto text-[9px] text-emerald-400">
                                          Current
                                        </span>
                                      )}
                                    </DropdownMenuItem>
                                  );
                                })}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            {/* Change Status submenu */}
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="gap-2 text-xs text-foreground/80 cursor-pointer rounded-lg">
                                <UserCog className="h-3.5 w-3.5 text-amber-400" />{" "}
                                Change Status
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="bg-popover border-border p-1">
                                {STATUS_OPTIONS.map((status) => {
                                  const sc = getStatusConfig(status);
                                  return (
                                    <DropdownMenuItem
                                      key={status}
                                      disabled={u.status === status}
                                      className="gap-2 text-xs text-foreground/80 cursor-pointer rounded-lg"
                                      onClick={() =>
                                        handleUpdateStatus(u.id, status)
                                      }
                                    >
                                      <span
                                        className={`h-2 w-2 rounded-full ${sc.dot}`}
                                      />
                                      {sc.label}
                                      {u.status === status && (
                                        <span className="ml-auto text-[9px] text-emerald-400">
                                          Current
                                        </span>
                                      )}
                                    </DropdownMenuItem>
                                  );
                                })}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem
                              className="gap-2 text-xs text-rose-400 focus:text-rose-400 focus:bg-rose-500/10 cursor-pointer rounded-lg"
                              onClick={() =>
                                setDeleteTarget({
                                  id: u.id,
                                  name: u.name || u.email,
                                })
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          <div
            ref={loadMoreRef}
            className="flex min-h-14 items-center justify-center border-t border-border/60 px-6 py-3"
          >
            {isLoadingMore ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <LoaderCircle className="h-4 w-4 animate-spin text-rose-400" />
                Loading more users...
              </div>
            ) : isError && users.length > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                className="gap-2 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-500"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Could not load more — try again
              </Button>
            ) : meta?.hasNext ? (
              <p className="text-[10px] text-muted-foreground">
                Showing {users.length} of {meta.total} users · Scroll to load
                more
              </p>
            ) : meta && users.length > 0 ? (
              <p className="text-[10px] text-muted-foreground">
                All {meta.total} users loaded
              </p>
            ) : null}
          </div>
        </Card>
      </motion.div>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-popover border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-muted text-foreground hover:bg-border cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-rose-500 text-white hover:bg-rose-600 cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

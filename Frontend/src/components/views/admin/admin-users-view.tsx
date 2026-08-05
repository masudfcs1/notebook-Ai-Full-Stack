'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users, Search, Plus, ChevronLeft, ChevronRight,
  MoreHorizontal, Trash2, Shield, UserCog, Filter,
} from "lucide-react"
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserRoleMutation, useUpdateUserStatusMutation, useDeleteUserMutation } from "@/lib/redux/api/adminApiSlice"
import type { GetUsersParams } from "@/lib/redux/api/adminApiSlice"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
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
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { getRoleConfig, getStatusConfig, ADMIN_ROLES } from "@/constants/admin"
import { getAvatarUrl } from "@/lib/utils"

const ROLE_OPTIONS = ["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE", "USER"]
const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]

export function AdminUsersView() {
  const [params, setParams] = useState<GetUsersParams>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  })
  const [searchInput, setSearchInput] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null)

  // Form state for create user
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formRole, setFormRole] = useState("USER")
  const [formStatus, setFormStatus] = useState("ACTIVE")

  const { data: usersResponse, isLoading, isFetching } = useGetUsersQuery(params)
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation()
  const [updateRole] = useUpdateUserRoleMutation()
  const [updateStatus] = useUpdateUserStatusMutation()
  const [deleteUser] = useDeleteUserMutation()

  const users = usersResponse?.data || []
  const meta = usersResponse?.meta

  const handleSearch = () => {
    setParams((p) => ({ ...p, page: 1, search: searchInput || undefined }))
  }

  const handleRoleFilter = (role: string) => {
    setParams((p) => ({ ...p, page: 1, role: role === "ALL" ? undefined : role }))
  }

  const handleStatusFilter = (status: string) => {
    setParams((p) => ({ ...p, page: 1, status: status === "ALL" ? undefined : status }))
  }

  const handleCreateUser = async () => {
    try {
      await createUser({
        name: formName || undefined,
        email: formEmail,
        password: formPassword,
        role: formRole,
        status: formStatus,
      }).unwrap()
      setCreateOpen(false)
      setFormName("")
      setFormEmail("")
      setFormPassword("")
      setFormRole("USER")
      setFormStatus("ACTIVE")
    } catch {
      // Error handled by RTK Query
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteTarget) return
    try {
      await deleteUser(deleteTarget.id).unwrap()
      setDeleteTarget(null)
    } catch {
      // Error handled by RTK Query
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-sm text-slate-400">
            Manage all platform users, assign roles, and control access
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 hover:opacity-90 transition-opacity cursor-pointer">
              <Plus className="h-4 w-4" /> Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Create New User</DialogTitle>
              <DialogDescription className="text-slate-400">
                Add a new user to the platform with role and status.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-xs text-slate-300">Full Name</Label>
                <Input
                  className="mt-1 border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                  placeholder="John Doe"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-slate-300">Email *</Label>
                <Input
                  className="mt-1 border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                  placeholder="john@example.com"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-slate-300">Password *</Label>
                <Input
                  className="mt-1 border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-300">Role</Label>
                  <Select value={formRole} onValueChange={setFormRole}>
                    <SelectTrigger className="mt-1 border-slate-700 bg-slate-800 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {ROLE_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r} className="text-white">
                          {getRoleConfig(r).label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-300">Status</Label>
                  <Select value={formStatus} onValueChange={setFormStatus}>
                    <SelectTrigger className="mt-1 border-slate-700 bg-slate-800 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s} className="text-white">
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
                className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 font-semibold text-white hover:opacity-90 cursor-pointer"
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
        <Card className="border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                className="border-white/5 bg-white/[0.03] pl-9 text-sm text-white placeholder:text-slate-500"
                placeholder="Search by name, email, or username…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <Select
                value={params.role || "ALL"}
                onValueChange={handleRoleFilter}
              >
                <SelectTrigger className="h-9 w-[140px] border-white/5 bg-white/[0.03] text-xs text-white">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="ALL" className="text-white">All Roles</SelectItem>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r} className="text-white">
                      {getRoleConfig(r).label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={params.status || "ALL"}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="h-9 w-[140px] border-white/5 bg-white/[0.03] text-xs text-white">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="ALL" className="text-white">All Status</SelectItem>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s} className="text-white">
                      {getStatusConfig(s).label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-xs text-slate-400 hover:text-white cursor-pointer"
                onClick={handleSearch}
              >
                Search
              </Button>
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
        <Card className="overflow-hidden border-white/5 bg-white/[0.02] backdrop-blur-sm">
          {/* Table header */}
          <div className="hidden border-b border-white/5 px-6 py-3 md:grid md:grid-cols-12 md:gap-4">
            <div className="col-span-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">User</div>
            <div className="col-span-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Role</div>
            <div className="col-span-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</div>
            <div className="col-span-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Provider</div>
            <div className="col-span-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Actions</div>
          </div>

          {/* Rows */}
          <div className={isFetching ? "opacity-50 transition-opacity" : ""}>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border-b border-white/5 p-4">
                  <Skeleton className="h-12 w-full bg-white/5" />
                </div>
              ))
            ) : users.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-slate-500">
                <Users className="mr-2 h-5 w-5" /> No users found
              </div>
            ) : (
              <AnimatePresence>
                {users.map((u, i) => {
                  const roleConfig = getRoleConfig(u.role)
                  const statusConfig = getStatusConfig(u.status)
                  const avatarSrc = getAvatarUrl(u.avatar)
                  const userInitials = (u.name || u.email)
                    .split(" ")
                    .map((w: string) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)

                  return (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="grid grid-cols-1 gap-3 border-b border-white/5 p-4 transition-colors hover:bg-white/[0.02] md:grid-cols-12 md:items-center md:gap-4 md:px-6"
                    >
                      {/* User info */}
                      <div className="col-span-4 flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-white/10">
                          {avatarSrc && <AvatarImage src={avatarSrc} alt={u.name || ""} />}
                          <AvatarFallback className={`bg-gradient-to-br ${roleConfig.color} text-[10px] font-bold text-white`}>
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-white">
                            {u.name || u.username || "Unnamed"}
                          </p>
                          <p className="truncate text-[10px] text-slate-500">{u.email}</p>
                        </div>
                      </div>

                      {/* Role */}
                      <div className="col-span-2">
                        <Badge className={`h-5 rounded-md border text-[9px] font-bold ${roleConfig.badge}`}>
                          {roleConfig.label}
                        </Badge>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <Badge className={`h-5 rounded-md border text-[9px] font-bold ${statusConfig.color}`}>
                          <span className={`mr-1 h-1.5 w-1.5 rounded-full ${statusConfig.dot} inline-block`} />
                          {statusConfig.label}
                        </Badge>
                      </div>

                      {/* Provider */}
                      <div className="col-span-2">
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                          {u.provider}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 bg-slate-900 border-slate-700 p-1">
                            <DropdownMenuLabel className="text-[10px] text-slate-500 px-2">
                              Manage User
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-700" />

                            {/* Change Role submenu */}
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="gap-2 text-xs text-slate-300 cursor-pointer rounded-lg">
                                <Shield className="h-3.5 w-3.5 text-violet-400" /> Change Role
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="bg-slate-900 border-slate-700 p-1">
                                {ROLE_OPTIONS.map((role) => {
                                  const rc = getRoleConfig(role)
                                  return (
                                    <DropdownMenuItem
                                      key={role}
                                      disabled={u.role === role}
                                      className="gap-2 text-xs text-slate-300 cursor-pointer rounded-lg"
                                      onClick={() => updateRole({ userId: u.id, role })}
                                    >
                                      <span className={`h-2 w-2 rounded-full ${rc.dot}`} />
                                      {rc.label}
                                      {u.role === role && <span className="ml-auto text-[9px] text-emerald-400">Current</span>}
                                    </DropdownMenuItem>
                                  )
                                })}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            {/* Change Status submenu */}
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="gap-2 text-xs text-slate-300 cursor-pointer rounded-lg">
                                <UserCog className="h-3.5 w-3.5 text-amber-400" /> Change Status
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="bg-slate-900 border-slate-700 p-1">
                                {STATUS_OPTIONS.map((status) => {
                                  const sc = getStatusConfig(status)
                                  return (
                                    <DropdownMenuItem
                                      key={status}
                                      disabled={u.status === status}
                                      className="gap-2 text-xs text-slate-300 cursor-pointer rounded-lg"
                                      onClick={() => updateStatus({ userId: u.id, status })}
                                    >
                                      <span className={`h-2 w-2 rounded-full ${sc.dot}`} />
                                      {sc.label}
                                      {u.status === status && <span className="ml-auto text-[9px] text-emerald-400">Current</span>}
                                    </DropdownMenuItem>
                                  )
                                })}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem
                              className="gap-2 text-xs text-rose-400 focus:text-rose-400 focus:bg-rose-500/10 cursor-pointer rounded-lg"
                              onClick={() => setDeleteTarget({ id: u.id, name: u.name || u.email })}
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/5 px-6 py-3">
              <p className="text-[10px] text-slate-500">
                Showing {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} users
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-white cursor-pointer"
                  disabled={!meta.hasPrev}
                  onClick={() => setParams((p) => ({ ...p, page: (p.page || 1) - 1 }))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(meta.totalPages, 5) }).map((_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 text-xs cursor-pointer ${
                        meta.page === pageNum
                          ? "bg-rose-500/15 text-rose-400 font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                      onClick={() => setParams((p) => ({ ...p, page: pageNum }))}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-white cursor-pointer"
                  disabled={!meta.hasNext}
                  onClick={() => setParams((p) => ({ ...p, page: (p.page || 1) + 1 }))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete <span className="font-semibold text-white">{deleteTarget?.name}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 cursor-pointer">
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
  )
}

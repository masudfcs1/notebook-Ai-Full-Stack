'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users, UserPlus, Shield, Trash2, Edit3, Check, X,
  Crown, Mail, Sparkles, Building2,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { updateTeam, addTeamMember, removeTeamMember } from "@/lib/redux/dataSlice"
import { pushNotification } from "@/lib/redux/appSlice"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { TeamMember } from "@/types"

const ROLE_BADGES: Record<string, { label: string; style: string; icon: typeof Shield }> = {
  OWNER: { label: "Owner", style: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: Crown },
  LEAD: { label: "Lead", style: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30", icon: Shield },
  MEMBER: { label: "Member", style: "bg-slate-500/15 text-slate-400 border-slate-500/30", icon: Users },
}

export function TeamView() {
  const dispatch = useAppDispatch()
  const activeWorkspaceId = useAppSelector((s) => s.data.activeWorkspaceId)
  const activeTeamId = useAppSelector((s) => s.data.activeTeamId)
  const workspaces = useAppSelector((s) => s.data.workspaces)

  const activeWs = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0]
  const currentTeam = activeWs?.teams.find((t) => t.id === activeTeamId) || activeWs?.teams[0]

  // Editing team name/key state
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(currentTeam?.name || "")
  const [editKey, setEditKey] = useState(currentTeam?.key || "")

  // Add member modal/inline form state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newRole, setNewRole] = useState<"OWNER" | "LEAD" | "MEMBER">("MEMBER")

  if (!currentTeam) {
    return (
      <div className="rounded-2xl border border-white/10 p-6 text-center text-xs text-muted-foreground">
        No active team selected. Select a team from the sidebar.
      </div>
    )
  }

  function handleSaveTeamDetails() {
    if (!editName.trim()) {
      toast.error("Team name cannot be empty")
      return
    }

    dispatch(
      updateTeam({
        teamId: currentTeam.id,
        name: editName.trim(),
        key: editKey.trim().toUpperCase(),
      })
    )

    dispatch(
      pushNotification({
        title: "Team details updated",
        description: `Renamed team to "${editName.trim()}" (${editKey.trim().toUpperCase()}).`,
        type: "success",
      })
    )

    toast.success("Team settings saved!")
    setIsEditing(false)
  }

  function handleAddMember(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim()) {
      toast.error("Name and email are required")
      return
    }

    const member: TeamMember = {
      id: `mem-${Date.now()}`,
      teamId: currentTeam.id,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces`,
    }

    dispatch(addTeamMember({ teamId: currentTeam.id, member }))
    dispatch(
      pushNotification({
        title: "Team member added",
        description: `Added ${newName.trim()} to ${currentTeam.name}.`,
        type: "success",
      })
    )

    toast.success(`Added ${newName.trim()} to team!`)
    setNewName("")
    setNewEmail("")
    setAddModalOpen(false)
  }

  function handleRemoveMember(memberId: string, memberName: string) {
    dispatch(removeTeamMember({ teamId: currentTeam.id, memberId }))
    toast.success(`Removed ${memberName} from team`)
  }

  return (
    <div className="space-y-4">
      {/* Sleek Compact Header Panel */}
      <Card className="border-white/10 bg-background/50 p-4 backdrop-blur-xl shadow-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/15 text-xl shadow-inner">
              {currentTeam.icon || "💻"}
            </div>

            {isEditing ? (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="rounded-lg border border-indigo-500 bg-background px-2.5 py-1 text-xs font-bold text-foreground outline-none"
                  placeholder="Team Name"
                />
                <input
                  type="text"
                  value={editKey}
                  onChange={(e) => setEditKey(e.target.value.toUpperCase())}
                  maxLength={4}
                  className="w-16 rounded-lg border border-indigo-500 bg-background px-2.5 py-1 font-mono text-xs font-bold uppercase text-indigo-400 outline-none"
                  placeholder="KEY"
                />
                <Button size="sm" onClick={handleSaveTeamDetails} className="h-7 gap-1 rounded-lg bg-indigo-500 px-2.5 text-xs text-white">
                  <Check className="h-3.5 w-3.5" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-7 rounded-lg px-2">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-base font-bold tracking-tight text-foreground">{currentTeam.name}</h1>
                  <span className="rounded bg-indigo-500/15 px-1.5 py-0.2 font-mono text-[10px] font-bold text-indigo-400 border border-indigo-500/30">
                    {currentTeam.key}
                  </span>
                  <button
                    onClick={() => {
                      setEditName(currentTeam.name)
                      setEditKey(currentTeam.key)
                      setIsEditing(true)
                    }}
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Edit Team Name & Key"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                </div>
                <p className="truncate text-[11px] text-muted-foreground">
                  Workspace: <span className="font-semibold text-foreground">{activeWs.name}</span> • <span className="text-indigo-400 font-semibold">{currentTeam.members.length} members</span>
                </p>
              </div>
            )}
          </div>

          <Button
            onClick={() => setAddModalOpen(true)}
            size="sm"
            className="h-8 gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-3 text-xs font-semibold text-white shadow-md shadow-indigo-500/20"
          >
            <UserPlus className="h-3.5 w-3.5" /> Add Member
          </Button>
        </div>
      </Card>

      {/* Sleek Compact Team Roster Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
            <Users className="h-3.5 w-3.5 text-indigo-400" />
            Team Roster ({currentTeam.members.length})
          </div>
        </div>

        {currentTeam.members.length === 0 ? (
          <Card className="border-white/10 bg-background/40 p-6 text-center text-xs text-muted-foreground backdrop-blur-md">
            No team members assigned yet. Click "+ Add Member" to assign users.
          </Card>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {currentTeam.members.map((member) => {
              const RoleMeta = ROLE_BADGES[member.role] || ROLE_BADGES.MEMBER
              const RoleIcon = RoleMeta.icon

              return (
                <Card
                  key={member.id}
                  className="group relative flex items-center justify-between border-white/10 bg-card/60 p-2.5 backdrop-blur-md transition-all hover:border-indigo-500/40 hover:bg-card/90 hover:shadow-md"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="h-7 w-7 shrink-0 border border-white/20">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-indigo-500/20 text-[10px] font-bold text-indigo-300">
                        {member.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="truncate text-xs font-bold text-foreground leading-none">{member.name}</h4>
                        <Badge variant="outline" className={cn("gap-0.5 px-1 py-0 text-[8px] font-bold leading-none shrink-0", RoleMeta.style)}>
                          <RoleIcon className="h-2 w-2" /> {RoleMeta.label}
                        </Badge>
                      </div>
                      <p className="truncate text-[10px] text-muted-foreground mt-0.5">{member.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveMember(member.id, member.name)}
                    className="ml-1 rounded p-1 text-muted-foreground/40 opacity-0 transition-all group-hover:opacity-100 hover:bg-rose-500/20 hover:text-rose-400"
                    title="Remove Member"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Add / Assign Member Modal */}
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
                    <h2 className="text-sm font-bold">Assign Member to {currentTeam.name}</h2>
                    <p className="text-[11px] text-muted-foreground">Add user to team roster with assigned role</p>
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
                    <option value="MEMBER">Member (Standard contributor)</option>
                    <option value="LEAD">Team Lead (Sprint lead & reviewer)</option>
                    <option value="OWNER">Owner (Full administrative rights)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)} className="rounded-lg h-8 text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="gap-1.5 rounded-lg h-8 bg-gradient-to-r from-indigo-500 to-violet-600 text-xs text-white shadow-md">
                    <UserPlus className="h-3.5 w-3.5" /> Add Member
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

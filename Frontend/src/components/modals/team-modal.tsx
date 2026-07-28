'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, X, Plus, Shield, UserPlus } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { addTeam, addTeamMember } from "@/lib/redux/dataSlice"
import { pushNotification } from "@/lib/redux/appSlice"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Props {
  open: boolean
  onClose: () => void
}

const TEAM_ICONS = ["💻", "🎨", "🚀", "📊", "⚡", "🔬", "🛠️", "🎯"]

export function TeamModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch()
  const activeWorkspaceId = useAppSelector((s) => s.data.activeWorkspaceId)
  const currentWs = useAppSelector((s) => s.data.workspaces.find((w) => w.id === activeWorkspaceId))

  const [name, setName] = useState("")
  const [key, setKey] = useState("")
  const [icon, setIcon] = useState("💻")
  const [memberName, setMemberName] = useState("")
  const [memberEmail, setMemberEmail] = useState("")
  const [memberRole, setMemberRole] = useState<"OWNER" | "LEAD" | "MEMBER">("MEMBER")

  if (!open) return null

  function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Team name is required")
      return
    }

    const generatedKey = key.trim() ? key.trim().toUpperCase() : name.trim().slice(0, 3).toUpperCase()
    const teamId = `team-${Date.now()}`

    const newTeam = {
      id: teamId,
      workspaceId: activeWorkspaceId,
      name: name.trim(),
      key: generatedKey,
      icon,
      members: memberName.trim() && memberEmail.trim() ? [
        {
          id: `mem-${Date.now()}`,
          teamId,
          name: memberName.trim(),
          email: memberEmail.trim(),
          role: memberRole,
        },
      ] : [],
    }

    dispatch(addTeam(newTeam))
    dispatch(pushNotification({
      title: "Team created",
      description: `Created new team "${name.trim()}" (${generatedKey}).`,
      type: "success",
    }))
    toast.success(`Team "${name.trim()}" created!`)
    setName("")
    setKey("")
    setMemberName("")
    setMemberEmail("")
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-background/95 p-6 shadow-2xl backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Create Team in {currentWs?.name || "Workspace"}</h2>
                <p className="text-xs text-muted-foreground">Teams group members, task identifiers, and action items</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleCreateTeam} className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Team Icon
              </label>
              <div className="flex items-center gap-2">
                {TEAM_ICONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border text-base transition-all ${
                      icon === i
                        ? "border-cyan-500 bg-cyan-500/20 text-cyan-400 shadow-sm ring-2 ring-cyan-500/40"
                        : "border-border/60 bg-muted/30 hover:border-border"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Team Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Engineering, Product Design"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Key Identifier
                </label>
                <input
                  type="text"
                  placeholder="e.g. ENG"
                  maxLength={4}
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2.5 font-mono text-sm uppercase outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-muted/20 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-foreground">
                <UserPlus className="h-4 w-4 text-cyan-400" />
                Add Initial Member (Optional)
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs outline-none focus:border-cyan-500"
                />
                <input
                  type="email"
                  placeholder="user@company.com"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg">
                <Plus className="h-4 w-4" />
                Create Team
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

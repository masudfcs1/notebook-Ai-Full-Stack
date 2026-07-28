'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, X, Plus, Sparkles, Check } from "lucide-react"
import { useAppDispatch } from "@/lib/redux/hooks"
import { addWorkspace } from "@/lib/redux/dataSlice"
import { pushNotification } from "@/lib/redux/appSlice"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Props {
  open: boolean
  onClose: () => void
}

const ICONS = ["⚡", "🧠", "🚀", "💻", "🎨", "🔥", "🌐", "💎"]

export function WorkspaceModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("⚡")

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Workspace name is required")
      return
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    const newWs = {
      id: `ws-${Date.now()}`,
      name: name.trim(),
      slug,
      icon,
      description: description.trim() || undefined,
      teams: [
        {
          id: `team-${Date.now()}-general`,
          workspaceId: `ws-${Date.now()}`,
          name: "General",
          slug: "general",
          key: "GEN",
          icon: "🌐",
          members: [
            {
              id: `mem-${Date.now()}`,
              teamId: `team-${Date.now()}-general`,
              name: "Workspace Lead",
              email: "admin@noteflow.ai",
              role: "OWNER" as const,
            },
          ],
        },
      ],
    }

    dispatch(addWorkspace(newWs))
    dispatch(pushNotification({
      title: "Workspace created",
      description: `Created new workspace "${name.trim()}".`,
      type: "success",
    }))
    toast.success(`Workspace "${name.trim()}" created!`)
    setName("")
    setDescription("")
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Create New Workspace</h2>
                <p className="text-xs text-muted-foreground">Workspaces isolate teams, notes, and action items</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Workspace Icon
              </label>
              <div className="flex items-center gap-2">
                {ICONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition-all ${
                      icon === i
                        ? "border-primary bg-primary/20 text-primary shadow-sm ring-2 ring-primary/40"
                        : "border-border/60 bg-muted/30 hover:border-border"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Workspace Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Corp, Design Studio"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description (Optional)
              </label>
              <textarea
                placeholder="What is this workspace used for?"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg">
                <Plus className="h-4 w-4" />
                Create Workspace
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

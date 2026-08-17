"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, X, Plus, Check, Edit3, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { addTeam, updateTeam } from "@/lib/redux/dataSlice";
import { pushNotification } from "@/lib/redux/appSlice";
import {
  useCreateTeamMutation,
  useUpdateTeamMutation,
} from "@/lib/redux/api/workspaceApiSlice";
import { Team } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  teamToEdit?: Team | null;
  targetWorkspaceId?: string;
}

const TEAM_ICONS = ["💬", "💻", "🎨", "🚀", "📊", "⚡", "🔬", "🛠️", "🎯"];

export function TeamModal({
  open,
  onClose,
  mode = "create",
  teamToEdit = null,
  targetWorkspaceId,
}: Props) {
  const dispatch = useAppDispatch();
  const activeWorkspaceId = useAppSelector((s) => s.data.activeWorkspaceId);
  const workspaces = useAppSelector((s) => s.data.workspaces);

  const effectiveWorkspaceId = targetWorkspaceId || activeWorkspaceId;
  const currentWs = workspaces.find((w) => w.id === effectiveWorkspaceId);

  const [createTeam, { isLoading: isCreating }] = useCreateTeamMutation();
  const [updateTeamMutation, { isLoading: isUpdating }] =
    useUpdateTeamMutation();

  const [selectedWsId, setSelectedWsId] = useState(effectiveWorkspaceId);
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [icon, setIcon] = useState("💬");
  const [isKeyManuallyEdited, setIsKeyManuallyEdited] = useState(false);

  const isEdit = mode === "edit" && !!teamToEdit;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      setSelectedWsId(effectiveWorkspaceId || workspaces[0]?.id || "");
      if (mode === "edit" && teamToEdit) {
        setName(teamToEdit.name || "");
        setKey(teamToEdit.key || "");
        setIcon(teamToEdit.icon || "💬");
        setIsKeyManuallyEdited(true);
      } else {
        setName("");
        setKey("");
        setIcon("💬");
        setIsKeyManuallyEdited(false);
      }
    }
  }, [open, mode, teamToEdit, effectiveWorkspaceId, workspaces]);

  if (!open) return null;

  function generateKeyFromName(val: string): string {
    const words = val.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 3) {
      return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
    } else if (words.length === 2) {
      return (words[0].slice(0, 2) + words[1][0]).toUpperCase();
    } else if (val.trim().length >= 3) {
      return val.trim().slice(0, 3).toUpperCase();
    }
    return val.trim().toUpperCase();
  }

  function handleNameChange(val: string) {
    setName(val);
    if (!isKeyManuallyEdited) {
      setKey(generateKeyFromName(val));
    }
  }

  function handleKeyChange(val: string) {
    setIsKeyManuallyEdited(true);
    setKey(val.toUpperCase().replace(/[^A-Z0-9]/g, ""));
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Team name is required");
      return;
    }

    const wsId = selectedWsId || activeWorkspaceId;
    if (!wsId) {
      toast.error("Please select a workspace for this team");
      return;
    }

    let finalKey = (key.trim() || generateKeyFromName(name))
      .slice(0, 10)
      .toUpperCase();
    if (finalKey.length < 2) {
      finalKey = (finalKey + "XX").slice(0, 2);
    }
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    try {
      if (mode === "edit" && teamToEdit) {
        const res = await updateTeamMutation({
          id: teamToEdit.id,
          data: {
            name: name.trim(),
            key: finalKey,
            icon,
          },
        }).unwrap();

        if (res.success && res.data) {
          dispatch(
            updateTeam({
              teamId: teamToEdit.id,
              name: res.data.name,
              key: res.data.key,
              icon: res.data.icon || undefined,
            }),
          );
          dispatch(
            pushNotification({
              title: "Team updated",
              description: `Updated team "${res.data.name}".`,
              type: "success",
            }),
          );
          toast.success(`Team "${res.data.name}" updated!`);
          onClose();
        }
      } else {
        const res = await createTeam({
          workspaceId: wsId,
          name: name.trim(),
          key: finalKey,
          icon,
          slug,
        }).unwrap();

        if (res.success && res.data) {
          dispatch(
            addTeam({
              ...res.data,
              members: res.data.members || [],
            }),
          );
          dispatch(
            pushNotification({
              title: "Team created",
              description: `Created new team "${res.data.name}" (${res.data.key}).`,
              type: "success",
            }),
          );
          toast.success(`Team "${res.data.name}" created!`);
          onClose();
        }
      }
    } catch (err: any) {
      const errorMsg =
        err?.data?.message ||
        err?.message ||
        `Failed to ${isEdit ? "update" : "create"} team`;
      toast.error(errorMsg);
    }
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
                {isEdit ? (
                  <Edit3 className="h-5 w-5" />
                ) : (
                  <Users className="h-5 w-5" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {isEdit ? "Edit Team" : "Create Team"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {currentWs
                    ? `Workspace: ${currentWs.name}`
                    : "Teams isolate action items and meeting notes"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
            {!isEdit && workspaces.length > 1 && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Target Workspace *
                </label>
                <select
                  value={selectedWsId}
                  onChange={(e) => setSelectedWsId(e.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2 text-sm outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                >
                  {workspaces.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.icon || "🏢"} {w.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border text-base transition-all cursor-pointer ${
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
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Key Identifier *
                </label>
                <input
                  type="text"
                  placeholder="e.g. ENG"
                  maxLength={6}
                  value={key}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2.5 font-mono text-sm uppercase outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="gap-2 rounded-xl bg-gradient-r from-cyan-500 to-blue-500 text-white shadow-lg cursor-pointer hover:opacity-90 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEdit ? "Saving..." : "Creating..."}
                  </>
                ) : isEdit ? (
                  <>
                    <Check className="h-4 w-4" />
                    Save Team
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Team
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

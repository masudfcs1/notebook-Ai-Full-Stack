"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  X,
  Plus,
  Check,
  Edit3,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { addWorkspace, updateWorkspaceInState } from "@/lib/redux/dataSlice";
import { pushNotification } from "@/lib/redux/appSlice";
import {
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  WorkspaceItem,
} from "@/lib/redux/api/workspaceApiSlice";
import { Workspace } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  workspaceToEdit?: WorkspaceItem | Workspace | null;
}

const ICONS = ["⚡", "🧠", "🚀", "💻", "🎨", "🔥", "🌐", "💎"];

export function WorkspaceModal({
  open,
  onClose,
  mode = "create",
  workspaceToEdit = null,
}: Props) {
  const dispatch = useAppDispatch();
  const workspaces = useAppSelector((s) => s.data.workspaces);

  const [createWorkspace, { isLoading: isCreating }] =
    useCreateWorkspaceMutation();
  const [updateWorkspace, { isLoading: isUpdating }] =
    useUpdateWorkspaceMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("⚡");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const isEdit = mode === "edit" && !!workspaceToEdit;

  useEffect(() => {
    if (open) {
      if (isEdit && workspaceToEdit) {
        setName(workspaceToEdit.name || "");
        setDescription(workspaceToEdit.description || "");
        setIcon(workspaceToEdit.icon || "⚡");
        setSlug(workspaceToEdit.slug || "");
        setIsSlugManuallyEdited(true);
      } else {
        setName("");
        setDescription("");
        setIcon("⚡");
        setSlug("");
        setIsSlugManuallyEdited(false);
      }
    }
  }, [open, isEdit, workspaceToEdit]);

  if (!open) return null;

  const isLoading = isCreating || isUpdating;

  // Normalized slug check
  const normalizedSlug = slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Check if slug exists in workspaces
  const isSlugTaken = Boolean(
    normalizedSlug &&
    workspaces.some(
      (w) =>
        w.slug.toLowerCase() === normalizedSlug &&
        (!isEdit || w.id !== workspaceToEdit?.id),
    ),
  );

  function handleNameChange(val: string) {
    setName(val);
    if (!isSlugManuallyEdited) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(autoSlug);
    }
  }

  function handleSlugChange(val: string) {
    setIsSlugManuallyEdited(true);
    const formatted = val.toLowerCase().replace(/[^a-z0-9-]+/g, "");
    setSlug(formatted);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    if (isSlugTaken) {
      toast.error(
        "This workspace slug already exists. Please choose another one.",
      );
      return;
    }

    const finalSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    try {
      if (isEdit && workspaceToEdit) {
        const res = await updateWorkspace({
          id: workspaceToEdit.id,
          data: {
            name: name.trim(),
            description: description.trim() || undefined,
            icon,
            slug: finalSlug,
          },
        }).unwrap();

        if (res.success && res.data) {
          dispatch(
            updateWorkspaceInState({
              id: workspaceToEdit.id,
              name: res.data.name,
              description: res.data.description || undefined,
              icon: res.data.icon || undefined,
              slug: res.data.slug,
            }),
          );
          dispatch(
            pushNotification({
              title: "Workspace updated",
              description: `Updated workspace "${res.data.name}".`,
              type: "success",
            }),
          );
          toast.success(`Workspace "${res.data.name}" updated!`);
          onClose();
        }
      } else {
        const res = await createWorkspace({
          name: name.trim(),
          description: description.trim() || undefined,
          icon,
          slug: finalSlug,
        }).unwrap();

        if (res.success && res.data) {
          dispatch(
            addWorkspace({
              ...res.data,
              teams: res.data.teams || [],
            }),
          );
          dispatch(
            pushNotification({
              title: "Workspace created",
              description: `Created new workspace "${res.data.name}".`,
              type: "success",
            }),
          );
          toast.success(`Workspace "${res.data.name}" created!`);
          onClose();
        }
      }
    } catch (err: any) {
      const errorMsg =
        err?.data?.message ||
        err?.message ||
        `Failed to ${isEdit ? "update" : "create"} workspace`;
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                {isEdit ? (
                  <Edit3 className="h-5 w-5" />
                ) : (
                  <Building2 className="h-5 w-5" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {isEdit ? "Edit Workspace" : "Create New Workspace"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isEdit
                    ? "Update your workspace details and settings"
                    : "Workspaces isolate teams, notes, and action items"}
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
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition-all cursor-pointer ${
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
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Workspace Slug
              </label>
              <input
                type="text"
                placeholder="acme-corp"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className={`w-full rounded-xl border px-3.5 py-2 text-md outline-none font-mono text-xs transition-all ${
                  isSlugTaken
                    ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-border/60 bg-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
                }`}
              />
              {isSlugTaken && (
                <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-500">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    This workspace slug already exists. Please choose a unique
                    slug.
                  </span>
                </div>
              )}
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
                disabled={isLoading || isSlugTaken || !name.trim()}
                className="gap-2 rounded-xl bg-gradient-r from-indigo-500 to-cyan-500 text-white shadow-lg cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEdit ? "Saving..." : "Creating..."}
                  </>
                ) : isEdit ? (
                  <>
                    <Check className="h-4 w-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Workspace
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

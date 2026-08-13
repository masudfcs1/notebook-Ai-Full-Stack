"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Trash2, Loader2 } from "lucide-react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { deleteWorkspaceFromState } from "@/lib/redux/dataSlice";
import { pushNotification } from "@/lib/redux/appSlice";
import {
  useDeleteWorkspaceMutation,
  WorkspaceItem,
} from "@/lib/redux/api/workspaceApiSlice";
import { Workspace } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  workspace: WorkspaceItem | Workspace | null;
}

export function DeleteWorkspaceModal({ open, onClose, workspace }: Props) {
  const dispatch = useAppDispatch();
  const [deleteWorkspace, { isLoading }] = useDeleteWorkspaceMutation();

  if (!open || !workspace) return null;

  async function handleDelete() {
    if (!workspace) return;

    try {
      const res = await deleteWorkspace(workspace.id).unwrap();
      dispatch(deleteWorkspaceFromState(workspace.id));
      dispatch(
        pushNotification({
          title: "Workspace deleted",
          description: `Workspace "${workspace.name}" was permanently removed.`,
          type: "warning",
        }),
      );
      toast.success(res.message || `Workspace "${workspace.name}" deleted!`);
      onClose();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to delete workspace";
      toast.error(msg);
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
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-rose-500/20 bg-background/95 p-6 shadow-2xl backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400">
                  Delete Workspace
                </h2>
                <p className="text-xs text-muted-foreground">
                  This action is permanent and cannot be undone
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

          <div className="py-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Are you sure you want to delete the workspace{" "}
              <span className="font-semibold text-foreground">
                "{workspace.name}"
              </span>
              ? All associated teams, notes, and action items will be permanently removed.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border/40 pt-4">
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
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Workspace
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

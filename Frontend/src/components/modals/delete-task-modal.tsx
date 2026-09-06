"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Trash2, Loader2 } from "lucide-react";
import { useDeleteTaskMutation } from "@/lib/redux/api/taskApiSlice";
import { useAppDispatch } from "@/lib/redux/hooks";
import { pushNotification } from "@/lib/redux/appSlice";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { TaskItem } from "@/lib/redux/api/taskApiSlice";
import type { ActionItem } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  task: TaskItem | ActionItem | null;
}

export function DeleteTaskModal({ open, onClose, task }: Props) {
  const dispatch = useAppDispatch();
  const [deleteTaskMutation, { isLoading }] = useDeleteTaskMutation();

  if (!open || !task) return null;

  async function handleDelete() {
    if (!task) return;

    try {
      const res = await deleteTaskMutation({
        id: task.id,
        teamId: task.teamId || undefined,
      }).unwrap();

      dispatch(
        pushNotification({
          title: "Task deleted",
          description: `Task "${task.title}" was removed.`,
          type: "warning",
        })
      );
      toast.success(res.message || "Task deleted successfully");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to delete task");
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
                  Delete Action Item
                </h2>
                <p className="text-xs text-muted-foreground">
                  This task will be permanently removed
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
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                "{task.title}"
              </span>
              ? This action cannot be undone.
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
                  Delete Task
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  gradient?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  gradient = "from-indigo-500 to-violet-500",
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/40 px-6 py-14 text-center backdrop-blur-sm",
        className,
      )}
    >
      <div className="relative mb-5">
        <div
          className={cn(
            "absolute inset-0 animate-pulse-glow rounded-2xl bg-linear-to-r opacity-40",
            gradient,
          )}
        />
        <div
          className={cn(
            "relative flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-r text-white shadow-lg",
            gradient,
          )}
        >
          <Icon className="h-7 w-7" strokeWidth={2} />
        </div>
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 cursor-pointer rounded-xl border border-indigo-500/35 bg-indigo-500/[0.06] px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm transition-all hover:scale-[1.02] hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-700 active:scale-[0.98] dark:text-indigo-300 dark:hover:text-indigo-200"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}

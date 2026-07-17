'use client'

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void }
  gradient?: string
  className?: string
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
        className
      )}
    >
      <div className="relative mb-5">
        <div
          className={cn(
            "absolute inset-0 animate-pulse-glow rounded-2xl bg-gradient-to-br opacity-40",
            gradient
          )}
        />
        <div
          className={cn(
            "relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
            gradient
          )}
        >
          <Icon className="h-7 w-7" strokeWidth={2} />
        </div>
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            "mt-5 rounded-xl bg-gradient-to-r px-4 py-2 text-sm font-medium text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]",
            gradient
          )}
        >
          {action.label}
        </button>
      )}
    </motion.div>
  )
}

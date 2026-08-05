'use client'

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Avoid rendering the persisted client theme during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"
  const nextTheme = isDark ? "light" : "dark"

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "h-9 w-9 rounded-xl border border-border/60 bg-background/50 text-muted-foreground transition-colors hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-foreground",
        className
      )}
      onClick={() => setTheme(nextTheme)}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4 text-indigo-500" aria-hidden="true" />
      )}
    </Button>
  )
}

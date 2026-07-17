'use client'

import { motion } from "framer-motion"
import {
  FileText, Sparkles, CheckSquare, TrendingUp, ArrowUpRight, ArrowRight,
  Upload, ListChecks, Clock, Users, Zap,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { setView, setActiveNote, pushNotification } from "@/lib/redux/appSlice"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/app/empty-state"

const STAT_CARDS = [
  {
    key: "notes",
    label: "Total Notes",
    icon: FileText,
    gradient: "from-indigo-500 to-violet-500",
    growth: "+12.5%",
    glow: "shadow-indigo-500/30",
  },
  {
    key: "summaries",
    label: "AI Summaries",
    icon: Sparkles,
    gradient: "from-violet-500 to-fuchsia-500",
    growth: "+8.2%",
    glow: "shadow-violet-500/30",
  },
  {
    key: "tasks",
    label: "Action Items",
    icon: CheckSquare,
    gradient: "from-emerald-500 to-teal-500",
    growth: "+24.1%",
    glow: "shadow-emerald-500/30",
  },
  {
    key: "productivity",
    label: "Productivity",
    icon: TrendingUp,
    gradient: "from-amber-500 to-orange-500",
    growth: "+5.4%",
    glow: "shadow-amber-500/30",
  },
] as const

const QUICK_ACTIONS = [
  { label: "Upload Notes", desc: "Drop a file or paste text", icon: Upload, gradient: "from-sky-500 to-indigo-500", view: "upload" as const },
  { label: "Generate Summary", desc: "Run AI on any note", icon: Sparkles, gradient: "from-violet-500 to-fuchsia-500", view: "summary" as const },
  { label: "View Action Items", desc: "See your task board", icon: ListChecks, gradient: "from-emerald-500 to-teal-500", view: "action-items" as const },
  { label: "Start Live Meeting", desc: "Capture notes in real-time", icon: Zap, gradient: "from-rose-500 to-orange-500", view: "ongoing" as const },
]

export function DashboardView() {
  const dispatch = useAppDispatch()
  const notes = useAppSelector((s) => s.data.notes)
  const summaries = useAppSelector((s) => s.data.summaries)
  const tasks = useAppSelector((s) => s.data.tasks)

  const stats = {
    notes: notes.length,
    summaries: summaries.length,
    tasks: tasks.length,
    productivity: tasks.length
      ? Math.round((tasks.filter((t) => t.status === "completed").length / tasks.length) * 100)
      : 0,
  }

  const recent = notes.slice(0, 5)

  // weekly chart data (synthetic but stable)
  const weekly = [
    { day: "Mon", value: 4 },
    { day: "Tue", value: 7 },
    { day: "Wed", value: 5 },
    { day: "Thu", value: 9 },
    { day: "Fri", value: 11 },
    { day: "Sat", value: 3 },
    { day: "Sun", value: 2 },
  ]
  const maxWeekly = Math.max(...weekly.map((w) => w.value))

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-emerald-500/5 p-5 backdrop-blur-sm md:p-6"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-indigo-500 dark:text-indigo-300">
              Welcome back, Arjun 👋
            </p>
            <h2 className="mt-1 text-xl font-semibold md:text-2xl">
              You have <span className="text-gradient">{tasks.filter((t) => t.status !== "completed").length} open action items</span> this week
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {notes.filter((n) => n.status === "draft").length} notes awaiting summary · {summaries.length} summaries ready
            </p>
          </div>
          <Button
            onClick={() => dispatch(setView("ongoing"))}
            className="gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/25 hover:opacity-95"
          >
            <Zap className="h-4 w-4" /> Start a meeting
          </Button>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map((card, i) => {
          const value = stats[card.key]
          const Icon = card.icon
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="group relative overflow-hidden border-border/50 p-5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className={cn("absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-opacity group-hover:opacity-40", card.gradient)} />
                <div className="relative flex items-start justify-between">
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg", card.gradient, card.glow)}>
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                  <Badge variant="secondary" className="gap-1 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight className="h-3 w-3" />
                    {card.growth}
                  </Badge>
                </div>
                <div className="relative mt-4">
                  <motion.p
                    key={value}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-3xl font-bold tracking-tight"
                  >
                    {value}{card.key === "productivity" && <span className="text-lg text-muted-foreground">%</span>}
                  </motion.p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{card.label}</p>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Main grid: recent + side */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <Card className="lg:col-span-2 border-border/50 p-5 backdrop-blur-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">Recent Activity</h3>
              <p className="text-xs text-muted-foreground">Latest meeting notes & summaries</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => dispatch(setView("history"))}>
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {recent.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No notes yet"
              description="Upload a file or start a live meeting to see your activity here."
              action={{ label: "Upload notes", onClick: () => dispatch(setView("upload")) }}
              className="py-10"
            />
          ) : (
            <div className="space-y-2">
              {recent.map((note, i) => {
                const summary = summaries.find((s) => s.noteId === note.id)
                return (
                  <motion.button
                    key={note.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => {
                      dispatch(setActiveNote(note.id))
                      dispatch(setView(note.status === "summarized" ? "summary" : "upload"))
                    }}
                    className="group flex w-full items-center gap-3 rounded-xl border border-transparent bg-muted/30 p-3 text-left transition-all hover:border-border/60 hover:bg-muted/50"
                  >
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white shadow-sm",
                      note.status === "summarized"
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                        : "bg-gradient-to-br from-amber-500 to-orange-500"
                    )}>
                      {note.status === "summarized" ? <Sparkles className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{note.title}</p>
                        <Badge variant="outline" className="h-4 shrink-0 px-1 text-[9px] uppercase tracking-wide">
                          {note.source}
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {summary ? summary.content.slice(0, 90) + "…" : note.content.slice(0, 90) + "…"}
                      </p>
                    </div>
                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="text-[11px] text-muted-foreground">{formatRelative(note.updatedAt)}</p>
                      <Badge variant="secondary" className={cn(
                        "mt-0.5 text-[9px]",
                        note.status === "summarized" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      )}>
                        {note.status === "summarized" ? "Summarized" : "Draft"}
                      </Badge>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </motion.button>
                )
              })}
            </div>
          )}
        </Card>

        {/* Side column */}
        <div className="space-y-6">
          {/* Quick actions */}
          <Card className="border-border/50 p-5 backdrop-blur-sm md:p-6">
            <h3 className="mb-4 text-base font-semibold">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.label}
                  onClick={() => dispatch(setView(a.view))}
                  className="group flex flex-col items-start gap-2 rounded-xl border border-border/50 bg-muted/30 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-border hover:bg-muted/50"
                >
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm", a.gradient)}>
                    <a.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-tight">{a.label}</p>
                    <p className="text-[10px] text-muted-foreground">{a.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Weekly chart */}
          <Card className="border-border/50 p-5 backdrop-blur-sm md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">This Week</h3>
                <p className="text-xs text-muted-foreground">Notes captured per day</p>
              </div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex h-32 items-end justify-between gap-1.5">
              {weekly.map((w, i) => (
                <div key={w.day} className="flex flex-1 flex-col items-center gap-1.5">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(w.value / maxWeekly) * 100}%` }}
                    transition={{ delay: i * 0.06, type: "spring", stiffness: 120, damping: 18 }}
                    className="w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-violet-400"
                    style={{ minHeight: 6 }}
                  />
                  <span className="text-[10px] text-muted-foreground">{w.day}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

'use client'

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles, Copy, Download, RefreshCw, FileText, ChevronDown, Check,
  ListChecks, Users, Smile, Meh, Frown, KeyRound, Gavel, TrendingUp,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { setActiveNote, setView, pushNotification } from "@/lib/redux/appSlice"
import { addSummary, addTask, setGenerating } from "@/lib/redux/dataSlice"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/app/empty-state"

export function SummaryView() {
  const dispatch = useAppDispatch()
  const notes = useAppSelector((s) => s.data.notes)
  const summaries = useAppSelector((s) => s.data.summaries)
  const activeNoteId = useAppSelector((s) => s.app.activeNoteId)
  const generating = useAppSelector((s) => s.data.generating)

  const summarizedNotes = notes.filter((n) => true)
  const initialId = activeNoteId && summarizedNotes.some((n) => n.id === activeNoteId)
    ? activeNoteId
    : summarizedNotes[0]?.id ?? null
  const [selectedId, setSelectedId] = useState<string | null>(initialId)
  const [copied, setCopied] = useState(false)

  const note = summarizedNotes.find((n) => n.id === selectedId) ?? null
  const summary = summaries.find((s) => s.noteId === selectedId) ?? null
  const noteTaskCount = useAppSelector((s) =>
    s.data.tasks.filter((t) => t.noteId === note?.id).length
  )

  async function regenerate() {
    if (!note) return
    dispatch(setGenerating(true))
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: note.id, title: note.title, content: note.content, persist: false }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      dispatch(addSummary({
        id: `sum-${Date.now()}`,
        noteId: note.id,
        content: data.summary.content,
        keyPoints: data.summary.keyPoints,
        decisions: data.summary.decisions,
        participants: data.summary.participants,
        sentiment: data.summary.sentiment,
        wordCount: data.summary.wordCount,
        createdAt: new Date().toISOString(),
      }))
      data.actionItems.forEach((a: any) => {
        dispatch(addTask({
          id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          noteId: note.id,
          title: a.title,
          assignee: a.assignee || undefined,
          dueDate: a.dueDate || undefined,
          priority: a.priority,
          status: "pending",
          createdAt: new Date().toISOString(),
        }))
      })
      dispatch(pushNotification({
        title: "Summary regenerated",
        description: `“${note.title}” was re-summarized.`,
        type: "success",
      }))
      toast.success("Summary regenerated!")
    } catch (err: any) {
      toast.error(err.message || "Failed to regenerate")
    } finally {
      dispatch(setGenerating(false))
    }
  }

  function copySummary() {
    if (!summary) return
    const text = [
      `# ${note?.title || "Meeting Summary"}`,
      "",
      summary.content,
      "",
      "## Key Points",
      ...summary.keyPoints.map((k) => `• ${k}`),
      "",
      "## Decisions",
      ...summary.decisions.map((d) => `• ${d}`),
      "",
      `Participants: ${summary.participants.join(", ") || "—"}`,
    ].join("\n")
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
    toast.success("Copied to clipboard")
  }

  function downloadSummary() {
    if (!summary) return
    const text = [
      `${note?.title || "Meeting Summary"}`,
      "=".repeat(40),
      "",
      summary.content,
      "",
      "KEY POINTS",
      "-".repeat(40),
      ...summary.keyPoints.map((k) => `• ${k}`),
      "",
      "DECISIONS",
      "-".repeat(40),
      ...summary.decisions.map((d) => `• ${d}`),
      "",
      "PARTICIPANTS",
      "-".repeat(40),
      summary.participants.join(", ") || "—",
    ].join("\n")
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${(note?.title || "summary").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Summary downloaded")
  }

  if (summarizedNotes.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={Sparkles}
          title="No summaries yet"
          description="Upload meeting notes or capture a live meeting, then let AI generate an executive summary for you."
          action={{ label: "Upload notes", onClick: () => dispatch(setView("upload")) }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Toolbar */}
      <Card className="flex flex-col gap-3 border-border/50 p-4 backdrop-blur-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Select
            value={selectedId || undefined}
            onValueChange={(v) => {
              setSelectedId(v)
              dispatch(setActiveNote(v))
            }}
          >
            <SelectTrigger className="h-10 w-full gap-2 rounded-xl border-border/60 bg-muted/30 md:w-72">
              <FileText className="h-4 w-4 text-indigo-500" />
              <SelectValue placeholder="Select a note" />
            </SelectTrigger>
            <SelectContent>
              {summarizedNotes.map((n) => (
                <SelectItem key={n.id} value={n.id}>
                  <span className="flex items-center gap-2">
                    {n.title}
                    {n.status === "summarized" && (
                      <Badge variant="secondary" className="ml-1 h-4 bg-emerald-500/10 px-1 text-[9px] text-emerald-600">
                        ✓
                      </Badge>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl" onClick={copySummary} disabled={!summary}>
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl" onClick={downloadSummary} disabled={!summary}>
            <Download className="h-4 w-4" /> Download
          </Button>
          <Button
            size="sm"
            className="gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25"
            onClick={regenerate}
            disabled={generating || !note}
          >
            <RefreshCw className={cn("h-4 w-4", generating && "animate-spin")} />
            {generating ? "Regenerating…" : "Regenerate"}
          </Button>
        </div>
      </Card>

      {note && (
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Left: original */}
          <Card className="flex flex-col border-border/50 p-5 backdrop-blur-sm md:p-6">
            <div className="mb-3 flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Original Notes</h3>
                  <p className="text-[11px] text-muted-foreground">{note.title}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] uppercase">{note.source}</Badge>
            </div>
            <div className="max-h-[560px] overflow-y-auto scrollbar-thin whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {note.content}
            </div>
          </Card>

          {/* Right: AI summary */}
          <Card className="relative flex flex-col overflow-hidden border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-5 backdrop-blur-sm md:p-6">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/15 blur-3xl" />
            <div className="relative mb-3 flex items-center justify-between border-b border-indigo-500/15 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/30">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">AI Summary</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {summary ? `${summary.wordCount} words · ${new Date(summary.createdAt).toLocaleDateString()}` : "Not generated yet"}
                  </p>
                </div>
              </div>
              {summary && (
                <SentimentBadge sentiment={summary.sentiment} />
              )}
            </div>

            <div className="relative max-h-[560px] space-y-4 overflow-y-auto scrollbar-thin">
              <AnimatePresence mode="wait">
                {generating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-64 flex-col items-center justify-center gap-4"
                  >
                    <div className="flex gap-1.5">
                      <span className="ai-dot h-2.5 w-2.5 rounded-full bg-indigo-500" style={{ animationDelay: "0ms" }} />
                      <span className="ai-dot h-2.5 w-2.5 rounded-full bg-violet-500" style={{ animationDelay: "200ms" }} />
                      <span className="ai-dot h-2.5 w-2.5 rounded-full bg-fuchsia-500" style={{ animationDelay: "400ms" }} />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">AI is analyzing your meeting…</p>
                    <p className="text-[11px] text-muted-foreground/70">Extracting key points, decisions & tasks</p>
                  </motion.div>
                ) : summary ? (
                  <motion.div
                    key={summary.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Executive summary */}
                    <div className="rounded-xl bg-background/50 p-4">
                      <p className="text-sm leading-relaxed">{summary.content}</p>
                    </div>

                    {/* Key points */}
                    {summary.keyPoints.length > 0 && (
                      <Section icon={KeyRound} title="Key Points" gradient="from-indigo-500 to-violet-500">
                        <ul className="space-y-1.5">
                          {summary.keyPoints.map((k, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-start gap-2 text-sm"
                            >
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                              {k}
                            </motion.li>
                          ))}
                        </ul>
                      </Section>
                    )}

                    {/* Decisions */}
                    {summary.decisions.length > 0 && (
                      <Section icon={Gavel} title="Decisions" gradient="from-emerald-500 to-teal-500">
                        <ul className="space-y-1.5">
                          {summary.decisions.map((d, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                              {d}
                            </li>
                          ))}
                        </ul>
                      </Section>
                    )}

                    {/* Participants */}
                    {summary.participants.length > 0 && (
                      <Section icon={Users} title="Participants" gradient="from-amber-500 to-orange-500">
                        <div className="flex flex-wrap gap-1.5">
                          {summary.participants.map((p, i) => (
                            <Badge key={i} variant="secondary" className="gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/20 text-[9px] font-bold">
                                {p.charAt(0).toUpperCase()}
                              </span>
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </Section>
                    )}
                  </motion.div>
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
                    <Sparkles className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No summary yet for this note.</p>
                    <Button onClick={regenerate} size="sm" className="gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
                      <Sparkles className="h-3.5 w-3.5" /> Generate now
                    </Button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </div>
      )}

      {/* Smart suggestions */}
      {summary && (
        <Card className="border-violet-500/20 bg-gradient-to-r from-violet-500/5 to-indigo-500/5 p-5 backdrop-blur-sm">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-violet-500" />
            <h3 className="text-sm font-semibold">Smart Suggestions</h3>
          </div>
          <div className="grid gap-2.5 md:grid-cols-3">
            <SuggestionCard
              icon={ListChecks}
              text={`${noteTaskCount} action items extracted from this meeting`}
              action={() => dispatch(setView("action-items"))}
              actionLabel="View board"
            />
            <SuggestionCard
              icon={Sparkles}
              text="Share this summary with stakeholders via export"
              action={downloadSummary}
              actionLabel="Export"
            />
            <SuggestionCard
              icon={FileText}
              text="Compare with previous meetings for recurring themes"
              action={() => dispatch(setView("history"))}
              actionLabel="View history"
            />
          </div>
        </Card>
      )}
    </div>
  )
}

function SentimentBadge({ sentiment }: { sentiment: "positive" | "neutral" | "negative" }) {
  const config = {
    positive: { icon: Smile, label: "Positive", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    neutral: { icon: Meh, label: "Neutral", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    negative: { icon: Frown, label: "Negative", cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  }[sentiment]
  const Icon = config.icon
  return (
    <Badge variant="secondary" className={cn("gap-1 text-[10px]", config.cls)}>
      <Icon className="h-3 w-3" /> {config.label}
    </Badge>
  )
}

function Section({ icon: Icon, title, gradient, children }: {
  icon: typeof Sparkles; title: string; gradient: string; children: React.ReactNode
}) {
  return (
    <div className="rounded-xl bg-background/40 p-3.5">
      <div className="mb-2 flex items-center gap-2">
        <div className={cn("flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br text-white", gradient)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      </div>
      {children}
    </div>
  )
}

function SuggestionCard({ icon: Icon, text, action, actionLabel }: {
  icon: typeof Sparkles; text: string; action: () => void; actionLabel: string
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-background/40 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
      <div className="flex-1">
        <p className="text-xs leading-relaxed text-muted-foreground">{text}</p>
        <button onClick={action} className="mt-1.5 text-[11px] font-medium text-indigo-500 hover:underline">
          {actionLabel} →
        </button>
      </div>
    </div>
  )
}

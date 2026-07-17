'use client'

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Radio, Pause, Play, Square, Download, Sparkles, Save, FileText,
  Clock, Users, Hash, Mic, Check, ChevronDown,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { addNote, setGenerating, addSummary, addTask } from "@/lib/redux/dataSlice"
import { setView, setActiveNote, pushNotification } from "@/lib/redux/appSlice"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function OngoingView() {
  const dispatch = useAppDispatch()
  const [title, setTitle] = useState("Untitled Meeting")
  const [content, setContent] = useState("")
  const [running, setRunning] = useState(true)
  const [seconds, setSeconds] = useState(0)
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle")
  const [summarizing, setSummarizing] = useState(false)
  const [participants, setParticipants] = useState("")
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // timer
  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [running])

  // autosave
  useEffect(() => {
    if (!content) return
    setSaved("saving")
    if (saveRef.current) clearTimeout(saveRef.current)
    saveRef.current = setTimeout(() => setSaved("saved"), 800)
    return () => {
      if (saveRef.current) clearTimeout(saveRef.current)
    }
  }, [content, title])

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0")
  const ss = String(seconds % 60).padStart(2, "0")
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  function exportText(format: "txt" | "doc" | "docx") {
    const stamp = new Date().toLocaleString()
    const header = `${title}\nDate: ${stamp}\nDuration: ${mm}:${ss}\nParticipants: ${participants || "—"}\n${"-".repeat(40)}\n\n`
    const body = content || "(no notes captured)"
    const full = header + body
    const blob = new Blob([full], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const safe = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "meeting"
    a.download = `${safe}.${format}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported as .${format}`)
  }

  function saveAsNote() {
    if (!content.trim()) {
      toast.error("Add some notes before saving.")
      return
    }
    const id = `note-${Date.now()}`
    dispatch(addNote({
      id,
      title: title.trim() || "Untitled Meeting",
      content,
      source: "ongoing",
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
    dispatch(setActiveNote(id))
    toast.success("Saved to your notes")
  }

  async function forwardToAI() {
    if (content.trim().length < 20) {
      toast.error("Add at least a few sentences before summarizing.")
      return
    }
    setSummarizing(true)
    dispatch(setGenerating(true))
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, persist: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to summarize")

      const noteId = data.noteId || `note-${Date.now()}`
      dispatch(addNote({
        id: noteId,
        title: title.trim() || "Untitled Meeting",
        content,
        source: "ongoing",
        status: "summarized",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
      dispatch(addSummary({
        id: `sum-${Date.now()}`,
        noteId,
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
          noteId,
          title: a.title,
          assignee: a.assignee || undefined,
          dueDate: a.dueDate || undefined,
          priority: a.priority,
          status: "pending",
          createdAt: new Date().toISOString(),
        }))
      })
      dispatch(setActiveNote(noteId))
      dispatch(pushNotification({
        title: "Summary ready",
        description: `“${title}” was summarized by AI.`,
        type: "success",
      }))
      toast.success("AI summary generated!")
      dispatch(setView("summary"))
    } catch (err: any) {
      toast.error(err.message || "Summarization failed")
    } finally {
      setSummarizing(false)
      dispatch(setGenerating(false))
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Live status bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 rounded-2xl border border-rose-500/20 bg-gradient-to-r from-rose-500/10 via-orange-500/5 to-transparent p-4 backdrop-blur-sm md:flex-row md:items-center md:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/30">
            <Radio className="h-5 w-5" />
            {running && (
              <span className="absolute inset-0 animate-ping rounded-xl bg-rose-500/40" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Live capture</span>
              <Badge variant="secondary" className={cn(
                "gap-1 text-[10px]",
                running ? "bg-rose-500/15 text-rose-500" : "bg-muted text-muted-foreground"
              )}>
                <span className={cn("h-1.5 w-1.5 rounded-full", running ? "animate-pulse bg-rose-500" : "bg-muted-foreground")} />
                {running ? "Recording" : "Paused"}
              </Badge>
            </div>
            <p className="flex items-center gap-1.5 font-mono text-2xl font-bold tabular-nums">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {mm}:{ss}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRunning((r) => !r)}
            className="gap-1.5 rounded-xl"
          >
            {running ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Resume</>}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setRunning(false); toast.info("Meeting stopped") }}
            className="gap-1.5 rounded-xl"
          >
            <Square className="h-4 w-4" /> Stop
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
                <Download className="h-4 w-4" /> Export
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportText("txt")}>
                <FileText className="mr-2 h-4 w-4" /> .txt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportText("doc")}>
                <FileText className="mr-2 h-4 w-4" /> .doc
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportText("docx")}>
                <FileText className="mr-2 h-4 w-4" /> .docx
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Editor */}
        <Card className="lg:col-span-2 border-border/50 p-5 backdrop-blur-sm md:p-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Meeting title…"
            className="w-full bg-transparent text-xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/50"
          />
          <div className="mb-3 mt-3 flex flex-wrap items-center gap-2 border-b border-border/40 pb-3">
            <Badge variant="outline" className="gap-1 text-[11px]">
              <Hash className="h-3 w-3" /> {wordCount} words
            </Badge>
            <Badge variant="outline" className="gap-1 text-[11px]">
              <Mic className="h-3 w-3" /> {content.length} chars
            </Badge>
            <div className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <AnimatePresence mode="wait">
                {saved === "saving" && (
                  <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" /> Saving…
                  </motion.span>
                )}
                {saved === "saved" && (
                  <motion.span key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1 text-emerald-500">
                    <Check className="h-3 w-3" /> Auto-saved
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Start typing your meeting notes…

Tips:
• Note attendees and the agenda at the top
• Capture decisions as they happen
• Mark action items with "→" so AI can find them
• Use timestamps like [10:32] for key moments`}
            className="min-h-[420px] w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground/40"
          />
        </Card>

        {/* Side panel */}
        <div className="space-y-5">
          <Card className="border-border/50 p-5 backdrop-blur-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Users className="h-4 w-4 text-indigo-500" /> Participants
            </h3>
            <input
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="Sarah, David, Mei…"
              className="w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="mt-2 text-[11px] text-muted-foreground">
              AI will cross-reference these names when summarizing.
            </p>
          </Card>

          <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-violet-500/5 p-5 backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Forward to AI</h3>
                <p className="text-[11px] text-muted-foreground">Generate summary + action items</p>
              </div>
            </div>
            <Button
              onClick={forwardToAI}
              disabled={summarizing || content.trim().length < 20}
              className="w-full gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25 hover:opacity-95 disabled:opacity-50"
            >
              {summarizing ? (
                <>
                  <span className="ai-dot h-1.5 w-1.5 rounded-full bg-white" style={{ animationDelay: "0ms" }} />
                  <span className="ai-dot h-1.5 w-1.5 rounded-full bg-white" style={{ animationDelay: "200ms" }} />
                  <span className="ai-dot h-1.5 w-1.5 rounded-full bg-white" style={{ animationDelay: "400ms" }} />
                  <span className="ml-1">Analyzing…</span>
                </>
              ) : (
                <><Sparkles className="h-4 w-4" /> Generate AI Summary</>
              )}
            </Button>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Ends the meeting and creates a summarized note with extracted tasks.
            </p>
          </Card>

          <Card className="border-border/50 p-5 backdrop-blur-sm">
            <Button
              onClick={saveAsNote}
              variant="outline"
              className="w-full gap-2 rounded-xl"
            >
              <Save className="h-4 w-4" /> Save as draft note
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useCallback, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  UploadCloud, FileText, X, CheckCircle2, AlertCircle, Sparkles,
  Pencil, Type, Loader2, FileUp,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { addNote, addSummary, addTask, setGenerating } from "@/lib/redux/dataSlice"
import { setView, setActiveNote, pushNotification } from "@/lib/redux/appSlice"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  progress: number
  status: "uploading" | "done" | "error"
  content?: string
}

const ACCEPTED = [".txt", ".doc", ".docx", ".pdf"]
const MAX_SIZE = 5 * 1024 * 1024

export function UploadView() {
  const dispatch = useAppDispatch()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [manualTitle, setManualTitle] = useState("")
  const [manualContent, setManualContent] = useState("")
  const [summarizing, setSummarizing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
    const ext = "." + (file.name.split(".").pop() || "").toLowerCase()
    if (!ACCEPTED.includes(ext)) {
      toast.error(`Unsupported file type: ${ext}`)
      return
    }
    if (file.size > MAX_SIZE) {
      toast.error("File too large (max 5MB)")
      return
    }
    const id = `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const entry: UploadedFile = {
      id, name: file.name, size: file.size, type: ext, progress: 0, status: "uploading",
    }
    setFiles((prev) => [entry, ...prev])

    // simulate progress
    const reader = new FileReader()
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : ""
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 25 + 15
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          setFiles((prev) =>
            prev.map((f) => (f.id === id ? { ...f, progress: 100, status: "done", content: text } : f))
          )
          toast.success(`${file.name} uploaded`)
        } else {
          setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, progress } : f)))
        }
      }, 220)
    }
    reader.onerror = () => {
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, status: "error" } : f)))
      toast.error("Failed to read file")
    }
    reader.readAsText(file)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    Array.from(e.dataTransfer.files).forEach(processFile)
  }, [processFile])

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  async function summarizeFile(file: UploadedFile) {
    if (!file.content || file.content.trim().length < 20) {
      toast.error("This file's content is too short to summarize.")
      return
    }
    setSummarizing(true)
    dispatch(setGenerating(true))
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: file.name.replace(/\.[^.]+$/, ""),
          content: file.content,
          persist: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")

      dispatch(addNote({
        id: data.noteId,
        title: file.name.replace(/\.[^.]+$/, ""),
        content: file.content,
        source: "upload",
        fileName: file.name,
        fileSize: file.size,
        status: "summarized",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
      dispatch(addSummary({
        id: `sum-${Date.now()}`,
        noteId: data.noteId,
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
          noteId: data.noteId,
          title: a.title,
          assignee: a.assignee || undefined,
          dueDate: a.dueDate || undefined,
          priority: a.priority,
          status: "pending",
          createdAt: new Date().toISOString(),
        }))
      })
      dispatch(setActiveNote(data.noteId))
      dispatch(pushNotification({
        title: "Summary ready",
        description: `“${file.name}” was summarized.`,
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

  async function summarizeManual() {
    if (manualContent.trim().length < 20) {
      toast.error("Add at least a few sentences first.")
      return
    }
    setSummarizing(true)
    dispatch(setGenerating(true))
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: manualTitle.trim() || "Untitled Meeting",
          content: manualContent,
          persist: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      dispatch(addNote({
        id: data.noteId,
        title: manualTitle.trim() || "Untitled Meeting",
        content: manualContent,
        source: "manual",
        status: "summarized",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
      dispatch(addSummary({
        id: `sum-${Date.now()}`,
        noteId: data.noteId,
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
          noteId: data.noteId,
          title: a.title,
          assignee: a.assignee || undefined,
          dueDate: a.dueDate || undefined,
          priority: a.priority,
          status: "pending",
          createdAt: new Date().toISOString(),
        }))
      })
      dispatch(setActiveNote(data.noteId))
      dispatch(pushNotification({
        title: "Summary ready",
        description: `“${manualTitle || "Untitled Meeting"}” was summarized.`,
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
    <div className="mx-auto max-w-5xl space-y-5">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 rounded-xl bg-muted/50 p-1">
          <TabsTrigger value="upload" className="gap-1.5 rounded-lg text-sm">
            <FileUp className="h-4 w-4" /> Upload File
          </TabsTrigger>
          <TabsTrigger value="manual" className="gap-1.5 rounded-lg text-sm">
            <Type className="h-4 w-4" /> Write Notes
          </TabsTrigger>
        </TabsList>

        {/* Upload tab */}
        <TabsContent value="upload" className="mt-5 space-y-5">
          <Card
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={cn(
              "relative overflow-hidden border-2 border-dashed p-8 text-center transition-all md:p-12",
              dragOver
                ? "border-indigo-500 bg-indigo-500/5"
                : "border-border/60 bg-card/40 hover:border-indigo-500/40"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED.join(",")}
              multiple
              className="hidden"
              onChange={(e) => {
                Array.from(e.target.files || []).forEach(processFile)
                e.target.value = ""
              }}
            />
            <motion.div
              animate={dragOver ? { scale: 1.05 } : { scale: 1 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30"
            >
              <UploadCloud className="h-8 w-8" />
            </motion.div>
            <h3 className="text-lg font-semibold">
              {dragOver ? "Drop to upload" : "Drag & drop your notes"}
            </h3>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
              or click to browse. We support TXT, DOC, DOCX, and PDF up to 5MB.
            </p>
            <Button
              onClick={() => inputRef.current?.click()}
              className="mt-5 gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25"
            >
              <FileUp className="h-4 w-4" /> Browse files
            </Button>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {ACCEPTED.map((ext) => (
                <Badge key={ext} variant="secondary" className="bg-muted/60 text-[11px] uppercase">
                  {ext}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Uploaded files list */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <h3 className="text-sm font-semibold text-muted-foreground">
                  {files.length} file{files.length > 1 ? "s" : ""} uploaded
                </h3>
                {files.map((f) => (
                  <Card key={f.id} className="flex items-center gap-3 border-border/50 p-4 backdrop-blur-sm">
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white shadow-sm",
                      f.status === "done" ? "bg-gradient-to-br from-emerald-500 to-teal-500" :
                      f.status === "error" ? "bg-gradient-to-br from-rose-500 to-red-500" :
                      "bg-gradient-to-br from-indigo-500 to-violet-500"
                    )}>
                      {f.status === "done" ? <CheckCircle2 className="h-5 w-5" /> :
                       f.status === "error" ? <AlertCircle className="h-5 w-5" /> :
                       <FileText className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{f.name}</p>
                        <Badge variant="outline" className="shrink-0 text-[9px] uppercase">{f.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatBytes(f.size)}</p>
                      {f.status === "uploading" && (
                        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                          <motion.div
                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                            animate={{ width: `${f.progress}%` }}
                          />
                        </div>
                      )}
                      {f.status === "done" && (
                        <p className="mt-0.5 text-[11px] text-emerald-500">Ready to summarize</p>
                      )}
                    </div>
                    {f.status === "done" && (
                      <Button
                        size="sm"
                        onClick={() => summarizeFile(f)}
                        disabled={summarizing}
                        className="shrink-0 gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md"
                      >
                        {summarizing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                        Summarize
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeFile(f.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Manual tab */}
        <TabsContent value="manual" className="mt-5">
          <Card className="border-border/50 p-5 backdrop-blur-sm md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Pencil className="h-4 w-4 text-indigo-500" />
              <h3 className="text-base font-semibold">Manual Note Input</h3>
            </div>
            <input
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="Meeting title (e.g. Sprint 14 Planning)"
              className="mb-3 w-full rounded-xl border border-border/60 bg-muted/30 px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
            />
            <textarea
              value={manualContent}
              onChange={(e) => setManualContent(e.target.value)}
              placeholder="Paste or write your meeting notes here…"
              className="min-h-[320px] w-full resize-none rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm leading-relaxed outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px]">{manualContent.trim() ? manualContent.trim().split(/\s+/).length : 0} words</Badge>
                <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 className="h-3 w-3" /> Auto-saved</span>
              </div>
              <Button
                onClick={summarizeManual}
                disabled={summarizing || manualContent.trim().length < 20}
                className="gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25 hover:opacity-95 disabled:opacity-50"
              >
                {summarizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate AI Summary
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

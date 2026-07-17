'use client'

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, Send, Bot, User } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { setAiWidget } from "@/lib/redux/appSlice"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Msg {
  role: "user" | "assistant"
  content: string
}

const SUGGESTIONS = [
  "How do I write better meeting notes?",
  "What can NoteFlow AI do?",
  "Tips for a productive standup?",
]

export function AiAssistantWidget() {
  const dispatch = useAppDispatch()
  const open = useAppSelector((s) => s.app.aiWidgetOpen)
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your NoteFlow AI assistant. Ask me about summarizing meetings, managing action items, or productivity tips.",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, loading])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setInput("")
    const next: Msg[] = [...messages, { role: "user", content: trimmed }]
    setMessages(next)
    setLoading(true)
    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      })
      const data = await res.json()
      setMessages([...next, { role: "assistant", content: data.reply || "Sorry, I couldn't process that." }])
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "I hit a snag reaching the AI service. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(setAiWidget(false))}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-4 right-4 z-50 flex h-[32rem] w-[min(92vw,24rem)] flex-col overflow-hidden rounded-2xl border border-white/30 bg-white/70 shadow-2xl shadow-indigo-500/20 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/70"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border/40 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 px-4 py-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/30">
                <Sparkles className="h-4 w-4" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">NoteFlow Assistant</p>
                <p className="text-[10px] text-muted-foreground">AI-powered meeting copilot</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => dispatch(setAiWidget(false))}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto scrollbar-thin px-3 py-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn("flex gap-2", m.role === "user" && "flex-row-reverse")}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                      m.role === "assistant"
                        ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {m.role === "assistant" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                  </div>
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                      m.role === "assistant"
                        ? "rounded-tl-sm bg-muted/60 text-foreground"
                        : "rounded-tr-sm bg-gradient-to-br from-indigo-500 to-violet-500 text-white"
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-muted/60 px-4 py-3">
                    <span className="ai-dot h-2 w-2 rounded-full bg-indigo-500" style={{ animationDelay: "0ms" }} />
                    <span className="ai-dot h-2 w-2 rounded-full bg-indigo-500" style={{ animationDelay: "200ms" }} />
                    <span className="ai-dot h-2 w-2 rounded-full bg-indigo-500" style={{ animationDelay: "400ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 px-3 pb-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-indigo-500/20 bg-indigo-500/5 px-2.5 py-1 text-[11px] text-indigo-600 transition-colors hover:bg-indigo-500/10 dark:text-indigo-300"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
              className="flex items-center gap-2 border-t border-border/40 p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about your meetings…"
                className="flex-1 rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading || !input.trim()}
                className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

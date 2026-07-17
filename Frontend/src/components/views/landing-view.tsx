'use client'

import { motion } from "framer-motion"
import {
  Sparkles, FileText, CheckSquare, ArrowRight, Zap, Shield, Globe,
  Upload, Brain, TrendingUp, Star, Play,
} from "lucide-react"
import { useAppDispatch } from "@/lib/redux/hooks"
import { setView } from "@/lib/redux/appSlice"
import { Button } from "@/components/ui/button"
import { Logo, Wordmark } from "@/components/app/logo"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

const FEATURES = [
  { icon: Brain, title: "AI Summaries", desc: "Turn hours of notes into executive summaries in seconds.", gradient: "from-indigo-500 to-violet-500" },
  { icon: CheckSquare, title: "Action Items", desc: "Auto-extract tasks, assignees, and due dates.", gradient: "from-emerald-500 to-teal-500" },
  { icon: Zap, title: "Live Capture", desc: "Take notes during the meeting, export & summarize after.", gradient: "from-amber-500 to-orange-500" },
  { icon: Shield, title: "Enterprise Ready", desc: "SSO, audit logs, and granular access control.", gradient: "from-rose-500 to-pink-500" },
  { icon: Globe, title: "Any Source", desc: "Upload TXT, DOCX, or PDF — or paste raw notes.", gradient: "from-sky-500 to-cyan-500" },
  { icon: TrendingUp, title: "Productivity", desc: "Track team velocity and meeting ROI over time.", gradient: "from-violet-500 to-fuchsia-500" },
]

const STEPS = [
  { n: "01", title: "Capture", desc: "Upload files or write notes live during your meeting.", icon: Upload },
  { n: "02", title: "Summarize", desc: "AI generates an executive summary, key points, and decisions.", icon: Sparkles },
  { n: "03", title: "Act", desc: "Action items land on your team board, ready to assign and ship.", icon: CheckSquare },
]

const STATS = [
  { value: "10k+", label: "Meetings summarized" },
  { value: "98%", label: "Action item accuracy" },
  { value: "4.9★", label: "Average rating" },
  { value: "60s", label: "Avg. summary time" },
]

export function LandingView() {
  const dispatch = useAppDispatch()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-mesh">
      {/* ambient orbs */}
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-40 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-white/60 backdrop-blur-2xl dark:bg-slate-950/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <Wordmark className="text-base" />
          </div>
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#stats" className="transition-colors hover:text-foreground">Stats</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {mounted && theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </Button>
            <Button
              onClick={() => dispatch(setView("dashboard"))}
              className="h-9 gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/30 hover:opacity-95"
            >
              Open App <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 md:px-8 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            AI Meeting Intelligence, reimagined
          </div>
          <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            Turn meeting chaos
            <br />
            into <span className="text-gradient animate-gradient">clarity</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted-foreground md:text-lg">
            Upload notes, generate AI summaries, and extract actionable tasks —
            all in one beautiful workspace your team will actually enjoy using.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              onClick={() => dispatch(setView("dashboard"))}
              className="h-12 gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 hover:opacity-95"
            >
              Start for free <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => dispatch(setView("ongoing"))}
              className="h-12 gap-2 rounded-xl border-border/60 bg-background/60 px-6 text-sm font-medium backdrop-blur-sm"
            >
              <Play className="h-4 w-4" /> Watch live demo
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">No credit card required · Free 14-day trial</p>
        </motion.div>

        {/* Floating glass preview card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto mt-14 max-w-5xl"
        >
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r from-indigo-500/30 via-violet-500/30 to-emerald-500/20 blur-2xl" />
          <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/70 shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/70">
            <div className="flex items-center gap-2 border-b border-border/40 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="mx-auto flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1 text-[11px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                app.noteflow.ai/dashboard
              </div>
            </div>
            <div className="grid gap-4 p-4 md:grid-cols-3 md:p-6">
              {[
                { icon: FileText, label: "Total Notes", value: "128", grad: "from-indigo-500 to-violet-500" },
                { icon: Sparkles, label: "AI Summaries", value: "96", grad: "from-violet-500 to-fuchsia-500" },
                { icon: CheckSquare, label: "Action Items", value: "243", grad: "from-emerald-500 to-teal-500" },
              ].map((c, i) => (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="rounded-2xl border border-border/40 bg-card/60 p-4 backdrop-blur-sm"
                >
                  <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${c.grad} text-white`}>
                    <c.icon className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold">{c.value}</p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </motion.div>
              ))}
            </div>
            <div className="border-t border-border/40 p-4 md:p-6">
              <div className="rounded-2xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-medium">Latest AI Summary</span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  The Q3 planning meeting aligned the team on shipping dashboard v2,
                  launching mobile beta, and reducing p95 latency below 200ms via a
                  cache-layer migration…
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats band */}
      <section id="stats" className="border-y border-border/40 bg-white/40 py-10 backdrop-blur-sm dark:bg-slate-900/40">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 md:grid-cols-4 md:px-8">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <p className="text-3xl font-bold text-gradient md:text-4xl">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground md:text-sm">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything your meetings <span className="text-gradient">deserve</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            A complete toolkit to capture, understand, and act on every conversation.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10"
            >
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} text-white shadow-lg`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${f.gradient} opacity-0 blur-2xl transition-opacity group-hover:opacity-20`} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-border/40 bg-white/40 py-20 backdrop-blur-sm dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              From notes to <span className="text-gradient">outcomes</span> in 3 steps
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-4xl font-bold text-gradient">{s.n}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg">
                    <s.icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-indigo-500/40 md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="mx-auto max-w-4xl px-4 py-20 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-emerald-500/10 p-8 backdrop-blur-xl md:p-12"
        >
          <div className="mb-4 flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <blockquote className="text-pretty text-xl font-medium leading-relaxed md:text-2xl">
            “NoteFlow AI replaced three tools for us. We walk out of every meeting
            with a summary and a task board — no more lost action items.”
          </blockquote>
          <div className="mt-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-semibold text-white">
              JM
            </div>
            <div>
              <p className="text-sm font-semibold">Jordan Mensah</p>
              <p className="text-xs text-muted-foreground">Head of Product, Lattice Labs</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 md:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-10 text-center text-white shadow-2xl shadow-indigo-500/30 md:p-16">
          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          <h2 className="relative text-3xl font-bold tracking-tight md:text-4xl">
            Ready to transform your meetings?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-white/80">
            Join thousands of teams shipping faster with AI-powered meeting intelligence.
          </p>
          <Button
            onClick={() => dispatch(setView("dashboard"))}
            className="relative mt-7 h-12 gap-2 rounded-xl bg-white px-7 text-sm font-semibold text-indigo-600 shadow-lg hover:bg-white/95"
          >
            Open the dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:px-8">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <Wordmark className="text-sm" />
          </div>
          <p>© {new Date().getFullYear()} NoteFlow AI. Crafted with care.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

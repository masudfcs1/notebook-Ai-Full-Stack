"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  ListChecks,
  Menu,
  MessageSquareText,
  Moon,
  Play,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setView } from "@/lib/redux/appSlice";
import { Button } from "@/components/ui/button";
import { Logo, Wordmark } from "@/components/app/logo";

const benefits = [
  {
    icon: MessageSquareText,
    number: "01",
    title: "Every conversation, captured",
    text: "Import transcripts, upload notes, or capture meetings live. Every important detail stays searchable and organized.",
    color: "from-blue-500 to-cyan-400",
    visual: "transcript",
  },
  {
    icon: BrainCircuit,
    number: "02",
    title: "Context, not just a summary",
    text: "AI understands decisions, risks, and themes, then turns them into a concise brief your team can trust.",
    color: "from-violet-500 to-fuchsia-400",
    visual: "summary",
  },
  {
    icon: ListChecks,
    number: "03",
    title: "Momentum after the meeting",
    text: "Action items arrive with owners and due dates, ready to review, assign, and move into your workflow.",
    color: "from-emerald-500 to-teal-400",
    visual: "tasks",
  },
];

const workflow = [
  ["Capture", "Upload notes, paste a transcript, or record your meeting live."],
  [
    "Understand",
    "AI identifies the signal: themes, decisions, risks, and questions.",
  ],
  [
    "Move forward",
    "Share the brief and send every action item to the right owner.",
  ],
];

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-70px" },
};

export function LandingView() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const start = () =>
    dispatch(setView(isAuthenticated ? "dashboard" : "signup"));
  const nav = [
    ["Product", "#product"],
    ["How it works", "#workflow"],
    ["Results", "#results"],
    ["Security", "#security"],
  ];

  return (
    <div className="landing-page landing-atmosphere min-h-screen overflow-x-hidden bg-[#f5f7ff] text-slate-950 selection:bg-blue-600 selection:text-white dark:bg-[#050817] dark:text-white">
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
        <div className="landing-nav-glass mx-auto flex h-[62px] max-w-[1180px] items-center justify-between rounded-[20px] px-4 sm:px-5 lg:px-6">
          <a
            href="#top"
            className="flex items-center gap-2.5"
            aria-label="NoteFlow AI home"
          >
            <Logo size={34} />
            <Wordmark className="text-[15px]" />
          </a>
          <nav
            className="hidden items-center gap-1 rounded-full border border-slate-200/60 bg-white/45 p-1 lg:flex dark:border-white/10 dark:bg-white/[0.035]"
            aria-label="Primary navigation"
          >
            {nav.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="rounded-full px-4 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-white/80 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="grid h-9 w-9 place-items-center rounded-full border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-white/70 dark:text-slate-400 dark:hover:border-white/10 dark:hover:bg-white/10"
              aria-label="Toggle color theme"
            >
              <Sun className="hidden h-[18px] w-[18px] dark:block" />
              <Moon className="h-[18px] w-[18px] dark:hidden" />
            </button>
            {!isAuthenticated && (
              <Button
                variant="ghost"
                onClick={() => dispatch(setView("login"))}
                className="hidden rounded-full px-4 text-sm sm:inline-flex"
              >
                Log in
              </Button>
            )}
            <Button
              onClick={start}
              className="landing-primary-button h-10 rounded-full px-4 text-sm font-semibold text-white sm:px-5"
            >
              <span className="hidden sm:inline">
                {isAuthenticated ? "Open dashboard" : "Start for free"}
              </span>
              <span className="sm:hidden">Start</span>
              <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="grid h-9 w-9 place-items-center rounded-full lg:hidden"
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="landing-nav-glass mx-auto mt-2 max-w-[1180px] rounded-[20px] p-3 lg:hidden">
            {nav.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-3 py-3 text-sm font-medium transition-colors hover:bg-white/60 dark:hover:bg-white/10"
              >
                {label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main id="top">
        <section className="relative overflow-hidden pb-20 pt-36 sm:pb-24 sm:pt-44 lg:min-h-[820px] lg:pb-32 lg:pt-48">
          <div className="landing-grid pointer-events-none absolute inset-0 opacity-70 dark:opacity-35" />
          <div className="landing-orb landing-orb-blue pointer-events-none absolute -left-40 top-20 h-[520px] w-[520px] rounded-full" />
          <div className="landing-orb landing-orb-violet pointer-events-none absolute -right-36 top-32 h-[560px] w-[560px] rounded-full" />
          <div className="landing-orb landing-orb-cyan pointer-events-none absolute left-[42%] top-[62%] h-[360px] w-[360px] rounded-full" />
          <div className="relative mx-auto grid max-w-[1240px] items-center gap-16 px-5 lg:grid-cols-[0.88fr_1.12fr] lg:gap-14 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="landing-pill mb-7 inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300">
                <Sparkles className="h-3.5 w-3.5" /> AI meeting intelligence{" "}
                <span className="h-1 w-1 rounded-full bg-blue-400" /> Built for
                focus
              </div>
              <h1 className="max-w-2xl text-[3.45rem] font-semibold leading-[0.94] tracking-[-0.065em] sm:text-[4.7rem] lg:text-[5.15rem]">
                Turn every meeting into{" "}
                <span className="landing-text-gradient">momentum.</span>
              </h1>
              <p className="mt-7 max-w-xl text-[1.05rem] leading-[1.75] tracking-[-0.01em] text-slate-600 sm:text-lg dark:text-slate-300">
                NoteFlow captures the conversation, finds the signal, and turns
                every decision into accountable action&mdash;before momentum is
                lost.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={start}
                  className="landing-primary-button h-12 rounded-full px-7 text-[15px] font-semibold text-white"
                >
                  {isAuthenticated
                    ? "Open your workspace"
                    : "Start your free workspace"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <a
                  href="#product"
                  className="landing-glass-button group inline-flex h-12 items-center justify-center rounded-full px-6 text-[15px] font-semibold text-slate-800 dark:text-white"
                >
                  <span className="mr-2 grid h-7 w-7 place-items-center rounded-full bg-slate-950 text-white transition-transform group-hover:scale-105 dark:bg-white dark:text-slate-950">
                    <Play className="ml-0.5 h-3 w-3 fill-current" />
                  </span>
                  Watch the workflow
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                {[
                  "No credit card required",
                  "Set up in 2 minutes",
                  "Cancel anytime",
                ].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
            <ProductPreview />
          </div>
        </section>

        <section className="relative z-10 px-5">
          <div className="landing-logo-cloud mx-auto flex max-w-[1120px] -translate-y-7 flex-col items-center gap-7 rounded-[1.6rem] px-6 py-7 sm:flex-row sm:justify-between">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 sm:text-left">
              Trusted by teams building what&apos;s next
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-10">
              {["Northstar", "Vertex", "Spherule", "Capsule", "Arc Labs"].map(
                (name, i) => (
                  <span
                    key={name}
                    className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-slate-400 transition-colors hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
                  >
                    <span
                      className={`h-3.5 w-3.5 ${i % 2 ? "rotate-45 rounded-[3px]" : "rounded-full"} bg-gradient-lr from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500`}
                    />
                    {name}
                  </span>
                ),
              )}
            </div>
          </div>
        </section>

        <section
          className="relative py-20 sm:py-28"
          aria-labelledby="benefit-heading"
        >
          <div className="landing-orb landing-orb-violet pointer-events-none absolute -left-64 top-1/3 h-[460px] w-[460px] rounded-full opacity-50" />
          <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
            <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                From talk to traction
              </p>
              <h2
                id="benefit-heading"
                className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl"
              >
                Everything after the meeting,
                <br className="hidden sm:block" /> beautifully handled.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
                One focused workspace to capture what was said, understand what
                matters, and make sure the work actually moves forward.
              </p>
            </motion.div>
            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {benefits.map((benefit, index) => (
                <motion.article
                  key={benefit.title}
                  {...fadeUp}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="landing-feature-card group overflow-hidden rounded-[1.75rem] p-6 transition-all duration-500 hover:-translate-y-2 sm:p-7"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-r ${benefit.color} text-white shadow-lg shadow-blue-500/15 transition-transform duration-500 group-hover:rotate-3 group-hover:scale-105`}
                    >
                      <benefit.icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-bold tracking-[0.18em] text-slate-300 dark:text-white/20">
                      {benefit.number}
                    </span>
                  </div>
                  <h3 className="mt-7 text-xl font-semibold tracking-[-0.025em]">
                    {benefit.title}
                  </h3>
                  <p className="mt-3 min-h-20 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {benefit.text}
                  </p>
                  <BenefitVisual type={benefit.visual} />
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="workflow"
          className="relative scroll-mt-24 px-5 py-10 text-white sm:py-16"
        >
          <div className="landing-dark-panel relative mx-auto max-w-[1220px] overflow-hidden rounded-[2.25rem] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
            <div className="landing-grid pointer-events-none absolute inset-0 opacity-15" />
            <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-violet-500/25 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-[110px]" />
            <div className="relative mx-auto grid max-w-[1080px] gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
              <motion.div {...fadeUp}>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                  A simpler workflow
                </p>
                <h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
                  Clarity in.
                  <br />
                  <span className="text-blue-300">Momentum out.</span>
                </h2>
                <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
                  No complex setup, no manual formatting, and no chasing people
                  after the call. Just a reliable path from conversation to
                  action.
                </p>
              </motion.div>
              <motion.div {...fadeUp} className="space-y-3">
                {workflow.map(([title, text], index) => (
                  <div
                    key={title}
                    className="landing-workflow-row group grid grid-cols-[42px_1fr] gap-4 rounded-2xl p-5 transition-colors sm:grid-cols-[52px_150px_1fr] sm:items-center"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/[0.06] text-xs font-semibold text-blue-200 transition group-hover:border-blue-300/40 group-hover:bg-blue-400/10">
                      0{index + 1}
                    </span>
                    <h3 className="text-base font-semibold sm:text-lg">
                      {title}
                    </h3>
                    <p className="col-start-2 text-sm leading-6 text-slate-400 sm:col-start-auto">
                      {text}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <section
          id="results"
          className="relative scroll-mt-24 px-5 py-20 sm:py-28"
        >
          <div className="landing-orb landing-orb-cyan pointer-events-none absolute -right-48 top-12 h-[480px] w-[480px] rounded-full opacity-60" />
          <motion.div
            {...fadeUp}
            className="landing-results-card relative mx-auto max-w-[1160px] overflow-hidden rounded-[2.25rem] text-white"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.12),transparent_42%)]" />
            <div className="relative grid lg:grid-cols-[1.15fr_0.85fr]">
              <div className="p-8 sm:p-12 lg:p-16">
                <div className="mb-7 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
                  <Sparkles className="h-4 w-4 fill-blue-200 text-blue-200" />{" "}
                  Customer story
                </div>
                <blockquote className="max-w-2xl text-2xl font-medium leading-[1.35] tracking-[-0.025em] sm:text-4xl">
                  &ldquo;NoteFlow gave us back the first ten minutes of every
                  workday. Everyone arrives informed, and every decision has an
                  owner.&rdquo;
                </blockquote>
                <div className="mt-8 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/15 text-sm font-bold backdrop-blur-xl">
                    MK
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Maya Khan</p>
                    <p className="text-xs text-blue-100">
                      VP of Product, Northstar
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 border-t border-white/15 bg-white/[0.06] backdrop-blur-xl lg:grid-cols-1 lg:border-l lg:border-t-0">
                <Metric value="6.4 hrs" label="saved per person, every month" />
                <Metric
                  value="91%"
                  label="of action items completed on time"
                  divider
                />
                <Metric
                  value="2.3x"
                  label="faster decision follow-through"
                  divider
                  className="col-span-2 lg:col-span-1"
                />
              </div>
            </div>
          </motion.div>
        </section>

        <section id="security" className="scroll-mt-24 px-5 py-6">
          <motion.div
            {...fadeUp}
            className="landing-security-card mx-auto grid max-w-[1100px] gap-8 rounded-[1.75rem] p-7 sm:grid-cols-[auto_1fr] sm:items-center sm:p-9"
          >
            <div className="grid h-16 w-16 place-items-center rounded-2xl border border-emerald-200/60 bg-emerald-50/80 text-emerald-600 shadow-[0_12px_30px_-16px_rgba(5,150,105,0.5)] dark:border-emerald-400/15 dark:bg-emerald-500/10">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                  Your conversations stay yours.
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Encrypted data, workspace permissions, and privacy-minded AI
                  processing keep your team knowledge protected.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {["Encrypted", "Role-based access", "Audit ready"].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-200/80 bg-white/50 px-3 py-1.5 dark:border-white/10 dark:bg-white/5"
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="px-5 py-20 sm:py-28">
          <motion.div
            {...fadeUp}
            className="landing-cta-panel relative mx-auto max-w-[1040px] overflow-hidden rounded-[2.25rem] px-6 py-16 text-center sm:px-10 sm:py-20"
          >
            <div className="landing-grid pointer-events-none absolute inset-0 opacity-25" />
            <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/30 blur-[90px]" />
            <div className="relative">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
                Your next meeting can be different
              </p>
              <h2 className="text-4xl font-semibold leading-tight tracking-[-0.045em] text-white sm:text-6xl">
                Less meeting debt.
                <br />
                More meaningful progress.
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-300">
                Create your workspace today and turn the next conversation into
                a plan everyone understands.
              </p>
              <Button
                onClick={start}
                className="mt-8 h-12 rounded-full bg-white px-7 text-[15px] font-semibold text-slate-950 shadow-xl shadow-blue-950/20 transition hover:bg-blue-50"
              >
                {isAuthenticated
                  ? "Go to your dashboard"
                  : "Get started for free"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-slate-200/60 bg-white/35 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-[1240px] px-5 py-10 lg:px-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <Logo size={30} />
                <Wordmark className="text-sm" />
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Where conversations become progress.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-500">
              {nav.slice(0, 3).map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="transition-colors hover:text-slate-950 dark:hover:text-white"
                >
                  {label}
                </a>
              ))}
              <a
                href="#"
                className="transition-colors hover:text-slate-950 dark:hover:text-white"
              >
                Privacy
              </a>
              <a
                href="#"
                className="transition-colors hover:text-slate-950 dark:hover:text-white"
              >
                Terms
              </a>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200/70 pt-6 text-xs text-slate-400 sm:flex-row sm:justify-between dark:border-white/10">
            <p>Copyright {new Date().getFullYear()} NoteFlow AI.</p>
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
              </span>{" "}
              All systems operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProductPreview() {
  return <InteractiveProductPreview />;
}

const previewTabs = [
  { label: "Overview", shortLabel: "Home", icon: BarChart3 },
  { label: "Meetings", shortLabel: "Notes", icon: FileText },
  { label: "Action items", shortLabel: "Tasks", icon: ListChecks },
  { label: "Team", shortLabel: "Team", icon: Users },
];

function InteractiveProductPreview() {
  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => {
      setActiveTab((current) => (current + 1) % previewTabs.length);
    }, 3800);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  return (
    <motion.div
      id="product"
      initial={{ opacity: 0, x: 30, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative scroll-mt-28"
    >
      <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-blue-400/35 via-violet-400/20 to-cyan-300/30 blur-3xl dark:from-blue-600/30 dark:via-violet-600/20 dark:to-cyan-500/15" />
      <div className="landing-product-frame relative overflow-hidden rounded-[1.75rem]">
        <div className="flex h-12 items-center border-b border-slate-200/60 bg-white/55 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035]">
          <div className="flex gap-1.5" aria-hidden="true">
            <i className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <i className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <i className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="mx-auto flex h-7 w-44 items-center justify-center gap-1.5 rounded-lg border border-slate-200/70 bg-slate-50 text-[9px] font-medium text-slate-500 dark:border-white/5 dark:bg-white/5 dark:text-slate-400">
            <ShieldCheck className="h-3 w-3 text-emerald-500" /> app.noteflow.ai
          </div>
          <span className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-violet-600 sm:hidden" />
        </div>

        <div className="grid min-h-[445px] grid-cols-[58px_1fr] sm:grid-cols-[158px_1fr]">
          <aside className="flex flex-col border-r border-slate-200/60 bg-white/30 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.025] sm:p-3">
            <div className="mb-5 flex items-center gap-2 px-1 py-1.5">
              <Logo size={26} />
              <div className="hidden min-w-0 sm:block">
                <b className="block truncate text-[11px] tracking-[-0.02em]">
                  NoteFlow AI
                </b>
                <span className="block text-[8px] font-medium uppercase tracking-[0.12em] text-slate-400">
                  Workspace
                </span>
              </div>
            </div>

            <nav className="space-y-1" aria-label="Product preview navigation">
              {previewTabs.map((tab, index) => {
                const Icon = tab.icon;
                const active = activeTab === index;
                return (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => setActiveTab(index)}
                    aria-pressed={active}
                    className={`group relative flex w-full items-center gap-2.5 overflow-hidden rounded-xl px-2.5 py-2.5 text-left text-[10px] font-semibold transition-all duration-300 ${active ? "bg-blue-600 text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.8)]" : "text-slate-500 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"}`}
                  >
                    {active && (
                      <motion.span
                        layoutId="preview-active"
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"
                      />
                    )}
                    <Icon className="relative z-10 h-3.5 w-3.5 shrink-0" />
                    <span className="relative z-10 hidden truncate sm:block">
                      {tab.label}
                    </span>
                    <span className="sr-only sm:hidden">{tab.shortLabel}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto hidden rounded-xl border border-slate-200 bg-white p-2.5 sm:block dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-violet-100 text-[8px] font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                  AM
                </span>
                <div className="min-w-0">
                  <b className="block truncate text-[8px]">Alex Morgan</b>
                  <span className="block text-[7px] text-slate-400">
                    Product team
                  </span>
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0 bg-white/65 p-3.5 backdrop-blur-2xl dark:bg-[#0b1425]/80 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
                  NoteFlow workspace
                </p>
                <h3 className="mt-1 text-sm font-semibold tracking-[-0.025em] sm:text-base">
                  {previewTabs[activeTab].label}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-semibold text-emerald-700 sm:flex dark:bg-emerald-500/10 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{" "}
                  Live sync
                </span>
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-r from-violet-500 to-blue-600 text-[8px] font-bold text-white">
                  AM
                </span>
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <PreviewPanel activeTab={activeTab} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="absolute bottom-0 left-[58px] right-0 h-0.5 bg-slate-100 dark:bg-white/5 sm:left-[158px]">
          <motion.div
            key={`progress-${activeTab}`}
            initial={{ width: 0 }}
            animate={{ width: isPaused ? "100%" : "100%" }}
            transition={{ duration: isPaused ? 0.2 : 3.8, ease: "linear" }}
            className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
          />
        </div>
      </div>

      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="landing-floating-card absolute -bottom-6 -right-2 hidden w-48 rounded-2xl p-3 sm:block lg:-right-8"
      >
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            <Zap className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] font-semibold">Workspace updated</p>
            <p className="text-[9px] text-slate-400">Everything is in sync</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PreviewPanel({ activeTab }: { activeTab: number }) {
  if (activeTab === 0) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <PreviewStat label="Meetings" value="24" change="+12%" />
          <PreviewStat label="Actions done" value="86%" change="+8%" />
          <PreviewStat
            label="Time saved"
            value="6.4h"
            change="This month"
            hide
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-xl border border-slate-200 p-3.5 dark:border-white/10">
            <div className="mb-4 flex items-center justify-between">
              <b className="text-[10px]">Meeting activity</b>
              <span className="text-[8px] text-slate-400">Last 7 days</span>
            </div>
            <div className="flex h-24 items-end gap-2">
              {[38, 64, 48, 82, 58, 92, 72].map((height, index) => (
                <motion.span
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.04, duration: 0.45 }}
                  className={`flex-1 rounded-t-sm ${index === 5 ? "bg-blue-600" : "bg-blue-100 dark:bg-blue-500/15"}`}
                />
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-slate-950 p-3.5 text-white dark:bg-blue-600">
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-300 dark:text-blue-100">
              AI insight
            </p>
            <p className="mt-2 text-[11px] font-medium leading-4">
              Your team closes action items 23% faster this week.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[8px] text-white/55">
              <Sparkles className="h-3 w-3" /> Updated just now
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 1) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <MiniStat icon={Clock3} label="Duration" value="42 min" />
          <MiniStat icon={Users} label="People" value="6 people" />
          <MiniStat icon={CalendarDays} label="Date" value="Today" hide />
        </div>
        <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-xl border border-slate-200 p-3.5 dark:border-white/10">
            <div className="flex items-center justify-between">
              <b className="flex items-center gap-1.5 text-[10px]">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" /> Weekly
                product sync
              </b>
              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[7px] font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                READY
              </span>
            </div>
            <p className="mt-3 text-[9px] leading-[1.7] text-slate-500 dark:text-slate-400">
              The team aligned on the beta scope and prioritized onboarding
              performance before expanding invitations.
            </p>
            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 dark:border-white/10">
              {[
                "Ship onboarding fixes by Friday",
                "Begin customer beta with 50 users",
                "Review metrics after the first week",
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-2 text-[8px] text-slate-600 dark:text-slate-300"
                >
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-blue-50 p-3.5 dark:bg-blue-500/10">
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-300">
              Key decision
            </p>
            <p className="mt-2 text-[10px] font-semibold leading-4">
              Launch beta with the first 50 customers on Monday.
            </p>
            <span className="mt-4 inline-flex rounded-full bg-white px-2 py-1 text-[7px] font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-300">
              High priority
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 2) {
    return (
      <div>
        <div className="mb-3 grid grid-cols-3 gap-2">
          <PreviewStat label="Open" value="12" change="4 today" />
          <PreviewStat label="In progress" value="7" change="On track" />
          <PreviewStat label="Complete" value="31" change="86%" />
        </div>
        <div className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-white/10">
          {[
            ["Optimize onboarding performance", "SK", "Today", 82],
            ["Prepare the beta customer list", "AM", "Monday", 54],
            ["Build product metrics view", "JR", "Aug 23", 28],
          ].map(([task, owner, due, progress], index) => (
            <div
              key={task as string}
              className="rounded-lg bg-slate-50 p-2.5 dark:bg-white/5"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`grid h-5 w-5 place-items-center rounded-md ${index === 0 ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-300 dark:border-white/10"}`}
                >
                  <Check className="h-3 w-3" />
                </span>
                <p className="min-w-0 flex-1 truncate text-[9px] font-semibold">
                  {task}
                </p>
                <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-900 text-[6px] font-bold text-white dark:bg-blue-600">
                  {owner}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 pl-7">
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="block h-full rounded-full bg-blue-600"
                  />
                </span>
                <span className="w-10 text-right text-[7px] text-slate-400">
                  {due}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-100">
            Team workspace
          </p>
          <p className="mt-1 text-sm font-semibold">
            8 people moving work forward
          </p>
        </div>
        <div className="flex -space-x-1.5">
          {["AM", "SK", "JR"].map((name) => (
            <span
              key={name}
              className="grid h-7 w-7 place-items-center rounded-full border-2 border-blue-600 bg-white text-[7px] font-bold text-blue-700"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {[
          [
            "Alex Morgan",
            "Product lead",
            "AM",
            "bg-violet-100 text-violet-700",
          ],
          ["Sara Kim", "Design", "SK", "bg-amber-100 text-amber-700"],
          [
            "Jordan Reed",
            "Engineering",
            "JR",
            "bg-emerald-100 text-emerald-700",
          ],
          ["Mina Patel", "Research", "MP", "bg-rose-100 text-rose-700"],
        ].map(([name, role, initials, color]) => (
          <div
            key={name}
            className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 dark:border-white/10"
          >
            <span
              className={`grid h-8 w-8 place-items-center rounded-full text-[8px] font-bold ${color}`}
            >
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[9px] font-semibold">{name}</p>
              <p className="truncate text-[7px] text-slate-400">{role}</p>
            </div>
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewStat({
  label,
  value,
  change,
  hide = false,
}: {
  label: string;
  value: string;
  change: string;
  hide?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-2.5 dark:border-white/10 dark:bg-white/[0.025] ${hide ? "hidden sm:block" : ""}`}
    >
      <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>
      <div className="mt-1 flex items-end justify-between gap-1">
        <b className="text-base tracking-[-0.04em]">{value}</b>
        <span className="text-[7px] font-medium text-emerald-600 dark:text-emerald-400">
          {change}
        </span>
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  hide = false,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
  hide?: boolean;
}) {
  return (
    <div
      className={`rounded-xl bg-slate-50 p-2.5 dark:bg-white/5 ${hide ? "hidden sm:block" : ""}`}
    >
      <div className="flex items-center gap-1 text-[8px] uppercase text-slate-400">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-1 text-[10px] font-semibold">{value}</p>
    </div>
  );
}

function BenefitVisual({ type }: { type: string }) {
  if (type === "transcript")
    return (
      <div className="mt-7 rounded-xl bg-slate-50 p-3.5 dark:bg-white/5">
        <div className="mb-3 flex justify-between">
          <b className="text-[9px] text-slate-400">LIVE TRANSCRIPT</b>
          <span className="text-[8px] font-semibold text-rose-500">
            RECORDING
          </span>
        </div>
        {[72, 90, 63].map((width) => (
          <div key={width} className="mb-3 flex gap-2">
            <i className="h-5 w-5 rounded-full bg-blue-200" />
            <div className="flex-1">
              <i
                className="block h-1.5 rounded bg-slate-200 dark:bg-white/10"
                style={{ width: `${width}%` }}
              />
              <i className="mt-1.5 block h-1.5 w-2/5 rounded bg-slate-200 dark:bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    );
  if (type === "summary")
    return (
      <div className="mt-7 rounded-xl bg-violet-50 p-3.5 dark:bg-violet-500/10">
        <div className="mb-3 flex items-center gap-2 text-[9px] font-bold text-violet-600">
          <Sparkles className="h-3.5 w-3.5" /> KEY DECISION
        </div>
        <p className="text-[10px] font-medium leading-4 text-slate-700 dark:text-slate-300">
          Launch the onboarding beta with 50 customers on August 24.
        </p>
        <div className="mt-3 flex gap-2">
          <span className="rounded-full bg-white px-2 py-1 text-[8px] text-slate-500">
            Product
          </span>
          <span className="rounded-full bg-white px-2 py-1 text-[8px] text-slate-500">
            High priority
          </span>
        </div>
      </div>
    );
  return (
    <div className="mt-7 space-y-2 rounded-xl bg-slate-50 p-3.5 dark:bg-white/5">
      {[
        ["Update onboarding copy", "SK"],
        ["Invite beta cohort", "AM"],
        ["Create metrics dashboard", "JR"],
      ].map(([task, owner], i) => (
        <div
          key={task}
          className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm dark:bg-white/5"
        >
          <CheckCircle2
            className={`h-3.5 w-3.5 ${i ? "text-slate-300" : "text-emerald-500"}`}
          />
          <span className="flex-1 truncate text-[9px] font-medium">{task}</span>
          <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-900 text-[7px] font-bold text-white">
            {owner}
          </span>
        </div>
      ))}
    </div>
  );
}

function Metric({
  value,
  label,
  divider = false,
  className = "",
}: {
  value: string;
  label: string;
  divider?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`p-6 sm:p-8 lg:px-10 ${divider ? "border-l border-white/15 lg:border-l-0 lg:border-t" : ""} ${className}`}
    >
      <p className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
        {value}
      </p>
      <p className="mt-2 max-w-40 text-xs leading-5 text-blue-100">{label}</p>
    </div>
  );
}

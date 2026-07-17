import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface MeetingNote {
  id: string
  title: string
  content: string
  source: "manual" | "upload" | "ongoing"
  fileName?: string
  fileSize?: number
  status: "draft" | "summarized"
  createdAt: string
  updatedAt: string
}

export interface Summary {
  id: string
  noteId: string
  content: string
  keyPoints: string[]
  decisions: string[]
  participants: string[]
  sentiment: "positive" | "neutral" | "negative"
  wordCount: number
  createdAt: string
}

export type TaskStatus = "pending" | "in_progress" | "completed"
export type TaskPriority = "low" | "medium" | "high"

export interface ActionItem {
  id: string
  noteId?: string
  title: string
  assignee?: string
  dueDate?: string
  priority: TaskPriority
  status: TaskStatus
  createdAt: string
}

interface DataState {
  notes: MeetingNote[]
  summaries: Summary[]
  tasks: ActionItem[]
  loading: boolean
  generating: boolean
}

const now = new Date().toISOString()
const hourAgo = new Date(Date.now() - 3600_000).toISOString()
const dayAgo = new Date(Date.now() - 86400_000).toISOString()
const twoDaysAgo = new Date(Date.now() - 2 * 86400_000).toISOString()
const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString()

const seedNotes: MeetingNote[] = [
  {
    id: "note-1",
    title: "Q3 Product Planning",
    content:
      "Meeting started 10:00 AM. Attendees: Sarah (PM), David (Eng), Mei (Design), Carlos (QA).\nSarah opened with Q3 goals — ship v2 of the dashboard, launch mobile app beta, and reduce p95 latency to under 200ms. David noted the latency work requires a migration to the new cache layer, estimated 3 sprints. Mei presented the new onboarding flow mockups; team approved with minor tweaks to step 2. Carlos raised concerns about regression coverage on the billing module.\nDecision: prioritize latency migration in sprint 14. Onboarding ships sprint 15. Carlos to add billing e2e tests by Friday.\nMeeting ended 11:05 AM.",
    source: "manual",
    status: "summarized",
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
  },
  {
    id: "note-2",
    title: "Customer Discovery — Acme Corp",
    content:
      "Call with Acme's VP of Ops, Janet. She described pain points: manual reporting takes 4 hours weekly, no single source of truth for metrics, onboarding new analysts is slow. Wants automated dashboards and role-based views. Budget approved for Q3. Next step: send proposal within 5 business days. Competitive landscape: evaluating us vs Looker and Metabase. Janet prefers our UX but needs SSO and audit logs for enterprise tier.",
    source: "upload",
    fileName: "acme-discovery.txt",
    fileSize: 1840,
    status: "summarized",
    createdAt: dayAgo,
    updatedAt: dayAgo,
  },
  {
    id: "note-3",
    title: "Engineering Standup",
    content:
      "Standup. David: finished cache layer spike, will open PR today. Mei: design tokens published to Figma library. Carlos: blocked on test data for billing e2e, needs DBA help. Action: David to pair with Carlos on test data tomorrow.",
    source: "ongoing",
    status: "draft",
    createdAt: hourAgo,
    updatedAt: hourAgo,
  },
  {
    id: "note-4",
    title: "Design Review — Onboarding v2",
    content:
      "Reviewed Mei's onboarding v2. Consensus: step 2 too dense, split into two. Add progress indicator. Remove mandatory company field. Color contrast on CTA fails WCAG AA — fix to indigo-600. Ship to staging by Wednesday.",
    source: "manual",
    status: "draft",
    createdAt: weekAgo,
    updatedAt: weekAgo,
  },
]

const seedSummaries: Summary[] = [
  {
    id: "sum-1",
    noteId: "note-1",
    content:
      "The Q3 Product Planning meeting aligned the team on three major goals: shipping dashboard v2, launching a mobile app beta, and reducing p95 latency below 200ms. The latency target requires a cache-layer migration spanning roughly three sprints. Mei's onboarding flow was approved with minor revisions to step 2. Carlos flagged billing regression risk and committed to expanding e2e coverage.",
    keyPoints: [
      "Ship dashboard v2 in Q3",
      "Launch mobile app beta",
      "Reduce p95 latency to <200ms via cache migration",
      "Onboarding flow approved with step 2 tweaks",
      "Billing e2e tests needed by Friday",
    ],
    decisions: [
      "Latency migration prioritized for sprint 14",
      "Onboarding ships sprint 15",
      "Carlos owns billing e2e coverage",
    ],
    participants: ["Sarah", "David", "Mei", "Carlos"],
    sentiment: "positive",
    wordCount: 86,
    createdAt: twoDaysAgo,
  },
  {
    id: "sum-2",
    noteId: "note-2",
    content:
      "Discovery call with Acme Corp's VP of Ops revealed strong fit: weekly manual reporting pain, need for a single metrics source, and faster analyst onboarding. Budget is approved for Q3. Acme is evaluating us against Looker and Metabase but prefers our UX. Enterprise requirements include SSO and audit logs. A proposal is due within five business days.",
    keyPoints: [
      "Acme has approved Q3 budget",
      "Core pain: 4 hrs/week manual reporting",
      "Needs role-based views & automated dashboards",
      "Evaluating us vs Looker/Metabase",
      "Enterprise needs: SSO + audit logs",
    ],
    decisions: [
      "Send proposal within 5 business days",
      "Package SSO + audit logs for enterprise tier",
    ],
    participants: ["Janet (Acme)", "Sales", "PM"],
    sentiment: "positive",
    wordCount: 78,
    createdAt: dayAgo,
  },
]

const seedTasks: ActionItem[] = [
  {
    id: "task-1",
    noteId: "note-1",
    title: "Migrate cache layer for p95 latency",
    assignee: "David Chen",
    dueDate: "Sprint 14",
    priority: "high",
    status: "in_progress",
    createdAt: twoDaysAgo,
  },
  {
    id: "task-2",
    noteId: "note-1",
    title: "Add billing e2e tests",
    assignee: "Carlos Ruiz",
    dueDate: "Friday",
    priority: "high",
    status: "pending",
    createdAt: twoDaysAgo,
  },
  {
    id: "task-3",
    noteId: "note-1",
    title: "Revise onboarding step 2 mockups",
    assignee: "Mei Lin",
    dueDate: "Sprint 15",
    priority: "medium",
    status: "completed",
    createdAt: twoDaysAgo,
  },
  {
    id: "task-4",
    noteId: "note-2",
    title: "Send Acme proposal",
    assignee: "Sales Team",
    dueDate: "5 business days",
    priority: "high",
    status: "in_progress",
    createdAt: dayAgo,
  },
  {
    id: "task-5",
    noteId: "note-2",
    title: "Package SSO + audit logs (enterprise)",
    assignee: "David Chen",
    dueDate: "Q3",
    priority: "medium",
    status: "pending",
    createdAt: dayAgo,
  },
  {
    id: "task-6",
    noteId: "note-3",
    title: "Pair on billing test data",
    assignee: "David Chen",
    dueDate: "Tomorrow",
    priority: "medium",
    status: "pending",
    createdAt: hourAgo,
  },
  {
    id: "task-7",
    noteId: "note-4",
    title: "Fix CTA color contrast to indigo-600",
    assignee: "Mei Lin",
    dueDate: "Wednesday",
    priority: "low",
    status: "completed",
    createdAt: weekAgo,
  },
  {
    id: "task-8",
    noteId: "note-4",
    title: "Split onboarding step 2 into two steps",
    assignee: "Mei Lin",
    dueDate: "Wednesday",
    priority: "medium",
    status: "in_progress",
    createdAt: weekAgo,
  },
]

const initialState: DataState = {
  notes: seedNotes,
  summaries: seedSummaries,
  tasks: seedTasks,
  loading: false,
  generating: false,
}

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    setNotes(state, action: PayloadAction<MeetingNote[]>) {
      state.notes = action.payload
    },
    addNote(state, action: PayloadAction<MeetingNote>) {
      state.notes.unshift(action.payload)
    },
    updateNote(state, action: PayloadAction<Partial<MeetingNote> & { id: string }>) {
      const idx = state.notes.findIndex((n) => n.id === action.payload.id)
      if (idx >= 0) {
        state.notes[idx] = { ...state.notes[idx], ...action.payload, updatedAt: new Date().toISOString() }
      }
    },
    deleteNote(state, action: PayloadAction<string>) {
      state.notes = state.notes.filter((n) => n.id !== action.payload)
      state.summaries = state.summaries.filter((s) => s.noteId !== action.payload)
      state.tasks = state.tasks.filter((t) => t.noteId !== action.payload)
    },
    setSummaries(state, action: PayloadAction<Summary[]>) {
      state.summaries = action.payload
    },
    addSummary(state, action: PayloadAction<Summary>) {
      const idx = state.summaries.findIndex((s) => s.noteId === action.payload.noteId)
      if (idx >= 0) state.summaries[idx] = action.payload
      else state.summaries.unshift(action.payload)
      const note = state.notes.find((n) => n.id === action.payload.noteId)
      if (note) note.status = "summarized"
    },
    setTasks(state, action: PayloadAction<ActionItem[]>) {
      state.tasks = action.payload
    },
    addTask(state, action: PayloadAction<ActionItem>) {
      state.tasks.unshift(action.payload)
    },
    updateTask(state, action: PayloadAction<Partial<ActionItem> & { id: string }>) {
      const idx = state.tasks.findIndex((t) => t.id === action.payload.id)
      if (idx >= 0) {
        state.tasks[idx] = { ...state.tasks[idx], ...action.payload }
      }
    },
    deleteTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload)
    },
    moveTask(state, action: PayloadAction<{ id: string; status: TaskStatus }>) {
      const t = state.tasks.find((x) => x.id === action.payload.id)
      if (t) t.status = action.payload.status
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
    setGenerating(state, action: PayloadAction<boolean>) {
      state.generating = action.payload
    },
  },
})

export const {
  setNotes,
  addNote,
  updateNote,
  deleteNote,
  setSummaries,
  addSummary,
  setTasks,
  addTask,
  updateTask,
  deleteTask,
  moveTask,
  setLoading,
  setGenerating,
} = dataSlice.actions

export default dataSlice.reducer

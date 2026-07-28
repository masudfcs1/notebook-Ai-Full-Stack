import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Workspace, Team, TeamMember, ActionItem, PriorityLevel, TaskStatus } from "@/types"

export interface MeetingNote {
  id: string
  workspaceId?: string
  teamId?: string
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

interface DataState {
  workspaces: Workspace[]
  activeWorkspaceId: string
  activeTeamId: string | null // null = All Teams
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

// Seed Workspaces and Teams
const seedWorkspaces: Workspace[] = [
  {
    id: "ws-1",
    name: "Acme Enterprise",
    slug: "acme-enterprise",
    icon: "⚡",
    description: "Main product engineering & ops workspace",
    teams: [
      {
        id: "team-eng",
        workspaceId: "ws-1",
        name: "Engineering",
        slug: "engineering",
        key: "ENG",
        icon: "💻",
        members: [
          { id: "m-1", teamId: "team-eng", name: "David Chen", email: "david@acme.io", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces", role: "LEAD" },
          { id: "m-2", teamId: "team-eng", name: "Sarah Chen", email: "sarah@acme.io", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces", role: "MEMBER" },
          { id: "m-3", teamId: "team-eng", name: "Alex Rivera", email: "alex@acme.io", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces", role: "MEMBER" },
        ],
      },
      {
        id: "team-prd",
        workspaceId: "ws-1",
        name: "Product Design",
        slug: "product-design",
        key: "PRD",
        icon: "🎨",
        members: [
          { id: "m-4", teamId: "team-prd", name: "Mei Lin", email: "mei@acme.io", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces", role: "LEAD" },
          { id: "m-5", teamId: "team-prd", name: "Arjun Kapoor", email: "arjun@acme.io", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces", role: "MEMBER" },
        ],
      },
      {
        id: "team-mkt",
        workspaceId: "ws-1",
        name: "Growth & Marketing",
        slug: "growth-marketing",
        key: "MKT",
        icon: "🚀",
        members: [
          { id: "m-6", teamId: "team-mkt", name: "Carlos Ruiz", email: "carlos@acme.io", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&crop=faces", role: "LEAD" },
          { id: "m-7", teamId: "team-mkt", name: "Elena Rostova", email: "elena@acme.io", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces", role: "MEMBER" },
        ],
      },
    ],
  },
  {
    id: "ws-2",
    name: "NoteFlow AI Labs",
    slug: "noteflow-labs",
    icon: "🧠",
    description: "AI model training and algorithm engineering",
    teams: [
      {
        id: "team-ai",
        workspaceId: "ws-2",
        name: "Core Intelligence",
        slug: "core-intelligence",
        key: "AI",
        icon: "⚡",
        members: [
          { id: "m-8", teamId: "team-ai", name: "Dr. Victor Vance", email: "victor@noteflow.ai", role: "OWNER" },
        ],
      },
    ],
  },
]

const seedNotes: MeetingNote[] = [
  {
    id: "note-1",
    workspaceId: "ws-1",
    teamId: "team-eng",
    title: "Q3 Product Architecture & Latency Roadmap",
    content:
      "Meeting started 10:00 AM. Attendees: Sarah (PM), David (Eng), Mei (Design), Carlos (QA).\nSarah opened with Q3 goals — ship v2 of the dashboard, launch mobile app beta, and reduce p95 latency to under 200ms. David noted the latency work requires a migration to the new cache layer, estimated 3 sprints. Mei presented the new onboarding flow mockups; team approved with minor tweaks to step 2.\nDecision: prioritize latency migration in sprint 14. Onboarding ships sprint 15.",
    source: "manual",
    status: "summarized",
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
  },
  {
    id: "note-2",
    workspaceId: "ws-1",
    teamId: "team-prd",
    title: "Onboarding Experience & Figma Review",
    content:
      "Reviewed Mei's onboarding v2. Consensus: step 2 too dense, split into two. Add progress indicator. Remove mandatory company field. Color contrast on CTA fails WCAG AA — fix to indigo-600. Ship to staging by Wednesday.",
    source: "upload",
    fileName: "onboarding-review.txt",
    fileSize: 1840,
    status: "summarized",
    createdAt: dayAgo,
    updatedAt: dayAgo,
  },
]

const seedSummaries: Summary[] = [
  {
    id: "sum-1",
    noteId: "note-1",
    content:
      "The Q3 Product Planning meeting aligned the team on three major goals: shipping dashboard v2, launching a mobile app beta, and reducing p95 latency below 200ms. The latency target requires a cache-layer migration spanning roughly three sprints.",
    keyPoints: [
      "Ship dashboard v2 in Q3",
      "Launch mobile app beta",
      "Reduce p95 latency to <200ms via cache migration",
    ],
    decisions: [
      "Latency migration prioritized for sprint 14",
      "Onboarding ships sprint 15",
    ],
    participants: ["David Chen", "Sarah Chen", "Mei Lin", "Carlos Ruiz"],
    sentiment: "positive",
    wordCount: 86,
    createdAt: twoDaysAgo,
  },
]

const seedTasks: ActionItem[] = [
  {
    id: "task-101",
    identifier: "ENG-101",
    noteId: "note-1",
    workspaceId: "ws-1",
    teamId: "team-eng",
    teamName: "Engineering",
    title: "Migrate Redis cache layer for p95 latency < 200ms",
    description: "Implement cluster sharding and benchmark request latency under load.",
    assignee: "David Chen",
    assigneeAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
    dueDate: "Sprint 14",
    priority: "urgent",
    status: "in_progress",
    createdAt: twoDaysAgo,
  },
  {
    id: "task-102",
    identifier: "ENG-102",
    noteId: "note-1",
    workspaceId: "ws-1",
    teamId: "team-eng",
    teamName: "Engineering",
    title: "Set up billing regression e2e test suite",
    description: "Write Cypress & Playwright integration tests for Stripe webhook handlers.",
    assignee: "Sarah Chen",
    assigneeAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
    dueDate: "Friday",
    priority: "high",
    status: "todo",
    createdAt: twoDaysAgo,
  },
  {
    id: "task-103",
    identifier: "PRD-201",
    noteId: "note-2",
    workspaceId: "ws-1",
    teamId: "team-prd",
    teamName: "Product Design",
    title: "Split onboarding step 2 into step 2A and 2B",
    description: "Refactor Figma component specs and export updated design tokens.",
    assignee: "Mei Lin",
    assigneeAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces",
    dueDate: "Wednesday",
    priority: "medium",
    status: "in_progress",
    createdAt: dayAgo,
  },
  {
    id: "task-104",
    identifier: "PRD-202",
    noteId: "note-2",
    workspaceId: "ws-1",
    teamId: "team-prd",
    teamName: "Product Design",
    title: "Fix CTA color contrast to meet WCAG AA standards",
    description: "Update hex code to indigo-600 in design system palette.",
    assignee: "Arjun Kapoor",
    assigneeAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
    dueDate: "Today",
    priority: "urgent",
    status: "done",
    createdAt: dayAgo,
  },
  {
    id: "task-105",
    identifier: "MKT-301",
    workspaceId: "ws-1",
    teamId: "team-mkt",
    teamName: "Growth & Marketing",
    title: "Launch Acme Enterprise Q3 product update campaign",
    description: "Prepare email newsletter blast and social media collateral.",
    assignee: "Carlos Ruiz",
    assigneeAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&crop=faces",
    dueDate: "Next Monday",
    priority: "high",
    status: "backlog",
    createdAt: hourAgo,
  },
]

const initialState: DataState = {
  workspaces: seedWorkspaces,
  activeWorkspaceId: "ws-1",
  activeTeamId: null, // null = All Teams
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
    // Workspaces
    setActiveWorkspace(state, action: PayloadAction<string>) {
      state.activeWorkspaceId = action.payload
      state.activeTeamId = null
    },
    setActiveWorkspaceBySlug(state, action: PayloadAction<string>) {
      const ws = state.workspaces.find((w) => w.slug === action.payload)
      if (ws) {
        state.activeWorkspaceId = ws.id
        state.activeTeamId = null
      }
    },
    addWorkspace(state, action: PayloadAction<Workspace>) {
      state.workspaces.push(action.payload)
      state.activeWorkspaceId = action.payload.id
      state.activeTeamId = null
    },

    // Teams
    setActiveTeam(state, action: PayloadAction<string | null>) {
      state.activeTeamId = action.payload
    },
    setActiveTeamBySlug(state, action: PayloadAction<string | null>) {
      if (!action.payload) {
        state.activeTeamId = null
        return
      }
      const activeWs = state.workspaces.find((w) => w.id === state.activeWorkspaceId)
      const team = activeWs?.teams.find((t) => t.slug === action.payload)
      if (team) {
        state.activeTeamId = team.id
      }
    },
    addTeam(state, action: PayloadAction<Team>) {
      const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId)
      if (ws) {
        ws.teams.push(action.payload)
      }
    },
    updateTeam(state, action: PayloadAction<{ teamId: string; name?: string; key?: string; icon?: string }>) {
      for (const ws of state.workspaces) {
        const team = ws.teams.find((t) => t.id === action.payload.teamId)
        if (team) {
          if (action.payload.name) {
            team.name = action.payload.name
            team.slug = action.payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
          }
          if (action.payload.key) team.key = action.payload.key.toUpperCase()
          if (action.payload.icon) team.icon = action.payload.icon
          break
        }
      }
    },
    addTeamMember(state, action: PayloadAction<{ teamId: string; member: TeamMember }>) {
      for (const ws of state.workspaces) {
        const team = ws.teams.find((t) => t.id === action.payload.teamId)
        if (team) {
          team.members.push(action.payload.member)
          break
        }
      }
    },
    updateTeamMember(
      state,
      action: PayloadAction<{
        teamId: string
        memberId: string
        name?: string
        email?: string
        role?: "OWNER" | "LEAD" | "MEMBER"
      }>
    ) {
      for (const ws of state.workspaces) {
        const team = ws.teams.find((t) => t.id === action.payload.teamId)
        if (team) {
          const mem = team.members.find((m) => m.id === action.payload.memberId)
          if (mem) {
            if (action.payload.name) mem.name = action.payload.name
            if (action.payload.email) mem.email = action.payload.email
            if (action.payload.role) mem.role = action.payload.role
          }
          break
        }
      }
    },
    removeTeamMember(state, action: PayloadAction<{ teamId: string; memberId: string }>) {
      for (const ws of state.workspaces) {
        const team = ws.teams.find((t) => t.id === action.payload.teamId)
        if (team) {
          team.members = team.members.filter((m) => m.id !== action.payload.memberId)
          break
        }
      }
    },

    // Notes & Summaries
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
    addSummary(state, action: PayloadAction<Summary>) {
      const idx = state.summaries.findIndex((s) => s.noteId === action.payload.noteId)
      if (idx >= 0) state.summaries[idx] = action.payload
      else state.summaries.unshift(action.payload)
      const note = state.notes.find((n) => n.id === action.payload.noteId)
      if (note) note.status = "summarized"
    },

    // Action Items / Tasks
    setTasks(state, action: PayloadAction<ActionItem[]>) {
      state.tasks = action.payload
    },
    addTask(state, action: PayloadAction<ActionItem>) {
      state.tasks.unshift(action.payload)
    },
    updateTask(state, action: PayloadAction<Partial<ActionItem> & { id: string }>) {
      const idx = state.tasks.findIndex((t) => t.id === action.payload.id)
      if (idx >= 0) {
        state.tasks[idx] = { ...state.tasks[idx], ...action.payload, updatedAt: new Date().toISOString() }
      }
    },
    updateTaskStatus(state, action: PayloadAction<{ id: string; status: TaskStatus }>) {
      const t = state.tasks.find((x) => x.id === action.payload.id)
      if (t) {
        t.status = action.payload.status
        t.updatedAt = new Date().toISOString()
      }
    },
    moveTask(state, action: PayloadAction<{ id: string; status: TaskStatus }>) {
      const t = state.tasks.find((x) => x.id === action.payload.id)
      if (t) {
        t.status = action.payload.status
        t.updatedAt = new Date().toISOString()
      }
    },
    deleteTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload)
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
  setActiveWorkspace,
  setActiveWorkspaceBySlug,
  addWorkspace,
  setActiveTeam,
  setActiveTeamBySlug,
  addTeam,
  updateTeam,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
  addNote,
  updateNote,
  deleteNote,
  addSummary,
  setTasks,
  addTask,
  updateTask,
  updateTaskStatus,
  moveTask,
  deleteTask,
  setLoading,
  setGenerating,
} = dataSlice.actions

export default dataSlice.reducer

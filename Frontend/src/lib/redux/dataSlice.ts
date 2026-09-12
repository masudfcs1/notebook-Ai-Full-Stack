import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  Workspace,
  Team,
  TeamMember,
  ActionItem,
  PriorityLevel,
  TaskStatus,
} from "@/types";

export interface MeetingNote {
  id: string;
  workspaceId?: string;
  teamId?: string;
  title: string;
  content: string;
  source: "manual" | "upload" | "ongoing";
  fileName?: string;
  fileSize?: number;
  status: "draft" | "summarized";
  createdAt: string;
  updatedAt: string;
}

export interface Summary {
  id: string;
  noteId: string;
  content: string;
  keyPoints: string[];
  decisions: string[];
  participants: string[];
  sentiment: "positive" | "neutral" | "negative";
  wordCount: number;
  createdAt: string;
}

interface DataState {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  activeTeamId: string | null; // null = All Teams
  notes: MeetingNote[];
  summaries: Summary[];
  tasks: ActionItem[];
  loading: boolean;
  generating: boolean;
}

const initialState: DataState = {
  workspaces: [],
  activeWorkspaceId: "",
  activeTeamId: null, // null = All Teams
  notes: [],
  summaries: [],
  tasks: [],
  loading: false,
  generating: false,
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    // Workspaces

    setActiveWorkspace(state, action: PayloadAction<string>) {
      state.activeWorkspaceId = action.payload;
      state.activeTeamId = null;
    },
    setActiveWorkspaceBySlug(state, action: PayloadAction<string>) {
      const searchSlug = (action.payload || "").toLowerCase().trim();
      const ws = state.workspaces.find(
        (w) =>
          (w.slug && w.slug.toLowerCase() === searchSlug) ||
          (w.id && w.id.toLowerCase() === searchSlug) ||
          w.id === action.payload ||
          (w.name &&
            w.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "") === searchSlug),
      );
      if (ws && state.activeWorkspaceId !== ws.id) {
        state.activeWorkspaceId = ws.id;
        state.activeTeamId = null;
      }
    },
    setWorkspaces(state, action: PayloadAction<Workspace[]>) {
      state.workspaces = action.payload;
      if (action.payload.length > 0) {
        const activeWs = action.payload.find(
          (w) => w.id === state.activeWorkspaceId,
        );
        if (!activeWs) {
          state.activeWorkspaceId = action.payload[0].id;
          state.activeTeamId = null;
        } else if (state.activeTeamId) {
          const teamExists = activeWs.teams?.some(
            (t) => t.id === state.activeTeamId,
          );
          if (!teamExists) {
            state.activeTeamId = activeWs.teams?.[0]?.id || null;
          }
        }
      }
    },
    addWorkspace(state, action: PayloadAction<Workspace>) {
      const exists = state.workspaces.some((w) => w.id === action.payload.id);
      if (!exists) {
        state.workspaces.push(action.payload);
      }
      state.activeWorkspaceId = action.payload.id;
      state.activeTeamId = null;
    },
    updateWorkspaceInState(
      state,
      action: PayloadAction<{
        id: string;
        name?: string;
        icon?: string;
        description?: string;
        slug?: string;
      }>,
    ) {
      const idx = state.workspaces.findIndex((w) => w.id === action.payload.id);
      if (idx >= 0) {
        state.workspaces[idx] = {
          ...state.workspaces[idx],
          ...action.payload,
        };
      }
    },
    deleteWorkspaceFromState(state, action: PayloadAction<string>) {
      state.workspaces = state.workspaces.filter(
        (w) => w.id !== action.payload,
      );
      if (state.activeWorkspaceId === action.payload) {
        state.activeWorkspaceId = state.workspaces[0]?.id || "";
        state.activeTeamId = null;
      }
    },

    // Teams
    setActiveTeam(state, action: PayloadAction<string | null>) {
      state.activeTeamId = action.payload;
    },
    setActiveTeamBySlug(state, action: PayloadAction<string | null>) {
      if (!action.payload) {
        state.activeTeamId = null;
        return;
      }
      const activeWs = state.workspaces.find(
        (w) => w.id === state.activeWorkspaceId,
      );
      const searchSlug = (action.payload || "").toLowerCase().trim();
      const team = activeWs?.teams?.find(
        (t) =>
          (t.slug && t.slug.toLowerCase() === searchSlug) ||
          (t.key && t.key.toLowerCase() === searchSlug) ||
          (t.name && t.name.toLowerCase() === searchSlug) ||
          (t.name &&
            t.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "") === searchSlug) ||
          t.id === action.payload,
      );
      if (team) {
        state.activeTeamId = team.id;
      }
    },
    addTeam(state, action: PayloadAction<Team>) {
      const ws = state.workspaces.find(
        (w) => w.id === (action.payload.workspaceId || state.activeWorkspaceId),
      );
      if (ws) {
        if (!ws.teams) ws.teams = [];
        const exists = ws.teams.some((t) => t.id === action.payload.id);
        if (!exists) {
          ws.teams.push(action.payload);
        }
      }
    },
    updateTeam(
      state,
      action: PayloadAction<{
        teamId: string;
        name?: string;
        key?: string;
        icon?: string;
      }>,
    ) {
      for (const ws of state.workspaces) {
        const team = ws.teams.find((t) => t.id === action.payload.teamId);
        if (team) {
          if (action.payload.name) {
            team.name = action.payload.name;
            team.slug = action.payload.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "");
          }
          if (action.payload.key) team.key = action.payload.key.toUpperCase();
          if (action.payload.icon) team.icon = action.payload.icon;
          break;
        }
      }
    },
    deleteTeamFromState(state, action: PayloadAction<string>) {
      for (const ws of state.workspaces) {
        if (ws.teams) {
          const idx = ws.teams.findIndex((t) => t.id === action.payload);
          if (idx >= 0) {
            ws.teams.splice(idx, 1);
            if (state.activeTeamId === action.payload) {
              state.activeTeamId = null;
            }
            break;
          }
        }
      }
    },
    addTeamMember(
      state,
      action: PayloadAction<{ teamId: string; member: TeamMember }>,
    ) {
      for (const ws of state.workspaces) {
        const team = ws.teams.find((t) => t.id === action.payload.teamId);
        if (team) {
          team.members.push(action.payload.member);
          break;
        }
      }
    },
    updateTeamMember(
      state,
      action: PayloadAction<{
        teamId: string;
        memberId: string;
        name?: string;
        email?: string;
        role?: "OWNER" | "LEAD" | "MEMBER";
      }>,
    ) {
      for (const ws of state.workspaces) {
        const team = ws.teams.find((t) => t.id === action.payload.teamId);
        if (team) {
          const mem = team.members.find(
            (m) => m.id === action.payload.memberId,
          );
          if (mem) {
            if (action.payload.name) mem.name = action.payload.name;
            if (action.payload.email) mem.email = action.payload.email;
            if (action.payload.role) mem.role = action.payload.role;
          }
          break;
        }
      }
    },
    removeTeamMember(
      state,
      action: PayloadAction<{ teamId: string; memberId: string }>,
    ) {
      for (const ws of state.workspaces) {
        const team = ws.teams.find((t) => t.id === action.payload.teamId);
        if (team) {
          team.members = team.members.filter(
            (m) => m.id !== action.payload.memberId,
          );
          break;
        }
      }
    },

    // Notes & Summaries
    addNote(state, action: PayloadAction<MeetingNote>) {
      state.notes.unshift(action.payload);
    },
    updateNote(
      state,
      action: PayloadAction<Partial<MeetingNote> & { id: string }>,
    ) {
      const idx = state.notes.findIndex((n) => n.id === action.payload.id);
      if (idx >= 0) {
        state.notes[idx] = {
          ...state.notes[idx],
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteNote(state, action: PayloadAction<string>) {
      state.notes = state.notes.filter((n) => n.id !== action.payload);
      state.summaries = state.summaries.filter(
        (s) => s.noteId !== action.payload,
      );
      state.tasks = state.tasks.filter((t) => t.noteId !== action.payload);
    },
    addSummary(state, action: PayloadAction<Summary>) {
      const idx = state.summaries.findIndex(
        (s) => s.noteId === action.payload.noteId,
      );
      if (idx >= 0) state.summaries[idx] = action.payload;
      else state.summaries.unshift(action.payload);
      const note = state.notes.find((n) => n.id === action.payload.noteId);
      if (note) note.status = "summarized";
    },

    // Action Items / Tasks
    setTasks(state, action: PayloadAction<ActionItem[]>) {
      state.tasks = action.payload;
    },
    addTask(state, action: PayloadAction<ActionItem>) {
      state.tasks.unshift(action.payload);
    },
    updateTask(
      state,
      action: PayloadAction<Partial<ActionItem> & { id: string }>,
    ) {
      const idx = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (idx >= 0) {
        state.tasks[idx] = {
          ...state.tasks[idx],
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    updateTaskStatus(
      state,
      action: PayloadAction<{ id: string; status: TaskStatus }>,
    ) {
      const t = state.tasks.find((x) => x.id === action.payload.id);
      if (t) {
        t.status = action.payload.status;
        t.updatedAt = new Date().toISOString();
      }
    },
    moveTask(state, action: PayloadAction<{ id: string; status: TaskStatus }>) {
      const t = state.tasks.find((x) => x.id === action.payload.id);
      if (t) {
        t.status = action.payload.status;
        t.updatedAt = new Date().toISOString();
      }
    },
    deleteTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setGenerating(state, action: PayloadAction<boolean>) {
      state.generating = action.payload;
    },
    resetDataState(state) {
      state.workspaces = [];
      state.activeWorkspaceId = "";
      state.activeTeamId = null;
      state.notes = [];
      state.summaries = [];
      state.tasks = [];
      state.loading = false;
      state.generating = false;
    },
  },
});

export const {
  setActiveWorkspace,
  setActiveWorkspaceBySlug,
  setWorkspaces,
  addWorkspace,
  updateWorkspaceInState,
  deleteWorkspaceFromState,
  setActiveTeam,
  setActiveTeamBySlug,
  addTeam,
  updateTeam,
  deleteTeamFromState,
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
  resetDataState,
} = dataSlice.actions;

export default dataSlice.reducer;

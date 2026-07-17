import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export type ViewKey =
  | "landing"
  | "dashboard"
  | "ongoing"
  | "upload"
  | "summary"
  | "action-items"
  | "history"
  | "settings"

export interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type: "info" | "success" | "warning"
}

interface AppState {
  view: ViewKey
  sidebarCollapsed: boolean
  mobileNavOpen: boolean
  activeNoteId: string | null
  notifications: NotificationItem[]
  aiWidgetOpen: boolean
  searchQuery: string
}

const initialState: AppState = {
  view: "landing",
  sidebarCollapsed: false,
  mobileNavOpen: false,
  activeNoteId: null,
  aiWidgetOpen: false,
  searchQuery: "",
  notifications: [
    {
      id: "n1",
      title: "Summary ready",
      description: "Q3 Planning meeting summary was generated.",
      time: "2m ago",
      read: false,
      type: "success",
    },
    {
      id: "n2",
      title: "New action item assigned",
      description: "You were assigned 'Draft API spec' — due Friday.",
      time: "1h ago",
      read: false,
      type: "info",
    },
    {
      id: "n3",
      title: "Storage almost full",
      description: "You've used 86% of your plan's storage.",
      time: "3h ago",
      read: true,
      type: "warning",
    },
  ],
}

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setView(state, action: PayloadAction<ViewKey>) {
      state.view = action.payload
      state.mobileNavOpen = false
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setMobileNav(state, action: PayloadAction<boolean>) {
      state.mobileNavOpen = action.payload
    },
    setActiveNote(state, action: PayloadAction<string | null>) {
      state.activeNoteId = action.payload
    },
    toggleAiWidget(state) {
      state.aiWidgetOpen = !state.aiWidgetOpen
    },
    setAiWidget(state, action: PayloadAction<boolean>) {
      state.aiWidgetOpen = action.payload
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload
    },
    markAllNotificationsRead(state) {
      state.notifications.forEach((n) => (n.read = true))
    },
    markNotificationRead(state, action: PayloadAction<string>) {
      const n = state.notifications.find((x) => x.id === action.payload)
      if (n) n.read = true
    },
    pushNotification(state, action: PayloadAction<Omit<NotificationItem, "id" | "time" | "read">>) {
      state.notifications.unshift({
        ...action.payload,
        id: `n${Date.now()}`,
        time: "just now",
        read: false,
      })
    },
  },
})

export const {
  setView,
  toggleSidebar,
  setMobileNav,
  setActiveNote,
  toggleAiWidget,
  setAiWidget,
  setSearchQuery,
  markAllNotificationsRead,
  markNotificationRead,
  pushNotification,
} = appSlice.actions

export default appSlice.reducer

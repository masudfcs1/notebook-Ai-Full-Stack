import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { type ViewKey } from "@/types"

export type { ViewKey }

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
  selectedAdminUserId: number | null
  notifications: NotificationItem[]
  aiWidgetOpen: boolean
  searchQuery: string
}

const initialState: AppState = {
  view: "landing",
  sidebarCollapsed: false,
  mobileNavOpen: false,
  activeNoteId: null,
  selectedAdminUserId: null,
  aiWidgetOpen: false,
  searchQuery: "",
  notifications: [],
}


const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setView(state, action: PayloadAction<ViewKey>) {
      state.view = action.payload
      state.mobileNavOpen = false
    },
    setSelectedAdminUserId(state, action: PayloadAction<number | null>) {
      state.selectedAdminUserId = action.payload
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
    setNotifications(state, action: PayloadAction<NotificationItem[]>) {
      state.notifications = action.payload
    },
    markAllNotificationsRead(state) {
      state.notifications.forEach((n) => (n.read = true))
    },
    markNotificationRead(state, action: PayloadAction<string>) {
      const n = state.notifications.find((x) => x.id === action.payload)
      if (n) n.read = true
    },
    pushNotification(
      state,
      action: PayloadAction<{
        id?: string
        title: string
        description?: string
        message?: string
        time?: string
        read?: boolean
        type?: "info" | "success" | "warning"
      }>
    ) {
      const payload = action.payload
      const id = payload.id || `n${Date.now()}`
      const description = payload.description || payload.message || ""
      const time = payload.time || "just now"
      const read = payload.read ?? false
      const type = payload.type || "info"

      const existing = state.notifications.find((n) => n.id === id)
      if (!existing) {
        state.notifications.unshift({
          id,
          title: payload.title,
          description,
          time,
          read,
          type,
        })
      }
    },
  },
})

export const {
  setView,
  setSelectedAdminUserId,
  toggleSidebar,
  setMobileNav,
  setActiveNote,
  toggleAiWidget,
  setAiWidget,
  setSearchQuery,
  setNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  pushNotification,
} = appSlice.actions

export default appSlice.reducer

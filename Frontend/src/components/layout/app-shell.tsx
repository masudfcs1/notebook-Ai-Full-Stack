"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  setView,
  setSelectedAdminUserId,
  type ViewKey,
} from "@/lib/redux/appSlice";
import {
  setActiveWorkspaceBySlug,
  setActiveTeamBySlug,
} from "@/lib/redux/dataSlice";
import { setUser, initializeAuth } from "@/lib/redux/authSlice";
import { useGetMeQuery } from "@/lib/redux/api/authApiSlice";
import {
  Sidebar,
  Topbar,
  MobileNav,
  MobileSidebar,
} from "@/features/navigation";
import { AdminShell } from "@/features/admin";
import { AuthView } from "@/features/auth";
import { LandingView } from "@/components/views/landing-view";
import { DashboardView } from "@/components/views/dashboard-view";
import { OngoingView } from "@/components/views/ongoing-view";
import { UploadView } from "@/components/views/upload-view";
import { SummaryView } from "@/components/views/summary-view";
import { ActionItemsView } from "@/components/views/action-items-view";
import { HistoryView } from "@/components/views/history-view";
import { SettingsView } from "@/components/views/settings-view";
import { TeamView } from "@/components/views/team-view";
import { AiAssistantWidget } from "@/components/app/ai-assistant-widget";
import { AnimatePresence, motion } from "framer-motion";

const VIEW_COMPONENT_REGISTRY = {
  dashboard: DashboardView,
  team: TeamView,
  ongoing: OngoingView,
  upload: UploadView,
  summary: SummaryView,
  "action-items": ActionItemsView,
  history: HistoryView,
  settings: SettingsView,
} as const;

interface AppShellProps {
  initialView?: ViewKey;
  workspaceSlug?: string;
  teamSlug?: string;
  adminUserId?: number;
}

export function AppShell({
  initialView,
  workspaceSlug,
  teamSlug,
  adminUserId,
}: AppShellProps) {
  const dispatch = useAppDispatch();
  const view = useAppSelector((s) => s.app.view);
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const initialized = useRef(false);

  // Fetch current user details if authenticated
  const { data: meResponse } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (meResponse?.success && meResponse?.data) {
      dispatch(setUser(meResponse.data));
    }
  }, [meResponse, dispatch]);

  // Sync workspace and team from URL slugs
  useEffect(() => {
    if (workspaceSlug) {
      dispatch(setActiveWorkspaceBySlug(workspaceSlug));
    }
    if (teamSlug !== undefined) {
      dispatch(setActiveTeamBySlug(teamSlug || null));
      if (teamSlug) {
        dispatch(setView("team"));
      }
    }
  }, [dispatch, workspaceSlug, teamSlug]);

  // Sync view, auth state, and admin user ID on initial mount
  useEffect(() => {
    dispatch(initializeAuth());
    if (adminUserId) {
      dispatch(setSelectedAdminUserId(adminUserId));
    }
    if (initialView) {
      dispatch(setView(initialView));
    }
  }, [adminUserId, dispatch, initialView]);

  if (view === "landing" && !workspaceSlug) {
    return (
      <>
        <LandingView />
        <AiAssistantWidget />
      </>
    );
  }

  if (view === "login" || view === "signup") {
    return (
      <>
        <AuthView initialMode={view} />
        <AiAssistantWidget />
      </>
    );
  }

  // Auth Guard: Unauthenticated / logged-out users cannot see the dashboard
  if (!isAuthenticated) {
    return (
      <>
        <AuthView initialMode="login" />
        <AiAssistantWidget />
      </>
    );
  }

  // Admin Panel: render completely separate admin shell for admin views
  if (view.startsWith("admin-")) {
    const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
    if (!isAdmin) {
      // Non-admin users trying to access admin panel → redirect to user dashboard
      dispatch(setView("dashboard"));
      return null;
    }
    return <AdminShell />;
  }

  const ActiveViewComponent = VIEW_COMPONENT_REGISTRY[view] ?? DashboardView;

  return (
    <div className="app-dashboard-shell relative flex min-h-screen overflow-x-hidden">
      <div className="dashboard-ambient dashboard-ambient-one pointer-events-none fixed -right-40 top-10 h-[520] w-[520] rounded-full" />
      <div className="dashboard-ambient dashboard-ambient-two pointer-events-none fixed -bottom-52 left-[20%] h-[560] w-[560] rounded-full" />
      <Sidebar />
      <MobileSidebar />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="relative flex-1 px-4 pb-28 pt-6 md:px-7 md:pt-8 lg:pb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <ActiveViewComponent />
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
      </div>

      <MobileNav />
      <AiAssistantWidget />
    </div>
  );
}

function Footer() {
  return (
    <footer className="dashboard-footer mt-auto border-t px-4 py-5 md:px-7">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
        <p>
          © {new Date().getFullYear()} NoteFlow AI — Meeting Intelligence
          Platform
        </p>
        <div className="flex items-center gap-4">
          <a href="#" className="transition-colors hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            Terms
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            Docs
          </a>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}

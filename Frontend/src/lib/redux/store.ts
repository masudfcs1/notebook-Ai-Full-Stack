import {
  configureStore,
  combineReducers,
  type AnyAction,
  type Middleware,
} from "@reduxjs/toolkit";
import appReducer from "./appSlice";
import dataReducer, { setWorkspaces } from "./dataSlice";
import authReducer, { logout } from "./authSlice";
import { authApi } from "./api/authApiSlice";
import { adminApi } from "./api/adminApiSlice";
import { workspaceApi } from "./api/workspaceApiSlice";
import { taskApi } from "./api/taskApiSlice";
import { preferencesApi } from "./api/preferencesApiSlice";

const combinedReducer = combineReducers({
  app: appReducer,
  data: dataReducer,
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
  [workspaceApi.reducerPath]: workspaceApi.reducer,
  [taskApi.reducerPath]: taskApi.reducer,
  [preferencesApi.reducerPath]: preferencesApi.reducer,
});

const WORKSPACE_CACHE_KEY = "noteflow:workspaces:v1";
const WORKSPACE_CACHE_TTL = 5 * 60 * 1000;

// Restore navigation data before the authenticated dashboard renders. The
// normal query still refreshes it, and mutations keep the snapshot current.
const workspaceCacheMiddleware: Middleware<
  Record<never, never>,
  ReturnType<typeof combinedReducer>
> =
  (store) => {
    let restoringCache = false;
    return (next) => (action) => {
      const previous = store.getState();
      const result = next(action);
      const current = store.getState();

      if (typeof window === "undefined") return result;

      try {
        if (!current.auth.isAuthenticated) {
          if (logout.match(action) || previous.auth.isAuthenticated) {
            sessionStorage.removeItem(WORKSPACE_CACHE_KEY);
          }
          return result;
        }

        const userId = current.auth.user?.id;
        if (!userId) return result;

        if (!previous.auth.isAuthenticated) {
          const saved = sessionStorage.getItem(WORKSPACE_CACHE_KEY);
          if (saved) {
            const cached = JSON.parse(saved);
            if (
              cached.userId === userId &&
              typeof cached.savedAt === "number" &&
              cached.savedAt <= Date.now() &&
              Date.now() - cached.savedAt < WORKSPACE_CACHE_TTL &&
              Array.isArray(cached.workspaces) &&
              cached.workspaces.every(
                (workspace: any) =>
                  workspace &&
                  typeof workspace.id === "string" &&
                  typeof workspace.name === "string" &&
                  Array.isArray(workspace.teams) &&
                  workspace.teams.every(
                    (team: any) =>
                      team &&
                      typeof team.id === "string" &&
                      typeof team.name === "string" &&
                      Array.isArray(team.members),
                  ),
              )
            ) {
              restoringCache = true;
              try {
                store.dispatch(setWorkspaces(cached.workspaces));
              } finally {
                restoringCache = false;
              }
            } else {
              sessionStorage.removeItem(WORKSPACE_CACHE_KEY);
            }
          }
        } else if (
          !restoringCache &&
          current.data.workspaces !== previous.data.workspaces
        ) {
          sessionStorage.setItem(
            WORKSPACE_CACHE_KEY,
            JSON.stringify({
              userId,
              savedAt: Date.now(),
              workspaces: current.data.workspaces,
            }),
          );
        }
      } catch {
        // Storage can be unavailable or full; fetching must continue normally.
      }

      return result;
    };
  };

const rootReducer = (
  state: ReturnType<typeof combinedReducer> | undefined,
  action: AnyAction,
) => {
  if (action.type === logout.type || action.type === "auth/logout") {
    // Reset all slices & RTK Query caches to initial state on logout
    state = undefined;
  }
  return combinedReducer(state, action);
};

export function makeStore() {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(workspaceCacheMiddleware)
        .concat(authApi.middleware)
        .concat(adminApi.middleware)
        .concat(workspaceApi.middleware)
        .concat(taskApi.middleware)
        .concat(preferencesApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

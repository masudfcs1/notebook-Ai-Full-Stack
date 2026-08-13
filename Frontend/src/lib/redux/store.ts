import { configureStore, combineReducers, AnyAction } from "@reduxjs/toolkit";
import appReducer from "./appSlice";
import dataReducer from "./dataSlice";
import authReducer, { logout } from "./authSlice";
import { authApi } from "./api/authApiSlice";
import { adminApi } from "./api/adminApiSlice";
import { workspaceApi } from "./api/workspaceApiSlice";

const combinedReducer = combineReducers({
  app: appReducer,
  data: dataReducer,
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
  [workspaceApi.reducerPath]: workspaceApi.reducer,
});

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
        .concat(authApi.middleware)
        .concat(adminApi.middleware)
        .concat(workspaceApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./appSlice";
import dataReducer from "./dataSlice";
import authReducer from "./authSlice";
import { authApi } from "./api/authApiSlice";
import { adminApi } from "./api/adminApiSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      app: appReducer,
      data: dataReducer,
      auth: authReducer,
      [authApi.reducerPath]: authApi.reducer,
      [adminApi.reducerPath]: adminApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(authApi.middleware)
        .concat(adminApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

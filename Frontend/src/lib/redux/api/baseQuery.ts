/**
 * Centralized Base Query with Automatic JWT Expiration & 401 Handling
 * @file baseQuery.ts
 */

import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { logout } from "../authSlice";
import { setView } from "../appSlice";
import { toast } from "sonner";
import { isJwtExpired } from "@/lib/jwt";

let lastToastTime = 0;

/**
 * Debounced notification to avoid multiple simultaneous toast alerts
 */
export function notifySessionExpired(customMessage?: string) {
  const now = Date.now();
  if (now - lastToastTime > 3000) {
    lastToastTime = now;
    toast.error(customMessage || "Your session has expired. Please sign in again.", {
      id: "session-expired-toast",
    });
  }
}

export const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5015/api/v1";
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token =
      state.auth?.token ||
      (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Custom base query that intercepts 401 Unauthorized responses
 * and automatically logs out the user, clearing authentication state.
 */
export const baseQueryWithAuthHandling: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const state = api.getState() as RootState;
  const currentToken =
    state.auth?.token ||
    (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null);

  const url = typeof args === "string" ? args : args.url;
  const isAuthEndpoint =
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/forgot-password") ||
    url.includes("/auth/reset-password");

  // Proactive check before sending request if token exists and is expired
  if (currentToken && !isAuthEndpoint && isJwtExpired(currentToken)) {
    api.dispatch(logout());
    api.dispatch(setView("login"));
    notifySessionExpired();
    return {
      error: {
        status: 401,
        data: { message: "Token has expired" },
      },
    };
  }

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // If it's a login or register endpoint, do NOT trigger auto-logout session expired toast
    if (!isAuthEndpoint) {
      const wasAuthenticated = Boolean(state.auth?.isAuthenticated || currentToken);
      api.dispatch(logout());
      api.dispatch(setView("login"));

      if (wasAuthenticated) {
        notifySessionExpired();
      }
    }
  }

  return result;
};

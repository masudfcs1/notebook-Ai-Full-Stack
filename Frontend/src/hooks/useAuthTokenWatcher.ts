"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/authSlice";
import { setView } from "@/lib/redux/appSlice";
import { isJwtExpired, getJwtRemainingTimeMs } from "@/lib/jwt";
import { notifySessionExpired } from "@/lib/redux/api/baseQuery";

/**
 * Custom hook that monitors JWT token validity proactively:
 * 1. Schedules a setTimeout for the exact millisecond when the token expires.
 * 2. Validates token when the tab regains focus or becomes visible.
 * 3. Listens to cross-tab storage changes to synchronize logouts.
 */
export function useAuthTokenWatcher() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleExpire = useCallback(() => {
    dispatch(logout());
    dispatch(setView("login"));
    notifySessionExpired("Your session has expired. Please sign in again.");
  }, [dispatch]);

  // Proactive timer based on token's `exp` claim
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!token || !isAuthenticated) {
      return;
    }

    const remainingMs = getJwtRemainingTimeMs(token);

    if (remainingMs <= 0) {
      // Token is already expired
      handleExpire();
      return;
    }

    // Schedule automatic logout precisely when the token expires
    // (with a small 200ms buffer to ensure server clock agreement)
    const timeoutDuration = Math.min(remainingMs, 2147483647); // Safe 32-bit int max for setTimeout
    timerRef.current = setTimeout(() => {
      handleExpire();
    }, timeoutDuration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [token, isAuthenticated, handleExpire]);

  // Proactive checks on tab focus, visibility change, and multi-tab storage sync
  useEffect(() => {
    const checkExpirationOnActive = () => {
      if (!token || !isAuthenticated) return;
      if (isJwtExpired(token)) {
        handleExpire();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkExpirationOnActive();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      // If accessToken was removed in another tab, log out here as well
      if (event.key === "accessToken" && !event.newValue && isAuthenticated) {
        dispatch(logout());
        dispatch(setView("login"));
      }
    };

    window.addEventListener("focus", checkExpirationOnActive);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", checkExpirationOnActive);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [token, isAuthenticated, handleExpire, dispatch]);
}

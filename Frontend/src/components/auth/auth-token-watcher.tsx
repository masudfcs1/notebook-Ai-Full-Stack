"use client";

import { useAuthTokenWatcher } from "@/hooks/useAuthTokenWatcher";

/**
 * Global component mounted inside Redux Providers to enforce proactive
 * JWT token expiration monitoring and auto-logout.
 */
export function AuthTokenWatcher() {
  useAuthTokenWatcher();
  return null;
}

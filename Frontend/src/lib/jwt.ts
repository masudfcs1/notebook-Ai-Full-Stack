/**
 * JWT Token Utilities & Expiration Checker
 * @file jwt.ts
 */

export interface JwtPayload {
  userId?: number;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

/**
 * Safely decodes a base64 JWT payload without external dependencies
 */
export function decodeJwt(token?: string | null): JwtPayload | null {
  if (!token || typeof token !== "string") return null;

  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Checks whether a JWT token is expired
 * @param token - Bearer JWT token string
 * @param offsetSeconds - Optional safety margin in seconds (e.g. consider expired 5s early)
 */
export function isJwtExpired(
  token?: string | null,
  offsetSeconds = 0,
): boolean {
  if (!token) return true;

  const payload = decodeJwt(token);
  if (!payload || !payload.exp) {
    // If token has no exp claim, consider it invalid / expired
    return false;
  }

  const expiryTimeMs = payload.exp * 1000;
  const currentTimeMs = Date.now() + offsetSeconds * 1000;

  return currentTimeMs >= expiryTimeMs;
}

/**
 * Returns the remaining validity time of a JWT token in milliseconds
 * Returns 0 if expired or invalid.
 */
export function getJwtRemainingTimeMs(token?: string | null): number {
  if (!token) return 0;

  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return 0;

  const remaining = payload.exp * 1000 - Date.now();
  return Math.max(0, remaining);
}

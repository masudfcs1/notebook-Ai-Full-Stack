import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUserDisplayName(
  user?: { name?: string | null; username?: string | null; email?: string } | null,
  defaultName = "User"
): string {
  if (!user) return defaultName
  if (user.name && user.name.trim()) return user.name.trim()
  if (user.username && user.username.trim()) return user.username.trim()
  if (user.email && user.email.trim()) return user.email.split("@")[0]
  return defaultName
}

export function getUserInitials(name?: string | null, email?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }
  if (email && email.trim()) {
    const handle = email.split("@")[0]
    return handle.slice(0, 2).toUpperCase()
  }
  return "U"
}

export function getAvatarUrl(avatar?: string | null): string | undefined {
  if (!avatar || !avatar.trim()) return undefined
  const trimmed = avatar.trim()
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "")
    : "http://localhost:5015"
  return `${baseUrl}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`
}


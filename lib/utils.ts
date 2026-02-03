import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address?: string | null, size = 4) {
  if (!address) return ""
  const normalized = address.toString()
  if (normalized.length <= size * 2) {
    return normalized
  }
  return `${normalized.slice(0, size + 2)}…${normalized.slice(-size)}`
}

/**
 * Get the base URL for the application
 * Uses environment variable if set, otherwise falls back to current origin
 */
export function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Client-side: use current origin
    return window.location.origin
  }
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000"
}

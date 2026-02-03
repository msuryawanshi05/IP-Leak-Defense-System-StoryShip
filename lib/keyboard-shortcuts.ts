// Keyboard shortcuts configuration and handlers

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  description: string
  action: () => void
}

export const SHORTCUTS: Record<string, KeyboardShortcut> = {
  upload: {
    key: "u",
    ctrl: true,
    description: "Upload file",
    action: () => {
      // Trigger upload dialog
      const event = new CustomEvent("shortcut:upload")
      window.dispatchEvent(event)
    },
  },
  search: {
    key: "k",
    ctrl: true,
    description: "Focus search",
    action: () => {
      const event = new CustomEvent("shortcut:search")
      window.dispatchEvent(event)
    },
  },
  dashboard: {
    key: "d",
    ctrl: true,
    description: "Go to dashboard",
    action: () => {
      window.location.href = "/dashboard"
    },
  },
  files: {
    key: "f",
    ctrl: true,
    description: "Go to files",
    action: () => {
      window.location.href = "/files"
    },
  },
  gallery: {
    key: "g",
    ctrl: true,
    description: "Go to gallery",
    action: () => {
      window.location.href = "/gallery"
    },
  },
  analytics: {
    key: "a",
    ctrl: true,
    description: "Go to analytics",
    action: () => {
      window.location.href = "/analytics"
    },
  },
}

/**
 * Hook to register keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  if (typeof window === "undefined") return

  const handleKeyDown = (e: KeyboardEvent) => {
    shortcuts.forEach((shortcut) => {
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey
      const altMatch = shortcut.alt ? e.altKey : !e.altKey

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        e.preventDefault()
        shortcut.action()
      }
    })
  }

  window.addEventListener("keydown", handleKeyDown)
  return () => window.removeEventListener("keydown", handleKeyDown)
}


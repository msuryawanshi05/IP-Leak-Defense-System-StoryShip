"use client"

import { useEffect } from "react"

type ShortcutMap = {
  [combo: string]: (e: KeyboardEvent) => void
}

/**
 * useKeyboardShortcuts — registers keyboard shortcuts.
 * Combo format: "ctrl+u", "escape", "ctrl+shift+v", etc.
 * Ignores shortcuts when focus is inside an input/textarea.
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      if (tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable) {
        // Allow Escape even from inputs
        if (e.key !== "Escape") return
      }

      const parts: string[] = []
      if (e.ctrlKey) parts.push("ctrl")
      if (e.metaKey) parts.push("meta")
      if (e.shiftKey) parts.push("shift")
      if (e.altKey) parts.push("alt")
      parts.push(e.key.toLowerCase())
      const combo = parts.join("+")

      if (shortcuts[combo]) {
        e.preventDefault()
        shortcuts[combo](e)
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [shortcuts])
}

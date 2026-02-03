"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useKeyboardShortcuts, SHORTCUTS } from "@/lib/keyboard-shortcuts"
// Removed useToast import - not needed for basic shortcuts

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const shortcuts = [
      {
        ...SHORTCUTS.upload,
        action: () => {
          const event = new CustomEvent("shortcut:upload")
          window.dispatchEvent(event)
        },
      },
      {
        ...SHORTCUTS.search,
        action: () => {
          const event = new CustomEvent("shortcut:search")
          window.dispatchEvent(event)
        },
      },
      {
        ...SHORTCUTS.dashboard,
        action: () => router.push("/dashboard"),
      },
      {
        ...SHORTCUTS.files,
        action: () => router.push("/files"),
      },
      {
        ...SHORTCUTS.gallery,
        action: () => router.push("/gallery"),
      },
      {
        ...SHORTCUTS.analytics,
        action: () => router.push("/analytics"),
      },
    ]

    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = shortcut.ctrl
          ? e.ctrlKey || e.metaKey
          : !e.ctrlKey && !e.metaKey
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
  }, [router])

  return <>{children}</>
}


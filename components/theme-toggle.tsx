"use client"

import { useState, useEffect } from "react"
import { Sun, Moon, Monitor } from "lucide-react"

type Theme = "dark" | "light" | "system"

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const resolved = theme === "system" ? getSystemTheme() : theme
  if (resolved === "dark") {
    root.classList.add("dark")
    root.classList.remove("light")
  } else {
    root.classList.add("light")
    root.classList.remove("dark")
  }
}

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = (localStorage.getItem("storyproof-theme") as Theme) || "dark"
    setTheme(saved)
    applyTheme(saved)

    // Listen for system preference changes
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => { if (theme === "system") applyTheme("system") }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const cycle = () => {
    const next: Theme = theme === "dark" ? "light" : theme === "light" ? "system" : "dark"
    setTheme(next)
    applyTheme(next)
    localStorage.setItem("storyproof-theme", next)
  }

  if (!mounted) return null

  const icons = { dark: Moon, light: Sun, system: Monitor }
  const labels = { dark: "Dark", light: "Light", system: "System" }
  const Icon = icons[theme]

  if (compact) {
    return (
      <button
        onClick={cycle}
        title={`Theme: ${labels[theme]} (click to cycle)`}
        id="theme-toggle-btn"
        className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
      >
        <Icon size={16} />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/50 border border-border">
      {(["dark", "light", "system"] as Theme[]).map((t) => {
        const I = icons[t]
        return (
          <button
            key={t}
            onClick={() => { setTheme(t); applyTheme(t); localStorage.setItem("storyproof-theme", t) }}
            title={labels[t]}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              theme === t
                ? "bg-background text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <I size={12} />
            <span className="hidden sm:inline">{labels[t]}</span>
          </button>
        )
      })}
    </div>
  )
}

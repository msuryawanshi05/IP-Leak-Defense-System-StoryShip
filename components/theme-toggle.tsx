"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

const STORAGE_KEY = "storyproof_theme"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = (localStorage.getItem(STORAGE_KEY) as "light" | "dark") || "light"
    setTheme(stored)
    document.documentElement.classList.toggle("dark", stored === "dark")
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light"
    setTheme(nextTheme)
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", nextTheme === "dark")
      localStorage.setItem(STORAGE_KEY, nextTheme)
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  )
}


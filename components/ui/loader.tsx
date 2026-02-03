"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoaderProps {
  label?: string
  className?: string
}

export function Loader({ label = "Loading...", className }: LoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 text-muted-foreground", className)}>
      <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}


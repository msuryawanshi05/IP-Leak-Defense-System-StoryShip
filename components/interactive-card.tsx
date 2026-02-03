"use client"

import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface InteractiveCardProps {
  children: ReactNode
  className?: string
  asChild?: boolean
}

export function InteractiveCard({ children, className }: InteractiveCardProps) {
  return (
    <Card
      className={cn(
        "transition-transform duration-200 ease-out hover:scale-[1.03] hover:shadow-xl rounded-xl",
        className,
      )}
    >
      {children}
    </Card>
  )
}


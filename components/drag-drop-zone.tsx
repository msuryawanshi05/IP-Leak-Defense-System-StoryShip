"use client"

import { useState, useCallback, DragEvent } from "react"
import { Card } from "@/components/ui/card"
import { Upload, File } from "lucide-react"
import { cn } from "@/lib/utils"

interface DragDropZoneProps {
  onFilesDropped: (files: File[]) => void
  accept?: string
  multiple?: boolean
  className?: string
  children?: React.ReactNode
}

export function DragDropZone({
  onFilesDropped,
  accept,
  multiple = true,
  className,
  children,
}: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter((prev) => prev + 1)
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter((prev) => {
      const newCounter = prev - 1
      if (newCounter === 0) {
        setIsDragging(false)
      }
      return newCounter
    })
  }, [])

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      setDragCounter(0)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        onFilesDropped(files)
      }
    },
    [onFilesDropped],
  )

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn("relative", className)}
      role="button"
      tabIndex={0}
      aria-label="File drop zone"
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-primary/10 border-2 border-dashed border-primary rounded-lg">
          <Card className="p-8 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
            <p className="text-lg font-semibold">Drop files here</p>
            <p className="text-sm text-muted-foreground">Release to upload</p>
          </Card>
        </div>
      )}
      {children}
    </div>
  )
}


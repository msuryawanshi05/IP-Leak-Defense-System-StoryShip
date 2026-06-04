"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { processFileUpload } from "@/lib/storage"
import { createVersionCheckpoint } from "@/lib/blockchain"
import { UploadCloud, FileText, X, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { fireConfetti, fireSideCannons } from "@/lib/confetti"

interface FileUploadProps {
  address: string | null
  onUploaded: (version: any) => void
  isFirstUpload?: boolean
}

export default function FileUpload({ address, onUploaded, isFirstUpload = false }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState("")
  const [done, setDone] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const acceptFile = (f: File) => {
    setFile(f)
    setDone(false)
    setProgress(0)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) acceptFile(e.target.files[0])
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) acceptFile(f)
  }, [])

  const handleUpload = async () => {
    if (!file || !address) return

    setIsLoading(true)
    setProgress(0)
    setDone(false)

    const steps = [
      { label: "Computing SHA-256 hash…", pct: 20 },
      { label: "Encrypting with AES-GCM…", pct: 40 },
      { label: "Uploading to IPFS…", pct: 65 },
      { label: "Registering IP Asset…", pct: 82 },
      { label: "Recording on-chain…", pct: 95 },
    ]

    let stepIdx = 0
    const tick = () => {
      if (stepIdx < steps.length) {
        setProgressLabel(steps[stepIdx].label)
        setProgress(steps[stepIdx].pct)
        stepIdx++
      }
    }

    tick()
    const interval = setInterval(tick, 1200)

    try {
      const encryptionKey = address.toLowerCase()
      const storedFile = await processFileUpload(file, encryptionKey)

      const checkpoint = await createVersionCheckpoint(
        storedFile.fileHash,
        storedFile.ipfsCid,
        storedFile.encryptedHash,
        notes || "Version upload",
        address,
        file.name,
        file.size,
      )

      clearInterval(interval)
      setProgress(100)
      setProgressLabel("Complete!")
      setDone(true)

      const newVersion = {
        id: Date.now(),
        name: file.name,
        hash: storedFile.fileHash,
        timestamp: new Date(),
        author: address,
        notes: notes || "Initial upload",
        size: file.size,
        ipfsCid: storedFile.ipfsCid,
        transactionHash: checkpoint.transactionHash,
        blockNumber: checkpoint.blockNumber,
        encryptedHash: storedFile.encryptedHash,
        ipAssetId: checkpoint.ipAssetId,
      }

      toast.success("File Uploaded & Registered!", {
        description: `"${file.name}" has been hashed and registered as an IP Asset.`,
      })

      // 🎉 Celebrate!
      if (isFirstUpload) {
        fireConfetti()
      } else {
        fireSideCannons()
      }

      setTimeout(() => {
        onUploaded(newVersion)
        setFile(null)
        setNotes("")
        setProgress(0)
        setDone(false)
      }, 1000)
    } catch (error: any) {
      clearInterval(interval)
      console.error("Upload failed:", error)
      toast.error("Upload Failed", { description: error?.message || "Something went wrong. Please try again." })
      setProgress(0)
      setProgressLabel("")
    } finally {
      setIsLoading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-5">
      {/* Drop Zone */}
      <div
        className={`drop-zone ${isDragging ? "dragging" : ""} ${file ? "border-primary/50" : ""} relative cursor-pointer`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload-input"
        />

        <div className="p-8 flex flex-col items-center text-center">
          {file ? (
            <div className="w-full">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/10 border border-primary/20 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <FileText size={20} className="text-primary" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(file.size)} · {file.type || "Unknown type"}</p>
                </div>
                {!isLoading && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); setProgress(0) }}
                    className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Click to change file or drag a new one here
              </p>
            </div>
          ) : (
            <>
              <div className={`w-16 h-16 mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragging ? "bg-primary/20 border-2 border-primary/50 animate-pulse-glow scale-110" : "bg-secondary border border-border"}`}>
                <UploadCloud size={28} className={isDragging ? "text-primary" : "text-muted-foreground"} />
              </div>
              <p className="font-semibold text-foreground mb-1">
                {isDragging ? "Drop it here!" : "Drag & drop your file"}
              </p>
              <p className="text-sm text-muted-foreground mb-3">or click to browse</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["PDF", "PNG", "MP4", "DOC", "SVG", "Any file"].map((ext) => (
                  <span key={ext} className="px-2 py-0.5 text-xs rounded-full bg-secondary border border-border text-muted-foreground">{ext}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Version notes */}
      <div>
        <label htmlFor="version-notes" className="block text-sm font-medium mb-2 text-foreground">
          Version Notes <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <textarea
          id="version-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe what changed in this version…"
          className="w-full px-4 py-3 border border-input rounded-xl bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 resize-none transition-all text-sm"
          rows={3}
          disabled={isLoading}
        />
      </div>

      {/* Progress bar */}
      {isLoading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin text-primary" />
              {progressLabel}
            </span>
            <span className="font-mono text-primary">{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || isLoading}
        id="upload-to-blockchain-btn"
        className={`btn-glow w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
          done
            ? "bg-[var(--success)] text-white"
            : "bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        }`}
      >
        {done ? (
          <>
            <CheckCircle2 size={18} />
            Registered on Chain!
          </>
        ) : isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <UploadCloud size={18} />
            Upload & Register IP Asset
          </>
        )}
      </button>
    </div>
  )
}

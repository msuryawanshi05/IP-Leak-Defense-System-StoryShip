"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { processFileUpload } from "@/lib/storage"
import { createVersionCheckpoint } from "@/lib/blockchain"
import { UploadCloud, FileText, X, CheckCircle2, Loader2, Shield } from "lucide-react"
import { toast } from "sonner"
import { fireConfetti, fireSideCannons } from "@/lib/confetti"
import StoryNetworkGuard, { useStoryNetwork } from "@/components/story-network-guard"

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
  const { isStoryOdyssey } = useStoryNetwork()

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
      { label: "Registering IP Asset on Story…", pct: 82 },
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

      toast.success("IP Asset Registered on Story!", {
        description: `"${file.name}" is now on-chain with an immutable proof of ownership.`,
        icon: <Shield size={16} />,
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

  // ── No wallet: show connect prompt ─────────────────────────────────────────
  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center animate-pulse-glow">
          <Shield size={28} className="text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-foreground mb-1">Connect Wallet to Register IP</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            StoryProof uses Story Odyssey Testnet to create an on-chain, immutable record of your creative work.
            Connect your wallet to get started.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center text-xs text-muted-foreground">
          <span className="px-3 py-1.5 rounded-full border border-border bg-secondary/50">🔐 SHA-256 Hashed</span>
          <span className="px-3 py-1.5 rounded-full border border-border bg-secondary/50">⛓️ Story Protocol</span>
          <span className="px-3 py-1.5 rounded-full border border-border bg-secondary/50">🌐 IPFS Stored</span>
        </div>
      </div>
    )
  }

  // ── Wrong network: show inline guard ───────────────────────────────────────
  if (!isStoryOdyssey) {
    return (
      <div className="space-y-4">
        <StoryNetworkGuard />
        {/* Allow drag-and-drop prep even on wrong network */}
        <div className={`drop-zone opacity-40 cursor-not-allowed pointer-events-none`}>
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 mb-4 rounded-2xl flex items-center justify-center bg-secondary border border-border">
              <UploadCloud size={28} className="text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground mb-1">Drag &amp; drop your file</p>
            <p className="text-sm text-muted-foreground">Switch to Story Odyssey above to enable upload</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Correct network + wallet: show full upload ─────────────────────────────
  return (
    <div className="space-y-5">
      {/* Story Network indicator */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/20 text-xs">
        <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_oklch(var(--primary))] animate-pulse" />
        <span className="text-primary font-semibold">Story Odyssey Testnet</span>
        <span className="text-muted-foreground">· Chain 1513 · Ready to register IP</span>
      </div>

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
            IP Asset Registered on Story!
          </>
        ) : isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Registering on Story Protocol…
          </>
        ) : (
          <>
            <UploadCloud size={18} />
            Upload &amp; Register IP on Story
          </>
        )}
      </button>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { FileTypeIcon, FileTypeBadge } from "@/lib/file-type"
import ThemeToggle from "@/components/theme-toggle"
import {
  Shield, CheckCircle2, XCircle, Clock, Upload,
  Hash, Link2, ExternalLink, Copy, Check, Loader2,
  AlertCircle, ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface StoredCheckpoint {
  fileHash: string
  ipfsCid: string
  encryptedHash: string
  versionNote: string
  author: string
  timestamp: number
  transactionHash?: string
  blockNumber?: number
  ipAssetId?: string
  fileName?: string
  fileSize?: number
}

type VerifyState = "idle" | "hashing" | "found" | "notfound" | "mismatch"

export default function PublicVerifyPage() {
  const params = useParams()
  const expectedHash = (params?.hash as string) || ""

  const [checkpoint, setCheckpoint] = useState<StoredCheckpoint | null>(null)
  const [state, setState] = useState<VerifyState>("idle")
  const [dropped, setDropped] = useState<File | null>(null)
  const [computedHash, setComputedHash] = useState("")
  const [dragging, setDragging] = useState(false)
  const [copied, setCopied] = useState(false)

  // Search all localStorage for this hash
  useEffect(() => {
    if (!expectedHash || typeof window === "undefined") return
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!key?.startsWith("checkpoints_")) continue
        const arr: StoredCheckpoint[] = JSON.parse(localStorage.getItem(key) || "[]")
        const found = arr.find((cp) => cp.fileHash === expectedHash)
        if (found) {
          setCheckpoint(found)
          break
        }
      }
    } catch { /* no localStorage in SSR */ }
  }, [expectedHash])

  const computeHash = async (file: File): Promise<string> => {
    const buf = await file.arrayBuffer()
    const digest = await crypto.subtle.digest("SHA-256", buf)
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  }

  const handleFile = async (file: File) => {
    setDropped(file)
    setState("hashing")
    const hash = await computeHash(file)
    setComputedHash(hash)
    if (hash === expectedHash) {
      setState("found")
    } else {
      setState("mismatch")
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const copyHash = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (ts: number) =>
    new Date(ts * 1000).toLocaleString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    })

  const formatSize = (b?: number) => {
    if (!b || b === 0) return null
    if (b < 1024) return `${b} B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / (1024 * 1024)).toFixed(1)} MB`
  }

  const truncate = (s: string, n = 20) => s.length > n ? s.slice(0, n) + "…" : s

  return (
    <div className="min-h-screen hero-bg grid-bg font-sans">
      {/* Header */}
      <header className="glass border-b border-[var(--glass-border)] sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Shield size={14} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-sm">StoryProof</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-muted-foreground px-2 py-1 rounded-full bg-secondary border border-border">
              Public Verification
            </span>
            <ThemeToggle compact />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Page heading */}
        <div className="text-center space-y-3 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[var(--glass-border)] text-xs text-muted-foreground mb-2">
            <Shield size={12} className="text-primary" />
            IP Ownership Verification
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text">Verify IP Proof</h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
            Drop the original file below to instantly verify it matches this registered IP hash.
            No wallet or account required.
          </p>
        </div>

        {/* Hash card */}
        <div className="glass-card p-5 space-y-3 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-2 mb-1">
            <Hash size={14} className="text-primary flex-shrink-0" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Registered SHA-256 Hash</span>
          </div>
          <div className="flex items-center gap-3">
            <code className="flex-1 font-mono text-xs text-foreground break-all">{expectedHash}</code>
            <button
              onClick={() => copyHash(expectedHash)}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all flex-shrink-0"
              title="Copy hash"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Checkpoint info (if found in localStorage) */}
        {checkpoint && (
          <div className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <Shield size={12} className="text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">Registered IP Record Found</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {checkpoint.fileName && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
                  <FileTypeIcon fileName={checkpoint.fileName} size={16} className="w-9 h-9 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground">File Name</p>
                    <p className="text-sm font-medium text-foreground truncate">{checkpoint.fileName}</p>
                    {checkpoint.fileSize && (
                      <p className="text-xs text-muted-foreground">{formatSize(checkpoint.fileSize)}</p>
                    )}
                  </div>
                </div>
              )}
              <div className="p-3 rounded-xl bg-background/50 border border-border/50 space-y-1">
                <p className="text-[10px] text-muted-foreground">Registered</p>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-muted-foreground" />
                  <p className="text-sm text-foreground">{formatDate(checkpoint.timestamp)}</p>
                </div>
              </div>
              {checkpoint.ipfsCid && (
                <div className="p-3 rounded-xl bg-background/50 border border-border/50 space-y-1">
                  <p className="text-[10px] text-muted-foreground">IPFS CID</p>
                  <div className="flex items-center gap-1.5">
                    <Link2 size={12} className="text-muted-foreground" />
                    <code className="font-mono text-xs text-foreground">{truncate(checkpoint.ipfsCid, 24)}</code>
                  </div>
                </div>
              )}
              {checkpoint.transactionHash && (
                <div className="p-3 rounded-xl bg-background/50 border border-border/50 space-y-1">
                  <p className="text-[10px] text-muted-foreground">Story Blockchain TX</p>
                  <div className="flex items-center gap-1.5">
                    <ExternalLink size={12} className="text-muted-foreground" />
                    <code className="font-mono text-xs text-foreground">{truncate(checkpoint.transactionHash, 20)}</code>
                  </div>
                </div>
              )}
              {checkpoint.ipAssetId && (
                <div className="p-3 rounded-xl bg-primary/8 border border-primary/20 sm:col-span-2 space-y-1">
                  <p className="text-[10px] text-primary font-semibold uppercase">Story Protocol IP Asset</p>
                  <code className="font-mono text-xs text-foreground">{checkpoint.ipAssetId}</code>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Drop zone */}
        {state === "idle" || state === "hashing" ? (
          <div
            className={`drop-zone rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 cursor-pointer animate-fade-in-up ${
              dragging ? "dragging scale-[1.02]" : "hover:border-primary/50"
            }`}
            style={{ animationDelay: "200ms" }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => document.getElementById("public-file-input")?.click()}
          >
            <input
              id="public-file-input"
              type="file"
              className="hidden"
              onChange={onFileInput}
            />
            {state === "hashing" ? (
              <div className="space-y-3">
                <Loader2 size={36} className="mx-auto text-primary animate-spin" />
                <p className="text-muted-foreground">Computing SHA-256…</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Upload size={24} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Drop the original file here</p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  The file is hashed locally in your browser — nothing is uploaded.
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* Result */}
        {state === "found" && dropped && (
          <div className="glass-card p-6 border-green-500/30 animate-fade-in-up space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-400/15 border border-green-400/30 flex items-center justify-center">
                <CheckCircle2 size={22} className="text-green-400" />
              </div>
              <div>
                <p className="font-bold text-green-400 text-lg">File Verified ✓</p>
                <p className="text-sm text-muted-foreground">Hash matches exactly — this file is authentic.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
              <FileTypeIcon fileName={dropped.name} size={16} className="w-10 h-10 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">{dropped.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(dropped.size)}</p>
              </div>
              <FileTypeBadge fileName={dropped.name} />
            </div>
            <div className="p-3 rounded-xl bg-green-400/5 border border-green-400/20">
              <p className="text-xs font-mono text-green-400 break-all">{computedHash}</p>
            </div>
            <button
              onClick={() => { setState("idle"); setDropped(null); setComputedHash("") }}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={12} /> Verify another file
            </button>
          </div>
        )}

        {state === "mismatch" && dropped && (
          <div className="glass-card p-6 border-red-500/30 animate-fade-in-up space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-400/15 border border-red-400/30 flex items-center justify-center">
                <XCircle size={22} className="text-red-400" />
              </div>
              <div>
                <p className="font-bold text-red-400 text-lg">Hash Mismatch ✗</p>
                <p className="text-sm text-muted-foreground">This file does not match the registered hash.</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-background/50 border border-border/50">
                <p className="text-[10px] text-muted-foreground mb-1">Expected hash (registered)</p>
                <code className="font-mono text-xs text-foreground break-all">{expectedHash}</code>
              </div>
              <div className="p-3 rounded-xl bg-red-400/5 border border-red-400/20">
                <p className="text-[10px] text-red-400/70 mb-1">Computed hash (this file)</p>
                <code className="font-mono text-xs text-red-400 break-all">{computedHash}</code>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-secondary/50 border border-border/50">
              <AlertCircle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                This may mean the file has been modified or you uploaded the wrong file.
                The original registered file has a different content signature.
              </p>
            </div>
            <button
              onClick={() => { setState("idle"); setDropped(null); setComputedHash("") }}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={12} /> Try a different file
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 pb-8 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <p className="text-xs text-muted-foreground">
            Powered by{" "}
            <span className="text-primary font-semibold">StoryProof</span>
            {" "}·{" "}
            <Link href="/" className="hover:text-foreground transition-colors underline underline-offset-2">
              Register your own IP
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

"use client"

import { useState, useRef, useCallback } from "react"
import { computeFileHash } from "@/lib/storage"
import { CheckCircle2, XCircle, AlertCircle, UploadCloud, Loader2, FileText, X } from "lucide-react"
import { toast } from "sonner"

interface FileVerifierProps {
  expectedHash: string
  fileName?: string
}

export default function FileVerifier({ expectedHash, fileName }: FileVerifierProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [result, setResult] = useState<{
    verified: boolean
    computedHash: string
    message: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const acceptFile = (f: File) => {
    setSelectedFile(f)
    setResult(null)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) acceptFile(e.target.files[0])
  }

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }, [])
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) acceptFile(f)
  }, [])

  const handleVerify = async () => {
    if (!selectedFile) return
    setIsVerifying(true)
    setResult(null)
    try {
      const computedHash = await computeFileHash(selectedFile)
      const verified = computedHash.toLowerCase() === expectedHash.toLowerCase()
      setResult({
        verified,
        computedHash,
        message: verified
          ? "File is AUTHENTIC and UNCHANGED — matches the original upload."
          : "Verification FAILED — this file does NOT match the original upload.",
      })
      if (verified) {
        toast.success("File Verified!", { description: "Hash matches — the file is authentic and unchanged." })
      } else {
        toast.error("Verification Failed", { description: "The file has been modified or is not the correct file." })
      }
    } catch {
      setResult({ verified: false, computedHash: "", message: "Failed to hash file. Please try again." })
      toast.error("Hashing Error", { description: "Could not compute file hash. Please try again." })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Expected hash */}
      <div className="p-4 rounded-xl bg-secondary/50 border border-border">
        <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Expected SHA-256</p>
        <p className="font-mono text-xs text-foreground break-all leading-relaxed">{expectedHash}</p>
        {fileName && (
          <p className="text-xs text-muted-foreground mt-2">
            File: <span className="text-foreground font-medium">{fileName}</span>
          </p>
        )}
      </div>

      {/* Drop zone */}
      <div
        className={`drop-zone ${isDragging ? "dragging" : ""} ${selectedFile ? "border-primary/50" : ""} cursor-pointer`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
        <div className="p-6 flex flex-col items-center text-center">
          {selectedFile ? (
            <div className="w-full">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20 mb-2">
                <FileText size={18} className="text-primary flex-shrink-0" />
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setResult(null) }}
                  className="p-1 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Click to change file</p>
            </div>
          ) : (
            <>
              <div className={`w-12 h-12 mb-3 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isDragging ? "bg-primary/20 border-2 border-primary/50 animate-pulse-glow scale-110" : "bg-secondary border border-border"
              }`}>
                <UploadCloud size={22} className={isDragging ? "text-primary" : "text-muted-foreground"} />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">
                {isDragging ? "Drop to verify!" : "Drop file to verify"}
              </p>
              <p className="text-xs text-muted-foreground">or click to browse</p>
            </>
          )}
        </div>
      </div>

      {/* Verify button */}
      <button
        onClick={handleVerify}
        disabled={!selectedFile || isVerifying}
        id="verify-file-btn"
        className="btn-glow w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isVerifying ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Computing Hash…
          </>
        ) : (
          <>
            <CheckCircle2 size={16} />
            Verify File Authenticity
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className={`p-4 rounded-xl border-2 animate-fade-in-up ${
          result.verified
            ? "bg-[oklch(0.68_0.18_145/0.08)] border-[oklch(0.68_0.18_145/0.35)]"
            : "bg-destructive/8 border-destructive/35"
        }`}>
          <div className="flex items-start gap-3">
            {result.verified
              ? <CheckCircle2 className="text-[oklch(0.68_0.18_145)] flex-shrink-0 mt-0.5" size={20} />
              : <XCircle className="text-destructive flex-shrink-0 mt-0.5" size={20} />}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  result.verified
                    ? "bg-[oklch(0.68_0.18_145/0.2)] text-[oklch(0.68_0.18_145)]"
                    : "bg-destructive/20 text-destructive"
                }`}>
                  {result.verified ? "✓ VERIFIED" : "✕ FAILED"}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground mb-3">{result.message}</p>
              {!result.verified && result.computedHash && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Computed Hash:</p>
                    <p className="font-mono text-xs text-foreground break-all bg-background/50 p-2 rounded-lg">{result.computedHash}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Expected Hash:</p>
                    <p className="font-mono text-xs text-foreground break-all bg-background/50 p-2 rounded-lg">{expectedHash}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* How it works hint */}
      <div className="p-3 rounded-xl bg-accent/5 border border-accent/15 flex items-start gap-2.5 text-xs">
        <AlertCircle size={14} className="text-accent flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-foreground mb-1">How Verification Works</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>→ SHA-256 hash is computed from your uploaded file locally</li>
            <li>→ Compared against the stored hash from original upload</li>
            <li>→ Match = authentic, unchanged file. Mismatch = file modified.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

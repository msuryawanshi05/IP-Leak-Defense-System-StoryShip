"use client"

import { useState } from "react"
import { GitCompare, X, ArrowRight } from "lucide-react"

interface Version {
  id: number
  name: string
  hash: string
  timestamp: Date
  author: string | null
  notes: string
  size: number
  ipfsCid: string
  transactionHash?: string
  blockNumber?: number
  encryptedHash?: string
}

interface VersionComparisonProps {
  versions: Version[]
  onClose: () => void
}

export default function VersionComparison({ versions, onClose }: VersionComparisonProps) {
  const [selected, setSelected] = useState<number[]>([0, Math.min(1, versions.length - 1)])

  const toggle = (index: number) => {
    if (selected.includes(index)) {
      setSelected(selected.filter((i) => i !== index))
    } else if (selected.length < 2) {
      setSelected([...selected, index].sort((a, b) => a - b))
    }
  }

  const v1 = versions[selected[0]]
  const v2 = versions[selected[1]]
  const ready = v1 && v2 && v1 !== v2

  const timeDiff = ready ? Math.abs(new Date(v2.timestamp).getTime() - new Date(v1.timestamp).getTime()) : 0
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const hoursDiff = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const hashMatch = ready ? v1.hash === v2.hash : false
  const sizeChange = ready ? v2.size - v1.size : 0
  const sizePercent = ready && v1.size > 0 ? ((sizeChange / v1.size) * 100).toFixed(1) : "0"

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <GitCompare size={15} className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-foreground">Version Comparison</p>
            <p className="text-xs text-muted-foreground">Select two versions to compare</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Version picker */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Versions</p>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {versions.map((v, idx) => {
            const isSelected = selected.includes(idx)
            const selIdx = selected.indexOf(idx)
            return (
              <button
                key={v.id}
                onClick={() => toggle(idx)}
                disabled={selected.length === 2 && !isSelected}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                  isSelected
                    ? "border-primary/50 bg-primary/10"
                    : "border-border hover:border-border/80 hover:bg-secondary/50 disabled:opacity-40 disabled:cursor-not-allowed"
                }`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected ? "border-primary bg-primary" : "border-border"
                }`}>
                  {isSelected && <span className="text-primary-foreground text-xs font-bold">{selIdx + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">v{versions.length - idx}: {v.name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(v.timestamp).toLocaleDateString()}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Comparison panel */}
      {ready && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Side by side */}
          <div className="grid grid-cols-2 gap-3 relative">
            {/* Arrow in middle */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center z-10 pointer-events-none">
              <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center">
                <ArrowRight size={14} className="text-muted-foreground" />
              </div>
            </div>

            {[v1, v2].map((v, i) => (
              <div key={v.id} className="glass-card p-4 space-y-3">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                  i === 0 ? "bg-primary/15 text-primary border border-primary/25" : "bg-accent/15 text-accent border border-accent/25"
                }`}>
                  {i === 0 ? "Version A" : "Version B"}
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Label</p>
                    <p className="font-medium text-foreground">v{versions.length - versions.indexOf(v)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Name</p>
                    <p className="font-medium text-foreground truncate">{v.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Date</p>
                    <p className="font-medium text-foreground">{new Date(v.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Size</p>
                    <p className="font-medium text-foreground">{v.size > 0 ? `${(v.size / 1024).toFixed(2)} KB` : "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Hash (first 12)</p>
                    <p className="font-mono text-foreground">{v.hash.slice(0, 12)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Results */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Comparison Results</p>
            <div className="space-y-2">
              {[
                {
                  label: "File Content Changed",
                  value: hashMatch ? "No — identical files" : "Yes — different content",
                  status: hashMatch ? "neutral" : "changed",
                },
                {
                  label: "File Size Change",
                  value: sizeChange === 0
                    ? "No change"
                    : `${sizeChange > 0 ? "+" : ""}${(sizeChange / 1024).toFixed(2)} KB (${sizePercent}%)`,
                  status: sizeChange === 0 ? "neutral" : sizeChange > 0 ? "increased" : "decreased",
                },
                {
                  label: "Time Between Versions",
                  value: `${daysDiff} days, ${hoursDiff} hours`,
                  status: "info",
                },
                {
                  label: "On-Chain Status",
                  value: v1.transactionHash && v2.transactionHash ? "Both verified on-chain" : "Partially recorded",
                  status: v1.transactionHash && v2.transactionHash ? "verified" : "neutral",
                },
              ].map(({ label, value, status }) => (
                <div key={label} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className={`text-sm font-semibold ${
                    status === "verified" ? "text-[oklch(0.68_0.18_145)]" :
                    status === "changed" ? "text-accent" :
                    status === "increased" ? "text-destructive" :
                    status === "decreased" ? "text-[oklch(0.68_0.18_145)]" :
                    "text-foreground"
                  }`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Full hash comparison */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">SHA-256 Hash Comparison</p>
            <div className="space-y-2">
              {[v1, v2].map((v, i) => (
                <div key={v.id} className="rounded-xl bg-secondary/30 border border-border/50 overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-border/30 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${i === 0 ? "bg-primary" : "bg-accent"}`} />
                    <span className="text-xs text-muted-foreground">v{versions.length - versions.indexOf(v)}</span>
                  </div>
                  <p className="font-mono text-xs text-foreground p-3 break-all leading-relaxed">{v.hash}</p>
                </div>
              ))}
            </div>
            {hashMatch && (
              <div className="mt-2 px-3 py-2 rounded-xl bg-[oklch(0.68_0.18_145/0.08)] border border-[oklch(0.68_0.18_145/0.25)] text-xs text-[oklch(0.68_0.18_145)] text-center font-medium">
                ✓ Hashes are identical — same file content
              </div>
            )}
          </div>

          <button onClick={onClose} className="btn-glow w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
            Close Comparison
          </button>
        </div>
      )}

      {!ready && selected.length < 2 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          Select {2 - selected.length} more version{2 - selected.length !== 1 ? "s" : ""} to compare
        </p>
      )}
    </div>
  )
}

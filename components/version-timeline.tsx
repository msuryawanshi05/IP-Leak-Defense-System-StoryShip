"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { downloadFile } from "@/lib/storage"
import VersionDetails from "@/components/version-details"
import VersionComparison from "@/components/version-comparison"
import { FileTypeIcon, FileTypeBadge } from "@/lib/file-type"
import { Download, Eye, GitCompare, Shield, Link2, Clock, Hash, HardDrive, Share2 } from "lucide-react"
import { toast } from "sonner"

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
  ipAssetId?: string
}

interface VersionTimelineProps {
  versions: Version[]
}

export default function VersionTimeline({ versions }: VersionTimelineProps) {
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [compareMode, setCompareMode] = useState(false)

  const handleDownload = async (version: Version, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const success = await downloadFile(version.hash, version.name)
      if (success) {
        toast.success("Downloaded!", { description: `"${version.name}" downloaded successfully.` })
      } else {
        toast.error("File Not Available", {
          description: "This file was uploaded before download support was added, or local storage was cleared. Re-upload to enable downloads.",
        })
      }
    } catch {
      toast.error("Download Failed", { description: "Please try again or re-upload the file." })
    }
  }

  const handleViewDetails = (versionId: number) => {
    setSelectedVersion(versionId)
    setDetailsOpen(true)
  }

  const selectedVer = selectedVersion !== null ? versions.find((v) => v.id === selectedVersion) : null
  const versionIndex = selectedVer ? versions.indexOf(selectedVer) : -1

  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "—"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-3">
      {versions.map((version, index) => {
        const vNum = versions.length - index
        const isSelected = selectedVersion === version.id
        const hasOnChain = !!version.transactionHash
        const hasIPAsset = !!version.ipAssetId

        return (
          <div key={version.id} className="flex gap-4 group animate-fade-in-up" style={{ animationDelay: `${index * 60}ms` }}>
            {/* Timeline dot + line */}
            <div className="flex flex-col items-center pt-5 flex-shrink-0">
              <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isSelected
                  ? "bg-accent scale-125 animate-pulse-glow-cyan"
                  : hasOnChain
                  ? "bg-primary animate-pulse-glow"
                  : "bg-border group-hover:bg-primary/60"
              }`} />
              {index < versions.length - 1 && (
                <div className="w-px flex-1 mt-2 timeline-line min-h-[48px]" />
              )}
            </div>

            {/* Card */}
            <div
              className={`glass-card flex-1 p-5 cursor-pointer mb-2 ${isSelected ? "border-primary/50 shadow-[0_0_30px_oklch(0.62_0.22_276/0.12)]" : ""}`}
              onClick={() => handleViewDetails(version.id)}
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                {/* File type icon */}
                <FileTypeIcon fileName={version.name} size={18} className="mt-0.5 w-10 h-10 flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-foreground truncate">{version.name}</h3>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-secondary border border-border font-mono text-muted-foreground flex-shrink-0">
                      v{vNum}
                    </span>
                    <FileTypeBadge fileName={version.name} />
                    {hasIPAsset && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary/15 border border-primary/30 text-primary font-semibold flex-shrink-0 flex items-center gap-1">
                        <Shield size={9} />
                        IP Asset
                      </span>
                    )}
                    {hasOnChain && !hasIPAsset && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-accent/15 border border-accent/30 text-accent font-semibold flex-shrink-0 flex items-center gap-1">
                        <Link2 size={9} />
                        On-Chain
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{version.notes}</p>
                </div>
              </div>

              {/* Metadata grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <Hash size={12} className="text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">SHA-256</p>
                    <p className="font-mono text-xs text-foreground">{version.hash.slice(0, 10)}…</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <HardDrive size={12} className="text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Size</p>
                    <p className="text-xs text-foreground">{formatSize(version.size)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Date</p>
                    <p className="text-xs text-foreground">{formatDate(version.timestamp)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Link2 size={12} className="text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">IPFS CID</p>
                    <p className="font-mono text-xs text-foreground">{version.ipfsCid.slice(0, 10)}…</p>
                  </div>
                </div>
              </div>

              {/* On-chain proof strip */}
              {version.transactionHash && (
                <div className="mb-4 px-3 py-2 rounded-lg bg-primary/8 border border-primary/15 flex items-center gap-2">
                  <Shield size={12} className="text-primary flex-shrink-0" />
                  <p className="font-mono text-xs text-muted-foreground truncate flex-1">{version.transactionHash}</p>
                  {version.blockNumber && (
                    <span className="text-xs text-muted-foreground flex-shrink-0">Block #{version.blockNumber}</span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                  onClick={(e) => { e.stopPropagation(); handleViewDetails(version.id) }}
                  id={`view-details-${version.id}`}
                >
                  <Eye size={13} />
                  Details
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-accent/50 hover:bg-accent/5 transition-all duration-200"
                  onClick={(e) => handleDownload(version, e)}
                  id={`download-${version.id}`}
                >
                  <Download size={13} />
                  Download
                </button>
                <button
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation()
                    const url = `${window.location.origin}/verify/${version.hash}`
                    navigator.clipboard.writeText(url)
                    toast.success("Proof Link Copied!", {
                      description: "Share this link — anyone can verify the file without a wallet.",
                    })
                  }}
                  id={`share-${version.id}`}
                  title="Copy shareable proof link"
                >
                  <Share2 size={13} />
                  Share
                </button>
              </div>
            </div>
          </div>
        )
      })}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-xl glass border-[var(--glass-border)] p-0 overflow-hidden">
          <DialogTitle className="sr-only">
            {selectedVer ? `Version Details: ${selectedVer.name}` : "Version Details"}
          </DialogTitle>
          {selectedVer && (
            <div className="max-h-[85vh] overflow-y-auto">
              {/* Header bar */}
              <div className="sticky top-0 z-10 glass border-b border-[var(--glass-border)] px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">{selectedVer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    v{versions.length - versionIndex} of {versions.length}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {versions.length > 1 && (
                    <button
                      onClick={() => { setDetailsOpen(false); setCompareMode(true) }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
                    >
                      <GitCompare size={12} />
                      Compare
                    </button>
                  )}
                  <button
                    onClick={() => setDetailsOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6">
                <VersionDetails version={selectedVer} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Compare Dialog */}
      <Dialog open={compareMode} onOpenChange={setCompareMode}>
        <DialogContent className="max-w-2xl glass border-[var(--glass-border)] p-0 overflow-hidden">
          <DialogTitle className="sr-only">Compare Versions</DialogTitle>
          <div className="max-h-[85vh] overflow-y-auto p-6">
            <VersionComparison versions={versions} onClose={() => setCompareMode(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

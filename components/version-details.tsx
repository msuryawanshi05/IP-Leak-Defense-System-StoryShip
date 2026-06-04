"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getBlockExplorerUrl, formatHash, getCurrentNetwork } from "@/lib/contracts"
import FileVerifier from "@/components/file-verifier"
import { generateProofPDF } from "@/lib/pdf-export"
import { Shield, Copy, Check, ExternalLink, Link2, Clock, HardDrive, User, FileDown, Loader2 } from "lucide-react"
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

interface VersionDetailsProps {
  version: Version
}

export default function VersionDetails({ version }: VersionDetailsProps) {
  const [chainId, setChainId] = useState<number | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => { getCurrentNetwork().then(setChainId) }, [])

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      await generateProofPDF({
        fileName: version.name,
        fileHash: version.hash,
        ipfsCid: version.ipfsCid,
        timestamp: version.timestamp,
        author: version.author,
        notes: version.notes,
        transactionHash: version.transactionHash,
        blockNumber: version.blockNumber,
        ipAssetId: version.ipAssetId,
        encryptedHash: version.encryptedHash,
      })
      toast.success("Certificate Downloaded!", {
        description: `StoryProof_Certificate_${version.name.slice(0, 20)}.pdf saved.`,
      })
    } catch (err) {
      toast.error("Export Failed", { description: "Could not generate PDF. Please try again." })
    } finally {
      setExporting(false)
    }
  }


  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    toast.success("Copied!", { description: `${label} copied to clipboard.` })
    setTimeout(() => setCopied(null), 2000)
  }

  const viewOnChain = () => {
    if (!version.transactionHash) return
    const url = getBlockExplorerUrl(version.transactionHash, chainId ?? undefined)
    window.open(url, "_blank")
  }

  const formatSize = (b: number) => b > 0 ? `${(b / 1024).toFixed(2)} KB` : "—"
  const formatDate = (d: Date) => new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })

  const CopyBtn = ({ text, label }: { text: string; label: string }) => (
    <button
      onClick={() => copy(text, label)}
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
    >
      {copied === label ? <Check size={12} className="text-[oklch(0.68_0.18_145)]" /> : <Copy size={12} />}
      {copied === label ? "Copied" : "Copy"}
    </button>
  )

  return (
    <div className="space-y-1">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-4 bg-secondary/50 p-1 rounded-xl">
          <TabsTrigger value="details" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-sm">
            Details
          </TabsTrigger>
          <TabsTrigger value="verify" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-sm">
            Verify File
          </TabsTrigger>
        </TabsList>

        {/* ── DETAILS TAB ── */}
        <TabsContent value="details" className="space-y-4 mt-0">

          {/* Notes + meta */}
          <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 space-y-3">
            <p className="text-sm text-foreground">{version.notes}</p>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Created</p>
                  <p className="text-xs text-foreground">{formatDate(version.timestamp)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive size={13} className="text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">File Size</p>
                  <p className="text-xs text-foreground">{formatSize(version.size)}</p>
                </div>
              </div>
              {version.author && (
                <div className="flex items-center gap-2 col-span-2">
                  <User size={13} className="text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Author</p>
                    <p className="font-mono text-xs text-foreground truncate">{version.author}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hashes */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Cryptographic Hashes</p>
            <div className="space-y-3">
              {[
                { label: "SHA-256 (File)", value: version.hash, key: "hash" },
                { label: "IPFS CID", value: version.ipfsCid, key: "ipfs" },
                ...(version.encryptedHash ? [{ label: "Encrypted Hash", value: version.encryptedHash, key: "enc" }] : []),
              ].map(({ label, value, key }) => (
                <div key={key} className="rounded-xl bg-secondary/30 border border-border/50 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
                    <span className="text-xs font-medium text-muted-foreground">{label}</span>
                    <CopyBtn text={value} label={label} />
                  </div>
                  <p className="font-mono text-xs text-foreground p-3 break-all leading-relaxed">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* IP Asset */}
          {version.ipAssetId && (
            <div className="rounded-xl bg-primary/8 border border-primary/20 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Shield size={14} className="text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">Story Protocol IP Asset</p>
                <Badge className="text-xs px-2 py-0.5 bg-primary/20 text-primary border-primary/30">Registered</Badge>
              </div>
              <div className="rounded-lg bg-background/40 border border-border/30 p-3">
                <p className="text-[10px] text-muted-foreground mb-1">IP Asset ID</p>
                <p className="font-mono text-xs text-foreground break-all">{version.ipAssetId}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                This file is registered as an Intellectual Property Asset on Story Protocol.
              </p>
            </div>
          )}

          {/* On-chain verification */}
          {version.transactionHash && (
            <div className="rounded-xl bg-accent/5 border border-accent/20 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Link2 size={15} className="text-accent" />
                <p className="text-sm font-semibold text-foreground">Blockchain Verification</p>
              </div>
              <div className="space-y-2 mb-4">
                <div className="rounded-lg bg-background/40 border border-border/30 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] text-muted-foreground">Transaction Hash</p>
                    <CopyBtn text={version.transactionHash} label="TX Hash" />
                  </div>
                  <p className="font-mono text-xs text-foreground break-all">{formatHash(version.transactionHash)}</p>
                </div>
                {version.blockNumber && (
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-background/40 border border-border/30">
                    <p className="text-xs text-muted-foreground">Block Number</p>
                    <p className="font-mono text-sm font-bold text-foreground">#{version.blockNumber}</p>
                  </div>
                )}
              </div>
              <button
                onClick={viewOnChain}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-accent/30 text-accent text-sm font-medium hover:bg-accent/10 transition-colors"
              >
                <ExternalLink size={14} />
                View on Block Explorer
              </button>
            </div>
          )}

          {/* ── Export PDF ── */}
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            id="export-pdf-btn"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {exporting ? (
              <><Loader2 size={15} className="animate-spin" /> Generating Certificate…</>
            ) : (
              <><FileDown size={15} /> Export IP Ownership Certificate (PDF)</>
            )}
          </button>
        </TabsContent>


        {/* ── VERIFY TAB ── */}
        <TabsContent value="verify" className="mt-0">
          <FileVerifier expectedHash={version.hash} fileName={version.name} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

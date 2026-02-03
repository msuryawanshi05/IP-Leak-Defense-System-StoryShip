"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { getBlockExplorerUrl, formatHash } from "@/lib/contracts"

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

interface VersionDetailModalProps {
  version: Version
  versionNumber: number
  totalVersions: number
  onClose: () => void
  onCompare?: () => void
}

export default function VersionDetailModal({
  version,
  versionNumber,
  totalVersions,
  onClose,
  onCompare,
}: VersionDetailModalProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleViewOnBlockchain = () => {
    if (!version.transactionHash) return
    const url = getBlockExplorerUrl(version.transactionHash, "polygon")
    window.open(url, "_blank")
  }

  return (
    <Card className="p-6 space-y-6 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{version.name}</h2>
          <p className="text-muted-foreground mt-1">
            Version {versionNumber} of {totalVersions}
          </p>
        </div>
        <Button onClick={onClose} variant="ghost" size="sm">
          ✕
        </Button>
      </div>

      <div className="bg-muted p-4 rounded-lg space-y-2">
        <p className="text-sm text-foreground">{version.notes}</p>
        <p className="text-xs text-muted-foreground">
          Created on {new Date(version.timestamp).toLocaleDateString()} at{" "}
          {new Date(version.timestamp).toLocaleTimeString()}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">File Size</p>
          <p className="text-lg font-semibold text-foreground">
            {version.size > 0 ? `${(version.size / 1024).toFixed(2)} KB` : "—"}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Author</p>
          <p className="font-mono text-sm text-foreground truncate">{version.author || "Unknown"}</p>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="text-sm font-semibold mb-4 text-foreground">File Hashes</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-muted-foreground">SHA-256 Hash</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => handleCopy(version.hash, "hash")}
              >
                {copied === "hash" ? "Copied!" : "Copy"}
              </Button>
            </div>
            <p className="font-mono text-xs text-foreground bg-muted p-3 rounded break-all">{version.hash}</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-muted-foreground">IPFS CID</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => handleCopy(version.ipfsCid, "ipfs")}
              >
                {copied === "ipfs" ? "Copied!" : "Copy"}
              </Button>
            </div>
            <p className="font-mono text-xs text-foreground bg-muted p-3 rounded break-all">{version.ipfsCid}</p>
          </div>

          {version.encryptedHash && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-muted-foreground">Encrypted Hash</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleCopy(version.encryptedHash!, "encrypted")}
                >
                  {copied === "encrypted" ? "Copied!" : "Copy"}
                </Button>
              </div>
              <p className="font-mono text-xs text-foreground bg-muted p-3 rounded break-all">
                {version.encryptedHash}
              </p>
            </div>
          )}
        </div>
      </div>

      {version.transactionHash && (
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold mb-4 text-foreground">Blockchain Verification</h3>
          <div className="space-y-3 bg-muted p-4 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Transaction Hash</p>
              <div className="flex gap-2">
                <p className="font-mono text-xs text-foreground break-all flex-1">
                  {formatHash(version.transactionHash)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleCopy(version.transactionHash!, "tx")}
                >
                  {copied === "tx" ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            {version.blockNumber && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Block Number</p>
                <p className="font-mono text-sm text-foreground">{version.blockNumber}</p>
              </div>
            )}

            <Button variant="outline" className="w-full text-sm mt-2 bg-transparent" onClick={handleViewOnBlockchain}>
              View on Block Explorer
            </Button>
          </div>
        </div>
      )}

      <div className="border-t border-border pt-4 flex gap-2">
        {onCompare && (
          <Button onClick={onCompare} variant="outline" className="flex-1 bg-transparent">
            Compare with Another Version
          </Button>
        )}
        <Button onClick={onClose} className="flex-1">
          Close
        </Button>
      </div>
    </Card>
  )
}

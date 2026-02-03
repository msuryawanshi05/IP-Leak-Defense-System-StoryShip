"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { downloadFile } from "@/lib/storage"
import VersionDetailModal from "@/components/version-detail-modal"
import VersionComparison from "@/components/version-comparison"

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
  ipAssetId?: string // Story Protocol IP Asset ID
}

interface VersionTimelineProps {
  versions: Version[]
}

export default function VersionTimeline({ versions }: VersionTimelineProps) {
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [compareMode, setCompareMode] = useState(false)

  const handleDownload = async (version: Version) => {
    try {
      const success = await downloadFile(version.hash, version.name)
      if (!success) {
        // File not found in localStorage
        // This means the file was uploaded before the download feature was added
        // or localStorage was cleared
        // Don't try IPFS gateways for mock CIDs - they don't exist on IPFS
        alert(
          "File not available for download.\n\n" +
          "This file was uploaded before the download feature was available, " +
          "or the local storage was cleared.\n\n" +
          "The file is not stored on IPFS (it was uploaded with a demo/mock CID).\n\n" +
          "Please re-upload the file to enable download functionality."
        )
      }
    } catch (error) {
      console.error("Download failed:", error)
      alert("Failed to download file. Please try again or re-upload the file.")
    }
  }

  const handleViewDetails = (versionId: number) => {
    setSelectedVersion(versionId)
    setDetailsOpen(true)
  }

  const handleCompare = () => {
    setDetailsOpen(false)
    setCompareMode(true)
  }

  const selectedVer = selectedVersion !== null ? versions.find((v) => v.id === selectedVersion) : null
  const versionIndex = selectedVer ? versions.indexOf(selectedVer) : -1

  return (
    <div className="space-y-4">
      <div className="relative">
        {versions.map((version, index) => (
          <div key={version.id} className="flex gap-4 pb-8">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${selectedVersion === version.id ? "bg-accent" : "bg-primary"}`} />
              {index < versions.length - 1 && <div className="w-0.5 h-16 bg-border mt-3" />}
            </div>
            <Card
              className={`flex-1 p-4 hover:shadow-lg transition-shadow cursor-pointer ${
                selectedVersion === version.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handleViewDetails(version.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-foreground">{version.name}</h4>
                  <p className="text-sm text-muted-foreground">{version.notes}</p>
                </div>
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                  v{versions.length - index}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">File Hash</p>
                  <p className="font-mono text-xs text-foreground break-all">{version.hash.slice(0, 16)}...</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Size</p>
                  <p className="text-foreground">{version.size > 0 ? `${(version.size / 1024).toFixed(2)} KB` : "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Timestamp</p>
                  <p className="text-foreground text-xs">{new Date(version.timestamp).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">IPFS CID</p>
                  <p className="font-mono text-xs text-foreground truncate">{version.ipfsCid.slice(0, 16)}...</p>
                </div>
              </div>

              {version.transactionHash && (
                <div className="mb-4 p-3 bg-muted rounded text-xs">
                  <p className="text-muted-foreground mb-1">On-Chain Proof</p>
                  <p className="font-mono text-foreground truncate">{version.transactionHash}</p>
                  {version.blockNumber && (
                    <p className="text-muted-foreground text-xs mt-1">Block: {version.blockNumber}</p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs bg-transparent flex-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewDetails(version.id)
                  }}
                >
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs bg-transparent flex-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload(version)
                  }}
                >
                  Download
                </Button>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogTitle className="sr-only">
            {selectedVer ? `Version Details: ${selectedVer.name}` : "Version Details"}
          </DialogTitle>
          {selectedVer && (
            <VersionDetailModal
              version={selectedVer}
              versionNumber={versions.length - versionIndex}
              totalVersions={versions.length}
              onClose={() => setDetailsOpen(false)}
              onCompare={() => handleCompare()}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={compareMode} onOpenChange={setCompareMode}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="sr-only">Compare Versions</DialogTitle>
          <VersionComparison versions={versions} onClose={() => setCompareMode(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

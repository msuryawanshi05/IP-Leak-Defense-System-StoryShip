"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import FileUpload from "@/components/file-upload"
import VersionTimeline from "@/components/version-timeline"
import { getVersionCheckpoints } from "@/lib/blockchain"

interface DashboardProps {
  address: string | null
}

export default function Dashboard({ address }: DashboardProps) {
  const [versions, setVersions] = useState<any[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadVersions = async () => {
      if (!address) return

      try {
        // Fetch saved checkpoints from localStorage
        const checkpoints = getVersionCheckpoints(address)
        if (checkpoints.length > 0) {
          // Convert checkpoints to version format for display
          const loadedVersions = checkpoints.map((checkpoint: any, index: number) => ({
            id: index,
            name: checkpoint.versionNote || "Unnamed Version",
            hash: checkpoint.fileHash,
            timestamp: new Date(checkpoint.timestamp * 1000),
            author: checkpoint.author,
            notes: checkpoint.versionNote,
            size: 0,
            ipfsCid: checkpoint.ipfsCid,
            transactionHash: checkpoint.transactionHash,
            blockNumber: checkpoint.blockNumber,
            encryptedHash: checkpoint.encryptedHash,
          }))
          setVersions(loadedVersions.reverse()) // Show newest first
        }
      } catch (error) {
        console.error("Failed to load versions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadVersions()
  }, [address])

  const handleFileUploaded = (newVersion: any) => {
    setVersions([newVersion, ...versions])
    setShowUpload(false)
  }

  if (isLoading) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Loading your files...</p>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Your Files</h2>
          <p className="text-muted-foreground">Manage and track versions of your creative works</p>
        </div>
        <Button onClick={() => setShowUpload(!showUpload)} size="lg">
          {showUpload ? "Cancel" : "Upload File"}
        </Button>
      </div>

      {showUpload && (
        <Card className="p-6">
          <FileUpload address={address} onUploaded={handleFileUploaded} />
        </Card>
      )}

      {versions.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No files uploaded yet</p>
          <p className="text-sm text-muted-foreground">Upload a file to start creating version history on-chain</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {versions.length} Version{versions.length !== 1 ? "s" : ""}
            </h3>
            <p className="text-sm text-muted-foreground">Newest first</p>
          </div>
          <VersionTimeline versions={versions} />
        </div>
      )}
    </div>
  )
}

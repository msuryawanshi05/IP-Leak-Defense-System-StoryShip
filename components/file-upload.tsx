"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { processFileUpload } from "@/lib/storage"
import { createVersionCheckpoint } from "@/lib/blockchain"
import { useToast } from "@/components/ui/use-toast"
import { DragDropZone } from "@/components/drag-drop-zone"

interface FileUploadProps {
  address: string | null
  onUploaded: (version: any) => void
}

export default function FileUpload({ address, onUploaded }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Keyboard shortcut handler
  useEffect(() => {
    const handleShortcut = () => {
      fileInputRef.current?.click()
    }
    window.addEventListener("shortcut:upload", handleShortcut)
    return () => window.removeEventListener("shortcut:upload", handleShortcut)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleFilesDropped = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!address) {
      setError("Connect your wallet before uploading.")
      return
    }
    if (!file) {
      setError("Please choose a file before uploading.")
      return
    }

    setIsLoading(true)
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
      )

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
        ipAssetId: checkpoint.ipAssetId, // Story Protocol IP Asset ID
      }

      onUploaded(newVersion)
      setFile(null)
      setNotes("")
      setError(null)
      toast({
        title: "Upload complete",
        description: "Your file has been recorded on-chain.",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed. Please try again."
      setError(message)
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DragDropZone onFilesDropped={handleFilesDropped} className="space-y-4">
      <div>
        <label htmlFor="file-input" className="block text-sm font-medium mb-2">
          Select File
        </label>
        <input
          id="file-input"
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-muted-foreground
            file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0
            file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground
            hover:file:bg-primary/90"
          aria-label="Select file to upload"
        />
        {file && (
          <p className="text-sm text-muted-foreground mt-2" role="status">
            Selected: {file.name}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Version Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe your changes in this version..."
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          rows={3}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        onClick={handleUpload}
        disabled={isLoading}
        className="w-full"
        aria-label="Upload file to blockchain"
      >
        {isLoading ? "Processing..." : "Upload to Blockchain"}
      </Button>
    </DragDropZone>
  )
}

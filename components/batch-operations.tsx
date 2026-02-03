"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import FileUpload from "@/components/file-upload"

interface BatchOperationsProps {
  address: string | null
  onComplete: () => void
}

export default function BatchOperations({ address, onComplete }: BatchOperationsProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<Array<{ file: string; success: boolean; error?: string }>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      setFiles(selectedFiles)
    }
  }

  const handleBatchUpload = async () => {
    if (!address || files.length === 0) return

    setUploading(true)
    setProgress(0)
    setResults([])

    const newResults: Array<{ file: string; success: boolean; error?: string }> = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        // Simulate upload process
        const { processFileUpload } = await import("@/lib/storage")
        const { createVersionCheckpoint } = await import("@/lib/blockchain")

        const encryptionKey = address.toLowerCase()
        const storedFile = await processFileUpload(file, encryptionKey)

        await createVersionCheckpoint(
          storedFile.fileHash,
          storedFile.ipfsCid,
          storedFile.encryptedHash,
          `Batch upload: ${file.name}`,
          address,
          file.name,
        )

        newResults.push({ file: file.name, success: true })
        toast.success(`Uploaded: ${file.name}`)
      } catch (error: any) {
        newResults.push({ file: file.name, success: false, error: error.message })
        toast.error(`Failed: ${file.name}`)
      }

      setProgress(((i + 1) / files.length) * 100)
      setResults([...newResults])
    }

    setUploading(false)
    onComplete()
    toast.success(`Batch upload complete: ${newResults.filter((r) => r.success).length}/${files.length} successful`)
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch File Upload</CardTitle>
        <CardDescription>Upload multiple files at once</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Select Multiple Files
          </Button>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{files.length} file(s) selected</p>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-secondary/50 rounded text-sm">
                  <span className="truncate flex-1">{file.name}</span>
                  <span className="text-xs text-muted-foreground mx-2">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                  {!uploading && (
                    <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <p className="text-sm font-medium">Results:</p>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-secondary/50 rounded text-sm"
                >
                  {result.success ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="truncate flex-1">{result.file}</span>
                  {result.error && <span className="text-xs text-red-500">{result.error}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleBatchUpload}
          disabled={files.length === 0 || uploading || !address}
          className="w-full"
        >
          {uploading ? `Uploading... ${results.length}/${files.length}` : `Upload ${files.length} File(s)`}
        </Button>
      </CardContent>
    </Card>
  )
}


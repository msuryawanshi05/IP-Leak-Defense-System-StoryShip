"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ZoomIn, ZoomOut, RotateCw, Download, Info, X } from "lucide-react"
import { formatAddress } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface AdvancedFilePreviewProps {
  file: any
  isOpen: boolean
  onClose: () => void
}

export function AdvancedFilePreview({ file, isOpen, onClose }: AdvancedFilePreviewProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [showMetadata, setShowMetadata] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setZoom(1)
      setRotation(0)
      setShowMetadata(false)
    }
  }, [isOpen])

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5))
  const handleRotate = () => setRotation((r) => (r + 90) % 360)
  const handleReset = () => {
    setZoom(1)
    setRotation(0)
  }

  const isImage = file?.fileData?.metadata?.mimeType?.startsWith("image/")
  const isVideo = file?.fileData?.metadata?.mimeType?.startsWith("video/")
  const isAudio = file?.fileData?.metadata?.mimeType?.startsWith("audio/")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="truncate flex-1">
              {file?.versionNote || "File Preview"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {isImage && (
                <>
                  <Button variant="outline" size="sm" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button variant="outline" size="sm" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRotate}>
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    Reset
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowMetadata(!showMetadata)}>
                <Info className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className={showMetadata ? "md:col-span-2" : "md:col-span-3"}>
              <div className="bg-secondary/50 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
                {isImage && file?.fileData?.data && (
                  <img
                    ref={imageRef}
                    src={file.fileData.data}
                    alt={file.versionNote || "Preview"}
                    className="max-w-full max-h-[70vh] object-contain transition-transform"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    }}
                  />
                )}
                {isVideo && file?.fileData?.data && (
                  <video
                    src={file.fileData.data}
                    controls
                    className="max-w-full max-h-[70vh]"
                  />
                )}
                {isAudio && file?.fileData?.data && (
                  <div className="w-full max-w-md">
                    <audio src={file.fileData.data} controls className="w-full" />
                  </div>
                )}
                {!isImage && !isVideo && !isAudio && (
                  <div className="text-center text-muted-foreground">
                    <p>Preview not available for this file type</p>
                  </div>
                )}
              </div>
            </div>

            {showMetadata && (
              <div className="md:col-span-1 space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">File Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">{file?.versionNote || "Unnamed"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">File Hash</p>
                      <p className="font-mono text-xs break-all">{file?.fileHash}</p>
                    </div>
                    {file?.timestamp && (
                      <div>
                        <p className="text-muted-foreground">Uploaded</p>
                        <p>
                          {formatDistanceToNow(
                            new Date(file.timestamp > 1e12 ? file.timestamp : file.timestamp * 1000),
                            { addSuffix: true },
                          )}
                        </p>
                      </div>
                    )}
                    {file?.fileData?.metadata?.size && (
                      <div>
                        <p className="text-muted-foreground">Size</p>
                        <p>{(file.fileData.metadata.size / 1024).toFixed(2)} KB</p>
                      </div>
                    )}
                    {file?.fileData?.metadata?.mimeType && (
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p>{file.fileData.metadata.mimeType}</p>
                      </div>
                    )}
                    {file?.transactionHash && (
                      <div>
                        <p className="text-muted-foreground">Transaction</p>
                        <p className="font-mono text-xs break-all">{file.transactionHash}</p>
                        <Badge variant="default" className="mt-1">Verified</Badge>
                      </div>
                    )}
                    {file?.ipAssetId && (
                      <div>
                        <p className="text-muted-foreground">IP Asset ID</p>
                        <p className="font-mono text-xs">{file.ipAssetId}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


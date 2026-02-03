"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getVersionCheckpoints } from "@/lib/blockchain"
import { calculateFileSimilarity, getSimilarityCategory } from "@/lib/similarity"
import { useThrottle } from "@/lib/hooks"
import { Search, Image as ImageIcon, FileText, Video, Music, AlertCircle, CheckCircle2, Grid3x3, List, Play, Info } from "lucide-react"
import Navigation from "@/components/navigation"
import { WalletGate } from "@/components/wallet-gate"
import { ErrorBoundary } from "@/components/error-boundary"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <WalletGate
        title="Connect your wallet"
        description="Preview visual assets, run AI similarity checks, and verify provenance."
      >
        {(address) => <GalleryBody address={address} />}
      </WalletGate>
    </div>
  )
}

function GalleryBody({ address }: { address: string }) {
  const router = useRouter()
  const [files, setFiles] = useState<any[]>([])
  const [filteredFiles, setFilteredFiles] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [similarityResults, setSimilarityResults] = useState<any[]>([])
  const [isCheckingSimilarity, setIsCheckingSimilarity] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [previewOpen, setPreviewOpen] = useState(false)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const checkingFileRef = useRef<string | null>(null)

  useEffect(() => {
    const loadFiles = () => {
      try {
        const checkpoints = getVersionCheckpoints(address)
        const loadedFiles = checkpoints.map((checkpoint: any) => {
          let fileData: any = null
          try {
            if (typeof window !== "undefined") {
              const stored = localStorage.getItem(`file_${checkpoint.fileHash}`)
              if (stored) {
                fileData = JSON.parse(stored)
              }
            }
          } catch {
            // Ignore corrupted cache entries
          }

          return {
            ...checkpoint,
            fileData,
            timestamp: new Date(checkpoint.timestamp * 1000),
          }
        })
        setFiles(loadedFiles.reverse())
        setFilteredFiles(loadedFiles)
      } catch (error) {
        console.error("Failed to load files:", error)
      }
    }

    loadFiles()
  }, [address])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFiles(files)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = files.filter(
      (f) =>
        f.versionNote?.toLowerCase().includes(query) ||
        f.fileHash.toLowerCase().includes(query) ||
        f.fileData?.metadata?.name?.toLowerCase().includes(query),
    )
    setFilteredFiles(filtered)
  }, [searchQuery, files])

  const getFileIcon = (file: any) => {
    const mimeType = file.fileData?.metadata?.mimeType || ""
    if (mimeType.startsWith("image/")) return <ImageIcon className="h-8 w-8" />
    if (mimeType.startsWith("video/")) return <Video className="h-8 w-8" />
    if (mimeType.startsWith("audio/")) return <Music className="h-8 w-8" />
    return <FileText className="h-8 w-8" />
  }

  const handleImageError = (fileHash: string) => {
    setImageErrors((prev) => new Set(prev).add(fileHash))
  }

  const getFilePreview = (file: any) => {
    if (!file.fileData?.data) return null
    const mimeType = file.fileData.metadata?.mimeType || ""
    const hasError = imageErrors.has(file.fileHash)

    if (mimeType.startsWith("image/")) {
      if (hasError) {
        return (
          <div className="w-full h-48 bg-secondary/50 rounded flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground opacity-50" />
          </div>
        )
      }
      return (
        <img
          src={file.fileData.data}
          alt={file.versionNote || "Preview"}
          className="w-full h-48 object-cover rounded cursor-pointer"
          onClick={() => {
            setSelectedFile(file)
            setPreviewOpen(true)
          }}
          onError={() => handleImageError(file.fileHash)}
          loading="lazy"
        />
      )
    }
    if (mimeType.startsWith("video/")) {
      return (
        <div className="relative w-full h-48 bg-secondary/50 rounded flex items-center justify-center group">
          <video
            src={file.fileData.data}
            className="w-full h-full object-cover rounded"
            controls
            preload="metadata"
            onError={() => handleImageError(file.fileHash)}
          />
        </div>
      )
    }
    if (mimeType.startsWith("audio/")) {
      return (
        <div className="w-full h-48 bg-secondary/50 rounded flex items-center justify-center">
          <audio src={file.fileData.data} controls className="w-full" preload="metadata" />
        </div>
      )
    }
    return null
  }

  // Load persisted similarity results
  useEffect(() => {
    if (selectedFile && typeof window !== "undefined") {
      const cacheKey = `similarity_${selectedFile.fileHash}`
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          setSimilarityResults(parsed)
        } catch {
          // Invalid cache
        }
      }
    }
  }, [selectedFile])

  const checkSimilarity = useCallback(
    async (file: any) => {
      // Prevent self-comparison and duplicate checks
      if (checkingFileRef.current === file.fileHash || isCheckingSimilarity) {
        return
      }

      checkingFileRef.current = file.fileHash
      setIsCheckingSimilarity(true)
      try {
        // Filter out the file itself from comparison
        const otherFiles = files.filter((f) => f.fileHash !== file.fileHash)
        const results = await calculateFileSimilarity(file, otherFiles)
        const topResults = results.slice(0, 5)

        setSimilarityResults(topResults)
        setSelectedFile(file)

        // Persist results
        if (typeof window !== "undefined") {
          const cacheKey = `similarity_${file.fileHash}`
          sessionStorage.setItem(cacheKey, JSON.stringify(topResults))
        }
      } catch (error) {
        console.error("Similarity check failed:", error)
      } finally {
        setIsCheckingSimilarity(false)
        checkingFileRef.current = null
      }
    },
    [files, isCheckingSimilarity],
  )

  // Throttled similarity check
  const throttledCheckSimilarity = useThrottle(checkSimilarity, 2000)

  const isImage = (file: any) => {
    return file.fileData?.metadata?.mimeType?.startsWith("image/")
  }

  const isVideo = (file: any) => {
    return file.fileData?.metadata?.mimeType?.startsWith("video/")
  }

  const isAudio = (file: any) => {
    return file.fileData?.metadata?.mimeType?.startsWith("audio/")
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gallery</h1>
          <p className="text-muted-foreground">Visual preview of your creative assets</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <Card className="p-12 text-center">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-2">No files found</p>
          <p className="text-sm text-muted-foreground mb-4">
            Upload images, videos, or audio assets to visualize them here.
          </p>
          <Button onClick={() => router.push("/files?action=upload")}>Upload Files</Button>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file, index) => (
            <Card key={index} className="cursor-pointer tile-hover">
              <CardContent className="p-0">
                {getFilePreview(file) || (
                  <div className="h-48 bg-secondary/50 flex items-center justify-center">
                    {getFileIcon(file)}
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold truncate">{file.versionNote || "Unnamed"}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {file.timestamp.toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {file.transactionHash && (
                      <Badge variant="default" className="text-xs">Verified</Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        throttledCheckSimilarity(file)
                      }}
                      disabled={isCheckingSimilarity}
                    >
                      {isCheckingSimilarity && checkingFileRef.current === file.fileHash
                        ? "Checking..."
                        : "Check Similarity"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map((file, index) => (
            <Card key={index} className="cursor-pointer tile-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {isImage(file) && file.fileData?.data ? (
                    <img
                      src={file.fileData.data}
                      alt={file.versionNote || "Preview"}
                      className="w-24 h-24 object-cover rounded cursor-pointer"
                      onClick={() => {
                        setSelectedFile(file)
                        setPreviewOpen(true)
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 bg-secondary/50 flex items-center justify-center rounded">
                      {getFileIcon(file)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{file.versionNote || "Unnamed"}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {file.timestamp.toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      {file.fileHash.slice(0, 16)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.transactionHash && (
                      <Badge variant="default" className="text-xs">Verified</Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        checkSimilarity(file)
                      }}
                    >
                      Check Similarity
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedFile && (
        <ErrorBoundary
          fallback={
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive opacity-50" />
                <p className="text-sm text-muted-foreground">
                  Failed to load similarity results. Please try again.
                </p>
              </CardContent>
            </Card>
          }
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>AI Similarity Detection</CardTitle>
                <Badge variant="secondary" className="text-xs">Beta</Badge>
              </div>
              <CardDescription>Similar files found for: {selectedFile.versionNote || "Unnamed"}</CardDescription>
            </CardHeader>
            <CardContent>
            {isCheckingSimilarity ? (
              <p className="text-muted-foreground">Analyzing file for similarities...</p>
            ) : similarityResults.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <p>No similar files found. This appears to be unique.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-yellow-600">
                  <AlertCircle className="h-5 w-5" />
                  <p>Found {similarityResults.length} potentially similar file(s)</p>
                </div>
                {similarityResults.map((result, idx) => {
                  const category = result.category || getSimilarityCategory(result.similarity)
                  const categoryColors = {
                    duplicate: "destructive",
                    "highly-similar": "default",
                    "possibly-related": "secondary",
                    unrelated: "outline",
                  } as const
                  const categoryLabels = {
                    duplicate: "Duplicate",
                    "highly-similar": "Highly Similar",
                    "possibly-related": "Possibly Related",
                    unrelated: "Unrelated",
                  } as const

                  return (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-medium">{result.file.versionNote || "Unnamed"}</p>
                          <p className="text-sm text-muted-foreground">
                            {result.file.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={categoryColors[category]}>
                            {result.similarity.toFixed(1)}%
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {categoryLabels[category]}
                          </Badge>
                        </div>
                      </div>
                      {result.reasons && result.reasons.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {result.reasons.map((reason, rIdx) => (
                            <Badge key={rIdx} variant="outline" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
        </ErrorBoundary>
      )}

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedFile?.versionNote || "Preview"}</DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <ErrorBoundary
              fallback={
                <div className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    Failed to load media preview. The file may be corrupted or unavailable.
                  </p>
                </div>
              }
            >
              <div className="mt-4">
                {isImage(selectedFile) && selectedFile.fileData?.data && (
                  <img
                    src={selectedFile.fileData.data}
                    alt={selectedFile.versionNote || "Preview"}
                    className="w-full h-auto rounded"
                    onError={() => {
                      setImageErrors((prev) => new Set(prev).add(selectedFile.fileHash))
                    }}
                  />
                )}
                {isVideo(selectedFile) && selectedFile.fileData?.data && (
                  <video
                    src={selectedFile.fileData.data}
                    controls
                    className="w-full h-auto rounded"
                  />
                )}
                {isAudio(selectedFile) && selectedFile.fileData?.data && (
                  <div className="flex items-center justify-center p-8">
                    <audio src={selectedFile.fileData.data} controls className="w-full" />
                  </div>
                )}
              </div>
            </ErrorBoundary>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


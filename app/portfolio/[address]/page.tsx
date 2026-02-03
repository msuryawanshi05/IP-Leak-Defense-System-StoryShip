"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getVersionCheckpoints } from "@/lib/blockchain"
import { getIPAssets } from "@/lib/story-protocol"
import { Shield, FileText, Activity, ExternalLink, Copy, CheckCircle2, Lock, AlertCircle } from "lucide-react"
import Navigation from "@/components/navigation"
import { formatAddress } from "@/lib/utils"
import { ROUTES } from "@/lib/routes"
import Link from "next/link"

export default function PortfolioPage() {
  const params = useParams()
  const address = params.address as string

  // Validate address format
  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {isValidAddress ? (
        <PortfolioBody address={address} />
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive opacity-50" />
            <h2 className="text-2xl font-bold mb-2">Invalid Portfolio Address</h2>
            <p className="text-muted-foreground mb-4">
              The wallet address format is invalid. Please check the URL and try again.
            </p>
            <Link href={ROUTES.Dashboard}>
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
          </Card>
        </div>
      )}
    </div>
  )
}

function PortfolioBody({ address }: { address: string }) {
  const [files, setFiles] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoize portfolio data with caching
  const portfolioData = useMemo(() => {
    if (typeof window === "undefined") return null

    const cacheKey = `portfolio_cache_${address}`
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        const cacheTime = parsed.timestamp || 0
        const now = Date.now()
        // Cache for 5 minutes
        if (now - cacheTime < 5 * 60 * 1000) {
          return parsed.data
        }
      } catch {
        // Invalid cache, continue
      }
    }
    return null
  }, [address])

  useEffect(() => {
    const loadPortfolio = () => {
      try {
        // Check cache first
        if (portfolioData) {
          setFiles(portfolioData.files || [])
          setAssets(portfolioData.assets || [])
          setIsLoading(false)
          return
        }

        // Check if portfolio is public
        if (typeof window !== "undefined") {
          const visibility = localStorage.getItem(`portfolio_visibility_${address}`)
          if (visibility === "private") {
            setIsPrivate(true)
            setIsLoading(false)
            return
          }
        }

        const checkpoints = getVersionCheckpoints(address)
        const ipAssets = getIPAssets(address)

        const loadedFiles = checkpoints.map((cp: any) => {
          let fileSize = 0
          let fileName = cp.versionNote || "Untitled"
          try {
            if (typeof window !== "undefined") {
              const stored = localStorage.getItem(`file_${cp.fileHash}`)
              if (stored) {
                const fileData = JSON.parse(stored)
                fileSize = fileData.metadata?.size || 0
                fileName = fileData.name || fileName
              }
            }
          } catch {
            // ignore
          }

          return {
            ...cp,
            fileName,
            fileSize,
            timestamp: new Date(cp.timestamp * 1000),
          }
        })

        const sortedFiles = loadedFiles.reverse()
        const sortedAssets = ipAssets.reverse()

        setFiles(sortedFiles)
        setAssets(sortedAssets)

        // Cache the data
        if (typeof window !== "undefined") {
          const cacheKey = `portfolio_cache_${address}`
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({
              timestamp: Date.now(),
              data: {
                files: sortedFiles,
                assets: sortedAssets,
              },
            }),
          )
        }
      } catch (error) {
        console.error("Failed to load portfolio:", error)
        setError("Failed to load portfolio data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadPortfolio()
  }, [address, portfolioData])

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Portfolio</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isPrivate) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Private Portfolio</h2>
          <p className="text-muted-foreground mb-4">
            This portfolio is set to private and cannot be viewed publicly.
          </p>
          <Link href={ROUTES.Dashboard}>
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Your Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Public Portfolio</h1>
          <div className="flex items-center gap-3">
            <p className="text-muted-foreground font-mono">{formatAddress(address, 8)}</p>
            <Button variant="ghost" size="sm" onClick={copyAddress}>
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
        <Link href={ROUTES.Dashboard}>
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Your Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IP Assets</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Chain</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {files.filter((f) => f.transactionHash).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Files</CardTitle>
          <CardDescription>Latest uploaded files</CardDescription>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">No files found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.slice(0, 10).map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.fileName}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      {file.fileHash.slice(0, 16)}...
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {file.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.transactionHash && (
                      <Badge variant="default" className="text-xs">Verified</Badge>
                    )}
                    {file.ipAssetId && (
                      <Badge variant="secondary" className="text-xs">IP Asset</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>IP Assets</CardTitle>
          <CardDescription>Registered intellectual property assets</CardDescription>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">No IP Assets found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {assets.slice(0, 10).map((asset, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">
                      {asset.metadata?.name || `IP Asset ${asset.ipAssetId}`}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      ID: {asset.ipAssetId}
                    </p>
                    {asset.registeredAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Registered: {new Date(asset.registeredAt * 1000).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {asset.transactionHash && (
                    <Badge variant="default" className="text-xs">On-Chain</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


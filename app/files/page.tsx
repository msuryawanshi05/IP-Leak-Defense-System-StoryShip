"use client"

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import FileUpload from "@/components/file-upload"
import BatchOperations from "@/components/batch-operations"
import SearchFilter, { type FilterOptions } from "@/components/search-filter"
import VersionTimeline from "@/components/version-timeline"
import { getVersionCheckpoints } from "@/lib/blockchain"
import { Upload } from "lucide-react"
import Navigation from "@/components/navigation"
import { WalletGate } from "@/components/wallet-gate"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb"

export default function FilesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <WalletGate
        title="Connect your wallet"
        description="Link your wallet to upload files and manage checkpoints."
      >
        {(address) => (
          <Suspense fallback={<PageFallback />}>
            <FilesBody address={address} />
          </Suspense>
        )}
      </WalletGate>
    </div>
  )
}

function PageFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Preparing your files dashboard...</p>
      </Card>
    </div>
  )
}

function FilesBody({ address }: { address: string }) {
  const searchParams = useSearchParams()
  const initialAction = searchParams.get("action")
  const [versions, setVersions] = useState<any[]>([])
  const [showUpload, setShowUpload] = useState(initialAction === "upload")
  const [showBatch, setShowBatch] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterOptions>({})
  const [sortBy, setSortBy] = useState("newest")
  const [filteredVersions, setFilteredVersions] = useState<any[]>([])

  useEffect(() => {
    const loadVersions = () => {
      try {
        const checkpoints = getVersionCheckpoints(address)
        const loadedVersions = checkpoints.map((checkpoint: any, index: number) => {
          let fileSize = 0
          try {
            if (typeof window !== "undefined") {
              const stored = localStorage.getItem(`file_${checkpoint.fileHash}`)
              if (stored) {
                const fileData = JSON.parse(stored)
                fileSize = fileData.metadata?.size || 0
              }
            }
          } catch (e) {
            // Ignore
          }

          return {
            id: index,
            name: checkpoint.versionNote || "Unnamed Version",
            hash: checkpoint.fileHash,
            timestamp: new Date(checkpoint.timestamp * 1000),
            author: checkpoint.author,
            notes: checkpoint.versionNote,
            size: fileSize,
            ipfsCid: checkpoint.ipfsCid,
            transactionHash: checkpoint.transactionHash,
            blockNumber: checkpoint.blockNumber,
            encryptedHash: checkpoint.encryptedHash,
            ipAssetId: checkpoint.ipAssetId,
          }
        })
        setVersions(loadedVersions.reverse())
        setFilteredVersions(loadedVersions)
        applyFilters(loadedVersions, "", {})
      } catch (error) {
        console.error("Failed to load versions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadVersions()
  }, [address])

  const applyFilters = (versionsToFilter: any[], query: string, filterOptions: FilterOptions) => {
    if (!versionsToFilter || versionsToFilter.length === 0) {
      setFilteredVersions([])
      return
    }

    let filtered = [...versionsToFilter]

    if (query.trim()) {
      const lowerQuery = query.toLowerCase()
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(lowerQuery) ||
          v.hash.toLowerCase().includes(lowerQuery) ||
          v.ipAssetId?.toLowerCase().includes(lowerQuery) ||
          v.transactionHash?.toLowerCase().includes(lowerQuery),
      )
    }

    if (filterOptions.type) {
      const fileExtension = filterOptions.type.toLowerCase()
      filtered = filtered.filter((v) => {
        const ext = v.name.split(".").pop()?.toLowerCase()
        return ext === fileExtension
      })
    }

    if (filterOptions.dateFrom) {
      const fromDate = new Date(filterOptions.dateFrom)
      filtered = filtered.filter((v) => v.timestamp >= fromDate)
    }

    if (filterOptions.dateTo) {
      const toDate = new Date(filterOptions.dateTo)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter((v) => v.timestamp <= toDate)
    }

    if (filterOptions.status) {
      if (filterOptions.status === "verified") {
        filtered = filtered.filter((v) => v.transactionHash && v.ipAssetId)
      } else if (filterOptions.status === "pending") {
        filtered = filtered.filter((v) => !v.transactionHash || !v.ipAssetId)
      }
    }

    switch (sortBy) {
      case "oldest":
        filtered.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        break
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "size":
        filtered.sort((a, b) => (b.size || 0) - (a.size || 0))
        break
      case "newest":
      default:
        filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        break
    }

    setFilteredVersions(filtered)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    applyFilters(versions, query, filters)
  }

  const handleFilter = (filterOptions: FilterOptions) => {
    setFilters(filterOptions)
    applyFilters(versions, searchQuery, filterOptions)
  }

  const handleSort = (sort: string) => {
    setSortBy(sort)
    applyFilters(versions, searchQuery, filters)
  }

  const handleFileUploaded = (newVersion: any) => {
    setVersions([newVersion, ...versions])
    setShowUpload(false)
    setTimeout(() => window.location.reload(), 1000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink>Files</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-3xl font-bold mt-2">Files</h1>
          <p className="text-muted-foreground">Manage and track versions of your creative works</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            setShowBatch(!showBatch)
            setShowUpload(false)
          }}>
            <Upload className="mr-2 h-4 w-4" />
            Batch Upload
          </Button>
          <Button onClick={() => {
            setShowUpload(!showUpload)
            setShowBatch(false)
          }}>
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </Button>
        </div>
      </div>

        <SearchFilter onSearch={handleSearch} onFilter={handleFilter} onSort={handleSort} />

        {showUpload && (
          <Card>
            <CardHeader>
              <CardTitle>Upload New File</CardTitle>
              <CardDescription>Create a new version checkpoint for your creative work</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload address={address} onUploaded={handleFileUploaded} />
            </CardContent>
          </Card>
        )}

        {showBatch && (
          <BatchOperations
            address={address}
            onComplete={() => {
              setShowBatch(false)
              window.location.reload()
            }}
          />
        )}

        {isLoading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Loading files...</p>
          </Card>
        ) : filteredVersions.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              {versions.length === 0 ? "No files uploaded yet" : "No files match your search/filters"}
            </p>
            {versions.length === 0 ? (
              <Button onClick={() => setShowUpload(true)}>Upload Your First File</Button>
            ) : (
              <Button variant="outline" onClick={() => { setSearchQuery(""); setFilters({}); applyFilters(versions, "", {}) }}>
                Clear Filters
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {filteredVersions.length} File{filteredVersions.length !== 1 ? "s" : ""}
                {filteredVersions.length !== versions.length && ` of ${versions.length}`}
              </h3>
            </div>
            <VersionTimeline versions={filteredVersions} />
          </div>
        )}
    </div>
  )
}

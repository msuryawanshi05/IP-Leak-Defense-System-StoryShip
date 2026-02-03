"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import FileUpload from "@/components/file-upload"
import VersionTimeline from "@/components/version-timeline"
import SearchFilter, { type FilterOptions } from "@/components/search-filter"
import BatchOperations from "@/components/batch-operations"
import IPAssetShare from "@/components/ip-asset-share"
import IPLicenseManager from "@/components/ip-license-manager"
import { getVersionCheckpoints } from "@/lib/blockchain"
import { getIPAssets, type IPAsset } from "@/lib/story-protocol"
import { exportToJSON, exportToCSV, generateOwnershipCertificate, downloadCertificate, type ExportData } from "@/lib/export"
import {
  Upload,
  FileText,
  Shield,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Download,
  Share2,
  Eye,
  HardDrive,
  Network,
  BarChart3,
} from "lucide-react"
import { Area, AreaChart, Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Cell, Legend } from "recharts"

interface DashboardProps {
  address: string | null
}

interface DashboardStats {
  totalFiles: number
  totalIPAssets: number
  totalTransactions: number
  totalStorage: number
  verifiedAssets: number
  pendingAssets: number
}

interface ActivityItem {
  id: string
  type: "upload" | "transaction" | "ip_asset" | "version"
  title: string
  description: string
  timestamp: Date
  status: "success" | "pending" | "failed"
  hash?: string
}

export default function Dashboard({ address }: DashboardProps) {
  const [versions, setVersions] = useState<any[]>([])
  const [ipAssets, setIPAssets] = useState<IPAsset[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalFiles: 0,
    totalIPAssets: 0,
    totalTransactions: 0,
    totalStorage: 0,
    verifiedAssets: 0,
    pendingAssets: 0,
  })
  const [showUpload, setShowUpload] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterOptions>({})
  const [sortBy, setSortBy] = useState("newest")
  const [filteredVersions, setFilteredVersions] = useState<any[]>([])
  const [showBatchUpload, setShowBatchUpload] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (!address) return

      try {
        // Load versions
        const checkpoints = getVersionCheckpoints(address)
        const loadedVersions = checkpoints.map((checkpoint: any, index: number) => {
          // Try to get file size from stored file
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
            // Ignore errors, use 0
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

        // Load IP Assets
        const assets = getIPAssets(address)
        setIPAssets(assets)

        // Calculate stats
        const totalStorage = loadedVersions.reduce((sum: number, v: any) => sum + (v.size || 0), 0)
        const verifiedAssets = loadedVersions.filter((v: any) => v.transactionHash && v.ipAssetId).length
        const pendingAssets = loadedVersions.length - verifiedAssets

        setStats({
          totalFiles: loadedVersions.length,
          totalIPAssets: assets.length,
          totalTransactions: loadedVersions.filter((v: any) => v.transactionHash).length,
          totalStorage: totalStorage,
          verifiedAssets,
          pendingAssets,
        })

        // Build activity feed
        const activities: ActivityItem[] = []

        loadedVersions.forEach((version: any) => {
          activities.push({
            id: `upload-${version.id}`,
            type: "upload",
            title: `File uploaded: ${version.name}`,
            description: `Hash: ${version.hash.slice(0, 16)}...`,
            timestamp: version.timestamp,
            status: version.transactionHash ? "success" : "pending",
            hash: version.hash,
          })

          if (version.transactionHash) {
            activities.push({
              id: `tx-${version.id}`,
              type: "transaction",
              title: "Transaction confirmed",
              description: `Block: ${version.blockNumber || "N/A"}`,
              timestamp: version.timestamp,
              status: "success",
              hash: version.transactionHash,
            })
          }

          if (version.ipAssetId) {
            activities.push({
              id: `ip-${version.id}`,
              type: "ip_asset",
              title: "IP Asset registered",
              description: `IP Asset ID: ${version.ipAssetId}`,
              timestamp: version.timestamp,
              status: "success",
              hash: version.ipAssetId,
            })
          }
        })

        // Sort by timestamp (newest first) and take top 10
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        setRecentActivity(activities.slice(0, 10))

        // Initialize filtered versions
        setFilteredVersions(loadedVersions)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [address])

  const handleFileUploaded = (newVersion: any) => {
    setVersions([newVersion, ...versions])
    setShowUpload(false)
    // Reload data
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const applyFilters = (versionsToFilter: any[], query: string, filterOptions: FilterOptions) => {
    if (!versionsToFilter || versionsToFilter.length === 0) {
      setFilteredVersions([])
      return
    }
    let filtered = [...versionsToFilter]

    // Apply search query
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

    // Apply filters
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

    // Apply sorting
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

  const handleExportPortfolio = async () => {
    const exportData: ExportData = {
      address: address || "",
      stats,
      versions: versions.map((v) => ({
        name: v.name,
        hash: v.hash,
        timestamp: v.timestamp.toISOString(),
        transactionHash: v.transactionHash,
        ipAssetId: v.ipAssetId,
        size: v.size || 0,
      })),
      ipAssets: ipAssets.map((a) => ({
        ipAssetId: a.ipAssetId,
        fileHash: a.fileHash,
        registeredAt: a.registeredAt,
        transactionHash: a.transactionHash,
      })),
      exportedAt: new Date().toISOString(),
    }

    exportToJSON(exportData)
  }

  const handleExportCSV = () => {
    const exportData: ExportData = {
      address: address || "",
      stats,
      versions: versions.map((v) => ({
        name: v.name,
        hash: v.hash,
        timestamp: v.timestamp.toISOString(),
        transactionHash: v.transactionHash,
        ipAssetId: v.ipAssetId,
        size: v.size || 0,
      })),
      ipAssets: [],
      exportedAt: new Date().toISOString(),
    }

    exportToCSV(exportData)
  }

  const handleGenerateCertificate = async (asset: IPAsset) => {
    const html = await generateOwnershipCertificate(
      asset.ipAssetId,
      asset.owner,
      asset.fileHash,
      asset.registeredAt,
    )
    downloadCertificate(html, `certificate-${asset.ipAssetId}.html`)
  }

  const formatStorage = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Analytics data
  const uploadFrequencyData = (() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        uploads: 0,
      }
    })

    versions.forEach((version) => {
      const versionDate = new Date(version.timestamp)
      const daysAgo = Math.floor((Date.now() - versionDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysAgo >= 0 && daysAgo < 30) {
        last30Days[29 - daysAgo].uploads++
      }
    })

    return last30Days
  })()

  const filesByTypeData = (() => {
    const typeMap: Record<string, number> = {}
    versions.forEach((version) => {
      const type = version.name.split(".").pop()?.toUpperCase() || "UNKNOWN"
      typeMap[type] = (typeMap[type] || 0) + 1
    })
    return Object.entries(typeMap).map(([name, value]) => ({ name, value }))
  })()

  const storageBreakdownData = (() => {
    const typeMap: Record<string, number> = {}
    versions.forEach((version) => {
      const type = version.name.split(".").pop()?.toUpperCase() || "UNKNOWN"
      typeMap[type] = (typeMap[type] || 0) + (version.size || 0)
    })
    return Object.entries(typeMap).map(([name, value]) => ({ name, value: Math.round(value / 1024) }))
  })()

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444"]


  if (isLoading) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Manage your IP portfolio and track your creative works</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBatchUpload(!showBatchUpload)}>
            <Upload className="mr-2 h-4 w-4" />
            Batch Upload
          </Button>
          <Button onClick={() => setShowUpload(!showUpload)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload File
        </Button>
        </div>
      </div>

      {/* Statistics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFiles}</div>
            <p className="text-xs text-muted-foreground">Creative works uploaded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IP Assets</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIPAssets}</div>
            <p className="text-xs text-muted-foreground">
              {stats.verifiedAssets} verified, {stats.pendingAssets} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">On-chain records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatStorage(stats.totalStorage)}</div>
            <p className="text-xs text-muted-foreground">Total file size</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <SearchFilter onSearch={handleSearch} onFilter={handleFilter} onSort={handleSort} />

      {/* Upload Section */}
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

      {/* Batch Upload Section */}
      {showBatchUpload && (
        <BatchOperations
          address={address}
          onComplete={() => {
            setShowBatchUpload(false)
            window.location.reload()
          }}
        />
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="files">All Files</TabsTrigger>
          <TabsTrigger value="ip-assets">IP Assets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Recent Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest uploads and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="p-2 bg-primary/10 rounded mt-0.5">
                          {activity.type === "upload" && <Upload className="h-4 w-4 text-primary" />}
                          {activity.type === "transaction" && <Activity className="h-4 w-4 text-primary" />}
                          {activity.type === "ip_asset" && <Shield className="h-4 w-4 text-primary" />}
                          {activity.type === "version" && <FileText className="h-4 w-4 text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatDate(activity.timestamp)}</p>
                        </div>
                        {activity.status === "success" ? (
                          <Badge variant="default" className="gap-1 shrink-0">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 shrink-0">
                            <AlertCircle className="h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Section */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto flex-col py-4" onClick={() => setShowUpload(true)}>
                    <Upload className="h-5 w-5 mb-2" />
                    <span className="text-sm">Upload File</span>
                  </Button>
                  <Button variant="outline" className="h-auto flex-col py-4" onClick={() => setActiveTab("ip-assets")}>
                    <Eye className="h-5 w-5 mb-2" />
                    <span className="text-sm">Verify File</span>
                  </Button>
                  <Button variant="outline" className="h-auto flex-col py-4" onClick={() => setActiveTab("ip-assets")}>
                    <Shield className="h-5 w-5 mb-2" />
                    <span className="text-sm">View IP Assets</span>
                  </Button>
                  <Button variant="outline" className="h-auto flex-col py-4" onClick={handleExportPortfolio}>
                    <Download className="h-5 w-5 mb-2" />
                    <span className="text-sm">Export JSON</span>
                  </Button>
                  <Button variant="outline" className="h-auto flex-col py-4" onClick={handleExportCSV}>
                    <Download className="h-5 w-5 mb-2" />
                    <span className="text-sm">Export CSV</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* IP Portfolio Summary */}
          <Card>
            <CardHeader>
              <CardTitle>IP Portfolio Summary</CardTitle>
              <CardDescription>Your registered intellectual property assets</CardDescription>
            </CardHeader>
            <CardContent>
              {ipAssets.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-2">No IP Assets registered yet</p>
                  <p className="text-sm text-muted-foreground">Upload a file to create your first IP Asset</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {ipAssets.slice(0, 5).map((asset, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">IP Asset #{asset.ipAssetId || index + 1}</p>
                        {asset.metadata?.name && <p className="text-sm text-muted-foreground">{asset.metadata.name}</p>}
                        <p className="text-xs text-muted-foreground font-mono mt-1 truncate">
                          {asset.fileHash?.slice(0, 32)}...
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {asset.transactionHash ? (
                          <Badge variant="default">On-Chain</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab("ip-assets")}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                  {ipAssets.length > 5 && (
                    <Button variant="ghost" className="w-full" onClick={() => setActiveTab("ip-assets")}>
                      View All {ipAssets.length} IP Assets
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>All Files</CardTitle>
              <CardDescription>
                Complete version history of your creative works
                {filteredVersions.length !== versions.length && (
                  <span className="ml-2">
                    ({filteredVersions.length} of {versions.length} shown)
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
      {versions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-2">No files uploaded yet</p>
                  <Button onClick={() => setShowUpload(true)} className="mt-4">
                    Upload Your First File
                  </Button>
                </div>
              ) : filteredVersions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-2">No files match your search/filters</p>
                  <Button variant="outline" onClick={() => { setSearchQuery(""); setFilters({}); applyFilters(versions, "", {}) }}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <VersionTimeline versions={filteredVersions} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* IP Assets Tab */}
        <TabsContent value="ip-assets">
          <Card>
            <CardHeader>
              <CardTitle>IP Assets</CardTitle>
              <CardDescription>All your registered intellectual property assets</CardDescription>
            </CardHeader>
            <CardContent>
              {ipAssets.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-2">No IP Assets registered</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    IP Assets are created automatically when you upload files
                  </p>
                  <Button onClick={() => setShowUpload(true)}>Upload File to Create IP Asset</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {ipAssets.map((asset, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold">IP Asset #{asset.ipAssetId || index + 1}</p>
                          {asset.metadata?.name && <p className="text-sm text-muted-foreground">{asset.metadata.name}</p>}
                        </div>
                        <div className="flex gap-2">
                          {asset.transactionHash ? (
                            <Badge variant="default">Registered</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                          <IPAssetShare ipAssetId={asset.ipAssetId} owner={asset.owner} />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateCertificate(asset)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Certificate
                          </Button>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Hash: </span>
                          <span className="font-mono text-xs">{asset.fileHash?.slice(0, 32)}...</span>
                        </div>
                        {asset.ipfsCid && (
                          <div>
                            <span className="text-muted-foreground">IPFS: </span>
                            <span className="font-mono text-xs">{asset.ipfsCid.slice(0, 20)}...</span>
                          </div>
                        )}
                        {asset.transactionHash && (
                          <div>
                            <span className="text-muted-foreground">Transaction: </span>
                            <span className="font-mono text-xs">{asset.transactionHash.slice(0, 16)}...</span>
                          </div>
                        )}
                        {asset.registeredAt && (
                          <div>
                            <span className="text-muted-foreground">Registered: </span>
                            <span className="text-xs">
                              {new Date(asset.registeredAt * 1000).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      {address && (
                        <IPLicenseManager ipAssetId={asset.ipAssetId} address={address} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics & Insights Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Upload Frequency Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Frequency</CardTitle>
                <CardDescription>File uploads over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                {uploadFrequencyData.some((d) => d.uploads > 0) ? (
                  <ChartContainer
                    config={{
                      uploads: {
                        label: "Uploads",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <AreaChart data={uploadFrequencyData}>
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="uploads"
                        stroke="hsl(var(--chart-1))"
                        fill="hsl(var(--chart-1))"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No upload data available
                  </div>
                )}
              </CardContent>
        </Card>

            {/* Files by Type Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Files by Type</CardTitle>
                <CardDescription>Distribution of file types</CardDescription>
              </CardHeader>
              <CardContent>
                {filesByTypeData.length > 0 ? (
                  <ChartContainer
                    config={filesByTypeData.reduce(
                      (acc, item, index) => ({
                        ...acc,
                        [item.name]: {
                          label: item.name,
                          color: COLORS[index % COLORS.length],
                        },
                      }),
                      {},
                    )}
                    className="h-[300px]"
                  >
                    <PieChart>
                      <Pie
                        data={filesByTypeData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {filesByTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No file type data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Storage Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Storage Breakdown</CardTitle>
              <CardDescription>Storage usage by file type</CardDescription>
            </CardHeader>
            <CardContent>
              {storageBreakdownData.length > 0 ? (
                <ChartContainer
                  config={storageBreakdownData.reduce(
                    (acc, item, index) => ({
                      ...acc,
                      [item.name]: {
                        label: item.name,
                        color: COLORS[index % COLORS.length],
                      },
                    }),
                    {},
                  )}
                  className="h-[300px]"
                >
                  <BarChart data={storageBreakdownData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="hsl(var(--chart-1))" />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No storage data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Network Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Network Activity</CardTitle>
              <CardDescription>Blockchain transaction summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Network className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Transactions</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalTransactions}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.verifiedAssets}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.pendingAssets}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Complete history of all your actions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No activity yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-4 border rounded-lg">
                      <div className="p-2 bg-primary/10 rounded mt-0.5">
                        {activity.type === "upload" && <Upload className="h-4 w-4 text-primary" />}
                        {activity.type === "transaction" && <Activity className="h-4 w-4 text-primary" />}
                        {activity.type === "ip_asset" && <Shield className="h-4 w-4 text-primary" />}
                        {activity.type === "version" && <FileText className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{activity.title}</p>
                          {activity.status === "success" ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        {activity.hash && (
                          <p className="text-xs text-muted-foreground font-mono mt-1 truncate">
                            {activity.hash}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
        </div>
      )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

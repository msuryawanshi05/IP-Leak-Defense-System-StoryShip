"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getVersionCheckpoints } from "@/lib/blockchain"
import { getIPAssets } from "@/lib/story-protocol"
import { Area, AreaChart, Pie, PieChart, XAxis, YAxis, Cell, Bar, BarChart, ResponsiveContainer } from "recharts"
import { TrendingUp, DollarSign, Activity, HardDrive, FileText, Shield, Info } from "lucide-react"
import Navigation from "@/components/navigation"
import { WalletGate } from "@/components/wallet-gate"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <WalletGate
        title="Connect your wallet"
        description="Analyze usage, network fees, and portfolio health once your wallet is active."
      >
        {(address) => <AnalyticsBody address={address} />}
      </WalletGate>
    </div>
  )
}

function AnalyticsBody({ address }: { address: string }) {
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalIPAssets: 0,
    totalTransactions: 0,
    totalStorage: 0,
    estimatedFees: 0,
    verifiedAssets: 0,
    pendingAssets: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [checkpoints, setCheckpoints] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])

  useEffect(() => {
    const loadAnalytics = () => {
      try {
        const checkpoints = getVersionCheckpoints(address)
        const ipAssets = getIPAssets(address)
        setCheckpoints(checkpoints)
        setAssets(ipAssets)

        let totalStorage = 0
        checkpoints.forEach((cp: any) => {
          try {
            if (typeof window !== "undefined") {
              const stored = localStorage.getItem(`file_${cp.fileHash}`)
              if (stored) {
                const fileData = JSON.parse(stored)
                totalStorage += fileData.metadata?.size || 0
              }
            }
          } catch (e) {
            // Ignore
          }
        })

        const verifiedAssets = checkpoints.filter((cp: any) => cp.transactionHash && cp.ipAssetId).length
        // Estimate network fees (mock calculation)
        const estimatedFees = checkpoints.filter((cp: any) => cp.transactionHash).length * 0.001 // ~$0.001 per tx

        setStats({
          totalFiles: checkpoints.length,
          totalIPAssets: ipAssets.length,
          totalTransactions: checkpoints.filter((cp: any) => cp.transactionHash).length,
          totalStorage,
          estimatedFees,
          verifiedAssets,
          pendingAssets: checkpoints.length - verifiedAssets,
        })
      } catch (error) {
        console.error("Failed to load analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [address])

  const uploadFrequencyData = useMemo(() => {
    // Normalize to start of day for consistent bucketing
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - (29 - i))
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        uploads: 0,
        fullDate: date,
      }
    })

    checkpoints.forEach((cp: any) => {
      const cpDate = new Date(cp.timestamp * 1000)
      cpDate.setHours(0, 0, 0, 0)
      const daysAgo = Math.floor((now.getTime() - cpDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysAgo >= 0 && daysAgo < 30) {
        last30Days[29 - daysAgo].uploads++
      }
    })

    return last30Days.map(({ date, uploads }) => ({ date, uploads }))
  }, [checkpoints])

  const filesByTypeData = useMemo(() => {
    const typeMap: Record<string, number> = {}
    checkpoints.forEach((cp: any) => {
      const name = cp.versionNote || ""
      const type = name.split(".").pop()?.toUpperCase() || "UNKNOWN"
      typeMap[type] = (typeMap[type] || 0) + 1
    })
    return Object.entries(typeMap).map(([name, value]) => ({ name, value }))
  }, [checkpoints])

  const storageOverTime = useMemo(() => {
    // Normalize to start of day
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        storage: 0,
        fullDate: date,
      }
    })

    checkpoints.forEach((cp: any) => {
      const cpDate = new Date(cp.timestamp * 1000)
      cpDate.setHours(0, 0, 0, 0)
      const daysAgo = Math.floor((now.getTime() - cpDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysAgo >= 0 && daysAgo < 7) {
        try {
          if (typeof window !== "undefined") {
            const stored = localStorage.getItem(`file_${cp.fileHash}`)
            if (stored) {
              const fileData = JSON.parse(stored)
              last7Days[6 - daysAgo].storage += (fileData.metadata?.size || 0) / (1024 * 1024)
            }
          }
        } catch {
          // ignore
        }
      }
    })

    return last7Days.map(({ date, storage }) => ({ date, storage }))
  }, [checkpoints])

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444"]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">Track your portfolio performance and network activity</p>
      </div>

      {isLoading ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Loading analytics...</p>
        </Card>
      ) : (
        <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalFiles}</div>
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
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium">Network Fees</CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Estimated fees based on transaction count</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.estimatedFees.toFixed(3)}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalTransactions} transactions • Estimated
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(stats.totalStorage / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="usage">Usage Statistics</TabsTrigger>
                <TabsTrigger value="storage">Storage Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
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

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>Files by Type</CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-xs">
                            Distribution of file types based on file extensions. Hover over segments to see exact counts.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
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
              </TabsContent>

              <TabsContent value="usage" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>Activity Over Time</CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-xs">
                            Bar chart showing daily upload activity. Each bar represents one day. Zero-activity days are shown as empty bars.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <CardDescription>File uploads and IP Asset registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={uploadFrequencyData}>
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="uploads" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="storage" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>Storage Growth</CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-xs">
                            Cumulative storage usage in megabytes over the last 7 days. The area chart shows growth trends.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <CardDescription>Storage usage over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {storageOverTime.some((d) => d.storage > 0) ? (
                    <ChartContainer
                      config={{
                        storage: {
                          label: "Storage (MB)",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <AreaChart data={storageOverTime}>
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="storage"
                          stroke="hsl(var(--chart-2))"
                          fill="hsl(var(--chart-2))"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No storage data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}


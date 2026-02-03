import { NextRequest, NextResponse } from "next/server"
import { getVersionCheckpoints } from "@/lib/blockchain"
import { getIPAssets } from "@/lib/story-protocol"

/**
 * GET /api/analytics/[address]
 * Get analytics data for a wallet address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } },
) {
  try {
    const address = params.address
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30d" // 7d, 30d, 90d, all

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 },
      )
    }

    const checkpoints = getVersionCheckpoints(address)
    const ipAssets = getIPAssets(address)

    // Calculate stats
    const verifiedAssets = checkpoints.filter(
      (cp: any) => cp.transactionHash && cp.ipAssetId,
    ).length
    const totalTransactions = checkpoints.filter(
      (cp: any) => cp.transactionHash,
    ).length
    const estimatedFees = totalTransactions * 0.001

    // Calculate storage (mock - would come from database)
    let totalStorage = 0

    // Time-based analytics
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    let daysToInclude = 30
    if (period === "7d") daysToInclude = 7
    else if (period === "90d") daysToInclude = 90
    else if (period === "all") daysToInclude = 365

    const uploadFrequency = Array.from({ length: daysToInclude }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - (daysToInclude - 1 - i))
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        uploads: 0,
      }
    })

    checkpoints.forEach((cp: any) => {
      const cpDate = new Date(cp.timestamp * 1000)
      cpDate.setHours(0, 0, 0, 0)
      const daysAgo = Math.floor((now.getTime() - cpDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysAgo >= 0 && daysAgo < daysToInclude) {
        uploadFrequency[daysToInclude - 1 - daysAgo].uploads++
      }
    })

    // File type distribution
    const fileTypes: Record<string, number> = {}
    checkpoints.forEach((cp: any) => {
      const name = cp.versionNote || ""
      const type = name.split(".").pop()?.toUpperCase() || "UNKNOWN"
      fileTypes[type] = (fileTypes[type] || 0) + 1
    })

    return NextResponse.json({
      address,
      period,
      stats: {
        totalFiles: checkpoints.length,
        totalIPAssets: ipAssets.length,
        totalTransactions,
        totalStorage,
        estimatedFees,
        verifiedAssets,
        pendingAssets: checkpoints.length - verifiedAssets,
      },
      charts: {
        uploadFrequency,
        fileTypes: Object.entries(fileTypes).map(([name, value]) => ({
          name,
          value,
        })),
      },
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 },
    )
  }
}


import { NextRequest, NextResponse } from "next/server"
import { getVersionCheckpoints } from "@/lib/blockchain"
import { getIPAssets } from "@/lib/story-protocol"

/**
 * GET /api/portfolios/[address]
 * Get portfolio data for a wallet address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } },
) {
  try {
    const address = params.address

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 },
      )
    }

    // Check portfolio visibility
    const visibility = request.headers.get("x-portfolio-visibility") || "public"
    // In a real implementation, this would check a database
    // For now, we'll check localStorage equivalent (mock)

    const checkpoints = getVersionCheckpoints(address)
    const ipAssets = getIPAssets(address)

    // Load file metadata
    const files = checkpoints.map((cp: any) => {
      let fileData: any = null
      try {
        // In production, this would come from a database
        // For now, we'll return basic checkpoint data
        fileData = {
          name: cp.versionNote || "Untitled",
          size: 0,
          mimeType: null,
        }
      } catch {
        // Ignore
      }

      return {
        fileHash: cp.fileHash,
        versionNote: cp.versionNote,
        timestamp: cp.timestamp,
        transactionHash: cp.transactionHash,
        ipAssetId: cp.ipAssetId,
        metadata: fileData,
      }
    })

    return NextResponse.json({
      address,
      visibility,
      stats: {
        files: files.length,
        ipAssets: ipAssets.length,
        verified: files.filter((f) => f.transactionHash).length,
      },
      files: files.reverse(),
      ipAssets: ipAssets.reverse(),
    })
  } catch (error) {
    console.error("Portfolio API error:", error)
    return NextResponse.json(
      { error: "Failed to load portfolio" },
      { status: 500 },
    )
  }
}


import { NextRequest, NextResponse } from "next/server"
import { getIPAssets } from "@/lib/story-protocol"

/**
 * GET /api/ip-assets/[assetId]
 * Get IP Asset details by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { assetId: string } },
) {
  try {
    const assetId = params.assetId

    // In a real implementation, this would query a database
    // For now, we'll search through localStorage equivalent
    const allAssets = getIPAssets("") // Get all assets (mock)

    const asset = allAssets.find((a: any) => a.ipAssetId === assetId)

    if (!asset) {
      return NextResponse.json(
        { error: "IP Asset not found" },
        { status: 404 },
      )
    }

    return NextResponse.json({
      assetId: asset.ipAssetId,
      owner: asset.owner,
      metadata: asset.metadata,
      transactionHash: asset.transactionHash,
      registeredAt: asset.registeredAt,
      versions: asset.versions || [],
    })
  } catch (error) {
    console.error("IP Asset API error:", error)
    return NextResponse.json(
      { error: "Failed to load IP Asset" },
      { status: 500 },
    )
  }
}

/**
 * PATCH /api/ip-assets/[assetId]
 * Update IP Asset metadata
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { assetId: string } },
) {
  try {
    const assetId = params.assetId
    const body = await request.json()

    // In a real implementation, this would update a database
    // For now, we'll return a success response

    return NextResponse.json({
      assetId,
      message: "IP Asset updated successfully",
      updated: body,
    })
  } catch (error) {
    console.error("IP Asset update error:", error)
    return NextResponse.json(
      { error: "Failed to update IP Asset" },
      { status: 500 },
    )
  }
}


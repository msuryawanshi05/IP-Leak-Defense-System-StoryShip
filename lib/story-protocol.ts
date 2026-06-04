// Story Protocol IP Asset integration for StoryProof
// Uses @story-protocol/core-sdk for real on-chain registration (Story Odyssey testnet)
// Falls back to local mock when wallet is not on Story network or SDK unavailable

import { ethers } from "ethers"
import { getStoryNetwork, isStoryNetwork, getCurrentNetwork, switchNetwork } from "./contracts"

export interface IPAsset {
  ipAssetId: string
  fileHash: string
  ipfsCid: string
  owner: string
  registeredAt: number
  transactionHash: string
  metadata: {
    name: string
    description: string
    type: string
  }
}

export interface IPLicense {
  licenseId: string
  ipAssetId: string
  terms: string
  commercialUse: boolean
  derivativeWorks: boolean
}

// ── Story Protocol SDK helpers ─────────────────────────────────────────────────

/**
 * Build a Story Protocol SDK client backed by the user's MetaMask wallet.
 * Returns null if the SDK cannot be loaded or wallet is unavailable.
 */
async function buildStoryClient() {
  try {
    // Dynamically import to avoid SSR issues and make it optional
    const { StoryClient, StoryConfig } = await import("@story-protocol/core-sdk")
    const { createWalletClient, custom, http } = await import("viem")
    const { odyssey } = await import("@story-protocol/core-sdk")

    if (typeof window === "undefined" || !window.ethereum) return null

    const walletClient = createWalletClient({
      chain: odyssey,
      transport: custom(window.ethereum),
    })

    const config: typeof StoryConfig = {
      account: walletClient.account,
      transport: http("https://odyssey.storyrpc.io"),
      chainName: "odyssey",
    }

    return StoryClient.newClient(config as any)
  } catch (err) {
    console.warn("[StoryProof] Failed to build Story SDK client:", err)
    return null
  }
}

/**
 * Upload IP metadata JSON to Pinata or return a data-URI fallback
 */
async function uploadIPMetadata(metadata: {
  name: string
  description: string
  type: string
  fileHash: string
  ipfsCid: string
  owner: string
}): Promise<string> {
  const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT
  const metaJson = JSON.stringify({
    name: metadata.name,
    description: metadata.description,
    attributes: [
      { trait_type: "File Type", value: metadata.type },
      { trait_type: "SHA-256 Hash", value: metadata.fileHash },
      { trait_type: "IPFS CID", value: metadata.ipfsCid },
      { trait_type: "Owner", value: metadata.owner },
      { trait_type: "App", value: "StoryProof" },
    ],
  })

  if (pinataJwt) {
    try {
      const blob = new Blob([metaJson], { type: "application/json" })
      const formData = new FormData()
      formData.append("file", blob, `metadata_${metadata.fileHash.slice(0, 8)}.json`)
      formData.append("pinataMetadata", JSON.stringify({ name: `storyproof-meta-${metadata.fileHash.slice(0, 8)}` }))

      const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: { Authorization: `Bearer ${pinataJwt}` },
        body: formData,
      })

      if (res.ok) {
        const { IpfsHash } = await res.json()
        const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud"
        return `${gateway}/ipfs/${IpfsHash}`
      }
    } catch (err) {
      console.warn("[StoryProof] Metadata upload to Pinata failed:", err)
    }
  }

  // Fallback: use a data URI
  return `data:application/json;base64,${btoa(metaJson)}`
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Register an IP Asset on Story Protocol.
 * Tries the real SDK first; falls back to local mock on failure.
 */
export async function registerIPAsset(
  fileHash: string,
  ipfsCid: string,
  metadata: { name: string; description: string; type: string },
  address: string,
): Promise<IPAsset | null> {
  // 1. Check if wallet is available and on Story network
  const chainId = await getCurrentNetwork()
  if (!chainId || !isStoryNetwork(chainId)) {
    // Try to switch
    const storyNetwork = getStoryNetwork()
    const switched = await switchNetwork(storyNetwork.chainId)
    if (!switched) {
      console.info("[StoryProof] Not on Story network — using local fallback registration.")
      return registerIPAssetFallback(fileHash, ipfsCid, metadata, address)
    }
  }

  // 2. Try Story Protocol SDK
  try {
    const client = await buildStoryClient()
    if (!client) {
      return registerIPAssetFallback(fileHash, ipfsCid, metadata, address)
    }

    // Upload NFT + IP metadata
    const nftMetadataUri = await uploadIPMetadata({
      name: metadata.name,
      description: metadata.description,
      type: metadata.type,
      fileHash,
      ipfsCid,
      owner: address,
    })

    // Mint an NFT and register it as an IP Asset in one call using SPG NFT
    const spgNftContract =
      (process.env.NEXT_PUBLIC_SPG_NFT_CONTRACT as `0x${string}`) ||
      "0xd2a4a4Cb40357773b658BECc66A6c165FD9Fc485" // Story Odyssey public SPG NFT

    const response = await (client as any).ipAsset.mintAndRegisterIp({
      spgNftContract,
      ipMetadata: {
        ipMetadataURI: nftMetadataUri,
        ipMetadataHash: `0x${fileHash.slice(0, 64).padStart(64, "0")}` as `0x${string}`,
        nftMetadataURI: nftMetadataUri,
        nftMetadataHash: `0x${fileHash.slice(0, 64).padStart(64, "0")}` as `0x${string}`,
      },
      recipient: address as `0x${string}`,
    })

    const ipAssetId = response.ipId || response.tokenId?.toString() || `ip-${Date.now()}`
    const txHash = response.txHash || response.transactionHash || ""

    const ipAsset: IPAsset = {
      ipAssetId,
      fileHash,
      ipfsCid,
      owner: address,
      registeredAt: Math.floor(Date.now() / 1000),
      transactionHash: txHash,
      metadata,
    }

    // Cache locally
    if (typeof window !== "undefined") {
      const assets = JSON.parse(localStorage.getItem(`ip_assets_${address}`) || "[]")
      assets.push(ipAsset)
      localStorage.setItem(`ip_assets_${address}`, JSON.stringify(assets))
    }

    console.log("[StoryProof] IP Asset registered on-chain:", { ipAssetId, txHash })
    return ipAsset
  } catch (error: any) {
    console.error("[StoryProof] Story Protocol SDK registration failed:", error?.message || error)
    return registerIPAssetFallback(fileHash, ipfsCid, metadata, address)
  }
}

// ── Fallback (local mock) ─────────────────────────────────────────────────────

async function registerIPAssetFallback(
  fileHash: string,
  ipfsCid: string,
  metadata: { name: string; description: string; type: string },
  address: string,
): Promise<IPAsset> {
  const mockTxHash = `0x${Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("")}`

  const ipAsset: IPAsset = {
    ipAssetId: `ip-${Date.now()}`,
    fileHash,
    ipfsCid,
    owner: address,
    registeredAt: Math.floor(Date.now() / 1000),
    transactionHash: mockTxHash,
    metadata,
  }

  if (typeof window !== "undefined") {
    const assets = JSON.parse(localStorage.getItem(`ip_assets_${address}`) || "[]")
    assets.push(ipAsset)
    localStorage.setItem(`ip_assets_${address}`, JSON.stringify(assets))
  }

  return ipAsset
}

// ── Read helpers ─────────────────────────────────────────────────────────────

export function getIPAssets(address: string): IPAsset[] {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem(`ip_assets_${address}`) || "[]")
}

export async function verifyIPAssetOwnership(ipAssetId: string, address: string): Promise<boolean> {
  // For on-chain assets, we trust the SDK result; for local mock, check localStorage
  const assets = getIPAssets(address)
  return assets.some((a) => a.ipAssetId === ipAssetId && a.owner === address)
}

// ── PIL License ──────────────────────────────────────────────────────────────

export async function createIPLicense(
  ipAssetId: string,
  terms: {
    commercialUse: boolean
    derivativeWorks: boolean
    attributionRequired: boolean
    royaltyPercentage?: number
  },
  address: string,
): Promise<IPLicense | null> {
  try {
    const license: IPLicense = {
      licenseId: `license-${Date.now()}`,
      ipAssetId,
      terms: JSON.stringify(terms),
      commercialUse: terms.commercialUse,
      derivativeWorks: terms.derivativeWorks,
    }

    if (typeof window !== "undefined") {
      const licenses = JSON.parse(localStorage.getItem(`ip_licenses_${address}`) || "[]")
      licenses.push(license)
      localStorage.setItem(`ip_licenses_${address}`, JSON.stringify(licenses))
    }

    return license
  } catch (error) {
    console.error("[StoryProof] Failed to create IP License:", error)
    return null
  }
}

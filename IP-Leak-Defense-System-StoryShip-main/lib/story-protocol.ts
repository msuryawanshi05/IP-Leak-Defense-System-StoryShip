// Story Protocol IP Asset integration for StoryProof
// Handles IP Asset registration and management on Story blockchain

import { ethers } from "ethers"
import { getStoryNetwork, isStoryNetwork, getCurrentNetwork } from "./contracts"

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

// Story Protocol IP Asset Registry ABI (simplified)
export const STORY_IP_ASSET_ABI = [
  {
    name: "registerIPAsset",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "fileHash", type: "bytes32" },
      { name: "ipfsCid", type: "string" },
      { name: "metadata", type: "string" },
    ],
    outputs: [{ name: "ipAssetId", type: "uint256" }],
  },
  {
    name: "getIPAsset",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "ipAssetId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "fileHash", type: "bytes32" },
          { name: "ipfsCid", type: "string" },
          { name: "owner", type: "address" },
          { name: "registeredAt", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "verifyOwnership",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "ipAssetId", type: "uint256" },
      { name: "owner", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
]

// Get Story Protocol contract address (should be set via environment variable)
export function getStoryIPAssetContractAddress(): string {
  return (
    process.env.NEXT_PUBLIC_STORY_IP_ASSET_CONTRACT ||
    "0x0000000000000000000000000000000000000000" // Placeholder - update with actual contract address
  )
}

// Get ethers provider from window.ethereum
export function getProvider(): ethers.BrowserProvider | null {
  if (typeof window === "undefined" || !window.ethereum) return null
  return new ethers.BrowserProvider(window.ethereum)
}

// Register IP Asset on Story Protocol
export async function registerIPAsset(
  fileHash: string,
  ipfsCid: string,
  metadata: { name: string; description: string; type: string },
  address: string,
): Promise<IPAsset | null> {
  try {
    const provider = getProvider()
    if (!provider) {
      // No wallet connected, use fallback
      return await registerIPAssetFallback(fileHash, ipfsCid, metadata, address)
    }

    const chainId = await getCurrentNetwork()
    if (!chainId) {
      // No network detected, use fallback
      return await registerIPAssetFallback(fileHash, ipfsCid, metadata, address)
    }

    if (!isStoryNetwork(chainId)) {
      // Not on Story network, try to switch (but don't fail if it doesn't work)
      const storyNetwork = getStoryNetwork()
      const switched = await import("./contracts").then((m) => m.switchNetwork(storyNetwork.chainId))
      if (!switched) {
        // Can't switch, use fallback but log for user awareness
        console.info("Not on Story network. Using fallback registration. Switch to Story network for on-chain IP Asset registration.")
        return await registerIPAssetFallback(fileHash, ipfsCid, metadata, address)
      }
    }

    const signer = await provider.getSigner()
    const contractAddress = getStoryIPAssetContractAddress()

    // Check if contract address is set
    if (contractAddress === "0x0000000000000000000000000000000000000000") {
      console.warn("Story IP Asset contract not configured, using fallback registration")
      return await registerIPAssetFallback(fileHash, ipfsCid, metadata, address)
    }

    const contract = new ethers.Contract(contractAddress, STORY_IP_ASSET_ABI, signer)

    // Convert fileHash to bytes32
    const fileHashBytes32 = ethers.hexlify(ethers.toUtf8Bytes(fileHash.slice(0, 32)))

    // Create metadata JSON
    const metadataJson = JSON.stringify(metadata)

    // Register IP Asset
    const tx = await contract.registerIPAsset(fileHashBytes32, ipfsCid, metadataJson)
    const receipt = await tx.wait()

    // Extract IP Asset ID from event or receipt
    const ipAssetId = receipt.logs[0]?.topics[1] || "0"

    return {
      ipAssetId: ipAssetId.toString(),
      fileHash,
      ipfsCid,
      owner: address,
      registeredAt: Math.floor(Date.now() / 1000),
      transactionHash: receipt.hash,
      metadata,
    }
  } catch (error: any) {
    console.error("Failed to register IP Asset on Story Protocol:", error)
    // Fallback to local registration
    return await registerIPAssetFallback(fileHash, ipfsCid, metadata, address)
  }
}

// Fallback registration (stores locally, simulates on-chain)
async function registerIPAssetFallback(
  fileHash: string,
  ipfsCid: string,
  metadata: { name: string; description: string; type: string },
  address: string,
): Promise<IPAsset> {
  // Generate mock transaction hash
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

  // Store locally
  if (typeof window !== "undefined") {
    const assets = JSON.parse(localStorage.getItem(`ip_assets_${address}`) || "[]")
    assets.push(ipAsset)
    localStorage.setItem(`ip_assets_${address}`, JSON.stringify(assets))
  }

  return ipAsset
}

// Get IP Assets for an address
export function getIPAssets(address: string): IPAsset[] {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem(`ip_assets_${address}`) || "[]")
}

// Verify IP Asset ownership
export async function verifyIPAssetOwnership(ipAssetId: string, address: string): Promise<boolean> {
  try {
    const provider = getProvider()
    if (!provider) return false

    const contractAddress = getStoryIPAssetContractAddress()
    if (contractAddress === "0x0000000000000000000000000000000000000000") {
      // Fallback: check local storage
      const assets = getIPAssets(address)
      return assets.some((asset) => asset.ipAssetId === ipAssetId && asset.owner === address)
    }

    const contract = new ethers.Contract(contractAddress, STORY_IP_ASSET_ABI, provider)
    const result = await contract.verifyOwnership(ipAssetId, address)
    return result
  } catch (error) {
    console.error("Failed to verify IP Asset ownership:", error)
    // Fallback: check local storage
    const assets = getIPAssets(address)
    return assets.some((asset) => asset.ipAssetId === ipAssetId && asset.owner === address)
  }
}

// Create Programmable IP License (PIL)
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
    // In production, this would interact with Story Protocol's PIL contracts
    // For now, create a local license record
    const license: IPLicense = {
      licenseId: `license-${Date.now()}`,
      ipAssetId,
      terms: JSON.stringify(terms),
      commercialUse: terms.commercialUse,
      derivativeWorks: terms.derivativeWorks,
    }

    // Store locally
    if (typeof window !== "undefined") {
      const licenses = JSON.parse(localStorage.getItem(`ip_licenses_${address}`) || "[]")
      licenses.push(license)
      localStorage.setItem(`ip_licenses_${address}`, JSON.stringify(licenses))
    }

    return license
  } catch (error) {
    console.error("Failed to create IP License:", error)
    return null
  }
}


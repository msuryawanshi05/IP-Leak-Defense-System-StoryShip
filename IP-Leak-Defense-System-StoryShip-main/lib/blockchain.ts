import { ethers } from "ethers"
import { getCurrentNetwork, STORY_PROOF_ABI, isStoryNetwork, getStoryNetwork, switchNetwork } from "@/lib/contracts"
import { registerIPAsset, type IPAsset } from "@/lib/story-protocol"

export interface VersionCheckpoint {
  transactionHash?: string
  blockNumber?: number
  fileHash: string
  ipfsCid: string
  encryptedHash: string
  versionNote: string
  author: string
  timestamp: number
  ipAssetId?: string // Story Protocol IP Asset ID
}

export interface VersionProof {
  fileHash: string
  ipfsCid: string
  encryptedHash: string
  author: string
  timestamp: string
  transactionHash?: string
  ipAssetId?: string
}

// Get Story Proof contract address (should be set via environment variable)
function getStoryProofContractAddress(): string {
  return (
    process.env.NEXT_PUBLIC_STORY_PROOF_CONTRACT ||
    "0x0000000000000000000000000000000000000000" // Placeholder
  )
}

// Get ethers provider
function getProvider(): ethers.BrowserProvider | null {
  if (typeof window === "undefined" || !window.ethereum) return null
  return new ethers.BrowserProvider(window.ethereum)
}

export async function createVersionCheckpoint(
  fileHash: string,
  ipfsCid: string,
  encryptedHash: string,
  versionNote: string,
  address: string,
  fileName?: string,
): Promise<VersionCheckpoint> {
  const timestamp = Math.floor(Date.now() / 1000)

  // Try to register as IP Asset on Story Protocol first
  let ipAssetId: string | undefined
  try {
    const ipAsset = await registerIPAsset(
      fileHash,
      ipfsCid,
      {
        name: fileName || "IP Asset",
        description: versionNote || "Intellectual Property Asset",
        type: "file",
      },
      address,
    )
    if (ipAsset) {
      ipAssetId = ipAsset.ipAssetId
    }
  } catch (error) {
    console.warn("IP Asset registration failed, continuing with version checkpoint:", error)
  }

  const checkpoint: VersionCheckpoint = {
    fileHash,
    ipfsCid,
    encryptedHash,
    versionNote,
    author: address,
    timestamp,
    ipAssetId,
  }

  // Try to store on-chain, fallback to localStorage
  const submitted = await submitToBlockchain(checkpoint, address)
  if (!submitted) {
    // Store checkpoint in localStorage as fallback
    const checkpoints = JSON.parse(localStorage.getItem(`checkpoints_${address}`) || "[]")
    checkpoints.push(checkpoint)
    localStorage.setItem(`checkpoints_${address}`, JSON.stringify(checkpoints))
  }

  return checkpoint
}

async function submitToBlockchain(checkpoint: VersionCheckpoint, address: string): Promise<boolean> {
  try {
    const provider = getProvider()
    if (!provider) {
      console.log("No Web3 provider available, using localStorage")
      return false
    }

    const chainId = await getCurrentNetwork()
    if (!chainId) {
      // No blockchain connection - this is expected if wallet not connected
      // Don't log as error, just use fallback
      return false
    }

    // Prefer Story network for IP registration
    if (!isStoryNetwork(chainId)) {
      // Not on Story network - that's okay, we can still submit
      // User can switch manually if they want Story network
    }

    const contractAddress = getStoryProofContractAddress()

    // If contract is configured, use it
    if (contractAddress !== "0x0000000000000000000000000000000000000000") {
      try {
        const signer = await provider.getSigner()
        const contract = new ethers.Contract(contractAddress, STORY_PROOF_ABI, signer)

        // Convert fileHash to bytes32
        const fileHashBytes32 = ethers.hexlify(ethers.toUtf8Bytes(checkpoint.fileHash.slice(0, 32)))

        // Submit transaction
        const tx = await contract.registerVersion(fileHashBytes32, checkpoint.ipfsCid, checkpoint.versionNote)
        const receipt = await tx.wait()

        // Update checkpoint with real transaction data
        checkpoint.transactionHash = receipt.hash
        checkpoint.blockNumber = receipt.blockNumber

        // Store checkpoint locally with real data
        const checkpoints = JSON.parse(localStorage.getItem(`checkpoints_${address}`) || "[]")
        checkpoints.push(checkpoint)
        localStorage.setItem(`checkpoints_${address}`, JSON.stringify(checkpoints))

        console.log("Successfully submitted to blockchain:", receipt.hash)
        return true
      } catch (contractError: any) {
        console.error("Contract interaction failed:", contractError)
        // Fall through to fallback
      }
    }

    // Fallback: If IP Asset was registered, use that transaction hash
    if (checkpoint.ipAssetId) {
      // IP Asset registration already happened, mark as submitted
      checkpoint.transactionHash = `ip-${checkpoint.ipAssetId}`
      const checkpoints = JSON.parse(localStorage.getItem(`checkpoints_${address}`) || "[]")
      checkpoints.push(checkpoint)
      localStorage.setItem(`checkpoints_${address}`, JSON.stringify(checkpoints))
      return true
    }

    // Final fallback: generate placeholder (for demo purposes)
    console.log("Using fallback storage (contract not configured)")
    return false
  } catch (error) {
    console.error("Blockchain submission failed:", error)
    return false
  }
}

export function getVersionCheckpoints(address: string): VersionCheckpoint[] {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem(`checkpoints_${address}`) || "[]")
}

export function clearVersionCheckpoints(address: string): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(`checkpoints_${address}`)
}

export async function verifyProof(fileHash: string, ipfsCid: string, proof: VersionProof): Promise<boolean> {
  // Basic verification
  if (proof.fileHash !== fileHash || proof.ipfsCid !== ipfsCid) {
    return false
  }

  // If IP Asset ID exists, verify ownership
  if (proof.ipAssetId) {
    try {
      const { verifyIPAssetOwnership } = await import("@/lib/story-protocol")
      return await verifyIPAssetOwnership(proof.ipAssetId, proof.author)
    } catch (error) {
      console.error("IP Asset verification failed:", error)
    }
  }

  // If transaction hash exists, could verify on-chain (future enhancement)
  return true
}

// Get IP Assets for an address
export async function getIPAssetsForAddress(address: string) {
  try {
    const { getIPAssets } = await import("@/lib/story-protocol")
    return getIPAssets(address)
  } catch (error) {
    console.error("Failed to get IP Assets:", error)
    return []
  }
}

// Smart contract interaction for StoryProof
// Supports Story, Polygon, and Ethereum networks

export interface ContractConfig {
  address: string
  abi: any[]
  network: "story" | "story-testnet" | "ethereum" | "polygon" | "sepolia" | "mumbai"
  rpcUrl: string
}

export const NETWORKS = {
  story: {
    chainId: 1337, // Story Protocol mainnet (update with actual chain ID)
    name: "Story Protocol",
    rpcUrl: process.env.NEXT_PUBLIC_STORY_RPC_URL || "https://rpc.story.foundation",
    blockExplorer: process.env.NEXT_PUBLIC_STORY_EXPLORER || "https://explorer.story.foundation",
    nativeCurrency: {
      name: "STORY",
      symbol: "STORY",
      decimals: 18,
    },
  },
  "story-testnet": {
    chainId: 1338, // Story Protocol testnet (update with actual chain ID)
    name: "Story Testnet",
    rpcUrl: process.env.NEXT_PUBLIC_STORY_TESTNET_RPC_URL || "https://testnet-rpc.story.foundation",
    blockExplorer: process.env.NEXT_PUBLIC_STORY_TESTNET_EXPLORER || "https://testnet-explorer.story.foundation",
    nativeCurrency: {
      name: "STORY",
      symbol: "STORY",
      decimals: 18,
    },
  },
  ethereum: {
    chainId: 1,
    name: "Ethereum Mainnet",
    rpcUrl: "https://eth.llamarpc.com",
    blockExplorer: "https://etherscan.io",
  },
  sepolia: {
    chainId: 11155111,
    name: "Sepolia Testnet",
    rpcUrl: "https://rpc.sepolia.org",
    blockExplorer: "https://sepolia.etherscan.io",
  },
  polygon: {
    chainId: 137,
    name: "Polygon Mainnet",
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
  },
  mumbai: {
    chainId: 80001,
    name: "Mumbai Testnet",
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    blockExplorer: "https://mumbai.polygonscan.com",
  },
}

// Simple ABI for a basic version registry contract
export const STORY_PROOF_ABI = [
  {
    name: "registerVersion",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "fileHash", type: "bytes32" },
      { name: "ipfsCid", type: "string" },
      { name: "versionNote", type: "string" },
    ],
    outputs: [],
  },
  {
    name: "getVersions",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "author", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "fileHash", type: "bytes32" },
          { name: "ipfsCid", type: "string" },
          { name: "versionNote", type: "string" },
          { name: "timestamp", type: "uint256" },
          { name: "blockNumber", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "verifyVersion",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "author", type: "address" },
      { name: "fileHash", type: "bytes32" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
]

export interface Web3Provider {
  send(method: string, params?: any[]): Promise<any>
  request(args: { method: string; params?: any[] }): Promise<any>
}

// Get the current network from connected wallet
export async function getCurrentNetwork(): Promise<number | null> {
  if (typeof window === "undefined" || !window.ethereum) {
    return null
  }
  try {
    const chainId = await window.ethereum.request({ method: "eth_chainId" })
    return Number.parseInt(chainId, 16)
  } catch (error: any) {
    // Only log if it's a meaningful error (not just missing wallet)
    if (error?.code !== -32002 && error?.message) {
      console.warn("Failed to get current network:", error.message || "Wallet not connected")
    }
    return null
  }
}

// Switch to a specific network
export async function switchNetwork(chainId: number): Promise<boolean> {
  if (typeof window === "undefined" || !window.ethereum) return false
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    })
    return true
  } catch (error: any) {
    if (error.code === 4902) {
      // Network not added, try to add it
      const networkKey = Object.keys(NETWORKS).find(
        (key) => NETWORKS[key as keyof typeof NETWORKS].chainId === chainId,
      )
      if (networkKey) {
        const network = NETWORKS[networkKey as keyof typeof NETWORKS]
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${chainId.toString(16)}`,
                chainName: network.name,
                rpcUrls: [network.rpcUrl],
                blockExplorerUrls: network.blockExplorer ? [network.blockExplorer] : [],
                nativeCurrency: (network as any).nativeCurrency || {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
              },
            ],
          })
          return true
        } catch (addError) {
          console.error("Failed to add network:", addError)
          return false
        }
      }
      console.error("Network not configured in wallet")
      return false
    }
    console.error("Failed to switch network:", error)
    return false
  }
}

// Format bytes32 hash for display
export function formatHash(hash: string, length = 10): string {
  if (!hash) return ""
  if (hash.startsWith("0x")) {
    return `0x${hash.slice(2, 2 + length)}...`
  }
  return `${hash.slice(0, length)}...`
}

// Convert bytes32 hash format
export function bytesToHash(bytes: string): string {
  return bytes.startsWith("0x") ? bytes : `0x${bytes}`
}

// Encode version data for contract call
export function encodeVersionData(fileHash: string, ipfsCid: string, versionNote: string): string {
  // Simple encoding - in production use proper ABI encoding
  const encoder = new TextEncoder()
  const data = `${fileHash}|${ipfsCid}|${versionNote}`
  return btoa(data) // Base64 encode for demo
}

// Decode version data from contract
export function decodeVersionData(encoded: string): { fileHash: string; ipfsCid: string; versionNote: string } {
  try {
    const data = atob(encoded)
    const [fileHash, ipfsCid, versionNote] = data.split("|")
    return { fileHash, ipfsCid, versionNote }
  } catch {
    return { fileHash: "", ipfsCid: "", versionNote: "" }
  }
}

// Get block explorer URL for transaction
export function getBlockExplorerUrl(txHash: string, chainId?: number): string {
  if (chainId) {
    const networkKey = Object.keys(NETWORKS).find(
      (key) => NETWORKS[key as keyof typeof NETWORKS].chainId === chainId,
    )
    if (networkKey) {
      const network = NETWORKS[networkKey as keyof typeof NETWORKS]
      return `${network.blockExplorer}/tx/${txHash}`
    }
  }
  // Fallback to etherscan
  return `https://etherscan.io/tx/${txHash}`
}

// Get Story network (preferred for IP registration)
export function getStoryNetwork(): typeof NETWORKS.story | typeof NETWORKS["story-testnet"] {
  const useTestnet = process.env.NEXT_PUBLIC_USE_STORY_TESTNET === "true"
  return useTestnet ? NETWORKS["story-testnet"] : NETWORKS.story
}

// Check if chain is Story network
export function isStoryNetwork(chainId: number): boolean {
  return chainId === NETWORKS.story.chainId || chainId === NETWORKS["story-testnet"].chainId
}

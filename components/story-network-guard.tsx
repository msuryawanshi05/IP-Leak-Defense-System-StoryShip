"use client"

import { useState, useEffect, useCallback } from "react"
import { AlertTriangle, Loader2, Zap, ExternalLink } from "lucide-react"
import { toast } from "sonner"

export const STORY_ODYSSEY = {
  chainId: 1513,
  chainIdHex: "0x5E9",
  name: "Story Odyssey Testnet",
  rpcUrl: "https://odyssey.storyrpc.io",
  explorerUrl: "https://odyssey.storyscan.xyz",
  faucetUrl: "https://faucet.story.foundation",
  currency: { name: "IP", symbol: "IP", decimals: 18 },
} as const

export async function getChainId(): Promise<number | null> {
  if (typeof window === "undefined" || !window.ethereum) return null
  try {
    const hex = await window.ethereum.request({ method: "eth_chainId" })
    return parseInt(hex as string, 16)
  } catch {
    return null
  }
}

export async function switchToStoryOdyssey(): Promise<boolean> {
  if (!window.ethereum) return false
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: STORY_ODYSSEY.chainIdHex }],
    })
    return true
  } catch (switchError: any) {
    // Chain not added yet — add it
    if (switchError?.code === 4902 || switchError?.code === -32603) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: STORY_ODYSSEY.chainIdHex,
              chainName: STORY_ODYSSEY.name,
              rpcUrls: [STORY_ODYSSEY.rpcUrl],
              nativeCurrency: STORY_ODYSSEY.currency,
              blockExplorerUrls: [STORY_ODYSSEY.explorerUrl],
            },
          ],
        })
        return true
      } catch {
        return false
      }
    }
    // User rejected
    return false
  }
}

/** Returns true if the connected wallet is on Story Odyssey (chain 1513) */
export function useStoryNetwork() {
  const [chainId, setChainId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    const id = await getChainId()
    setChainId(id)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refresh()
    if (typeof window !== "undefined" && window.ethereum) {
      const handler = (hex: unknown) => {
        setChainId(parseInt(hex as string, 16))
      }
      window.ethereum.on?.("chainChanged", handler)
      return () => window.ethereum?.removeListener?.("chainChanged", handler)
    }
  }, [refresh])

  return {
    chainId,
    isLoading,
    isStoryOdyssey: chainId === STORY_ODYSSEY.chainId,
    refresh,
  }
}

interface StoryNetworkGuardProps {
  /** If children provided, renders them only when on correct network */
  children?: React.ReactNode
  /** Show as inline warning banner (no full block) */
  inline?: boolean
}

export default function StoryNetworkGuard({ children, inline = false }: StoryNetworkGuardProps) {
  const { chainId, isLoading, isStoryOdyssey } = useStoryNetwork()
  const [isSwitching, setIsSwitching] = useState(false)

  const handleSwitch = async () => {
    setIsSwitching(true)
    const success = await switchToStoryOdyssey()
    if (!success) {
      toast.error("Network Switch Rejected", {
        description: "Please manually switch to Story Odyssey Testnet (Chain ID: 1513) in MetaMask.",
      })
    } else {
      toast.success("Switched to Story Odyssey!", {
        description: "You're now connected to the Story Odyssey Testnet. Ready to register IP Assets.",
        icon: <Zap size={14} />,
      })
    }
    setIsSwitching(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Loader2 size={14} className="animate-spin text-primary" />
        Detecting network…
      </div>
    )
  }

  if (isStoryOdyssey) {
    // On correct network — render children or nothing
    return <>{children}</>
  }

  if (inline) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3 rounded-xl bg-amber-400/10 border border-amber-400/30 text-sm">
        <div className="flex items-center gap-2 flex-1">
          <AlertTriangle size={15} className="text-amber-400 flex-shrink-0" />
          <span className="text-amber-300 font-medium">
            {chainId
              ? `Wrong network (Chain ${chainId}) — Story Odyssey required to register IP`
              : "Connect to Story Odyssey to register IP Assets"}
          </span>
        </div>
        <button
          onClick={handleSwitch}
          disabled={isSwitching}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 font-semibold text-xs transition-all disabled:opacity-60"
        >
          {isSwitching ? (
            <><Loader2 size={11} className="animate-spin" /> Switching…</>
          ) : (
            <><Zap size={11} /> Switch Network</>
          )}
        </button>
      </div>
    )
  }

  // Full block guard card
  return (
    <div className="glass-card p-8 text-center border-amber-400/20 animate-fade-in">
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center">
        <AlertTriangle size={28} className="text-amber-400" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">Wrong Network</h3>
      <p className="text-muted-foreground text-sm mb-2 max-w-xs mx-auto">
        StoryProof registers your files as IP Assets on{" "}
        <strong className="text-foreground">Story Odyssey Testnet</strong>.
        {chainId
          ? ` You're currently on chain ${chainId}.`
          : " Please switch your wallet to continue."}
      </p>
      <p className="text-xs text-muted-foreground mb-6">
        Chain ID: <span className="font-mono text-foreground">1513</span> · RPC:{" "}
        <span className="font-mono text-foreground">odyssey.storyrpc.io</span>
      </p>

      <button
        onClick={handleSwitch}
        disabled={isSwitching}
        className="btn-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed mb-3"
      >
        {isSwitching ? (
          <><Loader2 size={16} className="animate-spin" /> Switching…</>
        ) : (
          <><Zap size={16} /> Switch to Story Odyssey</>
        )}
      </button>

      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <a
          href={STORY_ODYSSEY.faucetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          <ExternalLink size={10} /> Get testnet IP tokens
        </a>
        <a
          href={STORY_ODYSSEY.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          <ExternalLink size={10} /> Explorer
        </a>
      </div>
    </div>
  )
}

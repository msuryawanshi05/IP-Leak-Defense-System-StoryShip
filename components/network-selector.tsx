"use client"

import { useState, useEffect } from "react"
import { NETWORKS, getCurrentNetwork, switchNetwork } from "@/lib/contracts"
import { Wifi, ChevronDown, CheckCircle2, Loader2 } from "lucide-react"

export default function NetworkSelector() {
  const [currentNetwork, setCurrentNetwork] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSwitching, setIsSwitching] = useState<number | null>(null)

  useEffect(() => {
    getCurrentNetwork().then((id) => {
      setCurrentNetwork(id)
      setIsLoading(false)
    })

    // Listen for network changes
    const handler = () => {
      getCurrentNetwork().then(setCurrentNetwork)
    }
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("chainChanged", handler)
      return () => window.ethereum?.removeListener?.("chainChanged", handler)
    }
  }, [])

  const handleSwitch = async (chainId: number) => {
    setIsSwitching(chainId)
    const ok = await switchNetwork(chainId)
    if (ok) setCurrentNetwork(chainId)
    setIsSwitching(null)
  }

  const networkEntries = Object.entries(NETWORKS) as Array<[string, any]>
  const storyNets = networkEntries.filter(([k]) => k === "story" || k === "story-testnet")
  const otherNets = networkEntries.filter(([k]) => k !== "story" && k !== "story-testnet")
  const activeNetwork = networkEntries.find(([_, n]) => n.chainId === currentNetwork)?.[1]

  return (
    <div className="space-y-4">
      {/* Current network banner */}
      <div className="glass-card p-4 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          activeNetwork ? "bg-primary/20 border border-primary/30" : "bg-secondary border border-border"
        }`}>
          <Wifi size={18} className={activeNetwork ? "text-primary" : "text-muted-foreground"} />
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-0.5">Connected Network</p>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Detecting…</span>
            </div>
          ) : activeNetwork ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[oklch(0.68_0.18_145)] shadow-[0_0_6px_oklch(0.68_0.18_145)]" />
              <p className="font-semibold text-foreground">{activeNetwork.name}</p>
              <span className="text-xs text-muted-foreground font-mono">#{currentNetwork}</span>
            </div>
          ) : (
            <p className="text-sm text-destructive font-medium">Not connected to a known network</p>
          )}
        </div>
      </div>

      {/* Story Networks — highlighted */}
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          Story Protocol Networks (Recommended)
        </p>
        <div className="space-y-2">
          {storyNets.map(([key, network]) => {
            const isActive = currentNetwork === network.chainId
            const isBusy = isSwitching === network.chainId
            return (
              <button
                key={key}
                onClick={() => !isActive && handleSwitch(network.chainId)}
                disabled={isActive || isBusy}
                id={`network-${key}`}
                className={`w-full flex items-center justify-between gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                  isActive
                    ? "border-primary/50 bg-primary/10 cursor-default"
                    : "border-border hover:border-primary/40 hover:bg-primary/5 glass-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                    isActive ? "bg-primary/30 border border-primary/50" : "bg-secondary border border-border"
                  }`}>
                    ⛓️
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{network.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">Chain ID: {network.chainId}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {isBusy ? (
                    <Loader2 size={16} className="animate-spin text-primary" />
                  ) : isActive ? (
                    <CheckCircle2 size={16} className="text-primary" />
                  ) : (
                    <ChevronDown size={16} className="text-muted-foreground -rotate-90" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Other Networks */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Other Networks
        </p>
        <div className="grid grid-cols-2 gap-2">
          {otherNets.map(([key, network]) => {
            const isActive = currentNetwork === network.chainId
            const isBusy = isSwitching === network.chainId
            return (
              <button
                key={key}
                onClick={() => !isActive && handleSwitch(network.chainId)}
                disabled={isActive || isBusy}
                id={`network-${key}`}
                className={`flex items-center justify-between gap-2 p-3 rounded-xl border text-left transition-all duration-200 ${
                  isActive
                    ? "border-accent/40 bg-accent/10 cursor-default"
                    : "border-border hover:border-border/80 hover:bg-secondary/50"
                }`}
              >
                <div>
                  <p className="font-medium text-foreground text-xs">{network.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">#{network.chainId}</p>
                </div>
                {isBusy ? (
                  <Loader2 size={12} className="animate-spin text-primary flex-shrink-0" />
                ) : isActive ? (
                  <CheckCircle2 size={12} className="text-accent flex-shrink-0" />
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground mb-1">💡 Why Story Network?</p>
        <p>Story Protocol networks support IP Asset registration, programmable licensing, and royalty distribution — the full IP protection stack.</p>
      </div>
    </div>
  )
}

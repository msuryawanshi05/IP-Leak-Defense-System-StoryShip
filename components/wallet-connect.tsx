"use client"

import { useState } from "react"
import { Shield, AlertCircle, Zap } from "lucide-react"
import { toast } from "sonner"
import { switchToStoryOdyssey, STORY_ODYSSEY } from "@/components/story-network-guard"

interface WalletConnectProps {
  onConnect: (address: string) => void
  compact?: boolean
}

export default function WalletConnect({ onConnect, compact = false }: WalletConnectProps) {
  const [isLoading, setIsLoading] = useState(false)

  const connectWallet = async () => {
    setIsLoading(true)
    try {
      if (!window.ethereum) {
        toast.error("Wallet Not Found", {
          description: "Please install MetaMask to connect to Story Odyssey and register IP Assets.",
          icon: <AlertCircle size={16} />,
        })
        return
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

      if (accounts && accounts.length > 0) {
        // ── Auto-switch to Story Odyssey ──────────────────────────────────────
        const chainHex = await window.ethereum.request({ method: "eth_chainId" })
        const chainId = parseInt(chainHex as string, 16)

        if (chainId !== STORY_ODYSSEY.chainId) {
          toast.loading("Switching to Story Odyssey…", { id: "network-switch" })
          const switched = await switchToStoryOdyssey()
          toast.dismiss("network-switch")

          if (switched) {
            toast.success("Connected to Story Odyssey!", {
              description: `${(accounts[0] as string).slice(0, 6)}…${(accounts[0] as string).slice(-4)} · Chain 1513`,
              icon: <Zap size={16} />,
            })
          } else {
            // Switched failed / rejected — still connect the wallet but warn
            toast.warning("Wallet Connected — Wrong Network", {
              description: "You'll need Story Odyssey Testnet (Chain 1513) to register IP Assets.",
              duration: 6000,
            })
          }
        } else {
          toast.success("Wallet Connected!", {
            description: `${(accounts[0] as string).slice(0, 6)}…${(accounts[0] as string).slice(-4)} · Story Odyssey`,
            icon: <Shield size={16} />,
          })
        }

        onConnect(accounts[0] as string)
      }
    } catch (err: any) {
      const msg = err?.message || "Failed to connect wallet"
      if (err?.code === 4001) {
        toast.error("Connection Rejected", { description: "You declined the wallet connection request." })
      } else {
        toast.error("Connection Failed", { description: msg })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (compact) {
    return (
      <button
        onClick={connectWallet}
        disabled={isLoading}
        className="btn-glow flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Connecting…
          </>
        ) : (
          <>
            <Shield size={14} />
            Connect Wallet
          </>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isLoading}
      className="btn-glow group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
      id="wallet-connect-btn"
    >
      {/* Shimmer layer */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out" />

      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          Connecting to Story Odyssey…
        </>
      ) : (
        <>
          <Shield size={18} className="group-hover:animate-bounce-subtle" />
          Connect Wallet &amp; Register IP
          <span className="ml-1 group-hover:translate-x-1 transition-transform duration-200">→</span>
        </>
      )}
    </button>
  )
}

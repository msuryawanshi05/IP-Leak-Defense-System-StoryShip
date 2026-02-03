"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/components/wallet-provider"

interface WalletConnectProps {
  onConnect?: (address: string) => void
  afterConnectPath?: string
  label?: string
  size?: "default" | "sm" | "lg"
  className?: string
  hideConnectedState?: boolean
}

export default function WalletConnect({
  onConnect,
  afterConnectPath = "/dashboard",
  label = "Connect Wallet",
  size = "lg",
  className,
  hideConnectedState = false,
}: WalletConnectProps) {
  const router = useRouter()
  const { connect, disconnect, isConnecting, isConnected, address, providerAvailable } = useWallet()
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    setError(null)
    try {
      const account = await connect()
      if (account) {
        onConnect?.(account)
        if (afterConnectPath) {
          router.push(afterConnectPath)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
    }
  }

  if (!providerAvailable) {
    return (
      <div className="text-center space-y-2">
        <Button disabled size={size} className={className}>
          Wallet Unavailable
        </Button>
        <p className="text-sm text-muted-foreground">
          Install MetaMask or another EVM wallet to continue.
        </p>
      </div>
    )
  }

  if (isConnected && address) {
    if (hideConnectedState) {
      return null
    }
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground">Connected as</p>
        <p className="font-mono text-sm">{address.slice(0, 6)}…{address.slice(-4)}</p>
        <Button variant="outline" onClick={disconnect} size="sm">
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <div className="text-center space-y-2">
      <Button onClick={handleConnect} disabled={isConnecting} size={size} className={className}>
        {isConnecting ? "Connecting..." : label}
      </Button>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  )
}

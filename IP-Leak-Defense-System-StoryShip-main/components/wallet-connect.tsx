"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface WalletConnectProps {
  onConnect: (address: string) => void
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connectWallet = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask or another Web3 wallet")
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts && accounts.length > 0) {
        onConnect(accounts[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Button onClick={connectWallet} disabled={isLoading} size="lg">
        {isLoading ? "Connecting..." : "Connect Wallet"}
      </Button>
      {error && <p className="text-destructive text-sm mt-2">{error}</p>}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { NETWORKS, getCurrentNetwork, switchNetwork } from "@/lib/contracts"

export default function NetworkSelector() {
  const [currentNetwork, setCurrentNetwork] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkNetwork = async () => {
      const chainId = await getCurrentNetwork()
      setCurrentNetwork(chainId)
      setIsLoading(false)
    }
    checkNetwork()
  }, [])

  const handleSwitchNetwork = async (chainId: number) => {
    setIsLoading(true)
    const success = await switchNetwork(chainId)
    if (success) {
      setCurrentNetwork(chainId)
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Checking network...</div>
  }

  const networkEntries = Object.entries(NETWORKS) as Array<[string, any]>
  const activeNetwork = networkEntries.find(([_, net]) => net.chainId === currentNetwork)?.[1]

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-2">Current Network</p>
          {activeNetwork ? (
            <p className="text-sm font-semibold text-foreground">{activeNetwork.name}</p>
          ) : (
            <p className="text-sm text-destructive">Not connected to a network</p>
          )}
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Available Networks</p>
          <div className="space-y-2">
            {/* Story Networks - Highlighted */}
            {networkEntries
              .filter(([key]) => key === "story" || key === "story-testnet")
              .map(([key, network]) => (
                <Button
                  key={key}
                  variant={currentNetwork === network.chainId ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSwitchNetwork(network.chainId)}
                  disabled={isLoading}
                  className="w-full text-xs font-semibold"
                >
                  ⛓️ {network.name} {key === "story" ? "(IP Recommended)" : ""}
                </Button>
              ))}
            {/* Other Networks */}
          <div className="grid grid-cols-2 gap-2">
              {networkEntries
                .filter(([key]) => key !== "story" && key !== "story-testnet")
                .map(([key, network]) => (
              <Button
                key={key}
                variant={currentNetwork === network.chainId ? "default" : "outline"}
                size="sm"
                onClick={() => handleSwitchNetwork(network.chainId)}
                disabled={isLoading}
                className="text-xs"
              >
                {network.name}
              </Button>
            ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

"use client"

import type { ReactNode } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import WalletConnect from "@/components/wallet-connect"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/components/wallet-provider"
import { Loader } from "@/components/ui/loader"

interface WalletGateProps {
  children: (address: string) => ReactNode
  title?: string
  description?: string
}

export function WalletGate({
  children,
  title = "Wallet Required",
  description = "Connect your wallet to unlock this area.",
}: WalletGateProps) {
  const { isInitializing, providerAvailable, address, isConnected, refreshStatus } = useWallet()

  if (isInitializing) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <Loader label="Validating wallet session…" />
      </div>
    )
  }

  if (!providerAvailable) {
    return (
      <div className="flex items-center justify-center px-4 py-24">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle>No Wallet Detected</CardTitle>
            <CardDescription>
              Install MetaMask or another EVM-compatible wallet to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <a href="https://metamask.io/download/" target="_blank" rel="noreferrer">
                Install MetaMask
              </a>
            </Button>
            <Button variant="outline" className="w-full" onClick={refreshStatus}>
              Re-check Wallet Status
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isConnected || !address) {
    return (
      <div className="flex items-center justify-center px-4 py-24">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <WalletConnect label="Connect Wallet" afterConnectPath="" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children(address)}</>
}



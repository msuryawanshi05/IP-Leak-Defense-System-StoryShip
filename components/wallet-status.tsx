"use client"

import { ShieldCheck, ShieldX } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatAddress } from "@/lib/utils"
import { useWallet } from "@/components/wallet-provider"

export function WalletStatus() {
  const { address, isConnected, isInitializing } = useWallet()

  if (isInitializing) {
    return <Badge variant="secondary">Checking wallet…</Badge>
  }

  if (!isConnected || !address) {
    return (
      <Badge variant="outline" className="gap-1 text-yellow-700 border-yellow-700">
        <ShieldX className="h-3.5 w-3.5" />
        Not connected
      </Badge>
    )
  }

  return (
    <Badge variant="secondary" className="gap-1">
      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
      {formatAddress(address)}
    </Badge>
  )
}


"use client"

import type { ReactNode } from "react"
import { WalletProvider } from "./wallet-provider"

export function WalletProviderWrapper({ children }: { children: ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>
}


// Type declarations for Web3/Ethereum browser extensions and globals

interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>
  on: (event: string, handler: (...args: any[]) => void) => void
  removeListener?: (event: string, handler: (...args: any[]) => void) => void
  selectedAddress?: string | null
  chainId?: string
  isMetaMask?: boolean
  networkVersion?: string
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

export {}

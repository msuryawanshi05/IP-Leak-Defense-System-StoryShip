 "use client"

 import {
   createContext,
   useContext,
   useState,
   useEffect,
   useCallback,
   type ReactNode,
 } from "react"
 import { useRouter } from "next/navigation"
 import { useToast } from "@/components/ui/use-toast"
 import { formatAddress } from "@/lib/utils"

 type WalletContextType = {
   address: string | null
   isConnected: boolean
   isInitializing: boolean
   isConnecting: boolean
   providerAvailable: boolean
   connect: () => Promise<string | null>
   disconnect: () => void
   refreshStatus: () => Promise<void>
 }

 declare global {
   interface Window {
     ethereum?: {
       request: (args: { method: string }) => Promise<any>
       on?: (event: string, handler: (args: any) => void) => void
       removeListener?: (event: string, handler: (args: any) => void) => void
     }
   }
 }

 const WalletContext = createContext<WalletContextType | undefined>(undefined)

 export function WalletProvider({ children }: { children: ReactNode }) {
   const router = useRouter()
   const { toast } = useToast()

   const [address, setAddress] = useState<string | null>(null)
   const [isConnected, setIsConnected] = useState(false)
   const [isInitializing, setIsInitializing] = useState(true)
   const [isConnecting, setIsConnecting] = useState(false)
   const [providerAvailable, setProviderAvailable] = useState(false)
   const [provider, setProvider] = useState<typeof window.ethereum | null>(null)

   const applyAddress = useCallback(
     (nextAddress: string | null, { silent } = { silent: false }) => {
       if (nextAddress) {
         setAddress(nextAddress)
         setIsConnected(true)
         if (typeof window !== "undefined") {
           localStorage.setItem("wallet_address", nextAddress)
         }
         if (!silent) {
           toast({
             title: "Wallet connected",
             description: formatAddress(nextAddress),
           })
         }
       } else {
         setAddress(null)
         setIsConnected(false)
         if (typeof window !== "undefined") {
           localStorage.removeItem("wallet_address")
         }
         if (!silent) {
           toast({
             title: "Wallet disconnected",
             description: "Reconnect to keep managing your portfolio.",
           })
         }
       }
     },
     [toast],
   )

   const hydrateFromStorage = useCallback(() => {
     if (typeof window === "undefined") return
     const stored = localStorage.getItem("wallet_address")
     if (stored) {
       applyAddress(stored, { silent: true })
     }
   }, [applyAddress])

   const refreshStatus = useCallback(async () => {
     if (!provider) {
       hydrateFromStorage()
       return
     }

     try {
       const accounts = await provider.request({ method: "eth_accounts" })
       if (accounts && accounts.length > 0) {
         applyAddress(accounts[0], { silent: true })
       } else {
         applyAddress(null, { silent: true })
       }
     } catch (error) {
       console.error("Failed to refresh wallet status", error)
     }
   }, [provider, applyAddress, hydrateFromStorage])

   useEffect(() => {
     if (typeof window === "undefined") return
     const ethereum = window.ethereum ?? null
     setProvider(ethereum)
     setProviderAvailable(Boolean(ethereum))

     if (!ethereum) {
       hydrateFromStorage()
       setIsInitializing(false)
       return
     }

    const handleAccountsChanged = (accounts: string[]) => {
       if (accounts.length === 0) {
         applyAddress(null, { silent: true })
         router.push("/")
       } else {
         applyAddress(accounts[0], { silent: true })
       }
     }
    const handleChainChanged = () => {
      window.location.reload()
    }

     const bootstrap = async () => {
       try {
         const accounts = await ethereum.request({ method: "eth_accounts" })
         if (accounts && accounts.length > 0) {
           applyAddress(accounts[0], { silent: true })
         } else {
           hydrateFromStorage()
         }
       } catch (error) {
         console.error("Unable to read existing wallet accounts", error)
         hydrateFromStorage()
       } finally {
         setIsInitializing(false)
       }
     }

     bootstrap()

     ethereum.on?.("accountsChanged", handleAccountsChanged)
    ethereum.on?.("chainChanged", handleChainChanged)

     return () => {
       ethereum.removeListener?.("accountsChanged", handleAccountsChanged)
      ethereum.removeListener?.("chainChanged", handleChainChanged)
     }
   }, [applyAddress, hydrateFromStorage, router])

   const connect = useCallback(async () => {
     if (!provider) {
       toast({
         title: "Wallet not detected",
         description: "Install MetaMask or another EVM-compatible wallet.",
         variant: "destructive",
       })
       return null
     }

     setIsConnecting(true)
     try {
       const accounts = await provider.request({ method: "eth_requestAccounts" })
       if (accounts && accounts.length > 0) {
         applyAddress(accounts[0])
         return accounts[0]
       }
       return null
     } catch (error) {
       const message =
         error instanceof Error ? error.message : "Wallet rejected the connection request."
       toast({
         title: "Wallet connection failed",
         description: message,
         variant: "destructive",
       })
       throw error
     } finally {
       setIsConnecting(false)
     }
   }, [provider, applyAddress, toast])

   const disconnect = useCallback(() => {
     applyAddress(null)
     router.push("/")
   }, [applyAddress, router])

   return (
     <WalletContext.Provider
       value={{
         address,
         isConnected,
         isInitializing,
         isConnecting,
         providerAvailable,
         connect,
         disconnect,
         refreshStatus,
       }}
     >
       {children}
     </WalletContext.Provider>
   )
 }

 export function useWallet() {
   const context = useContext(WalletContext)
   if (!context) {
     throw new Error("useWallet must be used within a WalletProvider")
   }
   return context
 }


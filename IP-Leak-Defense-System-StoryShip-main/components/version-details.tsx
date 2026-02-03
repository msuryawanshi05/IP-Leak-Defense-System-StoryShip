"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getBlockExplorerUrl, formatHash, getCurrentNetwork } from "@/lib/contracts"
import FileVerifier from "@/components/file-verifier"

interface VersionDetailsProps {
  version: {
    id: number
    name: string
    hash: string
    timestamp: Date
    author: string | null
    notes: string
    size: number
    ipfsCid: string
    transactionHash?: string
    blockNumber?: number
    encryptedHash?: string
    ipAssetId?: string // Story Protocol IP Asset ID
  }
}

export default function VersionDetails({ version }: VersionDetailsProps) {
  const [chainId, setChainId] = useState<number | null>(null)

  useEffect(() => {
    getCurrentNetwork().then(setChainId)
  }, [])

  const handleViewOnBlockchain = () => {
    if (!version.transactionHash) return
    const url = getBlockExplorerUrl(version.transactionHash, chainId || undefined)
    window.open(url, "_blank")
  }

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash)
  }

  return (
    <Card className="p-4 space-y-4">
      <div>
        <h4 className="text-sm font-semibold mb-2 text-foreground">Version Details</h4>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="verify">Verify File</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 mt-4">

      <div className="grid grid-cols-1 gap-4 text-sm">
        <div>
          <p className="text-xs text-muted-foreground mb-1">File Name</p>
          <p className="font-semibold text-foreground break-all">{version.name}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">File Hash (SHA-256)</p>
          <div className="flex gap-2 items-center">
            <p className="font-mono text-xs text-foreground break-all flex-1">{formatHash(version.hash)}</p>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => handleCopyHash(version.hash)}>
              Copy
            </Button>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">IPFS CID</p>
          <div className="flex gap-2 items-center">
            <p className="font-mono text-xs text-foreground break-all flex-1">{formatHash(version.ipfsCid)}</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => handleCopyHash(version.ipfsCid)}
            >
              Copy
            </Button>
          </div>
        </div>

        {version.encryptedHash && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Encrypted Hash</p>
            <div className="flex gap-2 items-center">
              <p className="font-mono text-xs text-foreground break-all flex-1">{formatHash(version.encryptedHash)}</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => handleCopyHash(version.encryptedHash!)}
              >
                Copy
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">File Size</p>
            <p className="text-foreground">{version.size > 0 ? `${(version.size / 1024).toFixed(2)} KB` : "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Timestamp</p>
            <p className="text-foreground text-xs">{new Date(version.timestamp).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* IP Asset Information */}
      {version.ipAssetId && (
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-semibold text-foreground">Story Protocol IP Asset</p>
            <Badge variant="default" className="text-xs">
              Registered
            </Badge>
          </div>
          <div className="bg-primary/10 p-3 rounded text-xs space-y-1 border border-primary/20">
            <p>
              <span className="text-muted-foreground">IP Asset ID: </span>
              <span className="font-mono text-foreground break-all">{version.ipAssetId}</span>
            </p>
            <p className="text-muted-foreground text-xs mt-2">
              This file is registered as an Intellectual Property Asset on Story Protocol
            </p>
          </div>
        </div>
      )}

      {version.transactionHash && (
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">On-Chain Verification</p>
          <div className="space-y-2">
            <div className="bg-muted p-3 rounded text-xs space-y-1">
              <p>
                <span className="text-muted-foreground">TX Hash: </span>
                <span className="font-mono text-foreground break-all">{formatHash(version.transactionHash)}</span>
              </p>
              {version.blockNumber && (
                <p>
                  <span className="text-muted-foreground">Block: </span>
                  <span className="font-mono text-foreground">{version.blockNumber}</span>
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs bg-transparent"
              onClick={handleViewOnBlockchain}
            >
              View on Block Explorer
            </Button>
          </div>
        </div>
      )}
        </TabsContent>

        <TabsContent value="verify" className="mt-4">
          <FileVerifier expectedHash={version.hash} fileName={version.name} />
        </TabsContent>
      </Tabs>
    </Card>
  )
}

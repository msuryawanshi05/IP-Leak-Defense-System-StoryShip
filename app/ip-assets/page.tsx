"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import IPAssetShare from "@/components/ip-asset-share"
import IPLicenseManager from "@/components/ip-license-manager"
import { getIPAssets, type IPAsset } from "@/lib/story-protocol"
import { downloadCertificate } from "@/lib/export"
import { Download, Shield } from "lucide-react"
import Navigation from "@/components/navigation"
import { WalletGate } from "@/components/wallet-gate"

export default function IPAssetsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <WalletGate
        title="Connect your wallet"
        description="Your wallet powers IP asset ownership and licensing."
      >
        {(address) => <IPAssetsBody address={address} />}
      </WalletGate>
    </div>
  )
}

function IPAssetsBody({ address }: { address: string }) {
  const router = useRouter()
  const [ipAssets, setIPAssets] = useState<IPAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAssets = () => {
      try {
        const assets = getIPAssets(address)
        setIPAssets(assets)
      } catch (error) {
        console.error("Failed to load IP Assets:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAssets()
  }, [address])

  const handleGenerateCertificate = async (asset: IPAsset) => {
    const { generateOwnershipCertificate: genCert } = await import("@/lib/export")
    const html = await genCert(asset.ipAssetId, asset.owner, asset.fileHash, asset.registeredAt)
    downloadCertificate(html, `certificate-${asset.ipAssetId}.html`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">IP Assets</h1>
        <p className="text-muted-foreground">Manage your registered intellectual property assets</p>
      </div>

      {isLoading ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Loading IP Assets...</p>
        </Card>
      ) : ipAssets.length === 0 ? (
        <Card className="p-12 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" aria-hidden="true" />
          <p className="text-muted-foreground mb-2">No IP Assets registered</p>
          <p className="text-sm text-muted-foreground mb-4">
            IP Assets are created automatically when you upload files.
          </p>
          <Button onClick={() => router.push("/files?action=upload")}>Upload File to Create IP Asset</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {ipAssets.map((asset, index) => (
            <Card key={asset.ipAssetId ?? index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>IP Asset #{asset.ipAssetId || index + 1}</CardTitle>
                    {asset.metadata?.name && <CardDescription>{asset.metadata.name}</CardDescription>}
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {asset.transactionHash ? (
                      <Badge variant="default">Registered</Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                    <IPAssetShare ipAssetId={asset.ipAssetId} owner={asset.owner} />
                    <Button variant="outline" size="sm" onClick={() => handleGenerateCertificate(asset)}>
                      <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                      Certificate
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Hash: </span>
                    <span className="font-mono text-xs break-all">{asset.fileHash}</span>
                  </div>
                  {asset.ipfsCid && (
                    <div>
                      <span className="text-muted-foreground">IPFS: </span>
                      <span className="font-mono text-xs break-all">{asset.ipfsCid}</span>
                    </div>
                  )}
                  {asset.transactionHash && (
                    <div>
                      <span className="text-muted-foreground">Transaction: </span>
                      <span className="font-mono text-xs break-all">{asset.transactionHash}</span>
                    </div>
                  )}
                  {asset.registeredAt && (
                    <div>
                      <span className="text-muted-foreground">Registered: </span>
                      <span className="text-xs">
                        {new Date(asset.registeredAt * 1000).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                <IPLicenseManager ipAssetId={asset.ipAssetId} address={address} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


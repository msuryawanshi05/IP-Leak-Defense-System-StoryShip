"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { computeFileHash } from "@/lib/storage"
import { getVersionCheckpoints } from "@/lib/blockchain"
import { getIPAssets } from "@/lib/story-protocol"
import { CheckCircle2, XCircle, Upload, Search, Shield, FileText } from "lucide-react"

export default function VerifyPage() {
  const [verificationType, setVerificationType] = useState<"file" | "hash" | "ipasset">("file")
  const [file, setFile] = useState<File | null>(null)
  const [hashInput, setHashInput] = useState("")
  const [ipAssetId, setIpAssetId] = useState("")
  const [result, setResult] = useState<any>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  const verifyFile = async () => {
    if (!file) return

    setIsVerifying(true)
    try {
      const fileHash = await computeFileHash(file)

      // Search all addresses' checkpoints
      const allCheckpoints: any[] = []
      if (typeof window !== "undefined") {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith("checkpoints_")) {
            const address = key.replace("checkpoints_", "")
            const checkpoints = getVersionCheckpoints(address)
            allCheckpoints.push(...checkpoints.map((cp: any) => ({ ...cp, address })))
          }
        }
      }

      const match = allCheckpoints.find((cp) => cp.fileHash === fileHash)

      if (match) {
        setResult({
          verified: true,
          type: "file",
          hash: fileHash,
          match,
          message: "File verified! This file matches a registered IP Asset.",
        })
      } else {
        setResult({
          verified: false,
          type: "file",
          hash: fileHash,
          message: "File not found in registry. This file has not been registered.",
        })
      }
    } catch (error) {
      setResult({
        verified: false,
        error: "Verification failed. Please try again.",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const verifyHash = async () => {
    if (!hashInput.trim()) return

    setIsVerifying(true)
    try {
      const allCheckpoints: any[] = []
      if (typeof window !== "undefined") {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith("checkpoints_")) {
            const address = key.replace("checkpoints_", "")
            const checkpoints = getVersionCheckpoints(address)
            allCheckpoints.push(...checkpoints.map((cp: any) => ({ ...cp, address })))
          }
        }
      }

      const match = allCheckpoints.find((cp) => cp.fileHash === hashInput.trim())

      if (match) {
        setResult({
          verified: true,
          type: "hash",
          hash: hashInput.trim(),
          match,
          message: "Hash verified! This hash matches a registered IP Asset.",
        })
      } else {
        setResult({
          verified: false,
          type: "hash",
          hash: hashInput.trim(),
          message: "Hash not found in registry.",
        })
      }
    } catch (error) {
      setResult({
        verified: false,
        error: "Verification failed. Please try again.",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const verifyIPAsset = async () => {
    if (!ipAssetId.trim()) return

    setIsVerifying(true)
    try {
      const allIPAssets: any[] = []
      if (typeof window !== "undefined") {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith("ip_assets_")) {
            const address = key.replace("ip_assets_", "")
            const assets = getIPAssets(address)
            allIPAssets.push(...assets.map((asset: any) => ({ ...asset, address })))
          }
        }
      }

      const match = allIPAssets.find((asset) => asset.ipAssetId === ipAssetId.trim())

      if (match) {
        setResult({
          verified: true,
          type: "ipasset",
          ipAssetId: ipAssetId.trim(),
          match,
          message: "IP Asset verified! Ownership confirmed.",
        })
      } else {
        setResult({
          verified: false,
          type: "ipasset",
          ipAssetId: ipAssetId.trim(),
          message: "IP Asset ID not found in registry.",
        })
      }
    } catch (error) {
      setResult({
        verified: false,
        error: "Verification failed. Please try again.",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">File Verification Portal</h1>
          <p className="text-muted-foreground">
            Verify file authenticity and IP ownership without connecting a wallet
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Verify Ownership</CardTitle>
            <CardDescription>Choose a verification method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Button
                variant={verificationType === "file" ? "default" : "outline"}
                className="h-auto flex-col py-4"
                onClick={() => setVerificationType("file")}
              >
                <Upload className="h-5 w-5 mb-2" />
                <span>Upload File</span>
              </Button>
              <Button
                variant={verificationType === "hash" ? "default" : "outline"}
                className="h-auto flex-col py-4"
                onClick={() => setVerificationType("hash")}
              >
                <Search className="h-5 w-5 mb-2" />
                <span>Enter Hash</span>
              </Button>
              <Button
                variant={verificationType === "ipasset" ? "default" : "outline"}
                className="h-auto flex-col py-4"
                onClick={() => setVerificationType("ipasset")}
              >
                <Shield className="h-5 w-5 mb-2" />
                <span>IP Asset ID</span>
              </Button>
            </div>

            {verificationType === "file" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Upload File</label>
                  <Input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                </div>
                <Button onClick={verifyFile} disabled={!file || isVerifying} className="w-full">
                  {isVerifying ? "Verifying..." : "Verify File"}
                </Button>
              </div>
            )}

            {verificationType === "hash" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">File Hash</label>
                  <Input
                    placeholder="Enter SHA-256 hash"
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                  />
                </div>
                <Button onClick={verifyHash} disabled={!hashInput.trim() || isVerifying} className="w-full">
                  {isVerifying ? "Verifying..." : "Verify Hash"}
                </Button>
              </div>
            )}

            {verificationType === "ipasset" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">IP Asset ID</label>
                  <Input
                    placeholder="Enter IP Asset ID"
                    value={ipAssetId}
                    onChange={(e) => setIpAssetId(e.target.value)}
                  />
                </div>
                <Button onClick={verifyIPAsset} disabled={!ipAssetId.trim() || isVerifying} className="w-full">
                  {isVerifying ? "Verifying..." : "Verify IP Asset"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                {result.verified ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-green-600">Verification Successful</CardTitle>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <CardTitle className="text-red-600">Verification Failed</CardTitle>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className={result.verified ? "text-green-600" : "text-red-600"}>{result.message}</p>

              {result.verified && result.match && (
                <div className="space-y-3 p-4 bg-secondary/50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium">Owner Address:</span>
                    <p className="font-mono text-sm">{result.match.address}</p>
                  </div>
                  {result.match.versionNote && (
                    <div>
                      <span className="text-sm font-medium">File Name:</span>
                      <p className="text-sm">{result.match.versionNote}</p>
                    </div>
                  )}
                  {result.match.timestamp && (
                    <div>
                      <span className="text-sm font-medium">Registered:</span>
                      <p className="text-sm">{new Date(result.match.timestamp * 1000).toLocaleString()}</p>
                    </div>
                  )}
                  {result.match.transactionHash && (
                    <div>
                      <span className="text-sm font-medium">Transaction Hash:</span>
                      <p className="font-mono text-sm break-all">{result.match.transactionHash}</p>
                    </div>
                  )}
                  {result.match.ipAssetId && (
                    <div>
                      <span className="text-sm font-medium">IP Asset ID:</span>
                      <p className="font-mono text-sm">{result.match.ipAssetId}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium">File Hash:</span>
                    <p className="font-mono text-sm break-all">{result.hash || result.match.fileHash}</p>
                  </div>
                </div>
              )}

              {result.error && <p className="text-red-600">{result.error}</p>}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>How Verification Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>File Upload:</strong> Upload a file to verify if it matches any registered IP Asset. The system
              will calculate the file's hash and compare it with registered files.
            </p>
            <p>
              <strong>Hash Verification:</strong> Enter a SHA-256 hash directly to check if it exists in the registry.
            </p>
            <p>
              <strong>IP Asset ID:</strong> Verify ownership by entering an IP Asset ID from Story Protocol.
            </p>
            <p className="pt-2 text-xs">
              Note: This verification portal searches the public registry. For on-chain verification, connect your
              wallet in the main application.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}


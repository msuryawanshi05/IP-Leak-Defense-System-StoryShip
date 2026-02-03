"use client"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { computeFileHash } from "@/lib/storage"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"

interface FileVerifierProps {
  expectedHash: string
  fileName?: string
}

export default function FileVerifier({ expectedHash, fileName }: FileVerifierProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean
    computedHash: string
    message: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setVerificationResult(null)
    }
  }

  const handleVerify = async () => {
    if (!selectedFile) return

    setIsVerifying(true)
    try {
      const computedHash = await computeFileHash(selectedFile)
      const verified = computedHash.toLowerCase() === expectedHash.toLowerCase()

      setVerificationResult({
        verified,
        computedHash,
        message: verified
          ? "✅ File is AUTHENTIC and UNCHANGED. This file matches the original upload."
          : "❌ File VERIFICATION FAILED. This file does NOT match the original upload. The file may have been modified, corrupted, or is not the same file.",
      })
    } catch (error) {
      console.error("Verification failed:", error)
      setVerificationResult({
        verified: false,
        computedHash: "",
        message: "Failed to verify file. Please try again.",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Verify File Authenticity</h3>
        <p className="text-sm text-muted-foreground">
          Upload a file to verify it matches the original. The file hash will be compared to the stored hash.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select File to Verify</label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="block w-full text-sm text-muted-foreground
              file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0
              file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground
              hover:file:bg-primary/90"
          />
          {selectedFile && (
            <p className="text-sm text-muted-foreground mt-2">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        <div className="bg-muted p-3 rounded text-xs">
          <p className="text-muted-foreground mb-1">Expected Hash (SHA-256):</p>
          <p className="font-mono text-foreground break-all">{expectedHash}</p>
        </div>

        <Button onClick={handleVerify} disabled={!selectedFile || isVerifying} className="w-full">
          {isVerifying ? "Verifying..." : "Verify File"}
        </Button>

        {verificationResult && (
          <div
            className={`p-4 rounded-lg border-2 ${
              verificationResult.verified
                ? "bg-green-500/10 border-green-500/50"
                : "bg-red-500/10 border-red-500/50"
            }`}
          >
            <div className="flex items-start gap-3">
              {verificationResult.verified ? (
                <CheckCircle2 className="text-green-500 mt-0.5" size={20} />
              ) : (
                <XCircle className="text-red-500 mt-0.5" size={20} />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={verificationResult.verified ? "default" : "destructive"}>
                    {verificationResult.verified ? "VERIFIED" : "FAILED"}
                  </Badge>
                </div>
                <p className="text-sm font-medium mb-2">{verificationResult.message}</p>
                {!verificationResult.verified && verificationResult.computedHash && (
                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Computed Hash:</p>
                      <p className="font-mono text-xs text-foreground break-all bg-background/50 p-2 rounded">
                        {verificationResult.computedHash}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Expected Hash:</p>
                      <p className="font-mono text-xs text-foreground break-all bg-background/50 p-2 rounded">
                        {expectedHash}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-blue-500 mt-0.5" size={16} />
            <div>
              <p className="font-semibold text-foreground mb-1">How Verification Works:</p>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                <li>Original file is hashed using SHA-256 when uploaded</li>
                <li>Hash is stored on-chain and in version history</li>
                <li>Downloaded file is hashed again and compared</li>
                <li>If hashes match → File is authentic and unchanged</li>
                <li>If hashes differ → File has been modified or is different</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}


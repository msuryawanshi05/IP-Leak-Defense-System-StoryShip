"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, FileText, Calendar, Hash, Shield } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { formatAddress } from "@/lib/utils"

interface VersionComparisonProps {
  versions: any[]
  onClose?: () => void
}

export function VersionComparison({ versions, onClose }: VersionComparisonProps) {
  const [leftVersion, setLeftVersion] = useState<any>(versions[0] || null)
  const [rightVersion, setRightVersion] = useState<any>(versions[1] || null)

  const getDiff = (left: any, right: any) => {
    if (!left || !right) return null

    return {
      hashChanged: left.fileHash !== right.fileHash,
      nameChanged: left.versionNote !== right.versionNote,
      timeDiff: Math.abs(
        (left.timestamp > 1e12 ? left.timestamp : left.timestamp * 1000) -
          (right.timestamp > 1e12 ? right.timestamp : right.timestamp * 1000),
      ),
      leftVerified: !!left.transactionHash,
      rightVerified: !!right.transactionHash,
      leftIPAsset: !!left.ipAssetId,
      rightIPAsset: !!right.ipAssetId,
    }
  }

  const diff = getDiff(leftVersion, rightVersion)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Version Comparison</CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Select
              value={leftVersion?.fileHash || ""}
              onValueChange={(hash) => {
                const version = versions.find((v) => v.fileHash === hash)
                setLeftVersion(version)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select version 1" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((v) => (
                  <SelectItem key={v.fileHash} value={v.fileHash}>
                    {v.versionNote || v.fileHash.slice(0, 16)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={rightVersion?.fileHash || ""}
              onValueChange={(hash) => {
                const version = versions.find((v) => v.fileHash === hash)
                setRightVersion(version)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select version 2" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((v) => (
                  <SelectItem key={v.fileHash} value={v.fileHash}>
                    {v.versionNote || v.fileHash.slice(0, 16)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {leftVersion && rightVersion && (
            <div className="grid md:grid-cols-2 gap-4 border-t pt-4">
              {/* Left Version */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Version 1</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{leftVersion.versionNote || "Unnamed"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      Hash
                    </p>
                    <p className="font-mono text-xs break-all">{leftVersion.fileHash}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Timestamp
                    </p>
                    <p>
                      {formatDistanceToNow(
                        new Date(
                          leftVersion.timestamp > 1e12
                            ? leftVersion.timestamp
                            : leftVersion.timestamp * 1000,
                        ),
                        { addSuffix: true },
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {leftVersion.transactionHash && (
                      <Badge variant="default">Verified</Badge>
                    )}
                    {leftVersion.ipAssetId && (
                      <Badge variant="secondary">
                        <Shield className="h-3 w-3 mr-1" />
                        IP Asset
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Version */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Version 2</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{rightVersion.versionNote || "Unnamed"}</p>
                    {diff?.nameChanged && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Changed
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      Hash
                    </p>
                    <p className="font-mono text-xs break-all">{rightVersion.fileHash}</p>
                    {diff?.hashChanged && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Different
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Timestamp
                    </p>
                    <p>
                      {formatDistanceToNow(
                        new Date(
                          rightVersion.timestamp > 1e12
                            ? rightVersion.timestamp
                            : rightVersion.timestamp * 1000,
                        ),
                        { addSuffix: true },
                      )}
                    </p>
                    {diff && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.floor(diff.timeDiff / (1000 * 60 * 60 * 24))} days difference
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {rightVersion.transactionHash && (
                      <Badge variant="default">Verified</Badge>
                    )}
                    {rightVersion.ipAssetId && (
                      <Badge variant="secondary">
                        <Shield className="h-3 w-3 mr-1" />
                        IP Asset
                      </Badge>
                    )}
                    {diff && !diff.leftVerified && diff.rightVerified && (
                      <Badge variant="outline" className="text-xs">
                        Newly Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {diff && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Summary</h4>
              <div className="space-y-1 text-sm">
                <p>
                  {diff.hashChanged
                    ? "Files are different (hash mismatch)"
                    : "Files are identical (same hash)"}
                </p>
                {diff.nameChanged && <p>Version name changed</p>}
                {diff.leftIPAsset !== diff.rightIPAsset && (
                  <p>
                    IP Asset status changed:{" "}
                    {diff.leftIPAsset ? "Removed" : "Added"}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

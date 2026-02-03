"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface Version {
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
}

interface VersionComparisonProps {
  versions: Version[]
  onClose: () => void
}

export default function VersionComparison({ versions, onClose }: VersionComparisonProps) {
  const [selected, setSelected] = useState<number[]>([0, versions.length - 1])

  const toggleSelection = (index: number) => {
    if (selected.includes(index)) {
      setSelected(selected.filter((i) => i !== index))
    } else if (selected.length < 2) {
      setSelected([...selected, index].sort((a, b) => a - b))
    }
  }

  const v1 = versions[selected[0]]
  const v2 = versions[selected[1]]

  if (!v1 || !v2) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground mb-4">Select two versions to compare</p>
        <div className="space-y-2 mb-4">
          {versions.map((version, index) => (
            <div key={version.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(index)}
                onChange={() => toggleSelection(index)}
                disabled={selected.length === 2 && !selected.includes(index)}
                className="cursor-pointer"
              />
              <label className="flex-1 cursor-pointer text-sm">
                v{versions.length - index}: {version.name}
              </label>
            </div>
          ))}
        </div>
        <Button onClick={onClose} variant="outline" className="w-full bg-transparent">
          Close
        </Button>
      </Card>
    )
  }

  const timeDiff = Math.abs(new Date(v2.timestamp).getTime() - new Date(v1.timestamp).getTime())
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const hoursDiff = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  const hashMatch = v1.hash === v2.hash
  const sizeChange = v2.size - v1.size
  const sizePercent = v1.size > 0 ? ((sizeChange / v1.size) * 100).toFixed(1) : 0

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Version Comparison</h3>
        <Button onClick={onClose} variant="ghost" size="sm">
          ✕
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[v1, v2].map((version, idx) => (
          <div key={version.id} className="space-y-3 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Version</p>
              <p className="text-sm font-semibold text-foreground">v{versions.length - versions.indexOf(version)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Name</p>
              <p className="text-sm text-foreground truncate">{version.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Date</p>
              <p className="text-sm text-foreground">{new Date(version.timestamp).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Size</p>
              <p className="text-sm text-foreground">
                {version.size > 0 ? `${(version.size / 1024).toFixed(2)} KB` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Hash (First 12)</p>
              <p className="font-mono text-xs text-foreground">{version.hash.slice(0, 12)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-6">
        <h4 className="text-sm font-semibold mb-4 text-foreground">Comparison Results</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span className="text-sm text-muted-foreground">File Content Changed</span>
            <span className={`text-sm font-semibold ${hashMatch ? "text-muted-foreground" : "text-accent"}`}>
              {hashMatch ? "No" : "Yes"}
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span className="text-sm text-muted-foreground">File Size Change</span>
            <span
              className={`text-sm font-semibold ${sizeChange === 0 ? "text-muted-foreground" : sizeChange > 0 ? "text-destructive" : "text-accent"}`}
            >
              {sizeChange === 0
                ? "No change"
                : `${sizeChange > 0 ? "+" : ""}${(sizeChange / 1024).toFixed(2)} KB (${sizePercent}%)`}
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span className="text-sm text-muted-foreground">Time Between Versions</span>
            <span className="text-sm font-semibold text-foreground">
              {daysDiff} days, {hoursDiff} hours
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span className="text-sm text-muted-foreground">On-Chain Status</span>
            <span className="text-sm font-semibold text-accent">
              {v1.transactionHash && v2.transactionHash ? "Both verified" : "Pending"}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h4 className="text-sm font-semibold mb-3 text-foreground">Hash Comparison</h4>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">v{versions.length - versions.indexOf(v1)}</p>
            <p className="font-mono text-xs text-foreground break-all bg-muted p-2 rounded">{v1.hash}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">v{versions.length - versions.indexOf(v2)}</p>
            <p className="font-mono text-xs text-foreground break-all bg-muted p-2 rounded">{v2.hash}</p>
          </div>
        </div>
      </div>

      <Button onClick={onClose} className="w-full">
        Close Comparison
      </Button>
    </Card>
  )
}

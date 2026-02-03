"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Share2, Copy, Check, Users, Eye, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface IPAssetShareProps {
  ipAssetId: string
  owner: string
}

interface SharePermission {
  address: string
  permission: "view" | "edit" | "transfer"
  sharedAt: number
}

export default function IPAssetShare({ ipAssetId, owner }: IPAssetShareProps) {
  const [shareAddress, setShareAddress] = useState("")
  const [permission, setPermission] = useState<"view" | "edit" | "transfer">("view")
  const [shareLink, setShareLink] = useState("")
  const [sharedWith, setSharedWith] = useState<SharePermission[]>([])

  const loadSharedWith = () => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem(`shared_${ipAssetId}`)
    if (stored) {
      setSharedWith(JSON.parse(stored))
    }
  }

  useEffect(() => {
    loadSharedWith()
  }, [ipAssetId])

  const generateShareLink = () => {
    const link = `${window.location.origin}/verify?ipasset=${ipAssetId}`
    setShareLink(link)
    return link
  }

  const copyShareLink = () => {
    const link = shareLink || generateShareLink()
    navigator.clipboard.writeText(link)
    toast.success("Share link copied to clipboard!")
  }

  const shareWithAddress = () => {
    if (!shareAddress.trim()) {
      toast.error("Please enter an address")
      return
    }

    const newShare: SharePermission = {
      address: shareAddress.trim(),
      permission,
      sharedAt: Date.now(),
    }

    const updated = [...sharedWith, newShare]
    setSharedWith(updated)
    localStorage.setItem(`shared_${ipAssetId}`, JSON.stringify(updated))
    toast.success(`Shared with ${shareAddress.slice(0, 6)}...${shareAddress.slice(-4)}`)
    setShareAddress("")
  }

  const removeShare = (address: string) => {
    const updated = sharedWith.filter((s) => s.address !== address)
    setSharedWith(updated)
    localStorage.setItem(`shared_${ipAssetId}`, JSON.stringify(updated))
    toast.success("Access removed")
  }

  const getPermissionIcon = (perm: string) => {
    switch (perm) {
      case "view":
        return <Eye className="h-4 w-4" />
      case "edit":
        return <Edit className="h-4 w-4" />
      case "transfer":
        return <Trash2 className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share IP Asset</DialogTitle>
          <DialogDescription>Share this IP Asset with others or generate a public verification link</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Generate Share Link */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Public Verification Link</CardTitle>
              <CardDescription>Generate a shareable link for public verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={shareLink || generateShareLink()} readOnly className="font-mono text-sm" />
                <Button onClick={copyShareLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with this link can verify the IP Asset ownership without a wallet
              </p>
            </CardContent>
          </Card>

          {/* Share with Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Share with Wallet Address</CardTitle>
              <CardDescription>Grant specific permissions to wallet addresses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="0x..."
                  value={shareAddress}
                  onChange={(e) => setShareAddress(e.target.value)}
                  className="flex-1"
                />
                <Select value={permission} onValueChange={(v: any) => setPermission(v)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="edit">Can Edit</SelectItem>
                    <SelectItem value="transfer">Can Transfer</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={shareWithAddress}>Share</Button>
              </div>

              {sharedWith.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="text-sm font-medium">Shared With:</h4>
                  {sharedWith.map((share, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-secondary/50 rounded">
                      <div className="flex items-center gap-2">
                        {getPermissionIcon(share.permission)}
                        <span className="font-mono text-sm">{share.address.slice(0, 10)}...</span>
                        <Badge variant="secondary">{share.permission}</Badge>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeShare(share.address)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}


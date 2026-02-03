"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getVersionCheckpoints } from "@/lib/blockchain"
import { getIPAssets } from "@/lib/story-protocol"
import { Search, UserPlus, Users, Globe, Shield, FileText, Share2 } from "lucide-react"
import Navigation from "@/components/navigation"
import { WalletGate } from "@/components/wallet-gate"
import { getBaseUrl } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface Creator {
  address: string
  name?: string
  fileCount: number
  ipAssetCount: number
  isFollowing: boolean
}

export default function SocialPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <WalletGate
        title="Connect your wallet"
        description="Connect to discover creators, share your portfolio, and follow peers."
      >
        {(address) => <SocialBody address={address} />}
      </WalletGate>
    </div>
  )
}

function SocialBody({ address }: { address: string }) {
  const [creators, setCreators] = useState<Creator[]>([])
  const [following, setFollowing] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [portfolioStats, setPortfolioStats] = useState({ files: 0, assets: 0 })
  const [isPortfolioPublic, setIsPortfolioPublic] = useState(true)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  useEffect(() => {
    // Load following list
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`following_${address}`)
      if (stored) {
        setFollowing(JSON.parse(stored))
      }

      // Load portfolio visibility
      const visibility = localStorage.getItem(`portfolio_visibility_${address}`)
      setIsPortfolioPublic(visibility !== "private")

      setPortfolioStats({
        files: getVersionCheckpoints(address).length,
        assets: getIPAssets(address).length,
      })

      // Discover creators from all stored data
      const discovered: Record<string, Creator> = {}

      // Scan all localStorage keys for addresses
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith("checkpoints_")) {
          const addr = key.replace("checkpoints_", "")
          if (addr !== address && !discovered[addr]) {
            try {
              const checkpoints = getVersionCheckpoints(addr)
              const assets = getIPAssets(addr)
              discovered[addr] = {
                address: addr,
                fileCount: checkpoints.length,
                ipAssetCount: assets.length,
                isFollowing: JSON.parse(localStorage.getItem(`following_${address}`) || "[]").includes(addr),
              }
            } catch (e) {
              // Ignore
            }
          }
        }
      }

      setCreators(Object.values(discovered))
    }
  }, [address])

  const toggleFollow = (creatorAddress: string) => {
    const updated = following.includes(creatorAddress)
      ? following.filter((a) => a !== creatorAddress)
      : [...following, creatorAddress]

    setFollowing(updated)
    localStorage.setItem(`following_${address}`, JSON.stringify(updated))

    // Update creators list
    setCreators(
      creators.map((c) =>
        c.address === creatorAddress ? { ...c, isFollowing: !c.isFollowing } : c
      )
    )
  }

  const filteredCreators = creators.filter((c) =>
    c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const portfolioUrl = `${getBaseUrl()}/portfolio/${address}`

  const handleSharePortfolio = () => {
    if (!isPortfolioPublic) {
      return
    }
    setShareDialogOpen(true)
  }

  const copyPortfolioLink = () => {
    navigator.clipboard.writeText(portfolioUrl)
    // Could add toast notification here
  }

  const togglePortfolioVisibility = (checked: boolean) => {
    setIsPortfolioPublic(checked)
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `portfolio_visibility_${address}`,
        checked ? "public" : "private",
      )
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Social</h1>
          <p className="text-muted-foreground">Discover creators and explore IP Assets</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Your Public Portfolio
          </CardTitle>
          <CardDescription>Share your portfolio with others</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Public Profile</p>
                <p className="text-sm text-muted-foreground font-mono">{address}</p>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{portfolioStats.files} files</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{portfolioStats.assets} IP Assets</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-3">
                {isPortfolioPublic ? (
                  <Unlock className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <Label htmlFor="portfolio-visibility" className="text-sm font-medium">
                    Portfolio Visibility
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {isPortfolioPublic
                      ? "Your portfolio is publicly accessible"
                      : "Your portfolio is private"}
                  </p>
                </div>
              </div>
              <Switch
                id="portfolio-visibility"
                checked={isPortfolioPublic}
                onCheckedChange={togglePortfolioVisibility}
              />
            </div>
            <div className="flex justify-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={handleSharePortfolio}
                            disabled={!isPortfolioPublic}
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Portfolio
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Share Your Portfolio</DialogTitle>
                            <DialogDescription>
                              Share this link to let others view your public portfolio
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Input
                                value={portfolioUrl}
                                readOnly
                                className="font-mono text-sm"
                              />
                              <Button onClick={copyPortfolioLink} size="sm">
                                Copy
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Anyone with this link can view your public portfolio
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TooltipTrigger>
                  {!isPortfolioPublic && (
                    <TooltipContent>
                      <p>Enable public portfolio visibility to share</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>

      {following.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Following ({following.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {creators
                .filter((c) => following.includes(c.address))
                .map((creator) => (
                  <Card key={creator.address}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium font-mono text-sm">
                            {creator.address.slice(0, 10)}...{creator.address.slice(-6)}
                          </p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{creator.fileCount} files</span>
                            <span>{creator.ipAssetCount} assets</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => toggleFollow(creator.address)}>
                          Unfollow
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Discover Creators</CardTitle>
          <CardDescription>Find and follow other creators</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCreators.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {searchQuery ? "No creators found" : "No other creators discovered yet"}
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCreators.map((creator) => (
                <Card key={creator.address}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium font-mono text-sm">
                          {creator.address.slice(0, 10)}...{creator.address.slice(-6)}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{creator.fileCount} files</span>
                          <span>{creator.ipAssetCount} assets</span>
                        </div>
                      </div>
                      <Button
                        variant={creator.isFollowing ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleFollow(creator.address)}
                      >
                        {creator.isFollowing ? (
                          <>
                            <Users className="h-4 w-4 mr-2" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Follow
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


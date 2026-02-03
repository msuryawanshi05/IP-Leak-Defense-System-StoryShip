"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getVersionCheckpoints } from "@/lib/blockchain"
import { getIPAssets } from "@/lib/story-protocol"
import {
  saveActivity,
  getActivitiesByCollaborator,
  type Activity,
  type CollaboratorActivity,
} from "@/lib/collaboration"
import { CommentSection } from "@/components/comment-section"
import { Users, UserPlus, Clock, Activity, Eye, Edit, Trash2, MessageSquare, User } from "lucide-react"
import Navigation from "@/components/navigation"
import { formatDistanceToNow } from "date-fns"
import { WalletGate } from "@/components/wallet-gate"
import { formatAddress } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Collaborator {
  address: string
  permission: "view" | "edit" | "transfer"
  addedAt: number
  activityCount: number
}

interface ActivityLog {
  id: string
  type: "upload" | "edit" | "share" | "comment"
  user: string
  description: string
  timestamp: number
}

export default function CollaborationPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <WalletGate
        title="Connect your wallet"
        description="Share access, set permissions, and track collaboration once your wallet is active."
      >
        {(address) => <CollaborationBody address={address} />}
      </WalletGate>
    </div>
  )
}

function CollaborationBody({ address }: { address: string }) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [activityLogs, setActivityLogs] = useState<Activity[]>([])
  const [collaboratorActivities, setCollaboratorActivities] = useState<CollaboratorActivity[]>([])
  const [newCollaborator, setNewCollaborator] = useState("")
  const [permission, setPermission] = useState<"view" | "edit" | "transfer">("view")
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [selectedVersionHash, setSelectedVersionHash] = useState<string | null>(null)

  useEffect(() => {
    const loadCollaborationData = () => {
      // Load collaborators from localStorage
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(`collaborators_${address}`)
        if (stored) {
          setCollaborators(JSON.parse(stored))
        }

        // Load activity logs
        const logsStored = localStorage.getItem(`activity_logs_${address}`)
        if (logsStored) {
          const logs: Activity[] = JSON.parse(logsStored)
          setActivityLogs(logs)
        } else {
          // Generate initial activity logs from checkpoints
          const checkpoints = getVersionCheckpoints(address)
          const logs: Activity[] = checkpoints.map((cp: any, index: number) => ({
            id: `activity_${index}`,
            type: "upload",
            user: address,
            description: `Uploaded: ${cp.versionNote || "Unnamed"}`,
            timestamp: cp.timestamp * 1000,
            metadata: {
              fileHash: cp.fileHash,
            },
          }))
          setActivityLogs(logs)
          localStorage.setItem(`activity_logs_${address}`, JSON.stringify(logs))
        }

        // Load collaborator activities
        const collaboratorActivities = getActivitiesByCollaborator(address)
        setCollaboratorActivities(collaboratorActivities)
      }
    }

    loadCollaborationData()
  }, [address])

  const addCollaborator = () => {
    if (!newCollaborator.trim()) return

    const collaborator: Collaborator = {
      address: newCollaborator.trim(),
      permission,
      addedAt: Date.now(),
      activityCount: 0,
    }

    const updated = [...collaborators, collaborator]
    setCollaborators(updated)
    localStorage.setItem(`collaborators_${address}`, JSON.stringify(updated))

    // Add activity log
    const newLog: Activity = {
      id: `log_${Date.now()}`,
      type: "share",
      user: address,
      description: `Added collaborator: ${formatAddress(newCollaborator.trim(), 6)}`,
      timestamp: Date.now(),
      metadata: {
        permission,
      },
    }
    saveActivity(newLog, address)
    const updatedLogs = [newLog, ...activityLogs]
    setActivityLogs(updatedLogs)
    setCollaboratorActivities(getActivitiesByCollaborator(address))

    setNewCollaborator("")
  }

  const removeCollaborator = (collabAddress: string) => {
    const updated = collaborators.filter((c) => c.address !== collabAddress)
    setCollaborators(updated)
    localStorage.setItem(`collaborators_${address}`, JSON.stringify(updated))

    // Add activity log
    const newLog: Activity = {
      id: `log_${Date.now()}`,
      type: "share",
      user: address,
      description: `Removed collaborator: ${formatAddress(collabAddress, 6)}`,
      timestamp: Date.now(),
    }
    saveActivity(newLog, address)
    const updatedLogs = [newLog, ...activityLogs]
    setActivityLogs(updatedLogs)
    setCollaboratorActivities(getActivitiesByCollaborator(address))
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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Collaboration</h1>
        <p className="text-muted-foreground">Manage collaborators and track activity</p>
      </div>

      <Tabs defaultValue="collaborators" className="space-y-6">
        <TabsList>
          <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
          <TabsTrigger value="activity">Activity Timeline</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="collaborators" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Collaborators */}
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Collaborators
              </CardTitle>
              <CardDescription>Manage who can access your IP Assets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="0x..."
                  value={newCollaborator}
                  onChange={(e) => setNewCollaborator(e.target.value)}
                  className="flex-1"
                />
                <Select value={permission} onValueChange={(v: any) => setPermission(v)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="edit">Edit</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addCollaborator}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {collaborators.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No collaborators yet</p>
              ) : (
                <div className="space-y-2">
                  {collaborators.map((collab, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {getPermissionIcon(collab.permission)}
                        <div>
                          <p className="font-mono text-sm">{collab.address.slice(0, 10)}...</p>
                          <p className="text-xs text-muted-foreground">
                            Added {formatDistanceToNow(new Date(collab.addedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                        <div className="flex items-center gap-2">
                        <Badge variant="secondary">{collab.permission}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCollaborator(collab.address)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Logs
              </CardTitle>
              <CardDescription>Real-time collaboration activity</CardDescription>
            </CardHeader>
            <CardContent>
              {activityLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="p-2 bg-primary/10 rounded">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{log.description}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          {log.user.slice(0, 10)}...
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(
                            new Date(log.timestamp > 1e12 ? log.timestamp : log.timestamp * 1000),
                            { addSuffix: true },
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Timeline by Collaborator
              </CardTitle>
              <CardDescription>
                View activity grouped by collaborator
              </CardDescription>
            </CardHeader>
            <CardContent>
              {collaboratorActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No collaborator activity yet
                </p>
              ) : (
                <div className="space-y-6">
                  {collaboratorActivities.map((collabActivity) => (
                    <div key={collabActivity.address} className="space-y-3">
                      <div className="flex items-center gap-3 pb-2 border-b">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {collabActivity.address.slice(2, 6).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium font-mono text-sm">
                            {formatAddress(collabActivity.address, 8)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {collabActivity.totalCount} activities
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 ml-11">
                        {collabActivity.activities.slice(0, 10).map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3 p-2 border rounded-lg"
                          >
                            <div className="p-1.5 bg-primary/10 rounded mt-0.5">
                              <Clock className="h-3 w-3 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">{activity.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(activity.timestamp), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  IP Asset Comments
                </CardTitle>
                <CardDescription>
                  Add comments to IP Assets for collaboration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select
                    value={selectedAssetId || ""}
                    onValueChange={setSelectedAssetId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an IP Asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {getIPAssets(address).map((asset: any) => (
                        <SelectItem key={asset.ipAssetId} value={asset.ipAssetId}>
                          {asset.metadata?.name || `IP Asset ${asset.ipAssetId}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedAssetId && (
                    <CommentSection
                      targetType="ip_asset"
                      targetId={selectedAssetId}
                      currentUser={address}
                      onCommentAdded={() => {
                        const activity: Activity = {
                          id: `comment_${Date.now()}`,
                          type: "comment",
                          user: address,
                          description: `Added a comment on IP Asset ${selectedAssetId}`,
                          timestamp: Date.now(),
                          metadata: {
                            assetId: selectedAssetId,
                          },
                        }
                        saveActivity(activity, address)
                        setActivityLogs([activity, ...activityLogs])
                        setCollaboratorActivities(getActivitiesByCollaborator(address))
                      }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Version Comments
                </CardTitle>
                <CardDescription>
                  Add comments to specific file versions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select
                    value={selectedVersionHash || ""}
                    onValueChange={setSelectedVersionHash}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a version" />
                    </SelectTrigger>
                    <SelectContent>
                      {getVersionCheckpoints(address).map((cp: any) => (
                        <SelectItem key={cp.fileHash} value={cp.fileHash}>
                          {cp.versionNote || cp.fileHash.slice(0, 16)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedVersionHash && (
                    <CommentSection
                      targetType="version"
                      targetId={selectedVersionHash}
                      currentUser={address}
                      onCommentAdded={() => {
                        const activity: Activity = {
                          id: `comment_${Date.now()}`,
                          type: "comment",
                          user: address,
                          description: `Added a comment on version`,
                          timestamp: Date.now(),
                          metadata: {
                            fileHash: selectedVersionHash,
                          },
                        }
                        saveActivity(activity, address)
                        setActivityLogs([activity, ...activityLogs])
                        setCollaboratorActivities(getActivitiesByCollaborator(address))
                      }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


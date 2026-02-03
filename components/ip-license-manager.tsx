"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createIPLicense, type IPLicense } from "@/lib/story-protocol"
import { FileText, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface IPLicenseManagerProps {
  ipAssetId: string
  address: string
}

export default function IPLicenseManager({ ipAssetId, address }: IPLicenseManagerProps) {
  const [licenses, setLicenses] = useState<IPLicense[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState({
    commercialUse: false,
    derivativeWorks: false,
    attributionRequired: true,
    royaltyPercentage: 0,
  })

  useEffect(() => {
    loadLicenses()
  }, [ipAssetId, address])

  const loadLicenses = () => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem(`ip_licenses_${address}`)
    if (stored) {
      const allLicenses = JSON.parse(stored)
      const assetLicenses = allLicenses.filter((l: IPLicense) => l.ipAssetId === ipAssetId)
      setLicenses(assetLicenses)
    }
  }

  const handleCreateLicense = async () => {
    try {
      const license = await createIPLicense(
        ipAssetId,
        {
          commercialUse: formData.commercialUse,
          derivativeWorks: formData.derivativeWorks,
          attributionRequired: formData.attributionRequired,
          royaltyPercentage: formData.royaltyPercentage,
        },
        address,
      )

      if (license) {
        setLicenses([...licenses, license])
        setShowCreate(false)
        setFormData({
          commercialUse: false,
          derivativeWorks: false,
          attributionRequired: true,
          royaltyPercentage: 0,
        })
        toast.success("License created successfully")
      }
    } catch (error) {
      toast.error("Failed to create license")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Programmable IP Licenses (PILs)</CardTitle>
            <CardDescription>Manage licenses for this IP Asset</CardDescription>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create License
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create IP License</DialogTitle>
                <DialogDescription>Define the terms for using this IP Asset</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="commercial">Commercial Use</Label>
                  <Switch
                    id="commercial"
                    checked={formData.commercialUse}
                    onCheckedChange={(checked) => setFormData({ ...formData, commercialUse: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="derivative">Derivative Works</Label>
                  <Switch
                    id="derivative"
                    checked={formData.derivativeWorks}
                    onCheckedChange={(checked) => setFormData({ ...formData, derivativeWorks: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="attribution">Attribution Required</Label>
                  <Switch
                    id="attribution"
                    checked={formData.attributionRequired}
                    onCheckedChange={(checked) => setFormData({ ...formData, attributionRequired: checked })}
                  />
                </div>
                <div>
                  <Label htmlFor="royalty">Royalty Percentage (%)</Label>
                  <Input
                    id="royalty"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.royaltyPercentage}
                    onChange={(e) => setFormData({ ...formData, royaltyPercentage: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <Button onClick={handleCreateLicense} className="w-full">
                  Create License
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {licenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No licenses created yet</p>
            <p className="text-sm">Create a license to define usage terms</p>
          </div>
        ) : (
          <div className="space-y-3">
            {licenses.map((license, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">License #{index + 1}</span>
                    <Badge variant="secondary">{license.licenseId}</Badge>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Commercial Use: </span>
                    <Badge variant={license.commercialUse ? "default" : "secondary"}>
                      {license.commercialUse ? "Allowed" : "Not Allowed"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Derivative Works: </span>
                    <Badge variant={license.derivativeWorks ? "default" : "secondary"}>
                      {license.derivativeWorks ? "Allowed" : "Not Allowed"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


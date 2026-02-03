"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import FileUpload from "@/components/file-upload"
import { useWallet } from "@/components/wallet-provider"

export function UploadDialog() {
  const [open, setOpen] = useState(false)
  const { address, isConnected } = useWallet()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Upload Work
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Quick Upload</DialogTitle>
        </DialogHeader>
        <FileUpload
          address={isConnected ? address ?? null : null}
          onUploaded={() => {
            setOpen(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}


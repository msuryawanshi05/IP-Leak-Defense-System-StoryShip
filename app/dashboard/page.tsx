"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getVersionCheckpoints } from "@/lib/blockchain"
import { getIPAssets } from "@/lib/story-protocol"
import {
  FileText,
  Shield,
  Activity,
  HardDrive,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  EllipsisVertical,
  FileImage,
  FileArchive,
  File as FileIcon,
} from "lucide-react"
import Navigation from "@/components/navigation"
import { WalletGate } from "@/components/wallet-gate"
import { Loader } from "@/components/ui/loader"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ROUTES } from "@/lib/routes"
import { formatAddress, cn } from "@/lib/utils"
import { useWallet } from "@/components/wallet-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface RecentItem {
  title: string
  meta: string
  timestamp: string
  link?: string
  fileType?: string
  sizeLabel?: string
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <WalletGate
        title="Connect your wallet"
        description="Authenticate with your wallet to see your personalized dashboard."
      >
        {(address) => <DashboardBody address={address} />}
      </WalletGate>
    </div>
  )
}

function DashboardBody({ address }: { address: string }) {
  const [summary, setSummary] = useState({
    totalFiles: 0,
    totalIPAssets: 0,
    totalTransactions: 0,
    totalStorage: 0,
    verifiedAssets: 0,
    pendingAssets: 0,
  })
  const [recentFiles, setRecentFiles] = useState<RecentItem[]>([])
  const [recentAssets, setRecentAssets] = useState<RecentItem[]>([])
  const [recentTransactions, setRecentTransactions] = useState<RecentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [trends, setTrends] = useState({
    totalFiles: 0,
    totalIPAssets: 0,
    totalTransactions: 0,
    totalStorage: 0,
  })
  const { refreshStatus, isConnected } = useWallet()

  useEffect(() => {
    const loadData = () => {
      try {
        const checkpoints = getVersionCheckpoints(address)
        const assets = getIPAssets(address)

        const enrichedFiles: RecentItem[] = checkpoints
          .slice(-5)
          .reverse()
          .map((cp) => {
            const date = new Date(cp.timestamp * 1000)
            let fileName = cp.versionNote || "Untitled file"
            let fileType: string | undefined
            let sizeLabel: string | undefined
            try {
              if (typeof window !== "undefined") {
                const stored = localStorage.getItem(`file_${cp.fileHash}`)
                if (stored) {
                  const parsed = JSON.parse(stored)
                  fileName = parsed.name || fileName
                  fileType = parsed.type
                  sizeLabel = formatFileSize(parsed.size)
                }
              }
            } catch {
              // ignore parse issues
            }
            return {
              title: fileName,
              meta: sizeLabel || cp.fileHash.slice(0, 10),
              timestamp: date.toLocaleString(),
              link: ROUTES.Files,
              fileType,
              sizeLabel,
            }
          })

        const enrichedAssets: RecentItem[] = assets
          .slice(-5)
          .reverse()
          .map((asset) => ({
            title: asset.metadata?.name || `IP Asset ${asset.ipAssetId}`,
            meta: asset.ipAssetId || "Pending",
            timestamp: asset.registeredAt
              ? new Date(asset.registeredAt * 1000).toLocaleString()
              : "Awaiting registration",
            link: ROUTES.IPAssets,
          }))

        const enrichedTransactions: RecentItem[] = checkpoints
          .filter((cp: any) => Boolean(cp.transactionHash))
          .slice(-5)
          .reverse()
          .map((cp: any) => ({
            title: cp.transactionHash.slice(0, 12),
            meta: cp.versionNote || "Version update",
            timestamp: new Date(cp.timestamp * 1000).toLocaleString(),
            link: ROUTES.Analytics,
          }))

        let totalStorage = 0
        checkpoints.slice(-10).forEach((cp) => {
          try {
            if (typeof window !== "undefined") {
              const stored = localStorage.getItem(`file_${cp.fileHash}`)
              if (stored) {
                const parsed = JSON.parse(stored)
                totalStorage += parsed.size || 0
              }
            }
          } catch {
            // ignore
          }
        })

        const verifiedAssets = checkpoints.filter((cp: any) => cp.transactionHash && cp.ipAssetId).length

        setSummary({
          totalFiles: checkpoints.length,
          totalIPAssets: assets.length,
          totalTransactions: checkpoints.filter((cp: any) => cp.transactionHash).length,
          totalStorage,
          verifiedAssets,
          pendingAssets: checkpoints.length - verifiedAssets,
        })
        setRecentFiles(enrichedFiles)
        setRecentAssets(enrichedAssets)
        setRecentTransactions(enrichedTransactions)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [address])

  useEffect(() => {
    if (isLoading || typeof window === "undefined") return
    const stored = localStorage.getItem(`summary_prev_${address}`)
    if (stored) {
      try {
        const previous = JSON.parse(stored)
        setTrends({
          totalFiles: summary.totalFiles - (previous?.totalFiles ?? 0),
          totalIPAssets: summary.totalIPAssets - (previous?.totalIPAssets ?? 0),
          totalTransactions: summary.totalTransactions - (previous?.totalTransactions ?? 0),
          totalStorage: summary.totalStorage - (previous?.totalStorage ?? 0),
        })
      } catch {
        // ignore parse issues
      }
    }
    localStorage.setItem(`summary_prev_${address}`, JSON.stringify(summary))
  }, [summary, address, isLoading])

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Files",
        value: summary.totalFiles,
        icon: FileText,
        href: ROUTES.Files,
        tooltip: "Creative checkpoints captured under this wallet.",
        trend: trends.totalFiles,
      },
      {
        label: "IP Assets",
        value: summary.totalIPAssets,
        icon: Shield,
        href: ROUTES.IPAssets,
        tooltip: "Registered Story Protocol IP assets.",
        extra: `${summary.verifiedAssets} verified · ${summary.pendingAssets} pending`,
        trend: trends.totalIPAssets,
      },
      {
        label: "On-chain Records",
        value: summary.totalTransactions,
        icon: Activity,
        href: ROUTES.Analytics,
        tooltip: "Transactions confirmed on-chain.",
        trend: trends.totalTransactions,
      },
      {
        label: "Storage Used",
        value: `${(summary.totalStorage / (1024 * 1024)).toFixed(2)} MB`,
        icon: HardDrive,
        href: ROUTES.Files,
        tooltip: "Encrypted storage footprint for this wallet.",
        trend: Number((trends.totalStorage / (1024 * 1024)).toFixed(2)),
        unit: "MB",
      },
    ],
    [summary, trends],
  )

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Loader label="Loading your dashboard…" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 pb-28 space-y-5">
      <section className="rounded-3xl border bg-card/70 p-5 shadow-sm space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Portfolio summary</p>
            <h1 className="mt-1 text-3xl font-semibold text-foreground">Dashboard</h1>
          </div>
        </header>
        <TooltipProvider>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {summaryCards.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.label}
                  className="rounded-2xl border bg-background/70 px-4 py-3 flex items-center gap-3"
                  aria-label={`View ${card.label}`}
                >
                  <div className="rounded-2xl bg-primary/10 text-primary p-2">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-semibold text-foreground">{card.value}</p>
                      {card.extra && <span className="text-xs text-muted-foreground">{card.extra}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <TrendBadge value={card.trend} unit={card.unit} />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" aria-label={`${card.label} info`} />
                        </TooltipTrigger>
                        <TooltipContent>{card.tooltip}</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <Button asChild variant="ghost" size="icon" className="text-muted-foreground">
                    <Link href={card.href}>
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              )
            })}
          </div>
        </TooltipProvider>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <section className="rounded-3xl border bg-card/70 p-5 space-y-6">
          <RecentSection
            title="Recent files"
            variant="file"
            items={recentFiles}
            emptyLabel="No files yet"
            emptyActionHref={`${ROUTES.Files}?action=upload`}
            viewMoreHref={ROUTES.Files}
            maxVisible={2}
          />
          <Separator />
          <RecentSection
            title="Recent IP assets"
            variant="asset"
            items={recentAssets}
            emptyLabel="No assets registered"
            emptyActionHref={`${ROUTES.Files}?action=upload`}
            viewMoreHref={ROUTES.IPAssets}
            maxVisible={2}
          />
        </section>
        <WalletStatusPanel
          address={address}
          isConnected={isConnected}
          onReconnect={refreshStatus}
          recentTransactions={recentTransactions}
        />
      </div>

      <StorageUsageCard totalStorage={summary.totalStorage} />
    </div>
  )
}

function TrendBadge({ value, unit }: { value: number; unit?: string }) {
  if (value === 0) {
    return <span className="text-muted-foreground">No change</span>
  }
  const isPositive = value > 0
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight
  const label = `${isPositive ? "+" : "-"}${Math.abs(value).toFixed(unit ? 1 : 0)}${unit ? ` ${unit}` : ""}`
  return (
    <span className={cn("flex items-center gap-1 font-medium", isPositive ? "text-emerald-600" : "text-rose-500")}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  )
}

function RecentSection({
  title,
  variant,
  items,
  emptyLabel,
  emptyActionHref,
  viewMoreHref,
  maxVisible = 3,
  className,
}: {
  title: string
  variant: "file" | "asset" | "transaction"
  items: RecentItem[]
  emptyLabel: string
  emptyActionHref: string
  viewMoreHref?: string
  maxVisible?: number
  className?: string
}) {
  const visibleItems = items.slice(0, maxVisible)

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Badge variant="outline" className="text-xs font-medium">
          {items.length} entries
        </Badge>
      </div>
      {items.length === 0 ? (
        <EmptyState label={emptyLabel} actionHref={emptyActionHref} />
      ) : (
        <div className="relative divide-y divide-border/60 rounded-2xl border bg-background/70">
          {visibleItems.map((item, idx) => (
            <RecentRow key={`${item.title}-${idx}`} item={item} variant={variant} />
          ))}
          {items.length > visibleItems.length && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-2xl bg-gradient-to-t from-background/90 to-transparent" />
          )}
        </div>
      )}
      {viewMoreHref && items.length > 0 && (
        <div className="flex justify-end">
          <Link href={viewMoreHref} className="text-sm font-medium text-primary inline-flex items-center gap-1">
            View more
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  )
}

function RecentRow({ item, variant }: { item: RecentItem; variant: "file" | "asset" | "transaction" }) {
  const descriptor = getVisualDescriptor(variant, item.fileType)
  const Icon = descriptor.icon
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-1.5">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "rounded-2xl p-2 text-primary",
            descriptor.accent,
            variant === "transaction" && "text-amber-600",
          )}
          aria-label={descriptor.label}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground leading-tight">{item.title}</p>
          <p className="text-xs text-muted-foreground leading-tight">{item.meta}</p>
          <p className="text-xs text-muted-foreground leading-tight">{item.timestamp}</p>
        </div>
      </div>
      <ActionMenu variant={variant} link={item.link} />
    </div>
  )
}

function ActionMenu({ variant, link }: { variant: "file" | "asset" | "transaction"; link?: string }) {
  const options: Record<typeof variant, { label: string; href?: string }[]> = {
    file: [
      { label: "Open", href: link },
      { label: "Rename" },
      { label: "Share" },
      { label: "Verify", href: "/verify" },
    ],
    asset: [
      { label: "Open", href: link },
      { label: "Share" },
      { label: "Verify" },
    ],
    transaction: [
      { label: "Inspect", href: link },
      { label: "Copy hash" },
    ],
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="More actions">
          <EllipsisVertical className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options[variant].map((option) => (
          <DropdownMenuItem asChild key={option.label}>
            {option.href ? <Link href={option.href}>{option.label}</Link> : <button type="button">{option.label}</button>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function StorageUsageCard({ totalStorage }: { totalStorage: number }) {
  const quotaMb = 2048
  const usedMb = Number((totalStorage / (1024 * 1024)).toFixed(2))
  const percent = Math.min(100, (usedMb / quotaMb) * 100)

  return (
    <section className="rounded-3xl border bg-card/70 p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Storage usage</p>
          <h2 className="text-xl font-semibold text-foreground">Encrypted storage</h2>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground" aria-label="Storage info" />
          </TooltipTrigger>
          <TooltipContent>Usage computed from encrypted local metadata.</TooltipContent>
        </Tooltip>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-medium text-foreground">
          <span>{usedMb} MB used</span>
          <span>{quotaMb} MB quota</span>
        </div>
        <Progress value={percent} className="h-3" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Encrypted files</span>
          <span>{percent.toFixed(1)}% utilized</span>
        </div>
      </div>
    </section>
  )
}

function WalletStatusPanel({
  address,
  isConnected,
  onReconnect,
  recentTransactions,
}: {
  address: string
  isConnected: boolean
  onReconnect: () => Promise<void> | void
  recentTransactions: RecentItem[]
}) {
  const logs = [
    "accountsChanged → listener active",
    "chainChanged → listener active",
    "autoReconnect → ethereum.request({ method: 'eth_accounts' })",
  ]
  return (
    <section className="rounded-3xl border bg-card/70 p-5 space-y-5 h-full">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Wallet</p>
          <h2 className="text-xl font-semibold text-foreground">Connection status</h2>
        </div>
        <Button variant="outline" size="sm" onClick={() => onReconnect?.()}>
          Reconnect
        </Button>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Current address</p>
        <p className="text-lg font-semibold">{formatAddress(address)}</p>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">State</span>
        <span className={isConnected ? "text-emerald-600 font-medium" : "text-muted-foreground"}>
          {isConnected ? "Active" : "Disconnected"}
        </span>
      </div>
      <div className="rounded-2xl bg-muted/40 p-4 text-xs font-mono leading-6 tracking-tight text-muted-foreground">
        {logs.join("\n")}
      </div>
      <Button asChild className="w-full justify-center">
        <Link href={`${ROUTES.Files}?action=upload`}>Upload Work</Link>
      </Button>
      <Separator />
      <RecentSection
        title="Recent transactions"
        variant="transaction"
        items={recentTransactions}
        emptyLabel="No transactions yet"
        emptyActionHref={`${ROUTES.Files}?action=upload`}
        viewMoreHref={ROUTES.Analytics}
        maxVisible={2}
      />
    </section>
  )
}

function EmptyState({ label, actionHref }: { label: string; actionHref: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
      <p>{label}</p>
      <Button asChild size="sm" className="mt-3">
        <Link href={actionHref}>Go there</Link>
      </Button>
    </div>
  )
}

function getVisualDescriptor(variant: "file" | "asset" | "transaction", fileType?: string) {
  if (variant === "asset") {
    return { icon: Shield, accent: "bg-emerald-50 text-emerald-600", label: "IP Asset" }
  }
  if (variant === "transaction") {
    return { icon: Activity, accent: "bg-amber-50", label: "Transaction" }
  }
  if (fileType?.includes("image")) {
    return { icon: FileImage, accent: "bg-sky-50 text-sky-600", label: "Image" }
  }
  if (fileType?.includes("pdf") || fileType?.includes("document")) {
    return { icon: FileText, accent: "bg-indigo-50 text-indigo-600", label: "Document" }
  }
  if (fileType?.includes("zip")) {
    return { icon: FileArchive, accent: "bg-rose-50 text-rose-600", label: "Archive" }
  }
  return { icon: FileIcon, accent: "bg-slate-100 text-slate-600", label: "File" }
}

function formatFileSize(bytes?: number) {
  if (!bytes) return undefined
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}


"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  BarChart3,
  Users,
  FolderOpen,
  Menu,
  ChevronDown,
  Home,
  Upload,
  User,
  FileText,
  Shield,
  Images,
  MoreHorizontal,
} from "lucide-react"
import NotificationsPanel from "@/components/notifications-panel"
import { useWallet } from "@/components/wallet-provider"
import { WalletStatus } from "@/components/wallet-status"
import { ThemeToggle } from "@/components/theme-toggle"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useEffect, useRef } from "react"

const groupedNav = [
  {
    label: "Assets",
    icon: FolderOpen,
    items: [
      { href: ROUTES.Files, label: "Files" },
      { href: ROUTES.IPAssets, label: "IP Assets" },
      { href: ROUTES.Gallery, label: "Gallery" },
    ],
  },
  {
    label: "Reports",
    icon: BarChart3,
    items: [{ href: ROUTES.Analytics, label: "Analytics" }, { href: "/verify", label: "Verify" }],
  },
  {
    label: "Collaboration",
    icon: Users,
    items: [
      { href: "/collaboration", label: "Workspace" },
      { href: "/social", label: "Social" },
    ],
  },
]

const mobileDockItems = [
  { label: "Dashboard", icon: Home, href: ROUTES.Dashboard },
  { label: "Upload", icon: Upload, href: `${ROUTES.Files}?action=upload` },
]

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { address, isConnected, connect, disconnect, isConnecting } = useWallet()

  const handleConnectClick = async () => {
    try {
      await connect()
    } catch {
      // handled in provider
    }
  }

  const isDashboardActive = pathname === ROUTES.Dashboard

  return (
    <>
      <nav className="border-b bg-background/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                className="rounded-full px-2 py-1 text-primary font-bold text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                onClick={() => router.push(ROUTES.Home)}
                aria-label="Go to home"
              >
                StoryProof
              </button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                  <SheetHeader className="text-left">
                    <SheetTitle>Navigation</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <Link
                      href={ROUTES.Dashboard}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium",
                        pathname === ROUTES.Dashboard
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/80 hover:bg-muted",
                      )}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    {groupedNav.map((group) => (
                      <div key={group.label}>
                        <p className="text-xs uppercase text-muted-foreground mb-2">{group.label}</p>
                        <div className="space-y-2">
                          {group.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium",
                                pathname.startsWith(item.href)
                                  ? "bg-primary/10 text-primary"
                                  : "text-foreground/80 hover:bg-muted",
                              )}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
              <div className="hidden lg:flex items-center gap-1">
                <Button
                  asChild
                  size="sm"
                  variant={isDashboardActive ? "default" : "ghost"}
                  className={cn(
                    "gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                    isDashboardActive && "shadow-sm ring-1 ring-primary/30",
                  )}
                >
                  <Link href={ROUTES.Dashboard}>
                    <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                    Dashboard
                  </Link>
                </Button>
                {groupedNav.map((group) => {
                  const Icon = group.icon
                  const isActive = group.items.some((item) => pathname.startsWith(item.href))
                  return (
                    <DropdownMenu key={group.label}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!isConnected}
                          aria-disabled={!isConnected}
                          className={cn(
                            "gap-2 rounded-full px-4 py-2 text-sm font-semibold",
                            isActive && "bg-primary/10 text-primary shadow-sm",
                          )}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          {group.label}
                          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {group.items.map((item) => (
                          <DropdownMenuItem asChild key={item.href}>
                            <Link href={item.href}>{item.label}</Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WalletStatus />
              <ThemeToggle />
              {isConnected && address && <NotificationsPanel address={address} />}
              <Button
                variant={isConnected ? "destructive" : "default"}
                size="sm"
                onClick={isConnected ? disconnect : handleConnectClick}
                disabled={isConnecting}
              >
                {isConnected ? "Disconnect" : isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <div className="lg:hidden fixed bottom-0 inset-x-0 border-t bg-background/95 backdrop-blur z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          {mobileDockItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href.replace(/\?.*/, ""))
            return (
              <Button
                key={item.label}
                variant="ghost"
                size="icon"
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-4 py-2 text-xs font-medium text-muted-foreground",
                  isActive && "text-primary",
                )}
                onClick={() => router.push(item.href)}
                aria-label={item.label}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </Button>
            )
          })}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="flex flex-col items-center gap-1 rounded-2xl px-4 py-2 text-xs font-medium text-muted-foreground"
                aria-label="Profile and more"
              >
                <User className="h-4 w-4" aria-hidden="true" />
                <span>Profile</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[ROUTES.Files, ROUTES.IPAssets, ROUTES.Gallery, ROUTES.Analytics, "/collaboration", "/social"].map(
                (href) => {
                  const labelMap: Record<string, string> = {
                    [ROUTES.Files]: "Files",
                    [ROUTES.IPAssets]: "IP Assets",
                    [ROUTES.Gallery]: "Gallery",
                    [ROUTES.Analytics]: "Analytics",
                    "/collaboration": "Collaboration",
                    "/social": "Social",
                  }
                  return (
                    <DropdownMenuItem asChild key={href}>
                      <Link href={href}>{labelMap[href]}</Link>
                    </DropdownMenuItem>
                  )
                },
              )}
              <DropdownMenuItem asChild>
                <Link href="/verify">Verify</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  )
}

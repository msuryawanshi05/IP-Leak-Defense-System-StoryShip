"use client"

import { useState, useEffect, useMemo } from "react"
import FileUpload from "@/components/file-upload"
import VersionTimeline from "@/components/version-timeline"
import FileVerifier from "@/components/file-verifier"
import NetworkSelector from "@/components/network-selector"
import { getVersionCheckpoints } from "@/lib/blockchain"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useCountUp } from "@/hooks/use-count-up"
import {
  UploadCloud, History, ShieldCheck, Wifi,
  X, Plus, Loader2, FilePlus2, Keyboard,
  CheckCircle2, AlertCircle, Cloud, Link2
} from "lucide-react"
import { toast } from "sonner"

interface DashboardProps {
  address: string | null
}

type DashTab = "files" | "upload" | "verify" | "network"

/* ── Animated stat cell ── */
function StatCell({ label, numericValue, displayValue, accent }: {
  label: string
  numericValue?: number
  displayValue?: string
  accent: boolean
}) {
  const { value, ref } = useCountUp(numericValue ?? 0, 1000)
  const shown = numericValue !== undefined ? value.toString() : (displayValue ?? "—")

  return (
    <div className="glass-card p-4 text-center group">
      <p
        ref={numericValue !== undefined ? ref : undefined}
        className={`text-2xl font-bold tabular-nums transition-all duration-300 ${accent ? "gradient-text" : "text-foreground"}`}
      >
        {shown}
      </p>
      <p className="text-xs text-muted-foreground mt-1 group-hover:text-foreground/70 transition-colors">{label}</p>
    </div>
  )
}

export default function Dashboard({ address }: DashboardProps) {
  const [versions, setVersions] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<DashTab>("files")
  const [isLoading, setIsLoading] = useState(true)
  const [showShortcuts, setShowShortcuts] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!address) return
      try {
        const checkpoints = getVersionCheckpoints(address)
        if (checkpoints.length > 0) {
          const loaded = checkpoints.map((cp: any, idx: number) => ({
            id: idx,
            name: cp.fileName || cp.versionNote || `File ${idx + 1}`,
            hash: cp.fileHash,
            timestamp: new Date(cp.timestamp * 1000),
            author: cp.author,
            notes: cp.versionNote,
            size: cp.fileSize || 0,
            ipfsCid: cp.ipfsCid,
            transactionHash: cp.transactionHash,
            blockNumber: cp.blockNumber,
            encryptedHash: cp.encryptedHash,
            ipAssetId: cp.ipAssetId,
          }))
          setVersions(loaded.reverse())
        }
      } catch (err) {
        console.error("Failed to load versions:", err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [address])

  const handleFileUploaded = (newVersion: any) => {
    setVersions((prev) => [newVersion, ...prev])
    setActiveTab("files")
  }

  // ── Keyboard Shortcuts ──
  const shortcuts = useMemo(() => ({
    "ctrl+u": () => { setActiveTab("upload"); toast.info("Upload", { description: "Opened via Ctrl+U" }) },
    "ctrl+v": () => { setActiveTab("verify"); toast.info("Verify", { description: "Opened via Ctrl+V" }) },
    "ctrl+n": () => { setActiveTab("network"); toast.info("Network", { description: "Opened via Ctrl+N" }) },
    "ctrl+f": () => { setActiveTab("files"); toast.info("My Files", { description: "Opened via Ctrl+F" }) },
    "ctrl+/": () => setShowShortcuts((v) => !v),
    "escape": () => setShowShortcuts(false),
  }), [])

  useKeyboardShortcuts(shortcuts)

  // Stats
  const totalFiles = versions.length
  const lastUpload = versions[0]?.timestamp
    ? new Date(versions[0].timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : null
  const verifiedCount = versions.filter((v) => v.transactionHash).length
  const isFirstUpload = totalFiles === 0

  // Integration status (env-var gated)
  const hasPinata = !!(process.env.NEXT_PUBLIC_PINATA_JWT)
  const hasStoryTestnet = process.env.NEXT_PUBLIC_USE_STORY_TESTNET === "true"

  const TABS: { id: DashTab; label: string; Icon: any; badge?: number; shortcut: string }[] = [
    { id: "files", label: "My Files", Icon: History, badge: totalFiles > 0 ? totalFiles : undefined, shortcut: "⌃F" },
    { id: "upload", label: "Upload New", Icon: FilePlus2, shortcut: "⌃U" },
    { id: "verify", label: "Verify File", Icon: ShieldCheck, shortcut: "⌃V" },
    { id: "network", label: "Network", Icon: Wifi, shortcut: "⌃N" },
  ]

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCell label="Total Files" numericValue={totalFiles} accent={false} />
        <StatCell label="On-Chain Verified" numericValue={verifiedCount} accent={true} />
        <StatCell label="Last Upload" displayValue={lastUpload || "—"} accent={false} />
        <StatCell label="Network" displayValue="Story" accent={true} />
      </div>

      {/* ── Integration status bar ── */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Pinata IPFS */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
          hasPinata
            ? "bg-emerald-400/10 border-emerald-400/25 text-emerald-400"
            : "bg-secondary border-border text-muted-foreground"
        }`}>
          <Cloud size={11} />
          {hasPinata ? (
            <><CheckCircle2 size={10} /> IPFS: Pinata</>
          ) : (
            <><AlertCircle size={10} /> IPFS: Mock CID</>
          )}
        </div>

        {/* Story Protocol */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
          hasStoryTestnet
            ? "bg-primary/10 border-primary/25 text-primary"
            : "bg-secondary border-border text-muted-foreground"
        }`}>
          <ShieldCheck size={11} />
          {hasStoryTestnet ? (
            <><CheckCircle2 size={10} /> Story: Odyssey Testnet</>
          ) : (
            <><AlertCircle size={10} /> Story: Local Fallback</>
          )}
        </div>

        {!hasPinata && (
          <span className="text-[10px] text-muted-foreground hidden sm:inline">
            Add <code className="font-mono bg-secondary px-1 rounded">NEXT_PUBLIC_PINATA_JWT</code> to .env.local for real IPFS
          </span>
        )}
      </div>

      {/* ── Tab nav ── */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary/50 border border-border overflow-x-auto">
        {TABS.map(({ id, label, Icon, badge, shortcut }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            id={`dashboard-tab-${id}`}
            title={`${label} (${shortcut})`}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
              activeTab === id
                ? "bg-background text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            <Icon size={15} />
            {label}
            {badge !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ml-0.5 ${
                activeTab === id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                {badge}
              </span>
            )}
            {/* Shortcut hint — only visible on hover/active (desktop) */}
            <span className={`hidden lg:inline text-[9px] font-mono ml-0.5 transition-opacity ${
              activeTab === id ? "opacity-50" : "opacity-0 group-hover:opacity-30"
            }`}>
              {shortcut}
            </span>
          </button>
        ))}

        {/* Keyboard shortcut help button */}
        <button
          onClick={() => setShowShortcuts((v) => !v)}
          title="Keyboard shortcuts (Ctrl+/)"
          className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-background/50 transition-all duration-200 flex-shrink-0"
        >
          <Keyboard size={13} />
          <span className="hidden sm:inline">⌃/</span>
        </button>
      </div>

      {/* ── Keyboard shortcuts panel ── */}
      {showShortcuts && (
        <div className="glass-card p-5 animate-fade-in-up border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Keyboard size={16} className="text-primary" />
              <p className="font-semibold text-foreground text-sm">Keyboard Shortcuts</p>
            </div>
            <button onClick={() => setShowShortcuts(false)} className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { key: "Ctrl + F", action: "My Files tab" },
              { key: "Ctrl + U", action: "Upload tab" },
              { key: "Ctrl + V", action: "Verify tab" },
              { key: "Ctrl + N", action: "Network tab" },
              { key: "Ctrl + /", action: "Toggle shortcuts" },
              { key: "Escape", action: "Close panels" },
            ].map(({ key, action }) => (
              <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/40 border border-border/50">
                <kbd className="px-2 py-0.5 rounded-md bg-secondary border border-border text-xs font-mono text-foreground">
                  {key}
                </kbd>
                <span className="text-xs text-muted-foreground">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab content ── */}
      {activeTab === "files" && (
        <div className="space-y-4 animate-fade-in">
          {isLoading ? (
            <div className="glass-card p-16 text-center">
              <Loader2 size={32} className="mx-auto text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Loading your files…</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse-glow">
                <UploadCloud size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No Files Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
                Upload your first creative file to start building your on-chain IP portfolio.
              </p>
              <button
                onClick={() => setActiveTab("upload")}
                className="btn-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
              >
                <Plus size={16} />
                Upload First File
              </button>
              <p className="text-xs text-muted-foreground mt-4">
                Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border font-mono text-xs">Ctrl+U</kbd> to open upload instantly
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Your IP Portfolio</h2>
                  <p className="text-sm text-muted-foreground">
                    {versions.length} file{versions.length !== 1 ? "s" : ""} registered on-chain
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("upload")}
                  className="btn-glow flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
                >
                  <Plus size={16} />
                  Upload New
                </button>
              </div>
              <VersionTimeline versions={versions} />
            </>
          )}
        </div>
      )}

      {activeTab === "upload" && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-foreground">Upload & Register IP</h2>
              <p className="text-sm text-muted-foreground">
                Hash, encrypt, and record your file on the Story blockchain
              </p>
            </div>
            <button
              onClick={() => setActiveTab("files")}
              className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Cancel (Escape)"
            >
              <X size={18} />
            </button>
          </div>
          <div className="glass-card p-6">
            <FileUpload
              address={address}
              onUploaded={handleFileUploaded}
              isFirstUpload={isFirstUpload}
            />
          </div>
        </div>
      )}

      {activeTab === "verify" && (
        <div className="animate-fade-in">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-foreground">Standalone File Verification</h2>
            <p className="text-sm text-muted-foreground">
              Verify any file against a known SHA-256 hash to check authenticity
            </p>
          </div>
          <StandaloneVerifier />
        </div>
      )}

      {activeTab === "network" && (
        <div className="animate-fade-in">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-foreground">Network & Chain Settings</h2>
            <p className="text-sm text-muted-foreground">
              Connect to Story Protocol networks for IP Asset registration
            </p>
          </div>
          <NetworkSelector />
        </div>
      )}
    </div>
  )
}

/* ── Standalone Verifier panel ── */
function StandaloneVerifier() {
  const [hash, setHash] = useState("")
  const [showVerifier, setShowVerifier] = useState(false)

  return (
    <div className="space-y-4">
      {!showVerifier ? (
        <div className="glass-card p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter the expected SHA-256 hash of the file you want to verify, then upload the file to check it.
          </p>
          <div>
            <label htmlFor="expected-hash-input" className="block text-sm font-medium mb-2 text-foreground">
              Expected SHA-256 Hash
            </label>
            <input
              id="expected-hash-input"
              type="text"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              placeholder="a3f5b8c9d2e1f4a6b7c8d9e0f1a2b3c4…"
              className="w-full px-4 py-3 border border-input rounded-xl bg-input text-foreground font-mono text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Find the hash in your version history or from the file owner.
            </p>
          </div>
          <button
            onClick={() => setShowVerifier(true)}
            disabled={hash.length < 16}
            className="btn-glow w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            id="start-verify-btn"
          >
            <ShieldCheck size={16} />
            Start Verification
          </button>
          <div className="border-t border-border/50 pt-4">
            <p className="text-xs text-muted-foreground">
              💡 <strong className="text-foreground">Tip:</strong> You can also verify files directly from version details — click any file in "My Files" tab, then use the "Verify File" tab inside the details panel.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-mono">{hash.slice(0, 24)}…</p>
            <button
              onClick={() => { setShowVerifier(false); setHash("") }}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <X size={12} />
              Change Hash
            </button>
          </div>
          <div className="glass-card p-6">
            <FileVerifier expectedHash={hash} />
          </div>
        </div>
      )}
    </div>
  )
}

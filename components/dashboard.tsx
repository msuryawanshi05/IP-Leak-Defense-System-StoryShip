"use client"

import { useState, useEffect, useMemo } from "react"
import FileUpload from "@/components/file-upload"
import VersionTimeline from "@/components/version-timeline"
import FileVerifier from "@/components/file-verifier"
import NetworkSelector from "@/components/network-selector"
import { getVersionCheckpoints } from "@/lib/blockchain"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useCountUp } from "@/hooks/use-count-up"
import { useStoryNetwork, STORY_ODYSSEY } from "@/components/story-network-guard"
import {
  UploadCloud, History, ShieldCheck, Wifi,
  X, Plus, Loader2, FilePlus2, Keyboard,
  CheckCircle2, AlertCircle, Cloud, ExternalLink
} from "lucide-react"
import { toast } from "sonner"

interface DashboardProps {
  address: string | null
  onConnect?: (addr: string) => void
}

type DashTab = "files" | "upload" | "verify" | "network"

const SAMPLE_VERSIONS = [
  {
    id: 9001,
    name: "Nexus_Chronicles_Pilot_Script_v2.pdf",
    hash: "a7f8c2d94e1b6a3f90c4e8215d7b3a9f6e02c4d8a1b5f9e7c3d0a2b4c6e8f012",
    timestamp: new Date(Date.now() - 86400 * 1000 * 2),
    author: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    notes: "Final Act II revision with registered character lore & world-building bible",
    size: 482304,
    ipfsCid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    transactionHash: "0x4f9b2c81a0d73e55c1f28b9a3d6e0f124c7890a1b2c3d4e5f60718293a4b5c6d",
    blockNumber: 1849204,
    encryptedHash: "c4e8215d7b3a9f6e02c4d8a1b5f9e7c3d0a2b4c6e8f012a7f8c2d94e1b6a3f90",
    ipAssetId: "0xB1e2409A7c12D88E56F01a42c982eA045d3F7812",
  },
  {
    id: 9002,
    name: "Nexus_Chronicles_Pilot_Script_v1.pdf",
    hash: "3b1e904d8c7a2f56b1d3e9804c2a7f15d6e8b0a3c5f791e2d4b6a8c0e2f41638",
    timestamp: new Date(Date.now() - 86400 * 1000 * 7),
    author: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    notes: "Initial treatment & chapter outline timestamped before pitch deck sharing",
    size: 319488,
    ipfsCid: "bafybeihkoviema7g3gxyt6la7vd5ho32ictqbilu3wnlo3rs7ewhnp7lly",
    transactionHash: "0x9a1d4f62c8e03b77a5c49d2e1b8f0a367d8901c2e3f4a5b6c7d8e9f0a1b2c3d4",
    blockNumber: 1821590,
    encryptedHash: "d6e8b0a3c5f791e2d4b6a8c0e2f416383b1e904d8c7a2f56b1d3e9804c2a7f15",
    ipAssetId: "0x9F217c4E8201a7B4D501c88F23a601b9E472c310",
  },
]

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

export default function Dashboard({ address, onConnect }: DashboardProps) {
  const [versions, setVersions] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<DashTab>("files")
  const [isLoading, setIsLoading] = useState(true)
  const [showShortcuts, setShowShortcuts] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        if (!address) {
          setVersions(SAMPLE_VERSIONS)
          return
        }
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
        } else {
          setVersions([])
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

  // Live Story Odyssey network status
  const { isStoryOdyssey, chainId: connectedChainId } = useStoryNetwork()

  const TABS: { id: DashTab; label: string; Icon: any; badge?: number; shortcut: string }[] = [
    { id: "files", label: "My Files", Icon: History, badge: totalFiles > 0 ? totalFiles : undefined, shortcut: "⌃F" },
    { id: "upload", label: "Upload New", Icon: FilePlus2, shortcut: "⌃U" },
    { id: "verify", label: "Verify File", Icon: ShieldCheck, shortcut: "⌃V" },
    { id: "network", label: "Network", Icon: Wifi, shortcut: "⌃N" },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {!address && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/25 text-xs">
          <div className="flex items-center gap-2 text-foreground">
            <ShieldCheck size={15} className="text-primary flex-shrink-0" />
            <span>
              <strong>Preview &amp; Verification Mode:</strong> Browse sample on-chain IP records and verify any file&apos;s SHA-256 hash freely. Connect MetaMask only when uploading or registering new IP.
            </span>
          </div>
          <button
            onClick={() => setActiveTab("verify")}
            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Verify a File Now
          </button>
        </div>
      )}

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCell label="Total Files" numericValue={totalFiles} accent={false} />
        <StatCell label="On-Chain Verified" numericValue={verifiedCount} accent={true} />
        <StatCell label="Last Upload" displayValue={lastUpload || "—"} accent={false} />
        <StatCell label="Network" displayValue="Story" accent={true} />
      </div>

      {/* ── Integration status bar ── */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* IPFS badge — always public gateway */}
        <div 
          title="Using Pinata's free public IPFS gateway to pin and access content-addressed encrypted files."
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-400/10 border-emerald-400/25 text-emerald-400 cursor-help"
        >
          <Cloud size={11} />
          <CheckCircle2 size={10} /> IPFS: Public Gateway
        </div>

        {/* Story Protocol — live chain check */}
        <div 
          title={
            isStoryOdyssey
              ? "Connected to Story Odyssey Testnet (Chain 1513). You are ready to register files on-chain."
              : connectedChainId
                ? `Connected to chain ${connectedChainId}. Please switch MetaMask to Story Odyssey Testnet (Chain 1513) to register IP Assets.`
                : "No wallet connected. Connect your wallet using the 'Connect Wallet' button to register IP Assets on Story Odyssey."
          }
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-help ${
            isStoryOdyssey
              ? "bg-primary/10 border-primary/25 text-primary"
              : connectedChainId
                ? "bg-amber-400/10 border-amber-400/25 text-amber-400"
                : "bg-secondary border-border text-muted-foreground"
          }`}
        >
          <ShieldCheck size={11} />
          {isStoryOdyssey ? (
            <><CheckCircle2 size={10} /> Story: Odyssey Testnet</>
          ) : connectedChainId ? (
            <><AlertCircle size={10} /> Story: Wrong Network (Chain {connectedChainId})</>
          ) : (
            <><AlertCircle size={10} /> Story: No Wallet</>
          )}
        </div>

        {/* Testnet explorer link when connected */}
        {isStoryOdyssey && (
          <a
            href={STORY_ODYSSEY.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink size={9} /> Explorer
          </a>
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
              onConnect={onConnect}
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
              Find the hash in your version history or from the file owner.{" "}
              <button
                type="button"
                onClick={() => setHash(SAMPLE_VERSIONS[0].hash)}
                className="text-primary hover:underline font-medium"
              >
                Use sample v1 hash
              </button>
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
              💡 <strong className="text-foreground">Tip:</strong> You can also verify files directly from version details by clicking any file in the "My Files" tab and using the "Verify File" tab inside the details panel.
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

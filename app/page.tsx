"use client"

import { useState, useEffect, useRef } from "react"
import WalletConnect from "@/components/wallet-connect"
import Dashboard from "@/components/dashboard"
import ThemeToggle from "@/components/theme-toggle"
import { Shield, Zap, Lock, GitBranch, ChevronRight, Layers, Globe, CheckCircle2 } from "lucide-react"

/* ── scroll-reveal hook ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { el.classList.add("visible"); obs.disconnect() }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

function RevealSection({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string
}) {
  const ref = useReveal()
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

function Orb({ className }: { className?: string }) {
  return <div className={`absolute rounded-full pointer-events-none ${className}`} style={{ filter: "blur(80px)" }} />
}

const STEPS = [
  { step: "01", icon: Globe, title: "Connect Wallet", desc: "Link your MetaMask or Web3 wallet to authenticate your identity on-chain." },
  { step: "02", icon: Layers, title: "Upload Work", desc: "Drag & drop your story, script, concept art, or any creative file." },
  { step: "03", icon: Lock, title: "Hash & Encrypt", desc: "SHA-256 fingerprint + AES-GCM encryption applied client-side before upload." },
  { step: "04", icon: Shield, title: "Record On-Chain", desc: "Your proof is stored forever as a Story Protocol IP Asset on-chain." },
]

const FEATURES = [
  { icon: Shield, title: "Cryptographic Proof", desc: "SHA-256 file hashing creates an immutable fingerprint of your work. Any modification is instantly detectable.", color: "primary" },
  { icon: GitBranch, title: "Version History", desc: "Complete audit trail of every edit. Compare versions, track changes, and prove timeline of creation.", color: "accent" },
  { icon: Zap, title: "Story Protocol IP", desc: "Register files as IP Assets on Story Protocol Odyssey Testnet. Programmable licensing and royalty distribution ready.", color: "primary" },
  { icon: Lock, title: "AES-GCM Encryption", desc: "Files are encrypted on your device before upload. Only you hold the decryption key.", color: "accent" },
  { icon: Globe, title: "IPFS Decentralized", desc: "Encrypted copies stored on IPFS via Pinata for permanent, censorship-resistant, content-addressed storage.", color: "primary" },
  { icon: CheckCircle2, title: "Instant Verification", desc: "Re-hash any file to verify authenticity. Compare computed hash against blockchain record in seconds.", color: "accent" },
]

const STATS = [
  { label: "SHA-256 Security", value: "256-bit" },
  { label: "Encryption", value: "AES-GCM" },
  { label: "Blockchain", value: "Story" },
  { label: "Storage", value: "IPFS" },
]

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showApp, setShowApp] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleConnect = (addr: string) => { setAddress(addr); setIsConnected(true); setShowApp(true) }
  const handleDisconnect = () => { setAddress(null); setIsConnected(false); setShowApp(false) }

  if (!mounted) return null

  /* ── DASHBOARD VIEW ── */
  if (showApp) {
    return (
      <main className="min-h-screen bg-background">
        {/* App Header */}
        <header className="sticky top-0 z-50 glass border-b border-[var(--glass-border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center gap-4">
            <button onClick={() => setShowApp(false)} className="group flex items-center gap-2 text-left">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <Shield size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold gradient-text leading-none">StoryProof</p>
                <p className="text-[10px] text-muted-foreground leading-none mt-0.5 hidden sm:block">IP on Story blockchain</p>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <ThemeToggle compact />
              {isConnected && address ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="network-pill hidden sm:inline-flex">
                    <span className="dot" />
                    Story Testnet
                  </span>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-[var(--glass-border)]">
                    <div className="w-2 h-2 rounded-full bg-[var(--success)] shadow-[0_0_6px_oklch(0.68_0.18_145)]" />
                    <span className="font-mono text-xs text-foreground">
                      {address.slice(0, 6)}&hellip;{address.slice(-4)}
                    </span>
                    <button
                      onClick={handleDisconnect}
                      className="ml-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                      title="Disconnect"
                    >
                      &#x2715;
                    </button>
                  </div>
                </div>
              ) : (
                <WalletConnect onConnect={handleConnect} compact />
              )}
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {isConnected ? (
            <Dashboard address={address} />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
              <div className="glass-card p-10 sm:p-12 text-center max-w-md w-full animate-fade-in-up">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center animate-pulse-glow">
                  <Shield size={28} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-3 gradient-text">Connect Your Wallet</h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Connect your wallet to access your IP portfolio, upload files, and register proof on-chain.
                </p>
                <WalletConnect onConnect={handleConnect} />
              </div>
            </div>
          )}
        </div>
      </main>
    )
  }

  /* ── LANDING PAGE ── */
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 glass border-b border-[var(--glass-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Shield size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold gradient-text leading-none">StoryProof</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5 hidden sm:block">IP on Story blockchain</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <button
              onClick={() => {
                const el = document.getElementById("how-it-works")
                el?.scrollIntoView({ behavior: "smooth" })
              }}
              className="btn-glow px-4 sm:px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:bg-primary/90"
            >
              <span className="hidden sm:inline">How It Works ↓</span>
              <span className="sm:hidden">How?</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="hero-bg relative min-h-[92vh] flex flex-col items-center justify-center px-4 pt-8 pb-20">
        <div className="absolute inset-0 grid-bg" />
        <Orb className="w-96 h-96 top-[-5%] left-[-5%] bg-primary/25 animate-orb-drift" />
        <Orb className="w-80 h-80 bottom-[-5%] right-[-5%] bg-accent/20 animate-orb-drift animation-delay-500" />
        <Orb className="w-64 h-64 top-[40%] right-[15%] bg-primary/15 animate-float-slow" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/25 text-sm font-medium text-primary">
            <Zap size={14} className="animate-bounce-subtle" />
            Ship It On Story: Hackday Edition
          </div>

          <h1 className="animate-fade-in-up animation-delay-100 text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] mb-6 tracking-tight">
            <span className="gradient-text-shimmer">Your Creative Work</span>
            <br />
            <span className="text-foreground">Deserves Proof</span>
          </h1>

          <p className="animate-fade-in-up animation-delay-200 text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            In a world of AI-generated content and invisible ownership trails, creators need{" "}
            <span className="text-foreground font-medium">transparent, immutable proof</span> on the blockchain.
            Welcome to StoryProof — where your IP lives forever.
          </p>

          <div className="animate-fade-in-up animation-delay-300 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <WalletConnect onConnect={handleConnect} />
            <button
              onClick={() => {
                const el = document.getElementById("how-it-works")
                el?.scrollIntoView({ behavior: "smooth" })
              }}
              className="group flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-medium hover:border-primary/50 hover:text-primary transition-all duration-200"
            >
              How It Works
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="animate-fade-in-up animation-delay-400 mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map((stat) => (
              <div key={stat.label} className="glass-card p-4 text-center">
                <p className="text-lg font-bold gradient-text">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-subtle">
          <span className="text-xs text-muted-foreground">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-border flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-muted-foreground animate-scroll-dot" />
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM ── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-4 block">The Problem</span>
              <h2 className="text-4xl font-bold mb-6 text-foreground leading-tight">Ownership is Invisible Without Proof</h2>
              <div className="space-y-4">
                {[
                  "No one can verify who created it first",
                  "No record of who accessed or used the work",
                  "No proof of original creation timestamp",
                  "AI-generated content blurs ownership completely",
                  "No transparent audit trail or version history",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <div className="w-5 h-5 rounded-full border border-destructive/50 flex items-center justify-center mt-0.5 flex-shrink-0 group-hover:border-destructive transition-colors">
                      <span className="text-destructive text-xs font-bold">&#x2715;</span>
                    </div>
                    <p className="text-muted-foreground group-hover:text-foreground transition-colors">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-8 border-destructive/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Real Scenario</span>
              </div>
              <blockquote className="text-lg text-foreground font-medium leading-relaxed mb-4 italic">
                &quot;I uploaded my AI art concept 3 months ago. Now multiple creators claim ownership. How do I prove I was first?&quot;
              </blockquote>
              <p className="text-sm text-muted-foreground">
                This is the reality for thousands of creators. Stories get stolen, copied, and resold without consequence.
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── THE SOLUTION ── */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="grid md:grid-cols-2 gap-16 items-center">
            <div className="glass-card p-8 border-primary/20 order-2 md:order-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">StoryProof</span>
              </div>
              <p className="text-xl font-semibold text-foreground mb-3 leading-snug">
                Blockchain-backed proof of authorship &amp; version history powered by Story Protocol
              </p>
              <p className="text-muted-foreground">
                Every version is hashed, encrypted, and recorded on-chain forever. Immutable. Verifiable. Yours.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-4 block">The Solution</span>
              <h2 className="text-4xl font-bold mb-6 text-foreground leading-tight">Immutable Blockchain Records for Every Creator</h2>
              <div className="space-y-4">
                {[
                  ["Cryptographic proof", "recorded on Story blockchain"],
                  ["Timestamp verification", "for every version created"],
                  ["On-chain records", "that can't be altered or stolen"],
                  ["Version history", "traceable back to first creation"],
                  ["IP ownership proof", "you can share with the world"],
                ].map(([bold, rest], i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mt-0.5 flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                      <span className="text-primary text-xs font-bold">&#x2713;</span>
                    </div>
                    <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                      <strong className="text-foreground font-semibold">{bold}</strong> {rest}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-16">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-4 block">Process</span>
            <h2 className="text-4xl font-bold text-foreground">How StoryProof Works</h2>
          </RevealSection>
          <div className="grid md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px">
              <div className="h-full timeline-line" />
            </div>
            {STEPS.map((s, i) => {
              const Icon = s.icon
              return (
                <RevealSection key={s.step} delay={i * 100}>
                  <div className="glass-card p-6 text-center group cursor-default relative z-10">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center group-hover:bg-primary/25 group-hover:border-primary/50 group-hover:animate-pulse-glow transition-all duration-300">
                      <Icon size={22} className="text-primary" />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground mb-2 block">{s.step}</span>
                    <h3 className="font-bold text-foreground mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </RevealSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent via-accent/[0.03] to-transparent">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-16">
            <span className="text-xs font-semibold text-accent uppercase tracking-widest mb-4 block">Capabilities</span>
            <h2 className="text-4xl font-bold text-foreground">Everything You Need to Protect Your IP</h2>
          </RevealSection>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              const isAccent = f.color === "accent"
              return (
                <RevealSection key={f.title} delay={i * 80}>
                  <div className="glass-card p-6 h-full group cursor-default">
                    <div className={`w-12 h-12 mb-4 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isAccent
                        ? "bg-accent/15 border border-accent/25 group-hover:bg-accent/25 group-hover:border-accent/50"
                        : "bg-primary/15 border border-primary/25 group-hover:bg-primary/25 group-hover:border-primary/50"
                    }`}>
                      <Icon size={20} className={isAccent ? "text-accent" : "text-primary"} />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </RevealSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── STORY PROTOCOL CALLOUT ── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <RevealSection>
            <div className="gradient-border">
              <div className="glass-card p-10 sm:p-12 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/25 text-sm font-medium text-primary mb-6">
                  <Zap size={14} />
                  Built for Ship It On Story: Hackday
                </div>
                <h2 className="text-3xl font-bold mb-4 text-foreground">Powering IP in the Age of AI</h2>
                <p className="text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                  This project demonstrates how blockchain technology (powered by Story Protocol) can revolutionize IP protection.
                  No more hidden ownership trails. No more stolen stories. Every creator deserves proof.
                </p>
                <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  {[
                    { label: "For Creators", desc: "Prove you created first. Show the world your complete version history." },
                    { label: "For IP", desc: "Establish immutable ownership records. Prevent disputes with cryptographic proof." },
                    { label: "For Story Network", desc: "Prove blockchain is the future of digital rights management." },
                  ].map((c) => (
                    <div key={c.label} className="p-5 rounded-xl bg-background/40 border border-border/50 hover:border-primary/30 transition-colors">
                      <p className="font-semibold text-foreground mb-2">{c.label}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 border-t border-border/50">
        <div className="max-w-3xl mx-auto text-center">
          <RevealSection>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-foreground leading-tight">
              Ready to{" "}
              <span className="gradient-text-shimmer">Ship Your Story?</span>
            </h2>
            <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
              Connect your wallet and start proving your IP ownership today.
              Build your on-chain portfolio and claim what&apos;s yours.
            </p>
            <WalletConnect onConnect={handleConnect} />
            <p className="text-xs text-muted-foreground mt-8">
              Part of Ship It On Story: Hackday &mdash; Understanding and Powering IP in Nagpur
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-primary" />
            <span className="text-sm font-semibold gradient-text">StoryProof</span>
            <span className="text-sm text-muted-foreground">&mdash; IP on Story Blockchain</span>
          </div>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <span className="text-xs text-muted-foreground">Built with &#x2764;&#xFE0F; for Story Hackday, Nagpur</span>
          </div>
        </div>
      </footer>
    </main>
  )
}

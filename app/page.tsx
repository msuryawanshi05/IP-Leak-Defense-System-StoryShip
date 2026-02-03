"use client"

import { useRef, type MouseEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import WalletConnect from "@/components/wallet-connect"
import { useWallet } from "@/components/wallet-provider"
import { cn } from "@/lib/utils"

const shortcuts = [
  { title: "Dashboard", desc: "Overview & stats", icon: "📈", href: "/dashboard" },
  { title: "Files", desc: "Manage and track your files", icon: "📁", href: "/files" },
  { title: "IP Assets", desc: "View registered assets", icon: "🛡️", href: "/assets" },
  { title: "Gallery", desc: "Visual previews and AI checks", icon: "🖼️", href: "/gallery" },
  { title: "Analytics", desc: "Network fees & stats", icon: "📊", href: "/analytics" },
  { title: "Collaboration", desc: "Full co-creation suite", icon: "👥", href: "/collaboration" },
  { title: "Social", desc: "Portfolios & followers", icon: "🌐", href: "/social" },
  { title: "Verify", desc: "Public verification portal", icon: "✅", href: "/verify" },
]

export default function Home() {
  const router = useRouter()
  const { isConnected, address, isInitializing } = useWallet()
  const connectCTARef = useRef<HTMLDivElement>(null)

  const handleShortcutClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isConnected) {
      event.preventDefault()
      connectCTARef.current?.scrollIntoView({ behavior: "smooth" })
  }
  }

  if (isInitializing) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading StoryProof…</p>
      </main>
    )
  }

  // Show landing page
    return (
      <main className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1
                className="text-2xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                StoryProof
              </h1>
              <p className="text-xs text-muted-foreground">Prove your IP ownership on-chain with Story</p>
            </div>
          <Link href="/verify">
            <Button variant="outline">
              Verify
            </Button>
          </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-background to-secondary/5">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 inline-block px-4 py-2 bg-primary/10 rounded-full text-sm text-primary font-semibold">
            🛡️ Secure Your Creative Work with Blockchain Proof
            </div>
            <h2 className="text-5xl font-bold mb-6 text-foreground leading-tight">Your Creative Work Deserves Proof</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              In a world of AI-generated content and invisible ownership trails, creators need transparent, immutable
              proof on the blockchain. Welcome to StoryProof — where your IP lives forever.
            </p>
          <div ref={connectCTARef}>
            {!isConnected ? (
              <WalletConnect afterConnectPath="/dashboard" hideConnectedState />
            ) : (
              <div className="mt-2 flex justify-center">
                <Button onClick={() => router.push("/dashboard")}>Continue to Dashboard</Button>
              </div>
            )}
          </div>
          {!isConnected && (
            <p className="text-sm text-muted-foreground mt-4">
              No wallet? Install MetaMask and reconnect to unlock the full experience.
            </p>
          )}
          </div>
        </section>

        {/* The Problem */}
        <section className="py-16 px-4 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-3xl font-bold mb-6 text-foreground">The Problem</h3>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg">When creators upload stories, scripts, or IP-related files:</p>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-destructive font-bold">✗</span>
                    <span>No one can verify who created it first</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-destructive font-bold">✗</span>
                    <span>No record of who accessed or used the work</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-destructive font-bold">✗</span>
                    <span>No proof of original creation timestamp</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-destructive font-bold">✗</span>
                    <span>AI-generated content blurs ownership lines completely</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-destructive font-bold">✗</span>
                    <span>No transparent audit trail or version history</span>
                  </li>
                </ul>
              </div>
            </div>
            <Card className="p-8 bg-secondary/20 border-secondary/30">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground font-semibold">Real Scenario:</div>
                <p className="italic text-foreground text-lg">
                  "I uploaded my AI art concept 3 months ago. Now multiple creators claim ownership. How do I prove I
                  was first? Where's my proof?"
                </p>
                <p className="text-sm text-muted-foreground">
                  This is the reality for thousands of creators. Stories get stolen, copied, and resold without
                  consequence.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* The Solution */}
        <section className="py-16 px-4 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Card className="p-8 bg-primary/10 border-primary/20 order-2 md:order-1">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground font-semibold">StoryProof:</div>
                <p className="font-semibold text-foreground text-lg">
                  Blockchain-backed proof of authorship & version history powered by Story
                </p>
                <p className="text-muted-foreground">
                  Every version is hashed, encrypted, and recorded on-chain forever. Immutable. Verifiable. Yours.
                </p>
              </div>
            </Card>
            <div className="order-1 md:order-2">
              <h3 className="text-3xl font-bold mb-6 text-foreground">The Solution</h3>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg">StoryProof creates an immutable blockchain record:</p>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <span>
                      <strong>Cryptographic proof</strong> recorded on Story blockchain
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <span>
                      <strong>Timestamp verification</strong> for every version created
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <span>
                      <strong>On-chain records</strong> that can't be altered or stolen
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <span>
                      <strong>Version history</strong> traceable back to first creation
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <span>
                      <strong>IP ownership proof</strong> you can share with the world
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

      {/* Quick Access Features */}
        <section className="py-16 px-4 bg-secondary/5">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold mb-4 text-center text-foreground">Quick Access</h3>
          <p className="text-center text-muted-foreground mb-12">
            {isConnected ? "Navigate anywhere instantly." : "Connect your wallet to unlock these sections."}
          </p>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {shortcuts.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                onClick={(event) => handleShortcutClick(event, item.href)}
                className={cn(
                  "group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl",
                )}
              >
                <Card
                  className={cn(
                    "p-6 text-center h-full flex flex-col justify-center items-center tile-hover",
                    !isConnected && "opacity-70 pointer-events-auto",
                  )}
                >
                  <div className="text-4xl mb-3" aria-hidden="true">
                    {item.icon}
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                  {!isConnected && (
                    <span className="mt-2 text-xs font-medium text-primary">Connect to activate</span>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold mb-12 text-center text-foreground">How StoryProof Works</h3>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  step: "1",
                  title: "Connect Wallet",
                  desc: "Link your Web3 wallet to get started",
                },
                {
                  step: "2",
                  title: "Upload Work",
                  desc: "Share your story, script, concept art, or any creative file",
                },
                {
                  step: "3",
                  title: "Hash & Encrypt",
                  desc: "System creates unique cryptographic proof of your work",
                },
                {
                  step: "4",
                  title: "Record On-Chain",
                  desc: "Your proof is stored forever on Story blockchain",
                },
              ].map((item) => (
                <Card key={item.step} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-4xl font-bold text-primary mb-3">{item.step}</div>
                  <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Story & IP Focus */}
        <section className="py-16 px-4 max-w-6xl mx-auto">
          <Card className="p-12 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-foreground">Powered by Story Protocol</h3>
              <p className="text-muted-foreground mb-6">
              StoryProof leverages blockchain technology to revolutionize IP protection.
                No more hidden ownership trails. No more stolen stories. Every creator deserves proof.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-background/50 rounded-lg">
                  <p className="font-semibold text-foreground mb-2">For Creators</p>
                  <p className="text-sm text-muted-foreground">
                    Prove you created first. Show the world your complete version history.
                  </p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg">
                  <p className="font-semibold text-foreground mb-2">For IP</p>
                  <p className="text-sm text-muted-foreground">
                    Establish immutable ownership records. Prevent disputes with cryptographic proof.
                  </p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg">
                  <p className="font-semibold text-foreground mb-2">For Story Network</p>
                  <p className="text-sm text-muted-foreground">
                    Prove blockchain is the future of digital rights management.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 border-t border-border">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-6 text-foreground">Ready to Ship Your Story?</h3>
            <p className="text-muted-foreground mb-8 text-lg">
              Connect your wallet and start proving your IP ownership today. Build your on-chain portfolio and claim
              what's yours.
            </p>
          {!isConnected ? (
            <WalletConnect afterConnectPath="/dashboard" hideConnectedState />
          ) : (
            <Button onClick={() => router.push("/dashboard")}>Continue to Dashboard</Button>
          )}
        </div>
      </section>
    </main>
  )
}

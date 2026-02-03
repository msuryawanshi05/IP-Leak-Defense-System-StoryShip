"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import WalletConnect from "@/components/wallet-connect"
import Dashboard from "@/components/dashboard"

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showApp, setShowApp] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleConnect = (connectedAddress: string) => {
    setAddress(connectedAddress)
    setIsConnected(true)
    setShowApp(true)
  }

  const handleDisconnect = () => {
    setAddress(null)
    setIsConnected(false)
    setShowApp(false)
  }

  if (!mounted) return null

  if (!showApp) {
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
            <Button variant="outline" onClick={() => setShowApp(true)}>
              Launch App
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-background to-secondary/5">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 inline-block px-4 py-2 bg-primary/10 rounded-full text-sm text-primary font-semibold">
              🚀 Ship It On Story: Hackday Edition
            </div>
            <h2 className="text-5xl font-bold mb-6 text-foreground leading-tight">Your Creative Work Deserves Proof</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              In a world of AI-generated content and invisible ownership trails, creators need transparent, immutable
              proof on the blockchain. Welcome to StoryProof — where your IP lives forever.
            </p>
            <Button size="lg" onClick={() => setShowApp(true)}>
              Connect Wallet & Get Started
            </Button>
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

        {/* How It Works */}
        <section className="py-16 px-4 bg-secondary/5">
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
              <h3 className="text-2xl font-bold mb-4 text-foreground">Built for Story: Hackday IP Challenge</h3>
              <p className="text-muted-foreground mb-6">
                This project demonstrates how blockchain technology (powered by Story) can revolutionize IP protection.
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
            <WalletConnect onConnect={handleConnect} />
            <p className="text-xs text-muted-foreground mt-6">
              Part of Ship It On Story: Hackday — Understanding and Powering IP in Nagpur
            </p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1
              className="text-3xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setShowApp(false)}
            >
              StoryProof
            </h1>
            <p className="text-sm text-muted-foreground">
              Your IP protected on Story blockchain — every edit, forever.
            </p>
          </div>
          {isConnected ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Connected</p>
                <p className="font-mono text-sm text-foreground">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
              <Button variant="outline" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
          ) : (
            <WalletConnect onConnect={handleConnect} />
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {isConnected ? (
          <Dashboard address={address} />
        ) : (
          <Card className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to StoryProof</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Connect your wallet to prove your IP ownership with blockchain-backed version history powered by Story.
            </p>
            <WalletConnect onConnect={handleConnect} />
          </Card>
        )}
      </div>
    </main>
  )
}

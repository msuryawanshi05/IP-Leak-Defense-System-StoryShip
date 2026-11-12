import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "StoryProof – Prove Your IP On-Chain",
  description:
    "Blockchain-backed proof of authorship and version history for creative works. Protect your IP with cryptographic proof, SHA-256 hashing, and Story Protocol integration.",
  keywords: [
    "IP protection",
    "blockchain",
    "authorship proof",
    "version control",
    "Story Protocol",
    "NFT",
    "creative ownership",
    "SHA-256",
    "IPFS",
  ],
  authors: [{ name: "StoryProof" }],
  openGraph: {
    title: "StoryProof – Prove Your IP On-Chain",
    description: "Protect your creative work with blockchain-backed IP proof powered by Story Protocol.",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }} suppressHydrationWarning>
      <head>
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: "(function(){try{var d=document.documentElement;d.classList.remove('dark');d.classList.add('light');localStorage.setItem('storyproof-theme','light');}catch(e){}})()" }} />
      </head>
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "oklch(0.12 0.01 264 / 0.95)",
              border: "1px solid oklch(0.30 0.05 264)",
              color: "oklch(0.96 0.005 264)",
              fontFamily: "'Space Grotesk', sans-serif",
              backdropFilter: "blur(16px)",
            },
          }}
          richColors
        />
        {!process.env.NEXT_PUBLIC_BASE_PATH && <Analytics />}
      </body>
    </html>
  )
}

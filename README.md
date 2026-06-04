# StoryProof — Blockchain IP Proof for Creators

> **Prove your creative IP ownership on-chain with Story Protocol.**  
> SHA-256 hashing · AES-GCM encryption · IPFS storage · Story Protocol IP Assets

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![Story Protocol](https://img.shields.io/badge/Story-Protocol-purple)](https://story.foundation)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Hackday](https://img.shields.io/badge/Ship%20It%20On-Story%20Hackday-orange)](https://story.foundation)

---

## What Is StoryProof?

StoryProof is a minimal, hackday-ready dApp that generates verifiable proof-of-ownership for creative files. Every upload produces a SHA-256 fingerprint, AES-GCM encrypted copy, IPFS content identifier, and optionally a Story Protocol IP Asset — all tied to your wallet address with a blockchain timestamp.

**Built for:** Ship It On Story: Hackday — Understanding and Powering IP (Nagpur, India)

---

## Features

| Feature | Status | Description |
|---|---|---|
| SHA-256 File Hashing | ✅ | Cryptographic fingerprint computed client-side |
| AES-GCM Encryption | ✅ | File encrypted before upload using wallet address as key |
| Drag & Drop Upload | ✅ | Visual drop zone with animated progress bar |
| IPFS Storage | ✅ | **Pinata** real upload (falls back to mock CID when JWT not set) |
| Story Protocol IP Asset | ✅ | `@story-protocol/core-sdk` mints + registers real IP Asset on Odyssey testnet |
| Version History | ✅ | Full audit trail with timeline view |
| File Download | ✅ | Re-download original from localStorage |
| File Verification | ✅ | Re-hash any file and compare to stored hash |
| Version Comparison | ✅ | Side-by-side diff of any two versions |
| MetaMask / Web3 Wallet | ✅ | Connect via ethers.js BrowserProvider |
| Network Switching | ✅ | Switch between Story, Ethereum, Polygon, Sepolia |
| Dark / Light Mode | ✅ | Theme toggle with system preference + FOUC prevention |
| Keyboard Shortcuts | ✅ | `Ctrl+F/U/V/N` navigate · `Ctrl+/` shortcut panel |
| PDF Certificate Export | ✅ | Branded A4 ownership certificate via jsPDF |
| Share Proof Link | ✅ | Public `/verify/[hash]` page — no wallet needed |
| File Type Icons | ✅ | 50+ file type icons with coloured badges in timeline |
| Confetti on Upload | ✅ | Celebration animation on first and subsequent uploads |
| Real Smart Contract Tx | ⚠️ | Needs MetaMask on Story Odyssey (chain 1513) |
| Real IPFS Upload | ⚠️ | Needs `NEXT_PUBLIC_PINATA_JWT` in .env.local |
| Programmable Licenses | 🔜 | On roadmap |

---

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui + Radix Primitives
- **Typography**: Space Grotesk + JetBrains Mono (Google Fonts)
- **Blockchain**: ethers v6 + Story Protocol integration
- **Storage**: localStorage (offline) + **Pinata** real IPFS uploads
- **Notifications**: Sonner toast
- **Forms**: React Hook Form + Zod

---

## Story Protocol — Network Details

| Network | Chain ID | RPC URL | Explorer |
|---|---|---|---|
| Story Mainnet | `1514` | `https://rpc.story.foundation` | `https://explorer.story.foundation` |
| Story Odyssey Testnet | `1513` | `https://odyssey.storyrpc.io` | `https://odyssey-testnet-explorer.storyrpc.io` |

> **Note:** Placeholder chain IDs (1337/1338) in earlier commits were incorrect. Use 1514/1513 above.

---

## Installation

```bash
# 1. Clone
git clone https://github.com/100arab/IP-Leak-Defense-System-StoryShip
cd IP-Leak-Defense-System-StoryShip

# 2. Install dependencies
pnpm install

# 3. Configure environment (optional — app works fully offline without this)
cp .env.local.example .env.local
# Edit .env.local with your values

# 4. Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

Create `.env.local` in project root (all optional — app runs in demo mode without them):

```env
# ── Story Protocol ──────────────────────────────
NEXT_PUBLIC_STORY_RPC_URL=https://rpc.story.foundation
NEXT_PUBLIC_STORY_EXPLORER=https://explorer.story.foundation
NEXT_PUBLIC_STORY_TESTNET_RPC_URL=https://odyssey.storyrpc.io
NEXT_PUBLIC_STORY_TESTNET_EXPLORER=https://odyssey-testnet-explorer.storyrpc.io

# Mainnet (1514) or Testnet (1513)
NEXT_PUBLIC_USE_STORY_TESTNET=true

# Deployed contract addresses (leave empty for localStorage fallback)
NEXT_PUBLIC_STORY_PROOF_CONTRACT=0xYourDeployedVersionRegistryContract
NEXT_PUBLIC_STORY_IP_ASSET_CONTRACT=0xStoryProtocolIPAssetContract

# ── IPFS via Pinata ─────────────────────────────
# Get JWT from: https://app.pinata.cloud → API Keys
NEXT_PUBLIC_PINATA_JWT=eyJhbGci...your_jwt_here
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud
```

> The app runs **fully offline** without any env vars.  
> Setting them enables: real blockchain transactions · real IPFS uploads · Story IP Asset registration.

---

## How It Works

```
User uploads file
      │
      ├─ SHA-256 hash computed (client-side)
      ├─ AES-GCM encryption applied
      ├─ Upload to IPFS (Web3.Storage / Pinata)
      ├─ Register as Story Protocol IP Asset
      ├─ Submit version checkpoint to smart contract
      └─ Store data in localStorage (fallback if no contract)
```

**Verification flow:**
```
Download file → Re-upload for verification → SHA-256 re-computed → 
Compare with stored hash → MATCH = authentic | MISMATCH = modified
```

---

## Available Scripts

```bash
pnpm dev       # Development server (localhost:3000)
pnpm build     # Production build
pnpm start     # Start production server
pnpm lint      # ESLint check
```

---

## Project Structure

```
├── app/
│   ├── globals.css          # Design system (glassmorphism, animations, fonts)
│   ├── layout.tsx           # Root layout (Space Grotesk, Toaster)
│   └── page.tsx             # Landing page + App router
├── components/
│   ├── dashboard.tsx        # Stats bar + 4-tab dashboard (Files/Upload/Verify/Network)
│   ├── file-upload.tsx      # Drag & drop upload with progress bar
│   ├── file-verifier.tsx    # SHA-256 hash verification tool
│   ├── network-selector.tsx # Network switcher (Story + other chains)
│   ├── version-comparison.tsx  # Side-by-side version diff
│   ├── version-detail-modal.tsx # (legacy, superseded by version-details)
│   ├── version-details.tsx  # Tabs: Details + Verify File
│   ├── version-timeline.tsx # IP portfolio timeline with glassmorphism cards
│   └── wallet-connect.tsx   # MetaMask connect with toast feedback
├── lib/
│   ├── blockchain.ts        # Version checkpoints + smart contract calls
│   ├── contracts.ts         # Network config + ABI definitions
│   ├── storage.ts           # File processing + IPFS upload
│   └── story-protocol.ts    # IP Asset registration helpers
└── README.md
```

---

## What's Mock vs Real

| Feature | Demo (no config) | Production (with config) |
|---|---|---|
| File hash (SHA-256) | ✅ Real | ✅ Real |
| File encryption | ✅ Real | ✅ Real |
| IPFS CID | Mock CID generated | ✅ Real IPFS via Pinata/Web3.Storage |
| Blockchain TX | Stored in localStorage | ✅ Real ethers.js tx via MetaMask |
| IP Asset ID | Mock ID | ✅ Real Story Protocol registration |
| Version history | ✅ localStorage | ✅ localStorage + on-chain |

---

## Roadmap

1. Deploy Story Proof version-registry contract to Story Odyssey testnet
2. Programmable IP Licenses (PILs) with royalty splits
3. AI-based similarity / plagiarism detection
4. Multi-wallet collaboration with permissioned sharing
5. Public verification portal (no wallet needed to verify)
6. Pinata integration (replace deprecated Web3.Storage)

---

## FAQ

**Port already in use?**
```bash
pnpm dev -- -p 3001
```

**pnpm install errors?**
```bash
pnpm store prune && rm -rf node_modules && pnpm install
```

**MetaMask not detected?**
- Unlock MetaMask and ensure the browser extension is active.

**File not downloadable?**
- File was uploaded before download support or localStorage was cleared. Re-upload the file.

**Wrong network?**
- Click "Network" tab in the dashboard and switch to Story Odyssey Testnet (Chain ID 1513).

---

## Contributing

Built for **Ship It On Story: Hackday** (Nagpur, India) to demonstrate how SHA-256 hashing + Story Protocol create transparent, verifiable IP ownership. Ideal for demos: *upload → hash → version timeline → verify*.

Open an issue or PR for contributions.

---

*StoryProof — Your IP, forever on-chain.*

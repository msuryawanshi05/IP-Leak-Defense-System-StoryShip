
# StoryProof – Lightweight IP Proof-of-Ownership dApp

StoryProof is a comprehensive application that generates verifiable proof-of-ownership for creative files.
Files are hashed, encrypted, and tracked with version history, with optional Story Protocol and IPFS integration.


## Features

1. **Client-side Hashing & Encryption**
⇢ SHA-256 + AES-GCM applied locally before file handling.

2. **Version Tracking**
⇢ Timeline with version comparison and detail views.

3. **Story Protocol Hooks**
⇢ Supports IP Asset registration and testnet explorer links.

4. **Local-First Workflow**
⇢ Offline-capable with automatic Story/IPFS upgrade.

5. **Developer-Focused**
⇢ Built with Next.js 16, React 19, Tailwind 4, shadcn/ui, ethers v6.

6. **Public Portfolio Pages**
⇢ Shareable portfolio views with visibility controls.

7. **IP Asset Gallery**
⇢ Visual gallery with grid/list toggle and media previews.

8. **Enhanced Analytics**
⇢ Advanced charts, usage statistics, and storage analytics.

9. **AI Similarity Detection**
⇢ File similarity checking with threshold categories (Beta).

10. **REST API**
⇢ Complete API endpoints for portfolios, IP assets, analytics, and webhooks.

11. **Advanced Collaboration**
⇢ Comment system, activity timeline, and collaborator tracking.

12. **UX Enhancements**
⇢ Dark mode, drag-and-drop, keyboard shortcuts, advanced search filters.




## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/100arab/IP-Leak-Defense-System-StoryShip
   cd IP-Leak-Defense-System-StoryShip
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start development server**

   ```bash
   pnpm dev
   ```

4. **Access the app**

   ```
   http://localhost:3000 (or your configured base URL)
   ```

### Available Scripts

* `pnpm build`
* `pnpm start`
* `pnpm lint`



## Optimizations
1. **Wallet & Network**
   ⇢ MetaMask integration
   ⇢ Story testnet toggle
   ⇢ Network status hints

2. **File Handling**
   ⇢ Drag/drop uploader
   ⇢ SHA-256 hashing
   ⇢ AES-GCM encryption

3. **Storage**
   ⇢ Local cache fallback
   ⇢ Optional Web3.Storage (IPFS) upload

4. **IP Proof**
   ⇢ Story IP Asset contract hooks
   ⇢ Transaction explorer links

5. **UX**
   ⇢ Dashboard + landing hero
   ⇢ Version timeline
   ⇢ Detail and compare modals

6. **Verification**
   ⇢ Re-hash tool to verify downloaded files



## Tech Stack

1. **Frontend**
   ⇢ Next.js 16 (App Router)
   ⇢ React 19
   ⇢ TypeScript

2. **UI**
   ⇢ Tailwind 4
   ⇢ shadcn/ui
   ⇢ Radix primitives

3. **State/Form**
   ⇢ React Hook Form
   ⇢ Zod

4. **Blockchain**
   ⇢ ethers v6
   ⇢ Story configuration helpers

5. **Storage**
   ⇢ localStorage fallback
   ⇢ Web3.Storage (IPFS) support



## Environment Variables
**Optional Configuration (Story + IPFS)**

**📋 For complete setup instructions, see [`EXTERNAL_TASKS.md`](./EXTERNAL_TASKS.md)**

Create a `.env.local` file in the project root:

**Story Protocol**
```env
NEXT_PUBLIC_STORY_RPC_URL=https://rpc.story.foundation
NEXT_PUBLIC_STORY_EXPLORER=https://explorer.story.foundation
NEXT_PUBLIC_STORY_TESTNET_RPC_URL=https://testnet-rpc.story.foundation
NEXT_PUBLIC_STORY_TESTNET_EXPLORER=https://testnet-explorer.story.foundation
NEXT_PUBLIC_USE_STORY_TESTNET=true
NEXT_PUBLIC_STORY_PROOF_CONTRACT=0xYourDeployedContract
NEXT_PUBLIC_STORY_IP_ASSET_CONTRACT=0xYourIPAssetContract
```

**IPFS (Web3.Storage)**
```env
NEXT_PUBLIC_WEB3_STORAGE_TOKEN=your_token_here
```

**Important Notes:**
- The application runs **fully offline** without these values
- Providing them enables full Story Protocol + IPFS functionality
- **Chain IDs must be updated in `lib/contracts.ts`** (see `EXTERNAL_TASKS.md`)
- See `EXTERNAL_TASKS.md` for complete configuration guide




## FAQ

1. #### Port already in use
   ⇢ `pnpm dev -- -p 3001`

2. #### pnpm errors
   ⇢ `pnpm store prune && rm -rf node_modules pnpm-lock.yaml && pnpm install`

3. #### Wallet not detected
   ⇢ Unlock MetaMask and verify the correct network.

4. #### Missing download
   ⇢ Re-upload the file to regenerate a local cached copy.



## Roadmap

1. Deployment to live Story IP Asset & Proof registries

2. Programmable IP licensing (royalties, terms, splits)

3. AI-based similarity and plagiarism detection

4. Multi-wallet collaboration with permissioned sharing

5. Public verification portal for hash/IP asset validation
## Contributing

StoryProof demonstrates how hashing and Story Protocol support transparent, verifiable ownership.
Perfect for creators: upload → hash → version timeline → verify → share


## Support

For questions or contributions, open an issue or PR in the repository.


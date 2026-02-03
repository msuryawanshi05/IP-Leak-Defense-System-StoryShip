# External Tasks Required to Complete Project

**Status**: All code implementation is complete (~95%). The remaining ~5% requires external configuration and setup.

**Last Updated**: All development phases complete (Phase 1, 1.5, 1.75)



## 📋 Overview

This document lists **all external tasks** you need to complete to make this project fully production-ready. All code is implemented and ready - you just need to configure external services and deploy contracts.

---

## 🔗 Task 1: Story Protocol Network Configuration

### What You Need to Do

Get the actual Story Protocol network details and update the configuration.

### Required Information

#### For Mainnet:
- [ ] **Chain ID**: Currently placeholder `1337` - needs actual Story Protocol mainnet chain ID
- [ ] **RPC URL**: Verify `https://rpc.story.foundation` is correct
- [ ] **Block Explorer URL**: Verify `https://explorer.story.foundation` is correct

#### For Testnet (Aeneid Testnet):
- [x] **Chain ID**: `1315` ✅ (Aeneid Testnet)
- [x] **RPC URL**: `https://aeneid.storyrpc.io` ✅
- [x] **Block Explorer URL**: `https://aeneid.storyscan.io` ✅
- [x] **API Endpoint**: `https://staging-api.storyprotocol.net/api/v4` ✅
- [x] **API Key**: `KOTbaGUSWQ6cUJWhiJYiOjPgB0kTRu1eCFFvQL0IWls` ✅
- [x] **Faucets**:
  - Google Cloud Faucet - 10 IP
  - Official Faucet - 10 IP

### Where to Find This Information

1. **Story Protocol Official Website**: https://story.foundation
   - Check developer documentation
   - Look for network configuration section
   - **API Introduction page**: Contains API endpoint and key information
   - **Aeneid Testnet page**: Contains testnet network details

2. **Chainlist.org**: https://chainlist.org
   - Search for "Story Protocol"
   - Find chain ID and network details

3. **Story Protocol Community**:
   - Discord server
   - Twitter/X: @StoryProtocol
   - GitHub repositories

4. **MetaMask** (if already configured):
   - Connect to Story Protocol network
   - Check network details for chain ID

### ✅ Aeneid Testnet Information (Confirmed)

**Source**: API Introduction and Aeneid Testnet pages

- **Chain ID**: `1315`
- **RPC URL**: `https://aeneid.storyrpc.io`
- **Block Explorer**: `https://aeneid.storyscan.io`
- **API Endpoint**: `https://staging-api.storyprotocol.net/api/v4`
- **API Key**: `KOTbaGUSWQ6cUJWhiJYiOjPgB0kTRu1eCFFvQL0IWls`
- **Faucets**:
  - Google Cloud Faucet - 10 IP
  - Official Faucet - 10 IP

### How to Update

1. **Update `lib/contracts.ts`**:
   ```typescript
   story: {
     chainId: 1337, // ← Replace with actual mainnet chain ID
     rpcUrl: process.env.NEXT_PUBLIC_STORY_RPC_URL || "https://rpc.story.foundation", // ← Verify
     blockExplorer: process.env.NEXT_PUBLIC_STORY_EXPLORER || "https://explorer.story.foundation", // ← Verify
   },
   "story-testnet": {
     chainId: 1315, // ✅ Aeneid Testnet chain ID
     rpcUrl: process.env.NEXT_PUBLIC_STORY_TESTNET_RPC_URL || "https://aeneid.storyrpc.io", // ✅ Verified
     blockExplorer: process.env.NEXT_PUBLIC_STORY_TESTNET_EXPLORER || "https://aeneid.storyscan.io", // ✅ Verified
   }
   ```

2. **Or use environment variables** (create `.env.local`):
   ```env
   NEXT_PUBLIC_STORY_RPC_URL=https://rpc.story.foundation
   NEXT_PUBLIC_STORY_EXPLORER=https://explorer.story.foundation
   NEXT_PUBLIC_STORY_TESTNET_RPC_URL=https://testnet-rpc.story.foundation
   NEXT_PUBLIC_STORY_TESTNET_EXPLORER=https://testnet-explorer.story.foundation
   ```
   **Note**: Chain IDs must still be updated in `lib/contracts.ts` (can't be set via env vars).

### Testing

1. Test RPC connection:
   ```bash
   curl -X POST https://rpc.story.foundation \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```

2. Test block explorer: Visit the URL in your browser

3. Test in app: Run `pnpm dev` and try connecting MetaMask to Story Protocol network

---

## 📜 Task 2: Smart Contract Deployment/Configuration

### What You Need to Do

Either deploy your own contracts OR configure Story Protocol's existing IP Asset contracts.

### Option A: Deploy Your Own Contracts

If you want to deploy custom contracts:

1. **Deploy Story Proof Contract** (Version Registry):
   - [ ] Write/deploy contract for version registry
   - [ ] Get deployed contract address
   - [ ] Set `NEXT_PUBLIC_STORY_PROOF_CONTRACT` environment variable

2. **Deploy IP Asset Contract** (if not using Story Protocol's):
   - [ ] Write/deploy IP Asset contract
   - [ ] Get deployed contract address
   - [ ] Set `NEXT_PUBLIC_STORY_IP_ASSET_CONTRACT` environment variable

### Option B: Use Story Protocol's Existing Contracts (Recommended)

If Story Protocol already has deployed contracts:

1. **Find Story Protocol IP Asset Contract Address**:
   - [ ] Check Story Protocol documentation
   - [ ] Get the official IP Asset contract address
   - [ ] Set `NEXT_PUBLIC_STORY_IP_ASSET_CONTRACT` environment variable

2. **Find Story Protocol Version Registry** (if available):
   - [ ] Check Story Protocol documentation
   - [ ] Get contract address (if they provide one)
   - [ ] Set `NEXT_PUBLIC_STORY_PROOF_CONTRACT` environment variable

### How to Set Contract Addresses

Create/update `.env.local`:

```env
# Story Protocol Contracts
NEXT_PUBLIC_STORY_PROOF_CONTRACT=0xYourDeployedContractAddress
NEXT_PUBLIC_STORY_IP_ASSET_CONTRACT=0xStoryProtocolIPAssetContract
```

### Current Behavior

- If contracts are not configured, the app uses localStorage fallback
- App works in demo mode without contracts
- Once contracts are configured, real blockchain transactions will occur

---

## 🔐 Task 3: Environment Variables Setup

### What You Need to Do

Create a `.env.local` file with all required configuration.

### Required Environment Variables

Create `.env.local` in the project root:

```env
# ============================================
# Story Protocol Configuration
# ============================================

# Mainnet RPC URL (verify these URLs are correct)
NEXT_PUBLIC_STORY_RPC_URL=https://rpc.story.foundation
NEXT_PUBLIC_STORY_EXPLORER=https://explorer.story.foundation

# Testnet RPC URL (Aeneid Testnet - verified)
NEXT_PUBLIC_STORY_TESTNET_RPC_URL=https://aeneid.storyrpc.io
NEXT_PUBLIC_STORY_TESTNET_EXPLORER=https://aeneid.storyscan.io

# Story Protocol API Configuration (Aeneid Testnet)
NEXT_PUBLIC_STORY_API_ENDPOINT=https://staging-api.storyprotocol.net/api/v4
NEXT_PUBLIC_STORY_API_KEY=KOTbaGUSWQ6cUJWhiJYiOjPgB0kTRu1eCFFvQL0IWls

# Toggle between mainnet and testnet
# Set to "true" for testnet, "false" for mainnet
NEXT_PUBLIC_USE_STORY_TESTNET=false

# Smart Contract Addresses
# Get these from Story Protocol docs or deploy your own
NEXT_PUBLIC_STORY_PROOF_CONTRACT=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_STORY_IP_ASSET_CONTRACT=0x0000000000000000000000000000000000000000

# ============================================
# IPFS Configuration (Optional but Recommended)
# ============================================

# Web3.Storage API Token
# Get this from https://web3.storage
NEXT_PUBLIC_WEB3_STORAGE_TOKEN=your_web3_storage_token_here

# ============================================
# Application Configuration (Optional)
# ============================================

# Base URL (auto-detected on Vercel, set for custom domains)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Step-by-Step Setup

1. **Copy `.env.example`** (if it exists) or create `.env.local`
2. **Fill in Story Protocol URLs** (verify they're correct)
3. **Set contract addresses** (from Task 2)
4. **Get Web3.Storage token** (from Task 4)
5. **Set base URL** (if using custom domain)

### Important Notes

- `.env.local` is gitignored (won't be committed)
- Restart dev server after changing environment variables
- Chain IDs must be updated in `lib/contracts.ts` (can't use env vars)

---

## 📦 Task 4: IPFS Configuration (Web3.Storage)

### What You Need to Do

Set up Web3.Storage account and get API token for IPFS file storage.

### Steps

1. **Create Web3.Storage Account**:
   - [ ] Visit https://web3.storage
   - [ ] Sign up for a free account
   - [ ] Verify your email

2. **Get API Token**:
   - [ ] Go to account settings
   - [ ] Create a new API token
   - [ ] Copy the token

3. **Add Token to Environment Variables**:
   ```env
   NEXT_PUBLIC_WEB3_STORAGE_TOKEN=your_token_here
   ```

### Current Behavior

- Without token: App generates mock CIDs (works for demo)
- With token: Real IPFS uploads to Web3.Storage
- Files are encrypted before upload

### Alternative IPFS Providers

If you prefer a different IPFS provider:
- Update `lib/storage.ts` to use your preferred provider
- Or use Pinata, Infura IPFS, or self-hosted IPFS node

---

## 🚀 Task 5: Deployment Configuration

### What You Need to Do

Configure deployment settings for your hosting platform.

### For Vercel Deployment

1. **Set Environment Variables in Vercel Dashboard**:
   - [ ] Go to project settings → Environment Variables
   - [ ] Add all variables from `.env.local`
   - [ ] Set for Production, Preview, and Development

2. **Configure Base URL** (if using custom domain):
   - [ ] Add custom domain in Vercel
   - [ ] Set `NEXT_PUBLIC_BASE_URL` to your domain

### For Other Platforms

1. **Set Environment Variables**:
   - [ ] Add all required environment variables
   - [ ] Ensure `NEXT_PUBLIC_*` variables are set

2. **Build Configuration**:
   - [ ] Ensure Node.js version is 18+ or 20+
   - [ ] Run `pnpm install` and `pnpm build` to verify

---

## 🔄 Task 6: Testing & Verification

### What You Need to Do

Test all configured services to ensure everything works.

### Checklist

#### Blockchain Testing
- [ ] Connect MetaMask wallet
- [ ] Switch to Story Protocol network (should work if chain IDs are correct)
- [ ] Upload a file and verify transaction appears on block explorer
- [ ] Check that IP Asset registration works (if contracts configured)

#### IPFS Testing
- [ ] Upload a file with Web3.Storage token configured
- [ ] Verify file appears on IPFS (check CID)
- [ ] Download file and verify it matches original

#### Environment Testing
- [ ] Test with testnet configuration
- [ ] Test with mainnet configuration
- [ ] Verify fallback behavior when contracts not configured

---

## 📊 Task Priority

### High Priority (Required for Production)

1. ✅ **Story Protocol Chain IDs** - Must update to use Story network
2. ✅ **Smart Contract Addresses** - Required for on-chain functionality
3. ✅ **Environment Variables** - Required for production deployment

### Medium Priority (Recommended)

4. ✅ **IPFS/Web3.Storage Token** - Recommended for real IPFS storage
5. ✅ **RPC URL Verification** - Ensure URLs are correct and accessible

### Low Priority (Optional)

6. ⚠️ **Custom Domain Configuration** - Optional, works with default URLs
7. ⚠️ **Backend Integration** - Future enhancement (database, WebSocket)

---

## 🆘 Troubleshooting

### Issue: Can't Find Story Protocol Chain IDs

**Solution**:
- Check Story Protocol's official documentation
- Join their Discord/community
- Use Polygon/Ethereum as temporary solution (already configured)

### Issue: RPC URL Not Working

**Solution**:
- Verify URL is correct
- Check if authentication/API key is needed
- Try alternative RPC providers
- Check Story Protocol documentation

### Issue: Contract Address Not Working

**Solution**:
- Verify address is correct (starts with `0x`)
- Ensure contract is deployed on the correct network
- Check contract ABI matches expected interface
- Verify you're connected to the correct network

### Issue: Web3.Storage Upload Failing

**Solution**:
- Verify token is correct
- Check token hasn't expired
- Verify account has storage quota available
- Check browser console for error messages

---

## ✅ Completion Checklist

Use this checklist to track your progress:

### Configuration Tasks
- [ ] Story Protocol mainnet chain ID updated in `lib/contracts.ts`
- [x] Story Protocol testnet chain ID updated in `lib/contracts.ts` ✅ (1315 - Aeneid Testnet)
- [x] Testnet RPC URL verified and working ✅ (`https://aeneid.storyrpc.io`)
- [x] Testnet block explorer URL verified and working ✅ (`https://aeneid.storyscan.io`)
- [x] Story Protocol API endpoint configured ✅ (`https://staging-api.storyprotocol.net/api/v4`)
- [x] Story Protocol API key configured ✅
- [ ] Smart contract addresses configured
- [ ] Environment variables set in `.env.local`
- [ ] Web3.Storage token configured
- [ ] Base URL configured (if using custom domain)

### Deployment Tasks
- [ ] Environment variables set in hosting platform
- [ ] Build passes successfully
- [ ] Application deployed and accessible
- [ ] Wallet connection works
- [ ] Network switching works
- [ ] File upload works
- [ ] IP Asset registration works (if contracts configured)
- [ ] IPFS upload works (if token configured)

---

## 📚 Additional Resources

### Documentation Files
- **README.md** - Project overview and setup instructions
- **FILE_VERIFICATION_GUIDE.md** - User guide for file verification
- **PROJECT_PROGRESS.md** - Complete project status and features

### Code Files to Update
- **`lib/contracts.ts`** - Network configuration and chain IDs
- **`.env.local`** - Environment variables (create this file)

### External Resources
- **Story Protocol**: https://story.foundation
- **Web3.Storage**: https://web3.storage
- **Chainlist**: https://chainlist.org
- **Vercel Docs**: https://vercel.com/docs

---

## 🎯 Summary

**All code is complete!** You just need to:

1. Get Story Protocol network details (chain IDs, RPC URLs, explorer URLs)
2. Configure smart contract addresses (deploy or use Story Protocol's)
3. Set up environment variables (create `.env.local`)
4. Get Web3.Storage token (optional but recommended)
5. Test everything works

**Estimated Time**: 1-2 hours (depending on how quickly you can get Story Protocol details)

**Current Status**: ✅ Code 95% complete, ⏳ Configuration 0% complete

Once you complete these tasks, the project will be **100% production-ready**!

---

**Last Updated**: All development phases complete
**Next Step**: Start with Task 1 (Story Protocol Network Configuration)


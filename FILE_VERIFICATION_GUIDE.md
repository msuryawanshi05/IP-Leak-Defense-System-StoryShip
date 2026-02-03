# File Verification & Authenticity Guide

## 🔐 How File Verification Works

### What Happens During Upload

1. **Original File** → User uploads file (e.g., `artwork.png`)
2. **Hash Calculation** → File is hashed using SHA-256 algorithm
   - Creates unique fingerprint: `a3f5b8c9d2e1f4a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0`
   - This hash is **immutable** - any change to the file creates a different hash
3. **Encryption** → File is encrypted (AES-GCM) for storage
4. **IPFS Upload** → Encrypted file uploaded to IPFS (Web3.Storage if configured, mock CID otherwise)
5. **Storage** → Original file stored in localStorage for download
6. **Blockchain Registration** → Hash stored on Story Protocol as IP Asset (on-chain if contracts configured, localStorage fallback)
7. **Version Checkpoint** → Transaction recorded on blockchain (on-chain if contracts configured, localStorage fallback)

### What Happens During Download

1. **File Retrieval** → Original file retrieved from localStorage
2. **Direct Download** → File downloaded **exactly as uploaded** (no changes)
3. **Verification Available** → Hash stored in version history for verification

### What Changes to the File?

**✅ NO CHANGES to the downloaded file!**

- The file you download is **identical** to the file you uploaded
- File is stored as-is in localStorage (base64 encoded for storage)
- When downloaded, it's converted back to the original format
- **Zero modifications** - byte-for-byte identical

**What IS different:**

- **Hash stored separately** - Used for verification, not part of file
- **Metadata added** - Version info, timestamps, IP Asset ID (stored separately)
- **Encrypted copy on IPFS** - Encrypted version stored (if IPFS configured)

## 🔍 How to Verify File Authenticity

### Method 1: Using the Built-in Verifier

1. Go to **Version Details** → Click **"Verify File"** tab
2. Upload the file you want to verify
3. System automatically:
   - Calculates SHA-256 hash of uploaded file
   - Compares with stored hash
   - Shows verification result

### Method 2: Manual Verification

1. **Get the stored hash** from version details
2. **Calculate hash** of your file using:
   - Online tool: https://emn178.github.io/online-tools/sha256_checksum.html
   - Command line: `sha256sum filename.ext` (Linux/Mac) or `certutil -hashfile filename.ext SHA256` (Windows)
3. **Compare hashes** - If they match, file is authentic

## 📊 Verification Process Flow

```
┌─────────────────┐
│  Original File  │
│  (artwork.png)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SHA-256 Hash   │
│  (stored)       │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌─────────────────┐
│  Stored on      │  │  File Stored    │
│  Blockchain     │  │  Locally        │
│  (IP Asset)     │  │  (for download) │
└─────────────────┘  └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  User Downloads │
                    │  File           │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  User Uploads   │
                    │  File to Verify │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Calculate Hash │
                    │  of Uploaded    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Compare Hashes │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
            ┌──────────────┐  ┌──────────────┐
            │   MATCH      │  │  NO MATCH    │
            │  ✅ AUTHENTIC│  │  ❌ MODIFIED │
            └──────────────┘  └──────────────┘
```

## 🔒 Security Features

### Cryptographic Hashing (SHA-256)
- **One-way function** - Cannot reverse hash to get original file
- **Deterministic** - Same file always produces same hash
- **Collision-resistant** - Extremely unlikely two files have same hash
- **Tamper detection** - Any change to file changes hash

### What Verification Proves

✅ **File is Authentic** - Matches original upload
✅ **File is Unchanged** - No modifications detected
✅ **File is Authorized** - Hash matches blockchain record
✅ **IP Ownership** - Verified against Story Protocol IP Asset

### What Verification Does NOT Prove

❌ **File source** - Doesn't prove who created it (only who uploaded it)
❌ **File content** - Doesn't verify artistic quality or content
❌ **File legality** - Doesn't verify copyright or legal status

## 📝 Before vs After Download

### Before Upload
- File exists only on your device
- No proof of ownership
- No timestamp
- No version history

### After Upload
- ✅ **Hash calculated** and stored
- ✅ **IP Asset registered** on Story Protocol (on-chain if configured, localStorage fallback)
- ✅ **Timestamp recorded** (blockchain-backed when on-chain, local timestamp otherwise)
- ✅ **Version history** created
- ✅ **File stored** for download

### After Download
- ✅ **File identical** to original
- ✅ **Can verify** using hash comparison
- ✅ **Proof of authenticity** available
- ✅ **On-chain verification** possible (when contracts configured)

## 🎯 Use Cases

### For Creators
- **Prove ownership** - Show your file hash matches blockchain record
- **Verify integrity** - Ensure downloaded file hasn't been tampered with
- **IP Protection** - Demonstrate first-to-register on blockchain

### For Buyers/Licensees
- **Verify authenticity** - Confirm file matches seller's claim
- **Check integrity** - Ensure file hasn't been modified
- **Validate ownership** - Verify seller's IP Asset registration

### For Legal/Disputes
- **Timestamp proof** - Blockchain timestamp proves when file was registered (when on-chain)
- **Hash evidence** - Cryptographic proof file hasn't changed
- **Ownership record** - On-chain IP Asset registration (when contracts configured)
- **Local proof** - Hash and metadata stored locally (always available)

## 🛠️ Technical Details

### Hash Algorithm: SHA-256
- **Output**: 64-character hexadecimal string
- **Example**: `a3f5b8c9d2e1f4a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0`
- **Collision probability**: ~0 (practically impossible)

### Storage Format
- **Original file**: Stored as base64 in localStorage
- **Download**: Converted back to original binary format
- **No compression**: File stored without modification
- **No metadata injection**: File content unchanged

### Verification Process
1. Read file bytes
2. Calculate SHA-256 hash
3. Compare with stored hash (case-insensitive)
4. Return verification result

## ✅ Verification Checklist

When verifying a file:

- [ ] File name matches expected name
- [ ] File size matches expected size
- [ ] File hash matches stored hash
- [ ] IP Asset ID matches (if available)
- [ ] Transaction hash verifiable on blockchain
- [ ] Timestamp matches upload time

## 🚨 Common Issues

### Hash Mismatch
**Cause**: File has been modified, corrupted, or is different file
**Solution**: Re-upload original file or check file integrity

### File Not Found
**Cause**: File uploaded before download feature or localStorage cleared
**Solution**: Re-upload file to enable verification

### Verification Failed
**Cause**: File corruption, wrong file selected, or hash calculation error
**Solution**: Try again, ensure correct file selected

---

**Remember**: The hash is the **fingerprint** of your file. If the hash matches, the file is **100% identical** to the original upload.


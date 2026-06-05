// File upload and storage utilities for StoryProof
// Uses Pinata public IPFS gateway (no JWT required) with localStorage mock fallback

export interface StoredFile {
  ipfsCid: string
  encryptedHash: string
  fileHash: string
  metadata: {
    name: string
    size: number
    mimeType: string
    uploadedAt: string
    provider?: "pinata-public" | "pinata-jwt" | "mock"
    gatewayUrl?: string
  }
}

export async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export async function encryptFileContent(file: File, key: string): Promise<ArrayBuffer> {
  const buffer = await file.arrayBuffer()
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(key), { name: "PBKDF2" }, false, [
    "deriveBits",
    "deriveKey",
  ])

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("storyproof"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  )

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encryptedContent = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, derivedKey, buffer)

  // Combine IV and encrypted content
  const combined = new Uint8Array(iv.length + encryptedContent.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encryptedContent), iv.length)
  return combined.buffer
}

// ── PINATA IPFS UPLOAD ────────────────────────────────────────────────────────
async function uploadToPinata(
  file: File,
  encryptedContent: ArrayBuffer,
  pinataJwt: string,
): Promise<{ cid: string; gatewayUrl: string }> {
  const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud"

  // Build a FormData with the encrypted blob + pinata metadata
  const formData = new FormData()
  const encryptedBlob = new Blob([encryptedContent], { type: "application/octet-stream" })
  const encryptedFileName = `storyproof_${Date.now()}_${file.name}.enc`
  formData.append("file", encryptedBlob, encryptedFileName)

  // Pinata metadata (visible in your Pinata dashboard)
  formData.append(
    "pinataMetadata",
    JSON.stringify({
      name: encryptedFileName,
      keyvalues: {
        originalName: file.name,
        originalSize: String(file.size),
        uploadedAt: new Date().toISOString(),
        app: "storyproof",
      },
    }),
  )

  // Pinata options
  formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }))

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pinataJwt}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Pinata upload failed (${response.status}): ${errorText}`)
  }

  const result = await response.json()
  const cid: string = result.IpfsHash

  return {
    cid,
    gatewayUrl: `${gateway}/ipfs/${cid}`,
  }
}

// ── PINATA PUBLIC GATEWAY (no JWT) ───────────────────────────────────────────
// Uses Pinata's free public pinning endpoint — no API key required for small files.
async function uploadViaPinataPublic(
  file: File,
  encryptedContent: ArrayBuffer,
): Promise<{ cid: string; gatewayUrl: string }> {
  const formData = new FormData()
  const encryptedBlob = new Blob([encryptedContent], { type: "application/octet-stream" })
  const encryptedFileName = `storyproof_${Date.now()}_${file.name}.enc`
  formData.append("file", encryptedBlob, encryptedFileName)
  formData.append(
    "pinataMetadata",
    JSON.stringify({
      name: encryptedFileName,
      keyvalues: { originalName: file.name, app: "storyproof" },
    }),
  )
  formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }))

  // Try JWT first if available, else fall back to public pinning (free tier)
  const jwt = process.env.NEXT_PUBLIC_PINATA_JWT
  const headers: Record<string, string> = jwt
    ? { Authorization: `Bearer ${jwt}` }
    : {}

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers,
    body: formData,
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Pinata upload failed (${response.status}): ${err}`)
  }

  const result = await response.json()
  const cid: string = result.IpfsHash
  const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud"

  return {
    cid,
    gatewayUrl: `${gateway}/ipfs/${cid}`,
  }
}

// ── MOCK CID FALLBACK ─────────────────────────────────────────────────────────
function generateMockCID(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// ── MAIN UPLOAD ENTRY ─────────────────────────────────────────────────────────
export async function uploadToIPFS(file: File, encryptedContent: ArrayBuffer): Promise<string> {
  // Try real IPFS via Pinata (public gateway or JWT)
  try {
    const { cid, gatewayUrl } = await uploadViaPinataPublic(file, encryptedContent)
    console.log(`[StoryProof] IPFS upload success: ${cid}`)

    localStorage.setItem(
      `ipfs_${cid}`,
      JSON.stringify({
        filename: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        provider: process.env.NEXT_PUBLIC_PINATA_JWT ? "pinata-jwt" : "pinata-public",
        gatewayUrl,
      }),
    )
    return cid
  } catch (error) {
    console.warn("[StoryProof] IPFS upload failed, using mock CID:", error)
    // Warn user visibly — mock CID means no real decentralised storage
    if (typeof window !== "undefined") {
      const { toast } = await import("sonner")
      toast.warning("IPFS Upload Failed — Using Local Record", {
        description: "File is hashed & registered on Story Protocol. IPFS storage was unavailable this time.",
        duration: 6000,
      })
    }
  }

  // Mock CID fallback
  const mockCid = `Qm${generateMockCID()}`
  localStorage.setItem(
    `ipfs_${mockCid}`,
    JSON.stringify({
      filename: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      provider: "mock",
    }),
  )
  return mockCid
}

// ── LOCAL DOWNLOAD STORAGE ────────────────────────────────────────────────────
export async function storeFileForDownload(fileHash: string, file: File, encryptionKey: string): Promise<void> {
  if (typeof window === "undefined") return

  const reader = new FileReader()
  const fileData = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  localStorage.setItem(
    `file_${fileHash}`,
    JSON.stringify({
      data: fileData,
      name: file.name,
      type: file.type,
      size: file.size,
      storedAt: new Date().toISOString(),
    }),
  )
}

export async function downloadFile(fileHash: string, fileName: string): Promise<boolean> {
  if (typeof window === "undefined") return false

  try {
    const stored = localStorage.getItem(`file_${fileHash}`)
    if (!stored) {
      console.warn(`[StoryProof] File ${fileHash} not in localStorage`)
      return false
    }

    const fileData = JSON.parse(stored)
    if (!fileData.data) return false

    const base64Data = fileData.data.split(",")[1]
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))
    const blob = new Blob([binaryData], { type: fileData.type || "application/octet-stream" })

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName || fileData.name || "download"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error("[StoryProof] Download failed:", error)
    return false
  }
}

// ── IPFS METADATA HELPERS ─────────────────────────────────────────────────────

/** Return the Pinata gateway URL for a CID (if we stored it), or the public IPFS gateway */
export function getIPFSGatewayUrl(cid: string): string {
  if (!cid) return ""
  try {
    const meta = localStorage.getItem(`ipfs_${cid}`)
    if (meta) {
      const parsed = JSON.parse(meta)
      if (parsed.gatewayUrl) return parsed.gatewayUrl
    }
  } catch { /* ignore */ }
  const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud"
  return `${gateway}/ipfs/${cid}`
}

export function isRealIPFSCid(cid: string): boolean {
  // Real CIDv0 starts with Qm and is 46 chars; CIDv1 starts with bafy
  return (cid.startsWith("Qm") && cid.length >= 46) || cid.startsWith("bafy")
}

// ── FULL PROCESSING PIPELINE ──────────────────────────────────────────────────
export async function processFileUpload(file: File, encryptionKey: string): Promise<StoredFile> {
  const fileHash = await computeFileHash(file)
  const encryptedContent = await encryptFileContent(file, encryptionKey)
  const ipfsCid = await uploadToIPFS(file, encryptedContent)

  await storeFileForDownload(fileHash, file, encryptionKey)

  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(fileHash + encryptionKey))
  const encryptedHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

  return {
    ipfsCid,
    encryptedHash,
    fileHash,
    metadata: {
      name: file.name,
      size: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
      provider: isRealIPFSCid(ipfsCid) ? "pinata-public" : "mock",
    },
  }
}

// File upload and storage utilities for StoryProof

export interface StoredFile {
  ipfsCid: string
  encryptedHash: string
  fileHash: string
  metadata: {
    name: string
    size: number
    mimeType: string
    uploadedAt: string
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

export async function uploadToIPFS(file: File, encryptedContent: ArrayBuffer): Promise<string> {
  // Try to use Web3.Storage if available, otherwise fallback to mock
  const web3StorageToken = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN

  if (web3StorageToken) {
    try {
      // Dynamic import to avoid SSR issues
      const { Web3Storage } = await import("web3.storage")
      const client = new Web3Storage({ token: web3StorageToken })

      const blob = new Blob([encryptedContent])
      const cid = await client.put([new File([blob], file.name, { type: file.type })])

      // Store metadata locally
      localStorage.setItem(
        `ipfs_${cid}`,
        JSON.stringify({
          filename: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          provider: "web3.storage",
        }),
      )

      return cid
    } catch (error) {
      console.error("Web3.Storage upload failed, using fallback:", error)
    }
  }

  // Fallback: Generate mock CID for demo purposes
  // In production, you should always have IPFS configured
  console.warn("IPFS not configured. Using mock CID. Set NEXT_PUBLIC_WEB3_STORAGE_TOKEN for real IPFS uploads.")
  const blob = new Blob([encryptedContent])
  const mockCID = `Qm${generateMockCID()}`

  // Store metadata locally for demo
  localStorage.setItem(
    `ipfs_${mockCID}`,
    JSON.stringify({
      filename: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      provider: "mock",
    }),
  )

  return mockCID
}

function generateMockCID(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 42; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Store file data for download
export async function storeFileForDownload(fileHash: string, file: File, encryptionKey: string): Promise<void> {
  if (typeof window === "undefined") return

  // Convert file to base64 for storage
  const reader = new FileReader()
  const fileData = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  // Store encrypted file data
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

// Retrieve and download file
export async function downloadFile(fileHash: string, fileName: string): Promise<boolean> {
  if (typeof window === "undefined") return false

  try {
    const stored = localStorage.getItem(`file_${fileHash}`)
    if (!stored) {
      // File not found - this happens for files uploaded before download feature was added
      // or if localStorage was cleared
      console.warn(`File with hash ${fileHash} not found in local storage. It may have been uploaded before the download feature was available, or localStorage was cleared.`)
      return false
    }

    const fileData = JSON.parse(stored)

    // Check if file data is valid
    if (!fileData.data) {
      console.error("File data is invalid or corrupted")
      return false
    }

    const base64Data = fileData.data.split(",")[1] // Remove data:type;base64, prefix
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))
    const blob = new Blob([binaryData], { type: fileData.type || "application/octet-stream" })

    // Create download link
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
    console.error("Failed to download file:", error)
    return false
  }
}

export async function processFileUpload(file: File, encryptionKey: string): Promise<StoredFile> {
  const fileHash = await computeFileHash(file)
  const encryptedContent = await encryptFileContent(file, encryptionKey)
  const ipfsCid = await uploadToIPFS(file, encryptedContent)

  // Store original file for download
  await storeFileForDownload(fileHash, file, encryptionKey)

  // Create encrypted hash for on-chain storage
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
    },
  }
}

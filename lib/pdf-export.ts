"use client"

import { jsPDF } from "jspdf"

interface CertificateData {
  fileName: string
  fileHash: string
  ipfsCid: string
  timestamp: Date
  author: string | null
  notes?: string
  transactionHash?: string
  blockNumber?: number
  ipAssetId?: string
  encryptedHash?: string
}

/**
 * generateProofPDF — exports an IP ownership certificate as a styled PDF.
 */
export async function generateProofPDF(data: CertificateData): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const W = 210
  const margin = 20

  // ── Background ──────────────────────────────────────────────────────────
  doc.setFillColor(6, 5, 16) // near-black
  doc.rect(0, 0, W, 297, "F")

  // Header bar
  doc.setFillColor(98, 34, 174) // violet
  doc.rect(0, 0, W, 40, "F")

  // ── Logo / Title ────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold")
  doc.setFontSize(22)
  doc.setTextColor(255, 255, 255)
  doc.text("StoryProof", margin, 18)

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(196, 181, 253) // violet-300
  doc.text("IP Ownership Certificate — Story Protocol", margin, 26)

  // Certificate number (based on hash)
  const certNum = `CERT-${data.fileHash.slice(0, 8).toUpperCase()}`
  doc.setFontSize(9)
  doc.setTextColor(196, 181, 253)
  doc.text(certNum, W - margin, 18, { align: "right" })

  // ── Subtitle ─────────────────────────────────────────────────────────────
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(255, 255, 255)
  doc.text("Certificate of IP Ownership", margin, 58)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(148, 163, 184) // slate-400
  doc.text("This document certifies that the following digital work has been registered", margin, 66)
  doc.text("on the Story Protocol blockchain with cryptographic proof of authorship.", margin, 72)

  // ── File Info Card ───────────────────────────────────────────────────────
  let y = 85
  const cardX = margin
  const cardW = W - margin * 2

  doc.setFillColor(20, 18, 40)
  doc.roundedRect(cardX, y, cardW, 42, 4, 4, "F")
  doc.setDrawColor(98, 34, 174)
  doc.setLineWidth(0.4)
  doc.roundedRect(cardX, y, cardW, 42, 4, 4, "S")

  // Label
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(167, 139, 250) // violet-400
  doc.text("REGISTERED WORK", cardX + 6, y + 9)

  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(255, 255, 255)
  const truncatedName = data.fileName.length > 55 ? data.fileName.slice(0, 55) + "…" : data.fileName
  doc.text(truncatedName, cardX + 6, y + 20)

  if (data.notes) {
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(148, 163, 184)
    doc.text(data.notes.slice(0, 80), cardX + 6, y + 30)
  }

  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 116, 139)
  const dateStr = new Date(data.timestamp).toLocaleString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short"
  })
  doc.text(`Registered: ${dateStr}`, cardX + 6, y + 38)

  // ── Section helper ────────────────────────────────────────────────────────
  y += 52

  function sectionHeader(title: string) {
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(167, 139, 250)
    doc.text(title.toUpperCase(), cardX, y)
    doc.setDrawColor(60, 40, 100)
    doc.setLineWidth(0.3)
    doc.line(cardX, y + 2, cardX + cardW, y + 2)
    y += 9
  }

  function infoRow(label: string, value: string, mono = false) {
    doc.setFillColor(16, 14, 32)
    doc.roundedRect(cardX, y, cardW, 14, 2, 2, "F")

    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(100, 116, 139)
    doc.text(label, cardX + 4, y + 5)

    doc.setFontSize(8)
    doc.setFont(mono ? "courier" : "helvetica", "normal")
    doc.setTextColor(226, 232, 240)
    const truncated = value.length > 85 ? value.slice(0, 85) + "…" : value
    doc.text(truncated, cardX + 4, y + 11)
    y += 16
  }

  // ── Cryptographic Proof ──────────────────────────────────────────────────
  sectionHeader("Cryptographic Proof")
  infoRow("SHA-256 File Hash", data.fileHash, true)
  if (data.encryptedHash) infoRow("AES-GCM Encrypted Hash", data.encryptedHash, true)
  y += 2

  // ── Decentralised Storage ────────────────────────────────────────────────
  sectionHeader("Decentralised Storage")
  infoRow("IPFS Content Identifier (CID)", data.ipfsCid, true)
  y += 2

  // ── Blockchain Record ────────────────────────────────────────────────────
  if (data.transactionHash || data.blockNumber) {
    sectionHeader("Blockchain Record")
    if (data.transactionHash) infoRow("Transaction Hash", data.transactionHash, true)
    if (data.blockNumber) infoRow("Block Number", `#${data.blockNumber}`)
    y += 2
  }

  // ── Story Protocol IP Asset ──────────────────────────────────────────────
  if (data.ipAssetId) {
    sectionHeader("Story Protocol IP Asset")
    infoRow("IP Asset ID", data.ipAssetId, true)
    y += 2
  }

  // ── Author ───────────────────────────────────────────────────────────────
  sectionHeader("Authorship")
  infoRow("Wallet Address (Author)", data.author || "Unknown")
  y += 2

  // ── Footer ───────────────────────────────────────────────────────────────
  const footerY = 278
  doc.setFillColor(20, 18, 40)
  doc.rect(0, footerY - 4, W, 23, "F")

  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(71, 85, 105)
  doc.text(
    "This certificate was generated by StoryProof — Built for Ship It On Story: Hackday, Nagpur.",
    margin, footerY + 4
  )
  doc.text(
    `Document generated on ${new Date().toLocaleString("en-IN")} · ${certNum}`,
    margin, footerY + 10
  )

  // Violet accent line at bottom
  doc.setFillColor(98, 34, 174)
  doc.rect(0, 294, W, 3, "F")

  // ── Save ─────────────────────────────────────────────────────────────────
  const safeName = data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 40)
  doc.save(`StoryProof_Certificate_${safeName}.pdf`)
}

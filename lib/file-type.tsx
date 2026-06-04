"use client"

import {
  FileText, FileImage, FileVideo, FileAudio, FileCode,
  FileArchive, FileSpreadsheet, File, FileJson
} from "lucide-react"

export type FileCategory =
  | "image" | "video" | "audio" | "pdf"
  | "doc" | "code" | "spreadsheet" | "archive"
  | "json" | "other"

const EXT_MAP: Record<string, FileCategory> = {
  // Images
  jpg: "image", jpeg: "image", png: "image", gif: "image",
  webp: "image", svg: "image", bmp: "image", ico: "image", avif: "image",
  // Video
  mp4: "video", mov: "video", avi: "video", mkv: "video",
  webm: "video", flv: "video", wmv: "video",
  // Audio
  mp3: "audio", wav: "audio", ogg: "audio", flac: "audio",
  aac: "audio", m4a: "audio",
  // PDF
  pdf: "pdf",
  // Docs
  doc: "doc", docx: "doc", txt: "doc", md: "doc",
  rtf: "doc", odt: "doc", pages: "doc",
  // Code
  js: "code", ts: "code", jsx: "code", tsx: "code",
  py: "code", rs: "code", go: "code", java: "code",
  cpp: "code", c: "code", cs: "code", rb: "code",
  php: "code", html: "code", css: "code", sh: "code",
  // Spreadsheets
  xls: "spreadsheet", xlsx: "spreadsheet", csv: "spreadsheet",
  ods: "spreadsheet", numbers: "spreadsheet",
  // Archives
  zip: "archive", tar: "archive", gz: "archive",
  rar: "archive", "7z": "archive",
  // JSON
  json: "json", yaml: "json", yml: "json", toml: "json",
}

const MIME_MAP: Record<string, FileCategory> = {
  "image/": "image",
  "video/": "video",
  "audio/": "audio",
  "application/pdf": "pdf",
  "text/html": "code",
  "text/css": "code",
  "text/javascript": "code",
  "application/json": "json",
  "application/zip": "archive",
  "application/x-tar": "archive",
  "application/gzip": "archive",
  "application/vnd.openxmlformats-officedocument.spreadsheetml": "spreadsheet",
  "application/vnd.ms-excel": "spreadsheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml": "doc",
  "application/msword": "doc",
  "text/": "doc",
}

export function getFileCategory(fileName: string, mimeType?: string): FileCategory {
  // Try extension first
  const ext = fileName.split(".").pop()?.toLowerCase() ?? ""
  if (EXT_MAP[ext]) return EXT_MAP[ext]

  // Try MIME type
  if (mimeType) {
    for (const [prefix, cat] of Object.entries(MIME_MAP)) {
      if (mimeType.startsWith(prefix)) return cat
    }
  }
  return "other"
}

export const CATEGORY_CONFIG: Record<FileCategory, {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  color: string
  bg: string
  border: string
}> = {
  image:       { icon: FileImage,       label: "Image",       color: "text-pink-400",    bg: "bg-pink-400/10",    border: "border-pink-400/25" },
  video:       { icon: FileVideo,       label: "Video",       color: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/25" },
  audio:       { icon: FileAudio,       label: "Audio",       color: "text-yellow-400",  bg: "bg-yellow-400/10",  border: "border-yellow-400/25" },
  pdf:         { icon: FileText,        label: "PDF",         color: "text-orange-400",  bg: "bg-orange-400/10",  border: "border-orange-400/25" },
  doc:         { icon: FileText,        label: "Document",    color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/25" },
  code:        { icon: FileCode,        label: "Code",        color: "text-green-400",   bg: "bg-green-400/10",   border: "border-green-400/25" },
  spreadsheet: { icon: FileSpreadsheet, label: "Spreadsheet", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/25" },
  archive:     { icon: FileArchive,     label: "Archive",     color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/25" },
  json:        { icon: FileJson,        label: "Data",        color: "text-cyan-400",    bg: "bg-cyan-400/10",    border: "border-cyan-400/25" },
  other:       { icon: File,            label: "File",        color: "text-muted-foreground", bg: "bg-secondary", border: "border-border" },
}

/** Renders a file type icon with coloured background badge */
export function FileTypeIcon({ fileName, mimeType, size = 20, className = "" }: {
  fileName: string
  mimeType?: string
  size?: number
  className?: string
}) {
  const category = getFileCategory(fileName, mimeType)
  const { icon: Icon, color, bg, border } = CATEGORY_CONFIG[category]

  return (
    <div className={`rounded-xl flex items-center justify-center flex-shrink-0 border ${bg} ${border} ${className}`}
         style={{ width: size + 16, height: size + 16 }}>
      <Icon size={size} className={color} />
    </div>
  )
}

/** Small inline badge showing file type label */
export function FileTypeBadge({ fileName, mimeType }: { fileName: string; mimeType?: string }) {
  const category = getFileCategory(fileName, mimeType)
  const { label, color, bg, border } = CATEGORY_CONFIG[category]

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${bg} ${border} ${color}`}>
      {label}
    </span>
  )
}

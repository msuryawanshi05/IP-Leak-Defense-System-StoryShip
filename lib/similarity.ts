// AI Similarity Detection utilities

export interface SimilarityResult {
  file: any
  similarity: number
  reasons: string[]
  category: "duplicate" | "highly-similar" | "possibly-related" | "unrelated"
}

export type SimilarityCategory = "duplicate" | "highly-similar" | "possibly-related" | "unrelated"

export function getSimilarityCategory(similarity: number): SimilarityCategory {
  if (similarity >= 90) return "duplicate"
  if (similarity >= 70) return "highly-similar"
  if (similarity >= 40) return "possibly-related"
  return "unrelated"
}

/**
 * Calculate basic file similarity based on hash, size, and name
 * This is a basic implementation - can be enhanced with actual AI/ML models
 */
export async function calculateFileSimilarity(
  targetFile: any,
  compareFiles: any[],
): Promise<SimilarityResult[]> {
  const results: SimilarityResult[] = []

  for (const file of compareFiles) {
    if (file.fileHash === targetFile.fileHash) continue

    let similarity = 0
    const reasons: string[] = []

    // Hash similarity (exact match = 100%)
    if (targetFile.fileHash && file.fileHash) {
      const hashSimilarity = compareHashes(targetFile.fileHash, file.fileHash)
      if (hashSimilarity > 0) {
        similarity += hashSimilarity * 0.3
        reasons.push("Hash similarity")
      }
    }

    // Size similarity
    if (targetFile.fileData?.metadata?.size && file.fileData?.metadata?.size) {
      const sizeDiff = Math.abs(
        targetFile.fileData.metadata.size - file.fileData.metadata.size,
      )
      const maxSize = Math.max(
        targetFile.fileData.metadata.size,
        file.fileData.metadata.size,
      )
      const sizeSimilarity = (1 - sizeDiff / maxSize) * 100
      if (sizeSimilarity > 50) {
        similarity += sizeSimilarity * 0.2
        reasons.push("Size similarity")
      }
    }

    // Name similarity
    if (targetFile.versionNote && file.versionNote) {
      const nameSimilarity = compareStrings(targetFile.versionNote, file.versionNote)
      if (nameSimilarity > 0.5) {
        similarity += nameSimilarity * 100 * 0.2
        reasons.push("Name similarity")
      }
    }

    // Type similarity
    if (
      targetFile.fileData?.metadata?.mimeType &&
      file.fileData?.metadata?.mimeType
    ) {
      const targetType = targetFile.fileData.metadata.mimeType.split("/")[0]
      const fileType = file.fileData.metadata.mimeType.split("/")[0]
      if (targetType === fileType) {
        similarity += 30
        reasons.push("File type match")
      }
    }

    if (similarity > 15) {
      results.push({
        file,
        similarity: Math.min(100, similarity),
        reasons,
        category: getSimilarityCategory(Math.min(100, similarity)),
      })
    }
  }

  return results.sort((a, b) => b.similarity - a.similarity)
}

function compareHashes(hash1: string, hash2: string): number {
  if (hash1 === hash2) return 1
  if (hash1.length !== hash2.length) return 0

  let matches = 0
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] === hash2[i]) matches++
  }
  return matches / hash1.length
}

function compareStrings(str1: string, str2: string): number {
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()
  if (s1 === s2) return 1

  // Simple Levenshtein-like comparison
  const longer = s1.length > s2.length ? s1 : s2
  const shorter = s1.length > s2.length ? s2 : s1
  if (longer.length === 0) return 1

  const editDistance = levenshteinDistance(s1, s2)
  return (longer.length - editDistance) / longer.length
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

/**
 * Check for duplicate files (exact hash match)
 */
export function findDuplicates(files: any[]): any[][] {
  const hashMap = new Map<string, any[]>()
  const duplicates: any[][] = []

  files.forEach((file) => {
    if (!file.fileHash) return
    if (!hashMap.has(file.fileHash)) {
      hashMap.set(file.fileHash, [])
    }
    hashMap.get(file.fileHash)!.push(file)
  })

  hashMap.forEach((group) => {
    if (group.length > 1) {
      duplicates.push(group)
    }
  })

  return duplicates
}


// Collaboration data models and utilities

export interface Comment {
  id: string
  author: string
  content: string
  timestamp: number
  targetType: "ip_asset" | "version" | "file"
  targetId: string
  replies?: Comment[]
  edited?: boolean
  editedAt?: number
}

export interface Activity {
  id: string
  type: "upload" | "edit" | "share" | "comment" | "version" | "permission_change"
  user: string
  description: string
  timestamp: number
  metadata?: {
    fileHash?: string
    assetId?: string
    commentId?: string
    permission?: string
  }
}

export interface CollaboratorActivity {
  address: string
  activities: Activity[]
  totalCount: number
}

/**
 * Save comment to localStorage (mock)
 */
export function saveComment(comment: Comment, address: string): void {
  if (typeof window === "undefined") return

  const key = `comments_${address}`
  const existing = localStorage.getItem(key)
  const comments: Comment[] = existing ? JSON.parse(existing) : []

  comments.push(comment)
  localStorage.setItem(key, JSON.stringify(comments))
}

/**
 * Get comments for a target (IP Asset, version, or file)
 */
export function getComments(
  targetType: "ip_asset" | "version" | "file",
  targetId: string,
  address: string,
): Comment[] {
  if (typeof window === "undefined") return []

  const key = `comments_${address}`
  const existing = localStorage.getItem(key)
  if (!existing) return []

  const allComments: Comment[] = JSON.parse(existing)
  return allComments.filter(
    (c) => c.targetType === targetType && c.targetId === targetId,
  )
}

/**
 * Save activity to localStorage (mock)
 */
export function saveActivity(activity: Activity, address: string): void {
  if (typeof window === "undefined") return

  const key = `activity_logs_${address}`
  const existing = localStorage.getItem(key)
  const activities: Activity[] = existing ? JSON.parse(existing) : []

  activities.unshift(activity) // Add to beginning
  // Keep only last 100 activities
  if (activities.length > 100) {
    activities.splice(100)
  }

  localStorage.setItem(key, JSON.stringify(activities))
}

/**
 * Get activities for a specific collaborator
 */
export function getCollaboratorActivities(
  collaboratorAddress: string,
  address: string,
): Activity[] {
  if (typeof window === "undefined") return []

  const key = `activity_logs_${address}`
  const existing = localStorage.getItem(key)
  if (!existing) return []

  const allActivities: Activity[] = JSON.parse(existing)
  return allActivities.filter((a) => a.user === collaboratorAddress)
}

/**
 * Get all activities grouped by collaborator
 */
export function getActivitiesByCollaborator(
  address: string,
): CollaboratorActivity[] {
  if (typeof window === "undefined") return []

  const key = `activity_logs_${address}`
  const existing = localStorage.getItem(key)
  if (!existing) return []

  const allActivities: Activity[] = JSON.parse(existing)
  const grouped = new Map<string, Activity[]>()

  allActivities.forEach((activity) => {
    if (!grouped.has(activity.user)) {
      grouped.set(activity.user, [])
    }
    grouped.get(activity.user)!.push(activity)
  })

  return Array.from(grouped.entries()).map(([address, activities]) => ({
    address,
    activities: activities.sort((a, b) => b.timestamp - a.timestamp),
    totalCount: activities.length,
  }))
}


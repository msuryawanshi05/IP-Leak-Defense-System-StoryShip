// Notification system for StoryProof

export interface Notification {
  id: string
  type: "transaction" | "ip_asset" | "collaboration" | "system"
  title: string
  message: string
  timestamp: number
  read: boolean
  actionUrl?: string
}

const NOTIFICATION_STORAGE_KEY = "storyproof_notifications"

export function getNotifications(address: string): Notification[] {
  if (typeof window === "undefined") return []
  const key = `${NOTIFICATION_STORAGE_KEY}_${address}`
  const stored = localStorage.getItem(key)
  return stored ? JSON.parse(stored) : []
}

export function addNotification(address: string, notification: Omit<Notification, "id" | "timestamp" | "read">): void {
  if (typeof window === "undefined") return
  const notifications = getNotifications(address)
  const newNotification: Notification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random()}`,
    timestamp: Date.now(),
    read: false,
  }
  notifications.unshift(newNotification)
  // Keep only last 100 notifications
  const limited = notifications.slice(0, 100)
  const key = `${NOTIFICATION_STORAGE_KEY}_${address}`
  localStorage.setItem(key, JSON.stringify(limited))
}

export function markAsRead(address: string, notificationId: string): void {
  if (typeof window === "undefined") return
  const notifications = getNotifications(address)
  const updated = notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
  const key = `${NOTIFICATION_STORAGE_KEY}_${address}`
  localStorage.setItem(key, JSON.stringify(updated))
}

export function markAllAsRead(address: string): void {
  if (typeof window === "undefined") return
  const notifications = getNotifications(address)
  const updated = notifications.map((n) => ({ ...n, read: true }))
  const key = `${NOTIFICATION_STORAGE_KEY}_${address}`
  localStorage.setItem(key, JSON.stringify(updated))
}

export function deleteNotification(address: string, notificationId: string): void {
  if (typeof window === "undefined") return
  const notifications = getNotifications(address)
  const updated = notifications.filter((n) => n.id !== notificationId)
  const key = `${NOTIFICATION_STORAGE_KEY}_${address}`
  localStorage.setItem(key, JSON.stringify(updated))
}

export function getUnreadCount(address: string): number {
  const notifications = getNotifications(address)
  return notifications.filter((n) => !n.read).length
}

// Helper to create notification for transaction
export function notifyTransaction(address: string, txHash: string, status: "success" | "failed"): void {
  addNotification(address, {
    type: "transaction",
    title: status === "success" ? "Transaction Confirmed" : "Transaction Failed",
    message: status === "success" ? `Transaction ${txHash.slice(0, 10)}... confirmed` : `Transaction ${txHash.slice(0, 10)}... failed`,
    actionUrl: `/dashboard?tx=${txHash}`,
  })
}

// Helper to create notification for IP Asset
export function notifyIPAsset(address: string, ipAssetId: string, action: "registered" | "shared"): void {
  addNotification(address, {
    type: "ip_asset",
    title: action === "registered" ? "IP Asset Registered" : "IP Asset Shared",
    message: action === "registered" ? `IP Asset ${ipAssetId} successfully registered` : `IP Asset ${ipAssetId} has been shared`,
    actionUrl: `/dashboard?ipasset=${ipAssetId}`,
  })
}

// Helper to create notification for collaboration
export function notifyCollaboration(address: string, collaborator: string, action: "added" | "removed"): void {
  addNotification(address, {
    type: "collaboration",
    title: action === "added" ? "New Collaborator" : "Collaborator Removed",
    message: action === "added" ? `${collaborator.slice(0, 10)}... has been added as collaborator` : `${collaborator.slice(0, 10)}... has been removed`,
    actionUrl: `/dashboard?tab=collaborators`,
  })
}


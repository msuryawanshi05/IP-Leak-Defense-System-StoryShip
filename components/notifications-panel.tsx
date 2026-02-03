"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, Trash2, X } from "lucide-react"
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount, type Notification } from "@/lib/notifications"
import { formatDistanceToNow } from "date-fns"

interface NotificationsPanelProps {
  address: string | null
}

export default function NotificationsPanel({ address }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (address) {
      loadNotifications()
      const interval = setInterval(loadNotifications, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [address])

  const loadNotifications = () => {
    if (!address) return
    const notifs = getNotifications(address)
    setNotifications(notifs)
    setUnreadCount(getUnreadCount(address))
  }

  const handleMarkAsRead = (id: string) => {
    if (!address) return
    markAsRead(address, id)
    loadNotifications()
  }

  const handleMarkAllAsRead = () => {
    if (!address) return
    markAllAsRead(address)
    loadNotifications()
  }

  const handleDelete = (id: string) => {
    if (!address) return
    deleteNotification(address, id)
    loadNotifications()
  }

  if (!address) return null

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="relative">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 z-50 max-h-[600px] overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg">Notifications</CardTitle>
              {unreadCount > 0 && (
                <CardDescription>{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</CardDescription>
              )}
            </div>
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 hover:bg-secondary/50 transition-colors ${!notif.read ? "bg-primary/5" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{notif.title}</p>
                          {!notif.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notif.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {!notif.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notif.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}


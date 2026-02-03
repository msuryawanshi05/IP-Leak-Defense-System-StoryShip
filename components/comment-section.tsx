"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Comment, getComments, saveComment } from "@/lib/collaboration"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, Send, Edit2, Trash2 } from "lucide-react"
import { formatAddress } from "@/lib/utils"

interface CommentSectionProps {
  targetType: "ip_asset" | "version" | "file"
  targetId: string
  currentUser: string
  onCommentAdded?: () => void
}

export function CommentSection({
  targetType,
  targetId,
  currentUser,
  onCommentAdded,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadComments()
  }, [targetType, targetId, currentUser])

  const loadComments = () => {
    const loaded = getComments(targetType, targetId, currentUser)
    setComments(loaded.sort((a, b) => b.timestamp - a.timestamp))
  }

  const handleSubmit = () => {
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    const comment: Comment = {
      id: `comment_${Date.now()}_${Math.random()}`,
      author: currentUser,
      content: newComment.trim(),
      timestamp: Date.now(),
      targetType,
      targetId,
    }

    saveComment(comment, currentUser)
    setNewComment("")
    loadComments()
    setIsSubmitting(false)

    if (onCommentAdded) {
      onCommentAdded()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Comments ({comments.length})</h3>
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
          >
            <Send className="h-3 w-3 mr-2" />
            Post Comment
          </Button>
        </div>
      </div>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-3 border rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {comment.author.slice(2, 6).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">
                    {formatAddress(comment.author, 6)}
                  </p>
                  {comment.edited && (
                    <Badge variant="outline" className="text-xs">
                      Edited
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.timestamp), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {comment.content}
                </p>
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-2 ml-4 space-y-2 border-l-2 pl-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {reply.author.slice(2, 6).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-medium">
                              {formatAddress(reply.author, 6)}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(reply.timestamp), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-foreground whitespace-pre-wrap">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


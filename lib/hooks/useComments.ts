import { useEffect, useState } from "react"
import { Comment } from "@/lib/supabase/models"
import { commentServices } from "../services/commentServices"
import { useSupabase } from "../supabase/SupabaseProvider"
import { useUser } from "@clerk/nextjs"

export function useComments(taskId: string | null) {

  const { supabase } = useSupabase()
  const { user } = useUser()

  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    if (!taskId || !supabase) return
    loadComments()
  }, [taskId])

  async function loadComments() {
    const data = await commentServices.getCommentsByTask(
      supabase!,
      taskId!
    )

    setComments(data)
  }

  async function addComment(content: string) {

    if (!user || !supabase || !taskId) return

    const newComment = await commentServices.createComment(
      supabase,
      {
        task_id: taskId,
        user_id: user.id,
        content
      }
    )

    setComments(prev => [...prev, newComment])
  }

  async function deleteComment(commentId: string) {

    if (!supabase) return

    await commentServices.deleteComment(
      supabase,
      commentId
    )

    setComments(prev =>
      prev.filter(c => c.id !== commentId)
    )
  }

  return {
    comments,
    addComment,
    deleteComment
  }

}
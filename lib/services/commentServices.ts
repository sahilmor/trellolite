import { SupabaseClient } from "@supabase/supabase-js"
import { Comment } from "@/lib/supabase/models"

export const commentServices = {

  async getCommentsByTask(
    supabase: SupabaseClient,
    taskId: string
  ): Promise<Comment[]> {

    const { data, error } = await supabase
      .from("comments")
.select(`
  *
`)
      .eq("task_id", taskId)
      .order("created_at", { ascending: true })

    if (error) throw error

    return data || []
  },

  async createComment(
    supabase: SupabaseClient,
    comment: Omit<Comment, "id" | "created_at">
  ): Promise<Comment> {

    const { data, error } = await supabase
      .from("comments")
      .insert(comment)
      .select()
      .single()

    if (error) throw error

    return data
  },

  async deleteComment(
    supabase: SupabaseClient,
    commentId: string
  ) {

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)

    if (error) throw error
  }

}
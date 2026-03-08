import { SupabaseClient } from "@supabase/supabase-js"
import { TaskActivity } from "@/lib/supabase/models"

export const activityServices = {

  async getTaskActivity(
    supabase: SupabaseClient,
    taskId: string
  ): Promise<TaskActivity[]> {

    const { data, error } = await supabase
      .from("task_activity")
      .select(`
  *,
  users (
    name,
    image_url
  )
`)
      .eq("task_id", taskId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  },

  async createActivity(
    supabase: SupabaseClient,
    activity: Omit<TaskActivity, "id" | "created_at">
  ) {

    const { error } = await supabase
      .from("task_activity")
      .insert(activity)

    if (error) throw error
  }

}
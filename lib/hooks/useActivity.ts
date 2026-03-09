"use client"

import { useEffect } from "react"
import { useSupabase } from "@/lib/supabase/SupabaseProvider"
import { useBoardStore } from "@/store/boardStore"
import { TaskActivity } from "../supabase/models"

export function useActivity(taskId: string | null) {
  const { supabase } = useSupabase()

  const { activity, setActivity, addActivity } = useBoardStore()

  async function loadActivity() {
    if (!taskId || !supabase) return

    const { data } = await supabase
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

    if (data) {
      setActivity(data)
    }
  }

  useEffect(() => {
    if (!taskId || !supabase) return

    loadActivity()

    const channel = supabase
      .channel(`task-activity-${taskId}`)

      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "task_activity",
          filter: `task_id=eq.${taskId}`,
        },
        (payload) => {
  addActivity(payload.new as TaskActivity)
}
      )

      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [taskId, supabase])

  return { activity }
}
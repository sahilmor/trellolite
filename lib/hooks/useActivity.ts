import { useEffect, useState } from "react"
import { TaskActivity } from "@/lib/supabase/models"
import { activityServices } from "../services/activityServices"
import { useSupabase } from "../supabase/SupabaseProvider"

export function useActivity(taskId: string | null) {

  const { supabase } = useSupabase()

  const [activity, setActivity] = useState<TaskActivity[]>([])

  useEffect(() => {

    if (!taskId || !supabase) return

    loadActivity()

  }, [taskId])

  async function loadActivity() {

    const data = await activityServices.getTaskActivity(
      supabase!,
      taskId!
    )

    setActivity(data)

  }

  return { activity }

}
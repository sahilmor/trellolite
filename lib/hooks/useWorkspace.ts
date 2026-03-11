import { useUser } from "@clerk/nextjs"
import { useSupabase } from "../supabase/SupabaseProvider"
import { useEffect } from "react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { Workspace } from "@/lib/supabase/models"

export function useWorkspace() {

  const { user } = useUser()
  const { supabase } = useSupabase()

  const { workspace, setWorkspace } = useWorkspaceStore()

  useEffect(() => {

    if (!user || !supabase || workspace) return

    const currentUser = user
    const currentSupabase = supabase

    async function loadWorkspace() {

      const { data, error } = await currentSupabase
  .from("workspace_members")
  .select(`
    role,
    workspaces (*)
  `)
  .eq("user_id", currentUser.id)
  .limit(1)
  .maybeSingle();

      if (data) {
        setWorkspace(data?.workspaces as unknown as Workspace)
        return
      }

      if (error && error.code === "PGRST116") {

        const { data: newWorkspace, error: createError } =
          await currentSupabase
            .from("workspaces")
            .insert({
              name: `${currentUser.firstName || "My"} Workspace`,
              owner_id: currentUser.id,
            })
            .select()
            .single()

            await currentSupabase.from("workspace_members").insert({
              workspace_id: newWorkspace.id,
              user_id: currentUser.id,
              role: "owner",
            });

        if (createError) {
          console.error("Failed to create workspace:", createError)
          return
        }

        setWorkspace(newWorkspace as Workspace)
      }

    }

    loadWorkspace()

  }, [user, supabase, workspace, setWorkspace])

  return { workspace }
}
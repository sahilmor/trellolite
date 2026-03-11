import { create } from "zustand"
import { Workspace } from "@/lib/supabase/models"

type WorkspaceStore = {
  workspace: Workspace | null
  setWorkspace: (workspace: Workspace | null) => void
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  workspace: null,

  setWorkspace: (workspace) =>
    set({
      workspace,
    }),
}))
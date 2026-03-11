"use client";

import { useWorkspaceStore } from "@/store/workspaceStore";
import { useWorkspace } from "@/lib/hooks/useWorkspace";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, Plus } from "lucide-react";

export default function WorkspacesPage() {

  const { workspace } = useWorkspaceStore();

  useWorkspace(); // loads workspace

  return (
    <div className="p-6">

      <div className="flex items-center justify-between mb-6">

        <div>
          <h1 className="text-2xl font-bold">Workspaces</h1>
          <p className="text-gray-500 text-sm">
            Manage your workspaces
          </p>
        </div>

        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Workspace
        </Button>

      </div>

      {/* Workspace List */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {workspace && (
          <Card className="p-5 hover:shadow-md cursor-pointer transition">

            <div className="flex items-center gap-3">

              <div className="bg-blue-100 p-3 rounded-lg">
                <Layers className="text-blue-600 h-5 w-5"/>
              </div>

              <div>
                <div className="font-semibold">
                  {workspace.name}
                </div>

                <div className="text-xs text-gray-500">
                  Personal Workspace
                </div>
              </div>

            </div>

          </Card>
        )}

      </div>

    </div>
  );
}
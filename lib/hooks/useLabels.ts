import { useEffect, useState } from "react";
import { Label } from "@/lib/supabase/models";
import { labelServices } from "@/lib/services/labelServices";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";

export function useLabels(boardId: string | null) {
  const { supabase } = useSupabase();

  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!boardId || !supabase) return;

    loadLabels();
  }, [boardId, supabase]);

  async function loadLabels() {
  if (!supabase || !boardId) return;

  try {
    setLoading(true);

    const data = await labelServices.getBoardLabels(
      supabase,
      boardId
    );

    const formatted = data.map((label: any) => ({
      ...label,
      usage: label.task_labels?.[0]?.count || 0,
    }));

    setLabels(formatted);

  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Failed to load labels"
    );
  } finally {
    setLoading(false);
  }
}

  async function createLabel(name: string, color: string) {
    if (!supabase || !boardId) return;

    try {
      const newLabel = await labelServices.createLabel(supabase, {
        name,
        color,
        board_id: boardId,
      });

      setLabels((prev) => [...prev, newLabel]);

      return newLabel;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create label");
    }
  }

  async function addLabelToTask(taskId: string, labelId: string) {
    if (!supabase) return;

    try {
      await labelServices.addLabelToTask(supabase, taskId, labelId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add label");
    }
  }

  async function removeLabelFromTask(taskId: string, labelId: string) {
    if (!supabase) return;

    try {
      await labelServices.removeLabelFromTask(supabase, taskId, labelId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove label");
    }
  }

  async function updateLabel(labelId: string, name: string, color: string) {
    if (!supabase) return;

    const updated = await labelServices.updateLabel(supabase, labelId, {
      name,
      color,
    });

    setLabels((prev) => prev.map((l) => (l.id === labelId ? updated : l)));
  }

  async function deleteLabel(labelId: string) {
    if (!supabase) return;

    await labelServices.deleteLabel(supabase, labelId);

    setLabels((prev) => prev.filter((l) => l.id !== labelId));
  }

  return {
    labels,
    loading,
    error,
    createLabel,
    addLabelToTask,
    removeLabelFromTask,
    updateLabel,
    deleteLabel,
  };
}

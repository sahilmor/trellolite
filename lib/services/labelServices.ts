import { SupabaseClient } from "@supabase/supabase-js";
import { Label } from "../supabase/models";

export const labelServices = {
  async getBoardLabels(supabase: SupabaseClient, boardId: string) {

  const { data, error } = await supabase
    .from("labels")
    .select(`
      id,
      name,
      color,
      board_id,
      task_labels(count)
    `)
    .eq("board_id", boardId);

  if (error) throw error;

  return data;
},

  async createLabel(
    supabase: SupabaseClient,
    label: Omit<Label, "id" | "created_at">,
  ): Promise<Label> {
    const { data, error } = await supabase
      .from("labels")
      .insert(label)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async addLabelToTask(
  supabase: SupabaseClient,
  taskId: string,
  labelId: string
) {
  const { data: existing } = await supabase
    .from("task_labels")
    .select("label_id")
    .eq("task_id", taskId)
    .eq("label_id", labelId)
    .maybeSingle();

  if (existing) return;

  const { error } = await supabase
    .from("task_labels")
    .insert({
      task_id: taskId,
      label_id: labelId,
    });

  if (error) throw error;
},

  async removeLabelFromTask(
    supabase: SupabaseClient,
    taskId: string,
    labelId: string,
  ) {
    const { error } = await supabase
      .from("task_labels")
      .delete()
      .eq("task_id", taskId)
      .eq("label_id", labelId);

    if (error) throw error;
  },

  async getTaskLabels(supabase: SupabaseClient, taskId: string) {
    const { data, error } = await supabase
      .from("task_labels")
      .select(
        `
        id,
        labels (
          id,
          name,
          color
        )
      `,
      )
      .eq("task_id", taskId);

    if (error) throw error;

    return data || [];
  },

  async updateLabel(
    supabase: SupabaseClient,
    labelId: string,
    updates: { name?: string; color?: string },
  ) {
    const { data, error } = await supabase
      .from("labels")
      .update(updates)
      .eq("id", labelId)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async deleteLabel(supabase: SupabaseClient, labelId: string) {
    const { error } = await supabase.from("labels").delete().eq("id", labelId);

    if (error) throw error;
  },
};

import { Task } from "@/lib/supabase/models";
import { SupabaseClient } from "@supabase/supabase-js";

export const taskServices = {
  async getTasksByBoard(
    supabase: SupabaseClient,
    boardId: string,
  ): Promise<Task[]> {

    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        columns!inner(board_id),
        task_labels (
          label_id,
          labels (
            id,
            name,
            color
          )
        )
      `)
      .eq("columns.board_id", boardId)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("GET TASKS ERROR:", error);
      throw error;
    }

    return data ?? [];
  },

  async createTask(
    supabase: SupabaseClient,
    task: Omit<Task, "id" | "created_at" | "updated_at" | "sort_order"> & {
      sort_order?: number;
    },
  ): Promise<Task> {

    let sortOrder = task.sort_order;

    if (sortOrder === undefined) {
      const { data: lastTask, error } = await supabase
        .from("tasks")
        .select("sort_order")
        .eq("column_id", task.column_id)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("SORT ORDER FETCH ERROR:", error);
      }

      sortOrder = lastTask ? lastTask.sort_order + 1 : 0;
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        ...task,
        sort_order: sortOrder,
      })
      .select("*")
      .single();

    if (error) {
      console.error("CREATE TASK ERROR:", error);
      throw error;
    }

    return data;
  },

  async moveTask(
    supabase: SupabaseClient,
    taskId: string,
    newColumnId: string,
    newOrder: number,
  ): Promise<Task> {

    const { data, error } = await supabase
      .from("tasks")
      .update({
        column_id: newColumnId,
        sort_order: newOrder,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .select("*")
      .single();

    if (error) {
      console.error("MOVE TASK ERROR:", error);
      throw error;
    }

    return data;
  },

  async deleteTask(
    supabase: SupabaseClient,
    taskId: string,
  ): Promise<void> {

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      console.error("DELETE TASK ERROR:", error);
      throw error;
    }
  },

  async updateTask(
    supabase: SupabaseClient,
    taskId: string,
    updates: Partial<Omit<Task, "id" | "created_at">>,
  ): Promise<Task> {

    const { data, error } = await supabase
      .from("tasks")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .select("*")
      .single();

    if (error) {
      console.error("UPDATE TASK ERROR:", error);
      throw error;
    }

    return data;
  },
};
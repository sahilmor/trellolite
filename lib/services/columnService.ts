import { Column } from "@/lib/supabase/models";
import { SupabaseClient } from "@supabase/supabase-js";

export const columnServices = {
  async getColumns(
    supabase: SupabaseClient,
    boardId: string
  ): Promise<Column[]> {
    const { data, error } = await supabase
      .from("columns")
      .select("*")
      .eq("board_id", boardId)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  async createColumn(
    supabase: SupabaseClient,
    column: Omit<Column, "id" | "created_at" | "updated_at">
  ): Promise<Column> {
    const { data, error } = await supabase
      .from("columns")
      .insert(column)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error("Failed to create column");
    }

    return data;
  },

  async updateColumnTitle(
    supabase: SupabaseClient,
    columnId: string,
    title: string
  ): Promise<Column> {
    const { data, error } = await supabase
      .from("columns")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", columnId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error("Failed to update column");
    }

    return data;
  },

  async deleteColumn(supabase: SupabaseClient, columnId: string) {
    const { error } = await supabase
      .from("columns")
      .delete()
      .eq("id", columnId);

    if (error) throw error;
  },
};
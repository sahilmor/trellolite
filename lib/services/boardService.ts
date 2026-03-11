import { Board } from "@/lib/supabase/models";
import { SupabaseClient } from "@supabase/supabase-js";
import { columnServices } from "./columnService";
import { taskServices } from "./taskService";
import { useBoardStore } from "@/store/boardStore";

export const boardServices = {
  async getBoard(supabase: SupabaseClient, boardId: string): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("id", boardId)
      .single();

    if (error) throw error;

    return data;
  },

  async getBoards(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<Board[]> {

  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
},

  async createBoard(
    supabase: SupabaseClient,
    board: Omit<Board, "id" | "created_at" | "updated_at">
  ): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .insert(board)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error("Failed to create board");
    }

    return data;
  },

  async updateBoard(
    supabase: SupabaseClient,
    boardId: string,
    updates: Partial<Board>
  ): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", boardId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error("Failed to update board");
    }

    return data;
  },

  async deleteBoard(supabase: SupabaseClient, boardId: string) {
    const { error } = await supabase
      .from("boards")
      .delete()
      .eq("id", boardId);

    if (error) throw error;
  },
};


export const boardDataServices = {
  async getBoardWithColumns(supabase: SupabaseClient, boardId: string) {
    const [board, columns] = await Promise.all([
      boardServices.getBoard(supabase, boardId),
      columnServices.getColumns(supabase, boardId),
    ]);

    if (!board) throw new Error("Board not found");

    const tasks = await taskServices.getTasksByBoard(supabase, boardId);

    const { setTasks } = useBoardStore.getState()

    setTasks(tasks)

    const columnsWithTasks = columns.map((column) => ({
  ...column,
  taskIds: tasks
    .filter((task) => task.column_id === column.id)
    .map((task) => task.id)
}))

    return {
      board,
      columnsWithTasks,
    };
  },

  async createBoardWithDefaultColumns(
    supabase: SupabaseClient,
    boardData: {
      title: string;
      description?: string;
      color?: string;
      userId: string;
      workspaceId: string;
    }
  ) {
    const board = await boardServices.createBoard(supabase, {
      title: boardData.title,
      description: boardData.description || null,
      color: boardData.color || "bg-blue-500",
      user_id: boardData.userId,
      workspace_id: boardData.workspaceId,
    });

    const defaultColumns = [
      { title: "To Do", sort_order: 0 },
      { title: "In Progress", sort_order: 1 },
      { title: "In Review", sort_order: 2 },
      { title: "Done", sort_order: 3 },
    ];

    await Promise.all(
      defaultColumns.map((column) =>
        columnServices.createColumn(supabase, {
          ...column,
          board_id: board.id,
          user_id: boardData.userId,
        })
      )
    );

    return board;
  },
};

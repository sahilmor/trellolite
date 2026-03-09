import { useUser } from "@clerk/nextjs";
import { boardServices, boardDataServices } from "@/lib/services/boardService";
import { columnServices } from "@/lib/services/columnService";
import { taskServices } from "@/lib/services/taskService";
import { useState, useEffect } from "react";
import { Board, ColumnWithTasks, Label, Task } from "../supabase/models";
import { useSupabase } from "../supabase/SupabaseProvider";
import { activityServices } from "../services/activityServices";
import { labelServices } from "../services/labelServices";
import { useBoardStore } from "@/store/boardStore";

export function useBoards() {
  const { user } = useUser();
  const { supabase } = useSupabase();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && supabase) {
      loadBoards();
    }
  }, [user, supabase]);

  async function loadBoards() {
    if (!user || !supabase) return;

    try {
      setLoading(true);
      const data = await boardServices.getBoards(supabase, user.id);
      setBoards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load boards");
    } finally {
      setLoading(false);
    }
  }

  async function createBoard(boardData: {
    title: string;
    description?: string;
    color?: string;
  }) {
    if (!user || !supabase) throw new Error("User not authenticated");

    const newBoard = await boardDataServices.createBoardWithDefaultColumns(
      supabase,
      {
        ...boardData,
        userId: user.id,
      },
    );

    setBoards((prev) => [newBoard, ...prev]);
  }

  async function deleteBoard(boardId: string) {
    if (!supabase) return;

    await boardServices.deleteBoard(supabase, boardId);

    setBoards((prev) => prev.filter((b) => b.id !== boardId));
  }

  return { boards, loading, error, createBoard, deleteBoard };
}

export function useBoard(boardId: string) {
  const { user } = useUser();
  const { supabase } = useSupabase();

  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { columns, setColumns, updateTaskInBoard } = useBoardStore();
  const { setTasks, tasksMap } = useBoardStore.getState();

  useEffect(() => {
    if (boardId && supabase) loadBoard();
  }, [boardId, supabase]);

  useEffect(() => {
  if (!supabase || !boardId) return;

  const channel = supabase
    .channel(`board-${boardId}-realtime`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tasks" },
      loadBoard
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "columns" },
      loadBoard
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "task_labels" },
      loadBoard
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "labels" },
      loadBoard
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [supabase, boardId]);

  async function loadBoard() {
    if (!supabase) return;

    try {
      setLoading(true);

      const data = await boardDataServices.getBoardWithColumns(
        supabase,
        boardId,
      );

      setBoard(data.board);

      const tasks = await taskServices.getTasksByBoard(supabase, boardId);

      setTasks(tasks);

      const normalizedColumns: ColumnWithTasks[] = data.columnsWithTasks.map(
        (col) => ({
          ...col,
          taskIds: tasks
            .filter((t) => t.column_id === col.id)
            .map((t) => t.id),
        }),
      );

      setColumns(normalizedColumns);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load board");
    } finally {
      setLoading(false);
    }
  }

  async function updateBoard(boardId: string, updates: Partial<Board>) {
  if (!supabase) return;

  try {
    const updatedBoard = await boardServices.updateBoard(
      supabase,
      boardId,
      updates
    );

    setBoard(updatedBoard);
    return updatedBoard;
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Failed to update board"
    );
  }
}

  async function createRealTask(
    columnId: string,
    taskData: {
      title: string;
      description?: string;
      assignee?: string;
      dueDate?: string;
      priority: "low" | "medium" | "high";
    },
  ) {
    if (!supabase) return;

    const newTask = await taskServices.createTask(supabase, {
      title: taskData.title,
      description: taskData.description || null,
      assignee: taskData.assignee || null,
      due_date: taskData.dueDate || null,
      column_id: columnId,
      priority: taskData.priority,
    });

    setTasks([newTask]);

    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, taskIds: [...col.taskIds, newTask.id] }
          : col,
      ),
    );

    return newTask;
  }

  async function moveTask(
    taskId: string,
    newColumnId: string,
    newOrder: number,
  ) {
    const originalColumns = [...columns];

    setColumns((prev) => {
      const next = prev.map((c) => ({ ...c, taskIds: [...c.taskIds] }));

      for (const col of next) {
        const idx = col.taskIds.indexOf(taskId);
        if (idx !== -1) col.taskIds.splice(idx, 1);
      }

      const target = next.find((c) => c.id === newColumnId);
      if (target) target.taskIds.splice(newOrder, 0, taskId);

      return next;
    });

    try {
      await taskServices.moveTask(supabase!, taskId, newColumnId, newOrder);
    } catch (err) {
      setColumns(originalColumns);
    }
  }

  async function deleteTask(taskId: string) {
    if (!supabase) return;

    const originalColumns = [...columns];

    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        taskIds: col.taskIds.filter((id) => id !== taskId),
      })),
    );

    try {
      await taskServices.deleteTask(supabase, taskId);
    } catch {
      setColumns(originalColumns);
    }
  }

  async function updateTask(
    taskId: string,
    updates: Partial<Omit<Task, "id" | "created_at">>,
  ) {
    if (!supabase || !user) return;

    updateTaskInBoard(taskId, updates);

    const updatedTask = await taskServices.updateTask(supabase, taskId, updates);

    for (const [field, value] of Object.entries(updates)) {
      await activityServices.createActivity(supabase, {
        task_id: taskId,
        user_id: user.id,
        action: `updated ${field}`,
        metadata: { field, value },
      });
    }

    return updatedTask;
  }

  async function createColumn(title: string) {
    if (!board || !supabase || !user) return;

    const newColumn = await columnServices.createColumn(supabase, {
      title,
      board_id: board.id,
      sort_order: columns.length,
      user_id: user.id,
    });

    setColumns((prev) => [...prev, { ...newColumn, taskIds: [] }]);
  }

  async function updateColumn(columnId: string, title: string) {
    if (!supabase) return;

    const updated = await columnServices.updateColumnTitle(
      supabase,
      columnId,
      title,
    );

    setColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, ...updated } : col)),
    );
  }

  async function deleteColumn(columnId: string) {
    if (!supabase) return;

    await columnServices.deleteColumn(supabase, columnId);

    setColumns((prev) => prev.filter((c) => c.id !== columnId));
  }

  async function addLabel(taskId: string, label: Label) {
    if (!supabase) return;

    await labelServices.addLabelToTask(supabase, taskId, label.id);

    updateTaskInBoard(taskId, {
      task_labels: [
        ...(tasksMap[taskId]?.task_labels || []),
        { label_id: label.id, labels: label },
      ],
    });
  }

  async function removeLabel(taskId: string, labelId: string) {
    if (!supabase) return;

    await labelServices.removeLabelFromTask(supabase, taskId, labelId);

    const task = tasksMap[taskId];

    updateTaskInBoard(taskId, {
      task_labels: task?.task_labels?.filter((l) => l.label_id !== labelId) || [],
    });
  }

  return {
    board,
    columns,
    loading,
    error,
    createRealTask,
    moveTask,
    deleteTask,
    updateBoard,
    updateTask,
    createColumn,
    updateColumn,
    deleteColumn,
    addLabel,
    removeLabel,
  };
}
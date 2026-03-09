import { useUser } from "@clerk/nextjs";
import { boardServices, boardDataServices } from "@/lib/services/boardService";
import { columnServices } from "@/lib/services/columnService";
import { taskServices } from "@/lib/services/taskService";
import { useState } from "react";
import { Board, ColumnWithTasks, Label, Task } from "../supabase/models";
import { useSupabase } from "../supabase/SupabaseProvider";
import { activityServices } from "../services/activityServices"
import { useEffect } from "react";
import { labelServices } from "../services/labelServices";

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
      setError(null);
      const data = await boardServices.getBoards(supabase!, user.id);
      setBoards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load boards.");
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
    try {
      const newBoard = await boardDataServices.createBoardWithDefaultColumns(
        supabase!,
        {
          ...boardData,
          userId: user.id,
        },
      );
      setBoards((prev) => [newBoard, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board.");
    }
  }

  async function deleteBoard(boardId: string) {
    if (!user || !supabase) throw new Error("User not authenticated");
    try {
      await boardServices.deleteBoard(supabase!, boardId);
      setBoards((prev) => prev.filter((board) => board.id !== boardId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete board.");
    }
  }

  return { boards, loading, error, createBoard, deleteBoard };
}

export function useBoard(boardId: string) {
  const { user } = useUser();
  const { supabase } = useSupabase();
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<ColumnWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (boardId && supabase) {
      loadBoard();
    }
  }, [boardId, supabase]);

  useEffect(() => {

  if (!supabase || !boardId) return;

  const channel = supabase
    .channel(`board-${boardId}-realtime`)

    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "tasks",
      },
      () => {
        loadBoard();
      }
    )

    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "columns",
      },
      () => {
        loadBoard();
      }
    )

    .on(
  "postgres_changes",
  {
    event: "*",
    schema: "public",
    table: "task_labels",
  },
  () => {
    loadBoard();
  }
)

  .on(
  "postgres_changes",
  {
    event: "*",
    schema: "public",
    table: "labels",
  },
  () => {
    loadBoard();
  }
)

    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };

}, [supabase, boardId]);

  async function loadBoard() {
    if (!boardId || !supabase) return;

    try {
      setLoading(true);
      setError(null);
      const data = await boardDataServices.getBoardWithColumns(
        supabase!,
        boardId,
      );
      setBoard(data.board);
      setColumns(data.columnsWithTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load boards.");
    } finally {
      setLoading(false);
    }
  }

  async function updateBoard(boardId: string, updates: Partial<Board>) {
    try {
      const updatedBoard = await boardServices.updateBoard(
        supabase!,
        boardId,
        updates,
      );
      setBoard(updatedBoard);
      return updatedBoard;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to Update the boards.",
      );
    } finally {
      setLoading(false);
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
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    try {
      const newTask = await taskServices.createTask(supabase, {
        title: taskData.title,
        description: taskData.description || null,
        assignee: taskData.assignee || null,
        due_date: taskData.dueDate || null,
        column_id: columnId,
        priority: taskData.priority || "medium",
      });

      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId
            ? { ...col, tasks: [...col.tasks, newTask] }
            : col,
        ),
      );

      return newTask;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create the task.",
      );
    }
  }

  async function moveTask(
    taskId: string,
    newColumnId: string,
    newOrder: number,
  ) {
    const originalColumns = [...columns];

    setColumns((prevColumns) => {
      const nextColumns = prevColumns.map((col) => ({
        ...col,
        tasks: [...col.tasks],
      }));

      let taskToMove = null;

      for (const col of nextColumns) {
        const taskIndex = col.tasks.findIndex((t) => t.id === taskId);
        if (taskIndex !== -1) {
          [taskToMove] = col.tasks.splice(taskIndex, 1);
          break;
        }
      }

      if (!taskToMove) return prevColumns;

      taskToMove = { ...taskToMove, column_id: newColumnId };

      const targetColumn = nextColumns.find((col) => col.id === newColumnId);
      if (targetColumn) {
        targetColumn.tasks.splice(newOrder, 0, taskToMove);
      }

      return nextColumns;
    });

    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }

      await taskServices.moveTask(supabase, taskId, newColumnId, newOrder);
    } catch (err) {
      setColumns(originalColumns);
      setError(err instanceof Error ? err.message : "Failed to move the task.");
    }
  }

  async function deleteTask(taskId: string) {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  const originalColumns = [...columns];

  setColumns(prev =>
    prev.map(col => ({
      ...col,
      tasks: col.tasks.filter(task => task.id !== taskId)
    }))
  );

  try {
    await taskServices.deleteTask(supabase, taskId);
  } catch (err) {
    setColumns(originalColumns);
    setError(err instanceof Error ? err.message : "Failed to delete task.");
  }
}

async function updateTask(
  taskId: string,
  updates: Partial<Omit<Task, "id" | "created_at">>
) {

  if (!supabase || !user) {
    throw new Error("Supabase client or user not initialized");
  }

  const originalColumns = [...columns];

  // optimistic UI update
  setColumns((prev) =>
    prev.map((col) => ({
      ...col,
      tasks: col.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
    }))
  );

  try {

    const updatedTask = await taskServices.updateTask(
      supabase,
      taskId,
      updates
    );

    // Activity log
    for (const [field, value] of Object.entries(updates)) {

  let action = ""

  switch (field) {

    case "priority":
      action = `changed priority → ${value}`
      break

    case "assignee":
      action = `assigned task → ${value || "Unassigned"}`
      break

    case "due_date":
      action = `changed due date`
      break

    case "description":
      action = `updated description`
      break

    case "title":
      action = `renamed task`
      break

    default:
      action = `updated task`
  }

  await activityServices.createActivity(supabase, {
    task_id: taskId,
    user_id: user.id,
    action,
    metadata: { field, value },
  })
}

    return updatedTask;

  } catch (err) {

    // rollback if DB fails
    setColumns(originalColumns);

    setError(
      err instanceof Error ? err.message : "Failed to update task."
    );
  }
}

  async function createColumn(title: string) {
    if (!board || !user) throw new Error("Board not loaded");

    try {
      const newColumn = await columnServices.createColumn(supabase!, {
        title,
        board_id: board.id,
        sort_order: columns.length,
        user_id: user?.id,
      });

      setColumns((prev) => [...prev, { ...newColumn, tasks: [] }]);
      return newColumn;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create new column.",
      );
    }
  }

  async function updateColumn(columnId: string, title: string) {
    try {
      const updatedColumn = await columnServices.updateColumnTitle(
        supabase!,
        columnId,
        title,
      );

      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, ...updatedColumn } : col,
        ),
      );
      return updatedColumn;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update column.");
    }
  }

  async function deleteColumn(columnId: string) {
    try {
      await columnServices.deleteColumn(supabase!, columnId);

      setColumns((prev) => prev.filter((col) => col.id !== columnId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete column.");
    }
  }

async function addLabel(taskId: string, label: Label) {
  if (!supabase) return;

  // DB update
  await labelServices.addLabelToTask(supabase, taskId, label.id);

  // UI update
  setColumns((prev) =>
    prev.map((col) => ({
      ...col,
      tasks: col.tasks.map((task) => {
        if (task.id !== taskId) return task;

        const exists = task.task_labels?.some(
          (l) => l.label_id === label.id
        );

        if (exists) return task;

        return {
          ...task,
          task_labels: [
            ...(task.task_labels || []),
            {
              label_id: label.id,
              labels: label,
            },
          ],
        };
      }),
    }))
  );
}

async function removeLabel(taskId: string, labelId: string) {
  if (!supabase) return;

  await labelServices.removeLabelFromTask(supabase, taskId, labelId);

  setColumns((prev) =>
    prev.map((col) => ({
      ...col,
      tasks: col.tasks.map((task) => {
        if (task.id !== taskId) return task;

        return {
          ...task,
          task_labels:
            task.task_labels?.filter((l) => l.label_id !== labelId) || [],
        };
      }),
    }))
  );
}

function updateLabelInTasks(labelId: string, updates: Partial<Label>) {
  setColumns((prev) =>
    prev.map((col) => ({
      ...col,
      tasks: col.tasks.map((task) => ({
        ...task,
        task_labels:
          task.task_labels?.map((tl) =>
            tl.label_id === labelId
              ? {
                  ...tl,
                  labels: { ...tl.labels, ...updates },
                }
              : tl
          ) || [],
      })),
    }))
  );
}

  return {
    board,
    columns,
    loading,
    error,
    updateBoard,
    createRealTask,
    setColumns,
    moveTask,
    deleteTask,
    updateTask,
    createColumn,
    updateColumn,
    deleteColumn,
    addLabel,
    removeLabel,
    updateLabelInTasks,
  };
}

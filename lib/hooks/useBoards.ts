import { useUser } from "@clerk/nextjs"
import { boardDataServices, boardServices, columnServices, taskServices } from "../services"
import { useState } from "react";
import { Board, Column, ColumnWithTasks, Task } from "../supabase/models";
import { useSupabase } from "../supabase/SupabaseProvider";
import { useEffect } from "react";
import { title } from "process";

export function useBoards() {
    const { user } = useUser();
    const { supabase } = useSupabase();
    const [boards, setBoards] = useState<Board[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if(user) {
            loadBoards();
        }
    }, [user, supabase])

    async function loadBoards() {
        if(!user) return;

        try {
            setLoading(true)
            setError(null)
            const data = await boardServices.getBoards(supabase!, user.id)
            setBoards(data)
        } catch(err) {
            setError(err instanceof Error ? err.message : "Failed to load boards.")
        } finally {
            setLoading(false)
        }
    }

    async function createBoard(boardData: {
        title: string,
        description?: string,
        color?: string,
    }){

        if(!user) throw new Error("User not authenticated")
        try {
            const newBoard = await boardDataServices.createBoardWithDefaultColumns(
                supabase!,
                {
                ...boardData,
                userId: user.id
            });
            setBoards((prev) => [newBoard, ...prev])
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create board.")
        }
    }

    async function deleteBoard(boardId: string) {
        if(!user) throw new Error("User not authenticated")
        try {
            await boardServices.deleteBoard(supabase!, boardId)
            setBoards((prev) => prev.filter((board) => board.id !== boardId))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete board.")
        }
    }

    return { boards, loading, error, createBoard, deleteBoard }
}

export function useBoard(boardId: string) {
    const { user } = useUser();
    const { supabase } = useSupabase();
    const [board, setBoard] = useState<Board | null>(null);
    const [columns, setColumns] = useState<ColumnWithTasks[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if(boardId) {
            loadBoard();
        }
    }, [boardId, supabase])

    async function loadBoard() {
        if(!boardId) return;

        try {
            setLoading(true)
            setError(null)
            const data = await boardDataServices.getBoardWithColumns(supabase!, boardId)
            setBoard(data.board)
            setColumns(data.columnsWithTasks)
        } catch(err) {
            setError(err instanceof Error ? err.message : "Failed to load boards.")
        } finally {
            setLoading(false)
        }
    }
    
    async function updateBoard(boardId: string, updates: Partial<Board>) {
        try {
            const updatedBoard = await boardServices.updateBoard(supabase!, boardId, updates)
            setBoard(updatedBoard)
            return updateBoard;
        } catch(err) {
            setError(err instanceof Error ? err.message : "Failed to Update the boards.")
        } finally {
            setLoading(false)
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
      }
    ) {
        try {
            const newTask = await taskServices.createTask(supabase!, {
                title: taskData.title,
                description: taskData.description || null,
                assignee: taskData.assignee || null,
                due_date: taskData.dueDate || null,
                column_id: columnId,
                sort_order: columns.find((col) => col.id === columnId)?.tasks.length || 0,
                priority: taskData.priority || "medium"
            })

            setColumns((prev) => prev.map((col) => col.id === columnId ? {...col, tasks: [...col.tasks, newTask]} : col))

            return newTask
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create the task.")
        }
    }

    async function moveTask(
      taskId: string,
      newColumnId: string,
      newOrder: number
    ) {
      try {
        await taskServices.moveTask(supabase!, taskId, newColumnId, newOrder);

        setColumns((prev) => {
            const newColumns = [...prev];

            let taskToMove: Task | null = null;
            for(const col of newColumns) {
                const taskIndex = col.tasks.findIndex((task) => task.id === taskId);

                if(taskIndex !== -1) {
                    taskToMove = col.tasks[taskIndex];
                    col.tasks.splice(taskIndex, 1);
                    break;
                }
            }

            if(taskToMove) {
                const targetColumn = newColumns.find((col) => col.id === newColumnId);
                if(targetColumn) {
                    targetColumn.tasks.splice(newOrder, 0, taskToMove)
                }
            }

            return newColumns;
        })
      } catch(err){
        setError(err instanceof Error ? err.message : "Failed to move the task.")
      }
    }

    async function createColumn(title: string) {
        if(!board || !user) throw new Error("Board not loaded")

            try {
              const newColumn = await columnServices.createColumn(supabase!, {
                title,
                board_id: board.id,
                sort_order: columns.length,
                user_id: user?.id,
              });

              setColumns((prev) => [...prev, {...newColumn, tasks: []}])
              return newColumn;
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to create new column.")
            }
    }
    
    async function updateColumn(columnId: string, title: string) {
            try {
              const updatedColumn = await columnServices.updateColumnTitle(supabase!, columnId, title);

              setColumns((prev) => prev.map((col) => col.id === columnId ? {...col, ...updatedColumn} : col ))
              return updatedColumn;
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to update column.")
            }
    }

    async function deleteColumn(columnId: string) {
            try {
              await columnServices.deleteColumn(supabase!, columnId);

              setColumns((prev) => prev.filter((col) => col.id !== columnId))
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to delete column.")
            }
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
        createColumn,
        updateColumn,
        deleteColumn,
    }

}
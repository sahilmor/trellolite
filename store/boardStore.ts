import { create } from "zustand"
import { Task, ColumnWithTasks, Label } from "@/lib/supabase/models"

type BoardStore = {
  selectedTask: Task | null
  isTaskModalOpen: boolean

  columns: ColumnWithTasks[]
  tasksMap: Record<string, Task>

  setColumns: (
    columns:
      | ColumnWithTasks[]
      | ((prev: ColumnWithTasks[]) => ColumnWithTasks[])
  ) => void

  setTasks: (tasks: Task[]) => void
  updateTaskInBoard: (taskId: string, updates: Partial<Task>) => void
  updateLabelInTasks: (labelId: string, updates: Partial<Label>) => void

  setSelectedTask: (
    task: Task | null | ((prev: Task | null) => Task | null)
  ) => void

  openTaskModal: (task: Task) => void
  closeTaskModal: () => void
}

export const useBoardStore = create<BoardStore>((set) => ({
  selectedTask: null,
  isTaskModalOpen: false,

  columns: [],
  tasksMap: {},

  setColumns: (columns) =>
    set((state) => ({
      columns:
        typeof columns === "function"
          ? columns(state.columns)
          : columns,
    })),

  setTasks: (tasks) =>
    set(() => ({
      tasksMap: Object.fromEntries(tasks.map((t) => [t.id, t])),
    })),

  updateTaskInBoard: (taskId, updates) =>
    set((state) => ({
      tasksMap: {
        ...state.tasksMap,
        [taskId]: {
          ...state.tasksMap[taskId],
          ...updates,
        },
      },
    })),

  updateLabelInTasks: (labelId, updates) =>
    set((state) => ({
      tasksMap: Object.fromEntries(
        Object.entries(state.tasksMap).map(([id, task]) => [
          id,
          {
            ...task,
            task_labels:
              task.task_labels?.map((tl) =>
                tl.label_id === labelId
                  ? { ...tl, labels: { ...tl.labels, ...updates } }
                  : tl
              ) || [],
          },
        ])
      ),
    })),

  setSelectedTask: (task) =>
    set((state) => ({
      selectedTask:
        typeof task === "function"
          ? task(state.selectedTask)
          : task,
    })),

  openTaskModal: (task) =>
    set({
      selectedTask: task,
      isTaskModalOpen: true,
    }),

  closeTaskModal: () =>
    set({
      selectedTask: null,
      isTaskModalOpen: false,
    }),
}))
"use client";

import Navbar from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBoard } from "@/lib/hooks/useBoards";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import DropableColumn from "@/components/column/DropableColumn";
import SortableTask from "@/components/tasks/SortableTask";
import { ColumnWithTasks, Task } from "@/lib/supabase/models";
import TaskOverlay from "@/components/tasks/TaskOverlay";

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const {
    board,
    updateBoard,
    columns,
    createRealTask,
    setColumns,
    moveTask,
    createColumn,
    updateColumn,
    deleteColumn, // Make sure your hook exports this
  } = useBoard(id);

  // Board & UI State
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Task State
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Column State
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  
  // Edit Column State
  const [isEditingColumn, setIsEditingColumn] = useState(false);
  const [editingColumn, setEditingColumn] = useState<ColumnWithTasks | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState("");

  // Delete Column State
  const [isDeleteColumnDialogOpen, setIsDeleteColumnDialogOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<ColumnWithTasks | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const [filters, setFilters] = useState({
    priority: [] as string[],
    assignee: [] as string[],
    dueDate: null as string | null,
  });

  function handleFilterChange(
    type: "priority" | "assignee" | "dueDate",
    value: string | string[] | null
  ) {
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  }

  function clearFilters() {
    setFilters({
      priority: [] as string[],
      assignee: [] as string[],
      dueDate: null as string | null,
    });
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  async function handleUpdateBoard(e: React.FormEvent) {
    e.preventDefault();

    if (!newTitle.trim() || !board) return;

    try {
      await updateBoard(board.id, {
        title: newTitle.trim(),
        color: newColor || board.color,
      });

      setIsEditingTitle(false);
    } catch {}
  }

  async function createTask(taskData: {
    title: string;
    description?: string;
    assignee?: string;
    dueDate?: string;
    priority: "low" | "medium" | "high";
  }) {
    const targetColumn = columns[0];
    if (!targetColumn) {
      throw new Error("No column available to add task");
    }

    await createRealTask(targetColumn.id, taskData);
  }

  async function handleCreateTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formdata = new FormData(e.currentTarget);
    const taskData = {
      title: formdata.get("title") as string,
      description: (formdata.get("description") as string) || undefined,
      assignee: (formdata.get("assignee") as string) || undefined,
      dueDate: (formdata.get("dueDate") as string) || undefined,
      priority:
        (formdata.get("priority") as "low" | "medium" | "high") || "medium",
    };

    if (taskData.title.trim()) {
      await createTask(taskData);
      setIsTaskDialogOpen(false); // Cleanly close dialog
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const taskId = event.active.id as string;
    const task = columns
      .flatMap((col) => col.tasks)
      .find((task) => task.id === taskId);

    if (task) {
      setActiveTask(task);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the source and target columns
    const sourceColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === activeId)
    );

    // Target might be a column itself (if empty) or a task within a column
    const targetColumn = columns.find(
      (col) => col.id === overId || col.tasks.some((task) => task.id === overId)
    );

    if (!sourceColumn || !targetColumn) return;

    // SCENARIO 1: Dragging to a DIFFERENT column
    if (sourceColumn.id !== targetColumn.id) {
      setColumns((prev) => {
        const activeItems = sourceColumn.tasks;
        const overItems = targetColumn.tasks;
        const activeIndex = activeItems.findIndex((t) => t.id === activeId);
        const overIndex = overItems.findIndex((t) => t.id === overId);

        let newIndex;

        if (overItems.some((t) => t.id === overId)) {
          // We are hovering over another task in the target column
          // Calculate if we are above or below the target task
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top >
              over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;
          newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length;
        } else {
          // We are hovering over the empty column container
          newIndex = overItems.length;
        }

        return prev.map((col) => {
          // Remove from source column
          if (col.id === sourceColumn.id) {
            return {
              ...col,
              tasks: col.tasks.filter((t) => t.id !== activeId),
            };
          }
          // Add to target column
          else if (col.id === targetColumn.id) {
            const newTasks = [...col.tasks];
            const taskToMove = activeTask || sourceColumn.tasks[activeIndex];

            // Only add if it's not already there (prevents flickering)
            if (!newTasks.find((t) => t.id === activeId) && taskToMove) {
              newTasks.splice(newIndex, 0, taskToMove);
            }
            return {
              ...col,
              tasks: newTasks,
            };
          }
          return col;
        });
      });
    }
    // SCENARIO 2: Reordering within the SAME column
    else {
      const activeIndex = sourceColumn.tasks.findIndex(
        (t) => t.id === activeId
      );
      const overIndex = sourceColumn.tasks.findIndex((t) => t.id === overId);

      if (activeIndex !== overIndex) {
        setColumns((prev) => {
          return prev.map((col) => {
            if (col.id === sourceColumn.id) {
              const newTasks = [...col.tasks];
              const [movedTask] = newTasks.splice(activeIndex, 1);
              newTasks.splice(overIndex, 0, movedTask);
              return { ...col, tasks: newTasks };
            }
            return col;
          });
        });
      }
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const targetColumn = columns.find((col) => col.id === overId);

    if (targetColumn) {
      const sourceColumn = columns.find((col) =>
        col.tasks.some((task) => task.id === taskId)
      );

      if (sourceColumn && sourceColumn.id !== targetColumn.id) {
        await moveTask(taskId, targetColumn.id, targetColumn.tasks.length);
      }
    } else {
      const sourceColumn = columns.find((col) =>
        col.tasks.some((task) => task.id === taskId)
      );

      const targetColumn = columns.find((col) =>
        col.tasks.some((task) => task.id === overId)
      );

      if (sourceColumn && targetColumn) {
        const oldIndex = sourceColumn.tasks.findIndex(
          (task) => task.id === taskId
        );

        const newIndex = targetColumn.tasks.findIndex(
          (task) => task.id === overId
        );

        if (oldIndex !== newIndex) {
          await moveTask(taskId, targetColumn.id, newIndex);
        }
      }
    }
  }

  async function handleCreateColumn(e: React.FormEvent) {
    e.preventDefault();

    if (!newColumnTitle.trim()) return;

    await createColumn(newColumnTitle.trim());

    setNewColumnTitle("");
    setIsCreatingColumn(false);
  }

  async function handleUpdateColumn(e: React.FormEvent) {
    e.preventDefault();

    if (!editingColumnTitle.trim() || !editingColumn) return;

    await updateColumn(editingColumn.id, editingColumnTitle.trim());

    setEditingColumnTitle("");
    setIsEditingColumn(false);
    setEditingColumn(null);
  }

  function handleEditColumn(column: ColumnWithTasks) {
    setIsEditingColumn(true);
    setEditingColumn(column);
    setEditingColumnTitle(column.title);
  }
  
  function handleDeleteColumn(column: ColumnWithTasks) {
    setColumnToDelete(column);
    setIsDeleteColumnDialogOpen(true);
  }

  async function confirmDeleteColumn() {
    if (columnToDelete && deleteColumn) {
      await deleteColumn(columnToDelete.id);
    }
    setIsDeleteColumnDialogOpen(false);
    setColumnToDelete(null);
  }

  const filteredColumns = columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter((task) => {
      
      if(filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
        return false;
      }


      if(filters.dueDate && task.due_date) {
        const taskDate = new Date(task.due_date).toDateString()
        const filteredDate = new Date(filters.dueDate).toDateString()

        if(taskDate !== filteredDate) {
          return false;
        }
      }
      
      return true;
    })
  }))

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar
          boardTitle={board?.title}
          onEditBoard={() => {
            setNewTitle(board?.title ?? "");
            setNewColor(board?.color ?? "");
            setIsEditingTitle(true);
          }}
          onFilterClick={() => setIsFilterOpen(true)}
          filterCount={Object.values(filters).reduce(
            (count, v) =>
              count + (Array.isArray(v) ? v.length : v !== null ? 1 : 0),
            0
          )}
        />

        <Dialog open={isEditingTitle} onOpenChange={setIsEditingTitle}>
          <DialogContent className="w-[95vw] max-w-106.25 mx-auto">
            <DialogHeader>
              <DialogTitle>Edit Board</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateBoard} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="boardTitle">Board Title</Label>
                <Input
                  id="boardTitle"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                  }}
                  placeholder="Enter Board Title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="boardColor">Board Color</Label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {[
                    "bg-blue-500",
                    "bg-green-500",
                    "bg-purple-500",
                    "bg-yellow-500",
                    "bg-red-500",
                    "bg-pink-500",
                    "bg-indigo-500",
                    "bg-gray-500",
                    "bg-orange-500",
                    "bg-teal-500",
                    "bg-cyan-500",
                    "bg-emerald-500",
                  ].map((color, key) => (
                    <button
                      key={key}
                      type="button"
                      className={`w-8 h-8 rounded-full ${color} ${
                        color === newColor
                          ? "ring-2 ring-offset-2 ring-gray-900"
                          : ""
                      }`}
                      onClick={() => setNewColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditingTitle(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter Tasks</DialogTitle>
              <p className="text-sm text-gray-600">
                Filter tasks by priority, assignee, or due date
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <div className="flex items-center flex-wrap gap-2">
                  {["low", "medium", "high"].map((priority, key) => (
                    <Button
                      onClick={() => {
                        const newPriorities = filters.priority.includes(
                          priority
                        )
                          ? filters.priority.filter((p) => p !== priority)
                          : [...filters.priority, priority];

                        handleFilterChange("priority", newPriorities);
                      }}
                      key={key}
                      variant={
                        filters.priority.includes(priority)
                          ? "default"
                          : "outline"
                      }
                      size={"sm"}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={filters.dueDate || ""}
                  onChange={(e) =>
                    handleFilterChange("dueDate", e.target.value || null)
                  }
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant={"outline"}
                  onClick={clearFilters}
                >
                  Clear Filter
                </Button>
                <Button type="button" onClick={() => setIsFilterOpen(false)}>
                  Apply Filter
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Board Content */}
        <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
          {/* stats */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="text-xs text-gray-600">
                <span className="font-medium">Total Tasks:</span>
                {columns.reduce((sum, col) => sum + col.tasks.length, 0)}
              </div>
            </div>

            {/* task dialog */}
            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus />
                  Add Task
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <p className="text-sm text-gray-600">
                    Add a task to the board.
                  </p>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleCreateTask}>
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter task title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Enter task description"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Assignee</Label>
                    <Input
                      id="assignee"
                      name="assignee"
                      placeholder="Who should do this?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select name="priority" defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["low", "medium", "high"].map((priority, key) => (
                          <SelectItem key={key} value={priority}>
                            {priority.charAt(0).toUpperCase() +
                              priority.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input id="dueDate" type="date" name="dueDate" />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="submit">Create Task</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* board columns */}
          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div
              className="flex flex-col lg:flex-row lg:space-x-6 lg:overflow-x-auto
          lg:pb-6 lg:px-2 lg:-mx-2 lg:[&::-webkit-scrollbar]:h-2 
          lg:[&::-webkit-scrollbar-track]:bg-gray-100 
          lg:[&::-webkit-scrollbar-thumb]:bg-gray-300 lg:[&::-webkit-scrollbar-thumb]:rounded-full space-y-4 lg:space-y-0"
            >
              {filteredColumns.map((column, key) => (
                <DropableColumn
                  key={key}
                  column={column}
                  onCreateTask={handleCreateTask}
                  onEditColumn={handleEditColumn}
                  onDeleteColumn={handleDeleteColumn}
                >
                  <SortableContext
                    items={column.tasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {column.tasks.map((task, key) => (
                        <SortableTask task={task} key={key}></SortableTask>
                      ))}
                    </div>
                  </SortableContext>
                </DropableColumn>
              ))}

              <div>
                <Button
                  variant={"outline"}
                  className="w-full h-full min-h-50 border-dashed border-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setIsCreatingColumn(true)}
                >
                  <Plus />
                  Add another list
                </Button>
              </div>

              <DragOverlay>
                {activeTask ? <TaskOverlay task={activeTask} /> : null}
              </DragOverlay>
            </div>
          </DndContext>
        </main>
      </div>

      {/* Create Column Dialog */}
      <Dialog open={isCreatingColumn} onOpenChange={setIsCreatingColumn}>
        <DialogContent className="w-[95vw] max-w-106.25 mx-auto">
          <DialogHeader>
            <DialogTitle>Create new column</DialogTitle>
            <p>Add new column to organize you tasks</p>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCreateColumn}>
            <div className="space-y-2">
              <Label>Column Title</Label>
              <Input
                id="columnTitle"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Enter Column title"
                required
              />
            </div>

            <div className="space-x-2 flex justify-end items-center">
              <Button
                type="button"
                onClick={() => setIsCreatingColumn(false)}
                variant={"outline"}
              >
                Cancel
              </Button>
              <Button type="submit">Create Column</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Column Dialog */}
      <Dialog open={isEditingColumn} onOpenChange={setIsEditingColumn}>
        <DialogContent className="w-[95vw] max-w-106.25 mx-auto">
          <DialogHeader>
            <DialogTitle>Edit column</DialogTitle>
            <p>Update the title of you column</p>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleUpdateColumn}>
            <div className="space-y-2">
              <Label>Column Title</Label>
              <Input
                id="columnTitle"
                value={editingColumnTitle}
                onChange={(e) => setEditingColumnTitle(e.target.value)}
                placeholder="Enter Column title"
                required
              />
            </div>

            <div className="space-x-2 flex justify-end items-center">
              <Button
                type="button"
                onClick={() => {
                  setIsEditingColumn(false);
                  setEditingColumnTitle("");
                  setEditingColumn(null);
                }}
                variant={"outline"}
              >
                Cancel
              </Button>
              <Button type="submit">Edit Column</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* NEW: Delete Column Dialog */}
      <Dialog open={isDeleteColumnDialogOpen} onOpenChange={setIsDeleteColumnDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Delete Column</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the column "{columnToDelete?.title}"? All tasks within this column will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant={"outline"}
              onClick={() => setIsDeleteColumnDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteColumn}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
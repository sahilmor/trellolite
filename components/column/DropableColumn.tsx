"use client";

import { ColumnWithTasks } from "@/lib/supabase/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDroppable } from "@dnd-kit/core";

interface DropableColumnProps {
  column: ColumnWithTasks;
  children: React.ReactNode;
  onCreateTask: (e: any) => Promise<void>;
  onEditColumn: (column: ColumnWithTasks) => void;
  onDeleteColumn: (column: ColumnWithTasks) => void;
}

export default function DropableColumn({
  column,
  children,
  onCreateTask,
  onEditColumn,
  onDeleteColumn,
}: DropableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`w-full lg:shrink-0 lg:w-80 ${
        isOver ? "bg-blue-50 rounded-lg" : ""
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-sm border ${
          isOver ? "ring-2 ring-blue-300" : ""
        }`}
      >
        {/* column header */}
        <div className="p-3 sm:p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                {column.title}
              </h3>
              <Badge variant={"secondary"} className="text-xs shrink-0">
                {column.tasks.length}
              </Badge>
            </div>

            {/* Dropdown Menu for Edit/Delete */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"ghost"} size={"sm"} className="shrink-0 h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditColumn(column)}>
                  Edit Column
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeleteColumn(column)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  Delete Column
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* column content */}
        <div className="p-2">
          {children}

          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="w-full mt-3 text-gray-500 hover:text-gray-700"
                variant={"ghost"}
              >
                <Plus className="mr-2 h-4 w-4" />
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

              <form className="space-y-4" onSubmit={onCreateTask}>
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
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
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
      </div>
    </div>
  );
}
import { Task } from "@/lib/supabase/models";
import { Card, CardContent } from "../ui/card";
import { Calendar, User } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities"

export default function SortableTask({ task }: { task: Task }) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const styles = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    
  }

  function getPriorityColor(priority: "low" | "medium" | "high"): string {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-yelloow-500";
    }
  }
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={styles}>
      <Card className="cursor-pointer hover:shadow-md transition-shadows">
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-2 sm:space-y-3">
            {/* task header */}
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1 min-w-0 pr-2">
                {task.title}
              </h4>
            </div>

            {/* description */}
            <p className="text-xs text-gray-600 line-clamp-2">
              {task.description || "No Description"}
            </p>

            {/* meta data */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                {task.assignee && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <User className="h-3 w-3" />
                    <span className="truncate">{task.assignee}</span>
                  </div>
                )}

                {task.due_date && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span className="truncate">{task.due_date}</span>
                  </div>
                )}
              </div>
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${getPriorityColor(
                  task.priority
                )}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

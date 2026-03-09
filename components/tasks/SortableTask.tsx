import { Task } from "@/lib/supabase/models";
import { Card, CardContent } from "../ui/card";
import { Calendar, User } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";
import UserAvatar from "../ui/user-avatar";

export default function SortableTask({
  task,
  onDelete,
  onClick,
}: {
  task: Task;
  onDelete: (taskId: string) => void;
  onClick: () => void;
}) {
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
  };

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
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={styles}
      onClick={onClick}
    >
      <Card className="cursor-pointer hover:shadow-md transition-shadows">
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-2 sm:space-y-3">
            {/* task header */}
            <div className="space-y-1">
              {/* Labels */}
              {/* Labels */}
              {task.task_labels?.length ? (
                <div className="flex flex-wrap gap-1">
                  {task.task_labels?.map((item, index) => {
                    const label = item?.labels;

                    if (!label) return null;

                    return (
                      <span
                        key={`${task.id}-${item.label_id}`}
                        style={{ backgroundColor: label.color }}
                        className="text-white text-[10px] px-2 py-[2px] rounded font-medium"
                      >
                        {label.name}
                      </span>
                    );
                  })}
                </div>
              ) : null}

              {/* Title */}
              <h4 className="font-medium text-gray-900 text-sm leading-tight">
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
                    <UserAvatar name={task.assignee} size={20} />
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
                  task.priority,
                )}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

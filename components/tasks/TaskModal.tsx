"use client";

import { Label, Task } from "@/lib/supabase/models";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { useComments } from "@/lib/hooks/useComments";
import { useUser } from "@clerk/nextjs";
import { useActivity } from "@/lib/hooks/useActivity";
import { useLabels } from "@/lib/hooks/useLabels";
import LabelPicker from "@/components/labels/LabelPicker";

import {
  Calendar,
  User,
  Flag,
  AlignLeft,
  X,
  Plus,
  MessageSquare,
  Activity as ActivityIcon,
  Send,
} from "lucide-react";

import { useState, useEffect } from "react";
import UserAvatar from "../ui/user-avatar";
import LabelEditorModal from "../labels/LabelEditorModal";

const getPriorityStyles = (priority?: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "medium":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "low":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

export default function TaskModal({
  task,
  open,
  onClose,
  onUpdateTask,
  boardId,
  onAddLabel,
  onRemoveLabel,
  onUpdateLabelInTasks,
}: {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  boardId: string;
  onAddLabel: (taskId: string, label: any) => Promise<void> | void;
  onRemoveLabel: (taskId: string, labelId: string) => Promise<void> | void;
  onUpdateLabelInTasks: (labelId: string, updates: any) => void;
}) {
  const { user } = useUser();

  const { comments, addComment } = useComments(task?.id || null);
  const { activity } = useActivity(task?.id || null);
  const { labels, createLabel, updateLabel, deleteLabel } = useLabels(
    boardId || null,
  );

  const [tab, setTab] = useState<"comments" | "activity">("comments");

  const [editingField, setEditingField] = useState<
    "title" | "description" | "assignee" | "priority" | "dueDate" | null
  >(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [localTask, setLocalTask] = useState<Task | null>(task);
  const [newComment, setNewComment] = useState("");
  const [labelModalOpen, setLabelModalOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<any | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setAssignee(task.assignee || "");
      setPriority((task.priority as any) || "medium");
      setDueDate(task.due_date || "");
      setEditingField(null);
    }
  }, [task]);

  useEffect(() => {
  if (!task) return;

  setLocalTask({
    ...task,
    task_labels: task.task_labels || [],
  });
}, [task?.task_labels, task?.id]);

  if (!task) return null;

  async function saveField(field: string, value: any) {
    if (!task) return;

    await onUpdateTask(task.id, { [field]: value });
  }

  async function handleAddComment() {
    if (!task) return;
    if (!newComment.trim()) return;

    await addComment(newComment.trim());
    setNewComment("");
  }

  async function handleAddLabel(label: any) {
  if (!localTask) return;

  await onAddLabel(localTask.id, label);

  setLocalTask((prev) => {
    if (!prev) return prev;

    const alreadyExists = prev.task_labels?.some(
      (l) => l.label_id === label.id
    );

    if (alreadyExists) return prev;

    return {
      ...prev,
      task_labels: [
        ...(prev.task_labels || []),
        {
          label_id: label.id,
          labels: label,
        },
      ],
    };
  });
}

async function handleRemoveLabel(labelId: string) {
  if (!localTask) return;

  // update modal state immediately
  setLocalTask((prev) => {
    if (!prev) return prev;

    return {
      ...prev,
      task_labels:
        prev.task_labels?.filter((l) => l.label_id !== labelId) || [],
    };
  });

  // update board state
  await onRemoveLabel(localTask.id, labelId);
}

  function handleCreateLabel() {
    setEditingLabel(null);
    setLabelModalOpen(true);
  }
  
  function updateLocalTaskLabel(labelId: string, updates: Partial<Label>) {
  setLocalTask((prev) => {
    if (!prev) return prev;

    return {
      ...prev,
      task_labels:
        prev.task_labels?.map((tl) =>
          tl.label_id === labelId
            ? {
                ...tl,
                labels: {
                  ...tl.labels,
                  ...updates,
                },
              }
            : tl
        ) || [],
    };
  });
}

  function isLabelApplied(labelId: string) {
  return localTask?.task_labels?.some((l) => l.label_id === labelId);
}

async function refreshTask() {
  if (!localTask) return;
  await onUpdateTask(localTask.id, {});
}

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-[1400px] w-[95vw] h-[750px] p-0 flex overflow-hidden rounded-xl">
        {/* LEFT PANEL */}
        <div className="w-[65%] p-8 overflow-y-auto space-y-8">
          {/* TITLE */}
          <DialogHeader>
            <DialogDescription className="sr-only">
              Task details
            </DialogDescription>

            {editingField === "title" ? (
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => {
                  saveField("title", title);
                  setEditingField(null);
                }}
                className="text-3xl font-bold border rounded px-2 py-1"
              />
            ) : (
              <DialogTitle
                onClick={() => setEditingField("title")}
                className="text-3xl font-bold cursor-pointer"
              >
                {title}
              </DialogTitle>
            )}
          </DialogHeader>

          {/* META */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg">
            {/* ASSIGNEE */}
            <div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <User size={14} /> Assignee
              </div>

              {editingField === "assignee" ? (
                <input
                  autoFocus
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  onBlur={() => {
                    saveField("assignee", assignee);
                    setEditingField(null);
                  }}
                  className="border rounded px-2 py-1 text-sm w-full"
                />
              ) : (
                <div
                  onClick={() => setEditingField("assignee")}
                  className="cursor-pointer text-sm"
                >
                  {assignee || "Unassigned"}
                </div>
              )}
            </div>

            {/* DATE */}
            <div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar size={14} /> Due Date
              </div>

              {editingField === "dueDate" ? (
                <input
                  type="date"
                  autoFocus
                  value={dueDate || ""}
                  onChange={(e) => setDueDate(e.target.value)}
                  onBlur={() => {
                    saveField("due_date", dueDate);
                    setEditingField(null);
                  }}
                  className="border rounded px-2 py-1 text-sm"
                />
              ) : (
                <div
                  onClick={() => setEditingField("dueDate")}
                  className="cursor-pointer text-sm"
                >
                  {dueDate ? new Date(dueDate).toLocaleDateString() : "No date"}
                </div>
              )}
            </div>

            {/* PRIORITY */}
            <div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Flag size={14} /> Priority
              </div>

              {editingField === "priority" ? (
                <select
                  autoFocus
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  onBlur={() => {
                    saveField("priority", priority);
                    setEditingField(null);
                  }}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              ) : (
                <span
                  onClick={() => setEditingField("priority")}
                  className={`px-2 py-1 text-xs border rounded cursor-pointer ${getPriorityStyles(priority)}`}
                >
                  {priority}
                </span>
              )}
            </div>
          </div>

          {/* LABELS */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Labels</h3>

            {/* Applied labels */}
            <div className="flex flex-wrap gap-2">
              {localTask?.task_labels?.map((item) => {
                const label = item.labels;
                if (!label) return null;

                return (
                  <span
                    key={`${localTask.id}-${item.label_id}`}
                    style={{ backgroundColor: label.color }}
                    className="flex items-center gap-1 text-white text-xs px-2 py-1 rounded-full"
                  >
                    {label.name}

                    <button
                      onClick={() =>
                        handleRemoveLabel(item.label_id)
                      }
                      className="ml-1"
                    >
                      <X size={10} />
                    </button>
                  </span>
                );
              })}
            </div>

            {/* Picker */}
            <LabelPicker
              labels={labels}
              taskLabels={localTask?.task_labels || []}
              onAddLabel={handleAddLabel}
              onRemoveLabel={handleRemoveLabel}
              onCreateLabel={handleCreateLabel}
              onEditLabel={(label) => {
                setEditingLabel(label);
                setLabelModalOpen(true);
              }}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <AlignLeft size={16} /> Description
            </div>

            {editingField === "description" ? (
              <textarea
                autoFocus
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => {
                  saveField("description", description);
                  setEditingField(null);
                }}
                className="w-full min-h-[200px] border rounded p-3"
              />
            ) : (
              <div
                onClick={() => setEditingField("description")}
                className="min-h-[200px] border rounded p-3 cursor-pointer"
              >
                {description || "Add description..."}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[35%] border-l flex flex-col">
          {/* TABS */}
          <div className="flex border-b">
            <button
              onClick={() => setTab("comments")}
              className={`flex-1 py-3 text-sm ${
                tab === "comments" ? "border-b-2 border-blue-600" : ""
              }`}
            >
              Comments
            </button>

            <button
              onClick={() => setTab("activity")}
              className={`flex-1 py-3 text-sm ${
                tab === "activity" ? "border-b-2 border-blue-600" : ""
              }`}
            >
              Activity
            </button>
          </div>

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {tab === "comments" &&
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <UserAvatar
                    name={comment.users?.name}
                    image={comment.users?.image_url}
                  />

                  <div>
                    <div className="text-sm font-semibold">
                      {comment.users?.name}
                    </div>

                    <div className="text-sm text-slate-600">
                      {comment.content}
                    </div>
                  </div>
                </div>
              ))}

            {tab === "activity" &&
              activity.map((item) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <UserAvatar
                    name={item.users?.name}
                    image={item.users?.image_url}
                  />

                  <div>
                    <span className="font-semibold">{item.users?.name}</span>{" "}
                    {item.action}
                    <div className="text-xs text-slate-400">
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* COMMENT INPUT */}
          {tab === "comments" && (
            <div className="p-4 border-t flex gap-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 border rounded p-2 text-sm"
              />

              <button
                onClick={handleAddComment}
                className="bg-blue-600 text-white px-3 rounded"
              >
                <Send size={16} />
              </button>
            </div>
          )}
        </div>
      </DialogContent>

      <LabelEditorModal
        open={labelModalOpen}
        onClose={() => setLabelModalOpen(false)}
        initialLabel={editingLabel}
        onSave={async (name, color) => {
  if (editingLabel) {

    await updateLabel(editingLabel.id, name, color);

    onUpdateLabelInTasks(editingLabel.id, {
      name,
      color
    });

    updateLocalTaskLabel(editingLabel.id, {
      name,
      color
    });

  } else {
    createLabel(name, color);
  }
}}
        onDelete={editingLabel ? () => deleteLabel(editingLabel.id) : undefined}
      />
    </Dialog>
  );
}

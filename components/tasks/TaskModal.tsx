"use client";

import { Task } from "@/lib/supabase/models";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { useComments } from "@/lib/hooks/useComments";
import { useUser } from "@clerk/nextjs";

import { Calendar, User, Flag, AlignLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useActivity } from "@/lib/hooks/useActivity";
import UserAvatar from "../ui/user-avatar";

const getPriorityStyles = (priority?: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "medium":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "low":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

export default function TaskModal({
  task,
  open,
  onClose,
  onUpdateTask,
}: {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
}) {
  const { user } = useUser();
  const { comments, addComment } = useComments(task?.id || null);

  const [tab, setTab] = useState<"comments" | "activity">("comments");

  const [editingField, setEditingField] = useState<
    "title" | "description" | "assignee" | "priority" | "dueDate" | null
  >(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [newComment, setNewComment] = useState("");
  const { activity } = useActivity(task?.id || null);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setAssignee(task.assignee || "");
      setPriority(task.priority || "medium");
      setDueDate(task.due_date || "");
      setEditingField(null);
    }
  }, [task]);

  if (!task) return null;

  async function saveField(field: string, value: any) {
    if (!task) return;
    await onUpdateTask(task.id, { [field]: value });
  }
  async function handleAddComment() {
    if (!newComment.trim()) return;
    await addComment(newComment.trim());
    setNewComment("");
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-[1400px] w-[95vw] h-[750px] p-0 overflow-hidden">
        <div className="flex h-full">
          {/* LEFT PANEL */}
          <div className="w-2/3 border-r overflow-y-auto p-6 space-y-8">
            {/* TITLE */}
            <DialogHeader>
              {editingField === "title" ? (
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => {
                    saveField("title", title);
                    setEditingField(null);
                  }}
                  className="text-2xl font-semibold border-b focus:outline-none"
                />
              ) : (
                <DialogTitle
                  onClick={() => setEditingField("title")}
                  className="text-2xl font-semibold cursor-pointer"
                >
                  {task.title}
                </DialogTitle>
              )}

              <DialogDescription className="sr-only">
                Task details
              </DialogDescription>
            </DialogHeader>

            {/* DESCRIPTION */}
            <div>
              <div className="flex items-center gap-2 font-medium mb-2">
                <AlignLeft size={18} />
                Description
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
                  className="w-full border rounded-md p-3"
                />
              ) : (
                <div
                  onClick={() => setEditingField("description")}
                  className="border rounded-md p-4 cursor-pointer hover:bg-slate-50"
                >
                  {task.description || "Click to add description"}
                </div>
              )}
            </div>

            {/* META */}
            <div className="grid grid-cols-2 gap-6">
              {/* ASSIGNEE */}
              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User size={16} /> Assignee
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
                    className="border rounded-md p-1 text-sm"
                  />
                ) : (
                  <p
                    onClick={() => setEditingField("assignee")}
                    className="cursor-pointer"
                  >
                    {task.assignee || "Unassigned"}
                  </p>
                )}
              </div>

              {/* DUE DATE */}
              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar size={16} /> Due Date
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
                    className="border rounded-md p-1 text-sm"
                  />
                ) : (
                  <p
                    onClick={() => setEditingField("dueDate")}
                    className="cursor-pointer"
                  >
                    {task.due_date
                      ? new Date(task.due_date).toLocaleDateString()
                      : "No due date"}
                  </p>
                )}
              </div>

              {/* PRIORITY */}
              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Flag size={16} /> Priority
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
                    className="border rounded-md p-1 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                ) : (
                  <span
                    onClick={() => setEditingField("priority")}
                    className={`cursor-pointer px-2 py-1 text-xs border rounded-md ${getPriorityStyles(priority)}`}
                  >
                    {priority}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="w-1/3 flex flex-col">
            {/* TABS */}
            <div className="flex border-b">
              <button
                onClick={() => setTab("comments")}
                className={`flex-1 py-3 text-sm ${
                  tab === "comments"
                    ? "border-b-2 border-blue-600 font-semibold"
                    : ""
                }`}
              >
                Comments
              </button>

              <button
                onClick={() => setTab("activity")}
                className={`flex-1 py-3 text-sm ${
                  tab === "activity"
                    ? "border-b-2 border-blue-600 font-semibold"
                    : ""
                }`}
              >
                Activity
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {tab === "comments" && (
                <>
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <UserAvatar
                        name={comment.users?.name}
                        image={comment.users?.image_url}
                      />

                      <div>
                        <div className="text-sm font-medium">
                          {comment.users?.name}
                        </div>

                        <p className="text-sm text-slate-700">
                          {comment.content}
                        </p>

                        <div className="text-xs text-slate-400">
                          {new Date(comment.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* COMMENT INPUT */}

                  <div className="flex gap-2 pt-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 border rounded-md p-2 text-sm"
                      rows={2}
                    />

                    <button
                      onClick={handleAddComment}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md"
                    >
                      Send
                    </button>
                  </div>
                </>
              )}

              {tab === "activity" && (
                <div className="text-sm text-slate-500">
                  {activity.map((item) => (
                    <div key={item.id} className="flex gap-3 text-sm mb-2">
                      <UserAvatar
                        name={item.users?.name}
                        image={item.users?.image_url}
                      />

                      <div>
                        <p className="text-slate-800">
                          <span className="font-medium">
                            {item.users?.name || "User"}
                          </span>{" "}
                          {item.action}
                        </p>

                        <p className="text-xs text-slate-400">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

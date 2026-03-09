"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useBoardStore } from "@/store/boardStore";

import { useComments } from "@/lib/hooks/useComments";
import { useActivity } from "@/lib/hooks/useActivity";
import { useLabels } from "@/lib/hooks/useLabels";

import { useState, useEffect } from "react";

import TaskHeader from "./modal/TaskHeader";
import TaskMeta from "./modal/TaskMeta";
import TaskLabels from "./modal/TaskLabels";
import TaskDescription from "./modal/TaskDescription";
import TaskTabs from "./modal/TaskTabs";
import TaskComments from "./modal/TaskComments";
import TaskActivity from "./modal/TaskActivity";

import LabelEditorModal from "../labels/LabelEditorModal";
import { Label, Task } from "@/lib/supabase/models";

export default function TaskModal({
    updateTask,
    onAddLabel,
onRemoveLabel,

} : {
    updateTask: (taskId: string, updates: Partial<Task>) => Promise<Task | undefined>
    onAddLabel: (taskId: string, label: Label) => Promise<void>;
    onRemoveLabel: (taskId: string, labelId: string) => Promise<void>;
}) {
  const {
  selectedTask,
  tasksMap,
  isTaskModalOpen: open,
  closeTaskModal,
  updateLabelInTasks,
  currentBoardId,
} = useBoardStore();

const task = selectedTask ? tasksMap[selectedTask.id] || selectedTask : null;

  const { comments, addComment } = useComments(task?.id || null);
  const { activity } = useActivity(task?.id || null);
  const { labels, createLabel, updateLabel, deleteLabel } = useLabels(currentBoardId);

  const [tab, setTab] = useState<"comments" | "activity">("comments");

  const [editingField, setEditingField] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");


  const [newComment, setNewComment] = useState("");
  const [labelModalOpen, setLabelModalOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<any | null>(null);

  useEffect(() => {
    if (!task) return;

    setTitle(task.title || "");
    setDescription(task.description || "");
    setAssignee(task.assignee || "");
    setPriority(task.priority || "medium");
    setDueDate(task.due_date || "");
  }, [task]);
  

  if (!task) return null;

async function saveField(field: string, value: any) {
  if (!task) return;

  console.log("SAVE FIELD TRIGGERED", field, value);

  await updateTask(task.id, { [field]: value });
}

  async function handleAddComment() {
    if (!newComment.trim()) return;

    await addComment(newComment.trim());
    setNewComment("");
  }

async function handleAddLabel(label: Label) {
  if (!task) return;
  await onAddLabel(task.id, label);
}

async function handleRemoveLabel(labelId: string) {
  if (!task) return;
  await onRemoveLabel(task.id, labelId);
}

  return (
    <Dialog open={open} onOpenChange={closeTaskModal}>
      <DialogContent className="!max-w-[1400px] w-[95vw] h-[750px] p-0 flex overflow-hidden rounded-xl">

        {/* LEFT PANEL */}
        <div className="w-[65%] p-8 overflow-y-auto space-y-8">

          <TaskHeader
            title={title}
            editingField={editingField}
            setEditingField={setEditingField}
            setTitle={setTitle}
            saveField={saveField}
          />

          <TaskMeta
            editingField={editingField}
            setEditingField={setEditingField}
            assignee={assignee}
            setAssignee={setAssignee}
            dueDate={dueDate}
            setDueDate={setDueDate}
            priority={priority}
            setPriority={setPriority}
            saveField={saveField}
          />

          <TaskLabels
            task={task}
            labels={labels}
            handleAddLabel={handleAddLabel}
            handleRemoveLabel={handleRemoveLabel}
            handleCreateLabel={() => setLabelModalOpen(true)}
            setEditingLabel={setEditingLabel}
            setLabelModalOpen={setLabelModalOpen}
          />

          <TaskDescription
            editingField={editingField}
            setEditingField={setEditingField}
            description={description}
            setDescription={setDescription}
            saveField={saveField}
          />

        </div>

        {/* RIGHT PANEL */}
        <div className="w-[35%] border-l flex flex-col">

          <TaskTabs tab={tab} setTab={setTab} />

          {tab === "comments" && (
            <TaskComments
              comments={comments}
              newComment={newComment}
              setNewComment={setNewComment}
              handleAddComment={handleAddComment}
            />
          )}

          {tab === "activity" && <TaskActivity activity={activity} />}

        </div>

      </DialogContent>

      <LabelEditorModal
        open={labelModalOpen}
        onClose={() => setLabelModalOpen(false)}
        initialLabel={editingLabel}
        onSave={async (name, color) => {
          if (editingLabel) {
            await updateLabel(editingLabel.id, name, color);

            updateLabelInTasks(editingLabel.id, { name, color });
          } else {
            createLabel(name, color);
          }
        }}
        onDelete={
          editingLabel ? () => deleteLabel(editingLabel.id) : undefined
        }
      />
    </Dialog>
  );
}
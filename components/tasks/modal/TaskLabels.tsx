"use client";

import { X } from "lucide-react";
import LabelPicker from "@/components/labels/LabelPicker";
import React from "react";

function TaskLabels({
  task,
  labels,
  handleRemoveLabel,
  handleAddLabel,
  handleCreateLabel,
  setEditingLabel,
  setLabelModalOpen,
}: any) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Labels</h3>

      <div className="flex flex-wrap gap-2">
        {task?.task_labels?.map((item: any) => {
          const label = item.labels;

          return (
            <span
              key={`${task.id}-${item.label_id}`}
              style={{ backgroundColor: label.color }}
              className="flex items-center gap-1 text-white text-xs px-2 py-1 rounded-full"
            >
              {label.name}

              <button
                onClick={() => handleRemoveLabel(item.label_id)}
                className="ml-1"
              >
                <X size={10} />
              </button>
            </span>
          );
        })}
      </div>

      <LabelPicker
        labels={labels}
        taskLabels={task?.task_labels || []}
        onAddLabel={handleAddLabel}
        onRemoveLabel={handleRemoveLabel}
        onCreateLabel={handleCreateLabel}
        onEditLabel={(label: any) => {
          setEditingLabel(label);
          setLabelModalOpen(true);
        }}
      />
    </div>
  );
}

export default React.memo(TaskLabels);
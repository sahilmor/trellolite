"use client";

import { AlignLeft } from "lucide-react";
import React from "react";

function TaskDescription({
  editingField,
  setEditingField,
  description,
  setDescription,
  saveField,
}: any) {
  return (
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
  );
}

export default React.memo(TaskDescription)
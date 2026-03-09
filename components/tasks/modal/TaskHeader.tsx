"use client";

import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import React from "react";

function TaskHeader({
  title,
  editingField,
  setEditingField,
  setTitle,
  saveField,
}: {
  title: string;
  editingField: string | null;
  setEditingField: (field: any) => void;
  setTitle: (value: string) => void;
  saveField: (field: string, value: any) => void;
}) {
  return (
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
  );
}

export default React.memo(TaskHeader);
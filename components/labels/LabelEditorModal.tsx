"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const COLORS = [
  "#ef4444",
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#64748b",
];

type LabelEditorModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  initialLabel?: {
    id?: string;
    name: string;
    color: string;
  } | null;
};

export default function LabelEditorModal({
  open,
  onClose,
  onSave,
  onDelete,
  initialLabel,
}: LabelEditorModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    if (!open) return;

    if (initialLabel) {
      setName(initialLabel.name);
      setColor(initialLabel.color);
    } else {
      setName("");
      setColor(COLORS[0]);
    }
  }, [initialLabel, open]);

  async function handleSave() {
    if (!name.trim()) return;

    await onSave(name.trim(), color);
    onClose();
  }

  async function handleDelete() {
    if (!onDelete) return;

    await onDelete();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {initialLabel ? "Edit Label" : "Create Label"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* NAME */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Label name"
            className="w-full border rounded px-3 py-2 text-sm"
          />

          {/* COLORS */}
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-6 h-6 rounded-full border ${
                  color === c ? "ring-2 ring-black" : ""
                }`}
              />
            ))}
          </div>

          {/* ACTIONS */}
          <div className="flex justify-between pt-2">
            {onDelete && (
              <button
                onClick={handleDelete}
                className="text-sm px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50"
              >
                Delete
              </button>
            )}

            <div className="flex gap-2 ml-auto">
              <button
                onClick={onClose}
                className="text-sm px-3 py-1 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="text-sm px-3 py-1 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
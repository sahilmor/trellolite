"use client";

import { useState } from "react";
import { Check, Plus, Pencil } from "lucide-react";

export default function LabelPicker({
  labels,
  taskLabels,
  onAddLabel,
  onRemoveLabel,
  onCreateLabel,
  onEditLabel,
}: {
  labels: any[];
  taskLabels: any[];
  onAddLabel: (labelId: string) => Promise<void> | void
  onRemoveLabel: (labelId: string) => void;
  onCreateLabel: () => void;
  onEditLabel: (label: any) => void;
}) {
  const [search, setSearch] = useState("");

  function isApplied(labelId: string) {
    return taskLabels?.some((l) => l.labels.id === labelId);
  }

  const filteredLabels = labels.filter((label) =>
    label.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="border rounded-lg p-3 bg-white shadow-sm space-y-3">
      {/* SEARCH */}
      <input
        placeholder="Search labels..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded px-2 py-1 text-sm"
      />

      {/* LABEL LIST */}
      <div className="max-h-48 overflow-y-auto space-y-1">
        {filteredLabels.map((label) => {
          const applied = isApplied(label.id);

          return (
            <div
              key={label.id}
              onClick={() =>
                applied ? onRemoveLabel(label.id) : onAddLabel(label)
              }
              className="flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-slate-100"
            >
              {/* LABEL INFO */}
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
                <span className="text-sm">{label.name}</span>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-2">
                {/* APPLIED CHECK */}
                {applied && <Check size={14} />}

                {/* EDIT BUTTON */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditLabel(label);
                  }}
                  className="opacity-70 hover:opacity-100"
                >
                  <Pencil size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE LABEL */}
      <button
        onClick={onCreateLabel}
        className="flex items-center gap-1 text-xs border px-2 py-1 rounded hover:bg-slate-100"
      >
        <Plus size={12} />
        Create Label
      </button>
    </div>
  );
}

"use client";

import { useLabels } from "@/lib/hooks/useLabels";
import { useParams } from "next/navigation";
import LabelEditorModal from "@/components/labels/LabelEditorModal";
import { useState } from "react";
import { Pencil, Trash2, Plus, Tag } from "lucide-react";

export default function LabelsPage() {
  const params = useParams();
  const boardId = params.id as string;

  const { labels, createLabel, updateLabel, deleteLabel } = useLabels(boardId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<any | null>(null);

  function handleCreate() {
    setEditingLabel(null);
    setModalOpen(true);
  }

  function handleEdit(label: any) {
    setEditingLabel(label);
    setModalOpen(true);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Labels
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage tags to organize, filter, and track tasks across this board.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
        >
          <Plus size={18} strokeWidth={2.5} />
          Create Label
        </button>
      </div>

      {/* LABEL LIST CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* EMPTY STATE */}
        {labels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Tag size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              No labels found
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mb-6">
              Labels help you quickly identify task priority, categories, or status. Create your first label to get started.
            </p>
            <button
              onClick={handleCreate}
              className="text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-md transition-colors"
            >
              + Create your first label
            </button>
          </div>
        )}

        {/* RENDERED LIST */}
        {labels.length > 0 && (
          <div className="divide-y divide-slate-100">
            {labels.map((label) => (
              <div
                key={label.id}
                className="group flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50/80 transition-colors"
              >
                
                {/* LABEL INFO & PREVIEW */}
                <div className="flex items-center gap-6 sm:gap-10">
                  
                  {/* The actual label preview */}
                  <div className="w-32 sm:w-48 flex-shrink-0">
                    <div
                      style={{ backgroundColor: label.color }}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-sm truncate max-w-full"
                    >
                      {label.name}
                    </div>
                  </div>

                  {/* Meta data (hidden on very small screens for better mobile view) */}
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-mono font-medium text-slate-400 uppercase">
                      {label.color}
                    </span>
                    <span className="text-xs font-medium text-slate-500 mt-0.5">
                      {label.usage || 0} tasks using this label
                    </span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                  <button
                    onClick={() => handleEdit(label)}
                    aria-label={`Edit ${label.name} label`}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    onClick={() => deleteLabel(label.id)}
                    aria-label={`Delete ${label.name} label`}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LABEL MODAL */}
      <LabelEditorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialLabel={editingLabel}
        onSave={(name, color) => {
          if (editingLabel) {
            updateLabel(editingLabel.id, name, color);
          } else {
            createLabel(name, color);
          }
          setModalOpen(false); // Make sure to close modal after save
        }}
        onDelete={
          editingLabel
            ? () => {
                deleteLabel(editingLabel.id);
                setModalOpen(false); // Close after delete
              }
            : undefined
        }
      />
    </div>
  );
}
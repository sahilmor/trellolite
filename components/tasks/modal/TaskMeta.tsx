"use client";

import { Calendar, User, Flag } from "lucide-react";
import React from "react";

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

function TaskMeta({
  editingField,
  setEditingField,
  assignee,
  setAssignee,
  dueDate,
  setDueDate,
  priority,
  setPriority,
  saveField,
}: any) {
  return (
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
            onChange={(e) => setPriority(e.target.value)}
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
  );
}

export default React.memo(TaskMeta);
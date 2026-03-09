"use client";

import { MessageSquare, Activity as ActivityIcon } from "lucide-react";
import React from "react";

function TaskTabs({
  tab,
  setTab,
}: {
  tab: "comments" | "activity";
  setTab: (tab: "comments" | "activity") => void;
}) {
  return (
    <div className="flex border-b">
      <button
        onClick={() => setTab("comments")}
        className={`flex-1 py-3 text-sm flex items-center justify-center gap-2 ${
          tab === "comments" ? "border-b-2 border-blue-600 font-medium" : ""
        }`}
      >
        <MessageSquare size={16} />
        Comments
      </button>

      <button
        onClick={() => setTab("activity")}
        className={`flex-1 py-3 text-sm flex items-center justify-center gap-2 ${
          tab === "activity" ? "border-b-2 border-blue-600 font-medium" : ""
        }`}
      >
        <ActivityIcon size={16} />
        Activity
      </button>
    </div>
  );
}
export default React.memo(TaskTabs);
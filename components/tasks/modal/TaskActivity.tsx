"use client";

import { TaskActivity as TaskActivityType } from "@/lib/supabase/models";
import UserAvatar from "@/components/ui/user-avatar";
import React from "react";

function renderChange(metadata: any) {
  if (!metadata) return null;

  const { field, previous, next } = metadata;

  if (previous === undefined || next === undefined) return null;

  return (
    <span className="ml-1">
      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
        {previous || "empty"}
      </span>

      <span className="mx-1 text-slate-400">→</span>

      <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700">
        {next || "empty"}
      </span>
    </span>
  );
}

 function TaskActivity({
  activity,
}: {
  activity: TaskActivityType[];
}) {
  if (!activity || activity.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
        No activity yet
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-6">
      {activity.map((item) => {
        const time = new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          month: "short",
          day: "numeric",
        }).format(new Date(item.created_at));

        return (
        <div key={item.id} className="flex gap-3 items-start">
          
          <UserAvatar
            name={item.users?.name}
            image={item.users?.image_url}
          />

          <div className="flex-1">

            <div className="text-sm text-slate-700 leading-relaxed">
              <span className="font-semibold">
                {item.users?.name || "Unknown"}
              </span>{" "}
              
              {item.action}

              {renderChange(item.metadata)}
            </div>

            <div className="text-xs text-slate-400 mt-1">
              {time}
            </div>

          </div>
        </div>
        )}
      )}
    </div>
  );
}

export default React.memo(TaskActivity)
"use client";

import { Send } from "lucide-react";
import UserAvatar from "@/components/ui/user-avatar";
import React from "react";

function TaskComments({
  comments,
  newComment,
  setNewComment,
  handleAddComment,
}: any) {
  return (
    <>
      {/* COMMENTS LIST */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {comments.map((comment: any) => (
          <div key={comment.id} className="flex gap-3">
            <UserAvatar
              name={comment.users?.name}
              image={comment.users?.image_url}
            />

            <div>
              <div className="text-sm font-semibold">
                {comment.users?.name}
              </div>

              <div className="text-sm text-slate-600">
                {comment.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="p-4 border-t flex gap-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border rounded p-2 text-sm"
        />

        <button
          onClick={handleAddComment}
          className="bg-blue-600 text-white px-3 rounded"
        >
          <Send size={16} />
        </button>
      </div>
    </>
  );
}

export default React.memo(TaskComments);
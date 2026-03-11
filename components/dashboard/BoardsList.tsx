"use client";

import Link from "next/link";
import { Board } from "@/lib/supabase/models";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

export default function BoardsList({
  boards,
  onCreateBoard,
  onDeleteClick,
}: {
  boards: Board[];
  onCreateBoard: () => void;
  onDeleteClick: (e: React.MouseEvent, boardId: string) => void;
}) {
  return (
    <div>
      {boards.map((board) => (
        <Link key={board.id} href={`/boards/${board.id}`}>
          <Card className="group hover:shadow-lg transition-shadow cursor-pointer mb-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 ${board.color} rounded`} />
                  <CardTitle className="group-hover:text-blue-600 transition-colors">
                    {board.title}
                  </CardTitle>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-red-100 hover:text-red-600"
                  onClick={(e) => onDeleteClick(e, board.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <CardDescription className="text-xs mb-2">
                {board.description}
              </CardDescription>

              <div className="text-xs text-gray-500">
                Created {new Date(board.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}

      {/* Create Board Row */}
      <Card
        onClick={onCreateBoard}
        className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer group mt-4"
      >
        <CardContent className="flex items-center justify-center gap-2 py-6">
          <Plus className="text-gray-400 group-hover:text-blue-600" />
          <p className="text-gray-600 group-hover:text-blue-600">
            Create New Board
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
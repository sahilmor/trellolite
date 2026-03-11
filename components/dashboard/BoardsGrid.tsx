"use client";

import Link from "next/link";
import { Board } from "@/lib/supabase/models";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export default function BoardsGrid({
  boards,
  onCreateBoard,
  onDeleteClick,
}: {
  boards: Board[];
  onCreateBoard: () => void;
  onDeleteClick: (e: React.MouseEvent, boardId: string) => void;
}) {
  if (boards.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No Boards Yet. Create one to get started!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {boards.map((board) => (
        <Link key={board.id} href={`/boards/${board.id}`}>
          <Card className="group hover:shadow-lg transition-shadow cursor-pointer relative h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`w-4 h-4 ${board.color} rounded`} />

                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto hover:bg-red-100 hover:text-red-600 z-10"
                  onClick={(e) => onDeleteClick(e, board.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 grow">
              <CardTitle className="text-lg mb-2 group-hover:text-blue-600 transition-colors">
                {board.title}
              </CardTitle>

              <CardDescription className="text-xs mb-4 line-clamp-2">
                {board.description}
              </CardDescription>

              <div className="text-xs text-gray-500 mt-auto">
                Created {new Date(board.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}

      {/* Create board card */}
      <Card
        onClick={onCreateBoard}
        className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer group flex flex-col items-center justify-center min-h-50"
      >
        <CardContent className="flex flex-col items-center justify-center text-center">
          <Plus className="h-8 w-8 text-gray-400 group-hover:text-blue-600 mb-2" />
          <p className="text-gray-600 group-hover:text-blue-600 font-medium">
            Create New Board
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
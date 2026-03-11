"use client";

import { Board } from "@/lib/supabase/models";
import { Button } from "@/components/ui/button";
import { Grid3X3, List, Plus, Filter } from "lucide-react";
import { useState } from "react";
import BoardsGrid from "./BoardsGrid";
import BoardsList from "./BoardsList";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function BoardsSection({
  boards,
  onCreateBoard,
  onDeleteClick,
}: {
  boards: Board[];
  onCreateBoard: () => void;
  onDeleteClick: (e: React.MouseEvent, boardId: string) => void;
}) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");

  const filteredBoards = boards.filter((board) =>
    board.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Your Boards</h2>
          <p className="text-gray-600">Manage your projects and tasks.</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 />
          </Button>

          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            onClick={() => setViewMode("list")}
          >
            <List />
          </Button>

          <Button onClick={onCreateBoard}>
            <Plus /> Create Board
          </Button>
        </div>
      </div>
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

        <Input
          placeholder="Search boards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {viewMode === "grid" ? (
        <BoardsGrid
          boards={filteredBoards}
          onCreateBoard={onCreateBoard}
          onDeleteClick={onDeleteClick}
        />
      ) : (
        <BoardsList
          boards={filteredBoards}
          onCreateBoard={onCreateBoard}
          onDeleteClick={onDeleteClick}
        />
      )}
    </div>
  );
}

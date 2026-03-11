"use client";

import { useBoards } from "@/lib/hooks/useBoards";
import { usePlan } from "@/lib/context/PlanContext";
import { useState } from "react";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import BoardsSection from "@/components/dashboard/BoardsSection";
import DashboardDialogs from "@/components/dashboard/DashboardDialogs";

export default function DashboardPage() {

  const { boards, createBoard, deleteBoard } = useBoards();
  const { isFreeUser } = usePlan();

  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [deleteBoardDialogOpen, setDeleteBoardDialogOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);

  const canCreateBoard = !isFreeUser || boards.length < 1;

  const handleCreateBoard = async () => {
    if (!canCreateBoard) {
      setShowUpgradeDialog(true);
      return;
    }

    await createBoard({ title: "New Board" });
  };

  const handleDeleteClick = (e: React.MouseEvent, boardId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setBoardToDelete(boardId);
    setDeleteBoardDialogOpen(true);
  };

  const confirmDeleteBoard = async () => {
    if (!boardToDelete) return;

    await deleteBoard(boardToDelete);

    setDeleteBoardDialogOpen(false);
    setBoardToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">

        <DashboardHeader />

        <DashboardStats boards={boards} />

        <BoardsSection
          boards={boards}
          onCreateBoard={handleCreateBoard}
          onDeleteClick={handleDeleteClick}
        />

      </main>

      <DashboardDialogs
        showUpgradeDialog={showUpgradeDialog}
        setShowUpgradeDialog={setShowUpgradeDialog}
        deleteBoardDialogOpen={deleteBoardDialogOpen}
        setDeleteBoardDialogOpen={setDeleteBoardDialogOpen}
        confirmDeleteBoard={confirmDeleteBoard}
      />

    </div>
  );
}
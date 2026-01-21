"use client";

import Navbar from "@/components/shared/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlan } from "@/lib/context/PlanContext";
import { useBoards } from "@/lib/hooks/useBoards";
import { Board } from "@/lib/supabase/models";
import { useUser } from "@clerk/nextjs";
import {
  AlignEndHorizontal,
  Filter,
  Grid3X3,
  List,
  Loader2,
  Plus,
  Rocket,
  Search,
  Trash2,
  Trello,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardPage() {
  const { user } = useUser();
  const { isFreeUser } = usePlan();
  const router = useRouter();
  const { createBoard, boards, loading, error, deleteBoard } = useBoards();
  
  // UI State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState<boolean>(false);
  
  // Delete Logic State
  const [deleteBoardDialogOpen, setDeleteBoardDialogOpen] = useState<boolean>(false);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);

  // Filter State
  const [filters, setFilters] = useState({
    search: "",
    dateRange: {
      start: null as string | null,
      end: null as string | null,
    },
    taskCount: {
      min: null as number | null,
      max: null as number | null,
    },
  });

  const canCreateBoard = !isFreeUser || boards.length < 1;

  const boardsWithTaskCount = boards.map((board: Board) => ({
    ...board,
    taskCount: 0,
  }));

  const filteredBoards = boardsWithTaskCount.filter((board: Board) => {
    const matchesSearch = board.title
      .toLowerCase()
      .includes(filters.search.toLowerCase());

    const matchesDateRange =
      (!filters.dateRange.start ||
        new Date(board.created_at) >= new Date(filters.dateRange.start)) &&
      (!filters.dateRange.end ||
        new Date(board.created_at) <= new Date(filters.dateRange.end));

    return matchesSearch && matchesDateRange;
  });

  function clearFilter() {
    setFilters({
      search: "",
      dateRange: {
        start: null as string | null,
        end: null as string | null,
      },
      taskCount: {
        min: null as number | null,
        max: null as number | null,
      },
    });
  }

  const handleCreateBoard = async () => {
    if (!canCreateBoard) {
      setShowUpgradeDialog(true);
      return;
    }
    await createBoard({
      title: "New Board",
    });
  };

  // --- DELETE LOGIC START ---

  // 1. Triggered when clicking the Trash Icon
  const handleDeleteClick = (e: React.MouseEvent, boardId: string) => {
    e.preventDefault(); // Stop Link navigation
    e.stopPropagation(); // Stop bubbling
    setBoardToDelete(boardId); // Store the ID to delete later
    setDeleteBoardDialogOpen(true); // Open the popup
  };

  // 2. Triggered when clicking "Delete" inside the popup
  const confirmDeleteBoard = async () => {
    if (boardToDelete) {
      await deleteBoard(boardToDelete);
      setDeleteBoardDialogOpen(false);
      setBoardToDelete(null);
    }
  };
  // --- DELETE LOGIC END ---

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600 mb-2" />
        <span>Loading Your boards...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-red-600 font-bold">Error loading boards</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back,{" "}
            {user?.firstName ?? user?.emailAddresses[0].emailAddress}
          </h1>

          <p className="text-gray-600">
            Here's what's happening with you boards today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Total Boards
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {boards.length}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Trello className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Recent Activity
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {
                      boards.filter((board) => {
                        const updatedAt = new Date(board.updated_at);
                        const oneWeekAgo = new Date();
                        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                        return updatedAt > oneWeekAgo;
                      }).length
                    }
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <AlignEndHorizontal className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Active Projects
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {boards.length}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Team Velocity
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {boards.length}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Boards Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:mb-6 space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Your Boards
              </h2>
              <p className="text-gray-600">Manage your projects and tasks.</p>

              {isFreeUser && (
                <p className="text-sm text-gray-500 mt-1">
                  Free Plan: {boards.length}/1 boards used.
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2 bg-white border p-1 rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterOpen(true)}
              >
                <Filter />
                Filter
              </Button>

              <Button onClick={handleCreateBoard}>
                <Plus />
                Create Board
              </Button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mb-4 sm:mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search Boards..."
              className="pl-10"
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>

          {/* Board Grid/List Render */}
          {boards.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No Boards Yet. Create one to get started!
            </div>
          ) : viewMode === "grid" ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredBoards.map((board, key) => (
                <Link key={key} href={`/boards/${board.id}`}>
                  <Card className="group hover:shadow-lg transition-shadow cursor-pointer relative h-full flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`w-4 h-4 ${board.color} rounded`} />
                        
                        {/* Delete Button - Using handleDeleteClick to stop propagation */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto hover:bg-red-100 hover:text-red-600 z-10"
                          onClick={(e) => handleDeleteClick(e, board.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 grow">
                      <CardTitle className="text-base sm:text-lg mb-2 group-hover:text-blue-600 transition-colors">
                        {board.title}
                      </CardTitle>
                      <CardDescription className="text-xs mb-4 line-clamp-2">
                        {board.description}
                      </CardDescription>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 space-y-1 sm:space-y-0 mt-auto">
                        <span>
                          Created{" "}
                          {new Date(board.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}

              <Card
                onClick={handleCreateBoard}
                className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer group flex flex-col items-center justify-center min-h-50"
              >
                <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center text-center">
                  <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 group-hover:text-blue-600 mb-2" />
                  <p className="text-sm sm:text-base text-gray-600 group-hover:text-blue-600 font-medium">
                    Create New Board
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* LIST VIEW */
            <div>
              {filteredBoards.map((board, key) => (
                <div key={key} className={key > 0 ? "mt-4" : ""}>
                  <Link href={`/boards/${board.id}`}>
                    <Card className="group hover:shadow-lg transition-shadow cursor-pointer mb-4">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 ${board.color} rounded`} />
                            <CardTitle className="text-base sm:text-lg group-hover:text-blue-600 transition-colors">
                              {board.title}
                            </CardTitle>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* <Badge className="text-xs" variant="secondary">
                              New
                            </Badge> */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-red-100 hover:text-red-600 z-10"
                              onClick={(e) => handleDeleteClick(e, board.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 sm:pt-0 sm:p-6">
                        <CardDescription className="text-xs mb-2">
                          {board.description}
                        </CardDescription>
                        <div className="flex flex-col sm:flex-row sm:items-center text-xs text-gray-500 space-y-1 sm:space-y-0">
                          <span>
                            Created{" "}
                            {new Date(board.created_at).toLocaleDateString()}
                          </span>
                          <span className="hidden sm:inline mx-2">•</span>
                          <span>
                            Updated{" "}
                            {new Date(board.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}

              <Card 
                onClick={handleCreateBoard}
                className="mt-4 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer group"
              >
                <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center h-full min-h-24">
                  <div className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                    <p className="text-sm text-gray-600 group-hover:text-blue-600 font-medium">
                      Create New Board
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Filter Dialog */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="w-[95vw] max-w-106.25 mx-auto">
          <DialogHeader>
            <DialogTitle>Filter Boards</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Filter boards by title, date, or task count.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Date Range</Label>
              <div className="grid grid-cols sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Start Date</Label>
                  <Input
                    type="date"
                    value={filters.dateRange.start || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: {
                          ...prev.dateRange,
                          start: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">End Date</Label>
                  <Input
                    type="date"
                    value={filters.dateRange.end || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: {
                          ...prev.dateRange,
                          end: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Task Count</Label>
              <div className="grid grid-cols sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Minimum</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Min task"
                    value={filters.taskCount.min || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        taskCount: {
                          ...prev.taskCount,
                          min: e.target.value ? Number(e.target.value) : null,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Maximum</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Max tasks"
                    value={filters.taskCount.max || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        taskCount: {
                          ...prev.taskCount,
                          max: e.target.value ? Number(e.target.value) : null,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between pt-4 space-y-2 sm:space-y-0 sm:space-x-2">
              <Button variant={"outline"} onClick={clearFilter}>
                Clear Filters
              </Button>
              <Button onClick={() => setIsFilterOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="w-[95vw] max-w-106.25 mx-auto">
          <DialogHeader>
            <DialogTitle>Upgrade to Create More Boards</DialogTitle>
            <DialogDescription>
              Free users can only create one board. Upgrade to Pro or Enterprise
              plan to create unlimited boards.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant={"outline"}
              onClick={() => setShowUpgradeDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => router.push("/pricing")}>View Plans</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteBoardDialogOpen}
        onOpenChange={setDeleteBoardDialogOpen}
      >
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Delete Board</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this board? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end space-x-2 pt-4">
            <Button
              variant={"outline"}
              onClick={() => setDeleteBoardDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteBoard}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
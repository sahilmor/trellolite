"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Trello, AlignEndHorizontal, Rocket } from "lucide-react"
import { Board } from "@/lib/supabase/models"

export default function DashboardStats({ boards }: { boards: Board[] }) {

  const recentActivity = boards.filter((board) => {
    const updatedAt = new Date(board.updated_at)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    return updatedAt > oneWeekAgo
  }).length

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">

      <Card>
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Total Boards</p>
            <p className="text-2xl font-bold">{boards.length}</p>
          </div>
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Trello className="text-blue-600"/>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Recent Activity</p>
            <p className="text-2xl font-bold">{recentActivity}</p>
          </div>
          <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <AlignEndHorizontal className="text-purple-600"/>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Active Projects</p>
            <p className="text-2xl font-bold">{boards.length}</p>
          </div>
          <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Rocket className="text-green-600"/>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
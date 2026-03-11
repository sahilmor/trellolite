"use client"

import { useUser } from "@clerk/nextjs"

export default function DashboardHeader() {
  const { user } = useUser()

  return (
    <div className="mb-6 sm:mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Welcome back,{" "}
        {user?.firstName ?? user?.emailAddresses[0].emailAddress}
      </h1>

      <p className="text-gray-600">
        Here's what's happening with your boards today.
      </p>
    </div>
  )
}
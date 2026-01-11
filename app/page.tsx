import Navbar from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { 
  ArrowRight, 
  Kanban, 
  Layout, 
  Lock, 
  MousePointerClick, 
  Zap 
} from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  // If the user is logged in, redirect them to the dashboard immediately
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-blue-50 via-white to-purple-50">
      {/* Navbar handles the top navigation and Sign In/Up buttons */}
      <Navbar />

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex flex-col items-center text-center px-4">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-gray-900">
                Manage your projects with{" "}
                <span className="text-blue-600">Trello Lite</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                The simplest way to organize your tasks, collaborate with your team, 
                and move projects forward. Built for speed and simplicity.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignUpButton>
                <Button size="lg" className="h-12 px-8 text-lg gap-2 cursor-pointer hover:scale-105 transition-transform">
                  Get Started for Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </SignUpButton>
              <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
                View Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white/50 backdrop-blur-sm border-t border-gray-100">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="flex flex-col items-center space-y-3 text-center p-6 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Kanban className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Kanban Boards</h3>
                <p className="text-gray-500 text-sm">
                  Visualize your workflow with intuitive boards, lists, and cards.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center space-y-3 text-center p-6 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <MousePointerClick className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Drag & Drop</h3>
                <p className="text-gray-500 text-sm">
                  Smooth and responsive drag-and-drop powered by modern web tech.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center space-y-3 text-center p-6 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Real-time Sync</h3>
                <p className="text-gray-500 text-sm">
                  Changes appear instantly across all devices using Supabase.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col items-center space-y-3 text-center p-6 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                  <Lock className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Secure</h3>
                <p className="text-gray-500 text-sm">
                  Enterprise-grade authentication and security provided by Clerk.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white">
        <p className="text-xs text-center text-gray-500">
          © 2024 Trello Lite. Built with Next.js 15, Clerk, and Supabase.
        </p>
      </footer>
    </div>
  );
}
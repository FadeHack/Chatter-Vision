import { Outlet } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from '@/hooks/useAuth'
import { CommonSidebar } from "./CommonSidebar"
import { UserDock } from "./UserDock"
import Navbar from "./Navbar"

export function UserLayout() {
  const { user } = useAuth()

  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: "LayoutDashboard",
    },
    {
      title: "Meetings",
      href: "/meetings",
      icon: "Video",
    },
    {
      title: "People",
      href: "/people",
      icon: "Users",
    },
    {
      title: "Settings",
      href: "/settings",
      icon: "Settings",
    }
  ]

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen w-screen">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <CommonSidebar items={sidebarItems} user={user} />
          <main className="flex-1 overflow-y-auto p-8 pb-32">
            <Outlet />
          </main>
        </div>
        <UserDock />
      </div>
    </SidebarProvider>
  )
} 
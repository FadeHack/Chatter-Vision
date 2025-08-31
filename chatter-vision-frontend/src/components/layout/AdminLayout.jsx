import { Outlet } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from '@/hooks/useAuth'
import { CommonSidebar } from "./CommonSidebar"
import Navbar from "./Navbar"

export function AdminLayout() {
  const { user } = useAuth()

  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: "LayoutDashboard",
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: "Users",
    },
    {
      title: "Meetings",
      href: "/admin/meetings",
      icon: "Video",
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: "BarChart",
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: "Settings",
    }
  ]

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen w-screen">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <CommonSidebar items={sidebarItems} user={user} />
          <main className="flex-1 overflow-y-auto p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
} 
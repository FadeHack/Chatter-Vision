import { Link, useLocation } from "react-router-dom"
import { Icon } from "@/components/ui/icon"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar"

export function CommonSidebar({ items, user }) {
  const location = useLocation()
  const { isMobile } = useSidebar()

  return (
    <Sidebar
      collapsible={isMobile ? "modal" : "offcanvas"}
      variant={isMobile ? "modal" : "default"}
    >
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex flex-col flex-1 gap-1 min-w-0">
            <p className="text-sm font-medium leading-none truncate">
              {user?.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.href}
                tooltip={item.title}
              >
                <Link to={item.href} className="flex items-center gap-2">
                  <Icon name={item.icon} className="w-4 h-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
} 
import * as React from "react"
import { Link } from "react-router-dom"
import { useAuth } from '@/hooks/useAuth'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggler"
import { Video, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()

  const renderAuthenticatedNav = () => (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'}>
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-red-600">
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  const renderPublicNav = () => (
    <nav className="flex items-center gap-4">
      <Link 
        to="/login" 
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Sign In
      </Link>
      <Link 
        to="/register" 
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Get Started
      </Link>
    </nav>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          {isAuthenticated && (
            <SidebarTrigger className="md:hidden" />
          )}
          <Link to="/" className="flex items-center gap-2">
            <Video className="h-6 w-6" />
            <span className="text-xl font-bold">ChatterVision</span>
          </Link>
          {!isAuthenticated && (
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 lg:w-[500px] lg:grid-cols-2">
                      <li className="row-span-3 grid">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            to="/features"
                          >
                            <div className="mb-2 mt-4 text-lg font-medium">
                              Video Conferencing
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              High-quality video meetings for teams of all sizes
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <ListItem to="/features/meetings" title="Virtual Meetings">
                        Host and join meetings with HD video quality
                      </ListItem>
                      <ListItem to="/features/recording" title="Cloud Recording">
                        Record and store meetings securely in the cloud
                      </ListItem>
                      <ListItem to="/features/sharing" title="Screen Sharing">
                        Share your screen with one click
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/pricing" className={navigationMenuTriggerStyle()}>
                    Pricing
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/about" className={navigationMenuTriggerStyle()}>
                    About
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="border-r pr-4">
            <ModeToggle />
          </div>
          {isAuthenticated ? renderAuthenticatedNav() : renderPublicNav()}
        </div>
      </div>
    </header>
  )
}

const ListItem = React.forwardRef(({ className, title, children, to, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          to={to}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

export default Navbar

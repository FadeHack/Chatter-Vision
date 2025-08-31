import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Dock, DockIcon } from "@/components/ui/dock"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  LayoutDashboard, 
  Video, 
  Users, 
  Settings,
  Plus,
  Calendar,
  Share2
} from "lucide-react"
import { useState } from "react";

export function UserDock() {
  const [meetingUrl, setMeetingUrl] = useState("");

  const handleShare = () => {
    navigator.clipboard.writeText(meetingUrl);
    alert("Meeting URL copied to clipboard!");
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
      <TooltipProvider>
        <Dock className="bg-background/90">
          {/* Quick Actions */}
          <DockIcon>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/new-meeting"
                  aria-label="New Meeting"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "size-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  <Plus className="size-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>New Meeting</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>

          <DockIcon>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleShare}
                  aria-label="Share Meeting"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "size-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  <Share2 className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share Meeting</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>

          <Separator orientation="vertical" className="mx-2 h-8" />

          {/* Navigation */}
          <DockIcon>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/dashboard"
                  aria-label="Dashboard"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "size-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  <LayoutDashboard className="size-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Dashboard</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>

          <DockIcon>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/meetings"
                  aria-label="Meetings"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "size-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  <Video className="size-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Meetings</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>

          <DockIcon>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/people"
                  aria-label="People"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "size-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  <Users className="size-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>People</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>

          <DockIcon>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/settings"
                  aria-label="Settings"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "size-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  <Settings className="size-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
        </Dock>
      </TooltipProvider>
    </div>
  )
} 
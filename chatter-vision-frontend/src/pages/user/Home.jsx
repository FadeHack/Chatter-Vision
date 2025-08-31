import { useAuthStore } from "@/store/auth.store"
import { Calendar, Video, Users, Clock, Plus, ArrowUpRight, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import * as React from "react"
import { useState } from "react";
import MeetingsService from "@/services/meetings.service";
import { CreateMeetingDialog } from "@/components/dialogs/CreateMeetingDialog";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [isCreating, setIsCreating] = useState(false)
  const [meetingUrl, setMeetingUrl] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleCreateMeeting = async (title) => {
    console.log(title)
    setIsCreating(true)
    try {
      const uniqueMeetingUrl = `meeting-${Date.now()}`
      const response = await MeetingsService.createMeeting(title, uniqueMeetingUrl)
      navigate(`/meeting/${uniqueMeetingUrl}`);
    } catch (error) {
      console.error("Failed to create meeting:", error)
    } finally {
      setIsCreating(false)
      setIsDialogOpen(false)
    }
  }


  const upcomingMeetings = [
    {
      id: 1,
      title: "Weekly Team Sync",
      time: "2:00 PM",
      participants: 8,
      duration: "1 hour"
    },
    {
      id: 2,
      title: "Project Review",
      time: "4:30 PM",
      participants: 5,
      duration: "45 min"
    }
  ]

  const recentMeetings = [
    {
      id: 1,
      title: "Client Presentation",
      date: "Yesterday",
      participants: 12,
      duration: "55 min"
    },
    {
      id: 2,
      title: "Sprint Planning",
      date: "2 days ago",
      participants: 9,
      duration: "1.5 hours"
    }
  ]

  const [date, setDate] = React.useState(new Date())

  return (
    <div className="space-y-8 relative pb-24">
      {/* Header Section with Gradient Background */}
      <div className="relative -mx-8 -mt-8 px-8 py-10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-muted-foreground text-lg">
              Here's what's happening with your meetings
            </p>
          </div>
          <Button
            className="gap-2 shadow-lg hover:shadow-primary/25 transition-shadow"
            onClick={() => setIsDialogOpen(true)}
            disabled={isCreating}
          >
            <Plus className="h-4 w-4" /> New Meeting
          </Button>
          {meetingUrl && (
            <div className="mt-4 p-4 bg-green-100 rounded">
              <p className="text-green-700">Meeting Created!</p>
              <a href={meetingUrl} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
                Join Meeting
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards with Hover Effects */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Video className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              +2 from last week
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Meeting Hours</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Clock className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.2h</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              +5h from last week
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">129</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              +18 new participants
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Upcoming meetings</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-[1fr,320px]">
        <div className="space-y-6">
          {/* Meetings Section with Enhanced Tabs */}
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none p-0 h-12 bg-transparent">
              <TabsTrigger
                value="upcoming"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6"
              >
                Upcoming Meetings
              </TabsTrigger>
              <TabsTrigger
                value="recent"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6"
              >
                Recent Meetings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-6">
              <Carousel className="w-full">
                <CarouselContent className="-ml-4">
                  {upcomingMeetings.map((meeting) => (
                    <CarouselItem key={meeting.id} className="pl-10 md:basis-1/2 lg:basis-1/3">
                      <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
                        <CardHeader>
                          <CardTitle className="text-lg">{meeting.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            Today at {meeting.time}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{meeting.participants} participants</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{meeting.duration}</span>
                            </div>
                          </div>
                          <Button className="w-full gap-2">
                            Join Meeting <ArrowRight className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="-left-4" />
                <CarouselNext className="-right-4" />
              </Carousel>
            </TabsContent>

            <TabsContent value="recent">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentMeetings.map((meeting) => (
                  <Card key={meeting.id}>
                    <CardHeader>
                      <CardTitle>{meeting.title}</CardTitle>
                      <CardDescription>{meeting.date}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{meeting.participants} participants</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{meeting.duration}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Calendar Card */}
        <Card className="hover:shadow-lg transition-shadow h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Calendar
            </CardTitle>
            <CardDescription>Schedule your meetings</CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>
      <CreateMeetingDialog
  open={isDialogOpen}
  onOpenChange={setIsDialogOpen}
  onCreateMeeting={handleCreateMeeting}
  isCreating={isCreating}
/>
    </div>
  )
}

export default UserDashboard
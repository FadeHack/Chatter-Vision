import { Navigate, Route, Routes } from "react-router-dom"
import { UserLayout } from "@/components/layout/UserLayout"
import { MeetingLayout } from "@/components/layout/MeetingLayout"
import UserDashboard from "@/pages/user/Home"
import MeetingPage from "@/pages/user/Meeting"

export function UserRoutes() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route element={<MeetingLayout />}>
        <Route path="/meeting/:meetingUrl" element={<MeetingPage />} />
      </Route>
    </Routes>
  )
} 
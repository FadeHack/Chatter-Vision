// layouts/MeetingLayout.jsx - New full-screen layout for meetings
import { Outlet } from "react-router-dom"

export function MeetingLayout() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <Outlet />
    </div>
  )
}

import { Navigate, Route, Routes } from "react-router-dom"
import { AdminLayout } from "@/components/layout/AdminLayout"
import AdminDashboard from "@/pages/admin/Home"

export function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  )
} 
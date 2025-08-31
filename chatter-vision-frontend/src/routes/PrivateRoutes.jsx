import { Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/auth.store"
import { UserRoutes } from "./UserRoutes"
import { AdminRoutes } from "./AdminRoutes"

export function PrivateRoutes() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role === "admin") {
    return <AdminRoutes />
  }

  return <UserRoutes />
} 
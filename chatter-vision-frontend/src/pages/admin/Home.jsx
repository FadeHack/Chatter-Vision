import { useAuthStore } from "@/store/auth.store"

function AdminDashboard() {
  const { user } = useAuthStore()
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome back, {user?.name}!
      </p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-sm text-muted-foreground">Active Meetings</p>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-sm text-muted-foreground">Total Meetings</p>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-sm text-muted-foreground">Storage Used</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
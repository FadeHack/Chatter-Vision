import { ThemeProvider } from "@/components/theme-provider"
import { BrowserRouter } from "react-router-dom"
import { PublicRoutes } from "./routes/PublicRoutes"
import { PrivateRoutes } from "./routes/PrivateRoutes"
import { useAuthStore } from "@/store/auth.store"

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="video-con-ui-theme">
        {isAuthenticated ? <PrivateRoutes /> : <PublicRoutes />}
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App

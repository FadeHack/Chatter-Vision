import { Navigate, Route, Routes } from "react-router-dom"
import Login from "@/pages/auth/Login"
import Register from "@/pages/auth/Register"
import Features from "@/pages/Features"
import Pricing from "@/pages/Pricing"
import About from "@/pages/About"
import Home from "@/pages/Home"
import Navbar from "@/components/layout/Navbar"

export function PublicRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/features" element={<Features />} />
        <Route path="/features/*" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

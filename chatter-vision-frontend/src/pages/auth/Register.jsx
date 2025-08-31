import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from '@/hooks/useAuth'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorMessage } from "@/components/common/ErrorMessage"
import { validateRegister } from '@/utils/validator'
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

function Register() {
  const { register, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [serverError, setServerError] = useState("")
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    // Clear errors when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: "",
    }))
    setServerError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    })
    setServerError("")
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }))
      return
    }
    
    const validation = validateRegister(formData)
    
    if (!validation.success) {
      const errorMessage = validation.error
      if (errorMessage.includes("Name")) {
        setErrors(prev => ({ ...prev, name: errorMessage }))
      } else if (errorMessage.includes("Username")) {
        setErrors(prev => ({ ...prev, username: errorMessage }))
      } else if (errorMessage.includes("Email")) {
        setErrors(prev => ({ ...prev, email: errorMessage }))
      } else if (errorMessage.includes("Password")) {
        setErrors(prev => ({ ...prev, password: errorMessage }))
      }
      return
    }
    
    // Create a new object without confirmPassword for API call
    const { confirmPassword, ...registerData } = formData
    const result = await register(registerData)
    if (!result.success) {
      setServerError(result.error)
    }
  }

  const inputClassName = (fieldName) => cn(
    "w-full p-2 border rounded-md bg-primary-foreground text-primary transition-colors",
    errors[fieldName] 
      ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
      : "border-input focus:border-primary focus:ring-primary"
  )

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>
            Create a new account to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {serverError && (
              <ErrorMessage message={serverError} className="mb-4" />
            )}
            
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className={inputClassName("name")}
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  @
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className={cn(inputClassName("username"), "pl-8")}
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={inputClassName("email")}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPasswords.password ? "text" : "password"}
                  required
                  className={cn(inputClassName("password"), "pr-10")}
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, password: !prev.password }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.password ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPasswords.confirmPassword ? "text" : "password"}
                  required
                  className={cn(inputClassName("confirmPassword"), "pr-10")}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link 
              to="/login"
              className="text-primary hover:underline"
            >
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Register
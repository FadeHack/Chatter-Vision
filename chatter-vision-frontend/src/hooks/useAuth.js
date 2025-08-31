import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

export function useAuth() {
  const navigate = useNavigate()
  const { 
    user, 
    isAuthenticated, 
    login: loginFn, 
    register: registerFn, 
    logout,
    isLoading,
  } = useAuthStore()

  const handleLogin = async (credentials) => {
    try {
      const response = await loginFn(credentials)
      if (response?.user) {
        navigate(response.user.role === 'admin' ? '/admin' : '/dashboard')
      }
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const handleRegister = async (userData) => {
    try {
      const response = await registerFn(userData)
      if (response?.user) {
        navigate('/dashboard')
      }
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout
  }
}

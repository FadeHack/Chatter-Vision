import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'
import { API_BASE_URL } from '@/config/constants'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const { tokens, refreshTokens } = useAuthStore.getState()
    if (tokens?.access) {
      const tokenExpiry = new Date(tokens.access.expires)
      const now = new Date()
      
      if (tokenExpiry <= now) {
        // Token is expired, try to refresh before making the request
        refreshTokens()
      }
      
      config.headers.Authorization = `Bearer ${tokens.access.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const { refreshTokens, tokens, logout } = useAuthStore.getState()

    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      tokens?.refresh &&
      !originalRequest.url.includes('/auth/login')
    ) {
      originalRequest._retry = true

      try {
        await refreshTokens()
        const { tokens } = useAuthStore.getState()
        originalRequest.headers.Authorization = `Bearer ${tokens.access}`
        return axiosInstance(originalRequest)
      } catch (error) {
        logout()
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance

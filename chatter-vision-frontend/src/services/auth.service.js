import axios from '@/lib/axios'
import { API_ENDPOINTS } from '@/config/constants'

class AuthService {
  async register(userData) {
    const { data } = await axios.post(API_ENDPOINTS.AUTH.REGISTER, userData)
    return data
  }

  async login(credentials) {
    const { data } = await axios.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
    console.log(data)
    return data
  }

  async refreshTokens(refreshToken) {
    const { data } = await axios.post(API_ENDPOINTS.AUTH.REFRESH_TOKENS, { refreshToken })
    return data
  }

  async forgotPassword(email) {
    const { data } = await axios.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
    return data
  }

  async resetPassword(token, newPassword) {
    const { data } = await axios.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { 
      token, 
      password: newPassword 
    })
    return data
  }
}

export const authService = new AuthService()

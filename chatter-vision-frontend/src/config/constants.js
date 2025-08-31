

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1'

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH_TOKENS: '/auth/refresh-tokens',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    SEND_VERIFICATION_EMAIL: '/auth/send-verification-email',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  MEETING: {
    CREATE: '/meetings',
    GET: '/meetings/:meetingUrl',
  },
}

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
}

export const TOKEN_STORAGE_KEY = 'auth_tokens'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '@/services/auth.service'
import { TOKEN_STORAGE_KEY } from '@/config/constants'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      setTokens: (tokens) => set({ tokens, isAuthenticated: !!tokens }),
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),

      register: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await authService.register(userData)
          set({ 
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false 
          })
          return response
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await authService.login(credentials)
          set({ 
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
          })
          return response
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Invalid credentials', 
            isLoading: false,
            isAuthenticated: false
          })
          throw error
        }
      },

      logout: () => {
        set({ 
          user: null,
          tokens: null,
          isAuthenticated: false,
        })
      },

      refreshTokens: async () => {
        const state = useAuthStore.getState()
        if (!state.tokens?.refresh) return

        try {
          const response = await authService.refreshTokens(state.tokens.refresh)
          set({ tokens: response.tokens })
          return response
        } catch (error) {
          set({ 
            user: null,
            tokens: null,
            isAuthenticated: false,
          })
          throw error
        }
      },
    }),
    {
      name: TOKEN_STORAGE_KEY,
      partialize: (state) => ({ 
        tokens: state.tokens,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
)

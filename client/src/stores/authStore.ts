import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../utils/api'

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
  department_id?: number
  last_login?: string
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        try {
          const response = await authAPI.login({ username, password })
          const { token, user } = response.data

          localStorage.setItem('token', token)

          set({
            token,
            user,
            isAuthenticated: true,
          })
        } catch (error) {
          console.error('Login failed:', error)
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem('token')
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        })
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token')
        if (!token) {
          set({
            token: null,
            user: null,
            isAuthenticated: false,
          })
          return
        }

        try {
          const response = await authAPI.getCurrentUser()
          set({
            token,
            user: response.data,
            isAuthenticated: true,
          })
        } catch (error) {
          localStorage.removeItem('token')
          set({
            token: null,
            user: null,
            isAuthenticated: false,
          })
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

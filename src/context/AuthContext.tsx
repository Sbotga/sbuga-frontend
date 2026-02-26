'use client'

import { apiClient } from '@/lib/api-client'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'

interface User {
  id: number
  display_name: string
  username: string
  created_at: number
  updated_at: number
  description: string
  profile_hash: string
  banner_hash: string
  banned: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: {
    username: string
    password: string
    turnstile_response: string
  }) => Promise<{ success: boolean; message: string | null }>
  signup: (credentials: {
    username: string
    display_name: string
    password: string
    turnstile_response: string
  }) => Promise<{ success: boolean; message: string | null }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await apiClient('/api/auth/me')
        console.log(res)
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (credentials: {
    username: string
    password: string
    turnstile_response: string
  }) => {
    const res = await apiClient(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      { unprotected: true },
    )

    if (res.ok) {
      const { user } = await res.json()
      setUser(user)

      return { success: true, message: '' }
    }

    return { success: false, message: (await res.json()).detail }
  }

  const signup = async (credentials: {
    username: string
    display_name: string
    password: string
    turnstile_response: string
  }) => {
    const res = await apiClient('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    if (res.ok) {
      const { user } = await res.json()
      setUser(user)

      return { success: true, message: '' }
    }

    return { success: false, message: (await res.json()).detail }
  }

  const logout = async () => {
    await apiClient('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

'use client'

import { apiClient } from '@/lib/api-client'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'

// exported variable used by api-client to read the current user outside of React
export let currentUser: User | null = null
export const setCurrentUser = (u: User | null) => {
  currentUser = u
}

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
  email_verified: boolean
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
    email: string
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
          setCurrentUser(data.user)
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
      { unprotected: true, noEmailVerify: true },
    )

    if (res.ok) {
      const meRes = await apiClient('/api/auth/me')
      if (meRes.ok) {
        const data = await meRes.json()

        setUser(data.user)
        setCurrentUser(data.user)

        if (!data.user.email_verified) window.location.href = '/verify_email'
      }

      return { success: true, message: '' }
    }

    return { success: false, message: (await res.json()).detail }
  }

  const signup = async (credentials: {
    username: string
    display_name: string
    password: string
    turnstile_response: string
    email: string
  }) => {
    const res = await apiClient(
      '/api/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      { unprotected: true, noEmailVerify: true },
    )

    if (res.ok) {
      const { user } = await res.json()
      setUser(user)
      setCurrentUser(user)

      window.location.href = '/verify_email'

      return { success: true, message: '' }
    }

    return { success: false, message: (await res.json()).detail }
  }

  const logout = async () => {
    await apiClient(
      '/api/auth/logout',
      { method: 'POST' },
      { noEmailVerify: true },
    )
    setUser(null)
    setCurrentUser(null)
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

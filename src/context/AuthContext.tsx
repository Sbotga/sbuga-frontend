'use client'

import mainApi from '@/app/Api'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'

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
  profile_hash: string | null
  banner_hash: string | null
  banned: boolean
  email_verified: boolean
}

export type Permission = 'manage_aliases'

interface AuthContextType {
  user: User | null
  permissions: Permission[]
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
  logout: () => Promise<void>
  deleteAccount: () => Promise<{ success: boolean; message?: string | null }>
  updateAccountDetails: (newDetails: {
    username?: string
    password?: string
    display_name?: string
    description?: string
  }) => Promise<{ success: boolean; message: string | null }>
  refreshUser: () => Promise<void>
  resendVerificationEmail: () => Promise<{
    success: boolean
    message: string | null
  }>
  getAuthHeader: () => HeadersInit | null | undefined
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ACCESS_KEY = 'sb_access_token'
const REFRESH_KEY = 'sb_refresh_token'

const getStoredTokens = () => {
  if (typeof window === 'undefined')
    return { access_token: null, refresh_token: null }
  return {
    access_token: localStorage.getItem(ACCESS_KEY),
    refresh_token: localStorage.getItem(REFRESH_KEY),
  }
}

const setStoredTokens = (
  access_token: string | null,
  refresh_token?: string | null,
) => {
  if (typeof window === 'undefined') return
  if (access_token) localStorage.setItem(ACCESS_KEY, access_token)
  else localStorage.removeItem(ACCESS_KEY)

  if (typeof refresh_token !== 'undefined') {
    if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token)
    else localStorage.removeItem(REFRESH_KEY)
  }
}

const clearStoredTokens = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

const buildAuthHeaders = (token?: string | null): HeadersInit | undefined =>
  token ? { Authorization: token } : undefined

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  const getAuthHeader = () => {
    const { access_token } = getStoredTokens()
    if (!access_token) return null
    return buildAuthHeaders(access_token)
  }

  const refreshAccessToken = async () => {
    const { refresh_token } = getStoredTokens()
    if (!refresh_token) return false

    try {
      const res = await mainApi.api.mainApiAccountsSessionRefreshPost({
        headers: buildAuthHeaders(refresh_token),
      })
      if (!res.ok) return false
      const data = await res.json().catch(() => null)
      if (data && data.token) {
        setStoredTokens(data.token, refresh_token)
        return true
      }
      return false
    } catch (e) {
      return false
    }
  }

  const fetchCurrentUserWithTokens = async () => {
    const { access_token } = getStoredTokens()
    if (!access_token) return null

    const res = await mainApi.api.getSelfApiAccountsMeGet({
      headers: buildAuthHeaders(access_token),
    })

    if (res.ok) {
      const data = await res.json().catch(() => null)
      return data?.user ?? null
    }

    if (res.status === 401) {
      const refreshed = await refreshAccessToken()
      if (!refreshed) return null
      const { access_token: newAccess } = getStoredTokens()
      if (!newAccess) return null
      const retry = await mainApi.api.getSelfApiAccountsMeGet({
        headers: buildAuthHeaders(newAccess),
      })
      if (!retry.ok) return null
      const data = await retry.json().catch(() => null)
      return data?.user ?? null
    }

    return null
  }

  const resendVerificationEmail = async () => {
    const { access_token } = getStoredTokens()
    if (!access_token) {
      clearStoredTokens()
      setUser(null)
      setCurrentUser(null)
      return { success: false, message: 'not_authenticated' }
    }

    try {
      await mainApi.api.sendVerificationEmailApiAccountsEmailSendPost({
        headers: buildAuthHeaders(access_token),
      })
    } finally {
      return { success: true, message: null }
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await fetchCurrentUserWithTokens()
        if (user) {
          setUser(user)
          setCurrentUser(user)
        } else {
          setUser(null)
          setCurrentUser(null)
          clearStoredTokens()
        }

        await checkPermissions()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  useEffect(() => {
    checkPermissions()
  }, [user, currentUser])

  const checkPermissions = async () => {
    setPermissions([])
    setLoading(true)
    const perms: Permission[] = []

    const { access_token } = getStoredTokens()
    if (!access_token) {
      clearStoredTokens()
      setUser(null)
      setCurrentUser(null)
      return { success: false, message: 'not_authenticated' }
    }

    try {
      // const res = await apiClient(
      //   '/api/manage/aliases/music/add_alias',
      //   {
      //     method: 'POST',
      //     body: JSON.stringify({}),
      //   },
      //   { noEmailVerify: true },
      // )
      const res = await mainApi.api.addSongAliasRouteApiManageAliasSongPost(
        {} as any,
        {
          headers: buildAuthHeaders(access_token),
        },
      )
      // console.log(res)
      if (res.status === 400) {
        perms.push('manage_aliases')
      }
    } finally {
      setPermissions(perms)
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    setLoading(true)
    try {
      const u = await fetchCurrentUserWithTokens()
      if (u) {
        setUser(u)
        setCurrentUser(u)
      } else {
        setUser(null)
        setCurrentUser(null)
        clearStoredTokens()
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials: {
    username: string
    password: string
    turnstile_response: string
  }) => {
    try {
      const res = await mainApi.api.mainApiAccountsLoginPost(credentials)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return { success: false, message: err.detail ?? 'login_failed' }
      }

      const data = await res.json().catch(() => null)
      if (!data) return { success: false, message: 'login_failed' }

      setStoredTokens(data.access_token ?? null, data.refresh_token ?? null)

      const u = await fetchCurrentUserWithTokens()
      if (u) {
        setUser(u)
        setCurrentUser(u)
      }

      if (currentUser && !currentUser.email_verified) {
        if (typeof window !== 'undefined')
          window.location.href = '/verify_email'
      }

      return { success: true, message: '' }
    } catch (e) {
      return { success: false, message: 'login_failed' }
    }
  }

  const signup = async (credentials: {
    username: string
    display_name: string
    password: string
    turnstile_response: string
    email: string
  }) => {
    try {
      const res = await mainApi.api.mainApiAccountsSignupPost(credentials)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return { success: false, message: err.detail ?? 'signup_failed' }
      }

      const data = await res.json().catch(() => null)
      if (!data) return { success: false, message: 'signup_failed' }

      setStoredTokens(data.access_token ?? null, data.refresh_token ?? null)

      const u = await fetchCurrentUserWithTokens()
      if (u) {
        setUser(u)
        setCurrentUser(u)
      }

      if (currentUser && !currentUser.email_verified) {
        if (typeof window !== 'undefined')
          window.location.href = '/verify_email'
      }

      return { success: true, message: '' }
    } catch (e) {
      return { success: false, message: 'signup_failed' }
    }
  }

  const logout = async () => {
    console.log(1)
    clearStoredTokens()
    console.log(2)

    setUser(null)
    console.log(3)

    setCurrentUser(null)
    console.log(4)

    setLoading(false)
    console.log(5)
  }

  const deleteAccount = async () => {
    const { access_token } = getStoredTokens()
    if (!access_token) {
      clearStoredTokens()
      setUser(null)
      setCurrentUser(null)
      return { success: false, message: 'not_authenticated' }
    }

    try {
      const res = await mainApi.api.deleteAccountApiAccountsDeleteDelete({
        headers: buildAuthHeaders(access_token),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))

        clearStoredTokens()
        setUser(null)
        setCurrentUser(null)
        return { success: false, message: err.detail ?? 'delete_failed' }
      }

      clearStoredTokens()
      setUser(null)
      setCurrentUser(null)
      return { success: true }
    } catch (e) {
      clearStoredTokens()
      setUser(null)
      setCurrentUser(null)
      return { success: false, message: 'delete_failed' }
    }
  }

  const updateAccountDetails = async (newDetails: {
    username?: string
    password?: string
    display_name?: string
    description?: string
  }) => {
    const { access_token } = getStoredTokens()
    if (!access_token) return { success: false, message: 'not_authenticated' }

    try {
      if (newDetails.username) {
        if (!newDetails.password)
          return { success: false, message: 'password_required' }
        const res = await mainApi.api.mainApiAccountsUsernamePost(
          {
            new_username: newDetails.username,
            password: newDetails.password,
          },
          { headers: buildAuthHeaders(access_token) },
        )
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          return {
            success: false,
            message: err.detail ?? 'username_update_failed',
          }
        }
      }

      if (newDetails.display_name) {
        const res = await mainApi.api.mainApiAccountsDisplayNamePost(
          { new_display_name: newDetails.display_name },
          { headers: buildAuthHeaders(access_token) },
        )
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          return {
            success: false,
            message: err.detail ?? 'displayname_update_failed',
          }
        }
      }

      if (newDetails.description) {
        const res =
          await mainApi.api.updateDescriptionApiAccountsDescriptionPost(
            { description: newDetails.description },
            { headers: buildAuthHeaders(access_token) },
          )
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          return {
            success: false,
            message: err.detail ?? 'description_update_failed',
          }
        }
      }

      await refreshUser()
      return { success: true, message: null }
    } catch (e) {
      return { success: false, message: 'update_failed' }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        loading,
        login,
        logout,
        signup,
        deleteAccount,
        updateAccountDetails,
        refreshUser,
        resendVerificationEmail,
        getAuthHeader,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

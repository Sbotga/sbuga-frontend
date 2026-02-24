'use client'

import { useAuth } from '@/context/AuthContext'
import type { ReactNode } from 'react'

export const IsLoggedIn = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth()
  if (loading || !user) return null
  return <>{children}</>
}

export const IsLoggedOut = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth()
  if (loading || user) return null
  return <>{children}</>
}

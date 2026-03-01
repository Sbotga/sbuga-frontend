import { currentUser } from '@/context/AuthContext'

export const apiClient = async (
  url: string,
  options: RequestInit = {},
  otherOptions?: { unprotected?: boolean; noEmailVerify?: boolean },
) => {
  // before making any request, redirect unverified users on protected routes
  if (!otherOptions?.noEmailVerify) {
    if (
      typeof window !== 'undefined' &&
      currentUser &&
      !currentUser.email_verified
    ) {
      // force a client-side navigation
      window.location.href = '/verify_email'
      // return a never‑resolving promise so the caller doesn't continue
      return new Promise<Response>(() => {})
    }
  }

  let response = await fetch(url, options)

  if (!otherOptions?.unprotected) {
    if (response.status === 401) {
      const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' })

      if (refreshRes.ok) {
        response = await fetch(url, options)
      } else {
        return refreshRes
      }
    }
  }

  return response
}

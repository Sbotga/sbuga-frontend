export const apiClient = async (url: string, options: RequestInit = {}) => {
  let response = await fetch(url, options)

  if (response.status === 401) {
    const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' })

    if (refreshRes.ok) {
      response = await fetch(url, options)
    } else {
      return refreshRes
    }
  }

  return response
}

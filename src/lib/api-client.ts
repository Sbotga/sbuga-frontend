export const apiClient = async (
  url: string,
  options: RequestInit = {},
  otherOptions?: { unprotected?: boolean },
) => {
  let response = await fetch(url, options)

  if (response.status === 401 && !otherOptions?.unprotected) {
    const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' })

    if (refreshRes.ok) {
      response = await fetch(url, options)
    } else {
      return refreshRes
    }
  }

  return response
}

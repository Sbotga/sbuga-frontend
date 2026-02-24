import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import apiRequest from '../../api-request'

export const POST = async () => {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value

  if (!refreshToken)
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 })

  const response = await apiRequest('/api/accounts/session/refresh', {
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  })

  if (!response.ok) {
    const failRes = NextResponse.json(
      { error: 'Session expired' },
      { status: 401 },
    )
    failRes.cookies.delete('access_token')
    failRes.cookies.delete('refresh_token')
    return failRes
  }

  const { token } = await response.json()

  const nextResponse = NextResponse.json({ success: true })
  nextResponse.cookies.set('access_token', token, {
    httpOnly: true,
    secure: true,
  })

  return nextResponse
}

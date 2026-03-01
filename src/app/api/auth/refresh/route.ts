import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import mainApi from '../../Api'

export const POST = async () => {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value

  if (!refreshToken)
    return NextResponse.json({ detail: 'No refresh token' }, { status: 401 })

  const response = await mainApi.api.mainApiAccountsSessionRefreshPost({
    headers: { Authorization: refreshToken },
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
